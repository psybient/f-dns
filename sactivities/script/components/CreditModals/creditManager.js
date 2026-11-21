// src/.../CreditManager.js
import "@majidh1/jalalidatepicker";
import axios from "axios";
import UIkit from "uikit";
import { $_ } from "../../../../common/utils/create.dom";
import SalesPlan from "./salesPlan";

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
}

class CreditManager {
  constructor(props = {}) {
    this.state = {
      balance: 0,
      agencyDebt: 0,
      purchaseHistory: [],
      gradesMap: new Map(),
      currentGrade: 200,
      isStudentPayment: true,
      isSchoolPayment: true,
      isHistoryQueryActive: false,
      selectedFilterName: "",
    };

    this.modal = null;
    this.linkToModal = null;
    this.transactionsHistoryTable = null;
    this.filters = {
      selectWrapper: null,
      purchasedBySchoolInput: null,
      purchasedByStudentInput: null,
      fullHistorySelect: null,
    };
    this.creditChargeValueInput = null;
    this.currentBalanceAmount = null;
    this.salesPlanManager = null;
    this.goToBankButton = null;

    // Payment types
    this.PAYMENT_TYPE_ONLINE = 10071;
    this.PAYMENT_TYPE_CASH_RECEIPT = 170;
    this.PAYMENT_TYPE_CHECK = 171;
    this.PAYMENT_TYPE_REFUND = 10078;

    this.PAYMENT_STATUS_WAIT = 10072;
    this.PAYMENT_STATUS_REJECTED = 10073;
    this.PAYMENT_STATUS_CONFIRMED = 10074;

    this.cashFiles = [];
    this.checkFiles = [];

    this._lastCashReceiptList = [];
    this._lastCheckList = [];
    this._lastRefundList = [];

    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    this.modal = document.getElementById("wallet_manager_modal");
    if (!this.modal) throw new Error("wallet_manager_modal not found");

    this.linkToModal = document.getElementById(
      "wallet_modal_button_from_sidebar",
    );
    this.transactionsHistoryTable = this.modal.querySelector(
      "table#transaction_history_table",
    );
    this.creditChargeValueInput = this.modal.querySelector(
      "#credit_charge_value_input",
    );
    this.filters.purchasedBySchoolInput = this.modal.querySelector(
      "#purchased_by_school_input",
    );
    this.filters.purchasedByStudentInput = this.modal.querySelector(
      "#purchased_by_student_input",
    );
    this.filters.selectWrapper = this.modal.querySelector(
      "#form-stacked-select-wrapper",
    );
    this.filters.fullHistorySelect = this.modal.querySelector(
      "#wallet_manager_form_full-history-select",
    );
    this.currentBalanceAmount = document.getElementById(
      "wallet_current_blance_amount",
    );

    // Online charge radios
    const radioButtons = this.modal.querySelectorAll(
      "#wallet_charge_credit_options .uk-radio",
    );
    radioButtons.forEach((radioButton, i) => {
      if (i === 0) {
        this.creditChargeValueInput.value =
          radioButton.dataset.walletChargeAmount;
        radioButton.setAttribute("checked", "checked");
      }
      radioButton.addEventListener("click", () => {
        radioButtons.forEach((radio) => radio.removeAttribute("checked"));
        radioButton.setAttribute("checked", "checked");
        this.creditChargeValueInput.value =
          radioButton.dataset.walletChargeAmount;
      });
    });

    this.creditChargeValueInput?.addEventListener("keyup", () => {
      this.formatPriceInputValue(this.creditChargeValueInput);
    });

    this.creditChargeValueInput?.addEventListener("blur", () => {
      let rawValue = this.creditChargeValueInput.value.replace(/,/g, "");
      let numericValue = parseFloat(rawValue);
      if (isNaN(numericValue)) {
        const checked = [...radioButtons].find((r) =>
          r.hasAttribute("checked"),
        );
        if (checked)
          this.creditChargeValueInput.value =
            checked.dataset.walletChargeAmount;
      }
    });

    this.goToBankButton = this.modal.querySelector(
      "#wallet_charge_credit_gotobank",
    );
    this.goToBankButton?.addEventListener("click", async (e) => {
      e.preventDefault();
      const amount = this.creditChargeValueInput.value;
      try {
        const bankUrl = await axios.get(
          `/api/School/GoToBankGate?amount=${amount}`,
        );
        window.location = bankUrl.data;
      } catch (err) {
        console.error(err);
        UIkit.notification("خطا در اتصال به درگاه", { status: "danger" });
      }
    });

    this._initNewListSwitchers();
    this.modal.addEventListener("click", (ev) => this._handleClick(ev));
    this.modal.addEventListener("change", (ev) => {
      if (ev.target.classList.contains("file-uploader")) {
        this._handleFileSelect(ev);
      }
    });

    this._initDatePicker();
    this._initCurrencyInputs();

    this.linkToModal?.addEventListener("click", () => {
      this.render(true);
      this.showModal();
    });

    this.filters.purchasedBySchoolInput?.addEventListener("change", (e) => {
      this.state.isSchoolPayment = e.target.checked;
      this.renderFilteredTransactions();
    });
    this.filters.purchasedByStudentInput?.addEventListener("change", (e) => {
      this.state.isStudentPayment = e.target.checked;
      this.renderFilteredTransactions();
    });
    this.filters.fullHistorySelect?.addEventListener("change", (e) => {
      const val = e.target.value;
      const currentStatus = this.state.isHistoryQueryActive;
      this.state.isHistoryQueryActive = val === "true";
      if (currentStatus !== this.state.isHistoryQueryActive) this.render(true);
    });

    this.salesPlanManager = await new SalesPlan().ready();
    return this;
  }

