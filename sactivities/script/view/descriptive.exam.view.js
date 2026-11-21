import axios from "axios";
import moment from "moment-jalaali";

export class DescriptiveExamView {
  constructor(props) {
    this.hasTestyData = props.hasTestyData;
    this.countdownInterval = null;
    this.smsState = new Map(); // key: download element id → { code, phone, sent }
    this.container = null;
    this.promiseReady = this.init();
  }

  async ready() {
    return this.promiseReady;
  }

  async init() {
    this.container = document.getElementById("descriptiveExam_download");
    if (!this.container) {
      console.warn(
        "DescriptiveExamView: Container #descriptiveExam_download not cofound.",
      );
      return;
    }

    this.container.innerHTML = "";

    const { data: descData } = await axios.get(
      "/api/School/GetAppOnlineDescriptiveTestGroup",
    );
    // console.log(
    //   "DescriptiveExamView → GetAppOnlineDescriptiveTestGroup:",
    //   descData,
    // );

    const liveItems = descData?.live || [];
    const historyItems = descData?.history || [];
    const hasOldExams = historyItems.length > 0;

    this.renderReport(liveItems, historyItems, hasOldExams);
    this.bindDownloadHandlers();
    this.startCountdowns();
    // const emptyExamHistoryHandler = document.getElementById(
    //   "exam_history_container",
    // );
    const emptyExamHistoryText = document.getElementById(
      "exam_history_none_empty_text_descriptive",
    );
    const examEmptyNote = document.getElementById("exam_history_empty_text");
    if (descData?.history.length > 0 || descData?.live.length > 0) {
      emptyExamHistoryText.removeAttribute("hidden");
    } else {
      // emptyExamHistoryHandler.setAttribute("hidden", "true");
      if (this.hasTestyData == 0) {
        examEmptyNote.removeAttribute("hidden");
      }
    }
  }

  renderReport(liveItems, historyItems, hasOldExams) {
    let html = "";

    if (liveItems.length > 0) {
      liveItems.forEach((item, index) => {
        const isLastLive = index === liveItems.length - 1;

        html += `
          <div class="${hasOldExams ? "has-old-exams" : ""}">
            <div class="grade-name">
              <span>${item.testGroupDescriptiveCaption.split("-")[0]}</span>
              <span> - </span>
              <span>${item.testGroupDescriptiveCaption.split("-")[1]}</span>
            </div>
            ${this.buildDownloadSection(item, "q", index)}  
            ${this.buildDownloadSection(item, "a", index)}
        `;

        if (isLastLive && hasOldExams) {
          html += this.buildExpiredExams(historyItems);
        }

        html += `</div>`;
      });
    } else if (hasOldExams) {
      html += `<div class="has-old-exams">${this.buildExpiredExams(historyItems)}</div>`;
    }

    this.container.innerHTML = html;
  }

  buildDownloadSection(item, type, index) {
    const isQuestion = type === "q";
    const id = `${type}_dl${index > 0 ? `_${index}` : ""}`;

    const title = isQuestion ? "دانلود سؤالات آزمون" : "دانلود پاسخ آزمون";
    const caption =
      item[isQuestion ? "questionExamCaption" : "answerExamCaption"] || "";
    const accessDate =
      item[isQuestion ? "questionExamAccessDate" : "answerExamAccessDate"] ||
      "";
    const lessonsCaption = item.questionExamLessonsCaption || "";

    const testGroupId = item.testGroupId;
    const downloadExamDate = isQuestion
      ? item.questionExamDate
      : item.answerExamDate;
    const fileTypeId = isQuestion ? 797 : 799;

    const lessonsHTML = this.parseLessonsToList(lessonsCaption);

    return `
      <div id="${id}" 
           class="download"
           data-download-test-group-id="${testGroupId}"
           data-download-exam-date="${downloadExamDate}"
           data-download-file-type-id="${fileTypeId}">
        
        <div class="title">${title}</div>
        
        <div class="date">
          <span>${caption}</span>
          <span uk-icon="info" class="info"></span>
          <ul class="drop-tooltip" uk-drop="mode: click">
            ${lessonsHTML}
          </ul>
        </div>

        <div class="count-down" data-target="${accessDate}"></div>

        <div class="phone">کدی به شماره شما ارسال خواهد شد<br>را وارد نمایید</div>

        <div class="download-area">
          <a class="download" 
             uk-icon="icon: download; ratio: 1"
             uk-toggle="target: #${id}; cls: confirming" target="_blank"></a>
          <a class="confirm" 
             uk-icon="icon: check; ratio: 1" target="_blank"></a>
          <input class="uk-input" type="text" maxlength="5" placeholder="_ _ _ _ _">
        </div>
      </div>
    `;
  }

