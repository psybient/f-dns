import ClassItem from "./Atoms/ClassItem";
import LessonItem from "./Atoms/LessonItem";
import { $_ } from "../../../../common/utils/create.dom";
import InputItem from "./Atoms/InputItem";
import RangeSelect from "./Atoms/RangeSelect";
import moment from "moment-jalaali";
import DualDateInput from "./Atoms/DualDateInput";
import * as axios from "axios";
import ValuationPreviewItem from "./Atoms/ValuationPreviewItem";

import { logify } from "../../../../common/utils/ukHelper";
import _ from "lodash";
import "@majidh1/jalalidatepicker";
import { downloadBlob } from "../../../../common/utils/downloadBlob";
import * as UIkit from "uikit";
const m = moment().format("jYYYY/jMM/jDD");
//import { compareValues } from '../../../../common/utils/compareValues'
const baseComponents = [
  "title",
  "classList",
  "selfValuation",
  "studyDuration",
  "dateRange",
  "lessonList",
  "addValuation",
  "summaryPreview",
];

const initialState = {
  gradeFieldId: 0,
  title: "",
  selfValuation: "",
  studyDuration: "",
  fromDate: m,
  toDate: m,
  classList: [],
  lessonList: [],
};

export const customReportModal = {
  _modals: new Map(),
  isModalActive(modal) {
    return modal.classList.contains("uk-active") ? true : false;
  },
  __removeAllChildNodes: (parent) => {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  },
  _renderModalBody: function (data) {
    var _that = this;
    //console.log(data)
    data.map((grade) => {
      const modal = document.getElementById(
        `report_modal_${grade.gradeFieldId}`
      );
      if (modal != null) {
        const classes = [...grade.internalQuizInfo.classList];
        const lessons = [...grade.internalQuizInfo.lessonList];
        modal.innerHTML = _that.renderModalBody(
          grade.gradeFieldId,
          grade.caption
        );
        // Build base of each modal components
        const components = baseComponents.map((component) => {
          return {
            id: component,
            container: document.getElementById(
              `${component}_${grade.gradeFieldId}_container`
            ),
          };
        });
        // Add modal components to object instance
        //console.log(grade)
        _that._modals.set(grade.gradeFieldId, {
          el: modal,
          components: components,
          data: grade,
          state: {
            ...initialState,
            gradeFieldId: grade.gradeFieldId,
            classList: (() => {
              return classes.map((clas) => {
                return { classNo: clas.classNo, checked: false };
              });
            })(),
            lessonList: (() => {
              //console.log(lessons)
              return lessons.slice().map((lesson) => {
                const { studyUnit, ...rest } = lesson;
                const unsortedStudyUnits = [];
                const checkboxStudyUnits = [];
                studyUnit.forEach((unit) => {
                  unsortedStudyUnits.push({
                    id: unit.id,
                    checked: false,
                    order: unit.sortOrder,
                  });
                  checkboxStudyUnits.push({
                    id: unit.id,
                    checked: false,
                    order: unit.sortOrder,
                  });
                });
                return {
                  ...rest,
                  studyUnit: unsortedStudyUnits.slice(),
                  checkboxStudyUnits: checkboxStudyUnits.slice(),
                  activeUIComponent: "select", // the alternative is checkbox
                };
              });
            })(),
          },
        });
      }
    });
  },
  getDownloadableContent: (options) =>
    new Promise(function (resolve, reject) {
      const { examId, reportType, requestType = "pdf", gradeFieldId } = options;
      //console.log(reportType)

      axios({
        method: "post",
        url: `/api/School/GetSchoolReport?internalExamId=${examId}&reportType=${reportType}&requestType=${requestType}`,
        responseType: "blob",
        timeout: 10000 * 600,
        config: { headers: { "Content-Type": "multipart/form-data" } },
      }).then((result) => {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        resolve(
          downloadBlob(
            url,
            "report-" + new Date().getTime() + `.${requestType}`
          )
        );
      });
    }),
  getClassListContent: (options) =>
    new Promise(function (resolve, reject) {
      const { classNo, gradeNo } = options;

      axios({
        method: "post",
        url: `/api/School/GetSchoolStudentClassUserList?classNo=${classNo}&gradeFieldId=${gradeNo}`,
        responseType: "blob",
        config: { headers: { "Content-Type": "multipart/form-data" } },
      }).then((result) => {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        resolve(downloadBlob(url, "report-" + new Date().getTime() + `.xls`));
      });
    }),
  _reset: function (modal) {
    Object.keys(modal.state).forEach((key) => {
      if (
        key === "title" ||
        key === "toDate" ||
        key === "fromDate" ||
        key === "selfValuation" ||
        key === "studyDuration"
      )
        modal.state[`${key}`] = initialState[key];
      else if (key === "classList") {
        modal.state[key].forEach((item) => {
          item.checked = false;
        });
      } else if (key === "lessonList")
        modal.state[key].forEach((item) => {
          item.enabled = false;
          item.activeUIComponent = "select";
        });
    });
    this._renderModalComponents(modal);
  },
  _renderModalComponents(modalObject) {
    // Initiate components on each modal
    const _that = this;
    const render = (modal) => {
      modal.components.map((component) => {
        //console.log(component)
        switch (component.id) {
          case "title":
            component.container.innerHTML = `<label class="label-title">عنوان</label>
                        `;
            component.container.appendChild(
              InputItem({
                id: `${component.id + "_" + modal.data.gradeFieldId}`,
                type: "text",
                className: "input-text",
                attributes: {
                  placeholder: "عنوان كارنامه را اینجا بنویسید ...",
                },
                handler: (e) => {
                  let input = e.target;
                  modal.state.title = input.value;
                },
              })
            );
            return;
          case "selfValuation":
            let selfValuationItems = [1, 2, 3, 4, 5];
            const selfValuationRangeSelect = RangeSelect({
              id: component.id + "_" + modal.data.gradeFieldId,
              items: selfValuationItems,
              handler: (e) => {
                modal.state.selfValuation = _.toNumber(e);
              },
              title: "حداقل تعداد خودارزیابی",
            });
            component.container.innerHTML = selfValuationRangeSelect.body;
            $_.pause(0).then(() => {
              let componentInnerConteiner = document.getElementById(
                selfValuationRangeSelect.id
              ); //$(component.container).find(`#${selfValuationRangeSelect.id}`)
              _that.__removeAllChildNodes(componentInnerConteiner);
              selfValuationRangeSelect.childElements.map((li) =>
                componentInnerConteiner.append(li)
              );
              modal.state.selfValuation = selfValuationItems[0];
            });
            return;
          case "studyDuration":
            let studyDurationItems = [0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const studyDurationRangeSelect = RangeSelect({
              id: component.id + "_" + modal.data.gradeFieldId,
              items: studyDurationItems,
              handler: (e) => {
                modal.state.studyDuration = _.toNumber(e);
              },
              title: "ساعت مطالعه",
            });
            component.container.innerHTML = studyDurationRangeSelect.body;
            $_.pause(0).then(() => {
              let componentInnerConteiner = document.getElementById(
                studyDurationRangeSelect.id
              ); //$(component.container).find(`#${studyDurationRangeSelect.id}`)
              _that.__removeAllChildNodes(componentInnerConteiner);
              studyDurationRangeSelect.childElements.map((li) =>
                componentInnerConteiner.append(li)
              );
              modal.state.studyDuration = studyDurationItems[0];
            });
            return;
          case "dateRange":
            const inputs = [
              {
                id: `fromDate_${modal.data.gradeFieldId}`,
                type: "text",
                attributes: {
                  placeholder: m,
                  "data-jdp": "",
                  autocomplete: "off",
                  "data-modal-id": `${modal.data.gradeFieldId}`,
                  "data-date-type": "from",
                },
                className: "input-date",
                handler: (e) => {
                  modal.state.fromDate = e.target.value;
                },
              },
              {
                id: `toDate_${modal.data.gradeFieldId}`,
                type: "text",
                attributes: {
                  placeholder: m,
                  "data-jdp": "",
                  autocomplete: "off",
                  "data-modal-id": `${modal.data.gradeFieldId}`,
                  "data-date-type": "to",
                },

                className: "input-date",
                handler: (e) => {
                  modal.state.toDate = e.target.value;
                },
              },
            ];

            DualDateInput({
              container: component.container,
              inputs: inputs,
            });

            component["dateInputs"] = inputs; //datePickers;
            return;
          case "classList":
            this.__removeAllChildNodes(component.container);
            let classComponents = modal.data.internalQuizInfo.classList.map(
              (clas) => ClassItem(clas, modal.data.gradeFieldId)
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
                  _that
                    .getClassListContent(options)
                    .then((res) => {
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
            return;
          case "lessonList":
            this.__removeAllChildNodes(component.container);
            let items = modal.data.internalQuizInfo.lessonList.map((lesson) =>
              LessonItem({
                gradeFieldId: modal.data.gradeFieldId,
                lesson: lesson,
              })
            );
            items.forEach((item) => (component.container.innerHTML += item));
            $_.pause(0).then(() => {
              const mainCheckBoxes = component.container.querySelectorAll(
                "input.grade-switcher_checkbox"
              );

              // common function utils
              const getSelectComponentUnitStatus = (
                unit,
                mainSelect,
                dynamicSelect
              ) => {
                if (unit.order - 1 == dynamicSelect.selectedIndex) return true;
                if (unit.order - 1 == mainSelect.selectedIndex) return true;
                if (
                  unit.order - 1 < dynamicSelect.selectedIndex &&
                  unit.order - 1 > mainSelect.selectedIndex
                ) {
                  return true;
                }
                if (
                  unit.order - 1 < mainSelect.selectedIndex ||
                  unit.order - 1 > dynamicSelect.selectedIndex
                )
                  return false;
              };

              const getLessonDetailRefrence = (gradeLessonDetailId) => {
                const itemArray = modal.state.lessonList.filter((l) => {
                  return l.gradeLessonDetailId == gradeLessonDetailId;
                });
                return itemArray[0];
              };

              // Bind enable and disable of each lesson
              mainCheckBoxes.forEach((checkbox) => {
                let gradeLessonDetailId = checkbox.dataset.gradeLessonDetailId;
                let stateRef = modal.state.lessonList
                  .slice()
                  .filter(
                    (lessons) =>
                      lessons.gradeLessonDetailId == gradeLessonDetailId
                  )[0];
                checkbox.addEventListener("change", (e) => {
                  stateRef.enabled = !stateRef.enabled;
                });
              });

              // init select component
              let selects = component.container.querySelectorAll("select");
              let selectCount = selects.length;
              for (let i = 0; i < selectCount; i += 2) {
                const mainSelect = selects[i];
                const dynamicSelect = selects[i + 1];

                let lessonDetailId = mainSelect.dataset.gradeLessonDetailId;

                mainSelect.addEventListener("change", (e) => {
                  //dynamicSelect.selectedIndex = index;
                  const index = mainSelect.selectedIndex;
                  dynamicSelect.selectedIndex = index;

                  $_.pause(0).then(() => {
                    const stateRef = getLessonDetailRefrence(lessonDetailId);
                    stateRef.studyUnit.forEach(
                      (unit) =>
                        (unit.checked = getSelectComponentUnitStatus(
                          unit,
                          mainSelect,
                          dynamicSelect
                        ))
                    );
                  });
                });
                mainSelect.dispatchEvent(new Event("change"));

                dynamicSelect.addEventListener("change", (e) => {
                  e.stopImmediatePropagation();
                  if (mainSelect.selectedIndex > dynamicSelect.selectedIndex) {
                    e.preventDefault();
                    logify(
                      { status: "warning", pos: "bottom-center" },
                      `بازه انتخابی نادرست می باشد`
                    );
                    dynamicSelect.selectedIndex = mainSelect.selectedIndex;
                    return false;
                  }

                  const stateRef = getLessonDetailRefrence(lessonDetailId);
                  $_.pause(0).then(() => {
                    stateRef.studyUnit.forEach(
                      (unit) =>
                        (unit.checked = getSelectComponentUnitStatus(
                          unit,
                          mainSelect,
                          dynamicSelect
                        ))
                    );
                  });
                });
              }

              // Init checkbox component
              let checkboxes = component.container.querySelectorAll(
                "input.lesson-item_checkbox"
              );
              checkboxes.forEach((checkbox) => {
                const gradeLessonRef = getLessonDetailRefrence(
                  checkbox.dataset.gradeLessonDetailId
                );
                checkbox.addEventListener("change", () => {
                  let checkboxComponentContainer =
                    component.container.querySelector(
                      `#listFrom_${modal.data.gradeFieldId}_${gradeLessonRef.gradeLessonDetailId}`
                    );
                  $_.pause(0).then(() => {
                    let checkboxeItems =
                      checkboxComponentContainer.querySelectorAll("input");
                    let selectedLessonsValueList = [...checkboxeItems]
                      .slice()
                      .filter((checkbox) => checkbox.checked)
                      .map((checkbox) => _.toNumber(checkbox.dataset.value));
                    //console.log(selectedLessonsValueList)
                    if (gradeLessonRef.activeUIComponent === "select")
                      if (selectedLessonsValueList.length > 0) {
                        document
                          .getElementById(
                            `selectFrom_${modal.data.gradeFieldId}_${gradeLessonRef.gradeLessonDetailId}`
                          )
                          .setAttribute("disabled", true);
                        document
                          .getElementById(
                            `selectTo_${modal.data.gradeFieldId}_${gradeLessonRef.gradeLessonDetailId}`
                          )
                          .setAttribute("disabled", true);
                        document
                          .getElementById(
                            `filter_${modal.data.gradeFieldId}_${gradeLessonRef.gradeLessonDetailId}`
                          )
                          .classList.add("uk-text-primary");
                        gradeLessonRef.activeUIComponent = "checkbox";
                      }

                    if (gradeLessonRef.activeUIComponent === "checkbox")
                      if (selectedLessonsValueList.length === 0) {
                        gradeLessonRef.activeUIComponent = "select";
                        document
                          .getElementById(
                            `selectFrom_${modal.data.gradeFieldId}_${gradeLessonRef.gradeLessonDetailId}`
                          )
                          .removeAttribute("disabled");
                        document
                          .getElementById(
                            `selectTo_${modal.data.gradeFieldId}_${gradeLessonRef.gradeLessonDetailId}`
                          )
                          .removeAttribute("disabled");
                        document
                          .getElementById(
                            `filter_${modal.data.gradeFieldId}_${gradeLessonRef.gradeLessonDetailId}`
                          )
                          .classList.remove("uk-text-primary");
                      }
                    gradeLessonRef.checkboxStudyUnits.forEach((item) => {
                      if (selectedLessonsValueList.includes(item.id)) {
                        item.checked = true;
                      } else item.checked = false;
                    });
                  });
                });
              });
            });

            return;
          case "addValuation":
            //console.log(component)
            this.__removeAllChildNodes(component.container);
            component.container.innerHTML = ` <span> ثبت برنامه</span>
                        <button id="addValuation_${modal.data.gradeFieldId}" 
                        class="uk-icon-button uk-background-primary uk-light" 
                        uk-icon="icon: triangle-right; ratio: 1.5"></button>
                    `;
            const _setValidation = (errorElement, status = true) => {
              if (errorElement.length)
                if (status === true) {
                  _that.setValidation(errorElement[0].container, true);
                } else {
                  _that.setValidation(errorElement[0].container, false);
                  if (errorElement[0].id === "dateRange") {
                    logify(
                      { status: "warning", pos: "bottom-center" },
                      "تاریخ آغاز، پس از تاریخ پایان انتخاب شده است"
                    );
                  } else
                    logify(
                      { status: "warning", pos: "bottom-center" },
                      "لطفا فرم را تکمیل فرمایید"
                    );
                }
            };

            $_.pause(0).then(() => {
              try {
                let container =
                  component.container.querySelectorAll("button")[0];
                container.addEventListener("click", (e) => {
                  const state = { ...modal.state };

                  let keys = baseComponents;
                  for (let key of keys) {
                    let errorElement = modal.components
                      .slice()
                      .filter((c) => c.id === key);
                    //console.log(errorElement)
                    if (key === "dateRange") {
                      let isAfter = moment(state.toDate).isAfter(
                        state.fromDate
                      );
                      let isSame = moment(state.toDate).isSame(state.fromDate);
                      if (!isAfter && !isSame) {
                        _setValidation(errorElement, false);
                        return;
                      } else {
                        _setValidation(errorElement, true);
                      }
                    }
                    if (key === "classList") {
                      let checked = state[key]
                        .slice()
                        .filter((el) => el.checked);
                      if (checked.length === 0) {
                        _setValidation(errorElement, false);
                        return false;
                      } else {
                        _setValidation(errorElement, true);
                      }
                    }
                    if (key === "lessonList") {
                      let selecteds = state[key]
                        .slice()
                        .filter((el) => el.enabled);
                      if (selecteds.length === 0) {
                        _setValidation(errorElement, false);
                        return false;
                      } else {
                        _setValidation(errorElement, true);
                      }
                    }
                    if (
                      key === "title" ||
                      key === "selfValuation" ||
                      key === "studyDuration"
                    )
                      if (state[key] === "") {
                        _setValidation(errorElement, false);
                        return false;
                      } else {
                        _setValidation(errorElement, true);
                      }
                  }

                  let query = `../api/School/PostInternalQuizInfo`;
                  //debugger
                  let serverJson = _that.getServerJson(state);
                  let jsonStringServer = JSON.stringify(serverJson);
                  //console.log(serverJson)
                  axios
                    .post(query, jsonStringServer, {
                      headers: {
                        "Content-Type": "application/json",
                      },
                    })
                    .then((response) => {
                      //console.log(response)
                      _that._reset(modal);
                    })
                    .catch(function (response) {
                      console.log(response);
                    });
                });
              } catch {
                (err) => console.log(err);
              }
            });
            return;
          case "summaryPreview":
            this.__removeAllChildNodes(component.container);
            let query = `../api/School/GetInternalQuizInfoGeneratedList?gradeFieldId=${modal.data.gradeFieldId}`;
            //const _that = this;
            axios.get(query).then((res) => {
              const { data } = res;
              //console.log(data);
              if (data.length > 0) {
                let markup = data.map((item) =>
                  ValuationPreviewItem({
                    ...item,
                    gradeFieldId: modal.data.gradeFieldId,
                  })
                );
                //console.log(component.container)
                component.container.innerHTML = markup.join("");

                $_.pause(10).then(() => {
                  const downloadButtons = component.container.querySelectorAll(
                    ".js-report-modal__download-button"
                  );
                  downloadButtons.forEach((button) => {
                    button.addEventListener("click", () => {
                      let resIcon = button.getAttribute("uk-icon");
                      button.setAttribute("uk-icon", "cog");
                      button.disabled = true;
                      button.classList.add("uk-spinner");
                      let options = {};
                      options.reportType = button.dataset.reportType;
                      options.requestType =
                        button.dataset.reportFormat || "pdf";
                      options.examId = button.dataset.examId;
                      _that
                        .getDownloadableContent(options)
                        .then((res) => {
                          if (res === null) {
                            logify(
                              { status: "warning", pos: "bottom-center" },
                              "اشکال در ارتباط با سرور"
                            );
                            button.classList.remove("uk-spinner");
                            button.setAttribute("uk-icon", resIcon);
                            button.disabled = false;
                          } else {
                            button.classList.remove("uk-spinner");
                            button.setAttribute("uk-icon", resIcon);
                            button.disabled = false;
                          }
                        })
                        .catch((err) => {
                          console.log(err);
                          logify(
                            { status: "warning", pos: "bottom-center" },
                            "اشکال در ارتباط با سرور"
                          );
                          button.classList.remove("uk-spinner");
                          button.setAttribute("uk-icon", resIcon);
                          button.disabled = false;
                        });
                    });
                  });

                  const closeButtons = document.querySelectorAll(
                    ".js-report-modal__close-button"
                  );
                  closeButtons.forEach((btn) => {
                    btn.addEventListener("click", () => {
                      let modal = _that._modals.get(
                        _.toNumber(btn.dataset.gradeFieldId)
                      );
                      var m = UIkit.modal(modal.el);
                      UIkit.modal
                        .confirm(` آیا از حذف این رکورد اطمینان دارید؟ `, {
                          labels: {
                            cancel: "خیر",
                            ok: "بلی",
                          },
                        })
                        .then(
                          function () {
                            // let modal = _that._modals.get(_.toNumber(btn.dataset.gradeFieldId))
                            // var m = UIkit.modal(modal.el);
                            axios(
                              `/api/School/DeleteInternalQuiz?id=${btn.dataset.examId}`
                            )
                              .then((res) => {
                                _that._reset(modal);
                                m.show();
                              })
                              .catch((err) => console.log(err));
                          },
                          function () {
                            m.show();
                          }
                        );
                    });
                  });
                });
              } else this.__removeAllChildNodes(component.container);
            });
            return;
          default:
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
      autoHide: true,
      //separatorChar: "-",
      //conteiner: modalElement,
      //initDate: { year: 1399, month: 11, day: 29 },
      // maxDate: "today",
      showEmptyBtn: false,
      zIndex: 99999999,
    });
    // Date inputs should init after jalaliDatePicker get initiate
    $_.pause(0).then(() => {
      _that._modals.forEach((modal) => {
        let dateRangeComponent = modal.components
          .slice()
          .filter((c) => c.id === "dateRange")[0];
        dateRangeComponent.dateInputs.forEach((el) => {
          let inputElement = dateRangeComponent.container.querySelector(
            "#" + el.id
          );
          inputElement.addEventListener("change", (e) => {
            if (inputElement.dataset.dateType === "to")
              modal.state.toDate = e.target.value;
            else modal.state.fromDate = e.target.value;
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
                        <input type="checkbox" uk-toggle="target: #help-container_${gradeFieldId}; animation: uk-animation-fade">
                        <span class="bigslider biground"></span>
                    </label>  
                    <!--راهنما-->
                </div>
                <div class="help-container" id="help-container_${gradeFieldId}" hidden>
                    <img class="uk-visible@m" src="https://meraat-webresources-sactivity.s3.ir-thr-at1.arvanstorage.ir/karnamahelp.png">
                    <img class="uk-hidden@m" src="https://meraat-webresources-sactivity.s3.ir-thr-at1.arvanstorage.ir/karnamahelpmobile.png">
                </div>


                <div class="custom-test-header ">برنامه‌ریزی داخلی و گزارش‌های خودارزیابی‌های مستمر
                </div>
                
                <div class="uk-grid-collapse grid-level-1 modal-block" uk-grid>
                    
                    <div class="main-panel">

                        <div class="uk-grid-collapse" uk-grid>
                            <div class="uk-width-1-1 uk-width-3-4@m">
                                <div id = "title_${gradeFieldId}_container">
                                    
                                </div>
                                <div id = "selfValuation_${gradeFieldId}_container">
                                  
                                </div>
                                <div id = "studyDuration_${gradeFieldId}_container">
                                   
                                </div>
                                <div id="dateRange_${gradeFieldId}_container" class="date-container">

                                </div>

                            </div>

                            <div id="classList_${gradeFieldId}" class="uk-width-1-4@m uk-width-1-1">
                                <label class="label-title full-width">پایه ${caption}</label>
                                <div id="classList_${gradeFieldId}_container" 
                                    class="uk-width-1-1 uk-inline classes-container">
                                   
                                </div>
                            </div>


                            <label class="label-title uk-hidden@m lessons-label-title">دروس</label>

                            <div class="table-container">

                                <table class="">
                                    <colgroup>
                                        <col>
                                        <col>
                                        <col>
                                        <col>
                                        <col>
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>درس</th>
                                            <th>از ابتدای</th>
                                            <th>تا پایان</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody id="lessonList_${gradeFieldId}_container">
                                    
                                    </tbody>
                                </table>

                            </div>

                        </div>
                        <div id="addValuation_${gradeFieldId}_container" class="add-button">
                        </div>
                    </div>
                    <div class="left-panel-parent">
                        <div id="summaryPreview_${gradeFieldId}_container" class="left-panel">
                        
                        </div>
                    </div>
                </div> 

            </div>`;
  },
  setValidation: (el, status = true) => {
    // true : valid | false : invalid
    if (status) {
      el.classList.remove("uk-form-danger");
    } else {
      if (!el.classList.contains("uk-form-danger")) {
        el.classList.add("uk-form-danger");
      }
    }
  },
  getServerJson: (state) => {
    //console.log(state)
    // const stateClone = { ...this.modals.get(id).state }
    const {
      gradeFieldId,
      title,
      selfValuation,
      studyDuration,
      fromDate,
      toDate,
      classList,
      lessonList,
    } = state;
    const mutatedState = {
      gradeFieldId: gradeFieldId,
      quizCaption: title,
      minSelfAssessmentCount: selfValuation,
      minStudyMinutes: studyDuration,
      fromDate: fromDate,
      toDate: toDate,
      classList: (() =>
        classList
          .map((cls) => {
            if (cls.checked) {
              //let { checked, rest } = cls;
              return {
                classNo: cls.classNo,
              };
            }
          })
          .slice()
          .filter((el) => el))(),
      lessonList: (() =>
        lessonList
          .map((lesson) => {
            if (lesson.enabled) {
              const { enabled, studyUnit, checkboxStudyUnits, ...rest } =
                lesson;
              //if (studyUnit.checked) {
              return {
                ...rest,
                studyUnit: (() =>
                  lesson.activeUIComponent === "checkbox"
                    ? [...checkboxStudyUnits]
                        .slice()
                        .filter((unit) => unit.checked)
                        .map((u) => {
                          return {
                            id: u.id,
                          };
                        })
                    : [...studyUnit]
                        .slice()
                        .filter((unit) => unit.checked)
                        .map((u) => {
                          return {
                            id: u.id,
                          };
                        }))(),
              };
            }
          })
          .slice()
          .filter((el) => el))(),
    };
    //console.log(mutatedState)
    return mutatedState;
  },
  init: function (data) {
    //return new Promise(async (resolve, reject) => {
    this._renderModalBody(data);
    $_.pause(0).then(() => {
      this._renderModalComponents();
    });

    return this;
  },
};
