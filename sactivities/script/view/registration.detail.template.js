import { $_ } from "../../../common/utils/create.dom";
import axios from "axios";
import { logify } from "../../../common/utils/ukHelper";
import { ToggleRegistrationLoader } from "./registration.view";
export default class RegDetailTemplate {
  constructor(data) {
    this.props = {
      data: data,
      el: document.querySelector(".registration_status-conteiner"),
    };
    $_.removeElementChildNodes(this.props.el);
    this.props.el.innerHTML = `<div class="reloadDouble uk-position-center"></div>`;
  }

  _getTableId(id) {
    return "registration_table_" + id;
  }

  _getLiId(id) {
    return "registration_form_" + id;
  }

  getTab(id) {
    return document.getElementById("report_item_" + id);
  }
  async Render() {
    var tmplStr = [];
    const item = { id: 1 };
    tmplStr.push(`<table id="registration_status_table" class="alarm-table">
            <colgroup>
                        <col><col><col><col>
            </colgroup>
    <thead>
      <tr class="alarm-text">
        <td>پايه/رشته</td>
        <td>ثبت‌نامي</td>
        <td>تكميل‌شده</td>
        <td>تأييد</td>
      </tr>
    </thead>
    <tbody>`);

    this.props.data.map((v) => {
      const { entrd, headGradeCaption, headGradeId, registeredCount, stat } = v;
      tmplStr.push(`
    <tr class="${stat === 1 ? "confirmed-row" : ""} alarm-text">
        <td>${headGradeCaption}</td>
        <td><span id="studentCount_${headGradeId}" >${registeredCount}</span>
        
        </td>
        <td>${entrd}</td>
        <td>
          <span id="rowStatusIcon_${headGradeId}"> ${
        stat === 0
          ? `<a uk-icon="icon:close; ratio: 0.5" class="uk-icon">
                <svg width="10" height="10" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" data-svg="close"><path fill="none" stroke="#000" stroke-width="1.06" d="M16,16 L4,4"></path><path fill="none" stroke="#000" stroke-width="1.06" d="M16,4 L4,16"></path></svg>
                </a>`
          : `<a uk-icon="icon:check; ratio: 1.3" class="uk-icon">
                  <svg width="26" height="26" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" data-svg="check"><polyline fill="none" stroke="#000" stroke-width="1.1" points="4,10 8,15 17,4"></polyline></svg></a>`
      }
          </span>
            <button id="updateStudentCountButton_${headGradeId}" hidden class="confirm-add-1">ثبت</button>
        </td>
      </tr>
      `);
    });

    tmplStr.push(`</tbody>  </table>`);
    await this.setInnerHtml(this.props.el, tmplStr.join(""));
    const buttons = [
      ...this.props.el.querySelectorAll("[data-grade-field-id]"),
    ];
    let activeStatus = new Array(buttons.length);
    //activeStatus.forEach((el, i) => activeStatus[i] = false);
    buttons.forEach((button, i) => {
      // var isInit = activeStatus[i];//false;
      const gradeFieldId = button.dataset.gradeFieldId;
      const rowStatusIcon = this.props.el.querySelector(
        `#rowStatusIcon_${gradeFieldId}`
      );
      const valueRepresentor = this.props.el.querySelector(
        `#studentCount_${gradeFieldId}`
      );
      const submitNewCountButton = this.props.el.querySelector(
        `#updateStudentCountButton_${gradeFieldId}`
      );
      const handleStudentCountSubmit = async () => {
        ToggleRegistrationLoader(true);
        //try {
        const status = await axios.post(
          `/api/School/SubmitOrder?gradeFieldId=${gradeFieldId}&studentCount=${valueRepresentor.innerHTML}`
        );

        if (status && status.data) {
          location.reload();
        } else {
          logify({}, "سال جاری را انتخاب فرمایید");
          rowStatusIcon.removeAttribute("hidden");
          valueRepresentor.innerHTML =
            parseFloat(valueRepresentor.innerHTML) - 1;
          submitNewCountButton.setAttribute("hidden", true);
        }

        setTimeout(() => ToggleRegistrationLoader(false), 200);
      };

      const handleStudentCountChange = () => {
        submitNewCountButton.removeAttribute("hidden");
        rowStatusIcon.setAttribute("hidden", true);
        if (activeStatus[i] == undefined) {
          submitNewCountButton.addEventListener(
            "click",
            handleStudentCountSubmit
          );
          activeStatus[i] = true;
          //console.log(activeStatus[i])
        }
        valueRepresentor.innerHTML = parseFloat(valueRepresentor.innerHTML) + 1;
      };

      button.addEventListener("click", handleStudentCountChange);
    });
  }

  async setInnerHtml(el, html) {
    return new Promise((resolve) => {
      el.innerHTML = html;
      return setTimeout(() => resolve(), 0);
    });
  }
}
