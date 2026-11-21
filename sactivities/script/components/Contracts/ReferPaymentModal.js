//ReferPaymentToStudentModal
import UIkit from "uikit";
import axios from "axios";
import { $_ } from "../../../../common/utils/create.dom";
import { logify } from "../../../../common/utils/ukHelper";
import { createNoSubstitutionTemplateLiteral } from "typescript";

const emptyInvoiceTemplate = {
  allRequestToPay: 0,
  amountPaid: 0,
  payables: new Map(),
  paid: new Map(),
  remain: new Map(),
};

const ReferPaymentModal = class {
  constructor(props) {
    // this.handleStudentListPresencyAcceptChange =
    //   props.handleStudentListPresencyAcceptChange;
    this.state = {
      data: null, // props.data,
      invoice: [], //{ allRequestToPay: 0, amountPaid: 0, },
      grades: [],
      json: null,
      initialRender: true,
    };
    this.modal = null;
    this.modalBody = null;
    this.switcher = null;
    this.switcherContainer = null;
    this.summaryContainer = null;

    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  init() {
    let modal = document.getElementById("student_list_payment_modal");
    this.modal = UIkit.modal(modal);
    this.modalBody = modal.querySelector(".uk-modal-body");
    this.switcher = this.modalBody.querySelector(
      "#student_list_payment_modal_switcher"
    );
    this.switcherContainer = this.modalBody.querySelector(
      "#student_list_payment_modal_switcher_container"
    );
    this.summaryContainer = this.modalBody.querySelector(
      "#student_list_payment_modal_summary_container"
    );
    return this;
  }

  getInvoiceSummaryMarkup(toPay, paid) {
    return `<div class="title">جمع كل پرداخت دانش‌آموزي (ريال)</div>
      <div class="selected-amount">مبلغ انتخاب‌شده<span>${$_.toReadableDigit(
        toPay
      )}<span></div>
      <div class="paid-amount">مبلغ پرداخت‌شده<span>${$_.toReadableDigit(
        paid
      )}<span></div>`;
  }

  async fetchAndUpdateData() {
    const res = await axios.get(`/api/School/GetStudentPaymentList`);

    
    delete this.state.data;
    this.state.data = res.data;
    delete this.state.grades;
    this.state.grades = [];
    delete this.state.invoice;
    this.state.invoice = [];
  }

  async render(hard = false) {
    if (hard) {
      this.state.initialRender = true;
      await this.fetchAndUpdateData();
      console.log('this.state.data xxxxxxx');
      console.log(this.state.data);
    }
    $_.removeElementChildNodes(this.switcherContainer);
    $_.removeElementChildNodes(this.switcher);
    // $_.removeElements(
    //   document.getElementById(
    //     "student_list_payment_modal_accept_payment_button"
    //   )
    // );
    const switchers = [];
    const markup = [];
    if (this.state.data.gradeFieldColumns.length === 0) {
      this.switcherContainer.innerHTML = `<div class="no-contract">قراردادی وجود ندارد</div>`;
      this.summaryContainer.innerHTML = this.getInvoiceSummaryMarkup(
        this.state.data.studentPaymentSummary.allRequestToPay,
        this.state.data.studentPaymentSummary.amountPaid
      );
      return;
    }

    // console.log(this.state.data.gradeFieldColumns);
    this.state.data.gradeFieldColumns.forEach((gradeInfo) => {
      markup.push(`<div>`);
      switchers.push(`<li><a href="#">${gradeInfo.gradeFieldCaption}</a></li>`);
      markup.push(this._renderGradeTable(gradeInfo));
      markup.push(`</div>`);
    });

    this.switcher.innerHTML = switchers.join("");
    this.switcherContainer.innerHTML = markup.join("");
    const totalPayableAmount = this.state.invoice.reduce(function (acc, obj) {
      return acc + obj.allRequestToPay;
    }, 0);
    const totalPaid = this.state.invoice.reduce(function (acc, obj) {
      return acc + obj.amountPaid;
    }, 0);
    this.summaryContainer.innerHTML = this.getInvoiceSummaryMarkup(
      totalPayableAmount,
      totalPaid
    );

    // console.log("this.state.grades", this.state.grades);
    if (this.state.initialRender) {
      UIkit.switcher(this.switcher).show(0);
      const json = [];
      for (let item of this.state.grades) {
        const objectsArray = Array.from(
          item.gradeData,
          ([testPersonId, status]) => ({ testPersonId, status })
        );
        json.push({ gradeFieldId: item.gradeFieldId, data: objectsArray });
      }
      // console.log(json);
      delete this.state.json;
      this.state.json = json;
      this.bindForm();
      this.state.initialRender = false;
    }
  }

  bindForm() {
    // debugger;
    // Binding form
    const _that = this;
    const questionProductNodes =
      document.querySelectorAll(`[data-student-payment-refer-node-exam-id
]`);
    // questionProductNodes.forEach((node) => {
    //   node.addEventListener("click", () => {
        
    //     let dataIndex = 0;
    //     const examId = _.toNumber(node.dataset.studentPaymentReferNodeExamId);
    //     const liNode = node.closest("li");
    //     const olNode = liNode.closest("ol");

    //     // node.classList.remove("selected");
    //     const testPersonId = _.toNumber(
    //       liNode.dataset.studentPaymentReferTestPersonId
    //     );
    //     const gradeFieldId = _.toNumber(
    //       olNode.dataset.studentPaymentReferRootGradeFieldId
    //     );
    //     // const productPrice = _.toNumber(
    //     //   node.dataset.studentPaymentReferNodeExamPrice
    //     // );
    //     const row = this.state.json.filter((gradeData, i) => {
    //       if (gradeData.gradeFieldId === gradeFieldId) {
    //         dataIndex = i;
    //         return true;
    //       } else return false;
    //     })[0];
    //     console.log('xxxxxxxxxxxxx');
    //     console.log(row);
    //     const updatetData = row.data.map((info) => {
    //       const updatedStatus = [];
    //       if (info.testPersonId === testPersonId) {
    //         info.status.forEach((status) => {
    //           if (status.examId === examId) {
    //             let isActive = status.requestToPay;
    //             // to update amount for this test personId along with footer
    //             status.requestToPay = isActive ? false : true;
    //             // debugger;
    //             _that.state.invoice[dataIndex].payables.set(
    //               testPersonId,
    //               isActive
    //                 ? _that.state.invoice[dataIndex].payables.get(
    //                     testPersonId
    //                   ) - status.productPrice
    //                 : _that.state.invoice[dataIndex].payables.get(
    //                     testPersonId
    //                   ) + status.productPrice
    //             );
    //             if (isActive === false) {
    //               if (status.hasBeenPaid === false) {
    //                 _that.state.invoice[dataIndex].remain.set(
    //                   testPersonId,

    //                   _that.state.invoice[dataIndex].remain.get(testPersonId) +
    //                     status.productPrice
    //                   // : _that.state.invoice[dataIndex].remain.get(testPersonId) -
    //                   //     status.productPrice
    //                 );
    //               } else {
    //                 _that.state.invoice[dataIndex].paid.set(
    //                   testPersonId,

    //                   _that.state.invoice[dataIndex].paid.get(testPersonId) +
    //                     status.productPrice
    //                 );
    //               }
    //             } else {
    //               _that.state.invoice[dataIndex].remain.set(
    //                 testPersonId,

    //                 _that.state.invoice[dataIndex].remain.get(testPersonId) -
    //                   status.productPrice
    //               );
    //             }
    //             let tabAmount = _that.state.invoice[dataIndex].allRequestToPay;
    //             _that.state.invoice[dataIndex].allRequestToPay = isActive
    //               ? tabAmount - status.productPrice
    //               : tabAmount + status.productPrice;
    //             if (isActive) node.classList.remove("selected");
    //             else node.classList.add("selected");
    //           }
    //           updatedStatus.push(status);
    //         });
    //       }
    //       // } else updatedStatus.push([...info.status]);
    //       return {
    //         ...info,
    //         status: updatedStatus.length === 0 ? info.status : updatedStatus,
    //       };
    //     });
    //     delete row.data;
    //     row.data = [...updatetData];
    //     delete this.state.json[dataIndex];
    //     this.state.json[dataIndex] = { ...row };
    //     this.updateInvoice(gradeFieldId, testPersonId);
    //   });
    // });


questionProductNodes.forEach((node) => {
  node.addEventListener("click", () => {
    let dataIndex = 0;

    const examId = _.toNumber(
      node.dataset.studentPaymentReferNodeExamId
    );

    const liNode = node.closest("li");
    const olNode = liNode.closest("ol");

    const testPersonId = _.toNumber(
      liNode.dataset.studentPaymentReferTestPersonId
    );

    const gradeFieldId = _.toNumber(
      olNode.dataset.studentPaymentReferRootGradeFieldId
    );

    const row = this.state.json.filter((gradeData, i) => {
      if (gradeData.gradeFieldId === gradeFieldId) {
        dataIndex = i;
        return true;
      }

      return false;
    })[0];

    // console.log(row);

    const updatetData = row.data.map((info) => {
      const updatedStatus = [];

      if (info.testPersonId === testPersonId) {
        // وضعیت آزمونی که روی آن کلیک شده
        const clickedStatus = info.status.find(
          (status) => status.examId === examId
        );

        if (!clickedStatus) {
          return info;
        }

        // وضعیت جدید همه آزمون‌های دارای سفارش
        const newRequestToPay = !clickedStatus.requestToPay;

        info.status.forEach((status) => {
          // آزمون‌هایی که سفارش ندارند اصلاً تغییر نکنند
          if (!status.hasAnOrder) {
            updatedStatus.push(status);
            return;
          }

          const oldRequestToPay = status.requestToPay;

          // تغییر فقط در صورتی که وضعیت قبلی متفاوت باشد
          if (oldRequestToPay !== newRequestToPay) {
            status.requestToPay = newRequestToPay;

            const amount = status.productPrice;
            const invoice = _that.state.invoice[dataIndex];

            const payables =
              invoice.payables.get(testPersonId) || 0;

            const remain =
              invoice.remain.get(testPersonId) || 0;

            const paid =
              invoice.paid.get(testPersonId) || 0;

            const amountChange = newRequestToPay
              ? amount
              : -amount;

            // مبلغ قابل پرداخت
            invoice.payables.set(
              testPersonId,
              payables + amountChange
            );

            // مبلغ مانده / پرداخت شده
            if (status.hasBeenPaid === false) {
              invoice.remain.set(
                testPersonId,
                remain + amountChange
              );
            } else {
              invoice.paid.set(
                testPersonId,
                paid + amountChange
              );
            }

            // جمع کل انتخاب‌ها
            invoice.allRequestToPay += amountChange;
          }

          updatedStatus.push(status);
        });

        // selected مربوط به همه آزمون‌های دارای سفارش
        questionProductNodes.forEach((otherNode) => {
          const otherLiNode = otherNode.closest("li");

          if (!otherLiNode) return;

          const otherTestPersonId = _.toNumber(
            otherLiNode.dataset.studentPaymentReferTestPersonId
          );

          if (otherTestPersonId !== testPersonId) return;

          const otherExamId = _.toNumber(
            otherNode.dataset.studentPaymentReferNodeExamId
          );

          const otherStatus = info.status.find(
            (status) => status.examId === otherExamId
          );

          if (!otherStatus || !otherStatus.hasAnOrder) return;

          if (newRequestToPay) {
            otherNode.classList.add("selected");
          } else {
            otherNode.classList.remove("selected");
          }
        });
      }

      return {
        ...info,
        status:
          updatedStatus.length === 0
            ? info.status
            : updatedStatus,
      };
    });

    delete row.data;
    row.data = [...updatetData];

    delete this.state.json[dataIndex];
    this.state.json[dataIndex] = {
      ...row,
    };

    this.updateInvoice(gradeFieldId, testPersonId);
  });
});    

    // Student list togglers for exams
    // const togglers = this.modalBody.querySelectorAll(
    //   "[data-student-payment-refer-toggler-exam-id]"
    // );
    // togglers.forEach((toggler) => {
    //   const examId = _.toNumber(
    //     toggler.dataset.studentPaymentReferTogglerExamId
    //   );
    //   toggler.addEventListener("click", (e) => {
    //     const shouldActive =
    //       e.target.dataset.studentPaymentReferTogglerExamIdEnable === "true"
    //         ? true
    //         : false;

    //     const examNodes = this.modalBody.querySelectorAll(
    //       `[data-student-payment-refer-node-exam-id="${examId}"]`
    //     );

    //     if (examNodes.length === 0) return;
    //     const examNodesInfo = [...examNodes].map((node) => {
    //       const nodeExamId = _.toNumber(
    //         node.dataset.studentPaymentReferNodeExamId
    //       );
    //       const liNode = node.closest("li");
    //       const olNode = liNode.closest("ol");
    //       const gradeFieldId = _.toNumber(
    //         olNode.dataset.studentPaymentReferRootGradeFieldId
    //       );
    //       const testPersonId = _.toNumber(
    //         liNode.dataset.studentPaymentReferTestPersonId
    //       );
    //       return {
    //         gradeFieldId,
    //         nodeExamId,
    //         testPersonId,
    //         node: node,
    //       };
    //     });
    //     // console.log(examNodesInfo);

    //     let gradeFieldIndex = 0;
    //     let gradeFieldDataRow = _that.state.json.filter((gradeData, i) => {
    //       if (gradeData.gradeFieldId === examNodesInfo[0].gradeFieldId) {
    //         gradeFieldIndex = i;
    //         return true;
    //       } else return false;
    //     })[0];

    //     // console.log({ gradeFieldDataRow, gradeFieldIndex, examId });
    //     for (let item of _that.state.json[gradeFieldIndex].data) {
    //       const testPersonId = item.testPersonId;
    //       examNodesInfo.forEach((node) => {
    //         for (let status of item.status) {
    //           // debugger;
    //           if (testPersonId === node.testPersonId) {
    //             // console.log(testPersonId);
    //             if (status.examId === examId) {
    //               // console.log({ ...status, shouldActive });
    //               const {
    //                 hasAnOrder,
    //                 hasBeenPaid,
    //                 requestToPay,
    //                 paidByCenter,
    //               } = status;
    //               if (
    //                 requestToPay !== shouldActive &&
    //                 hasBeenPaid === false &&
    //                 paidByCenter === 0 &&
    //                 hasAnOrder
    //               ) {
    //                 status.requestToPay = shouldActive;
    //                 node.node.classList[shouldActive ? "add" : "remove"](
    //                   "selected"
    //                 );

    //                 _that.state.invoice[gradeFieldIndex].payables.set(
    //                   testPersonId,
    //                   shouldActive
    //                     ? _that.state.invoice[gradeFieldIndex].payables.get(
    //                         testPersonId
    //                       ) + status.productPrice
    //                     : _that.state.invoice[gradeFieldIndex].payables.get(
    //                         testPersonId
    //                       ) - status.productPrice
    //                 );

    //                 if (shouldActive) {
    //                   if (hasBeenPaid) {
    //                     _that.state.invoice[gradeFieldIndex].paid.set(
    //                       testPersonId,
    //                       _that.state.invoice[gradeFieldIndex].paid.get(
    //                         testPersonId
    //                       ) + status.productPrice
    //                     );
    //                   } else {
    //                     _that.state.invoice[gradeFieldIndex].remain.set(
    //                       testPersonId,
    //                       // shouldAddOrSubOrNothing && isActive
    //                       //   ? // shouldAddOrSub
    //                       _that.state.invoice[gradeFieldIndex].remain.get(
    //                         testPersonId
    //                       ) + status.productPrice
    //                     );
    //                   }
    //                 } else
    //                   _that.state.invoice[gradeFieldIndex].remain.set(
    //                     testPersonId,
    //                     _that.state.invoice[gradeFieldIndex].remain.get(
    //                       testPersonId
    //                     ) - status.productPrice
    //                   );

    //                 let totalAmount =
    //                   _that.state.invoice[gradeFieldIndex].allRequestToPay;
    //                 _that.state.invoice[gradeFieldIndex].allRequestToPay =
    //                   shouldActive
    //                     ? totalAmount + status.productPrice
    //                     : totalAmount - status.productPrice;

    //                 let totalPaid =
    //                   _that.state.invoice[gradeFieldIndex].amountPaid;
    //                 if (hasBeenPaid) {
    //                   _that.state.invoice[gradeFieldIndex].amountPaid =
    //                     totalPaid + status.productPrice;
    //                 }
    //               } //else node.node.classList.remove("selected");
    //             }
    //           }
    //         }
    //       });

    //       // const effectedtestPersonIds = examNodesInfo.filter(
    //       //   (node) => node.testPersonId === item.testPersonId
    //       // );
    //       // console.log(effectedtestPersonIds);
    //       // debugger;
    //       // if (effectedtestPersonIds.length) {
    //       //   for (let status of item.status) {
    //       //     console.log(item);
    //       //     if (status.examId === examId) {
    //       //       status.hasBeenRequest = shouldActive;
    //       //       effectedtestPersonIds
    //       //         .filter((examNodeRef) => examNodeRef.nodeExamId === examId)[0]
    //       //         .node.classList[shouldActive ? "add" : "remove"]("selected");
    //       //       //           else node.classList.remove("selected");
    //       //     }
    //       //   }
    //       // }
    //     }

    //     examNodesInfo.forEach((info) => {
    //       // console.log(testPersonNo);
    //       _that.updateInvoice(info.gradeFieldId, info.testPersonId);
    //     });
    //   });
    // });


const togglers = this.modalBody.querySelectorAll(
  "[data-student-payment-refer-toggler-exam-id]"
);

togglers.forEach((toggler) => {
  toggler.addEventListener("click", (e) => {
    const shouldActive =
      e.target.dataset.studentPaymentReferTogglerExamIdEnable === "true";

    const olNode = toggler
      .closest(".uk-active")
      ?.querySelector(
        "[data-student-payment-refer-root-grade-field-id]"
      );

    if (!olNode) return;

    const gradeFieldId = _.toNumber(
      olNode.dataset.studentPaymentReferRootGradeFieldId
    );

    const gradeFieldIndex = _that.state.json.findIndex(
      (item) => item.gradeFieldId === gradeFieldId
    );

    if (gradeFieldIndex === -1) return;

    _that.state.json[gradeFieldIndex].data.forEach((item) => {
      const { testPersonId, status } = item;

      status.forEach((status) => {
        if (
          !status.hasAnOrder ||
          status.requestToPay === shouldActive ||
          status.hasBeenPaid ||
          status.paidByCenter === 1
        ) {
          return;
        }

        const { productPrice, hasBeenPaid } = status;

        status.requestToPay = shouldActive;

        olNode
          .querySelector(
            `[data-student-payment-refer-test-person-id="${testPersonId}"] ` +
              `[data-student-payment-refer-node-exam-id="${status.examId}"]`
          )
          ?.classList[shouldActive ? "add" : "remove"]("selected");

        const invoice = _that.state.invoice[gradeFieldIndex];

        invoice.payables.set(
          testPersonId,
          invoice.payables.get(testPersonId) +
            (shouldActive ? productPrice : -productPrice)
        );

        if (shouldActive) {
          const collection = hasBeenPaid ? invoice.paid : invoice.remain;

          collection.set(
            testPersonId,
            collection.get(testPersonId) + productPrice
          );
        } else {
          invoice.remain.set(
            testPersonId,
            invoice.remain.get(testPersonId) - productPrice
          );
        }

        invoice.allRequestToPay += shouldActive
          ? productPrice
          : -productPrice;

        if (hasBeenPaid) {
          invoice.amountPaid += shouldActive
            ? productPrice
            : -productPrice;
        }
      });

      _that.updateInvoice(gradeFieldId, testPersonId);
    });
  });
});

    

    // if (this.state.initialRender) {
    //   console.log(this.state.initialRender);
    //   this.state.initialRender = false;
    //   debugger;
    const acceptButtonWrapper = this.modalBody.querySelector(
      "#student_list_payment_modal_accept_payment_button_wrapper"
    );
    $_.removeElementChildNodes(acceptButtonWrapper);
    acceptButtonWrapper.innerHTML = `<button id="student_list_payment_modal_accept_payment_button" class="confirm">تأیید</button>`;
    $_.pause(101).then(() => {
      // debugger;
      this.modalBody
        .querySelector("#student_list_payment_modal_accept_payment_button")
        .addEventListener("click", async () => {
          // console.log(_that.state.json);

          const serverFormatedJson = [];
          for (let i in _that.state.json) {
            serverFormatedJson.push({ ..._that.state.json[i] });
            for (let item of serverFormatedJson[i].data) {
              // console.log(key);
              const mutatedStatus = item.status.map((status) => {
                const {
                  productPrice,
                  hasBeenPaid,
                  hasAnOrder,
                  paidByCenter,
                  ...rest
                } = status;
                return rest;
              });
              // console.log(mutatedStatus);
              delete item.status;
              item.status = mutatedStatus;
            }
          }
          // console.log(serverFormatedJson);
          // debugger;
          const res = await axios.post(
            `/api/School/UpdateStudentPaymentType`,
            serverFormatedJson,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          // console.log(res);
          if (res.status === 200)
            if (res.data === true) {
              logify({}, "اعمال تغییرات موفقیت آمیز بود");
            } else {
              logify({ status: "warning" }, "اشکال در ثبت تغییرات");
            }
          this.modal.hide();
        });
    });
  }
  // }

  _renderGradeTable(gradeInfo) {
    console.log('gradeInfo');
    console.log(gradeInfo);
    const { gradeFieldCaption, gradeFieldId, orderSettings } = gradeInfo;
    const gradeData = new Map();
    const invoiceData = { ...emptyInvoiceTemplate };
    const headerRowMarkup = [` <div class="header-row">`];

    const IsPack = gradeInfo.orderSettings.some(row =>
        row.productToAssign.some(product =>
            String(product.testNo).endsWith("99")
        )
    );

    const headerRowExamListMarkup = [`<div class="exam-list ${IsPack ? "pack" : ""}">`];

    const ordersMarkup = [
      `<ol data-student-payment-refer-root-grade-field-id="${gradeFieldId}" 
        class="student-list custom">`,
    ];



    var hasQuestionary = 0; // to keep examId of special quiz type 8 outside foreach for renering
    orderSettings.forEach((order, i) => {
      const {
        amount,
        productToAssign,
        remainingBalance,
        rowNo,
        studentName,
        testPersonId,
      } = order;

      const ordersProductsMarkup = [];
      const learningAssessmentMarkup = [];

      let hasToggler = false;

      productToAssign.forEach((product, j) => {
        // create markup and state helper objects
        const {
          examId,
          hasAnOrder,
          hasBeenPaid,
          isBridgeScience,
          productCaption,
          productType,
          productPrice,
          requestToPay,
          paidByCenter,
          testNo,
        } = product;
        if (j === 0) {
          gradeData.set(testPersonId, [
            {
              examId,
              requestToPay,
              productPrice,
              hasBeenPaid,
              hasAnOrder,
              paidByCenter,
            },
          ]);
          // if (requestToPay) console.log(productPrice);
          invoiceData.payables.set(
            testPersonId,
            requestToPay ? Number(productPrice) : 0
          );
          invoiceData.paid.set(
            testPersonId,
            hasBeenPaid && requestToPay ? Number(productPrice) : 0
          );
          invoiceData.remain.set(
            testPersonId,
            hasBeenPaid === false && requestToPay ? Number(productPrice) : 0
          );
        } else {
          gradeData.set(testPersonId, [
            ...gradeData.get(testPersonId),
            {
              examId,
              requestToPay,
              productPrice,
              hasBeenPaid,
              hasAnOrder,
              paidByCenter,
            },
          ]);
          invoiceData.payables.set(
            testPersonId,
            requestToPay
              ? productPrice + invoiceData.payables.get(testPersonId)
              : invoiceData.payables.get(testPersonId)
          );
          invoiceData.paid.set(
            testPersonId,
            hasBeenPaid && requestToPay
              ? productPrice + invoiceData.paid.get(testPersonId)
              : invoiceData.paid.get(testPersonId)
          );
          invoiceData.remain.set(
            testPersonId,
            hasBeenPaid === false && requestToPay
              ? productPrice + invoiceData.remain.get(testPersonId)
              : invoiceData.remain.get(testPersonId)
          );
        }

        if (requestToPay) {
          invoiceData.allRequestToPay += productPrice;
          if (hasBeenPaid) invoiceData.amountPaid += productPrice;
        }

        if (productType === 1)
          ordersProductsMarkup.push(`
          <div data-student-payment-refer-node-exam-id="${examId}"
          
          class="exam 
          ${isBridgeScience ? "sience-sep" : ""} ${
            hasBeenPaid || paidByCenter ? "paid-order presist-select" : ""
          } ${hasAnOrder ? "" : "not-selected-top-pay"}
          ${requestToPay ? "selected" : ""}
          ">
                       <span>${productCaption}</span>
                       ${
                         hasBeenPaid
                           ? `<img src="/dist/assets/sactivity/paid.svg" uk-tooltip="title: پرداخت توسط دانش‌آموز">`
                           : paidByCenter
                           ? `<img src="/dist/assets/sactivity/paid-by-school.svg" uk-tooltip="title: پرداخت توسط مدرسه">`
                           : ""
                       }
                     </div>
          `);

        if (productType === 4)
          learningAssessmentMarkup.push(`<div data-student-payment-refer-node-exam-id=${examId}
             data-student-payment-refer-node-exam-price="${productPrice}" 
             class="exam ${isBridgeScience ? "sience-sep" : ""} ${
            hasBeenPaid || paidByCenter ? "paid-order presist-select" : ""
            // hasBeenPaid ? "paid-order" : ""
          } ${hasAnOrder ? "" : "not-selected-top-pay"}
            ${requestToPay ? "selected" : ""}
            ">
                         <span></span>
                         ${
                           hasBeenPaid
                             ? `<img src="/dist/assets/sactivity/paid.svg" uk-tooltip="title: پرداخت توسط دانش‌آموز">`
                             : paidByCenter
                             ? `<img src="/dist/assets/sactivity/paid-by-school.svg" uk-tooltip="title: پرداخت توسط مدرسه">`
                             : ""
                         }
                       </div>
            `);

        if (!hasToggler && productType === 1) {
          headerRowExamListMarkup.push(
            `<div data-student-payment-refer-toggler-exam-id="${examId}">
              <span data-student-payment-refer-toggler-exam-id-enable="true"></span>
              <span data-student-payment-refer-toggler-exam-id-enable="false"></span>
            </div>`
          );

          hasToggler = true;
        }

        if (productType === 4 && hasAnOrder) {
          hasQuestionary = examId;
        }
      });

      ordersMarkup.push(`   
               <li class="row" data-student-payment-refer-test-person-id="${testPersonId}">
                 <span class="student-name">${studentName}</span>
                 <div class="exam-list">
                   ${ordersProductsMarkup.join("")}
                 </div>
                 <div class="learning-assessment">
                 ${learningAssessmentMarkup.join("")}
                 </div>
                 <div class="payable-amount">${$_.toReadableDigit(
                   invoiceData.payables.get(testPersonId)
                 )}</div>
                 <div class="remain">${$_.toReadableDigit(
                   invoiceData.remain.get(testPersonId)
                   //  invoiceData.payables.get(testPersonId) -
                   //    invoiceData.paid.get(testPersonId)
                 )}</div>
               </li>
           `);

      if (i === 0) {
        // generate header's togglers for each exam column
        headerRowExamListMarkup.push("</div>");
        headerRowMarkup.push(headerRowExamListMarkup.join(""));
      }
    });

    ordersMarkup.push("</ol>");

    headerRowMarkup.push(`
                <div  ${
                  hasQuestionary === 0
                    ? `style="opacity: 0; pointer-events: none; user-select: none"`
                    : ``
                } class="learning-assessment">
                 <div data-student-payment-refer-toggler-exam-id="${hasQuestionary}">
                    <span data-student-payment-refer-toggler-exam-id-enable="true"></span>
                    <span data-student-payment-refer-toggler-exam-id-enable="false"></span>
                  </div>
               </div>						
               <div class="payable-amount">قابل پرداخت<span>(ريال)</span></div>
               <div class="remain">مانده<span>(ريال)</span></div>
             </div>`);

    if (this.state.initialRender) {
      this.state.grades.push({ gradeFieldId, gradeData });
      this.state.invoice.push({ gradeFieldId, ...invoiceData });
    }
    return [...headerRowMarkup, ...ordersMarkup].join("");
  }

  updateInvoice(gradeFieldId, testPersonId = null) {
    const row = this.state.invoice.filter(
      (gradeInvoice, i) => gradeInvoice.gradeFieldId === gradeFieldId
    )[0];

    const rowElement = this.modalBody.querySelector(
      `[data-student-payment-refer-test-person-id="${testPersonId}"]`
    );
    // console.log(rowElement);
    rowElement.querySelector(".payable-amount").innerHTML = $_.toReadableDigit(
      row.payables.get(testPersonId)
    );
    rowElement.querySelector(".remain").innerHTML = $_.toReadableDigit(
      row.remain.get(testPersonId)
    );
    let totalPayableAmount = this.state.invoice.reduce(function (acc, obj) {
      // console.log(obj);
      return acc + obj.allRequestToPay;
    }, 0);
    let totalPaid = this.state.invoice.reduce(function (acc, obj) {
      return acc + obj.amountPaid;
    }, 0);
    this.summaryContainer.querySelector(".selected-amount>span").innerHTML =
      $_.toReadableDigit(totalPayableAmount);
    this.summaryContainer.querySelector(".paid-amount>span").innerHTML =
      $_.toReadableDigit(totalPaid);
    // updatedStatus.push(status);
  }
};
export default ReferPaymentModal;
