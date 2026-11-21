import { forEach, startsWith } from "lodash";
import { customReportModal } from "../components/ReportModals/customReportModal";
import { studentReportModal } from "../components/ReportModals/studentReportModal";

import { $_ } from "../../../common/utils/create.dom";
import * as queryAdvisorViewApi from "../model/query.advisorview.api";
export class ReportTemplate {
  constructor(data) {
    this.loader = document.querySelector(".main-loader");
    const { layers, quizeInfo } = data;
    // console.log(quizeInfo);
    this.props = {
      layers: [
        {
          name: "manager",
          conteiner: document.getElementById("managerReportDiv"),
          data: layers.manager,
        },
        // {
        //     name: 'adviser',
        //     conteiner: document.getElementById('adviserReportDiv'),
        //     data: layers.adviser,
        // },
        // {
        //   name: 'teacher',
        //   conteiner: document.getElementById('teacherReportDiv'),
        //   data: data.teacher,
        // },
      ],
      quizeInfo: quizeInfo,
    };
    this._modals = null;
    if (layers.manager[5] && layers.manager[5].length > 0)
      this.queryReports = queryAdvisorViewApi.generateStudyUnitComparisonList([
        ...layers.manager[5],
      ]); //queryReports
  }

  getReportDom(id) {
    return document.getElementById("report_item_" + id);
  }

  Render() {
    const appendChildElement = (item) => {
      let id = item.id + "_content";
      this.loader.classList.remove("loaded");
      const conteiner = document.getElementById(id);
      if (conteiner) {
        conteiner.innerHTML = item.childs;
      }
      $_.pause(200).then(() => this.loader.classList.add("loaded"));
    };

    // Render detail report
    try {
      if (!Array.isArray(this.props.layers) || this.props.layers.length === 0) {
        throw new Error("No layers available for rendering.");
      }

      forEach(this.props.layers, (report) => {
        const reportSections = [];
        const frdb = report?.data?.[0]; // Safe navigation to avoid accessing undefined

        if (!frdb) {
          console.warn(
            `Report data for layer "${report?.name}" is undefined or invalid.`
          );
          return; // Skip this report
        }

        for (let item in frdb) {
          reportSections.push(
            _renderRootLevel.call(this, frdb[item], report.name)
          );
        }

        if (reportSections.length > 0) {
          reportSections.forEach((item, i) => {
            if (i === 0) {
              if (report.conteiner) {
                report.conteiner.innerHTML = item.html;
              } else {
                console.warn("Container is missing for the first report.");
              }
              try {
                appendChildElement(item);
              } catch (err) {
                console.error("Error appending child element:", err);
              }
            } else {
              if (report.conteiner) {
                report.conteiner.innerHTML += item.html;
                $_.pause(1).then(() => {
                  const li = document.getElementById(`${item.id}_conteiner`);
                  li?.addEventListener(
                    "click",
                    () => appendChildElement(item),
                    { once: true }
                  );
                });
              }
            }
          });
        }
      });

      // Initialize modals
      this._modals = customReportModal.init(this.props.quizeInfo);
      // debugger;
      // if (Array.isArray(this.queryReports) && this.queryReports.length > 0) {
      this._studentModals = studentReportModal.init(
        this.props.quizeInfo,
        this.queryReports
      );
      // }
    } catch (err) {
      console.error("Render method failed:", err);
      return new Error("Rendering process encountered an issue.");
    }

    return this;
  }