  // --------------------------------------------------
  // New / List switchers
  // --------------------------------------------------
  _initNewListSwitchers() {
    // Cash
    const cashNew = this.modal.querySelector("#new-receipt");
    const cashList = this.modal.querySelector("#list-receipt");
    const cashForm = this.modal.querySelector("#wallet_add_cach_receipt");
    const cashListEl = this.modal.querySelector("#list_cach_receipt");

    if (cashNew && cashList) {
      const updateCashView = () => {
        if (cashNew.checked) {
          cashForm?.classList.remove("uk-hidden");
          cashListEl?.classList.add("uk-hidden");
        } else {
          cashForm?.classList.add("uk-hidden");
          cashListEl?.classList.remove("uk-hidden");
          this._loadAndRenderReceipts(this.PAYMENT_TYPE_CASH_RECEIPT);
        }
      };
      cashNew.addEventListener("change", updateCashView);
      cashList.addEventListener("change", updateCashView);
      updateCashView();
    }

    // Cheque
    const chequeNew = this.modal.querySelector("#new-cheque");
    const chequeList = this.modal.querySelector("#list-cheque");
    const chequeForm = this.modal.querySelector("#wallet_add_cheque");
    const chequeListEl = this.modal.querySelector("#list_cheque");

    if (chequeNew && chequeList) {
      const updateChequeView = () => {
        if (chequeNew.checked) {
          chequeForm?.classList.remove("uk-hidden");
          chequeListEl?.classList.add("uk-hidden");
        } else {
          chequeForm?.classList.add("uk-hidden");
          chequeListEl?.classList.remove("uk-hidden");
          this._loadAndRenderReceipts(this.PAYMENT_TYPE_CHECK);
        }
      };
      chequeNew.addEventListener("change", updateChequeView);
      chequeList.addEventListener("change", updateChequeView);
      updateChequeView();
    }

    // Refund (برداشت)
    const refundNew = this.modal.querySelector("#new-refund");
    const refundList = this.modal.querySelector("#list-refund");
    const refundForm = this.modal.querySelector("#wallet_add_refund");
    const refundListEl = this.modal.querySelector("#list_refund");

    if (refundNew && refundList) {
      const updateRefundView = () => {
        if (refundNew.checked) {
          refundForm?.classList.remove("uk-hidden");
          refundListEl?.classList.add("uk-hidden");
        } else {
          refundForm?.classList.add("uk-hidden");
          refundListEl?.classList.remove("uk-hidden");
          this._loadAndRenderReceipts(this.PAYMENT_TYPE_REFUND);
        }
      };
      refundNew.addEventListener("change", updateRefundView);
      refundList.addEventListener("change", updateRefundView);
      updateRefundView();
    }
  }

  _initDatePicker() {
    try {
      if (window.jalaliDatepicker) {
        jalaliDatepicker.startWatch({
          autoHide: true,
          showEmptyBtn: false,
          zIndex: 99999999,
        });
      }
    } catch (e) {}
  }

  _initCurrencyInputs() {
    const cashAmount = this.modal.querySelector(
      '#wallet_add_cach_receipt input[placeholder*="مبلغ فيش"]',
    );
    this._attachCurrencyFormatter(cashAmount);

    const chequeAmount = this.modal.querySelector(
      '#wallet_add_cheque input[placeholder*="مبلغ چك"]',
    );
    this._attachCurrencyFormatter(chequeAmount);

    const refundAmount = this.modal.querySelector(
      '#wallet_add_refund input[placeholder*="مبلغ برداشت"]',
    );
    this._attachCurrencyFormatter(refundAmount);
  }

