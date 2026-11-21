import ClassItem from "./Atoms/ClassItem";
import LessonBoxItem from "./Atoms/LessonBoxItem";
import { $_ } from "../../../../common/utils/create.dom";
import contentSelector from "./Atoms/contentSelectorComponent";
import moment from "moment-jalaali";
import DualDateInput from "./Atoms/DualDateInput";
import * as axios from "axios";
import StudyUnitItem from "./Atoms/StudyUnitItem";
import StudyUnitHeader from "./Atoms/StudyUnitHeader";
import { compareValues } from "../../../../common/utils/compareValues";
import { logify } from "../../../../common/utils/ukHelper";
import _ from "lodash";
import "@majidh1/jalalidatepicker";
import { downloadBlob } from "../../../../common/utils/downloadBlob";
//import yearComponentReference from '../../sactivities'
const now = moment();

const jYear = now.jYear();
const jMonth = now.jMonth() + 1; // jMonth is 0-based

const schoolYear = jMonth < 7 ? jYear - 1 : jYear;

const initSchoolDate = moment(`${schoolYear}/07/01`, "jYYYY/jMM/jDD").format(
  "jYYYY/jMM/jDD"
);
const m = now.format("jYYYY/jMM/jDD");

const baseComponents = [
  "contentSelector",
  "classList",
  "dateRange",
  "lessonItemList",
  "studyUnitHeader",
];

const initialState = {
  //contentSelector: { value: 4, checkboxes: [{ type: "regularQuize", checked: true }, { type: "selfValuation", checked: true }] },
  fromDate: initSchoolDate,
  toDate: m,
  classList: [],
  lessonItemList: 0,
  sortSettings: { prop: "none", order: "asc" }, //ASC// desc
};

const prefix = "testReport_";