  buildExpiredExams(historyItems) {
    const listItems = historyItems
      .map((item) => {
        const shortDate = moment(item.questionExamDate).format("jYYYY/jM/jD");
        const lessonsHTML = this.parseLessonsToList(
          item.questionExamLessonsCaption || "",
        );

        const questionAttrs = `
          data-download-test-group-id="${item.testGroupId}"
          data-download-exam-date="${item.questionExamDate}"
          data-download-file-type-id="797"
        `;

        const answerAttrs = `
          data-download-test-group-id="${item.testGroupId}"
          data-download-exam-date="${item.answerExamDate}"
          data-download-file-type-id="799"
        `;

        return `
          <div>
            <div>
              <span>${shortDate}</span>
              <span uk-icon="icon: info; ratio: 0.8" class="info"></span>
              <ul class="drop-tooltip" uk-drop="mode: click">
                ${lessonsHTML}
              </ul>
            </div>
            <a class="download" uk-icon="icon: download; ratio: 0.8" 
               uk-tooltip="سؤال"
               ${questionAttrs}></a>
            <a class="answer download" 
               uk-icon="icon: download; ratio: 0.8" 
               uk-tooltip="پاسخ"
               ${answerAttrs}></a>
          </div>
        `;
      })
      .join("");

    return `
      <div class="expired-exams">
        <span>آزمون‌های<br>گذشته</span>
        <div class="header">آزمون‌های گذشته</div>
        <div class="list">${listItems}</div>
      </div>
    `;
  }

