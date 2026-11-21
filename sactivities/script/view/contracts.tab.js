import axios from "axios";
import UIkit from "uikit";
import QuizInfoModal from "../components/Contracts/QuizInfoModal";
import { $_ } from "../../../common/utils/create.dom";
import { logify } from "../../../common/utils/ukHelper";
import PaymentActivationModal from "../components/Contracts/ActivateModal";
import ReferPaymentModal from "../components/Contracts/ReferPaymentModal";
import ExamScheduleModal from "../components/Contracts/ExamScheduleModal";
import { downloadBlob } from "../../../common/utils/downloadBlob";

export const PRODUCT_TYPES = [
  { id: 1, caption: "آزمون", dataField: "quizzes" },
  { id: 4, caption: "خودارزیابی", dataField: "learningAssessment" },
  { id: 8, caption: "آزمون‌ساز", dataField: "testMaker" },
  { id: 16, caption: "بسته تشریحی", dataField: "descriptivePackage" },
];

const DISCOUNT_MODEL = {
  SCHOOL: 1,
  STUDENT: 2,
};

const ContractManager = class {
  constructor(props) {
    this.creditManager = props.creditManager;
    this.mainTabSwitcher = null;
    this.quizMakerRef = null;
    this.registrationRef = null;
    this.referPaymentModalRef = null;

    this.state = {
      contractsStatus: props.contractsStatus,
      quizzesInfo: new Map(),
      data: null,
      selectedTestGroupFilter: -1,
    };

    this.contractsTableMainWrapper = null;
    this.contractsSummaryMainWrapper = null;
    this.quizOrderModal = null;
    this.examScheduleModal = null;
    this.discountModal = null;
    this.promiseReady = this.init();

  }

  setQuizMakerInstance(quizMakerRef) {
    this.quizMakerRef = quizMakerRef;
  }

  setRegistrationInstance(registrationRef) {
    this.registrationRef = registrationRef;
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    this.discountModal = document.querySelector("#discount_modal");
    this.contractsTableMainWrapper = document
      .getElementById("contracts_table_wrapper")
      .querySelector("tbody");

    this.contractsSummaryMainWrapper = document
      .getElementById("contracts_summary_table_wrapper")
      .querySelector("tbody");

    this.quizOrderModal = document.getElementById(
      "exam_student_list_selection_modal",
    );
    this.mainTabSwitcher = UIkit.switcher("#main_tab_switcher");

    const examScheduleModal = new ExamScheduleModal({
      data: { gradeFieldcaption: "", gradeFieldId: "", exams: [] },
    });

    this.examScheduleModal = examScheduleModal.ready();

    await this.render().catch((err) => console.error(err));

    this.activateModal = new PaymentActivationModal({
      renderParent: () => this.render(),
      handleGotoStudentList: (gradeFieldId, modal) =>
        this.handleGotoStudentList(gradeFieldId, modal),
      setActivateTestGroupFilter: (val) => {
        this.state.selectedTestGroupFilter = val;
      },
      creditManager: this.creditManager,
    }).ready();

    return this;
  }

  async __getContractsStatus() {
    const getContractStatusResult = await axios.get(
      `/api/School/GetContractStatus`,
    );
    const contractsStatus = getContractStatusResult.data;
    return contractsStatus;
  }

  /** Build lookup maps for special discounts */
  _buildSpecialDiscountMaps(specialDiscountModel) {
    const studentMap = new Map();
    const schoolMap = new Map();

    specialDiscountModel.forEach((item) => {
      if (item.discountType === DISCOUNT_MODEL.STUDENT) {
        studentMap.set(item.gradeFieldId, item);
      } else if (item.discountType === DISCOUNT_MODEL.SCHOOL) {
        schoolMap.set(item.gradeFieldId, item);
      }
    });

    return { studentMap, schoolMap };
  }

  async render() {
    const res = await axios.get("/api/School/GetSchoolContractFace");
    // console.log(
    //   "[ContractManager] GetSchoolContractFace response:",
    //   res.data[0],
    // );

    // console.log(res.data[0].sectionId);

    delete this.state.data;
    this.state.data = res.data[0];

    const { studentMap, schoolMap } = this._buildSpecialDiscountMaps(
      this.state.data.specialDiscountModel || [],
    );

    $_.removeElementChildNodes(this.contractsTableMainWrapper);
    this.contractsTableMainWrapper.innerHTML = this.state.data.gradeFieldBoxes
      .map((rowData, index) =>
        this._renderGradeContractRow(rowData, index, studentMap, schoolMap),
      )
      .join("");

    $_.removeElementChildNodes(this.contractsSummaryMainWrapper);
    this.contractsSummaryMainWrapper.innerHTML =
      this._renderContractSummaryInvoice();

    this._bindAllEvents(studentMap, schoolMap);
    this._renderDiscountSection(res.data[0].sectionId);
  }

_renderGradeContractRow(rowData, index, studentMap, schoolMap) {
  // Detect if package selected and paid and offer time ended (there is no package offer available) 
  // to prevent change student count after offer selected paid and expired
  const paidExpiredStudentPack = rowData.learningAssessment.productFinancialGroup.discount == 50 
                               && rowData.quizzes.productFinancialGroup.discount == 50
                               && studentOffer == null;

  const studentOffer = studentMap.get(rowData.gradeFieldId);
  const schoolOffer = schoolMap.get(rowData.gradeFieldId);

  const studentClasses = this._getOfferClassesAndStatus(studentOffer, "student");
  const schoolClasses = this._getOfferClassesAndStatus(schoolOffer, "school");
  const preventChangeStudentCount = paidExpiredStudentPack ? true : this._getOfferClassesAndStatus(studentOffer, "student", "paid");
  const alarmChangeStudentCount = this._getOfferClassesAndStatus(studentOffer, "student", "selected");
  const hasDescriptive = rowData.descriptivePackage.productItems.length;


  return `
    <tr data-contract-row-grade-field-id="${rowData.gradeFieldId}" 
        data-contract-row-grade-field-caption="${rowData.gradeFieldCaption}">
      <td>${rowData.gradeFieldCaption}</td>
      <td  ${preventChangeStudentCount ? `class="nochange-std-count" uk-tooltip="امكان تغيير تعداد دانش‌آموزان سفارش بسته‌اي پس از پرداخت وجود ندارد."` : ``}
           ${alarmChangeStudentCount ? `class="nochange-std-count" uk-tooltip="قبل از تغيير تعداد دانش‌آموزان لطفاً بسته را حذف نماييد."` : ``}>
        <div class="count-place-holder">${rowData.testPersonCount}</div>
        <input type="number" value="${rowData.testPersonCount}" min="0" 
               data-test-person-count-prev-value="${rowData.testPersonCount}" onfocus="this.select();">
        <div class="confirmation" dir="ltr">
          <span data-accept-update-test-person-count class="confirm-buttons${rowData.gradeFieldId} confirmation-buttons${rowData.gradeFieldId} uk-animation-fast" uk-icon="check"></span>
          <span data-decline-update-test-person-count class="confirm-buttons${rowData.gradeFieldId} confirmation-buttons${rowData.gradeFieldId} uk-animation-fast" uk-icon="close"></span>
        </div>
      </td>
      <td colspan="6" class="${studentClasses} ${schoolClasses} ${rowData.testPersonCount ? "" : "student-offer-locked school-offer-locked"}">
        ${PRODUCT_TYPES.map((productTypeInfo) => {
          // Decide which calendar (if any) belongs to this product type
          let calendarBtn = "";
          if (productTypeInfo.id === 1) {
            // آزمون → regular schedule
            calendarBtn = `
              <span data-contract-row-exam-schedule-button
                    data-exam-type-id="156"
                    class="calendar"
                    uk-icon="icon: calendar"
                    uk-tooltip="برنامه آزمون"></span>`;
          } else if (productTypeInfo.id === 16) {
            // بسته تشریحی → descriptive schedule
            calendarBtn = `
              <span data-contract-row-exam-schedule-button 
                    data-exam-type-id="57"
                    class="descriptive-calendar"
                    uk-icon="icon: calendar"
                    ${!hasDescriptive ? "hidden" : ""}
                    uk-tooltip="برنامه آزمون‌های تشریحی"></span>`;
          }

          return `
            <div class="row">
              <div class="cell">
                ${productTypeInfo.caption}
                ${calendarBtn}
              </div>
              ${this._renderQuizContractRow(rowData[productTypeInfo.dataField], productTypeInfo.id)}
            </div>`;
        }).join("")}

        ${this._renderSpecialOffer(studentOffer, "student", rowData)}
        ${this._renderSpecialOffer(schoolOffer, "school", rowData)}
      </td>
    </tr>`;
}

_getOfferClassesAndStatus(offer, type, checkType = null) {

  const prefix = type === "student" ? "student" : "school";

  if (!offer) {
    return checkType ? false : `${prefix}-offer-expired`;
  }

  const hasDiscount =
    type === "student"
      ? !!offer.hasStudentSpecialDiscount
      : !!offer.hasCenterSpecialDiscount;

  const hasPurchased = !!offer.hasBeenPurchased;
  // const isAvailable = !!offer.availability;

  

  // selected + confirmed
  if (checkType === "paid") {
    return hasDiscount && hasPurchased;
  }

  // selected + NOT confirmed
  if (checkType === "selected") {
    return hasDiscount && !hasPurchased;
  }

  return [
    hasDiscount ? `${prefix}-offer-selected` : "",
    hasPurchased ? `${prefix}-offer-confirmed` : "",
    // !isAvailable && !hasDiscount ? `${prefix}-offer-expired` : ""
  ]
    .filter(Boolean)
    .join(" ");
}

  async _handleSpecialDiscountClick(gradeFieldId, discountModelId, type) {
    const isStudent = type === "student";
    const paramName = isStudent
      ? "HasStudentSpecialDiscount"
      : "HasCenterSpecialDiscount";

    // Determine current state
    const currentOffer = this.state.data.specialDiscountModel?.find(
      (item) =>
        item.discountModelId === discountModelId &&
        item.gradeFieldId === gradeFieldId,
    );

    const currentValue = currentOffer
      ? isStudent
        ? !!currentOffer.hasStudentSpecialDiscount
        : !!currentOffer.hasCenterSpecialDiscount
      : false;

    const newValue = !currentValue;

    // console.log(
    //   `[SpecialDiscount] ${isStudent ? "Student" : "School"} Toggle → ${newValue} for grade ${gradeFieldId}`,
    // );

    try {
      // Step 1: Get list of test numbers
      const listUrl = isStudent
        ? `/api/School/GetStudentSpecialDiscountList?gradeFieldId=${gradeFieldId}&discountModelId=${discountModelId}&${paramName}=${newValue}`
        : `/api/School/GetCenterSpecialDiscountList?gradeFieldId=${gradeFieldId}&discountModelId=${discountModelId}&${paramName}=${newValue}`;

      // console.log(`[SpecialDiscount] Step 1 - Getting test list: ${listUrl}`);

      const listRes = await axios.get(listUrl);
      const testList = listRes.data || [];

      // Extract testNo from array of objects
      const testNumbers = testList
        .map((item) => item?.testNo)
        .filter((testNo) => testNo != null); // remove null/undefined

      if (!isStudent && testNumbers.length > 1) {
        testNumbers.unshift(testNumbers.pop());
      }

      if (testNumbers.length === 0) {
        console.warn("[SpecialDiscount] No test numbers returned");
        logify({ status: "warning" }, "هیچ آزمونی برای اعمال تخفیف یافت نشد");
        await this.render();
        return;
      }

      // console.log(
      //   `[SpecialDiscount] Found ${testNumbers.length} test numbers to process`,
      //   testNumbers,
      // );

      // Step 2: Set each testNo one by one
      for (let i = 0; i < testNumbers.length; i++) {
        const testNo = testNumbers[i];

        document.body.classList.add("no-touch");

        const currentExam = document.querySelector(
          `[data-quiz-test-no="${testNo}"]`,
        );
        const row = currentExam?.closest("td");

        row.classList.add(`changing-${isStudent ? "student" : "school"}`);
        row.classList.remove(`changing-${isStudent ? "school" : "student"}`);
        

        if (i == 0) {
          row.classList.add(
            `slide-animate${newValue ? "" : "-reverse"}-${isStudent ? "student" : "school"}`,
          );
        }
        
        const setUrl = isStudent
          ? `/api/School/SetStudentSpecialDiscount?gradeFieldId=${gradeFieldId}&discountModelId=${discountModelId}&${paramName}=${newValue}&testNo=${testNo}`
          : `/api/School/SetCenterSpecialDiscount?gradeFieldId=${gradeFieldId}&discountModelId=${discountModelId}&${paramName}=${newValue}&testNo=${testNo}`;

        await axios.get(setUrl);

        // Re-render periodically + at the end
        // if (i % i === 0 || i === testNumbers.length - 1) {
        // await new Promise(resolve => setTimeout(resolve, 350));
        await this.render();
        // }


        
      }

      document
        .querySelectorAll(".changing-school, .changing-student")
        .forEach((el) =>
          el.classList.remove("changing-school", "changing-student"),
        );
      document.body.classList.remove("no-touch");

      logify(
        {},
        newValue
          ? "تخفیف ویژه با موفقیت اعمال شد."
          : "تخفیف ویژه با موفقیت برداشته شد.",
      );
    } catch (err) {
      document.body.classList.remove("no-touch");
      document
        .querySelectorAll(".changing-school, .changing-student")
        .forEach((el) =>
          el.classList.remove("changing-school", "changing-student"),
        );

      console.error("[SpecialDiscount] Error:", err);
      logify({ status: "warning" }, "خطا در اعمال تخفیف ویژه");
      await this.render();
    }
  }

  // async _handleSpecialDiscountClick(gradeFieldId, discountModelId, type) {
  //   const isStudent = type === "student";
  //   const paramName = isStudent
  //     ? "HasStudentSpecialDiscount"
  //     : "HasCenterSpecialDiscount";

  //   // Find current status
  //   const currentOffer = this.state.data.specialDiscountModel?.find(
  //     (item) =>
  //       item.discountModelId === discountModelId &&
  //       item.gradeFieldId === gradeFieldId,
  //   );

  //   const currentValue = currentOffer
  //     ? isStudent
  //       ? !!currentOffer.hasStudentSpecialDiscount
  //       : !!currentOffer.hasCenterSpecialDiscount
  //     : false;

  //   const newValue = !currentValue;

  //   const waitLoading = document.getElementById("Wait_For_Done");
  //   if (waitLoading) waitLoading.classList.add("show-loader");

  //   try {
  //     let url;

  //     if (isStudent) {
  //       // Student Package → New endpoint
  //       url = `/api/School/SetStudentSpecialDiscount?gradeFieldId=${gradeFieldId}&discountModelId=${discountModelId}&HasStudentSpecialDiscount=${newValue}`;
  //     } else {
  //       // School Package (Center) → Existing endpoint
  //       url = `/api/School/SetCenterSpecialDiscount?gradeFieldId=${gradeFieldId}&discountModelId=${discountModelId}&HasCenterSpecialDiscount=${newValue}`;
  //     }

  //     // console.log(
  //     //   `[SpecialDiscount] ${isStudent ? "Student" : "School"} Toggle → ${newValue} | ${url}`,
  //     // );

  //     const res = await axios.get(url);

  //     if (res.status === 200) {
  //       const typeName = isStudent ? "دانش آموز" : "مدرسه";
  //       logify(
  //         {},
  //         newValue
  //           ? `تخفیف ویژه ${typeName} با موفقیت فعال شد.`
  //           : `تخفیف ویژه ${typeName} با موفقیت غیرفعال شد.`,
  //       );

  //       await this.render(); // Refresh UI
  //     } else {
  //       logify({ status: "warning" }, "خطا در ثبت وضعیت تخفیف");
  //     }
  //   } catch (err) {
  //     console.error("[SpecialDiscount] API Error:", err);
  //     logify({ status: "warning" }, "خطا در ارتباط با سرور");
  //   } finally {
  //     if (waitLoading) {
  //       setTimeout(() => waitLoading.classList.remove("show-loader"), 500);
  //     }
  //   }
  // }

  _renderSpecialOffer(offer, type, rowData) {
    // console.log(offer);

    if (!offer) return "";

    const isStudent = type === "student";
    const discountModelId = offer.discountModelId;
    const hasDiscount = isStudent
      ? !!offer.hasStudentSpecialDiscount
      : !!offer.hasCenterSpecialDiscount;
    const gradeFieldId = rowData.gradeFieldId;

    const hasOldOrder = isStudent
      ? rowData.quizzes.productItems.some((item) => item.hasBeenPlaced) ||
        rowData.learningAssessment.productItems.some(
          (item) => item.hasBeenPlaced,
        )
      : rowData.descriptivePackage.productItems.some(
          (item) => item.hasBeenPlaced,
        ) || rowData.testMaker.productItems.some((item) => item.hasBeenPlaced);

    return `
      <div class="${isStudent ? "student-limited-offer" : "school-limited-offer"} ${hasDiscount ? "offer-active" : "offer-available"}" 
           data-grade-field-id="${gradeFieldId}"
           data-discount-model-id="${discountModelId}"
           data-offer-type="${type}">
        <div class="button" ${hasOldOrder ? "" : "data-offer-button"}>
          <span class="offer-text">${offer.suggestedDiscount || 50}</span>
          <span>%</span>
          <span>تخفيف</span>
          ${hasDiscount ? `<span uk-icon="icon: check; ratio: 0.6" class="offer-confirmed"></span>` : ""}
          <div uk-spinner></div>
          <!-- Inline Loader -->
          <span class="offer-loader" style="display:none;">
            <span uk-icon="icon: refresh; ratio: 0.8" class="uk-icon-spin"></span>
          </span>
        </div>
        ${
          hasOldOrder
            ? `<div class="drop uk-drop" uk-drop="mode: click; offset: 5; pos: left">
              <div class="collapsed-drop-container">
                ${
                  hasDiscount
                    ? `<p>آيا سفارش حذف شود؟</p>`
                    : `<p>با انتخاب این تخفیف، همه انتخاب‌های فعلی شما حذف و با بسته تخفیف‌دار جایگزین می‌شود. آيا ادامه می‌دهید؟</p>`
                }
                <span class="reject uk-drop-close uk-icon uk-close" uk-close=""></span>
                <span data-offer-button uk-icon="icon: check" class="accept uk-drop-close uk-icon"></span>			
              </div>
            </div>`
            : ``
        }


        <div class="info">
          <p>${offer.shortPackageName || (isStudent ? "بسته کامل دانش‌آموز" : "بسته کامل مدرسه")}</p>
          <div>
            ${
              (offer.specialDiscountDescription || "").split("|").length > 1
                ? `<p>${(offer.specialDiscountDescription || "").split("|")[0]} <span>${(offer.specialDiscountDescription || "").split("|")[1]}</span> تومان</p>`
                : `<p><span>${offer.specialDiscountDescription || ""}</span> تومان</p>`
            }
            <p>${offer.specialDiscountDeadlineDescription || "تسویه تا 15 مهر"}</p>
          </div>
        </div>
      </div>`;
  }

  async _bindAllEvents(studentMap, schoolMap) {
    // Special Offers
    document
      .querySelectorAll(".student-limited-offer, .school-limited-offer")
      .forEach((container) => {
        const button = container.querySelector("[data-offer-button]");
        if (!button) return;
        
        const gradeFieldId = _.toNumber(container.dataset.gradeFieldId);
        const discountModelId = _.toNumber(container.dataset.discountModelId);
        const offerType = container.dataset.offerType;

        // console.log(
        //   `[Bind Offer] Container found - Grade: ${gradeFieldId}, Model: ${discountModelId}, Type: ${offerType}`,
        // );

        button.onclick = null; // clear old
        button.addEventListener("click", () => {
          if (!gradeFieldId || !discountModelId) {
            console.error(
              "[SpecialDiscount] Missing data on container:",
              container,
            );
            logify({ status: "warning" }, "اطلاعات تخفیف ناقص است");
            return;
          }
          this._handleSpecialDiscountClick(
            gradeFieldId,
            discountModelId,
            offerType,
          );
        });
      });

    // bind quiz contract modal
    document
      .querySelectorAll("[data-contract-quiz-order-modal]")
      .forEach((quizBox) => {
        const examId = _.toNumber(quizBox.dataset.contractQuizOrderModal);
        const typeId = _.toNumber(quizBox.dataset.contractQuizOrderModalTypeId);
        quizBox.addEventListener("click", async () => {
          const examInfo = await this.__getQuizeInfo(examId);
          // console.log(examInfo);
          const quizInfoModal = new QuizInfoModal({
            ...examInfo,
            examId: examId,
            typeId: typeId,
            mainTabSwitcher: this.mainTabSwitcher,
            referPaymentModalRef: this.referPaymentModalRef,
            handleStudentListPresencyAcceptChange: (examId, json, remove) =>
              this.handleStudentListPresencyAcceptChange(examId, json, remove),
            handleGotoStudentList: (gradeFieldId, modal) => {
              this.handleGotoStudentList(gradeFieldId, modal);
            },
            handleReRenderRegistration: () => this.handleReRenderRegistration(),
            examScheduleModal: this.examScheduleModal,
          }).ready();
          quizInfoModal.render();
          quizInfoModal.modal.show();
        });
      });

    //bind passed time quizes log
    document
      .querySelectorAll("[data-contract-quiz-order-time-end]")
      .forEach((quizBox) => {
        quizBox.addEventListener("click", () => {
          const studentCountInput =
            quizBox.closest("td").previousElementSibling.firstElementChild;

          if (studentCountInput.value == 0) {
            studentCountInput.classList.add("count-first");
            setTimeout(function () {
              studentCountInput.classList.remove("count-first");
            }, 3000);
          }

          logify(
            { status: "warning" },
            quizBox.dataset.contractQuizOrderTimeEnd,
          );
        });
      });

    //bind quizMaker quizzes
    document
      .querySelectorAll("[data-contract-quiz-order-quiz-maker]")
      .forEach((quizBox) => {
        quizBox.addEventListener("click", async () => {
          const examId = _.toNumber(quizBox.dataset.contractQuizOrderQuizMaker);
          const waitLoadingdiv = document.getElementById("Wait_For_Done");
          waitLoadingdiv.classList.add("show-loader");

          await this.placeAQuizMakerOrder(examId).catch((err) =>
            console.log(err),
          );

          setTimeout(function () {
            waitLoadingdiv.classList.remove("show-loader");
          }, 500);
        });
      });

    //animation container //yeganee
    const waitLoading = document.getElementById("Wait_For_Done"); //yeganeh

    // Bind exam-schedule buttons (both regular & descriptive)
    const contractRows = document.querySelectorAll(
      "[data-contract-row-grade-field-id]",
    );

    contractRows.forEach((gradeElement) => {
      const gradeFieldId = _.toNumber(
        gradeElement.dataset.contractRowGradeFieldId,
      );
      let gradeFieldCaption = gradeElement.dataset.contractRowGradeFieldCaption;

      const testPersonCountInput = gradeElement.querySelector(
        "[data-test-person-count-prev-value]",
      );

      const acceptNewCountButton = gradeElement.querySelector(
        "[data-accept-update-test-person-count]",
      );
      const declineNewCountButton = gradeElement.querySelector(
        "[data-decline-update-test-person-count]",
      );

      acceptNewCountButton.addEventListener("click", async () => {
        let prevValue = testPersonCountInput.dataset.testPersonCountPrevValue;
        if (prevValue !== testPersonCountInput.value) {
          waitLoading.classList.add("show-loader");
          let res = await axios.get(
            `/api/School/ChangeTestPersonCount?gradeFieldId=${gradeFieldId}&count=${testPersonCountInput.value}`,
          );
          setTimeout(() => waitLoading.classList.remove("show-loader"), 500);
          // );
          if (res.status == 200) {
            const { message, studentCount } = res.data;

            if (message == 1) {
              logify({}, "تغييرات با موفقيت انجام گرديد.");
            } else {
              logify(
                { status: "warning" },
                "فقط دانش‌آموزان بدون نام و چك سفارش قابل حذف مي‌باشند.",
              );
            }
            testPersonCountInput.dataset.testPersonCountPrevValue =
              studentCount;
            testPersonCountInput.value = studentCount;

            await this.registrationRef.reRender();
            if (studentCount === 0) this.quizMakerRef.removeClass(gradeFieldId);
            else {
              if (
                this.quizMakerRef.state.grades.filter(
                  (g) => g.gradeFieldId === gradeFieldId,
                ).length > 0
              ) {
                await this.quizMakerRef.resetGradeClassess(gradeFieldId);
                // await this.registrationRef.createGradeSwitches();
              } else {
                this.quizMakerRef.addNewGrade({
                  gradeFieldId: gradeFieldId,
                  gradeFieldCaption: gradeFieldCaption,
                });
              }
            }

            this.render();
          } else {
            logify({ status: "warning" }, "اشکال در ثبت تغییرات");
            testPersonCountInput.value =
              testPersonCountInput.dataset.testPersonCountPrevValue;
          }
        }
        testPersonCountInput.nextElementSibling.classList.remove("show");
      });

      declineNewCountButton.addEventListener("click", () => {
        let prevValue = testPersonCountInput.dataset.testPersonCountPrevValue;
        testPersonCountInput.value = prevValue;
        testPersonCountInput.nextElementSibling.classList.remove("show");
      });

      ["change", "keydown"].forEach((evnt) =>
        testPersonCountInput.addEventListener(evnt, () =>
          testPersonCountInput.nextElementSibling.classList.add("show"),
        ),
      );


      // const examScheduleButton = gradeElement.querySelector(
      //   "[data-contract-row-exam-schedule-button]",
      // );
      // // console.log(examScheduleButton);
      // examScheduleButton.addEventListener("click", async () => {
      //   // console.log(gradeFieldId);
      //   this.examScheduleModal.render(gradeFieldId);
      //   this.examScheduleModal.modal.show();
      // });
      gradeElement
        .querySelectorAll("[data-contract-row-exam-schedule-button]")
        .forEach((btn) => {
          btn.addEventListener("click", async () => {
            const examTypeId = _.toNumber(btn.dataset.examTypeId) || 156;
            this.examScheduleModal.render(gradeFieldId, examTypeId);
            this.examScheduleModal.modal.show();
          });
        });
    });

    // bind purchase and activate buttons
    const contractActivateButton = document.getElementById(
      "contract_payment_activation_button",
    );

    // remove student payment entrance for plan payments
    const planListRes = await axios.get("/api/School/GetSponsorGroups");
    // console.log(planListRes.data);
    const hasPlan = planListRes.data.filter(
      (element) => element.requestStatus == 4 && element.groupId == 40,
    ).length;
    const studentPaymentEntrance = document.getElementById(
      "student_selection_entrance_container",
    );
    setTimeout(function () {
      if (hasPlan > 0) {
        studentPaymentEntrance.style.display = "none";
      }
    }, 2000);

    contractActivateButton.addEventListener("click", async () => {
      await this.activateModal.render(true);
    });

    // bind student list referal modal
    const contract_refer_togglerWrapper = document.getElementById(
      "contract_refer_payment_toggler_wrapper",
    );
    $_.removeElementChildNodes(contract_refer_togglerWrapper);
    contract_refer_togglerWrapper.innerHTML = `<button id="contract_refer_payment">انتخاب دانش‌آموزان</button>`;
    await $_.pause(101);
    const studentListReferButton = document.getElementById(
      "contract_refer_payment",
    );

    studentListReferButton.addEventListener("click", async () => {
      const contractsStatus = await this.__getContractsStatus();

      let hasListWithName = false;
      contractsStatus.forEach((grade) => {
        if (grade.studentWithName > 0) {
          hasListWithName = true;
        }
      });
      if (hasListWithName === false) {
        // Show error modal with link to student list taab
        const noNameModalElement = document.getElementById(
          "student_list_incomplete_modal",
        );
        const noNameModalLinkWrapper = noNameModalElement.querySelector(
          "#goto_student_list_from_incomplete_modal",
        );
        $_.removeElementChildNodes(noNameModalLinkWrapper);
        noNameModalLinkWrapper.innerHTML = `<a data-contract-no-student-list-edit=${contractsStatus[0].gradeFieldId}>رفتن به صفحه دانش‌آموزان</a>`;
        // UIkit.modal(noNameModalElement).show();
        const modal = UIkit.modal("#student_list_incomplete_modal");
        modal.show();
        noNameModalElement.querySelector("a").addEventListener("click", (e) => {
          let gradeFieldId = e.target.dataset.contractNoStudentListEdit;
          // console.log(gradeFieldId);
          this.handleGotoStudentList(gradeFieldId, modal);
        });

        return;
      }

      this.referPaymentModalRef = new ReferPaymentModal({
        // data: res.data,
      }).ready();
      this.referPaymentModalRef.render(true);
      this.referPaymentModalRef.modal.show();
    });

    const downloadInvoiceButton = this.contractsSummaryMainWrapper.querySelector("#invoice_download");
    downloadInvoiceButton.addEventListener("click", async () => {
      try {
        downloadInvoiceButton.classList.add("dl-spinner");
        downloadInvoiceButton.disabled = true;

        const result = await axios({
          method: "get",                       // change to "post" if needed
          url: "/api/School/GetCenterBill",
          responseType: "blob",
          timeout: 1000 * 600,
        });

        // Check if the response is actually a PDF (sometimes servers return error as blob)
        const contentType = result.headers["content-type"] || "";
        if (!contentType.includes("application/pdf") && !contentType.includes("octet-stream")) {
          // Probably an error returned as blob → treat as failure
          throw new Error("No active invoice");
        }

        const uri = window.URL.createObjectURL(
          new Blob([result.data], { type: "application/pdf" })
        );
        downloadBlob(uri, `CenterBill_${new Date().getTime()}.pdf`);

      } catch (err) {
        console.error("Invoice download failed:", err);

        // Show the expected Persian message for missing/active bill
        logify(
          { status: "warning", pos: "bottom-center" },
          "صورت حساب فعال وجود ندارد"
        );
      } finally {
        downloadInvoiceButton.classList.remove("dl-spinner");
        downloadInvoiceButton.disabled = false;
      }
    });
  }

  _renderQuizContractRow(quizRow, typeId) {
    // console.log({ typeId, quizRow });
    const renderProductItem = (product) => {
      const {
        examId,
        hasBeenPlaced,
        hasBeenPurchased,
        isBridgeScience,
        isTimeToOrderOver,
        productCaption,
        testNo,
        toolTip,
        examTypeId,
        printIt,
        hasBeenCompletelyPaid,
        canOrderOnlineAfterLock,
      } = product;
      // if (isTimeToOrderOver) console.log(quizRow);
      const productTypeInfo = PRODUCT_TYPES.filter((p) => p.id === typeId);
      return `
      <div has-been-completely-paid="${hasBeenCompletelyPaid}" class="exam 
        ${hasBeenPlaced ? "selected" : ""}
        ${hasBeenPurchased && hasBeenCompletelyPaid? "confirmed" : ""}
        ${printIt ? "print-it" : ""}
        ${isBridgeScience ? "sience-sep" : ""}"
        ${
          isTimeToOrderOver && !canOrderOnlineAfterLock
            ? `data-contract-quiz-order-time-end="${toolTip}" style="opacity: 0.5; border-radius: 7px 7px 0px 7px"`
            : ""
        }
        ${
          typeId === 1 || typeId === 4
            ? `data-contract-quiz-order-modal="${examId}" data-contract-quiz-order-modal-type-id="${typeId}" data-quiz-test-no="${testNo}"`
            : `data-quiz-test-no="${testNo}"`
        }>
          
        ${
          isTimeToOrderOver && !canOrderOnlineAfterLock
            ? `<span uk-icon="icon: lock; ratio: 0.5" class="time-over"></span>`
            : ``
        }
          
        <span class="exam-no" 
          ${
            isTimeToOrderOver && !canOrderOnlineAfterLock
              ? `style="padding-right: 5px;width: calc(100% - 5px);"`
              : ``
          }>
          
          ${productCaption}
        </span>

        ${examTypeId || canOrderOnlineAfterLock ? `<i></i>` : ""}
        ${printIt ? `<b></b>` : ""}
        <span uk-spinner></span>

      </div>
      ${
        isTimeToOrderOver === false && (typeId === 8 || typeId === 16)
          ? `
          <div class="drop uk-drop" uk-drop="mode: click; offset: 5; pos: left">
            <div class="collapsed-drop-container">
              ${!hasBeenPurchased ?
              `<p>آيا سفارش ${hasBeenPlaced ? "حذف" : "ثبت"} شود؟</p>
              <span class="reject uk-drop-close uk-icon uk-close" uk-close=""></span>
              <span data-contract-quiz-order-quiz-maker="${examId}" uk-icon="icon: check" class="accept uk-drop-close uk-icon"></span>`
              : `<p>امكان حذف سفارش پرداخت‌شده وجود ندارد</p>`
              }
            </div>
          </div>
          `
          : ``
      }          
      `;
    };

    const renderProductInvoice = (invoice) => {
      // console.log(invoice);
      const {
        amount,
        discount,
        fee,
        netPrice,
        discountDescription,
        productType,
        quizFee,
        onlineQuizFee,
        testMakerFee,
        descriptiveFee,
        learningAssessmentFee,
      } = invoice;

      let tooltipMarkup =
        discountDescription != null && discountDescription.length > 0
          ? discountDescription
              .split(";")
              .map((line) => `<li>${line}</li>`)
              .join("")
          : "";

      return `<div class="cell">

              ${
                productType == 1 || productType == 2
                  ? `<span uk-icon="icon: info; ratio: 0.7"></span>
                      <ul class="drop-tooltip" uk-drop="pos: right-center; mode: click">
                        <li>حضوري: ${$_.toReadableDigit(quizFee)} (ريال)</li>
                        <li>آنلاين: ${$_.toReadableDigit(
                          onlineQuizFee,
                        )} (ريال)</li>
                      </ul>`
                  : productType == 4
                    ? $_.toReadableDigit(learningAssessmentFee)
                    : productType == 8
                      ? $_.toReadableDigit(testMakerFee)
                      : productType == 16
                        ? $_.toReadableDigit(descriptiveFee || 0)
                        : ``
              }
      
              </div>
                  <div class="cell">${$_.toReadableDigit(amount)}</div>
                  <div class="cell">
                    <span ${
                      tooltipMarkup.length > 0
                        ? `uk-icon="icon: info; ratio: 0.7">%` +
                          $_.toReadableDigit(discount)
                        : `>%` + $_.toReadableDigit(discount)
                    }
                    </span>
                    
                    ${
                      tooltipMarkup.length > 0
                        ? `<ul class="drop-tooltip" uk-drop="pos: right-center; mode: click">
                     ${tooltipMarkup}
                    </ul>`
                        : ""
                    }
                  </div>
                  
                  <div class="cell">${$_.toReadableDigit(netPrice)}</div>`;
    };

    return `
              
                  <div class="cell">
                    ${quizRow.productItems
                      .map((product) => renderProductItem(product))
                      .join("")}
                    										
                  </div>
                  ${renderProductInvoice(quizRow.productFinancialGroup)}
						
  `;
  }

  _renderContractSummaryInvoice() {
    const { amountPaid, netPriceSum, remainingBalance } =
      this.state.data.invoiceSummary;
    return ` <tr>
                    <td>${$_.toReadableDigit(Math.abs(netPriceSum))}
                        ${netPriceSum < 0 ? "-" : ""}
                    </td>
                    <td>${$_.toReadableDigit(Math.abs(remainingBalance))}
                        ${remainingBalance < 0 ? "-" : ""}
                    </td>
                    <td>${$_.toReadableDigit(Math.abs(amountPaid))}
                        ${amountPaid < 0 ? "-" : ""}
                    </td>
                    <td class="order-operation">
                      <button id="contract_payment_activation_button" href="#payment_activation_modal" uk-toggle>فعال‌سازي</button>
                      <a id="invoice_download" class="invoice-download" uk-icon="download" uk-tooltip="دانلود فاكتور">
                        <span class="hover-top"></span>
                        <span class="hover-top-right"></span>
                        <span class="hover-right"></span>
                        <span class="hover-bottom-right"></span>
                        <span class="hover-bottom"></span>
                        <span class="hover-bottom-left"></span>
                        <span class="hover-left"></span>
                        <span class="hover-top-left"></span>
                      </a>
                    </td>
                  </tr>`;
  }

  __getQuizeInfo = async (examId) => {
    let haveExamInfo = this.state.quizzesInfo.has(examId);
    var examInfo = null;
    if (haveExamInfo) this.state.quizzesInfo.delete(examId);
    // else { // To use prev values and avoid calling api for each render
    const res = await axios.get(
      `/api/School/GetStudentListAssociatedWithTheService?examid=${examId}`,
    );
    // console.log('GetStudentListAssociatedWithTheService');
    // console.log(res.data);
    
    examInfo = res.data;
    this.state.quizzesInfo.set(examId, examInfo);

    return examInfo;
  };

  async handleStudentListPresencyAcceptChange(examId, json, remove = false) {
    if (remove) this.state.quizzesInfo.delete(examId);
    else this.state.quizzesInfo.set(examId, json);
    await this.render();
  }

  async handleReRenderRegistration() {
    return await this.registrationRef.reRender();
  }

  handleGotoStudentList(gradeFieldId, modal) {
    const anchor = document.getElementById(`switch_${gradeFieldId}`);
    const parent = anchor.parentElement;
    const ulElement = parent.parentElement;

    ulElement
      .querySelectorAll("li")
      .forEach((node) => node.classList.remove("uk-active"));
    if (gradeFieldId) {
      modal.hide();
      this.mainTabSwitcher.show(0);
      anchor.dispatchEvent(new Event("click"));
      anchor.classList.add("uk-active");
      parent.classList.add("uk-active");
    }
  }

  async placeAQuizMakerOrder(examId) {
    const json = await this.__getQuizeInfo(examId);
    // console.log(json);
    const { participants, orderInfo } = { ...json };
    // console.log(participants);
    const isActivePresency = participants[0].isPresent;
    const editedParticipants = participants.map((p) => {
      p.isPresent = isActivePresency ? false : true;
      return p;
    });

    const res = await axios.post(`/api/School/PlaceAnOrder`, {
      orderInfo,
      participants: editedParticipants,
    });
    // console.log(res);
    if (res.data === 1) {
      logify({}, "تغییرات با موفقیت اعمال گردید.");
      this.handleStudentListPresencyAcceptChange(examId, {
        orderInfo,
        participants: editedParticipants,
      });
      if (isActivePresency === false)
        await this.quizMakerRef.addNewGrade({
          gradeFieldId: orderInfo.gradeFieldId,
          gradeFieldCaption: orderInfo.gradeFieldCaption,
        });
      else await this.quizMakerRef.removeClass(orderInfo.gradeFieldId);
    }
  }

_renderDiscountSection(sectionId) {
  const isHighSecondary = Number(sectionId) === 43;

  if (!this.discountModal) {
    return;
  }

  this.discountModal.innerHTML = `
    <div class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button class="uk-modal-close-default" type="button" uk-close></button>

      <div class="discount-header">آزمون هماهنگ</div>

      <div class="discount-group">
        <div class="discount-line">
          <span>پرداخت نقد</span><span>10% تخفیف</span>
        </div>

        <div class="discount-line">
          <span>عدم درخواست پرینت و ارسال گزارش‌ها</span><span>10% تخفیف</span>
        </div>

        <div class="discount-line" id="orders_count_3">
          <span>خريد حداقل 3 مرحله آزمون</span>
          <span>10% تخفیف</span>
        </div>

        <div class="discount-line sub">
          <span></span><span>آزمون تعيين سطح رايگان</span>
        </div>

        <div class="discount-line" id="orders_count_5">
          <span>خريد حداقل 5 مرحله آزمون</span>
          <span>${isHighSecondary ? "15" : "20"}% تخفیف</span>
        </div>

        <div class="discount-line" id="orders_count_7" ${!isHighSecondary ? "hidden" : ""}>
          <span>خريد حداقل 7 مرحله آزمون</span>
          <span>20% تخفیف</span>          
        </div>
      </div>

      <div class="discount-header">سنجش یادگیری</div>

      <div class="discount-group">
        <div class="discount-line">
          <span>مطابق بيشينه تخفيف آزمون‌‌های هماهنگ</span>
        </div>
      </div>

      <div class="discount-header">
        بسته‌هاي تخفيفي ويژه با تسويه تا تاريخ 15 مهر
      </div>

      <div class="discount-group">
        <div class="discount-line">
          <span>
            بسته دانش‌آموز<br>
            <span style="font-size: 80%; position: relative; top: -3px;">
              (خودرازيابي‌ و همه آزمون‌ها)
            </span>
          </span>
          <span style="font-size: 130%">50% تخفیف</span>
        </div>

        <div class="discount-line">
          <span>
            بسته مدرسه<br>
            <span style="font-size: 80%; position: relative; top: -3px;">
              (آزمون‌ساز و بسته تشريحي)
            </span>
          </span>
          <span style="font-size: 130%">50% تخفیف</span>
        </div>
      </div>
    </div>
  `;
}

};

