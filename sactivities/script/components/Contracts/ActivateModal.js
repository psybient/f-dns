import UIkit from "uikit";
import axios from "axios";
import { $_ } from "../../../../common/utils/create.dom";
import { logify } from "../../../../common/utils/ukHelper";
import { current } from "jquery-scrollify";
const PaymentActivationModal = class {
  constructor(props) {
    // console.log(props);
    this.creditManager = props.creditManager;
    this.renderParent = props.renderParent;
    this.handleGotoStudentList = props.handleGotoStudentList;
    this.setActivateTestGroupFilter = props.setActivateTestGroupFilter;
    this.scrollAmount = 0;
    this.state = {
      data: props.data,
      deliveryData: new Map(),
      walletBalance: props.balance,
      selectedTestGroupFilter: -1,
    };
    this.modal = null;
    this.modalBody = null;
    this.paymentRows = null;
    this.walletCredit = null;
    this.walletModalButton = null;
    this.testGroupFilterSelect = null;
    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  async updateState() {
    const res = await axios.get(`/api/School/GetInvoiceRecords`);
    delete this.state.data;
    const walletBalanceRes = await axios.get(`/api/School/GetWalletBalance`);

    this.state.walletBalance = walletBalanceRes.data.amount;
    this.state.data = res.data;
  }

  init() {
    let modal = document.getElementById("payment_activation_modal");
    this.modal = UIkit.modal(modal);
    this.modalBody = modal.querySelector("#payment_activation_modal_body");
    this.walletCredit = this.modalBody.querySelector(
      "#payment_wallet_main_fee",
    );
    this.paymentRows = this.modalBody
      .querySelector("table.payment-activation-row")
      .querySelector("tbody"); // #payment_activation_modal_body"
    this.walletModalButton = this.modalBody.querySelector(
      "#wallet_modal_button_from_activation",
    );

    this.listTable = modal.querySelector(".table-list-containter");
    this.loading = modal.querySelector(".ptl-tbody-overlay");
    // debugger;
    this.walletModalButton.addEventListener("click", async () => {
      // console.log(this);
      await this.creditManager.render(true);
      this.creditManager.showModal();
    });

    this.testGroupFilterSelect = document.getElementById("Filter_Test_Group");
    this.testGroupFilterSelect.addEventListener("change", () => {
      const selectedValue = this.testGroupFilterSelect.value;
      const elements = this.modalBody.querySelectorAll("[data-test-no]");
      this.state.selectedTestGroupFilter = Number(selectedValue);
      this.setActivateTestGroupFilter(Number(selectedValue));
      elements.forEach((el) => {
        const typeValue = el.getAttribute("data-test-no");

        if (selectedValue === "-1" || typeValue === selectedValue) {
          el.style.display = ""; // نمایش
        } else {
          el.style.display = "none"; // مخفی‌سازی
        }
      });
    });
    return this;
  }

  setupFilterByTypeValue() {
    const that = this;
    const elements = this.modalBody.querySelectorAll("[data-test-no]");
    // console.log(that.state.selectedTestGroupFilter);
    elements.forEach((el) => {
      const typeValue = el.getAttribute("data-test-no");

      if (
        that.state.selectedTestGroupFilter === -1 ||
        that.state.selectedTestGroupFilter == Number(typeValue)
      ) {
        el.style.display = ""; // نمایش
      } else {
        el.style.display = "none"; // مخفی‌سازی
      }
    });
  }

  async render(hard = false, scrollAmount) {
    const that = this;

    

    if (hard) {
      $_.removeElementChildNodes(this.paymentRows);
      await this.updateState();
    }



    let currentBalance = Number(
      this.walletCredit.innerHTML
        .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
        .replace(/,/g, "")
        .replace(/\D/g, ""),
    );
    // console.log(currentBalance);

    if (currentBalance !== 0) {
      animateValue(
        this.walletCredit,
        currentBalance,
        this.state.walletBalance,
        500,
      );

      const walletDecreaseAnimation =
        document.getElementById("decreament_amount");

      if (currentBalance < this.state.walletBalance) {
        walletDecreaseAnimation.innerHTML =
          "+" + $_.toReadableDigit(this.state.walletBalance - currentBalance);

        walletDecreaseAnimation.classList.add("increase-now");
        setTimeout(function () {
          walletDecreaseAnimation.classList.remove("increase-now");
        }, 3000);
      }
    } else {
      this.walletCredit.innerHTML = splittoSpans(
        $_.toReadableDigit(this.state.walletBalance),
      );
    }

    const sortedList = [...this.state.data.schoolInvoiceRecord].sort(
      (a, b) => a.rowNo - b.rowNo,
    );

    const createDeliveryMethodsData = async (
      examId,
      isPaidRowWithEditableDeliveryStatus,
    ) => {
      // console.log(examId);
      const deliveryApiCallResult = await axios.get(
        `/api/School/GetExamDelivaryList?examId=${examId}`,
      );

      let senderChoices = deliveryApiCallResult.data.filter(
        (item) => item.type === 1,
      );
      let reciverChoices = deliveryApiCallResult.data.filter(
        (item) => item.type === 2,
      );

      let selectedSenderList = senderChoices.filter((item) => item.selected);
      let selectedReciverList = reciverChoices.filter((item) => item.selected);

      const isDeliverySet =
        selectedSenderList.length > 0 ||
        selectedReciverList.length > 0;


      if (selectedSenderList.length === 0 && senderChoices.length > 0) {
        senderChoices[0].selected = true;
        selectedSenderList = [senderChoices[0]];
      }

      if (selectedReciverList.length === 0 && reciverChoices.length > 0) {
        reciverChoices[0].selected = true;
        selectedReciverList = [reciverChoices[0]];
      }

      let selectedSenderAgencyCode =
        selectedSenderList.length > 0 ? selectedSenderList[0].agencyCode : 0;

      let selectedReciverAgencyCode =
        selectedReciverList.length > 0 ? selectedReciverList[0].agencyCode : 0;

      let selectedSenderId =
        selectedSenderList.length > 0 ? selectedSenderList[0].id : 0;

      let selectedReciverId =
        selectedReciverList.length > 0 ? selectedReciverList[0].id : 0;

      let reciverSubCat =
        selectedReciverList.length > 0 ? selectedReciverList[0].subCatValue : 0;
      let senderSubCat =
        selectedSenderList.length > 0 ? selectedSenderList[0].subCatValue : 0;
      // deliveryChoicesObject =
      return {
        send: senderChoices,
        recive: reciverChoices,
        choices: {
          deliveryMethod: selectedSenderId,
          receivingMethod: selectedReciverId,
          deliveryAgency: selectedSenderAgencyCode,
          receivingAgency: selectedReciverAgencyCode,
          reciverSubCat,
          senderSubCat,
          isPaidExam: isPaidRowWithEditableDeliveryStatus,
          isDeliverySet,
        },
      };
    };

    const createMarkupPromise = async (invoice) => {
      // console.log(invoice);
      const {
        caption,
        confirmationMessage,
        discount,
        fee,
        isStudentListEnable,
        lockStatus,
        examType,
        netPrice,
        rowNo,
        tehran,
        statusCaption,
        statusId,
        studentCount,
        amountToPay,
        productType,
        timeToPay,
        examId,
        filledNamesCount,
        gradeFieldId,
        createdStd,
        afterLockEditable = false,
        testNo,
        nameFillingStatus,
        generalStatus
      } = invoice;
      let studentListMarkup = [];

      // console.log('invoice');
      // console.log(invoice);

      if (isStudentListEnable) {
        const studentList = await axios.get(
          `/api/School/StudentPaymentTracking?examId=${examId}`,
        );
        
        studentListMarkup.push(`<span uk-icon="icon: menu; ratio: 0.6"></span>
                      <div class="uk-box-shadow-small" uk-drop="mode: click; offset: 5; pos: bottom-center; auto-update: false; boundary: !.payment-activation-row">`);
        studentList.data.forEach((st) => {
          let name = "";
          if ([...st["firstName"]].length > 0) {
            name = st.firstName;
          }
          if ([...st["lastName"]].length > 0) {
            name += " " + st.lastName;
          }
          if ([...name].length === 0) name = "-- --";
          studentListMarkup.push(`
        <p>${name}  ${
          st.hasBeenPurchased
            ? `<span uk-icon="icon: check; ratio: 0.6"></span>`
            : ``
        }
        `);
        });
        studentListMarkup.push(`</div>`);
        // console.log(studentList);
      }

      var deliveryChoicesObject = null;

      const isExamWithDelivery =
        examType == 600 && !lockStatus 
        // &&
        // String(testNo).slice(-2) !== "98";

      const isPaidRow =
        statusId == 4 || statusId == 8;

      const isPaidRowWithEditableDeliveryStatus =
        isExamWithDelivery && statusId == 4;

      const canEditDelivery =
        isExamWithDelivery && !afterLockEditable;

      const hasEditablePaidDelivery =
        isPaidRowWithEditableDeliveryStatus &&
        !afterLockEditable && !lockStatus;
        
        
      if (isExamWithDelivery) {
        deliveryChoicesObject = await createDeliveryMethodsData(
          examId,
          isPaidRowWithEditableDeliveryStatus,
        );

        this.state.deliveryData.set(examId, deliveryChoicesObject);
      }

    const getDeliveryMarkup = (isPaidExam = false) => {
      const sendOptionsMarkup = deliveryChoicesObject?.send
        ?.map(
          (row) => `
            <option
              ${row.selected ? "selected" : ""}
              value="${row.id}"
              data-delivery-option-sub-category="${row.subCatValue}"
              data-delivery-option-agency-code="${row.agencyCode}">
              ${row.caption}
            </option>
          `,
        )
        .join("");

      const reciveOptionsMarkup = deliveryChoicesObject?.recive
        ?.map(
          (row) => `
            <option
              ${row.selected ? "selected" : ""}
              value="${row.id}"
              data-delivery-option-sub-category="${row.subCatValue}"
              data-delivery-option-agency-code="${row.agencyCode}">
              ${row.caption}
            </option>
          `,
        )
        .join("");

      const sendSubCategory4Markup = deliveryChoicesObject?.send
        ?.filter((row) => row.subCatValue == 4)
        .map(
          (row) => `
            <option
              ${row.selected ? "selected" : ""}
              value="${row.id}"
              data-delivery-option-agency-code="${row.agencyCode}">
              ${row.caption}
            </option>
          `,
        )
        .join("");

      const reciveSubCategory1Markup = tehran
        ? deliveryChoicesObject?.recive
            ?.filter((row) => row.subCatValue == 1)
            .map(
              (row) => `
                <option
                  ${row.selected ? "selected" : ""}
                  value="${row.id}"
                  data-delivery-option-agency-code="${row.agencyCode}">
                  ${row.caption}
                </option>
              `,
            )
            .join("")
        : "<option>انتخاب</option>";

      const reciveSubCategory4Markup = deliveryChoicesObject?.recive
        ?.filter((row) => row.subCatValue == 4)
        .map(
          (row) => `
            <option
              ${row.selected ? "selected" : ""}
              value="${row.id}"
              data-delivery-option-agency-code="${row.agencyCode}">
              ${row.caption}
            </option>
          `,
        )
        .join("");

      const getMainDeliverySelectMarkup = (type, id, options) => `
        <select
          id="${id}_${examId}"
          data-delivery-select-component-type="${type}"
          data-delivery-select-component-exam-id="${examId}"
          class="uk-select">
          ${options}
        </select>
      `;      

      const hasNonTehranAgency =
        deliveryChoicesObject?.send?.some((item) => item.agencyCode !== 0) ?? false;;

      const senderSubCat = deliveryChoicesObject?.choices?.senderSubCat;
      const reciverSubCat = deliveryChoicesObject?.choices?.reciverSubCat;

      const getDeliveryShadowMarkup = (
        type,
        subCategory,
        image,
        title,
      ) => `
        <a
          data-delivery-shadow-component-type="${type}"
          data-delivery-shadow-component-sub-category="${subCategory}"
          data-delivery-shadow-component-exam-id="${examId}"
          class="uk-accordion-title"
          href>
          <img src="../dist/assets/sactivity/${image}" />
          <span>${title}</span>
        </a>
      `;    
      
      const getDeliverySelectMarkup = (
        type,
        subCategory,
        options,
      ) => `
        <select
          data-delivery-select-component-type="${type}"
          data-delivery-select-component-exam-id="${examId}"
          data-delivery-select-component-sub-category="${subCategory}"
          class="uk-select"
          aria-label="Select">
          ${options}
        </select>
      `;      

      return `
        <div
          class="drop"
          uk-drop="mode: click; offset: 5; boundary: !.payment-activation-row">

          <div class="collapsed-drop-container">
            <div class="options">
              <label>نحوه ارسال آزمون به مدرسه</label>
              ${getMainDeliverySelectMarkup(1,"delivery_main_send_select_component",sendOptionsMarkup,)}

              <label>نحوه ارسال پاسخ‌برگ به مرآت</label>
              ${getMainDeliverySelectMarkup(2,"delivery_main_recive_select_component",reciveOptionsMarkup,)}
            </div>

            <span class="reject uk-drop-close" uk-close></span>

            <span
              data-accept-delivery-button
              uk-icon="icon: check"
              class="accept uk-drop-close">
            </span>

            <div
              class="more"
              uk-toggle="target: #send_receive_${rowNo}; cls: dropchange">
              بيشتر
            </div>
          </div>

          <div class="expanded-drop-container">
            <div
              class="back"
              uk-icon="icon: arrow-right"
              uk-toggle="target: #send_receive_${rowNo}; cls: dropchange">
            </div>

            <h1>نحوه ارسال و دريافت ${caption}</h1>

            <div class="send-info">
              <div class="send-options">
                <div class="send-title">ارسال بسته آزمون به مدرسه</div>

                <ul
                  id="delivery_send_accordion_${examId}"
                  uk-accordion="collapsible: false">

                  <li class="${
                    tehran
                      ? senderSubCat === 1
                        ? "uk-open"
                        : ""
                      : "disabled-choice"
                  }">

                    ${getDeliveryShadowMarkup(1, 1, "send-tehran-delivery.svg", "پیک (تهران)")}                  

                    <div class="uk-accordion-content">
                      دفترچه آزمون‌ها از طریق پیک و به صورت رایگان، یک روز قبل از آزمون به مدرسه ارسال می‌گردد
                    </div>
                  </li>

                  <li class="${
                    tehran || !hasNonTehranAgency
                      ? "disabled-choice"
                      : senderSubCat === 4
                        ? "uk-open"
                        : ""
                  }">

                    ${getDeliveryShadowMarkup(1, 4, "send-states-agent.svg", "مدیر اجرایی (شهرستان‌ها)")}                  

                    <div class="uk-accordion-content">
                      ارسال توسط مدیر اجرایی مرآت در شهر شما صورت خواهد گرفت.

                      ${getDeliverySelectMarkup(1,4,sendSubCategory4Markup)}                      

                    </div>
                  </li>

                  <li class="${
                    tehran
                      ? "disabled-choice"
                      : senderSubCat === 2
                        ? "uk-open"
                        : ""
                  }">

                    ${getDeliveryShadowMarkup(1, 2, "send-states-post.svg", "پست (شهرستان‌ها)")}                  

                    <div class="uk-accordion-content">
                      پس از پست دفترچه آزمون‌ها، کد رهگیری از طریق پیامک در اختیار مدرسه قرار خواهد گرفت و پیگیری بسته ارسالی از سامانه پست به عهده مدرسه می‌باشد.
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div class="receive-info">
              <div class="receive-options">
                <div class="receive-title">ارسال پاسخبرگ‌ها به مرآت</div>

                <ul
                  id="delivery_recive_accordion_${examId}"
                  uk-accordion="collapsible: false">

                  <li class="${
                    tehran
                      ? reciverSubCat === 1
                        ? "uk-open"
                        : ""
                      : "disabled-choice"
                  }">

                    ${getDeliveryShadowMarkup(2, 1, "receive-tehran-delivery.svg", "پیک (تهران)")}                  

                    <div class="uk-accordion-content">
                      انتخاب زمان تحويل پاسخبرگ‌ها به پيك مرآت در روز آزمون:
                      <br>
                      ${getDeliverySelectMarkup(2,1,reciveSubCategory1Markup)}                      
                    </div>
                  </li>

                  <li class="${
                    reciverSubCat === 3 ? "uk-open" : ""
                  }">

                    ${getDeliveryShadowMarkup(2, 3, "receive-scan-send.svg", "اسكن و ارسال با نرم‌افزار")}                  

                    <div class="uk-accordion-content">
                      <div class="downloads">
                        <a
                          href="https://s3.ir-thr-at1.arvanstorage.com/meraat-webresources-schoolfolder-guides/ScanHelpCompressed.mp4"
                          target="_blank">
                          راهنما
                        </a>

                        <a
                          href="https://meraat.ir/download/DC"
                          target="_blank">
                          دانلود نرم‌افزار
                        </a>
                      </div>
                    </div>
                  </li>

                  <li class="${
                    tehran || !hasNonTehranAgency
                      ? "disabled-choice"
                      : reciverSubCat === 4
                        ? "uk-open"
                        : ""
                  }">

                    ${getDeliveryShadowMarkup(2, 4, "receive-states-agent.svg", "مدیر اجرایی (شهرستان‌ها)")}                  

                    <div class="uk-accordion-content">
                      تحویل پاسخبرگ‌ها به مدیر اجرایی مرآت در شهر شما
                      <br>

                      ${getDeliverySelectMarkup(2,4,reciveSubCategory4Markup)}                                            

                    </div>
                  </li>

                  <li class="${
                    tehran
                      ? "disabled-choice"
                      : reciverSubCat === 2
                        ? "uk-open"
                        : ""
                  }">

                    ${getDeliveryShadowMarkup(2, 2, "receive-states-post.svg", "پست (شهرستان‌ها)")}                  

                    <div class="uk-accordion-content">
                      <div class="downloads">
                        <a
                          href="https://s3.ir-thr-at1.arvanstorage.com/meraat/meraat-address.pdf"
                          target="_blank">
                          دانلود آدرس پستی
                        </a>
                      </div>

                      <br>

                      <span class="smaller">
                        برای تسریع صدور کارنامه پیشنهاد می‌شود از روش ارسال مستقیم از طریق نرم‌افزار استفاده کنید. در روش پستی، کارنامه‌ها پس از رسیدن بسته به مرآت در دسترس خواهد بود.
                      </span>
                    </div>
                  </li>

                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    const getPaymentConfirmationMarkup = () => `
      <div class="drop" uk-drop="mode: click; offset: 5; boundary: !.payment-activation-row">
        <div class="collapsed-drop-container">
          <p>آیا از خرید خود اطمینان دارید؟</p>
          <span class="reject uk-drop-close" uk-close></span>
          <span class="accept uk-drop-close" uk-icon="icon: check" data-accept-payable-amount-button="${amountToPay}">
          </span>
        </div>
      </div>
    `;

    const getPaymentMarkup = () => {
      if (!nameFillingStatus) {
        return `
          <button class="go-to-student-list"
            uk-icon="icon: list"
            uk-tooltip="لطفاً قبل از فعال‌سازی و پرداخت لیست دانش‌آموزان را تکمیل نمایید."
            data-contract-order-student-list-edit="${gradeFieldId}">
            تکمیل لیست دانش‌آموزان
          </button>
        `;
      }

      if (isPaidRow) {
        return `
          ${hasEditablePaidDelivery ? `
            <a class="edit-delivery" uk-icon="icon: mail">
              <span uk-icon="check"></span>
            </a>
            ${getDeliveryMarkup(true)}
          ` : ""}

          <div class="${isExamWithDelivery ? "face-to-face-exam" : ""}">
            <span>${(confirmationMessage || "").split(";")[0] || ""}</span>
            <span>${(confirmationMessage || "").split(";")[1] || ""}</span>
          </div>
        `;
      }


      if (canEditDelivery) {
        return `
          <a
            class="edit-delivery ${!deliveryChoicesObject.choices.isDeliverySet ? "delivery-not-set" : ""}"
            uk-icon="icon: mail">
            <span uk-icon="check"></span>
          </a>

          ${getDeliveryMarkup(true)}

          <button
            class="pay-button ${statusId == 32 ? "active-button" : ""}
              ${!deliveryChoicesObject.choices.isDeliverySet ? "payment-disabled" : ""}">
            ${statusId == 32 ? "" : $_.toReadableDigit(amountToPay)}

            <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 130.2 130.2">
              <polyline class="check" fill="none" stroke="#fff"
                stroke-width="10" stroke-linecap="round"
                stroke-miterlimit="8"
                points="90.2,40.2 51.5,88.8 29.8,67.5" />
            </svg>

            ${generalStatus.includes("(تسویه ناقص)")
              ? `<div class="exam-0">آزمون تعیین سطح تأیید است.</div>`
              : ""}
          </button>

          ${getPaymentConfirmationMarkup()}
        `;
      }

      return `
        <button class="pay-button">
          ${$_.toReadableDigit(amountToPay)}

          <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 130.2 130.2">
            <polyline class="check" fill="none" stroke="#fff"
              stroke-width="10" stroke-linecap="round"
              stroke-miterlimit="8"
              points="90.2,40.2 51.5,88.8 29.8,67.5" />
          </svg>
        </button>

        ${getPaymentConfirmationMarkup()}
      `;
    };

    const feeMarkup = fee.includes("|")
      ? `
        <span class="info-sign" uk-icon="icon: info; ratio: 0.8"></span>
        <div 
          class="uk-box-shadow-small fee-count"
          uk-drop="mode: click; offset: 5; pos: bottom-center;
          auto-update: false; boundary: !.payment-activation-row">
          ${fee
            .split("،")
            .map((item) => {
              const [title, amount] = item.split("|").map((x) => x.trim());
              return `<div>
                        <span>${title}</span>
                        <span>${$_.toReadableDigit(amount)} ريال</span>
                      </div>`;
            })
            .join("")}
        </div>
      `
      : $_.toReadableDigit(fee); 

    const studentCountMarkup =
      productType == 8 || productType == 9 || productType == 10
        ? "-"
        : productType == 11
          ? `
            <span class="info-sign" uk-icon="icon: info; ratio: 0.8"></span>
            <div class="uk-box-shadow-small fee-count"
              uk-drop="mode: click; offset: 5; pos: bottom-center;
              auto-update: false; boundary: !.payment-activation-row">
              ${studentCount
                .split("،")
                .map((item) => {
                  const [title, amount] = item.split("|").map((x) => x.trim());
                  return `<div>
                            <span>${title}</span>
                            <span>${amount} نفر</span>
                          </div>`;
                })
                .join("")}
            </div>
          `
          : studentCount + " از " + createdStd;      

    return `
      <tr
        data-payment-row-exam-id="${examId}"
        data-payment-row-discount="${discount}"
        data-payment-row-student-count="${studentCount}"
        data-test-no-base="${testNo}"
        data-test-no="${parseInt(String(testNo).slice(-2), 10)}"
        lockStatus="${lockStatus}"
        class="${statusId == 4
                  ? "confirmed"
                  : statusId == 8 || statusId == 16
                    ? "rejected"
                    : ""
              }"
        ${this.state.selectedTestGroupFilter !== parseInt(String(testNo).slice(-2), 10)
            ? `style="display: none"`
            : ""
        }>
              
        <td>${rowNo}</td>
        <td>${caption}</td>
        <td>${feeMarkup}</td>
        <td>${studentCountMarkup}</td>
        <td>%${discount}</td>
        <td>${$_.toReadableDigit(netPrice)}</td>
        <td>${timeToPay}</td>
        <td class="status">
          ${statusCaption}
          ${isStudentListEnable ? studentListMarkup.join("") : ""}
        </td>
        <td class="payable" id="send_receive_${rowNo}">
          ${getPaymentMarkup()}
        </td>
      </tr>
    `;
    };

    const markupPromise = sortedList.map(async (invoice) => {
      return await createMarkupPromise(invoice);
    });

    // console.log(markupPromise);
    let schoolInfoIsComplete = true;

    if (this.state.data.schoolInvoiceRecord.length > 0) {
      schoolInfoIsComplete =
        this.state.data.schoolInvoiceRecord[0].infoVerification;
    }
    // console.log(this.state.deliveryData);
    this.paymentRows.innerHTML =
      [...(await Promise.all(markupPromise))].join("") +
      `
      <tr class="incomplete-school-info" ${!schoolInfoIsComplete ? "" : "hidden"}>
        <td>
        <span>لطفاً قبل از فعال‌سازي اطلاعات مدرسه را تكميل نماييد.</span>
        <button id="goto_edit_profile">تكميل اطلاعات مدرسه</button>
        </td>
      </tr>
      `;

    //Bind edited inaccepted profile info

    await $_.pause(500);
    const gotoEditProfileButton =
      this.modalBody.querySelector("#goto_edit_profile");

    gotoEditProfileButton.addEventListener("click", () => {
      document
        .getElementById("freelancer_profile_manager_link")
        .dispatchEvent(new Event("click"));
    });

    // bind delivery methods
    // data-delivery-select-component-type="${1}"
    // data-delivery-select-component-exam-id="${examId}"
    // data-delivery-selectcomponent-sub-category="4"
    const deliveryMethodsSelectComponents = this.modalBody.querySelectorAll(
      "[data-delivery-select-component-exam-id]",
    );

    const deliveryMethodsShadowComponents = this.modalBody.querySelectorAll(
      "[data-delivery-shadow-component-exam-id]",
    ); //="${examId}"`)

    deliveryMethodsShadowComponents.forEach((component) => {
      let examId = _.toNumber(component.dataset.deliveryShadowComponentExamId);
      let type = _.toNumber(component.dataset.deliveryShadowComponentType);
      let subCategory = component.dataset.deliveryShadowComponentSubCategory;

      component.addEventListener("click", () => {
        // console.log({ examId, type, subCategory });
        let selectedIndex = 0;
        let mainSelectComponent = this.modalBody.querySelector(
          `#delivery_main_${
            type == 1 ? "send" : "recive"
          }_select_component_${examId}`,
        );

        [...mainSelectComponent.options].forEach((option, i) => {
          if (option.dataset.deliveryOptionSubCategory == subCategory)
            if (selectedIndex === 0) selectedIndex = i;
        });
        mainSelectComponent.selectedIndex = selectedIndex;
        //Manually trigger a custom "change" event for initial synamic content
        mainSelectComponent.dispatchEvent(
          new Event("change", {
            bubbles: false,
          }),
        );
      });
    });

    deliveryMethodsSelectComponents.forEach((select) => {
      let examId = _.toNumber(select.dataset.deliverySelectComponentExamId);
      let type = _.toNumber(select.dataset.deliverySelectComponentType);
      let subCategory = select.dataset.deliverySelectComponentSubCategory;
      let isDetailComponent = subCategory ? true : false;
      // _.toNumber(select.dataset.deliverySelectComponentSubCategory);

      select.addEventListener("change", () => {
        let dataRef = that.state.deliveryData.get(examId);
        // console.log({ examId, type, subCategory, isDetailComponent });
        let selectedOption = $_.getSelectedOption(select);
        // if (isDetailComponent) {
        let accordion = this.modalBody.querySelector(
          `#delivery_${type === 1 ? "send" : "recive"}_accordion_${examId}`,
        );
        let mainSelectComponent = this.modalBody.querySelector(
          `#delivery_main_${
            type == 1 ? "send" : "recive"
          }_select_component_${examId}`,
        );

        const subCategoryValue = isDetailComponent
          ? subCategory
          : selectedOption.dataset.deliveryOptionSubCategory;
        const agencyCode = _.toNumber(
          selectedOption.dataset.deliveryOptionAgencyCode,
        );
        // console.log({ subCategoryValue, agencyCode });
        if (isDetailComponent) {
          let selectedIndex = 0;
          [...mainSelectComponent.options].forEach((option, i) => {
            // console.log({
            //   optionVal: option.value,
            //   selectedOptionVal: selectedOption.value,
            //   agency: option.dataset.deliveryOptionAgencyCode,
            // });
            if (
              option.dataset.deliveryOptionSubCategory == subCategoryValue &&
              option.value == selectedOption.value &&
              option.dataset.deliveryOptionAgencyCode == agencyCode
            )
              selectedIndex = i;
          });
          mainSelectComponent.selectedIndex = selectedIndex;
          //Manually trigger a custom "change" event for initial synamic content
          mainSelectComponent.dispatchEvent(
            new Event("change", {
              bubbles: false,
            }),
          );
        } else {
          if (
            // subCategoryValue == "2" ||
            subCategoryValue == "4" ||
            (subCategoryValue == "1" && type == 2)
          ) {
            // debugger;
            let shadowSelectComponent = that.modalBody.querySelector(
              `select[data-delivery-select-component-type="${type}"][data-delivery-select-component-exam-id="${examId}"][data-delivery-select-component-sub-category="${subCategoryValue}"]`,
            );
            let selectedIndex = 0;
            let selectedOption = $_.getSelectedOption(select);
            [...shadowSelectComponent.options].forEach((option, i) => {
              if (subCategoryValue === "4") {
                if (
                  selectedOption.dataset.deliveryOptionSubCategory ==
                    subCategoryValue &&
                  option.value == selectedOption.value &&
                  option.dataset.deliveryOptionAgencyCode == agencyCode
                )
                  selectedIndex = i;
              } else if (
                selectedOption.dataset.deliveryOptionSubCategory ==
                  subCategoryValue &&
                option.value == selectedOption.value
              )
                selectedIndex = i;
            });
            shadowSelectComponent.selectedIndex = selectedIndex;
          }
          that.state.deliveryData.set(examId, {
            ...dataRef,
            choices: {
              receivingMethod:
                type === 2
                  ? _.toNumber(selectedOption.value)
                  : dataRef.choices.receivingMethod,
              deliveryAgency:
                type === 1 ? agencyCode : dataRef.choices.deliveryAgency,
              deliveryMethod:
                type === 1
                  ? _.toNumber(selectedOption.value)
                  : dataRef.choices.deliveryMethod,
              receivingAgency:
                type === 2 ? agencyCode : dataRef.choices.receivingAgency,
              reciverSubCat:
                type === 2 ? subCategoryValue : dataRef.choices.reciverSubCat,
              senderSubCat:
                type === 1 ? subCategoryValue : dataRef.choices.senderSubCat,
              isPaidExam: dataRef.choices.isPaidExam,
            },
          });
          let selectedAccordionIndex = 0;
          if (type === 1)
            selectedAccordionIndex =
              subCategoryValue === "4" ? 1 : subCategoryValue === "2" ? 2 : 0;
          else {
            selectedAccordionIndex =
              subCategoryValue === "4"
                ? 2
                : subCategoryValue === "2"
                  ? 3
                  : subCategoryValue === "1"
                    ? 0
                    : 1;
          }
          UIkit.accordion(accordion).toggle(selectedAccordionIndex);
          // console.log(that.state.deliveryData.get(examId));
        }

        // }
      });
    });

    const deliveryAcceptButtons = this.modalBody.querySelectorAll(
      "[data-accept-delivery-button]",
    );

    deliveryAcceptButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const trNode = button.closest("tr");
        const examId = _.toNumber(trNode.dataset.paymentRowExamId);
        const testNoBase = trNode.dataset.testNoBase;

        const deliveryDataChoicesRef = that.state.deliveryData.get(examId).choices;

        const query = `../api/School/UpdateExamDelivaryMethod?examId=${examId}&deliveryMethod=${deliveryDataChoicesRef.deliveryMethod}&ReceivingMethod=${deliveryDataChoicesRef.receivingMethod}&deliveryAgency=${deliveryDataChoicesRef.deliveryAgency}&receivingAgency=${deliveryDataChoicesRef.receivingAgency}&testNo=${testNoBase}`;

        const result = await axios.post(query);

        if (result.data === true) {
          logify(
            { status: "success" },
            "نحوه ارسال و تحویل آزمون با موفقیت ثبت شد",
          );

          const trNode = button.closest("tr");
          const payButton = trNode.querySelector(".pay-button");
          const editDelivery = trNode.querySelector(".edit-delivery");

          if (payButton) {
            payButton.classList.remove("payment-disabled");
            payButton.classList.add("activated");
          }

        if (editDelivery) {
          editDelivery.classList.remove("delivery-not-set");
        }
        } else {
          logify(
            { status: "danger" },
            "اشکال در ثبت نحوه ارسال و تحویل آزمون",
          );
        }
      });
    });


    // submit payment button binding
    const payButtons = this.modalBody.querySelectorAll(
      "[data-accept-payable-amount-button]",
    );
    // console.log(payButtons);
    payButtons.forEach((payButton) => {
      payButton.addEventListener("click", async (e) => {
        const trNode = payButton.closest("tr");
        const mainPayButton = payButton.closest("td").querySelector(".pay-button");
        const amountToPay = payButton.dataset.acceptPayableAmountButton;
        const examId = _.toNumber(trNode.dataset.paymentRowExamId);
        const testNo = trNode.dataset.testNo;
        const testNoBase = trNode.dataset.testNoBase;
        const discount = trNode.dataset.paymentRowDiscount;
        const studentCount = trNode.dataset.paymentRowStudentCount;
        const walletDecreaseAnimation =
          document.getElementById("decreament_amount");
        const paymentList = document.documentElement;
        let isRepresentalQuestionary = payButton.hasAttribute(
          "data-in-class-questionary-pay-button",
        );
        let deliveryDataChoicesRef = {};

        let isDeliveryMethodAccepted = true;
        if (isRepresentalQuestionary) {
          deliveryDataChoicesRef = that.state.deliveryData.get(examId).choices;
          let query = `../api/School/UpdateExamDelivaryMethod?examId=${examId}&deliveryMethod=${deliveryDataChoicesRef.deliveryMethod}&ReceivingMethod=${deliveryDataChoicesRef.receivingMethod}&deliveryAgency=${deliveryDataChoicesRef.deliveryAgency}&receivingAgency=${deliveryDataChoicesRef.receivingAgency}&testNo=${testNoBase}`;
          // console.log(query);
          const saveDeliveryChoices = await axios.post(query);
          isDeliveryMethodAccepted = saveDeliveryChoices.data;
        }
        if (isDeliveryMethodAccepted == false) {
          logify({ status: "danger" }, "اشکال در ثبت نحوه ارسال و تحویل آزمون");
          return;
        } else {
          // debugger;
          if (deliveryDataChoicesRef.isPaidExam) {
            logify(
              { status: "success" },
              " نحوه ارسال و تحویل پاسخبرگ آپدیت شد",
            );

            that.render(true, this.listTable.scrollTop);
            return;
          }

          const res = await axios.get(
            `/api/School/PlaceAPayment?examId=${examId}&studentCount=${studentCount}&discount=${discount}&amountToPay=${amountToPay}&testNo=${testNoBase}`,
          );

          if (res.data === 1) {
            let deliveryDataObject = that.state.deliveryData.get(examId);
            that.state.deliveryData.set(examId, {
              ...deliveryDataObject,
              choices: { ...deliveryDataChoicesRef, isPaidExam: true },
            });
            paymentList.classList.add("no-action");
            mainPayButton.classList.add("paid"); //yeganeh
            await $_.pause(2000); //yeganeh
            trNode.classList.add("confirmed");
            await $_.pause(500);
            // console.log(that.state);
            // this.modal.hide();
            // window.showPaymentTbodyLoading(true);
            await that.renderParent();
            await that.render(true, this.listTable.scrollTop);
            // window.showPaymentTbodyLoading(false);
            walletDecreaseAnimation.innerHTML =
              "-" + $_.toReadableDigit(Number(amountToPay));
            walletDecreaseAnimation.classList.add("decrease-now");
            setTimeout(function () {
              walletDecreaseAnimation.classList.remove("decrease-now");
              paymentList.classList.remove("no-action");
            }, 1600);
            } else if(res.data === -2){
              logify({ status: "danger" }, "سفارش قبلاً پرداخت شده است.");
              await that.renderParent();
              await that.render(true, this.listTable.scrollTop);              
            } else {
            logify({ status: "warning" }, "کیف پول فاقد اعتبار لازم است");
            this.walletModalButton.classList.add("wallet-entrance-flash");
            await $_.pause(2000); //yeganeh
            this.walletModalButton.classList.remove("wallet-entrance-flash");
          }
        }
      });
    });

    // handle go to registration student list
    const gotoRegistrationStudentList = this.modalBody.querySelectorAll(
      "[data-contract-order-student-list-edit]",
    );
    gotoRegistrationStudentList.forEach((element) => {
      const gradeFieldId = _.toNumber(
        element.dataset.contractOrderStudentListEdit,
      );
      element.addEventListener("click", () => {
        that.handleGotoStudentList(gradeFieldId, that.modal);
      });
    });

    // payent rows
    const walletDecreaseAnimation =
      document.getElementById("decreament_amount");

    function animateValue(obj, start, end, duration) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        // const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const progress =
          Math.round(
            Math.min((timestamp - startTimestamp) / duration, 1) * 10,
          ) / 10;
        obj.innerHTML = splittoSpans(
          $_.toReadableDigit(Math.floor(progress * (end - start) + start)),
        );
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }

    function getLastCharOrZero(str) {
      let keyword = null;

      if (str.includes(" - حضور")) {
        keyword = " - حضور";
      } else if (str.includes(" - آنلا")) {
        keyword = " - آنلا";
      }

      if (keyword) {
        const parts = str.split(keyword);
        const lastChar = parts[0].slice(-1);
        return lastChar === "ح" ? 0 : lastChar;
      } else {
        return null; // هیچ‌کدوم از کلیدواژه‌ها وجود نداشت
      }
    }

    function populateSelectSmart(selectId, dataArray) {
      if (!Array.isArray(dataArray)) {
        console.warn("ورودی داده‌ها آرایه نیست:", dataArray);
        return;
      }

      const uniqueValues = Array.from(
        new Set(
          dataArray.map((item) => parseInt(String(item.testNo).slice(-2), 10)),
        ),
      ).sort((a, b) => a - b);

      const select = document.getElementById(selectId);
      if (!select) {
        console.warn(`Select با id "${selectId}" پیدا نشد.`);
        return;
      }

      select.innerHTML = ""; // پاک کردن گزینه‌های قبلی

      // اضافه کردن گزینه «همه» در ابتدای لیست
      const allOption = document.createElement("option");
      allOption.value = "-1";
      allOption.textContent = "همه خدمات";
      select.appendChild(allOption);

      uniqueValues.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;

        // تعیین caption بر اساس value
        if (value === 0) {
          option.textContent = "آزمون تعیین سطح";
        } else if (value === 90) {
          option.textContent = "خودارزیابی";
        } else if (value === 96) {
          option.textContent = "آزمون‌ساز و آزمون تشریحی";
        } else if (value === 97) {
          option.textContent = "آزمون و خودارزیابی";
        } else if (value === 98) {
          option.textContent = "پك مدرسه‌اي";
        } else if (value === 99) {
          option.textContent = "پك دانش‌آموزي";                    
        } else if (value === 80) {
          option.textContent = "آزمون‌ساز";
        } else if (value >= 20 && value <= 24)   {
          option.textContent = `آزمون تشریحی مرحله ${value - 20}`;
        } else {
          option.textContent = `آزمون مرحله ${value}`;
        }
        // debugger;
        // console.log(that.state.selectedTestGroupFilter);
        if (value === that.state.selectedTestGroupFilter)
          option.selected = true;

        select.appendChild(option);
      });
    }

    populateSelectSmart(
      "Filter_Test_Group",
      this.state.data.schoolInvoiceRecord,
    );
    this.setupFilterByTypeValue();
    // setupFilterByTypeValue("Filter_Test_Group");

    this.loading.classList.remove("visible");
    this.listTable.scrollTop = scrollAmount;

    function splittoSpans(Strnumber) {
      let result = "";
      Strnumber.split("").forEach((digit) => {
        if (digit == ",") {
          result += `<span class="native-width">` + digit + "</span>";
        } else {
          result += "<span>" + digit + "</span>";
        }
      });
      return result;
    }
  }
};
export default PaymentActivationModal;