  parseLessonsToList(caption) {
    if (!caption) return "<li>بدون درس مشخص</li>";
    return caption
      .split(/[,&]/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((lesson) => `<li>${lesson}</li>`)
      .join("");
  }

  bindDownloadHandlers() {
    this.container.addEventListener("click", async (e) => {
      const clicked = e.target.closest('a[uk-icon*="download"], a.confirm');
      if (!clicked) return;

      const downloadEl = clicked.closest(".download");
      if (!downloadEl) return;

      const isHistory = clicked.closest(".expired-exams") !== null;
      // console.log(isHistory);
      // ==================== HISTORY DOWNLOADS (direct) ====================
      if (isHistory) {
        e.preventDefault();
        const { downloadTestGroupId, downloadExamDate, downloadFileTypeId } =
          clicked.dataset;
        await this.fetchBooklet(
          downloadTestGroupId,
          downloadExamDate,
          downloadFileTypeId,
        );
        return;
      }

      // ==================== LIVE DOWNLOAD ICON → SEND SMS ====================
      if (clicked.classList.contains("download")) {
        e.preventDefault();

        // const existing = this.smsState.get(downloadEl.id);
        // if (existing?.sent) {
        //   this.showMessage(downloadEl, "کد قبلاً ارسال شده است", "info");
        //   return;
        // }

        await this.sendVerificationCode(downloadEl);
        return;
      }

      // ==================== LIVE CONFIRM BUTTON → VERIFY + DOWNLOAD ====================
      if (clicked.classList.contains("confirm")) {
        e.preventDefault();

        const isValid = this.verifyCode(downloadEl);
        if (!isValid) {
          this.showMessage(null, "کد نادرست می باشد");
          // Allow user to try again with a new code
          return;
        }

        // Success → fetch and download files
        const { downloadTestGroupId, downloadExamDate, downloadFileTypeId } =
          downloadEl.dataset;
        await this.fetchBooklet(
          downloadTestGroupId,
          downloadExamDate,
          downloadFileTypeId,
        );

        // Reset UI after successful download (optional – you can remove if not needed)
        downloadEl.classList.remove("confirming");
        const input = downloadEl.querySelector("input");
        if (input) input.value = "";
      }
    });
  }

  async sendVerificationCode(downloadEl) {
    try {
      const response = await axios.post(
        "/api/School/SendDespriptiveConfirmationCode",
      );
      const data = response.data;

      // console.log("DescriptiveExamView → SMS API response:", data);

      if (!data?.sent) {
        this.showMessage(
          downloadEl,
          "ارسال پیامک ناموفق بود. دوباره تلاش کنید.",
          "error",
        );
        return;
      }
      this.smsState.set(downloadEl.closest("div.download").id, {
        code: data.code,
        phone: data.cellphonenumber,

        // debugger: true,
      });

      // Update phone number display inside .phone
      // const phoneDiv = downloadEl.querySelector(".phone");
      // if (phoneDiv) {
      //   phoneDiv.innerHTML = `کد ارسالي به شماره ${data.cellphonenumber} <br>را وارد نماييد`;
      // }

      // Let UIkit toggle handle "confirming" class (shows confirm button + input)
      // No manual classList.add needed – uk-toggle does it

      this.showMessage(
        downloadEl,
        `کد تایید به شماره ${data.cellphonenumber} ارسال شد`,
        "success",
      );
    } catch (err) {
      console.error("DescriptiveExamView → SMS error:", err);
      this.showMessage(downloadEl, "خطا در ارسال پیامک", "error");
    }
  }

  async verifyCode(downloadEl) {
    const input = downloadEl.querySelector("input");
    const enteredCode = input?.value.trim();
    const code = this.smsState.get(downloadEl.id).code;
    // if (!state || !state.sent) {
    //   this.showMessage(downloadEl, "ابتدا درخواست کد دهید", "error");
    //   return false;
    // }
    // debugger;
    if (enteredCode !== code) {
      this.showMessage(downloadEl, "کد وارد شده صحیح نیست", "error");
      return false;
    }

    this.showMessage(downloadEl, "تایید شد ✓", "success");

    return true;
  }

  // async fetchBooklet(testGroupId, questionAnswerExamDate, fileTypeId) {
  //   try {
  //     const url = `/api/School/GetDescriptiveBookletFile?testGroupId=${testGroupId}&questionAnswerExamDate=${questionAnswerExamDate}&fileTypeId=${fileTypeId}`;
  //     // console.log(`DescriptiveExamView → Fetching booklet: ${url}`);

  //     const { data } = await axios.get(url);
  //     console.log(data);
  //     debugger;
  //     if (!Array.isArray(data) || data.length === 0) {
  //       console.warn("DescriptiveExamView: No files returned from booklet API");
  //       return;
  //     }

  //     // console.log(`✅ Starting download of ${data.length} file(s)...`);

  //     const getFilename = (path) => {
  //       // console.log(path);
  //       if (!path) return "booklet.pdf";
  //       const parts = path.split(/[\\/]/);
  //       return parts[parts.length - 1] || "booklet.pdf";
  //     };

  //     // Staggered auto-download to avoid browser popup blocker
  //     data.forEach((file, index) => {
  //       setTimeout(() => {
  //         const link = document.createElement("a");
  //         link.href = ""; //file.fileAddress;
  //         // link.target = "_blank";
  //         link.download = file.fileAddress; //getFilename(file.fileAddress);
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);
  //       }, index * 250);
  //     });
  //   } catch (error) {
  //     console.error("DescriptiveExamView → Failed to fetch booklet:", error);
  //   }
  // }

