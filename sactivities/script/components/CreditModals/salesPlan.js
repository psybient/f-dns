import UIkit from "uikit";
import { $_ } from "../../../../common/utils/create.dom";
import axios from "axios";
class SalesPlan {
  constructor(props) {
    this.state = {
      data: null,
      hasPlan: false,
      hasApprovedPlan: false,
      approvedPlanIndex: -1,
    };
    this.responseTextArray = [
      "اشکال در بازیابی",
      "درخواستی ندارد",
      "در حال بررسی",
      "رد شده",
      "تایید شده",
    ];
    this.accordionComponent = null;
    this.accordionWrapper = null;
    this.accordionContent = null;
    this.accordionRequest = null;
    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    // this.accordionWrapper = document.getElementById(
    //   "sales_plan_accordion_wrapper"
    // );
    // await this.fetchAndUpdateState();

    // if (this.state.hasPlan) {
    this.accordionComponent = document.getElementById(
      "sales_plan_accordion_component"
    );
    this.accordionContent = document.getElementById(
      "sales_plan_accordion_content"
    );
    this.accordionRequest = document.getElementById(
      "sales_plan_accordion_content_requests"
    );
    //   this.render();
    //   console.log(this.state);
    // } else {
    //   this.accordionComponent.setAttribute("hidden", true);
    // }

    return this;
  }

  async fetchAndUpdateState() {
    const planListRes = await axios.get("/api/School/GetSponsorGroups");
    // console.log(planListRes.data);
    if (planListRes.status === 200) {
      delete this.state.data;
      if (planListRes.data.length > 0) {
        this.state.data = planListRes.data;
      } else this.state.data = [];
      if (this.state.data.length > 0) {
        // this.state.data[this.state.data.length - 1].requestStatus = 4; //psy should remove
        let approvedPlanIndex = -1;
        const approvedPlan = this.state.data.filter((plan, i) => {
          if (plan.requestStatus === 4) {
            approvedPlanIndex = i;
            return true;
          }
        });

        if (approvedPlan.length > 0) {
          this.state.hasApprovedPlan = true;
          this.state.approvedPlanIndex = approvedPlanIndex;
        }
        // const hasPlan = this.state.data.some(
        //   (plan) => plan.requestStatus === 1
        // );
        this.state.hasPlan = true;
      } else {
        this.accordionComponent.setAttribute("hidden", true);
        this.state.hasPlan = false;
      }
    }
  }

  async render(hard = false) {
    if (hard) {
      $_.removeElementChildNodes(this.accordionContent);
      $_.removeElementChildNodes(this.accordionRequest);
      await this.fetchAndUpdateState();
    }

    // console.log("rendering");
    const orginazationsMarkup = [];
    const orginazationsRequestMarkup = [];
    this.state.data.forEach((plan) => {
      this.accordionContent.classList.add(`organ-switch_${plan.groupId}`);
      this.accordionRequest.classList.add(`organ-switch_${plan.groupId}`);

      orginazationsMarkup.push(`
            <div data-orginazation-join-group-id="${plan.groupId}" class="organization" uk-toggle="target: .organ-switch_${plan.groupId} ; animation: uk-animation-fade">
                <img class="logo" src="${plan.logoAddress}" alt="عکس نهاد"/>
                <span class="title">${plan.groupName}</span>
			</div>
        `);
      orginazationsRequestMarkup.push(`
      <div id="organ-switch_${
        plan.groupId
      }" class="request-container organ-switch_${plan.groupId}" hidden>

            <div class="organization">
                <img class="logo"src="${plan.logoAddress}" alt=""/>
                <span class="title">${plan.groupName}</span>
                <button data-orginazation-remove-group-id="${
                  plan.groupId
                }" type="button" uk-toggle="target: .organ-switch_${
        plan.groupId
      } ; animation: uk-animation-fade" uk-tooltip="title: حذف درخواست" uk-close></button>
            </div>
            <div class="request">
                <div>عضويت در طرح اعتباري ${plan.groupName}</div>
                <div class="plan-status-text-container_${plan.groupId}">${
        this.responseTextArray[plan.requestStatus]
      }</div>
        </div>
        </div>
  
    `);
    });
    this.accordionContent.innerHTML = orginazationsMarkup.join("");
    this.accordionRequest.innerHTML = orginazationsRequestMarkup.join("");
    await $_.pause(101);

    this.state.data.forEach((plan, i) => {
      const removeBtn = this.accordionRequest.querySelector(
        `[data-orginazation-remove-group-id="${plan.groupId}"]`
      );

      const joinBtn = this.accordionContent.querySelector(
        `[data-orginazation-join-group-id="${plan.groupId}"]`
      );

      const requestStatusTextNode = this.accordionRequest.querySelector(
        `.plan-status-text-container_${plan.groupId}`
      );
      if (plan.requestStatus == 2 || plan.requestStatus == 3) {
        if (removeBtn)
          removeBtn.addEventListener("click", async () => {
            const resText = await this.callStatusHandlerApi(plan.groupId, 1);
            //   console.log(resText);
            //   joinBtn.classList.remove("uk-invisible");
            this.state.data[i].requestStatus = 1;
            requestStatusTextNode.innerHTML = this.responseTextArray[1];
          });
        // joinBtn.classList.add("uk-invisible");
      }

      if (plan.requestStatus !== 2 && plan.requestStatus !== 4) {
        // removeBtn.setAttribute("hidden", true);
        if (joinBtn)
          joinBtn.addEventListener("click", async () => {
            const resText = await this.callStatusHandlerApi(plan.groupId, 2);
            //   console.log(resText);
            removeBtn.removeAttribute("hidden");
            this.state.data[i].requestStatus = 2;
            requestStatusTextNode.innerHTML = this.responseTextArray[2];
          });
      }

      if (plan.requestStatus == 4) {
        document
          .getElementById("wallet-sign")
          .setAttribute("src", plan.logoAddress);
      }

      // show organization that requestStatus not equal to 1
      if (plan.requestStatus !== 1) {
        this.accordionContent.setAttribute("aria-hidden", "true");
        this.accordionContent.setAttribute("hidden", "");
        this.accordionRequest.setAttribute("aria-hidden", "false");
        this.accordionRequest.removeAttribute("hidden");

        const selectedOrganization = document.getElementById(
          "organ-switch_" + plan.groupId
        );
        selectedOrganization.setAttribute("aria-hidden", "false");
        selectedOrganization.removeAttribute("hidden");
      }
      if (this.state.hasApprovedPlan) removeBtn.setAttribute("hidden", true);
    });
  }

  async callStatusHandlerApi(groupId, status = 1) {
    // const
    const handleStatusResponse = await axios.get(
      `/api/School/SetSponsorGroups?groupId=${groupId}&statusId=${status}`
    );
    // console.log(handleStatusResponse);
    // if (handleStatusResponse !== 200) return 0;
    return this.responseTextArray[
      handleStatusResponse.status === 200 ? handleStatusResponse.data : 0
    ];
  }
}
export default SalesPlan;