  _renderDegreeLevel(node, baseOn) {
    if (node.type === "student") {
      const base = baseOn || "Lesson"; //the alternative is Edu
      return base === "Lesson"
        ? `<span class="uk-inline mr-block-body  ${
            node.perfectBaseOnLesson ? "mr-block-excellent" : "mr-block-default"
          }"></span>
                <span class="uk-inline mr-block-body  ${
                  node.goodBaseOnLesson ? "mr-block-good" : "mr-block-default"
                }"></span>
                <span class="uk-inline mr-block-body  ${
                  node.averageBaseOnLesson
                    ? "mr-block-medium"
                    : "mr-block-default"
                }"></span>
                <span class="uk-inline mr-block-body  ${
                  node.weakBaseOnLesson ? "mr-block-weak" : "mr-block-default"
                }"></span>`
        : `<span class="uk-inline mr-block-body  ${
            node.perfectBaseOnEdu ? "mr-block-excellent" : "mr-block-default"
          }"></span>
                <span class="uk-inline mr-block-body  ${
                  node.goodBaseOnEdu ? "mr-block-good" : "mr-block-default"
                }"></span>
                <span class="uk-inline mr-block-body  ${
                  node.averageBaseOnEdu ? "mr-block-medium" : "mr-block-default"
                }"></span>
                <span class="uk-inline mr-block-body  ${
                  node.weakBaseOnEdu ? "mr-block-weak" : "mr-block-default"
                }"></span>`;
    }

    const { weak, average, good, perfect } = node;
    return `<span class="uk-inline mr-block-body  ${
      perfect ? "mr-block-excellent" : "mr-block-default"
    }"></span>
                <span class="uk-inline mr-block-body  ${
                  good ? "mr-block-good" : "mr-block-default"
                }"></span>
                <span class="uk-inline mr-block-body  ${
                  average ? "mr-block-medium" : "mr-block-default"
                }"></span>
                <span class="uk-inline mr-block-body  ${
                  weak ? "mr-block-weak" : "mr-block-default"
                }"></span>`;
  }

  _renderDate(date) {
    return `<span class="uk-badge uk-border-rounded">${date}</span>`;
  }

  _renderStudyType(node) {
    const { examTypeCaption, studyTypeCaption, studyReferenceCaption } = node;
    if (examTypeCaption === "آزمون هماهنگ")
      return `<span>${examTypeCaption}</span>`;
    return `<span>${examTypeCaption} | ${studyTypeCaption} | ${studyReferenceCaption}</span>`;
  }

  _renderAnswerTemplate(node) {
    const { wrongACount, rightACount, blankACount } = node;
    let sum = wrongACount + rightACount + blankACount;
    return `<td><span>${sum}</span> <svg class="question-circle"><use xlink:href="#circle-question" x="0"  y="0"/></svg></td>
                <td><span>${rightACount}</span> <svg class="question-circle"><use xlink:href="#circle-correct" x="0"  y="0"/></svg></td>
                <td><span>${wrongACount}</span><svg class="question-circle"><use xlink:href="#circle-wrong" x="0"  y="0"/></svg></td>
                <td><span>${blankACount}</span> <svg class="question-circle"><use xlink:href="#circle-blank" x="0"  y="0"/></svg></td>`;
  }

  _renderAnswerCircle(type) {
    var classSelector;
    switch (type) {
      case -1:
        classSelector = "circle-blank";
        break;
      case 0:
        classSelector = "circle-wrong";
        break;
      case 1:
        classSelector = "circle-correct";
        break;
      default:
        classSelector = "circle";
    }

    return `<svg class="question-circle"><use xlink:href="#${classSelector}" x="0"  y="0"/></svg>`;
  }

  getChildeItems(parent, level, type) {
    let db = this.props.layers.filter((v) => v.name === type)[0].data;
    var childReports = db[level].filter((item) =>
      startsWith(item.uniqueId, parent.uniqueId)
    );
    return childReports;
  }

  getStudentFullName(student) {
    return student.firstName + " " + student.lastName;
  }

  getStudentChildeItems(parent, level, type) {
    let db = this.props.layers.filter((v) => v.name === type)[0].data;
    var childReports = db[level].filter(
      (student) => student.gradeFieldId === parent.gradeFieldId
    );
    //console.log(childReports);
    return childReports;
  }

  getHoursOf(minutes) {
    return minutes ? minutes / 60 : 0;
  }

  _renderPercentAttribute(value) {
    if (value === null) return "-";
    return value === -33.33
      ? `%${Math.abs(value)} ${value < 0 ? "-" : ""}`
      : ` %${Math.abs(value)} ${value < 0 ? "-" : ""}`;
  }

  _getBaseLessonTemplate(item) {
    return `<div class="uk-grid-match uk-grid-collapse" uk-grid>
                    <div class="uk-width-expand uk-text-small" uk-leader="media: @@m">
                        <span class="mr-text-title-primary">${item.gradeFieldCaption}</span>
                    </div>
                </div>    `;
  }

  __getChildNodes(type) {
    //, parentNode, equalityProp) {
    return this.props.layers.filter((v) => v.name === type)[0];
  }