export const studentReportModal = {
  _modals: new Map(),

  __removeAllChildNodes: (parent) => {
    if (parent)
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
  },
  getDownloadableContent: (options) =>
    new Promise(function (resolve, reject) {
      const {
        gradeFieldId,
        examType,
        gradeLessonDetailId,
        fromDate,
        toDate,
        classList,
        id,
        reportTyp,
      } = options;
      const requestType = "pdf";
      //const reportEndpoint =
      let url = `/api/School/Get${reportTyp}ReportBaseOnStudyUnit?examTypeId=${examType}&gradeFieldId=${gradeFieldId}&educationalTreeId=${id}&classNo=${classList.join(
        ","
      )}&fromDate=${fromDate}&toDate=${toDate}`;
      try {
        axios({
          method: "post",
          url: url,
          timeout: 600 * 1000,
          responseType: "blob",
          config: { headers: { "Content-Type": "multipart/form-data" } },
        })
          .then((result) => {
            const url = window.URL.createObjectURL(new Blob([result.data]));
            resolve(
              downloadBlob(
                url,
                `${reportTyp}-report-${new Date().getTime()}.${requestType}`
              )
            );
          })
          .catch((err) => {
            resolve(null);
          });
      } catch (err) {
        console.log(err);
        resolve(null);
      }
    }),
  getClassListContent: (options) =>
    new Promise(function (resolve, reject) {
      const { classNo, gradeNo } = options;
      try {
        axios({
          method: "post",
          url: `/api/School/GetSchoolStudentClassUserList?classNo=${classNo}&gradeFieldId=${gradeNo}`,
          responseType: "blob",
          config: { headers: { "Content-Type": "multipart/form-data" } },
        }).then((result) => {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          resolve(
            downloadBlob(url, "report-" + new Date().getTime() + `.xlsx`)
          );
        });
      } catch (err) {
        console.log(err);
        resolve(null);
      }
    }),
  _renderModalBody: function (data) {
    var _that = this;
    data.map((grade) => {
      const modal = document.getElementById(
        `${prefix}modal_${grade.gradeFieldId}`
      );
      if (modal != null) {
        const classes = [...grade.internalQuizInfo.classList];
        const lessons = [...grade.internalQuizInfo.lessonList];
        modal.innerHTML = _that.renderModalBody(
          grade.gradeFieldId,
          grade.caption
        );
        // Build base of each modal components
        $_.pause(0).then(() => {
          const components = baseComponents.map((component) => {
            return {
              id: component,
              container: document.getElementById(
                `${prefix}${component}_${grade.gradeFieldId}_container`
              ),
            };
          });
          // Add modal components to object instance
          _that._modals.set(grade.gradeFieldId, {
            container: modal,
            components: components,
            data: grade,
            state: {
              ...initialState,
              contentSelector: {
                value: 4,
                checkboxes: [
                  { type: "regularQuize", checked: true },
                  { type: "selfValuation", checked: true },
                ],
              },
              gradeFieldId: grade.gradeFieldId,
              classList: (() => {
                return classes.map((clas) => {
                  return { classNo: clas.classNo, checked: true };
                });
              })(),
            },
          });
        });
      }
    });
  },

  _renderModalComponents: function (modalObject) {
    // Initiate components on each modal
    const _that = this;
    const render = (modal) => {
      modal.components.forEach((component) => {
        switch (component.id) {
          case "contentSelector":
            let items = [
              { id: "selfValuation", checked: true, caption: "خودارزیابی" },
              { id: "regularQuize", checked: true, caption: "آزمون هماهنگ" },
            ];

            const contentSelectorMarkup = contentSelector({
              items: items,
              gradeFieldId: modal.data.gradeFieldId,
            });
            this.__removeAllChildNodes(component.container);
            component.container.innerHTML = contentSelectorMarkup;
            $_.pause(0).then(() => {
              const switchers = component.container.querySelectorAll("input");
              switchers.forEach((element) => {
                const type = element.dataset.type;
                element.addEventListener("change", (e) => {
                  const stateRef =
                    modal.state.contentSelector.checkboxes.filter(
                      (checkbox) => checkbox.type === type
                    )[0];
                  //stateRef.checked = stateRef.checked === true ? false : true//!stateRef.checked;
                  modal.state.contentSelector.checkboxes.forEach((checkbox) => {
                    if (checkbox.type === type)
                      checkbox.checked =
                        checkbox.checked === true ? false : true;
                  });
                  const checkedCheckboxes =
                    modal.state.contentSelector.checkboxes.filter(
                      (checkbox) => checkbox.checked
                    );
                  const countCheckedBoxes = checkedCheckboxes.length;
                  switch (countCheckedBoxes) {
                    case 0:
                      modal.state.contentSelector.value = 8;
                      break;
                    case 1:
                      if (checkedCheckboxes[0].type === "selfValuation")
                        // && type === "selfValuation")
                        modal.state.contentSelector.value = 1;
                      else if (checkedCheckboxes[0].type === "regularQuize")
                        // && type === "regularQuize")
                        modal.state.contentSelector.value = 2;
                      break;
                    case 2:
                      modal.state.contentSelector.value = 4;
                      break;
                  }
                  _that.updateStudyUnitList(modal.data.gradeFieldId);
                });
              });
            });
            return;
          case "lessonItemList":
            let lessonListArray = modal.data.internalQuizInfo.lessonList.map(
              (el) => {
                return { caption: el.caption, value: el.gradeLessonDetailId };
              }
            );
            const lessonListRangeSelect = LessonBoxItem({
              id: component.id + "_" + modal.data.gradeFieldId,
              items: lessonListArray,
              handler: (e) => {
                modal.state.lessonItemList = _.toNumber(e);
                _that.updateStudyUnitList(modal.data.gradeFieldId);
              },
              title: "درس",
            });

            component.container.innerHTML = lessonListRangeSelect.body;
            $_.pause(0).then(() => {
              let componentInnerConteiner = modal.container.querySelector(
                "#" + lessonListRangeSelect.id
              );
              _that.__removeAllChildNodes(componentInnerConteiner);
              lessonListRangeSelect.childElements.map((li) =>
                componentInnerConteiner.append(li)
              );
              //modal.state.lessonItemList = lessonListArray[0].value
            });
            return;
          case "dateRange":
            const inputs = [
              {
                id: `fromDate_${modal.data.gradeFieldId} `,
                type: "text",
                attributes: {
                  placeholder: initSchoolDate,
                  "data-jdp": "",
                  autocomplete: "off",
                  "data-modal-id": `${modal.data.gradeFieldId} `,
                  "data-date-type": "from",
                },
                className: "input-date",
              },
              {
                id: `toDate_${modal.data.gradeFieldId} `,
                type: "text",
                attributes: {
                  placeholder: m,
                  "data-jdp": "",
                  autocomplete: "off",
                  "data-modal-id": `${modal.data.gradeFieldId} `,
                  "data-date-type": "to",
                },
                className: "input-date",
              },
            ];

            DualDateInput({
              container: component.container,
              inputs: inputs,
            });

            component["dateInputs"] = inputs;
            return;
          case "classList":
            this.__removeAllChildNodes(component.container);
            let classComponents = modal.data.internalQuizInfo.classList.map(
              (clas) => ClassItem(clas, modal.data.gradeFieldId, true)
            );
            classComponents.map((cp) => (component.container.innerHTML += cp));
            $_.pause(0).then(() => {
              let classDom = component.container.querySelectorAll("input");
              classDom.forEach((element) => {
                let classNo = element.dataset.classNo;
                let stateRef = modal.state.classList
                  .slice()
                  .filter((cls) => cls.classNo == classNo)[0];
                element.addEventListener("change", () => {
                  stateRef.checked = !stateRef.checked;
                  _that.updateStudyUnitList(modal.data.gradeFieldId);
                });
              });

              let downloadClassListButtons =
                component.container.querySelectorAll(
                  ".js-download-button__class-list"
                );
              downloadClassListButtons.forEach((button) => {
                let classNo = button.dataset.classNo;
                let gradeNo = button.dataset.gradeNo;
                button.addEventListener("click", (e) => {
                  let options = {};
                  options.classNo = classNo;
                  options.gradeNo = gradeNo;
                  button.classList.add("uk-spinner");
                  button.setAttribute("uk-icon", "cog");
                  _that.getClassListContent(options).then((res) => {
                    if (res === null) {
                      logify(
                        { status: "warning", pos: "bottom-center" },
                        "اشکال در ارتباط با سرور"
                      );
                      button.classList.remove("uk-spinner");
                      button.setAttribute("uk-icon", "download");
                    } else {
                      button.classList.remove("uk-spinner");
                      button.setAttribute("uk-icon", "download");
                    }
                  });
                });
              });
            });
            return;
          case "studyUnitHeader":
            component.container.innerHTML = StudyUnitHeader();
            const buttons = component.container.querySelectorAll("button");
            buttons.forEach((button) => {
              button.addEventListener("click", (e) => {
                let prop = button.dataset.sortProperty;
                let order = button.dataset.sortOrder;
                if (modal.state.sortSettings.prop === prop) {
                  if (order === "asc") {
                    button.dataset.sortOrder = "desc";
                  } else button.dataset.sortOrder = "asc";
                }
                modal.state.sortSettings.prop = prop;
                modal.state.sortSettings.order = button.dataset.sortOrder;
                _that.updateStudyUnitList(modal.data.gradeFieldId);
              });
            });
        }
      });
    };

    if (modalObject) {
      render(modalObject);
    }
    // else render all modals
    else
      this._modals.forEach((modal) => {
        render(modal);
      });

    jalaliDatepicker.startWatch({
      //initDate: { year: 1399, month: 11, day: 29 },
      // maxDate: "today",
      autoHide: true,
      showEmptyBtn: false,
      zIndex: 99999999,
    });
    // Date inputs should init after jalaliDatePicker get initiate
    $_.pause(0).then(() => {
      _that._modals.forEach((modal) => {
        let dateRangeComponent = modal.components
          .slice()
          .filter((c) => c.id === "dateRange")[0];
        //console.log(dateRangeComponent)
        dateRangeComponent.dateInputs.forEach((el) => {
          let inputElement = document.getElementById(el.id); //dateRangeComponent.container.querySelector('#' + el.id);
          //console.log(inputElement)
          inputElement.addEventListener("change", (e) => {
            if (inputElement.dataset.dateType === "to")
              modal.state.toDate = e.target.value;
            else modal.state.fromDate = e.target.value;
            _that.updateStudyUnitList(modal.data.gradeFieldId);
          });
        });
      });
    });
  },
  renderModalBody: (gradeFieldId, caption) => {
    return `
        <div class="uk-modal-dialog custom-test-body">
                    
        <button class="uk-modal-close-default" type="button" uk-close></button>
            
        <div class="help-switch">
            <label class="bigswitch">
                <input type="checkbox" uk-toggle="target: #help-container__${gradeFieldId}; animation: uk-animation-fade">
                <span class="bigslider biground"></span>
            </label>  
            <!--راهنما-->
        </div>

        <div class="help-container" id="help-container__${gradeFieldId}" hidden>
            <img class="uk-visible@m" src="https://meraat-webresources-sactivity.s3.ir-thr-at1.arvanstorage.ir/karnampooyaahelp.png">
            <img class="uk-hidden@m" src="https://meraat-webresources-sactivity.s3.ir-thr-at1.arvanstorage.ir/karnamapooyahelpmobile.png">
        </div>

        <div class="custom-test-header " >کارنمای پویای واحدهای یادگیری</div>

        <div class="uk-flex uk-flex-column uk-height-small modal-block" uk-height-viewport="offset-top: true; offset-bottom: 55px">
            <div class="uk-grid-collapse" uk-grid>
                <div class="uk-width-1-1 uk-padding-small main-options">
                    <div id="${prefix}contentSelector_${gradeFieldId}_container" class="date-container">
                       
                    </div>


                    <div id="${prefix}lessonItemList_${gradeFieldId}_container" class="row-container">
                       
                    </div>

                    <div id="${prefix}classList_${gradeFieldId}" class="">

                        <label class="label-title">${caption}</label>
                        <div id="${prefix}classList_${gradeFieldId}_container" class="uk-width-1-1 uk-inline test-classes-container">
                       
                        </div>
                    </div>                        



                </div>



                <div id="${prefix}dateRange_${gradeFieldId}_container" class="test-date-container class-option uk-width-1-5@s uk-width-1-1">

                </div>


            </div>

            <div class="table-container-test-by-test uk-width-1-1">
                <table class="">
                    <colgroup>
                        <col><col><col><col><col>
                    </colgroup>
                    <thead id="${prefix}studyUnitHeader_${gradeFieldId}_container" 
                    data-active-sort-property="none">
                       
                    </thead>
                    <tbody id="studyUnitList_${gradeFieldId}_container">
                                                                                                                                                                                                                                                                                                                                                  
                    </tbody>
                </table>    
            </div>        
        </div>
    </div>`;
  },
  updateStudyUnitList: function (gradeFieldId) {
    const stateRef = { ...this._modals.get(gradeFieldId).state };
    const parameters = this.getStateParameters(stateRef);
    const lessonListArray = this.queryReports(parameters);
    this.renderLessonListTable(gradeFieldId, lessonListArray);
  },
  renderLessonListTable: function (gradeFieldId, lessonListArray) {
    const modal = this._modals.get(gradeFieldId);
    let studyUnitTable = modal.container.querySelector(
      `#studyUnitList_${gradeFieldId}_container`
    );
    this.__removeAllChildNodes(studyUnitTable);
    var markup = [];
    if (modal.state.sortSettings.prop === "none")
      markup = lessonListArray.map((item) => StudyUnitItem(gradeFieldId, item));
    else {
      const { prop, order } = modal.state.sortSettings;
      const sortedList = [...lessonListArray]
        .slice()
        .sort(compareValues(prop, order));
      markup = sortedList.map((item) => StudyUnitItem(gradeFieldId, item));
    }
    studyUnitTable.innerHTML = markup.join("");
    $_.pause(0).then(() => {
      // Bind download btuttons
      const downloadButtons = [
        ...modal.container.querySelectorAll("[data-report-type]"),
      ];
      downloadButtons.forEach((button) => {
        const reportTyp = button.dataset.reportType;
        const id = button.dataset.treeId;
        button.addEventListener("click", async (e) => {
          const _state = this.getStateParameters({ ...modal.state });
          //console.log(_state)
          const options = {
            ..._state,
            id: _.toNumber(id), //{ ...lessonItem },
            reportTyp: reportTyp,
            requestType: "xls",
          };
          button.classList.add("uk-spinner");
          button.setAttribute("uk-icon", "cog");
          this.getDownloadableContent(options)
            .then((res) => {
              if (res === null)
                logify(
                  { status: "warning", pos: "bottom-center" },
                  "اشکال در ارتباط با سرور"
                );
              button.classList.remove("uk-spinner");
              button.setAttribute("uk-icon", "download");
            })
            .catch((err) => {
              console.log(err);
              logify(
                { status: "warning", pos: "bottom-center" },
                "اشکال در ارتباط با سرور"
              );
              button.classList.remove("uk-spinner");
              button.setAttribute("uk-icon", "download");
            });
        });
      });
    });
  },

  _reset: function (modal) {
    Object.keys(modal.state).forEach((key) => {
      if (key === "toDate" || key === "fromDate")
        modal.state[`${key}`] = initialState[key];

      if (key === "classList") {
        modal.state[key].forEach((item) => {
          item.checked = false;
        });
      }
      if (key === "contentSelector") {
        modal.state[key].value = initialState[key].value;
        modal.state[key].checkboxes.forEach((checkbox) => {
          checkbox.checked = true;
        });
      }
    });

    this._renderModalComponents(modal);
  },
  getStateParameters: (state) => {
    const {
      gradeFieldId,
      contentSelector,
      lessonItemList,
      fromDate,
      toDate,
      classList,
    } = state;
    const classListArray = [];
    classList.map((cls) => {
      if (cls.checked) {
        classListArray.push(cls.classNo);
      }
    });

    const mutatedState = {
      gradeFieldId: gradeFieldId,
      examType: contentSelector.value,
      gradeLessonDetailId: lessonItemList,
      fromDate: fromDate,
      toDate: toDate,
      classList: classListArray,
    };
    return mutatedState;
  },
  queryReports: null,
  init: function (data, queryReportsCallback) {
    this._renderModalBody(data);
    $_.pause(0).then(() => {
      this.queryReports = (props) => queryReportsCallback(props);
      this._renderModalComponents();
    });

    return this;
  },
};