  // --------------------------------------------------
  // Click handler
  // --------------------------------------------------
  _handleClick(ev) {
    const trigger = ev.target.closest(".upload-trigger");
    if (trigger) {
      ev.preventDefault();
      ev.stopPropagation();

      const type = trigger.dataset.type;
      if (!type) return;

      let fileInput = trigger.parentElement?.querySelector(
        `.file-uploader[data-type="${type}"]`,
      );
      if (!fileInput) {
        fileInput = this.modal.querySelector(
          `.file-uploader[data-type="${type}"]`,
        );
      }
      if (fileInput) fileInput.click();
      else console.warn("file-uploader not found for type:", type);
      return;
    }

    const cashAddBtn = ev.target.closest(
      "#wallet_add_cach_receipt button[uk-icon='plus-circle']",
    );
    if (cashAddBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      this._handleCashReceipt();
      return;
    }

    const chequeAddBtn = ev.target.closest(
      "#wallet_add_cheque button[uk-icon='plus-circle']",
    );
    if (chequeAddBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      this._handleCheque();
      return;
    }

    const refundAddBtn = ev.target.closest(
      "#wallet_add_refund button[uk-icon='plus-circle']",
    );
    if (refundAddBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      this._handleRefund();
      return;
    }

    const removeFileBtn = ev.target.closest(".file-item [uk-icon='close']");
    if (removeFileBtn) {
      const fileItem = removeFileBtn.closest(".file-item");
      const type = fileItem?.dataset.type;
      const name = fileItem?.dataset.name;
      if (type === "cash") {
        this.cashFiles = this.cashFiles.filter((f) => f.name !== name);
        this._renderFiles("cash");
      } else if (type === "check") {
        this.checkFiles = this.checkFiles.filter((f) => f.name !== name);
        this._renderFiles("check");
      }
      return;
    }

    const delBtn = ev.target.closest(".remover");
    if (delBtn) {
      const paymentDetailId = delBtn.dataset.paymentDetailId;
      if (paymentDetailId) {
        this._confirmAndDeleteReceipt(Number(paymentDetailId));
      }
      return;
    }
  }

  // --------------------------------------------------
  // File handling
  // --------------------------------------------------
  async _handleFileSelect(ev) {
    const type = ev.target.dataset.type;
    const files = Array.from(ev.target.files || []);
    const targetArray = type === "cash" ? this.cashFiles : this.checkFiles;

    const validFiles = files.filter((file) => {
      if (file.size > 8 * 1024 * 1024) {
        UIkit.notification(`فایل ${file.name} بیش از ۸ مگابایت است`, {
          status: "danger",
        });
        return false;
      }
      return true;
    });

    const existingNames = new Set(targetArray.map((f) => f.name));
    const newFiles = validFiles.filter((f) => !existingNames.has(f.name));

    if (type === "cash") {
      this.cashFiles = [...targetArray, ...newFiles].slice(0, 6);
    } else {
      this.checkFiles = [...targetArray, ...newFiles].slice(0, 6);
    }

    this._renderFiles(type);
    ev.target.value = "";
  }

  _renderFiles(type) {
    const container = this.modal.querySelector(
      type === "cash" ? ".cash-receipt-files" : ".check-files",
    );
    if (!container) return;

    const files = type === "cash" ? this.cashFiles : this.checkFiles;
    container.innerHTML = files
      .map(
        (file) => `
        <div class="file-item" data-type="${type}" data-name="${$_.escapeHtml(file.name)}">
          <span uk-icon="close"></span>
          <span class="file-name">${$_.escapeHtml(file.name)}</span>
        </div>`,
      )
      .join("");
  }

  // --------------------------------------------------
  // Cash Receipt
  // --------------------------------------------------
  async _handleCashReceipt() {
    const form = this.modal.querySelector("#wallet_add_cach_receipt");
    if (!form) return;

    const bankName = (
      form.querySelector('input[placeholder="نام بانك"]')?.value || ""
    ).trim();
    const fullName = (
      form.querySelector('input[placeholder="نام واريزكننده"]')?.value || ""
    ).trim();
    const paymentDate = (
      form.querySelector('input[placeholder="تاريخ واريز"]')?.value || ""
    ).trim();
    const docNoRaw = (
      form.querySelector('input[placeholder*="شماره فيش"]')?.value || ""
    ).trim();
    const accountNo = (form.querySelector("select")?.value || "").trim();
    const paymentAmountRaw = (
      form.querySelector('input[placeholder*="مبلغ فيش"]')?.value || ""
    ).trim();

    const docNoNum = docNoRaw ? Number(docNoRaw.replace(/[^\d]/g, "")) : null;
    const paymentAmount = paymentAmountRaw
      ? Number(this._toEnglishDigits(paymentAmountRaw).replace(/[^\d]/g, ""))
      : null;

    const hasImage = !!form.querySelector(".file-item");

    if (!bankName || !fullName || !paymentDate || !docNoRaw || !accountNo) {
      UIkit.notification("لطفاً تمام فیلدها را پر کنید", { status: "danger" });
      return;
    }
    if (!docNoNum || !Number.isFinite(docNoNum)) {
      UIkit.notification("شماره فیش باید فقط شامل ارقام باشد", {
        status: "danger",
      });
      return;
    }
    if (
      !paymentAmount ||
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      UIkit.notification("لطفاً مبلغ فیش را به صورت عدد وارد کنید", {
        status: "danger",
      });
      return;
    }
    if (!hasImage) {
      UIkit.notification("لطفاً تصویر رسید واریز را الصاق نمایید", {
        status: "danger",
      });
      return;
    }

    let bankCashImages = [];
    try {
      if (this.cashFiles.length) {
        bankCashImages = await Promise.all(
          this.cashFiles.map((f) => fileToBase64(f)),
        );
      }
    } catch (err) {
      UIkit.notification("خطا در تبدیل تصاویر فیش", { status: "danger" });
      return;
    }

    const payload = {
      Id: 0,
      CenterId: 0,
      SectionId: 0,
      PaymentTypeId: this.PAYMENT_TYPE_CASH_RECEIPT,
      PaymentStatusId: this.PAYMENT_STATUS_WAIT,
      PaymentTypeCaption: "پرداخت با فیش نقدی",
      PaymentStatusCaption: "منتظر تایید مالی",
      BankName: bankName,
      FullName: fullName,
      AccountNo: accountNo,
      PaymentDate: paymentDate,
      DocNo: String(docNoNum),
      PaymentAmount: paymentAmount,
      ReceiptImages: bankCashImages,
    };

    try {
      const resp = await axios.post("/api/School/SetReceipt", payload);
      if (resp.data === 1 || resp.data === true) {
        this._clearCashReceiptForm();
        UIkit.notification("فیش با موفقیت ثبت شد", { status: "success" });
        const listRadio = this.modal.querySelector("#list-receipt");
        if (listRadio) {
          listRadio.checked = true;
          listRadio.dispatchEvent(new Event("change"));
        }
        await this._loadAndRenderReceipts(this.PAYMENT_TYPE_CASH_RECEIPT);
        await this.updateData();
      } else {
        UIkit.notification("خطا در ثبت فیش", { status: "danger" });
      }
    } catch (err) {
      console.error(err);
      UIkit.notification("خطا در ثبت فیش", { status: "danger" });
    }
  }