  __getDB(type) {
    return this.props.layers.filter((v) => v.name === type)[0].data;
  }
}

function _renderRootLevel(item, type) {
  //const childNodes = this.getChildeItems(item, 1, type);

  const itemTemplate = {};
  switch (type) {
    case "manager":
      itemTemplate["child_template_cb"] = renderManagerTemplate;
      break;
    // case 'adviser':
    //     itemTemplate['child_template_cb'] = renderAdviserTemplate;
    //     break;
    // case 'teacher':
    //     itemTemplate['child_template_cb'] = renderTeacherTemplate;
    //     break;
  }
  let id = `${type}_report-item_${item.gradeFieldId}`;
  //console.log(item)
  const rowTemplate = `

        <div class="custom-test-entrance">
            <span href="#report_modal_${item.gradeFieldId}" class="uk-icon-button uk-background-primary uk-light" uk-icon="file-text" uk-tooltip="title:برنامه‌ریزی و گزارش ; pos: right" uk-toggle></span>
            <div id="report_modal_${item.gradeFieldId}" class="testReportModal" uk-modal>
                // lazy loading custom report modals
            </div>
        </div>   

        <div  class="test-by-test-entrance">
            <span href="#testReport_modal_${item.gradeFieldId}" class="uk-icon-button uk-light" uk-icon="file-text" uk-tooltip="title:کارنمای پویا ; pos: right" uk-toggle></span>
            <div id="testReport_modal_${item.gradeFieldId}" class="testReportModal" uk-modal>
                 // lazy loading test report modals
            </div>
        </div>

        <ul class="report-wrapper uk-accordion manager-level-1-view" uk-accordion="multiple: true">
            <li id="${id}_conteiner" class="report-item" >
                <a class="uk-accordion-title " href="#">
                    <div class="uk-grid-match uk-grid-collapse" uk-grid>
                        <div class="uk-width-expand uk-text-small small-device" uk-leader="media: 961">
                            <span class="mr-text-title-primary">
                                ${item.gradeFieldCaption}
                            </span>
                        </div>
                    </div>
                </a>
                <div id="${id}_content" class="uk-accordion-content report__inner-level--padding">
                    // lazy load inner accordion at click
                </div>
            </li>
        </ul>
        `;
  return {
    id: id,
    el: item,
    html: rowTemplate,
    childs: itemTemplate.child_template_cb.call(this, item),
  };
}

function renderManagerTemplate(grade) {
  const _DB = this.__getDB("manager");
  const lessons = _DB[1].filter((c) => startsWith(c.uniqueId, grade.uniqueId));
  //console.log(lessons)
  var childTmpl = ``;
  lessons.map((lesson) => {
    childTmpl += `
                        <ul class="uk-margin-remove report__inner-level--padding" uk-accordion>
                            <li class="uk-animation-reverse ">
                                <a class="uk-accordion-title manager-level-2-view" href="#">
                                    <div class="uk-grid-match uk-grid-collapse" uk-grid>
                                        <div class="uk-width-expand uk-text-small lesson-small-device">
                                            <div style="text-align: right">
                                                <span class="mr-text-title-primary">
                                                    ${lesson.lessonCaption}
                                                </span>
                                                <br class="uk-hidden@m">
                                                <span class="uk-text-muted uk-text-small countOfExaminedUnits">
                                                    ${
                                                      lesson.leafCount
                                                    } واحد یادگیری
                                                </span>
                                            </div>
                                        </div>

                                        <div class="width-60px uk-margin-small-left uk-inline percent-small-device">                                
                                            <div class="uk-position-center uk-inline uk-text-primary mr-border-primary-thin uk-border-pill percent-height">
                                                <span class="uk-position-center mr-percenttext-digit-primary">
                                                    ${this._renderPercentAttribute(
                                                      lesson.percent
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div class="uk-inline width-30px">
                                            <span class="uk-position-center" uk-icon="icon: clock; ratio: 1"></span>
                                        </div>

                                        <div class="uk-inline width-45px">
                                            <div class="uk-text-small uk-text-center uk-position-center">
                                                ${this.getHoursOf(
                                                  lesson.duration
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                                
                                <div class="uk-accordion-content report__inner-level--padding report__inner-level--paddingVertical uk-margin-remove">
                                    ${_renderManagerStudentLevel.call(
                                      this,
                                      lesson
                                    )}
                                </div>

                                <div class="uk-width-1-1 mr-padding-tiny uk-visible@m"> </div>
                            </li>
                        </ul>
                        `;
  });
  return childTmpl;
}

