import axios from "axios";
import { logify } from "../../../common/utils/ukHelper";
import { $_ } from "../../../common/utils/create.dom";
import * as UIkit from "uikit";
import { downloadBlob } from "../../../common/utils/downloadBlob";
import moment from "moment-jalaali";

const messageList = [
  {
    id: 0,
    text: "خطا در پردازش",
  },
  { id: 1, text: "پردازش انجام شده" },
  { id: 2, text: "دانلود و خوانش برگه ها اسکن شده" },
  { id: 4, text: "هنوز دانش آموزی در آزمون شرکت نکرده" },
];

const apis = [
  { name: "getBooklet", url: "DownloadTheBooklet" },
  { name: "getAnswerSheet", url: "GetTestMakerAnswersheet" },
  { name: "GetTestMakerStudentsLog", url: "GetTestMakerStudentsLog" },
  { name: "GetTestMakerStudentsReport", url: "GetTestMakerStudentsReport" },
  { name: "GetTestMakerTeachersReport", url: "GetTestMakerTeachersReport" },
];

const quizHistory = class {
  constructor(props) {
    const { setExamEditingEnvironment, showLoader, grades } = props;
    this.state = {
      examHistoryData: [], // full data (fetched once)
      filteredExamHistoryData: [], // currently visible list after local filters
      openAccordions: [],
      isInitiallPass: true,
      grades,
      notBuildBooklets: new Map(),
      filters: (() => {
        return {
          examTypeIds: [10011, 10012, 10013],
          gradeFieldIds: [...grades.map((grade) => grade.gradeFieldId)],
          fromDate: moment(new Date("2021/03/21")).format("jYYYY/jMM/jDD"),
          toDate: moment(new Date()).add(30, "days").format("jYYYY/jMM/jDD"),
        };
      })(),
      activeExamId: 0,
    };
    this.examHistorySwitcher = null;
    this.examHistorySection = null;
    this.setExamEditingEnvironment = setExamEditingEnvironment;
    this.showLoader = showLoader;
    this.examHistoryFilterModalWrapper = null;
    this.toDate = null;
    this.fromDate = null;
    this.examHistoryFilterModalGrades = null;
    this.multiAnswerSheetModalComponent = null;
    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    this.examHistorySwitcher = document.getElementById("exam_list_switcher");
    this.examHistorySection = document.getElementById("exam_history_list");
    this.examHistoryFilterModalWrapper = document.getElementById(
      "exam_history_filter_modal_wrapper"
    );
    this.examHistoryFilterModalGrades =
      this.examHistoryFilterModalWrapper.querySelector(
        "#exam_history_Filter_grades_wrapper"
      );

    this.fromDate = this.examHistoryFilterModalWrapper.querySelector(
      "#examp_history_filter_date_from_picker"
    );
    this.toDate = this.examHistoryFilterModalWrapper.querySelector(
      "#examp_history_filter_date_to_picker"
    );

    this.examHistorySwitcher.addEventListener("click", async (e) => {
      await this.reRender();
    });

    this.multiAnswerSheetModalComponent = document.getElementById(
      "uk_multi_answersheet_select_modal_component"
    );

    document
      .getElementById("exam_history_switchback")
      .addEventListener("click", () => {
        $_.removeElementChildNodes(this.examHistorySection);
      });

    this.renderFilterModal();
    this.bindMultiAnswerSheetDownloadModal();
    return this;
  }

  // Local offline filter – no API call
  applyUserFilters() {
    const { examTypeIds, gradeFieldIds, fromDate, toDate } = this.state.filters;

    const monthMap = {
      فروردین: 1,
      اردیبهشت: 2,
      خرداد: 3,
      تیر: 4,
      مرداد: 5,
      شهریور: 6,
      مهر: 7,
      آبان: 8,
      آذر: 9,
      دی: 10,
      بهمن: 11,
      اسفند: 12,
    };

    const parseDateFromDesc = (dateDesc) => {
      // Example: "پنج‌شنبه 18 تیر 1405 از 09:00 تا 11:00 به مدت 30 دقیقه"
      if (!dateDesc) return null;
      const match = dateDesc.match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/);
      if (!match) return null;
      const day = match[1];
      const monthName = match[2];
      const year = match[3];
      const month = monthMap[monthName];
      if (!month) return null;
      return moment(`${year}/${month}/${day}`, "jYYYY/jM/jD");
    };

    const from = moment(fromDate, "jYYYY/jMM/jDD");
    const to = moment(toDate, "jYYYY/jMM/jDD");

    this.state.filteredExamHistoryData = this.state.examHistoryData.filter(
      (item) => {
        const settings = item.testMakerSettings || {};
        const quizTypeId = settings.quizTypeId;
        const gradeFieldId = settings.gradeFieldId;

        // exam type filter
        if (!examTypeIds.includes(quizTypeId)) return false;

        // grade filter
        if (!gradeFieldIds.includes(gradeFieldId)) return false;

        // date range filter
        const examDate = parseDateFromDesc(item.dateDesc);
        if (examDate && examDate.isValid()) {
          if (examDate.isBefore(from, "day") || examDate.isAfter(to, "day")) {
            return false;
          }
        }

        return true;
      }
    );
  }

  renderFilterModal() {
    this.examHistoryFilterModalGrades.innerHTML = this.state.grades
      .map((grade) => {
        return `
      <div class="inp action">
        <label>
            <input type="checkbox" value="${grade.gradeFieldId}" checked><span>${grade.gradeFieldCaption}</span>
        </label>
      </div>
      `;
      })
      .join("");

    this.fromDate.addEventListener("change", (e) => {
      this.state.filters.fromDate = e.target.value;
      this.reRender();
    });
    this.toDate.addEventListener("change", (e) => {
      this.state.filters.toDate = e.target.value;
      this.reRender();
    });

    const handleCheckboxToggle = (input, prop) => {
      let id = _.toNumber(input.value);
      let status = input.checked;
      if (status) {
        if (this.state.filters[prop].includes(id)) return;
        else this.state.filters[prop].push(id);
      } else {
        if (this.state.filters[prop].includes(id)) {
          const mutedArray = $_.removeElementFromArray(
            this.state.filters[prop],
            id
          );
          this.state.filters[prop] = mutedArray;
        }
      }
    };

    const gradeFieldIdInputs =
      this.examHistoryFilterModalGrades.querySelectorAll("input");

    gradeFieldIdInputs.forEach((input) =>
      input.addEventListener("change", () => {
        handleCheckboxToggle(input, "gradeFieldIds");
        this.reRender();
      })
    );

    const examTypeIdInputs =
      this.examHistoryFilterModalWrapper.querySelectorAll(
        "input.exam-type-input-js-filter"
      );

    examTypeIdInputs.forEach((input) =>
      input.addEventListener("change", () => {
        handleCheckboxToggle(input, "examTypeIds");
        this.reRender();
      })
    );
  }

  bindMultiAnswerSheetDownloadModal() {
    const btns = this.multiAnswerSheetModalComponent.querySelectorAll(
      "button[data-multi-sheet-download-type]"
    );
    btns.forEach((btn) => {
      btn.addEventListener("click", async () => {
        btn.classList.add("dl-spinner");
        const res = await this.getDownloadableContent({
          examId: this.state.activeExamId,
          downloadMode: "getAnswerSheet",
          apiName: "getAnswerSheet",
          type: btn.dataset.multiSheetDownloadType,
        }).catch((err) => {
          console.log(err);
          btn.classList.remove("dl-spinner");
        });
        btn.classList.remove("dl-spinner");
      });
    });
  }

  async reRender(forceFetch = false) {
    this.showLoader(9000);

    if (this.validate() === false) {
      this.showLoader(0, "hide");
      return;
    }

    // Fetch only on first load or when forced (e.g. after creating a new exam)
    const needsFetch =
      forceFetch ||
      this.state.isInitiallPass ||
      this.state.examHistoryData.length === 0;

    if (needsFetch) {
      const fetchResult = await this.fetchAndUpdateExamHistoryData(
        forceFetch
      );
      if (fetchResult.length === 0) {
        this.showLoader(0, "hide");
        let noInfoTextImage = this.examHistorySection.querySelector(
          "img.empty-class-list"
        );
        if (noInfoTextImage) noInfoTextImage.removeAttribute("hidden");
        else
          this.examHistorySection.innerHTML = `<img class="empty-class-list" src="https://meraat.ir/dist/assets/sactivity/emptyexamlist.png" uk-svg>`;
        return;
      }
    }

    // Always apply current filters on the local full list
    this.applyUserFilters();

    if (this.state.filteredExamHistoryData.length === 0) {
      this.showLoader(0, "hide");
      let noInfoTextImage = this.examHistorySection.querySelector(
        "img.empty-class-list"
      );
      if (noInfoTextImage) noInfoTextImage.removeAttribute("hidden");
      else
        this.examHistorySection.innerHTML = `<img class="empty-class-list" src="https://meraat.ir/dist/assets/sactivity/emptyexamlist.png" uk-svg>`;
      return;
    }

    $_.removeElementChildNodes(this.examHistorySection);
    const { markup } = await this.render();
    this.examHistorySection.innerHTML = markup.join("");
    await $_.pause(100);
    this.bind();
    this.showLoader(0, "hide");
  }

  getState() {
    return this.state;
  }

  fetchAndUpdateExamHistoryData(isNewExamCallback = false) {
    return new Promise(async (resolve, reject) => {
      // Always request with the broadest possible filters so we get everything once
      const allGradeIds = this.state.grades
        .map((g) => g.gradeFieldId)
        .join(",");
      const query = `/api/School/GetTestMakerHistory?examTypeIds=10011,10012,10013&gradeFieldIds=${allGradeIds}&fromDate=1400/01/01&toDate=${moment()
        .add(1, "year")
        .format("jYYYY/jMM/jDD")}`;

      const { data } = await axios(query);

      this.state.examHistoryData = [];

      if (!data || data.length === 0) {
        return resolve([]);
      }

      if (this.state.isInitiallPass || isNewExamCallback) {
        this.state.openAccordions.push(data[0].examId);
        this.state.isInitiallPass = false;
      }

      data.forEach((d) => this.state.examHistoryData.push(d));
      resolve(data);
    });
  }

  validate() {
    let isAfter = moment(new Date(this.fromDate.value)).isAfter(
      new Date(this.toDate.value)
    );
    if (isAfter) {
      logify(
        { status: "warning", pos: "bottom-center" },
        "فیلتر تاریخ شروع پس از تاریخ پایان تنظیم شده"
      );
      return false;
    }
    let isSame = moment(new Date(this.fromDate.value)).isSame(
      new Date(this.toDate.value)
    );
    if (isSame) {
      logify(
        { status: "warning", pos: "bottom-center" },
        "فیلتر تاریخ شروع برابر تاریخ پایان تنظیم شده"
      );
      return false;
    }
    return true;
  }

  async show() {
    this.examHistorySwitcher.dispatchEvent(new Event("click"));
  }

  toggleSwitcherDisablity(status = true) {
    this.examHistorySwitcher.disabled = status;
  }

  getBookletProgressStatus(examId, orderType = "Questions", start = false) {
    return new Promise(async (resolve, reject) => {
      const { data } = await axios.get(
        `/api/School/GetBookletProgress?start=${start}&examId=${examId}&orderType=${orderType}`
      );
      return resolve(data);
    });
  }

  async render() {
    const notBuildBooklets = new Map();
    const markup = [];
    const notBuiltBookletStatusArrayPromise = [];
    const uiProgressRolesStatusMap = new Map();

    // Use filtered list
    this.state.filteredExamHistoryData.forEach(async (data, i) => {
      const examTypeId = data.testMakerSettings.quizTypeId;
      const {
        questionBookletStatus,
        answerBookletStatus,
        assistantBookletStatus,
        leftTime,
        examId,
      } = data;

      if (examTypeId !== 10013) {
        if (questionBookletStatus === false) {
          notBuiltBookletStatusArrayPromise.push({
            examId: examId,
            type: "Questions",
            promise: this.getBookletProgressStatus(examId, "Questions", false),
          });
        }
        if (answerBookletStatus === false) {
          notBuiltBookletStatusArrayPromise.push({
            examId: examId,
            type: "Answers",
            promise: this.getBookletProgressStatus(examId, "Answers", false),
          });
        }
        if (assistantBookletStatus === false) {
          notBuiltBookletStatusArrayPromise.push({
            examId: examId,
            type: "Assistant",
            promise: this.getBookletProgressStatus(examId, "Assistant", false),
          });
        }
      }

      ["Questions", "Answers", "Assistant"].forEach((role) => {
        let status = false;
        if (role === "Questions") {
          if (questionBookletStatus) status = true;
        } else if (role === "Answers") {
          if (answerBookletStatus) status = true;
        } else if (role === "Assistant") {
          if (assistantBookletStatus) status = true;
        }

        uiProgressRolesStatusMap.set(examId, {
          ...uiProgressRolesStatusMap.get(examId),
          [role]: {
            shouldDownloadButtonShow: false,
            shouldInProgressSpinnerShow: false,
            shouldPercentageButtonShow: false,
            bookletStatus: status,
          },
        });
      });
    });

    const statusArray = await Promise.all(
      notBuiltBookletStatusArrayPromise.map((p) => p.promise)
    );

    statusArray.forEach((status, i) => {
      notBuildBooklets.set(notBuiltBookletStatusArrayPromise[i].examId, {
        ...notBuildBooklets.get(notBuiltBookletStatusArrayPromise[i].examId),
        [notBuiltBookletStatusArrayPromise[i].type]: status,
      });
    });

    this.state.notBuildBooklets.clear();
    this.state.notBuildBooklets = notBuildBooklets;

    this.state.filteredExamHistoryData.forEach(async (data, i) => {
      const examTypeId = data.testMakerSettings.quizTypeId;
      const {
        questionBookletStatus,
        answerBookletStatus,
        assistantBookletStatus,
        examId,
      } = data;

      let progressUiElementsStatus = {
        ...uiProgressRolesStatusMap.get(examId),
      };

      ["Questions", "Answers", "Assistant"].forEach((role) => {
        let status = false;
        if (role === "Questions") {
          if (questionBookletStatus) status = true;
        } else if (role === "Answers") {
          if (answerBookletStatus) status = true;
        } else if (role === "Assistant") {
          if (assistantBookletStatus) status = true;
        }
        if (status) {
          progressUiElementsStatus[role].bookletStatus = status;
          progressUiElementsStatus[role].shouldDownloadButtonShow = true;
          uiProgressRolesStatusMap.set(examId, progressUiElementsStatus);
        } else {
          let progressStatus = this.state.notBuildBooklets.get(examId);
          if (progressStatus) {
            let buildlStatus = progressStatus[role];

            if (buildlStatus) {
              if (
                buildlStatus.readyToBuild ||
                buildlStatus.readyToDownload ||
                buildlStatus.percentageValue === 0
              ) {
                progressUiElementsStatus[role].shouldDownloadButtonShow = true;
                uiProgressRolesStatusMap.set(examId, progressUiElementsStatus);
              } else if (
                buildlStatus.percentageValue > 0 &&
                buildlStatus.percentageValue < 100 &&
                buildlStatus.readyToDownload === false
              ) {
                progressUiElementsStatus[
                  role
                ].shouldPercentageButtonShow = true;
                uiProgressRolesStatusMap.set(examId, progressUiElementsStatus);
              }
            }
          }
        }
      });
    });

    this.state.filteredExamHistoryData.forEach(async (data, i) => {
      const examTypeId = data.testMakerSettings.quizTypeId;
      const { leftTime, examId } = data;

      const uiProgressRolesStatus = uiProgressRolesStatusMap.get(examId);
      try {
        markup.push(`
          <li data-history-accordion-id="${examId}" class="${
          this.state.openAccordions.includes(examId) ? "uk-open" : ""
        } ${leftTime < 0 ? "expired" : ""} ${
          examTypeId === 10013
            ? "special-exam"
            : examTypeId === 10012
            ? "inperson-exam"
            : examTypeId === 10011
            ? "online-exam"
            : "sending-exam"
        }" 
        data-exam-id="${examId}" data-exam-type-id="${examTypeId}" >
          <a class="uk-accordion-title exam-title" href="#">
            <span class="exam-caption">${data.examDesc}</span>
            <div><span class="exam-date-icon" uk-icon="icon: calendar"></span>
            <span class="exam-date">${data.dateDesc.replace(
              "از",
              "<br>"
            )}</span>
            <span class="exam-remaining-time-icon" uk-icon="icon: history"></span>
           ${
             leftTime <= 0
               ? leftTime == 0
                 ? `<span class="exam-remaining-time">روز آزمون</span>`
                 : ""
               : `<span class="exam-remaining-time">زمان مانده ${data.leftTime} روز</span>`
           }
          </div></a>
          <div class="exam-delete">
            <button uk-icon="icon: close;" data-exam-id="${examId}" data-exam-edit-mode="delete" ratio: 0.8" uk-tooltip="title: حذف آزمون"></button>
            ${
              leftTime >= 0
                ? `<button uk-icon="icon: pencil" 
                data-exam-edit-mode="edit" data-exam-id="${examId}" uk-tooltip="title: ويرايش آزمون"></button>`
                : ""
            }
            <button data-exam-edit-mode="retake" data-exam-id="${examId}" uk-icon="icon: refresh" uk-tooltip="title: برگزاري مجدد"></button>
          </div>
          <div class="uk-accordion-content uk-position-relative">
            <div  class="buttons-container">
                
            ${
              examTypeId === 10011 || examTypeId === 10012
                ? ["Questions", "Answers", "Assistant"]
                    .map((role) => {
                      return `
                    <button data-api-name="getBooklet" ${
                      uiProgressRolesStatus[role].shouldDownloadButtonShow
                        ? ""
                        : "hidden"
                    } id="dnl_booklet_${role.toLocaleLowerCase()}_button_${examId}" data-button-download-type="${role}" 
                    class="${role.toLocaleLowerCase()}-booklet-download ${
                        uiProgressRolesStatus[role].bookletStatus
                          ? "prepared"
                          : "preparing"
                      } ${
                        uiProgressRolesStatus[role].shouldPercentageButtonShow
                          ? "inprogress"
                          : ""
                      } " data-booklet-ready-to-build="${
                        uiProgressRolesStatus[role].bookletStatus ? false : true
                      }" data-booklet-ready-to-download="${
                        uiProgressRolesStatus[role].bookletStatus ? true : false
                      }" uk-icon="icon: download; ratio: .9">
                      <span></span>
                    </button>

                    <span  hidden  id="dnl_booklet_${role.toLocaleLowerCase()}_spinner_${examId}" class="${role.toLocaleLowerCase()}-booklet-download prepared download-spinner"
                      uk-spinner="ratio: 0.65" ></span>


                    <!--added fo progressbar//-->                  
                    <div ${
                      uiProgressRolesStatus[role].shouldPercentageButtonShow
                        ? ""
                        : "hidden"
                    } id="dnl_booklet_${role.toLocaleLowerCase()}_progress_${examId}" class="progress-bar ${role.toLocaleLowerCase()}-booklet-download preparing
                    inprogress" style="--value:${
                      uiProgressRolesStatus[role].bookletStatus ? 100 : 0
                    }">
                    <span>%</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 34 34" >
                      <circle cx="16" cy="16" r="15.9155" class="progress-line" />
                      <circle cx="16" cy="16" r="15.9155" class="progress-progress" />
                    </svg>
                  </div>
                  `;
                    })
                    .join("")
                : ``
            }

                ${
                  examTypeId === 10012
                    ? `<button data-api-name="getAnswerSheet"
                     data-button-download-type="AnswerSheet"
                    id="dnl_answersheet_button_${examId}" class="answersheets-download" 
            uk-icon="icon: grid; ratio: .9"><span></span></button>
            <span hidden id="dnl_answersheet_spinner_${examId}" class="answersheets-download download-spinner"
          uk-spinner="ratio: 0.65" ></span>`
                    : ""
                }
                
                ${
                  examTypeId === 10011 || examTypeId === 10012
                    ? leftTime <= 0
                      ? `<button class="preparing-cerificates toggle-prepare1" 
                      uk-icon="icon: cog; ratio: .9"><span></span>
                </button>

                <span hidden id="load_result_spinner_${examId}" class="preparing-cerificates download-spinner"
              uk-spinner="ratio: 0.65" ></span>

              <button data-api-name="GetTestMakerStudentsLog" hidden 
              class="report-student toggle-prepare2" 
                 uk-icon="icon: download; ratio: .9"><span></span></button>

                 <span hidden data-api-name="GetTestMakerStudentsLog"
                  class="report-student download-spinner"
               uk-spinner="ratio: 0.65" ></span>


               <button data-api-name="GetTestMakerStudentsReport" hidden 
               class="report-grade toggle-prepare2" 
               uk-icon="icon: download; ratio: .9"><span></span></button>

               <span hidden data-api-name="GetTestMakerStudentsReport"
               class="report-grade download-spinner"
            uk-spinner="ratio: 0.65" ></span>

               <button data-api-name="GetTestMakerTeachersReport" hidden 
               class="report-teacher toggle-prepare2" uk-icon="icon: download; ratio: .9"
                 ><span></span></button>

                 <span hidden data-api-name="GetTestMakerTeachersReport"
                 class="report-teacher download-spinner"
              uk-spinner="ratio: 0.65" ></span>`
                      : ""
                    : ""
                }

                ${
                  examTypeId === 10013
                    ? leftTime <= 0
                      ? `<button data-api-name="getAnswerSheet"
                      data-button-download-type="AnswerSheet"
                     id="dnl_answersheet_button_${examId}" class="answersheets-download" 
             uk-icon="icon: grid; ratio: .9"><span></span></button>
             <span hidden id="dnl_answersheet_spinner_${examId}" class="answersheets-download download-spinner"
           uk-spinner="ratio: 0.65" ></span>
                      
                <button class="preparing-cerificates toggle-prepare1" 
                      uk-icon="icon: cog; ratio: .9"><span></span>
                </button>

                <span hidden id="load_result_spinner_${examId}" class="preparing-cerificates download-spinner"
              uk-spinner="ratio: 0.65" ></span>

                   <button data-api-name="GetTestMakerStudentsLog" hidden 
                   class="report-student toggle-prepare2" 
                      uk-icon="icon: download; ratio: .9"><span></span></button>

                      <span hidden data-api-name="GetTestMakerStudentsLog"
                       class="report-student download-spinner"
                    uk-spinner="ratio: 0.65" ></span>


                    <button data-api-name="GetTestMakerStudentsReport" hidden 
                    class="report-grade toggle-prepare2" 
                    uk-icon="icon: download; ratio: .9"><span></span></button>

                    <span hidden data-api-name="GetTestMakerStudentsReport"
                    class="report-grade download-spinner"
                 uk-spinner="ratio: 0.65" ></span>

                    <button data-api-name="GetTestMakerTeachersReport" hidden 
                    class="report-teacher toggle-prepare2" uk-icon="icon: download; ratio: .9"
                      ><span></span></button>

                      <span hidden data-api-name="GetTestMakerTeachersReport"
                      class="report-teacher download-spinner"
                   uk-spinner="ratio: 0.65" ></span>
                   `
                      : `<button data-api-name="getAnswerSheet"
                      data-button-download-type="AnswerSheet"
                     id="dnl_answersheet_button_${examId}" class="answersheets-download" 
             uk-icon="icon: grid; ratio: .9"><span></span></button>
             <span hidden id="dnl_answersheet_spinner_${examId}" class="answersheets-download download-spinner"
           uk-spinner="ratio: 0.65" ></span>`
                    : ""
                }
            </div>

          <p class="message">پاسخ‌برگي خوانش نشده </p>
          <button class="refresh-exam-status" uk-tooltip="بروزرساني پاسخ‌برگ‌هاي خوانش شده"><span></span>
          </button><br><div class="width-reduced">
        
            ${data.lessons
              .map((lesson) => {
                return `
              <ul class="exam-content-list">
                <li class="l1-h1">${lesson.lessonName}<span>${
                  lesson.questionNumber
                }</span></li>
                ${lesson.studyUnits
                  .map((unit) => {
                    return `
                  <li class="l3-h3">${unit.subject}<span>${unit.learningUnitNo}</span></li>
                  `;
                  })
                  .join("")}
              </ul>
                `;
              })
              .join("")}
          
            </div>
          </div>
        </li>
        `);
      } catch (error) {
        console.log(error);
      }
    });

    return { markup };
  }

  getExamTypeId(examId) {
    const item = this.state.examHistoryData.find((el) => el.examId === examId);
    return item ? item.testMakerSettings.quizTypeId : null;
  }

  bind() {
    let accordions = this.examHistorySection.querySelectorAll(
      "li[data-history-accordion-id]"
    );

    // Use filtered list for presence / process promises
    const getStatusPromiseArray = this.state.filteredExamHistoryData.map(
      (d) => {
        return {
          examId: d.examId,
          promise: () =>
            new Promise(async (resolve) => {
              const { data } = await axios.get(
                `/api/School/GetTestMakerPresenceStatus?examid=${d.examId}`
              );
              return resolve(data);
            }),
        };
      }
    );

    const getProcessPromiseArray = this.state.filteredExamHistoryData.map(
      (d) => {
        return {
          examId: d.examId,
          promise: () =>
            new Promise(async (resolve) => {
              const { data } = await axios.get(
                `/api/School/ProcessTheExam?examid=${d.examId}&examType=${d.testMakerSettings.quizTypeId}`,
                { timeout: 1000 * 600 }
              );
              let messageObj = messageList.filter((m) => m.id === data)[0];
              return resolve(messageObj);
            }),
        };
      }
    );

    accordions.forEach(async (accordionElement, i) => {
      let examId = _.toNumber(accordionElement.dataset.historyAccordionId);

      if (this.state.openAccordions.includes(examId)) {
        let message = await Promise.resolve(getStatusPromiseArray[i].promise());
        accordionElement.querySelector("p.message").innerHTML = message;
      }

      accordionElement.addEventListener("click", async (e) => {
        await $_.pause(10);
        let isOpen = accordionElement.classList.contains("uk-open");
        let isCurrentlyOpen = this.state.openAccordions.includes(examId);

        if (isOpen) {
          if (isCurrentlyOpen === false) {
            this.state.openAccordions.push(examId);
            let message = await Promise.resolve(
              getStatusPromiseArray
                .filter((p) => p.examId === examId)[0]
                .promise()
            );
            accordionElement.querySelector("p.message").innerHTML = message;
          }
        } else {
          if (isCurrentlyOpen)
            this.state.openAccordions = $_.removeElementFromArray(
              [...this.state.openAccordions],
              examId
            );
        }

        let clickedButton = e.target.closest("button");
        if (clickedButton) {
          if (clickedButton.classList.contains("refresh-exam-status")) {
            let message = await Promise.resolve(
              getStatusPromiseArray
                .filter((p) => p.examId === examId)[0]
                .promise()
            );
            accordionElement.querySelector("p.message").innerHTML = message;
          } else if (
            clickedButton.classList.contains("preparing-cerificates")
          ) {
            let spinner = accordionElement.querySelector(
              `#load_result_spinner_${examId}`
            );
            spinner.removeAttribute("hidden");
            clickedButton.setAttribute("hidden", true);
            let processExamResult = await Promise.resolve(
              getProcessPromiseArray
                .filter((p) => p.examId === examId)[0]
                .promise()
            ).catch((err) => console.log(err));
            if (processExamResult.id === 0) {
              logify({ status: "error" }, processExamResult.text);
              spinner.setAttribute("hidden", true);
              clickedButton.removeAttribute("hidden");
            } else if (processExamResult.id === 1) {
              spinner.setAttribute("hidden", true);
              let alternativeButtons =
                accordionElement.querySelectorAll(".toggle-prepare2");
              alternativeButtons.forEach((btn) => {
                btn.removeAttribute("hidden");
                let apiName = btn.dataset.apiName;

                let spinner = accordionElement.querySelector(
                  `span[data-api-name="${apiName}"]`
                );
                btn.addEventListener("click", (e) => {
                  btn.setAttribute("hidden", true);
                  spinner.removeAttribute("hidden");

                  this.getDownloadableContent({
                    examId,
                    downloadMode: "getFinalReport",
                    apiName,
                    type: apiName === "GetTestMakerStudentsReport",
                  })
                    .then((res) => {
                      setTimeout(() => {
                        spinner.setAttribute("hidden", true);
                        btn.removeAttribute("hidden");
                      }, 500);
                    })
                    .catch((err) => console.log(err));
                });
              });
            } else if (processExamResult.id === 2) {
              spinner.setAttribute("hidden", true);
              clickedButton.removeAttribute("hidden");
              UIkit.modal("#alarm-modal").show();
            } else if (processExamResult.id === 4) {
              logify({ status: "error" }, processExamResult.text);
              spinner.setAttribute("hidden", true);
              clickedButton.removeAttribute("hidden");
            }
          }
        }
      });
    });

    this.examHistorySection
      .querySelectorAll("button[data-exam-edit-mode]")
      .forEach((btn) => {
        let editMode = btn.dataset.examEditMode;
        let examId = _.toNumber(btn.dataset.examId);

        btn.addEventListener("click", async (e) => {
          const _that = this;
          if (editMode === "delete") {
            UIkit.modal
              .confirm(` آیا از حذف آزمون اطمینان دارید؟ `, {
                labels: {
                  cancel: "خیر",
                  ok: "بلی",
                },
              })
              .then(function () {
                _that.showLoader(1000);
                axios(`/api/School/DisableExam?examid=${examId}`)
                  .then((res) => {
                    if (res.data === 1) {
                      logify(
                        { status: "success", pos: "bottom-center" },
                        "آزمون با موفقیت حذف گردید"
                      );
                      _that.updateOpenAccordions(examId, "remove");
                      _that.removeAccordion(examId);
                    } else
                      logify(
                        { status: "warning", pos: "bottom-center" },
                        "اشکال در حذف رکورد"
                      );
                  })
                  .catch((err) => console.log(err));
              });
          } else {
            // retake / edit
            const data = this.state.examHistoryData.filter(
              (d) => d.examId === examId
            )[0];
            this.setExamEditingEnvironment(examId, editMode, data);
          }
        });
      });

    let downloadBookletButtons = document.querySelectorAll(
      "button[data-button-download-type]"
    );
    downloadBookletButtons.forEach((btn) => {
      const accordion = btn.closest("li");
      let downloadMode = btn.dataset.buttonDownloadType;

      let examTypeId = _.toNumber(accordion.dataset.examTypeId);
      let examId = _.toNumber(accordion.dataset.examId);
      let apiName = btn.dataset.apiName;

      btn.addEventListener("click", async (e) => {
        this.state.activeExamId = examId;
        if (apiName === "getBooklet") {
          let isBookletReadyToDownload = btn.dataset.bookletReadyToDownload;
          let isBookletReadyToBuild = btn.dataset.bookletReadyToBuild;

          if (isBookletReadyToDownload === "true") {
            let spinner,
              button = null;
            button = this.examHistorySection.querySelector(
              `#dnl${
                downloadMode === "AnswerSheet" ? "_" : "_booklet_"
              }${downloadMode.toLowerCase()}_button_${examId}`
            );
            spinner = this.examHistorySection.querySelector(
              `#dnl${
                downloadMode === "AnswerSheet" ? "_" : "_booklet_"
              }${downloadMode.toLowerCase()}_spinner_${examId}`
            );

            spinner.removeAttribute("hidden");
            button.setAttribute("hidden", "true");
            this.getDownloadableContent({ examId, downloadMode, apiName })
              .then((res) => {
                setTimeout(() => {
                  spinner.setAttribute("hidden", "true");
                  button.removeAttribute("hidden");
                }, 500);
              })
              .catch((err) => console.log(err));
          } else {
            const getProgressUiElement = (role) =>
              this.examHistorySection.querySelector(
                `#dnl${
                  downloadMode === "AnswerSheet" ? "_" : "_booklet_"
                }${role.toLowerCase()}_progress_${examId}`
              );

            const switchBackUiElementsAfterProgress = () => {
              const progressElement = getProgressUiElement(downloadMode);
              btn.removeAttribute("hidden");
              progressElement.setAttribute("hidden", true);
              btn.setAttribute("data-booklet-ready-to-download", true);
              btn.classList.remove("preparing");
              btn.classList.add("prepared");
            };
            const setEndingEnvironment = () => {
              let infoObject =
                this.state.notBuildBooklets.get(examId)[downloadMode];
              if (infoObject.readyToDownload) {
                switchBackUiElementsAfterProgress();
                return true;
              } else return false;
            };

            const getUpdatedProgresssStatus = async (
              shouldInitBuild = false
            ) => {
              const progressUpdatedStatusObject = await Promise.resolve(
                this.getBookletProgressStatus(
                  examId,
                  downloadMode,
                  shouldInitBuild
                )
              );

              let curr = { ...this.state.notBuildBooklets.get(examId) };
              this.state.notBuildBooklets.set(examId, {
                ...curr,
                [downloadMode]: progressUpdatedStatusObject,
              });
              return progressUpdatedStatusObject;
            };

            getProgressUiElement(downloadMode).removeAttribute("hidden");
            btn.setAttribute("hidden", true);
            await getUpdatedProgresssStatus(true);
            let statusObjectRef = this.state.notBuildBooklets.get(examId);
            if (statusObjectRef) {
              if (statusObjectRef[downloadMode]) {
                let readyToInit = statusObjectRef[downloadMode].isStarting;
                while (readyToInit === false) {
                  await $_.pause(3000);
                  await getUpdatedProgresssStatus(false);

                  if (
                    this.state.notBuildBooklets.get(examId)[downloadMode]
                      .isStarting
                  )
                    readyToInit = true;
                }
              }
            }

            if (this.state.notBuildBooklets.get(examId)) {
              let ref = this.state.notBuildBooklets.get(examId)[downloadMode];
              if (ref && ref.readyToDownload === false) {
                let readyToDownload = ref.readyToDownload;
                while (readyToDownload === false) {
                  for (
                    let i =
                      this.state.notBuildBooklets.get(examId)[downloadMode]
                        .percentageValue;
                    i < 100;
                    i++
                  ) {
                    await $_.timer(
                      () =>
                        getProgressUiElement(downloadMode).setAttribute(
                          "style",
                          `--value:${i}`
                        ),
                      this.state.notBuildBooklets.get(examId)[downloadMode]
                        .intervalTime
                    );
                  }

                  await getUpdatedProgresssStatus(false);
                  let isEnded = setEndingEnvironment();
                  await $_.pause(100);
                  if (isEnded) {
                    readyToDownload = true;
                  } else await $_.pause(3000);
                }
              } else {
                switchBackUiElementsAfterProgress();
              }
            } else {
              switchBackUiElementsAfterProgress();
            }
          }
        } else if (apiName === "getAnswerSheet") {
          UIkit.modal(this.multiAnswerSheetModalComponent).show();
        } else {
          let spinner,
            button = null;
          button = this.examHistorySection.querySelector(
            `#dnl${
              downloadMode === "AnswerSheet" ? "_" : "_booklet_"
            }${downloadMode.toLowerCase()}_button_${examId}`
          );
          spinner = this.examHistorySection.querySelector(
            `#dnl${
              downloadMode === "AnswerSheet" ? "_" : "_booklet_"
            }${downloadMode.toLowerCase()}_spinner_${examId}`
          );

          spinner.removeAttribute("hidden");
          button.setAttribute("hidden", "true");
          this.getDownloadableContent({ examId, downloadMode, apiName })
            .then((res) => {
              setTimeout(() => {
                spinner.setAttribute("hidden", "true");
                button.removeAttribute("hidden");
              }, 500);
            })
            .catch((err) => console.log(err));
        }
      });
    });
  }

  async updateOpenAccordions(examId, mode = "add") {
    return new Promise((resolve, reject) => {
      if (mode === "add") {
        this.state.openAccordions.push(examId);
      } else
        this.state.openAccordions = $_.removeElementFromArray(
          [...this.state.openAccordions],
          examId
        );
      resolve(true);
    });
  }

  removeAccordion(examId) {
    let element = this.examHistorySection.querySelector(
      `li[data-history-accordion-id="${examId}"]`
    );
    $_.removeElements(element);

    // Keep full data + filtered data in sync
    this.state.examHistoryData = this.state.examHistoryData.filter(
      (d) => d.examId !== examId
    );
    this.state.filteredExamHistoryData =
      this.state.filteredExamHistoryData.filter((d) => d.examId !== examId);

    let curr = [...this.state.openAccordions];
    if (this.state.openAccordions.includes(examId)) {
      this.state.openAccordions = $_.removeElementFromArray(curr, examId);
    }
    if (this.state.notBuildBooklets.get(examId)) {
      this.state.notBuildBooklets.delete(examId);
    }
  }

  getDownloadableContent(options) {
    return new Promise(async function (resolve, reject) {
      const { examId, downloadMode, apiName } = options;
      let apiHasXls =
        options["type"] && apiName !== "getAnswerSheet" ? true : false;
      let url = apis.filter((api) => api.name === apiName)[0].url;
      let query = `/api/School/${url}?examId=${examId}${
        apiName === "getBooklet"
          ? `&orderType=${downloadMode}`
          : apiName === "getAnswerSheet"
          ? `&Type=${options["type"]}`
          : ""
      }`;
      const result = await axios({
        method: "post",
        url: query,
        responseType: "blob",
        timeout: 1000 * 600,
        config: { headers: { "Content-Type": "multipart/form-data" } },
      });
      const uri = window.URL.createObjectURL(new Blob([result.data]));
      resolve(
        downloadBlob(uri, `${apiName.substr(3)}_${new Date().getTime()}.pdf`)
      );

      if (apiHasXls) {
        $_.pause(100);
        const res = await axios({
          method: "post",
          url: query + "&typ=1",
          responseType: "blob",
          timeout: 1000 * 600,
          config: { headers: { "Content-Type": "multipart/form-data" } },
        });
        const url2 = window.URL.createObjectURL(new Blob([res.data]));
        resolve(
          downloadBlob(url2, `${apiName.substr(3)}_${new Date().getTime()}.xls`)
        );
      }
    });
  }
};
export default quizHistory;