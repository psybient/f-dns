import { $_ } from "../../../../common/utils/create.dom";
import axios from "axios";
import UIkit from "uikit";
import { logify } from "../../../../common/utils/ukHelper";
// import CreditManager from "./creditManager";
class OrderCredit {
  constructor(props) {
    this.successfulCallback = props.successfulCallback;
    this.creditManager = props.creditManager;
    this.state = {
      examId: props.examId,
      balance: 0,
      hasCredit: false,
      packageInfo: [],
      purchaseStatus: false,
    };

    this.modal = null;
    this.modalContent = null;
    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    this.modal = document.getElementById("orderCreditModal");
    this.modalContent = this.modal.querySelector("#orderCreditModal_content");
    const packageInfoData =
      await axios.get(`/api/FreelanceTeacher/GetSubscriptionPackages?examId=${this.state.examId}
    `);
    // console.log(packageInfoData);
    if (packageInfoData.status === 200) {
      this.state.packageInfo = packageInfoData.data;
    }
    return this;
  }

  render() {
    $_.removeElementChildNodes(this.modalContent);
    this.modalContent.innerHTML = this.state.packageInfo
      .map((info) => {
        return `<div class="order-column">
        <p class="type">${info.caption}</p>
        <p class="price">${info.price} <span>تومان</span></p>
        <ul>
        ${info.description
          .split(";")
          .map((item) => `<li>${item}</li>`)
          .join("")}
        </ul>
        <button data-package-product-id="${
          info.productId
        }" data-is-credit-sufficient="${
          info.orderStatus
        }" class="complete-corder orderdone_${info.productId}" ${
          info.orderStatus
            ? `uk-toggle="target: .orderdone_${info.productId}`
            : ""
        }">${info.orderStatus ? "سفارش" : "شارژ کیف پول"}</button>
        <svg class="checkmark orderdone_${
          info.productId
        }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" hidden>
            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        <p class="wallet-balance-${
          info.orderStatus ? "enought" : "insufficient"
        }">موجودي كيف پول ${info.walletAmount} تومان</p>
    </div>`;
      })
      .join("");

    const purchaseButtons = this.modal.querySelectorAll(
      "[data-package-product-id]"
    );
    purchaseButtons.forEach((button) => {
      let productId = button.dataset.packageProductId;
      button.addEventListener("click", async () => {
        const isCreditSufficient =
          button.dataset.isCreditSufficient === "false" ? false : true;
        // console.log(isCreditSufficient);
        if (isCreditSufficient) {
          const purchasePackageResult = await axios.get(
            `/api/FreelanceTeacher/SubscribePackage?examId=${this.state.examId}&productId=${productId}`
          );
          // console.log(purchasePackageResult);
          if (purchasePackageResult.data === true) {
            this.creditManager.render(true);
            this.state.purchaseStatus = true;
            await $_.pause(1200);
            this.showModal(true);
            await this.successfulCallback(this.state.examId);
          } else {
            this.state.purchaseStatus = false;
            logify({ status: warning }, "اشکال در خرید بسته");
          }
        } else {
          //   const creditManager = await new CreditManager().ready();
          //   creditManager.render();
          //   console.log(creditManager);
          localStorage.setItem("quizmaker_tab", this.state.examId);
          this.creditManager.showModal();
          // axios.get(`/api/FreelanceTeacher/LoadWalletInfo`);
        }
      });
    });
  }

  showModal(hide = false) {
    if (hide) UIkit.modal(this.modal).hide();
    else UIkit.modal(this.modal).show();
  }
}

export default OrderCredit;