function _renderManagerStudentLevel(lesson) {
  //return "";
  const _DB = this.__getDB("manager");
  // console.log(_DB);
  var childTmpl = [];
  const students = _DB[2].filter(
    (c) =>
      c.gradeFieldId === lesson.gradeFieldId &&
      c.gradeLessonDetailId === lesson.gradeLessonDetailId
  );
  childTmpl.push(students.length ? getExamLevelCaptionTemplate() : "");
  forEach(students, (student) => {
    childTmpl.push(`
        <!-- Level 3 Accardion دانش‌آموز-->
        <ul class="uk-margin-remove uk-list manager-level-3-view report__inner-level--padding">
            <li>
                <a class="uk-text-muted" href="https://students.meraat.ir/account/login?StudentAuth=${
                  student.encryptTestPersonId
                }" target="_blank">
                    <div class="uk-grid-match uk-grid-collapse" style="position: relative" uk-grid>
                        <div class="uk-inline uk-text-center user-icon-size" >
                            <span uk-icon="icon: user" class="user-icon uk-border-pill uk-position-center"></span>
                        </div>
                        
                        <div class="uk-inline uk-width-expand uk-text-small mr-padding-tiny uk-text-right  caption-width">
                            <span class="uk-margin-small-left mr-text-title-secondary">
                                ${this.getStudentFullName(student)}
                            </span>
                            <br class="uk-hidden@m">                    
                            <span class="uk-text-small uk-text-muted countOfExaminedUnits">
                                ${student.readLeafCount} واحد سنجش‌شده از ${
      student.leafCount
    } واحد یادگیری
                            </span>
                            <span class="uk-inline uk-text-center count-badge" uk-tooltip="تعداد ارزیابی"> 
                            ${student.activityCount}
                            <!--35-->
                             </span>                            
                        </div>

                        <div class="uk-inline uk-width-expand@m">
                        </div>
                        
                        <div class="uk-inline width-30px uk-hidden@m time-element-back uk-text-center">
                            <span class="uk-position-center" uk-icon="icon: clock; ratio: 1"></span>
                        </div>

                        <div class="uk-inline width-30px uk-hidden@m top-corner-rounded time-element-back " >
                            <div class="uk-text-small uk-text-center uk-position-center">
                                ${this.getHoursOf(student.duration)}
                            </div>
                        </div>  

                        <div class="uk-inline uk-width-expand mr-padding-tiny uk-hidden@m empty-space-hight"></div>

                        <div class="uk-inline width-60px uk-margin-small-left">
                            <div class="uk-text-small uk-text-left uk-position-center">
                                ${this._renderPercentAttribute(student.percent)}
                            </div>
                        </div>
                        
                        <div class="uk-inline width-150px-responsive uk-margin-small-left">
                            <div class="uk-position-center">
                                ${this._renderDegreeLevel(student, "Lesson")}
                            </div>
                        </div>

                        <div class="uk-inline width-30px uk-visible@m">
                            <span class="uk-position-center" uk-icon="icon: clock; ratio: 1"></span>
                        </div>
                        
                        <div class="uk-inline width-45px uk-visible@m">
                            <div class="uk-text-small uk-text-center uk-position-center">
                                ${this.getHoursOf(student.duration)}
                            </div>
                        </div>
                    </div>
                </a>
                <div class="uk-width-1-1 mr-padding-bit uk-visible@m"> </div>

            </li>
    </ul>`);
  });

  return childTmpl.join("");
}

