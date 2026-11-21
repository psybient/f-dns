import _fetch from "../../../common/_Fetch";
import { $_ } from "../../../common/utils/create.dom";
import { logify } from "../../../common/utils/ukHelper";
import _ from "lodash";
// import * as UIkit from "uikit";
import { compareValues } from "../../../common/utils/compareValues";
import OnlineTestDetail from "../components/OnlineTestDetail";
import { downloadBlob } from "../../../common/utils/downloadBlob";
import diff from "diff-arrays-of-objects";
import axios from "axios";
import { DescriptiveExamView } from "./descriptive.exam.view";
const apis = {
  app: {
    getAppOnlineTestGroup: {
      url: "/api/School/GetAppOnlineTestGroup",
    },
    updateExamStartTime: {
      url: "/api/School/UpdateExamStartTime",
    },
    getAppOnlineTestDetail: {
      url: "/api/School/GetAppOnlineTestDetail",
    },
    getSchoolReport: {
      url: `/api/School/GetSchoolReport`,
    },
  },
};

export default (function () {
  async function intervalRegisteredListUpdaterCallbck() {
    const examId = this.state.activeExamId;
    const li = document.getElementById(`examContainer_${examId}`);

    if (li.classList.contains("uk-open")) {
      const model = [...this.data].filter((exam) => exam.examId === examId)[0];
      const data = await this.__fetch("app", "getAppOnlineTestDetail", {
        GradeFieldId: model.gradeFieldId,
        examId: examId,
      });
      let diffObject = diff(this.state.list, data, "testPersonId");
      //console.log(diffObject)
      if (this.state.list.length !== diffObject.same.length) {
        this.updateList(data);
        this.updateDom(model);
      }
    }
  }

  return {
    state: {
      activeExamId: 0,
      autoSync: true,
      renderedQuizes: [],
      searchPhrase: new Map(),
      list: [],
      sortSettings: { prop: "none", order: "asc" }, //ASC// desc
    },
    data: null,
    __fetch: null,
    container: null,
    updateList: function (data) {
      //console.log(data)
      this.state.list.length = 0;
      this.state.list = [];
      this.state.list = [...data];
    },
    updateDom: function (model) {
      const _that = this;
      const container = document.getElementById(
        `regularExamContent_${model.examId}`,
      );
      const list = [];
      const searchPhrase = this.state.searchPhrase.get(model.examId);
      if (searchPhrase !== "") {
        this.state.list.map((d) => {
          if (d.studentName)
            if (d.studentName.search(searchPhrase) > -1) list.push(d);
        });
      }
      if (
        list.length === 0 &&
        this.state.searchPhrase.get(model.examId) === ""
      ) {
        this.state.list.forEach((item) => list.push(item));
      }
      //console.log(list)
      var markup = "";

      if (this.state.sortSettings.prop === "none")
        markup = OnlineTestDetail(model, list);
      else {
        const { prop, order } = this.state.sortSettings;
        const sortedList = [...list];
        sortedList.sort(compareValues(prop, order));
        markup = OnlineTestDetail(model, sortedList);
      }
      $_.removeElementChildNodes(container);
      container.innerHTML = markup;
    },
    render: function () {
      const _that = this;
      let markupArray = [];
      this.data.forEach((model) => {
        const {
          centerHeadGradeId,
          centerId,
          examCaption,
          examId,
          examShamsiDate,
          examTime,
          gradeFieldCaption,
          gradeFieldId,
          registeredCount,
          remainingDays,
        } = model;
        //console.log(examId)

        this.state.searchPhrase.set(examId, ""); // Init search structure
        const inputValue =
          parseInt(examTime.substring(0, 2) * 60) +
          parseInt(examTime.substring(3, 5));
        markupArray.push(`
            <li id="examContainer_${model.examId}"
                class="regular-exam-accordion-container">
            
                <a data-exam-accordion-title="${examId}" class="uk-accordion-title uk-inline" href="#">
                    <div class="grade-name">${gradeFieldCaption}</div>
                </a>
                        <div class="exam-time">
                            <div>
                                <div>زمان برگزاری آزمون در اپلیکیشن</div>
                                <span id="examTimeValue_${examId}">${examTime
                                  .split(":", 2)
                                  .join(":")}</span>
                                <input  class="js-range-input" type="range" value="${inputValue}" min="600" max="960" step="10" 
                                data-time-input="${examId}"
                                data-center-head-grade-id="${centerHeadGradeId}"
                                data-grade-field-id="${gradeFieldId}"
                                oninput="this.previousElementSibling.innerHTML = parseInt(this.value/60)+':'+(this.value%60 == 0 ? '00': this.value%60)">
                            </div>
                        </div>
                        
                        <div class="registered-count">
                            <a class="js_registeredStudentsForExam" 
                            uk-tooltip="title:دانلود فايل اطلاعات دانش‌آموزان قابل چاپ روي پاسخ‌برگ خام آزمون حضوري; offset: 25" 
                            
                            data-exam-id="${examId}" >
                                <div>ثبت‌نامی <br><span>${registeredCount}</span> دانش‌آموز</div>
                                <svg class="question-circle"><use xlink:href="#answer-sheet" x="0"  y="0"/></svg>
                                <span class="uk-spinner" uk-icon="icon: cog; ratio: 1.5" style="display: none"></span>
                            </a>
                        </div>
                        <div class="date-information">
                            <div>
                                <span>${examCaption}</span>
                                <span>${examShamsiDate}</span>
                                <div>
                                    <span>${
                                      remainingDays === 0
                                        ? ``
                                        : Math.abs(remainingDays)
                                    }</span>
                                    <span style="transform: translateY(-${
                                      remainingDays === 0 ? 150 : 0
                                    }%);">
                                            ${
                                              remainingDays < 0
                                                ? `روز گذشته`
                                                : remainingDays === 0
                                                  ? `روز برگزاری`
                                                  : `روز مانده`
                                            }
                                    <span>
                                </div>
                            </div>
                    </div>	
                    <div  class="uk-accordion-content">
                    <table>
                    <colgroup>
                        <col>
                        <col>
                        <col>
                        <col>
                        <col>
                        <col>
                        <col>
                    </colgroup>
                
                    <thead>
                        <tr>
                            <th>وضعيت</th>
                            <th>
                                <span class="uk-form-icon" uk-icon="icon: search"></span>
                                <input class="search_input" 
                                data-exam-id="${examId}" type="text" placeholder="نام و نام خانوادگي">
                            </th>
                            <th>كلاس
                                <button data-sort-property="classNo"
                                data-exam-id="${examId}"
                                data-sort-order="asc"></button>
                            </th>
                            <th>زمان شروع
                                <button data-sort-property="startDate"
                                data-exam-id="${examId}"
                                data-sort-order="asc"></button>
                            </th>
                            <th>زمان پايان
                                <button data-sort-property="finishDate"
                                data-exam-id="${examId}"
                                data-sort-order="asc"></button>
                            </th>
                            <th>همگام‌سازی</th>
                            <th>تماس</th>
                        </tr>
                    </thead>
                    <tbody id="regularExamContent_${model.examId}" >
                    
                    </tbody>
                </table>
            </div>

        </li>`);
      });

      this.container.innerHTML = markupArray.join("");

      $_.pause(0).then(() => {
        //init Time inputs
        const inputs = [...this.container.querySelectorAll(".js-range-input")];
        //console.log(inputs)
        if (inputs.length) {
          inputs.forEach((input) => {
            const examId = _.toNumber(input.dataset.examTime);
            const centerHeadGradeId = _.toNumber(
              input.dataset.centerHeadGradeId,
            );
            const gradeFieldId = _.toNumber(input.dataset.gradeFieldId);

            input.addEventListener("change", async (e) => {
              let timeValue =
                _.parseInt(input.value / 60) +
                ":" +
                (input.value % 60 == 0 ? "00" : input.value % 60);
              //.log(timeValue)
              const result = await this.__fetch("app", "updateExamStartTime", {
                centerHeadGradeId: centerHeadGradeId,
                gradeFieldId: gradeFieldId,
                startTime: timeValue,
              });
              if (result) {
                logify({ timeout: "1500" }, `زمان به ${timeValue} تغییر یافت`);
              } else logify({}, "مشکل در ثبت درخواست");

              //console.log(result)
            });
          });
        }

        const getDownloadableContent = (options) =>
          new Promise(async function (resolve, reject) {
            //console.log(options)
            const { internalExamId, requestType, reportType } = options;

            try {
              await axios({
                method: "post",
                url: `/api/School/GetSchoolReport?internalExamId=${internalExamId}&requestType=${requestType}&reportType=26`,
                responseType: "blob",
                timeout: 600 * 10000,
                config: { headers: { "Content-Type": "multipart/form-data" } },
              }).then((result) => {
                const url = window.URL.createObjectURL(new Blob([result.data]));
                resolve(
                  downloadBlob(
                    url,
                    "report-" + new Date().getTime() + `.${requestType}`,
                  ),
                );
              });
            } catch (err) {
              console.log(err);
            }
          });

        const registeredStudentListDownloadLinks = [
          ...this.container.querySelectorAll(".js_registeredStudentsForExam"),
        ];
        registeredStudentListDownloadLinks.forEach((btn) => {
          btn.addEventListener("click", () => {
            btn.classList.add("generating-report");
            const options = {};
            options.internalExamId = btn.dataset.examId;
            options.requestType = "pdf";
            options.ReportType = 26;
            try {
              getDownloadableContent(options).then((res) => {
                //console.log(res)
                $_.pause(100).then(() =>
                  btn.classList.remove("generating-report"),
                );
              });
            } catch (err) {
              console.log(err);
            }
          });
        });

        // Init accordions
        const accordionTitles = [
          ...this.container.querySelectorAll("[data-exam-accordion-title]"),
        ];
        if (accordionTitles.length > 0) {
          accordionTitles.forEach((aTag) => {
            const examId = _.toNumber(aTag.dataset.examAccordionTitle);
            aTag.addEventListener("click", () => {
              this.renderContent(examId && examId !== NaN ? examId : 0);
            });
          });
        }
        const searchInputs = [
          ...this.container.querySelectorAll(".search_input"),
        ];
        if (searchInputs.length > 0) {
          searchInputs.forEach((input) => {
            const examId = _.toNumber(input.dataset.examId);
            const model = [...this.data].filter(
              (exam) => exam.examId === examId,
            )[0];
            input.addEventListener("input", (e) => {
              e.preventDefault();
              this.state.searchPhrase.set(examId, input.value);
              this.updateDom(model);
            });
          });
        }

        const buttons = [...this.container.querySelectorAll("button")];
        buttons.forEach((button) => {
          const examId = _.toNumber(button.dataset.examId);
          let prop = button.dataset.sortProperty;
          //let order = button.dataset.sortOrder;
          if (this.state.sortSettings.prop === prop)
            button.dataset.order === this.state.sortSettings.order;
          button.addEventListener("click", (e) => {
            this.state.sortSettings.prop = prop;
            if (this.state.sortSettings.order === "asc") {
              this.state.sortSettings.order = "desc";
            } else this.state.sortSettings.order = "asc";
            const model = [...this.data].filter(
              (exam) => exam.examId === examId,
            )[0];
            // debugger
            this.updateDom(model);
          });
        });
      });
    },
    renderContent: async function (examId) {
      this.state.activeExamId = examId;
      if (!this.state.renderedQuizes.includes(examId)) {
        this.state.renderedQuizes.push(examId);
        const model = [...this.data].filter(
          (exam) => exam.examId === examId,
        )[0];

        const data = await this.__fetch("app", "getAppOnlineTestDetail", {
          GradeFieldId: model.gradeFieldId,
          examId: examId,
        });
        this.updateList(data);
        this.updateDom(model);
      }
    },
    init: async function () {
      this.__fetch = _fetch(apis);
      this.data = await this.__fetch("app", "getAppOnlineTestGroup");
      let emptyExamHistoryHandler = document.getElementById(
        "exam_history_none_empty_text_regular",
      );
      // let emptyExamHistoryText = document.getElementById(
      //   "exam_history_empty_text_regular",
      // );

      if (this.data.length > 0) {
        this.container = document.getElementById("regularExam_container");
        this.render();
        this.renderContent(this.data[0].examId);

        setInterval(intervalRegisteredListUpdaterCallbck.bind(this), 10000);

        emptyExamHistoryHandler.removeAttribute("hidden");
      } else {
        emptyExamHistoryHandler.setAttribute("hidden", "true"); // emptyExamHistoryHandler.style.display = "none";
      }
      const descView = new DescriptiveExamView({
        hasTestyData: this.data.length,
      });
      return this;
    },
  };
})();
