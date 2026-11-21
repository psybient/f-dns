import axios from "axios";
import { logify } from "../../../../common/utils/ukHelper";
import _ from "lodash";

const NewTicketForm = class {
  constructor(props) {
    this.state = {
      uploadedFiles: [], // Track uploaded files
      ticketTopics: props.ticketTopics,
    };
    this.toggler = props.toggler;
    this.chatComponent = props.chatComponent;
    this.ticketList = props.ticketList;
    this.goToNewTicketTab = null;
    this.backToTickets = null;
    this.createTicketButton = null;
    this.fileUploader = null;
    this.topicSelect = null;
    this.attachentList = null;
    this.promiseReady = this.init();
  }

  async ready() {
    return this.promiseReady;
  }

  init() {
    this.fileUploader = document.getElementById("new_ticket_file_uploader");
    this.uploadList = document.getElementById("upload_list");
    // this.attachentList = document.getElementById("attachment_list");
    this.topicSelect = document.getElementById("ticket-topic");
    this.createTicketButton = document.getElementById(
      "create_new_ticket_button"
    );
    this.cancelButton = document.getElementById("cancel_new_ticket_button");
    // this.fileUploader = document.getElementById(
    //   "new_ticket_file_uploader"
    // );
    this.topicSelect.innerHTML += this.state.ticketTopics
      .map((topic) => `<option value="${topic.id}">${topic.caption}</option>`)
      .join("");
    // Event Listeners
    this.fileUploader.addEventListener("change", (e) =>
      this.handleFileUpload(e)
    );
    this.uploadList.addEventListener("click", (e) => this.handleFileRemove(e));
    this.createTicketButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.createTicket();
    });

    this.cancelButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.resetForm();
    });

    return this;
  }

  handleFileUpload(event) {
    const files = Array.from(event.target.files);
    let logStatus = { size: false, len: false };

    // Validate files
    const validFiles = files.filter((file) => {
      if (file.size > 10000000) {
        if (logStatus.size === false) {
          logify(
            { status: "danger" },
            `فایل ${file.name} بیش از 10 مگابایت است.`
          );
          logStatus.size = true;
        }
        return false;
      }
      if (this.state.uploadedFiles.length >= 5) {
        if (logStatus.len === false) {
          logify(
            { status: "warning" },
            "حداکثر 5 فایل می‌توانید بارگذاری کنید."
          );
        }
        return false;
      }
      return true;
    });

    // Add valid files to state
    const uniqueFiles = new Set(
      this.state.uploadedFiles.map((file) => file.name)
    );
    this.state.uploadedFiles = [
      ...this.state.uploadedFiles,
      ...validFiles
        .filter((file) => !uniqueFiles.has(file.name))
        .slice(0, 5 - this.state.uploadedFiles.length),
    ];

    if (
      [...uniqueFiles].length + validFiles.length !==
      this.state.uploadedFiles.length
    ) {
      if ([...uniqueFiles].length + validFiles.length > 5)
        logify(
          { status: "warning" },
          `حداکثر 5 فایل در هر پیامم قابل ارسال است`
        );
      else {
        logify({ status: "danger" }, `نام فایل تکراری می باشد`);
        return;
      }
    }

    // Clear file input and re-render upload list
    this.fileUploader.value = null;
    this.renderUploadList();
  }

  handleFileRemove(event) {
    let element = event.target.closest("span");

    // Remove file from state
    this.state.uploadedFiles = this.state.uploadedFiles.filter(
      (file) => file.name !== element.dataset.removeNewTicketFileItem
    );

    // Re-render upload list
    this.renderUploadList();
  }

  renderUploadList() {
    this.uploadList.innerHTML = this.state.uploadedFiles
      .map(
        (file) => `
        <div class="uploaded-file" uk-icon="file">
          <div class="file-name">${file.name}</div>
          <span data-remove-new-ticket-file-item="${file.name}" class="file" uk-icon="close"></span>
          <span class="uploading-file" uk-spinner></span>
        </div> `
      )
      .join("");
  }

  async createTicket() {
    // Form Inputs
    // const topicSelect = document.getElementById("ticket-topic");
    const subjectInput = document.getElementById("ticket-subject");
    const descriptionTextarea = document.getElementById("ticket-description");

    const topicId = this.topicSelect.value;
    const subject = subjectInput.value.trim();
    const description = descriptionTextarea.value.trim();

    // Validate inputs
    if (topicId === "-1") {
      logify({ status: "warning" }, "لطفاً موضوع تیکت را انتخاب کنید.");
      return;
    }

    if (!subject || subject.length > 256) {
      !subject
        ? logify(
            { status: "warning" },
            "لطفاً عنوان درخواست خود را وارد نمایید."
          )
        : logify(
            { status: "warning" },
            "عنوان تیکت باید کمتر از 256 کاراکتر باشد."
          );
      return;
    }

    if (!description || description.length > 2048) {
      !description
        ? logify({ status: "warning" }, "لطفاً شرح درخواست خود را وارد کنید.")
        : logify(
            { status: "warning" },
            "شرح درخواست باید کمتر از 2048 کاراکتر باشد."
          );
      return;
    }

    // Prepare form data

    const formData = new FormData();
    formData.append("topicId", topicId);
    formData.append("subject", subject);
    formData.append("description", description);

    this.state.uploadedFiles.forEach((file) => formData.append("files", file));

    if (this.state.uploadedFiles.length > 0)
      this.uploadList.classList.add("uploading-attachments");
    this.createTicketButton.setAttribute("hidden", true);
    this.cancelButton.setAttribute("hidden", true);
    this.topicSelect.setAttribute("disabled", "disabled");
    this.fileUploader.setAttribute("disabled", "disabled");
    descriptionTextarea.setAttribute("disabled", "disabled");
    subjectInput.setAttribute("disabled", "disabled");

    try {
      // API Call
      const response = await axios.post("../api/School/InsTicket", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === 1) {
        logify({}, "تیکت با موفقیت ثبت شد.");
        let id = response.data.ticketId;
        this.resetForm();
        this.ticketList.setActiveTicket(id);
        await this.ticketList.render(true);
        this.chatComponent.render(id);
        this.toggler.classList.remove("new-ticket-mode");
        this.toggler.classList.add("chat-mode");
      } else if (response.data.status === 0) {
        logify({ status: "danger" }, "مشکلاتی در ثبت تیکت به وجود آمده است.");
      } else if (response.data.status === -1) {
        logify(
          { status: "danger" },
          "مشکلاتی در آپلود فایلهای تیکت به وجود آمده است."
        );
      }
    } catch (error) {
      console.error("API Error:", error);
      logify({ status: "danger" }, "خطایی در ارتباط با سرور رخ داد.");
    } finally {
      this.createTicketButton.removeAttribute("hidden");
      this.cancelButton.removeAttribute("hidden");
      this.topicSelect.removeAttribute("disabled");
      this.fileUploader.removeAttribute("disabled");
      descriptionTextarea.removeAttribute("disabled");
      subjectInput.removeAttribute("disabled");
    }
  }

  resetForm() {
    document.getElementById("ticket-topic").value = "-1";
    document.getElementById("ticket-subject").value = "";
    document.getElementById("ticket-description").value = "";
    this.uploadList.classList.remove("uploading-attachments");
    this.createTicketButton.removeAttribute("hidden");
    this.cancelButton.removeAttribute("hidden");
    // this.attachentList.setAttribute("hidden", true);
    delete this.state.uploadedFiles;
    this.state.uploadedFiles = [];
    this.renderUploadList();
  }
};

export default NewTicketForm;