  // --------------------------------------------------
  // Cheque
  // --------------------------------------------------
  async _handleCheque() {
    const form = this.modal.querySelector("#wallet_add_cheque");
    if (!form) return;

    const bankName = (
      form.querySelector('input[placeholder="نام و شعبه بانك"]')?.value || ""
    ).trim();
    const fullName = (
      form.querySelector('input[placeholder="نام صاحب حساب"]')?.value || ""
    ).trim();
    const docNoRaw = (
      form.querySelector('input[placeholder="شماره صيادي"]')?.value || ""
    ).trim();
    const paymentDate = (
      form.querySelector('input[placeholder="تاريخ سررسيد"]')?.value || ""
    ).trim();
    const paymentAmountRaw = (
      form.querySelector('input[placeholder*="مبلغ چك"]')?.value || ""
    ).trim();

    const paymentAmount = paymentAmountRaw
      ? Number(this._toEnglishDigits(paymentAmountRaw).replace(/[^\d]/g, ""))
      : null;

    const hasImage = !!form.querySelector(".file-item");

    if (!bankName || !fullName || !paymentDate || !paymentAmount) {
      UIkit.notification("لطفاً تمام فیلدها را پر کنید", { status: "danger" });
      return;
    }
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      UIkit.notification("لطفاً مبلغ چک را وارد کنید", { status: "danger" });
      return;
    }

    const docNoClean = docNoRaw.replace(/[^\d]/g, "");
    if (!docNoClean) {
      UIkit.notification("لطفاً شماره صیادی را وارد کنید", {
        status: "danger",
      });
      return;
    }
    if (docNoClean.length !== 16) {
      UIkit.notification("شماره صیادی باید دقیقاً ۱۶ رقم باشد", {
        status: "danger",
      });
      return;
    }
    if (docNoClean === "0".repeat(16)) {
      UIkit.notification("شماره صیادی معتبر نیست", { status: "danger" });
      return;
    }
    if (!hasImage) {
      UIkit.notification("لطفاً تصویر چک را الصاق نمایید", {
        status: "danger",
      });
      return;
    }

    let bankCheckImages = [];
    try {
      if (this.checkFiles.length) {
        bankCheckImages = await Promise.all(
          this.checkFiles.map((f) => fileToBase64(f)),
        );
      }
    } catch (err) {
      UIkit.notification("خطا در تبدیل تصاویر چک", { status: "danger" });
      return;
    }

    const payload = {
      Id: 0,
      CenterId: 0,
      SectionId: 0,
      PaymentTypeId: this.PAYMENT_TYPE_CHECK,
      PaymentStatusId: this.PAYMENT_STATUS_WAIT,
      PaymentTypeCaption: "پرداخت با چک",
      PaymentStatusCaption: "منتظر تایید مالی",
      BankName: bankName,
      FullName: fullName,
      AccountNo: "",
      PaymentDate: paymentDate,
      DocNo: docNoClean,
      PaymentAmount: String(paymentAmount),
      ReceiptImages: bankCheckImages,
    };