  /**
   * fetchBooklet – Now downloads a single ZIP file returned as stream from backend
   * Uses Blob + proper Content-Disposition handling for correct filename
   */
  async fetchBooklet(testGroupId, questionAnswerExamDate, fileTypeId) {
    try {
      const url = `/api/School/GetDescriptiveBookletFile?testGroupId=${testGroupId}&questionAnswerExamDate=${questionAnswerExamDate}&fileTypeId=${fileTypeId}`;
      // console.log(`DescriptiveExamView → Fetching ZIP: ${url}`);

      const response = await axios.get(url, {
        responseType: "blob", // Important: treat response as binary
        headers: {
          Accept: "application/zip", // Optional but good practice
        },
      });

      const blob = response.data;

      // Try to get filename from Content-Disposition header (best practice)
      let filename = "exam-files.zip";
      const contentDisposition = response.headers["content-disposition"];

      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=([^;\n]*)/i);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "").trim();
        }
      }

      // Fallback: generate meaningful name based on type and date
      if (filename === "exam-files.zip") {
        const typeName = fileTypeId === 797 ? "soalat" : "paskh";
        const datePart = questionAnswerExamDate
          ? questionAnswerExamDate.substring(0, 10)
          : "download";
        filename = `descriptive-exam-${typeName}-${datePart}.zip`;
      }

      // Create Blob URL and trigger download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up memory
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);

      // console.log(`✅ ZIP downloaded successfully: ${filename}`);
    } catch (error) {
      console.error("DescriptiveExamView → Failed to download ZIP:", error);
      // Optional: you can show user-friendly message here if needed
    }
  }

  // async fetchBooklet(testGroupId, questionAnswerExamDate, fileTypeId) {
  //   try {
  //     const url = `/api/School/GetDescriptiveBookletFile?testGroupId=${testGroupId}&questionAnswerExamDate=${questionAnswerExamDate}&fileTypeId=${fileTypeId}`;
  //     console.log(`DescriptiveExamView → Fetching booklet list: ${url}`);

  //     const { data: fileList } = await axios.get(url);

  //     if (!Array.isArray(fileList) || fileList.length === 0) {
  //       console.warn("DescriptiveExamView: No files returned from booklet API");
  //       return;
  //     }

  //     console.log(
  //       `✅ Found ${fileList.length} files. Starting Blob downloads...`,
  //     );

  //     const getFilename = (path) => {
  //       if (!path) return "booklet.pdf";
  //       const parts = path.split(/[\\/]/);
  //       return parts[parts.length - 1] || "booklet.pdf";
  //     };

  //     // Download each file as Blob (one by one with delay to avoid overload)
  //     for (let i = 0; i < fileList.length; i++) {
  //       const fileInfo = fileList[i];
  //       const fileUrl = fileInfo.fileAddress;

  //       if (!fileUrl) continue;

  //       try {
  //         // Fetch the actual file content as Blob
  //         const fileResponse = await axios.get(fileUrl, {
  //           responseType: "blob", // Critical for binary files (PDFs)
  //         });

  //         const blob = fileResponse.data;
  //         const filename = getFilename(fileInfo.fileAddress || fileUrl);

  //         // Create object URL from Blob and trigger download
  //         const blobUrl = URL.createObjectURL(blob);
  //         const link = document.createElement("a");
  //         link.href = blobUrl;
  //         link.download = filename;
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);

  //         // Clean up the object URL after a short delay
  //         setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

  //         console.log(`Downloaded: ${filename}`);
  //       } catch (fileErr) {
  //         console.error(
  //           `Failed to download file ${fileInfo.fileAddress}:`,
  //           fileErr,
  //         );
  //       }

  //       await new Promise((r) => setTimeout((r, 300)));
  //     }
  //   } catch (error) {
  //     console.error("DescriptiveExamView → Failed to fetch booklet:", error);
  //   }
  // }

  startCountdowns() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    const update = () => {
      const now = moment();
      this.container.querySelectorAll(".count-down").forEach((el) => {
        const targetStr = el.dataset.target;
        if (!targetStr) return;

        const target = moment(targetStr);
        const diffMs = target.diff(now);

        if (diffMs <= 0) {
          el.textContent = "00:00:00";
          const parent = el.closest(".download");
          if (parent) {
            parent.classList.add("available");
          }
          return;
        }

        const duration = moment.duration(diffMs);
        el.textContent = `${Math.floor(duration.asHours()).toString().padStart(2, "0")}:${duration
          .minutes()
          .toString()
          .padStart(2, "0")}:${duration.seconds().toString().padStart(2, "0")}`;
      });
    };

    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  /**
   * Updated showMessage: modifies .phone element only (text + class)
   * Does NOT delete or replace any other content in downloadEl
   */
  showMessage(downloadEl, text, type = "info") {
    const phoneEl = downloadEl.closest("div.download").querySelector(".phone");
    // debugger;
    if (!phoneEl) return;

    phoneEl.textContent = text;
    phoneEl.className = `phone ${type}`;
  }

  destroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.smsState.clear();
  }
}