function renderAdviserTemplate(grade) {
  const _DB = this.__getDB("adviser");

  const students = _DB[1].filter(
    (students) => students.gradeFieldId == grade.gradeFieldId
  );

  var childTmpl = ``;
  forEach(students, (student) => {
    childTmpl += `
                    <!-- Level 3 Accardion دانش‌آموز-->
                    <ul class="uk-margin-remove uk-list advisor-level-3-view report__inner-level--padding">
                    <li class="uk-list-item">
                        <a class="uk-text-muted" href="https://students.meraat.ir/account/login?StudentAuth=${
                          student.encryptTestPersonId
                        }" target="_blank">
                            <div class="uk-grid-match uk-grid-collapse" uk-grid>
                                <div class="uk-inline uk-text-center user-icon-size" >
                                    <span uk-icon="icon: user" class="user-icon uk-border-pill uk-position-center"></span>
                                </div>
                                
                                <div class="uk-inline uk-width-expand uk-text-small mr-padding-tiny uk-text-right caption-width">
                                    <span class="uk-margin-small-left mr-text-title-secondary">
                                        ${this.getStudentFullName(student)}
                                    </span>
                                    <br class="uk-hidden@m">                    
                                    <span class="uk-text-small uk-text-muted countOfExaminedUnits">
                                        ${
                                          student.readLeafCount
                                        } واحد سنجش‌شده از ${
      student.leafCount
    } واحد یادگیری
                                    </span>
                                </div>
        
                                <div class="uk-inline uk-width-expand@m">
                                </div>
                                
                                <div class="uk-inline width-30px uk-hidden@m time-element-back uk-text-center">
                                    <span class="uk-position-center" uk-icon="icon: clock; ratio: 1"></span>
                                </div>
        
                                <div class="uk-inline width-30px uk-hidden@m top-corner-rounded time-element-back " >
                                    <div class="uk-text-small uk-text-center uk-position-center">
                                        ${this.getHoursOf(
                                          student.durationBaseOnLesson
                                        )}
                                    </div>
                                </div>  
        
                                <div class="uk-inline uk-width-expand mr-padding-tiny uk-hidden@m empty-space-hight"></div>
        
                                <div class="uk-inline width-60px uk-margin-small-left">
                                    <div class="uk-text-small uk-text-left uk-position-center">
                                        ${this._renderPercentAttribute(
                                          student.percentBaseOnLesson
                                        )}
                                    </div>
                                </div>
                                
                                <div class="uk-inline width-150px-responsive uk-margin-small-left">
                                    <div class="uk-position-center">
                                        ${this._renderDegreeLevel(
                                          student,
                                          "Lesson"
                                        )}
                                    </div>
                                </div>
        
                                <div class="uk-inline width-30px uk-visible@m">
                                    <span class="uk-position-center" uk-icon="icon: clock; ratio: 1"></span>
                                </div>
                                
                                <div class="uk-inline width-45px uk-visible@m">
                                    <div class="uk-text-small uk-text-center uk-position-center">
                                        ${this.getHoursOf(
                                          student.durationBaseOnLesson
                                        )}
                                    </div>
                                </div>
                            </div>
                        </a>
                        <div class="uk-width-1-1 mr-padding-bit uk-visible@m"> </div>
        
                    </li>
                </ul>
                    `;
  });

  return childTmpl;
}

function renderTeacherTemplate(grade) {
  const _DB = this.__getDB("teacher");

  const lessons = _DB[1].filter(
    (lessons) => grade.gradeFieldIdde === lessons.gradeFieldIdde
  );
  //console.log(lessons);
  var childTmpl = ``;
  forEach(
    lessons,
    (lesson) =>
      (childTmpl += `<ul class="uk-margin-remove" uk-accordion>
                <li class="uk-animation-reverse">
                    <a class="uk-accordion-title " href="#">
                        <div class="uk-grid-match uk-grid-collapse" uk-grid>
                            <div class="uk-width-expand uk-text-small">
                                <div>
                                    <span class="mr-text-title-primary">${
                                      lesson.lessonCaption
                                    }</span>
                                    <span class="uk-text-muted">${
                                      lesson.leafCount
                                    } واحد یادگیری</span>
                                </div>
                            </div>
                            <div class="width-60px uk-margin-small-left">
                                <div class="uk-inline uk-text-primary mr-border-primary-thin uk-border-pill">
                                    <span class="uk-position-center mr-percenttext-digit-primary">${this._renderPercentAttribute(
                                      lesson.percent
                                    )}</span>
                                </div>
                            </div>
                            <div class="uk-inline width-30px">
                                <span class="uk-position-center" uk-icon="icon: clock; ratio: 1"></span>
                            </div>
                            <div class="uk-inline width-30px">
                                <div class="uk-text-small uk-text-center uk-position-center">${this.getHoursOf(
                                  lesson.duration
                                )}</div>
                            </div>
                        </div>
                    </a>
                    <div class="uk-accordion-content report__inner-level--padding report__inner-level--paddingVertical uk-margin-remove">
                      ${_renderTeacherUnitLevel.call(this, lesson)}
                    </div>

                    <div class="uk-width-1-1 mr-padding-tiny"> </div>
                </li>
        </ul> `)
  );

  return childTmpl;
}