(function () {
  const container = document.querySelector(".table-list-containter");
  if (!container) return;

  const table = container.querySelector("table.payment-activation-row");
  const thead = table?.querySelector("thead");
  const overlay = container.querySelector(".ptl-tbody-overlay");

  function updateTheadHeightVar() {
    if (!thead || !container) return;
    // compute height of thead including borders/margins
    const rect = thead.getBoundingClientRect();
    // but get bounding height relative to table — simpler to use offsetHeight
    const theadHeight = thead.offsetHeight || Math.round(rect.height);
    // set CSS variable on container so overlay top aligns under header
    container.style.setProperty("--thead-height", theadHeight + "px");

    // sometimes table has caption or vertical padding; if overlay must not cover horizontal scrollbar,
    // you could adjust bottom with theadHeight etc. For most tables top/bottom works fine.
  }

  // call on init
  updateTheadHeightVar();

  // re-calc on window resize or when fonts/DOM changes
  window.addEventListener("resize", updateTheadHeightVar);

  // helper to show/hide
  function showTbodyLoading(show = true) {
    if (!overlay || !container) return;
    if (show) {
      overlay.classList.add("visible");
      container.classList.add("tbody-loading");
      overlay.setAttribute("aria-hidden", "false");
      container.setAttribute("aria-busy", "true");
      // ensure correct positioning in case header size changed
      updateTheadHeightVar();
    } else {
      overlay.classList.remove("visible");
      container.classList.remove("tbody-loading");
      overlay.setAttribute("aria-hidden", "true");
      container.removeAttribute("aria-busy");
    }
  }

  // expose globally (optional)
  window.showPaymentTbodyLoading = showTbodyLoading;

  // OPTIONAL: if you want it to auto-show while a fetch is active, you can call it like:
  // showPaymentTbodyLoading(true);
  // fetch('/api/refreshList').then(...).finally(()=> showPaymentTbodyLoading(false));
})();

export default ContractManager;