    try {
      const resp = await axios.post("/api/School/SetReceipt", payload);
      if (resp.data === 1 || resp.data === true) {
        this._clearCheckForm();
        UIkit.notification("چک با موفقیت ثبت شد", { status: "success" });
        const listRadio = this.modal.querySelector("#list-cheque");
        if (listRadio) {
          listRadio.checked = true;
          listRadio.dispatchEvent(new Event("change"));
        }
        await this._loadAndRenderReceipts(this.PAYMENT_TYPE_CHECK);
        await this.updateData();
      } else {
        UIkit.notification("خطا در ثبت چک", { status: "danger" });
      }
    } catch (err) {
      console.error(err);
      UIkit.notification("خطا در ثبت چک", { status: "danger" });
    }
  }

  // --------------------------------------------------
  // Refund (برداشت) — PaymentTypeId 10078
  // --------------------------------------------------
  async _handleRefund() {
    const form = this.modal.querySelector("#wallet_add_refund");
    if (!form) return;

    const paymentAmountRaw = (
      form.querySelector('input[placeholder*="مبلغ برداشت"]')?.value || ""
    ).trim();
    const ibanRaw = (
      form.querySelector('input[name="iban"]')?.value ||
      form.querySelector('input[placeholder*="IR"]')?.value ||
      ""
    )
      .trim()
      .toUpperCase()
      .replace(/\s/g, "");
    const depositer = (
      form.querySelector('input[placeholder*="نام صاحب حساب"]')?.value || ""
    ).trim();
    const accountNo = (
      form.querySelector('input[placeholder*="كد ملي"]')?.value || ""
    ).trim();
    const bankName = (
      form.querySelector('input[placeholder*="نام بانك"]')?.value || ""
    ).trim();

    const paymentAmount = paymentAmountRaw
      ? Number(this._toEnglishDigits(paymentAmountRaw).replace(/[^\d]/g, ""))
      : null;

    if (
      !paymentAmount ||
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      UIkit.notification("لطفاً مبلغ برداشت را وارد کنید", {
        status: "danger",
      });
      return;
    }
    if (!ibanRaw) {
      UIkit.notification("شماره شبا الزامی است", { status: "danger" });
      return;
    }
    if (!/^IR\d{24}$/.test(ibanRaw)) {
      UIkit.notification("فرمت شبا نامعتبر است (IR + ۲۴ رقم)", {
        status: "danger",
      });
      return;
    }
    if (!depositer) {
      UIkit.notification("نام صاحب حساب الزامی است", { status: "danger" });
      return;
    }
    if (!bankName) {
      UIkit.notification("نام بانک الزامی است", { status: "danger" });
      return;
    }

    const payload = {
      Id: 0,
      CenterId: 0,
      SectionId: 0,
      PaymentTypeId: this.PAYMENT_TYPE_REFUND,
      PaymentStatusId: this.PAYMENT_STATUS_WAIT,
      PaymentTypeCaption: "برداشت از کیف پول",
      PaymentStatusCaption: "منتظر تایید مالی",
      BankName: bankName,
      FullName: depositer,
      Depositer: depositer,
      AccountNo: accountNo || "",
      PaymentDate: "",
      DocNo: ibanRaw,
      PaymentAmount: paymentAmount,
      ReceiptImages: [],
    };

    try {
      const resp = await axios.post("/api/School/SetReceipt", payload);
      if (resp.data === 1 || resp.data === true) {
        this._clearRefundForm();
        UIkit.notification("درخواست برداشت ثبت شد", { status: "success" });
        const listRadio = this.modal.querySelector("#list-refund");
        if (listRadio) {
          listRadio.checked = true;
          listRadio.dispatchEvent(new Event("change"));
        }
        await this._loadAndRenderReceipts(this.PAYMENT_TYPE_REFUND);
        await this.updateData();
      } else {
        UIkit.notification("خطا در ثبت درخواست برداشت", { status: "danger" });
      }
    } catch (err) {
      console.error(err);
      UIkit.notification("خطا در ثبت درخواست برداشت", { status: "danger" });
    }
  }

  // --------------------------------------------------
  // Load & render lists
  // --------------------------------------------------
  async _loadAndRenderReceipts(paymentTypeId) {
    try {
      const { data } = await axios.get("/api/School/GetReceipts");
      const list = (Array.isArray(data) ? data : []).filter(
        (r) => Number(r.paymentTypeId) === paymentTypeId,
      );

      list.sort((a, b) => {
        const da = a.paymentDate
          ? new Date(a.paymentDate.replace(/\//g, "-")).getTime()
          : 0;
        const db = b.paymentDate
          ? new Date(b.paymentDate.replace(/\//g, "-")).getTime()
          : 0;
        if (db !== da) return db - da;
        return (b.id || 0) - (a.id || 0);
      });

      if (paymentTypeId === this.PAYMENT_TYPE_CASH_RECEIPT) {
        this._lastCashReceiptList = list;
        this._renderCashList(list);
      } else if (paymentTypeId === this.PAYMENT_TYPE_CHECK) {
        this._lastCheckList = list;
        this._renderChequeList(list);
      } else if (paymentTypeId === this.PAYMENT_TYPE_REFUND) {
        this._lastRefundList = list;
        this._renderRefundList(list);
      }

      return list;
    } catch (err) {
      console.error("GetReceipts error:", err);
      UIkit.notification("خطا در بارگذاری رسیدها", { status: "danger" });
      return [];
    }
  }

  _renderCashList(list) {
    const container = this.modal.querySelector(
      "#list_cach_receipt ul.uk-accordion-default",
    );
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<li class="uk-text-muted uk-text-center">رسیدی ثبت نشده است</li>`;
      return;
    }

    container.innerHTML = list
      .map((r) => this._renderReceiptAccordionItem(r, "cash"))
      .join("");

    setTimeout(() => {
      const firstItem = container.querySelector("li");
      if (firstItem) {
        try {
          UIkit.accordion(container).toggle(0);
        } catch (_) {}
      }
    }, 300);
  }

  _renderChequeList(list) {
    const container = this.modal.querySelector(
      "#list_cheque ul.uk-accordion-default",
    );
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<li class="uk-text-muted uk-text-center">چکی ثبت نشده است</li>`;
      return;
    }

    container.innerHTML = list
      .map((r) => this._renderReceiptAccordionItem(r, "check"))
      .join("");

    setTimeout(() => {
      const firstItem = container.querySelector("li");
      if (firstItem) {
        try {
          UIkit.accordion(container).toggle(0);
        } catch (_) {}
      }
    }, 300);
  }

  _renderRefundList(list) {
    const container = this.modal.querySelector(
      "#list_refund ul.uk-accordion-default",
    );
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<li class="uk-text-muted uk-text-center">درخواستی ثبت نشده است</li>`;
      return;
    }

    container.innerHTML = list
      .map((r) => this._renderReceiptAccordionItem(r, "refund"))
      .join("");

    setTimeout(() => {
      const firstItem = container.querySelector("li");
      if (firstItem) {
        try {
          UIkit.accordion(container).toggle(0);
        } catch (_) {}
      }
    }, 300);
  }

  _renderReceiptAccordionItem(r, type) {
    const id = r.id;
    const amount = r.paymentAmount
      ? new Intl.NumberFormat("fa-IR").format(
          Number(String(r.paymentAmount).replace(/,/g, "")),
        )
      : "—";
    const date = r.paymentDate || "—";
    const statusId = Number(r.paymentStatusId);
    const statusLabel =
      statusId === this.PAYMENT_STATUS_CONFIRMED
        ? "تأیید شده"
        : statusId === this.PAYMENT_STATUS_REJECTED
          ? "رد شده"
          : "در انتظار بررسی";
    const statusClass =
      statusId === this.PAYMENT_STATUS_CONFIRMED
        ? "confirmed"
        : statusId === this.PAYMENT_STATUS_REJECTED
          ? "canceled"
          : "pending";

    const canDelete =
      statusId !== this.PAYMENT_STATUS_CONFIRMED &&
      statusId !== this.PAYMENT_STATUS_REJECTED;

    let details = "";
    if (type === "cash") {
      details = `
        <li>${$_.escapeHtml(r.bankName || "")}</li>
        <li>واریز کننده: ${$_.escapeHtml(r.fullName || "")}</li>
        <li>شماره: ${$_.escapeHtml(r.docNo || "")}</li>
        <li>${$_.escapeHtml(r.accountNo || "")}</li>
      `;
    } else if (type === "check") {
      details = `
        <li>${$_.escapeHtml(r.bankName || "")}</li>
        <li>صادر کننده: ${$_.escapeHtml(r.fullName || "")}</li>
        <li>شماره صیادی: ${$_.escapeHtml(r.docNo || "")}</li>
      `;
    } else {
      details = `
        <li>بانک: ${$_.escapeHtml(r.bankName || "")}</li>
        <li>صاحب حساب: ${$_.escapeHtml(r.depositer || r.fullName || "")}</li>
        <li>شبا: ${$_.escapeHtml(r.docNo || "")}</li>
        ${
          r.accountNo
            ? `<li>کد ملی/اقتصادی: ${$_.escapeHtml(r.accountNo)}</li>`
            : ""
        }
      `;
    }

    return `
      <li data-payment-detail-id="${id}">
        <a class="uk-accordion-title" href>
          <span>${amount} ریال</span>
          <span>${$_.escapeHtml(date)}</span>
        </a>
        ${
          r.paymentReceiptAddress
            ? `<a href="${r.paymentReceiptAddress}" target="_blank" uk-icon="file-text" uk-tooltip="دانلود رسید"></a>`
            : ""
        }
        <div class="uk-accordion-content" style="margin: 10px 0;">
          <div>
            <ul>${details}</ul>
            <span class="${statusClass}">${statusLabel}</span>
            ${
              canDelete
                ? `<a href="#" class="remove" uk-icon="trash" uk-tooltip="حذف"></a>
            <div uk-drop="pos: right; mode: click" class="uk-drop">
              <div class="uk-card uk-card-default uk-card-body">
                <div>آیا مطمئن هستید؟</div>
                <button class="cancel uk-drop-close">خیر</button>
                <button class="remover uk-drop-close" data-payment-detail-id="${id}">بلی</button>
              </div>
            </div>`
                : ""
            }
          </div>
        </div>
      </li>`;
  }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------
  async _confirmAndDeleteReceipt(paymentDetailId) {
    try {
      const resp = await axios.get(
        `/api/School/DeleteReceipt?paymentDetailId=${paymentDetailId}`,
      );
      if (resp.data === 1 || resp.data === true) {
        UIkit.notification("رسید حذف شد", { status: "success" });
        await Promise.all([
          this._loadAndRenderReceipts(this.PAYMENT_TYPE_CASH_RECEIPT),
          this._loadAndRenderReceipts(this.PAYMENT_TYPE_CHECK),
          this._loadAndRenderReceipts(this.PAYMENT_TYPE_REFUND),
        ]);
        await this.updateData();
      } else {
        UIkit.notification("خطا در حذف رسید", { status: "danger" });
      }
    } catch (err) {
      console.error(err);
      UIkit.notification("خطا در حذف رسید", { status: "danger" });
    }
  }

  // --------------------------------------------------
  // Clear forms
  // --------------------------------------------------
  _clearCashReceiptForm() {
    const form = this.modal.querySelector("#wallet_add_cach_receipt");
    if (!form) return;
    form.querySelectorAll("input").forEach((i) => {
      if (i.type !== "radio" && i.type !== "file") i.value = "";
    });
    const sel = form.querySelector("select");
    if (sel) sel.selectedIndex = 0;
    this.cashFiles = [];
    this._renderFiles("cash");
  }

  _clearCheckForm() {
    const form = this.modal.querySelector("#wallet_add_cheque");
    if (!form) return;
    form.querySelectorAll("input").forEach((i) => {
      if (i.type !== "radio" && i.type !== "file") i.value = "";
    });
    this.checkFiles = [];
    this._renderFiles("check");
  }

  _clearRefundForm() {
    const form = this.modal.querySelector("#wallet_add_refund");
    if (!form) return;
    form.querySelectorAll("input").forEach((i) => {
      if (i.type !== "radio" && i.type !== "file") i.value = "";
    });
  }

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  _attachCurrencyFormatter(input) {
    if (!input) return;
    input.addEventListener("input", (e) => {
      const el = e.target;
      let raw = el.value.replace(/[^\d۰-۹]/g, "");
      if (!raw) {
        el.value = "";
        return;
      }
      raw = this._toEnglishDigits(raw);
      el.value = new Intl.NumberFormat("fa-IR").format(Number(raw));
    });
  }

  _toEnglishDigits(str) {
    return String(str).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  }

  _renderAgencyDebt(agencyDebt) {
    const debtEl = document.getElementById("agency_debt_amount");
    if (!debtEl) return;

    const box =
      this.modal?.querySelector(".agency-debt-box") ||
      debtEl.closest(".agency-debt-box") ||
      debtEl.parentElement;

    if (agencyDebt > 0) {
      debtEl.textContent = new Intl.NumberFormat("fa-IR").format(agencyDebt);
      box?.classList.remove("uk-hidden");
      if (box?.style) box.style.display = "";
    } else {
      debtEl.textContent = "0";
      box?.classList.add("uk-hidden");
    }
  }

  // ===== Existing wallet history =====
  async render(hard = false) {
    if (hard) {
      await this.updateData();
      this.salesPlanManager?.render(true);
    }
    this.renderTransactions();
  }

  async updateData() {
    const historyData = await axios.get(
      `/api/School/${this.state.isHistoryQueryActive ? "LoadWalletLog" : "LoadWalletInfo"}`,
    );
    if (historyData.status === 200) {
      this.state.purchaseHistory = historyData.data;

      const walletBalance = await axios.get(`/api/School/GetWalletBalance`);
      if (walletBalance.status === 200) {
        const amount = Number(walletBalance.data?.amount || 0);
        const agencyDebt = Number(walletBalance.data?.agencyDebt || 0);
        this.state.balance = `${$_.toReadableDigit(amount)}`;
        this.state.agencyDebt = agencyDebt;
        this._renderAgencyDebt(agencyDebt);
      }

      this.state.gradesMap.clear();
      this.state.purchaseHistory.forEach((info) => {
        if (!this.state.gradesMap.has(info.gradeFieldId)) {
          this.state.gradesMap.set(info.gradeFieldId, [{ ...info }]);
        } else {
          this.state.gradesMap.set(info.gradeFieldId, [
            ...this.state.gradesMap.get(info.gradeFieldId),
            { ...info },
          ]);
        }
      });
    }
  }

  renderFilteredTransactions() {
    const tbody = this.transactionsHistoryTable?.querySelector("tbody");
    if (!tbody) return;
    const transactionsMarkup = [];
    var filteredData = [];
    if (this.state.currentGrade === 200)
      filteredData = this.state.purchaseHistory;
    else filteredData = this.state.gradesMap.get(this.state.currentGrade);

    if (
      this.state.selectedFilterName !== "" &&
      this.state.selectedFilterName !== "200"
    ) {
      filteredData = [...(filteredData || [])].filter(
        (info) => info.filterName === this.state.selectedFilterName,
      );
    }

    if (filteredData && filteredData.length > 0)
      filteredData.forEach((info, index) => {
        let shouldRender = false;
        if (this.state.isSchoolPayment && info.isStudentPayment === false)
          shouldRender = true;
        if (this.state.isStudentPayment && info.isStudentPayment === true)
          shouldRender = true;
        if (shouldRender)
          transactionsMarkup.push(
            `<tr>
                    <td>
                    ${
                      info.isStudentPayment
                        ? '<span class="student-transaction-in" uk-icon="icon: user; ratio: 0.6"></span>'
                        : ""
                    }
                    <span class="transaction-${
                      info.inputOutput == 1 ? "in" : "out"
                    }" uk-icon="icon: ${
                      info.isStudentPayment
                        ? "check"
                        : info.inputOutput == 1
                          ? "arrow-right"
                          : "arrow-left"
                    }; ratio: 0.9" style="opacity: ${
                      info.inputOutput >= 2 ? 0 : 1
                    }"></span>
                    <span class="wallet-icon" uk-icon="icon: ${
                      info.inputOutput >= 2
                        ? info.inputOutput == 2
                          ? "settings"
                          : "trash"
                        : "tablet-landscape"
                    }"></span>
                    <div id="more-${index}" class="caption
                      ${this.state.isHistoryQueryActive ? "open" : ""}">
                        ${info.caption}
                        ${
                          this.state.isHistoryQueryActive
                            ? ``
                            : `<span uk-toggle="target: #more-${index}; cls: open">...</span>`
                        }
                        <br>
                        <div class="description">
                        ${info.description}
                        </div>
                    </div>
                    </td>
                    <td>${$_.toReadableDigit(info.amount)}</td>
                    <td>${info.payDate}</td>
                </tr>`,
          );
      });
    else transactionsMarkup.push(``);
    tbody.innerHTML = transactionsMarkup.join("");
  }

  renderTransactions() {
    const _that = this;
    if (this.currentBalanceAmount) {
      this.currentBalanceAmount.innerHTML = this.state.balance
        .toLocaleString("ar-EG")
        .replace(/٬/g, ",");
    }

    const gradeSwitchersMarkup = [];
    const filterNameSwitcherMarkup = [];
    $_.removeElementChildNodes(this.filters.selectWrapper);
    const keys = [...this.state.gradesMap.keys()];
    let hasFiltersMade = false;
    keys.forEach((key) => {
      let gradeData = _that.state.gradesMap.get(key);

      gradeSwitchersMarkup.push(
        `<option value="${gradeData[0].gradeFieldId}">
          ${gradeData[0].gradeFieldCaption}
        </option>`,
      );

      if (
        _that.state.currentGrade === key ||
        (_that.state.currentGrade === 200 && hasFiltersMade === false)
      ) {
        if (_that.state.currentGrade === 200) hasFiltersMade = true;
        let gradeNameFilters = [
          ...new Set(gradeData.map((info) => info.filterName)),
        ];

        if (
          _that.state.currentGrade !== 200 &&
          _that.state.currentGrade !== 0
        ) {
          gradeNameFilters.forEach((info) =>
            filterNameSwitcherMarkup.push(
              `<option value="${info}">${info}</option>`,
            ),
          );
        }
      }
    });

    this.filters.selectWrapper.innerHTML = `
      <select class="uk-select" id="form-stacked-select-grade">
        <option value="200">همه پايه‌ها</option>
        ${gradeSwitchersMarkup.join("")}
      </select>
      <select class="uk-select" id="form-stacked-select-filterName">
        <option value="200">همه سفارش‌ها</option>
        ${filterNameSwitcherMarkup.join("")}
      </select>
    `;

    const gradeSelectInput = this.filters.selectWrapper.querySelector(
      "#form-stacked-select-grade",
    );
    const filterNameSelectInput = this.filters.selectWrapper.querySelector(
      "#form-stacked-select-filterName",
    );

    let selectedIndex = keys.indexOf(this.state.currentGrade);
    gradeSelectInput.selectedIndex = selectedIndex < 0 ? 0 : selectedIndex + 1;

    gradeSelectInput.addEventListener("change", (e) => {
      const val = Number(e.target.value);
      if (val === _that.state.currentGrade) return;
      _that.state.currentGrade = val;
      _that.state.selectedFilterName = "";
      _that.renderTransactions();
    });

    filterNameSelectInput.addEventListener("change", (e) => {
      const selectedFilterName = e.target.value;
      if (selectedFilterName === "200") {
        _that.state.selectedFilterName = "";
      } else _that.state.selectedFilterName = selectedFilterName;
      _that.renderFilteredTransactions();
    });

    this.renderFilteredTransactions();
  }

  formatPriceInputValue(input, isFinal = false) {
    let rawValue = input.value.replace(/,/g, "");
    let numericValue = parseFloat(rawValue);
    if (!isNaN(numericValue)) {
      input.value = numericValue.toLocaleString();
    } else if (isFinal) {
      input.value = "";
    }
  }

  showModal(hide = false) {
    if (hide) UIkit.modal(this.modal).hide();
    else UIkit.modal(this.modal).show();
  }
}

export default CreditManager;