function getExamLevelCaptionTemplate() {
  return ` <div class="uk-inline uk-width-1-1 uk-visible@m">
    <div class="uk-position-left level-exam-left-margin">
        <div class="uk-inline mr-text-diagram-title uk-text-center">عالی</div>
        <div class="uk-inline mr-text-diagram-title uk-text-center">خوب</div>
        <div class="uk-inline mr-text-diagram-title uk-text-center">متوسط</div>
        <div class="uk-inline mr-text-diagram-title uk-text-center">ضعیف</div>
    </div>
</div>`;
}

function getUnitQuizeLevel() {
  function renderActivityLevel(activities) {
    return `
      <table class="uk-table-small mr-questions-table uk-text-small uk-text-center mr-table-tin report-details">
      <thead>
          <th>سؤال</th>
          <th>سطح</th>
          <th>پاسخ شما</th>
          <th class="mr-lastlevel-column-width">خوداظهاری</th>
          <th>بازآموزی</th>
      </thead>
      <tbody>
          ${_renderActivityDetailsLevel.call(this, activities)}
      </tbody>
  </table>`;
  }

  function _renderActivityDetailsLevel(activities) {
    var childTmpl = "";
    forEach(activities, (r) => {
      const { answerId, difficultyLevelCaption, studentAnswer, reasonCaption } =
        r;
      childTmpl += `
      <tr>
          <td>${answerId}</td>
          <td>${difficultyLevelCaption ? difficultyLevelCaption : "--"}</td>
          <td>${this._renderAnswerCircle(studentAnswer)}</td>
          <td>${reasonCaption ? reasonCaption : "--"}</td>
          <td>
              <span class="uk-inline uk-width-1-1">
                  <a class="uk-position-center" uk-icon="eye"></a>
                  <a class="uk-position-center uk-text-primary" href="#modal-mobile" uk-icon="cornea" uk-toggle></a>
              </span>
          </td>
       </tr>`;
    });
    //
    return childTmpl;
  }

  return `${_DB[4]
    .filter(
      (v) =>
        startsWith(v.uniqueId, unit.uniqueId) &&
        v.personRoleId == student.personRoleId
    )
    .map(
      (quize) => `
          <ul class="uk-margin-remove" uk-accordion>
              <li class="quize-details__row">
                  <a class="uk-accordion-title" href="#">
                      <div class="uk-grid-match uk-grid-collapse" uk-grid>
                          <div class="uk-inline uk-text-small mr-padding-tiny width-80px">
                          ${this._renderDate(quize.examDateCaption)}
                          </div>
                          <div class="uk-inline uk-text-small uk-width-expand mr-padding-tiny">
                              ${this._renderStudyType(quize)}
                          </div>
                          <div class="uk-text-small uk-text-center uk-text-middle width-200px uk-margin-small-left">
                              <table class="mr-question-table uk-text-left">
                                  <tr>
                                  ${this._renderAnswerTemplate(quize)}
                                  </tr>
                              </table>
                          </div>
                          <div class="uk-inline width-60px uk-margin-small-left">
                              <div class="uk-text-small uk-text-left uk-position-center">${this._renderPercentAttribute(
                                quize.percent
                              )}</div>
                          </div>
                          <div class="uk-inline width-150px level-exam-left-margin">
                              <div class="uk-position-center">
                                  ${this._renderDegreeLevel(quize)}
                              </div>
                          </div>
                      </div>
                  </a>
                  <div class="uk-accordion-content InnerStudentlevelpadding report__inner-level--paddingVertical uk-margin-remove">

                  <!-- Level 6 Accardion محتوا-->
                      ${renderActivityLevel.call(
                        this,
                        _DB[4].filter(
                          (v) =>
                            startsWith(v.uniqueId, unit.uniqueId) &&
                            v.personRoleId == student.personRoleId
                        )
                      )}
                  </div>
              </li>
          </ul>
      `
    )
    .join("")}`;
}
