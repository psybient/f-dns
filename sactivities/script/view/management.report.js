import * as axios from "axios";
import { forEach } from "lodash";
import UIkit from "uikit";
import { downloadBlob } from "../../../common/utils/downloadBlob";
import { logify } from "../../../common/utils/ukHelper";
import { JsChart } from "../components/jsChart";
import { azmoon_mock } from "../model/mock_data";

export default class ManagementReportTemplate {
  constructor(data, chartsData) {
    data = data || azmoon_mock;
    // console.log(data);
    this.props = {
      data: data,
      charts: chartsData,
      reportTypesArray: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 34],
      sixMonthsAnniversaryReport: [
        20403, 20503, 20603, 30703, 30803, 30903, 41003, 41103, 42003, 42103,
        43003, 43103, 20406, 20506, 20606, 30706, 30806, 30906, 41006, 41106,
        42006, 42106, 43006, 43106,
      ],
    };

    this._lessonStatusCache = new Map(); // testNo -> lessons[]
    this.canShowCertificate = true;
  }

  async Render() {
    const certificateResult = await axios.get("/api/School/CanShowCertificate");

    this.canShowCertificate = certificateResult.data;

    await this._preloadLessonStatus(); // 🔥 before render
    var switches = "";
    var conteiner = "";

    forEach(this.props.data, (exam) => {
      switches += this._renderSwitch(exam);
      conteiner += this._renderContent(exam);
    });

    this.draw(switches, conteiner);
    this.__bindDownloads();

    $(".kalam").click(function (e) {
      //why
      $(this).focus();
    });
    // $(".kalam").on('click', function (e) {
    //   console.log("focused")
    //   $(this).trigger('focus')
    // });
  }

  draw(s, c) {
    let $switcher = document.getElementById("management_report_switcher");
    let $content = document.getElementById("management_report_content");
    let emptyHandler = document.getElementById("exam_report_container");
    let emptyText = document.getElementById("exam_empty_text");

    $switcher.innerHTML = s;
    $content.innerHTML = c;

    $switcher.childElementCount > 0
      ? (emptyText.style.display = "none")
      : (emptyHandler.style.display = "none");

    this._bindCharts();
  }

  __getQuizeSubGrades(grades) {
    //console.log(grades)
    let list = "";
    forEach(
      grades,
      (g) =>
        (list += `<li><a class="uk-border-rounded mr-padding-bit Percent70-font"
            href="#">${g.caption}</a></li>`),
    );
    return list;
  }

  _bindCharts() {
    const db = [...this.props.data];
    //console.log(db)
    const cdb = [...this.props.charts];
    db.map((exam) =>
      forEach(exam.data, (g) => {
        const feed = cdb
          .slice()
          .filter((test) => test.gradeFieldId === g.gradeFieldId);
        const ChartTitles = feed.slice().map((exam) => exam.title); //.slice().reverse();
        const scores = feed.slice().map((cdata) => cdata.balanceScore);
        const ranks = feed
          .slice()
          .map((cdata) => (cdata.allRank === 9999 ? 0 : cdata.allRank));
        const allParticipants = feed
          .slice()
          .map((cdata) => cdata.allParticipant);

        const chart_1 = document.getElementById(
          `myChart${exam.id + "_" + g.gradeFieldId}_1`,
        );
        const chart_2 = document.getElementById(
          `myChart${exam.id + "_" + g.gradeFieldId}_2`,
        );

        let chart1 = JsChart.initialize(
          chart_1,
          scores,
          ChartTitles,
          allParticipants,
          "#39f",
          "تراز",
          "right",
          false,
        );
        chart1();
        let chart2 = JsChart.initialize(
          chart_2,
          ranks,
          ChartTitles,
          allParticipants,
          "#f78645",
          "رتبه",
          "left",
          true,
        );
        chart2();
      }),
    );
  }

  _renderSwitch(exam) {
    const isDescriptive = Number(exam.type) !== 1;

    return `
      <li class="uk-text-center" ${exam.type}}>
        <a class="uk-margin-remove uk-accordion-title uk-text-center Percent90-font"
          href="#">
          ${isDescriptive ? exam.title.replace(/(\d+)/, "$1<br>") : exam.title}
          <br class="uk-visible@m"><span class="uk-hidden@m">&nbsp;&nbsp;(</span><span>${
            exam.examDate
          }</span><span class="uk-hidden@m">)</span></br></a>
        <div
          class="uk-accordion-content uk-margin-small-left uk-margin-small-right uk-border-rounded uk-margin-remove-top">
          <ul class="uk-nav uk-subnav-pill uk-margin-remove mobile-base-selector-flex"
            uk-switcher="connect: #Exam${exam.id};swiping: false">
            ${this.__getQuizeSubGrades(exam.data)}
          </ul>
        </div>
      </li>`;
  }

  async _preloadLessonStatus() {
    const requests = [];

    this.props.data.forEach((exam) => {
      if (Number(exam.type) !== 1) {
        exam.data.forEach((g) => {
          if (!this._lessonStatusCache.has(g.testNo)) {
            requests.push(
              axios
                .get(`/api/School/DirectScore_LessonsList?testno=${g.testNo}`)
                .then((res) => {
                  this._lessonStatusCache.set(
                    g.testNo,
                    Array.isArray(res.data) ? res.data : [],
                  );
                })
                .catch(() => {
                  this._lessonStatusCache.set(g.testNo, []);
                }),
            );
          }
        });
      }
    });

    await Promise.all(requests);
  }

  _renderContent(exam) {
    // console.log(exam);
    return `
      <li>
        <ul id="Exam${exam.id}" class="uk-switcher">
          ${this._renderQuizeForEachGrade(exam)}
        </ul>
      </li>`;
  }

  _renderQuizeForEachGrade(exam) {
    // console.log(exam);
    let list = [];
    const isDescriptive = Number(exam.type) !== 1;
    const isAllCorrected =
      isDescriptive && exam.data.every((e) => e.isCorrected);

    forEach(exam.data, (g) => {
      //Nested Grade data
      const lessons = this._lessonStatusCache.get(g.testNo) || [];
      list.push(`
          <li>
          <div uk-height-viewport="offset-top: true" 
               class="uk-child-width-1-3@m uk-grid-collapse uk-padding-small uk-padding-remove-vertical canvas-container
               ${!g.isCorrected && isDescriptive ? "not-all-corrected-control" : ""} " uk-grid>
          
          ${!g.isCorrected && isDescriptive ? `<div class="not-all-corrected-charts">` : ``} 
            <div class=" uk-width-1-2@m uk-padding uk-padding-remove-vertical uk-padding-remove-right canvas-mobile-chart" >
              <div>
                <div class="uk-text-center uk-light ">
                  <canvas class="uk-inline uk-width-1-1"
                    id="myChart${exam.id + "_" + g.gradeFieldId}_1">
                    Your browser does not support the HTML5
                    canvas tag.
                  </canvas>
                </div>
              </div>
            </div>

            <div class=" uk-width-1-2@m uk-padding uk-padding-remove-vertical uk-padding-remove-left canvas-mobile-chart">
              <div>
                <div class="uk-text-center uk-light ">
                  <canvas class="uk-inline uk-width-1-1"
                    id="myChart${exam.id + "_" + g.gradeFieldId}_2">
                    Your browser does not support the HTML5
                    canvas tag.
                  </canvas>          
                </div>
              </div>
            </div>  
          ${!g.isCorrected && isDescriptive ? `</div>` : ""}   
          <hr class="uk-width-1-1 uk-visible@m uk-margin-small-top	uk-margin-small-bottom">

          ${
            isDescriptive
              ? ``
              : `

          <div class="uk-text-center processes-container"> 
            <div id="diagram-container" class="diagram-container uk-inline" style="">
              <div class="line-box"></div>
              <div class="end-circle">
                <div></div>
              </div>
              <div class="start-circle">
                <div></div>
              </div>        
              <div class="end-line">
                <span>${g.examDate}</span>
              </div>        
              <div class="start-line">
                <span>${g.fromDate ? g.fromDate : ""}</span>
              </div>          
              <div class="arrow-right">
              </div>
            </div>


            <div class="slideshow-container" uk-slideshow="animation: push; ratio: false; index: 1">
              <div class="uk-position-relative uk-visible-toggle" tabindex="-1">
                ${this._renderDownloadableContentProcessShow(g, exam)}
              </div>
              <ul class="uk-slideshow-nav uk-dotnav uk-flex-center uk-margin"></ul>
            </div>  
          </div>`
          }


           
          ${isDescriptive ? `<div class="descriptive">` : ``} 

          <div class="results-container"> 
              <div>
              <div class="uk-padding-small uk-padding-remove-left uk-padding-remove-vertical mobile-progress-top">
                <div class="uk-text-left">
                  <span class="mr-percenttext-digit-primary smaller-font">
                        ${
                          g.cityRank === 9999
                            ? `کمتر از 15 شركت‌كننده (بدون رتبه بندی)`
                            : ` رتبه در
                        منطقه / شهر از
                        ${g.cityParticipant} مدرسه`
                        }
                  </span>
                </div>
                <div class="uk-grid-collapse uk-child-width-expand@s uk-text-center" uk-grid>
                  <div class="uk-inline uk-width-1-5 mr-Rank-Backcolor uk-border-rounded">
                    <span class="uk-position-center">${
                      g.cityRank === 9999 ? "-" : g.cityRank
                    }</span>
                  </div>
                  <div class="uk-width-4-5 mr-ltr uk-text-left mr-padding-tinyNotForced uk-padding-remove-left">
                    <progress class="uk-progress uk-margin-remove progress-height"
                              value="${
                                g.cityParticipant + 1 - g.cityRank
                              }" max="${g.cityParticipant}">
                    </progress>
                  </div>
                </div>
              </div>

              <div class="uk-padding-small uk-padding-remove-left uk-padding-remove-vertical mobile-progress-middle">
              <div class="uk-text-left">
                <span class="mr-percenttext-digit-primary smaller-font"> ${
                  g.stateRank === 9999
                    ? `کمتر از 15 شركت‌كننده (بدون رتبه بندی)`
                    : `رتبه در
                  استان از
                  ${g.stateParticipant} مدرسه`
                }</span>
              </div>
              <div class="uk-grid-collapse uk-child-width-expand@s uk-text-center"
                uk-grid>
                <div
                  class="uk-inline uk-width-1-5 mr-Rank-Backcolor uk-border-rounded">
                  <span class="uk-position-center">${
                    g.stateRank === 9999 ? "-" : g.stateRank
                  }</span>
                </div>
                <div
                  class="uk-width-4-5 mr-ltr uk-text-left mr-padding-tinyNotForced uk-padding-remove-left">
                  <progress
                    class="uk-progress uk-margin-remove progress-height"
                    value="${g.stateParticipant + 1 - g.stateRank}" max="${
                      g.stateParticipant
                    }"></progress>
                </div>
              </div>
              </div>
              
              <div class="uk-padding-small uk-padding-remove-left uk-padding-remove-vertical mobile-progress-bottom">
              <div class="uk-text-left">
                <span class="mr-percenttext-digit-primary smaller-font">${
                  g.allRank === 9999
                    ? `کمتر از 15 شركت‌كننده (بدون رتبه بندی)`
                    : `رتبه در کشور
                  از ${g.allParticipant}
                  مدرسه`
                }</span>
              </div>
              <div class="uk-grid-collapse uk-child-width-expand@s uk-text-center"
                uk-grid>
                <div
                  class="uk-inline uk-width-1-5 mr-Rank-Backcolor uk-border-rounded">
                  <span class="uk-position-center">${
                    g.allRank === 9999 ? "-" : g.allRank
                  }</span>
                </div>
                <div
                  class="uk-width-4-5 mr-ltr uk-text-left mr-padding-tinyNotForced uk-padding-remove-left">
                  <progress
                    class="uk-progress uk-margin-remove progress-height"
                    value="${g.allParticipant + 1 - g.allRank}" max="${
                      g.allParticipant
                    }"></progress>
                </div>
              </div>
              </div>
              </div>
                

                ${this._renderDownloadableContent(g, exam, isDescriptive)}

                
                ${isDescriptive ? `</div>` : ``} 

                ${
                  isDescriptive
                    ? ` <div class="descriptive-booklets">${lessons
                        .map(
                          (l) => `<a ${(l.hasTimePassed || l.present) 
                                        ? `href="${l.fileAddress}" target="_blank"` 
                                        : ``
                                      }
                                    ${l.hasTimePassed ? (l.present ? 'uk-icon="check"' : "uk-spinner") : ""} >
                                    ${l.lessonName}
                          </a>
                    `,
                        )
                        .join("")}  </div>`
                    : ``
                }

              </div>    
          </div>
        </li>`);
    });

    //  <hr class="uk-width-1-1 uk-visible@m">

    return list.join("");
  }

  _renderDownloadableContent(grade, exam, isDesc) {
    //const examId = examIdResponse["data"];
    // console.log(exam);
    let id_index = 0;
    //console.log(grade.testNo)
    const postFixId = (NEXT) => {
      // console.log({
      //   id_index,
      //   //type: this.props.reportTypesArray[id_index++],
      //   id: exam.id,
      // });
      return NEXT
        ? exam.id + "_" + grade.gradeFieldId + "_" + id_index++
        : exam.id + "_" + grade.gradeFieldId + "_" + id_index;
    };

    return `
    <div id="result_download_container" style="position: relative">
    <div class="bottons-width report-buttons-padding report-download-section  uk-inline" ${isDesc ? "hidden" : ""}>
      <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
      <button  class="uk-button uk-button-default uk-width-1-1 booklet-download uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
              uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
              onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
              دفترچه سؤال پاسخ آزمون
      </button>
      <span class="buttons-alternate reportmaker_${postFixId()} button-font-size booklet-download-alternate" hidden>دفترچه سؤال پاسخ آزمون</span>          
      <a class="[ js_static-downloadable-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
        true,
      )} uk-text-danger side-by-side-buttons pdf"
              uk-icon="icon:pdf-file; ratio:1.5"
              uk-tooltip="دانلود فایل PDF" hidden
              data-test-no="${grade.testNo}"
              href="#"
              target="_blank">
      </a>
    </div> 
      
    <div class="bottons-width report-buttons-padding report-download-section uk-inline">
          <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
          <button class="uk-button uk-button-default uk-width-1-1 uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
                  uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
                  onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
                  گزارش پایه‌ای دانش‌آموزان
          </button>
          <span class="buttons-alternate reportmaker_${postFixId()} button-font-size " hidden>گزارش پایه‌ای دانش‌آموزان</span>          
          <button class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId()}  uk-text-danger side-by-side-buttons pdf"
                  uk-icon="icon:pdf-file; ratio:1.5"
                  uk-tooltip="دانلود فایل PDF" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-report-type="1"
                  data-index-number="${id_index}"
                  data-file-type="pdf">
          </button>
          <button
                  class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
                    true,
                  )}  uk-text-success side-by-side-buttons xls"
                  uk-icon="icon:excel-file; ratio:1.5"
                  uk-tooltip="دانلود فایل Excel" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index - 1}"
                  data-report-type="1"
                  data-file-type="xls">
          </button>
        </div>          

        
        <div class="bottons-width report-buttons-padding report-download-section uk-inline">
          <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
          <button class="uk-button uk-button-default uk-width-1-1 uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
                  uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
                  onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
                  کارنمای کمی معلم
          </button>
          <span class="buttons-alternate reportmaker_${postFixId()} button-font-size " hidden>کارنمای کمی معلم</span>          
          <button class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId()} uk-text-danger side-by-side-buttons pdf"
                  uk-icon="icon:pdf-file; ratio:1.5"
                  uk-tooltip="دانلود فایل PDF" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index}"
                  data-report-type="2"
                  data-file-type="pdf">
          </button>
          <button
                  class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
                    true,
                  )} uk-text-success side-by-side-buttons xls"
                  uk-icon="icon:excel-file; ratio:1.5"
                  uk-tooltip="دانلود فایل Excel" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index - 1}"
                  data-report-type="2"
                  data-file-type="xls">
          </button>
        </div> 

        
        <div class="bottons-width report-buttons-padding report-download-section uk-inline" ${isDesc ? "hidden" : ""}>
          <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
          <button class="uk-button uk-button-default uk-width-1-1 uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
                  uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
                  onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
                  کارنمای کیفی معلم
          </button>
          <span class="buttons-alternate reportmaker_${postFixId()} button-font-size " hidden>کارنمای کیفی معلم</span>          
          <button class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId()} uk-text-danger side-by-side-buttons pdf"
                  uk-icon="icon:pdf-file; ratio:1.5"
                  uk-tooltip="دانلود فایل PDF" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index}"
                  data-report-type="3"
                  data-file-type="pdf">
          </button>
          <button
                  class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
                    true,
                  )} uk-text-success side-by-side-buttons xls"
                  uk-icon="icon:excel-file; ratio:1.5"
                  uk-tooltip="دانلود فایل Excel" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index - 1}"
                  data-report-type="3"
                  data-file-type="xls">
          </button>
        </div>       

        
        <div class="bottons-width report-buttons-padding report-download-section uk-inline">
          <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
          <button class="uk-button uk-button-default uk-width-1-1 uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
                  uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
                  onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
                  گزارش مقایسه مدرسه‌ها
          </button>
          <span class="buttons-alternate reportmaker_${postFixId()} button-font-size " hidden>گزارش مقایسه مدرسه‌ها</span>          
          <button class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId()} uk-text-danger side-by-side-buttons pdf"
                  uk-icon="icon:pdf-file; ratio:1.5"
                  uk-tooltip="دانلود فایل PDF" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index}"
                  data-report-type="4"
                  data-file-type="pdf">
          </button>
          <button
                  class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
                    true,
                  )} uk-text-success side-by-side-buttons xls"
                  uk-icon="icon:excel-file; ratio:1.5"
                  uk-tooltip="دانلود فایل Excel" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index - 1}"
                  data-report-type="4"
                  data-file-type="xls">
          </button>
        </div>

        
        <div class="bottons-width report-buttons-padding report-download-section uk-inline">
          <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
          <button class="uk-button uk-button-default uk-width-1-1 uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
                  uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
                  onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
                  گزارش مقایسه کلاس‌ها
          </button>
          <span class="buttons-alternate reportmaker_${postFixId()} button-font-size " hidden>گزارش مقایسه کلاس‌ها</span>          
          <button class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId()} uk-text-danger side-by-side-buttons pdf"
                  uk-icon="icon:pdf-file; ratio:1.5"
                  uk-tooltip="دانلود فایل PDF" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index}"
                  data-report-type="5"
                  data-file-type="pdf">
          </button>
          <button
                  class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
                    true,
                  )} uk-text-success side-by-side-buttons xls"
                  uk-icon="icon:excel-file; ratio:1.5"
                  uk-tooltip="دانلود فایل Excel" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index - 1}"
                  data-report-type="5"
                  data-file-type="xls">
          </button>
        </div>

        <div class="bottons-width report-buttons-padding report-download-section uk-inline"  ${isDesc ? "hidden" : ""}>
          <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
          <button class="uk-button uk-button-default uk-width-1-1 uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
                  uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
                  onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
                  گزارش توصیفی          
                   </button>
          <span class="buttons-alternate reportmaker_${postFixId()} button-font-size " hidden>گزارش توصیفی</span>          
          <button class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
            true,
          )} uk-text-danger side-by-side-buttons pdf"
                  uk-icon="icon:pdf-file; ratio:1.5"
                  uk-tooltip="دانلود فایل PDF" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index - 1}"
                  data-report-type="6"
                  data-file-type="pdf">
          </button>
        </div>

        ${
          this.canShowCertificate
            ? `
        <div class="bottons-width report-buttons-padding report-download-section uk-inline"  ${isDesc ? "hidden" : ""}>
          <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
          <button class="uk-button uk-button-default uk-width-1-1 uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
                  uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
                  onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
                  تقدیرنامه          
                   </button>
          <span class="buttons-alternate reportmaker_${postFixId()} button-font-size " hidden>تقدیرنامه</span>          
          <button class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
            true,
          )} uk-text-danger side-by-side-buttons pdf"
                  uk-icon="icon:pdf-file; ratio:1.5"
                  uk-tooltip="دانلود فایل PDF" hidden
                  data-test-number="${grade.testNo}"
                  data-exam-id="${exam.id}"
                  data-test-group="${exam.testGroup}"
                  data-grade-field-id="${grade.gradeFieldId}"
                  data-index-number="${id_index - 1}"
                  data-report-type="7"
                  data-file-type="pdf">
          </button>
        </div>`
            : ""
        }

        <div class="bottons-width report-buttons-padding report-download-section uk-inline" >
        <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
        <button class="uk-button uk-button-default uk-width-1-1 uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
                uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
                onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
                 کارنامه دانش آموزان          
                 </button>
        <span class="buttons-alternate reportmaker_${postFixId()} button-font-size " hidden>کارنامه دانش آموزان</span>          
        <button class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
          true,
        )} uk-text-danger side-by-side-buttons pdf"
                uk-icon="icon:pdf-file; ratio:1.5"
                uk-tooltip="دانلود فایل PDF" hidden
                data-test-number="${grade.testNo}"
                data-exam-id="${exam.id}"
                data-test-group="${exam.testGroup}"
                data-grade-field-id="${grade.gradeFieldId}"
                data-index-number="${id_index - 1}"
                data-report-type="${exam.type == 2 ? "12" : "8"}"
                data-file-type="pdf">
        </button>
      </div>
      
      ${
        this.props.sixMonthsAnniversaryReport.includes(grade.testNo)
          ? `<div class="bottons-width report-buttons-padding report-download-section uk-inline"  ${isDesc ? "hidden" : ""}>
        <div id="dnl_spinner_${postFixId()}" class="uk-margin-remove uk-position-center spinning reportmaker_${postFixId()}" uk-spinner hidden></div>
        <button class="uk-button uk-button-default uk-width-1-1 uk-border-rounded reportmaker_${postFixId()} uk-padding-remove button-font-size"
                uk-toggle="target: .reportmaker_${postFixId()}; animation: uk-animation-fade"
                onclick="setTimeout(function () {document.getElementById('dnl_spinner_${postFixId()}').style.display='none'}, 700); return false">
                 گزارش سالانه
                 </button>
        <span class="buttons-alternate reportmaker_${postFixId()} button-font-size " hidden>گزارش سالانه</span>          
        <button class="[ js-download-button ] uk-button uk-button-default uk-border-rounded reportmaker_${postFixId(
          true,
        )} uk-text-danger side-by-side-buttons pdf"
                uk-icon="icon:pdf-file; ratio:1.5"
                uk-tooltip="دانلود فایل PDF" hidden
                data-test-number="${grade.testNo}"
                data-exam-id="${exam.id}"
                data-test-group="${exam.testGroup}"
                data-grade-field-id="${grade.gradeFieldId}"
                data-index-number="${id_index - 1}"
                data-report-type="13"
                data-file-type="pdf">
        </button>
      </div>
      `
          : ""
      }
      ${
        grade.hasBeenPaid == false
          ? `
      <div class="not-allowed-download">
        <div>
          <p>لطفاً نسبت به فعال‌سازي آزمون اقدام نماييد.</p>
          <button data-refer-to-contracts-to-pay-for-exam-id="${exam.id}" class="uk-button">
            بخش سفارش
          </button>
        </div>    
      </div>`
          : ``
      }

      </div>      
      `;
    //})
  }

  _renderDownloadableContentProcessShow(grade, exam) {
    let id_index = 2000000; //number of reports
    // console.log(grade, exam);

    const postFixId = (NEXT) => {
      // console.log({
      //   id_index,
      //   //type: this.props.reportTypesArray[id_index++],
      //   id: exam.id,
      // });
      return NEXT
        ? exam.id + "_" + grade.gradeFieldId + "_" + id_index++
        : exam.id + "_" + grade.gradeFieldId + "_" + id_index;
    };
    return `
            <ul class="uk-slideshow-items">
            <li>
                <div>
                    <div class="uk-grid-collapse" uk-grid>
                        <div class="uk-width-2-3 uk-padding-small">
                            <p class="uk-text-primary uk-text-right uk-text-large uk-margin-small-bottom">روندنمای درس​ - کلاس</p>
                            <p class="uk-text-justify uk-text-small ">در این روندنما، نتایج خودارزیابی‌ها و زمان مطالعه دانش‌آموزان متناسب با محتوای آزمون هماهنگ در بازه زمانی آن در کنار نتایج آزمون هماهنگ در هر کلاس
                            به تفکیک درس نمایش داده می​‌شود.</p><br>
                        </div> 
                        <div class="uk-width-1-3 uk-inline">
                            <img class="uk-visible@m" src="/dist/assets/sactivity/advisor-image.png" alt="">
                            <button class="[ js-download-button ] 
                            uk-inline uk-button uk-button-primary mr-padding-small uk-text-large"
                                    uk-toggle="target: .reportmaker_${postFixId()}"
                                    data-test-number="${grade.testNo}"
                                    data-exam-id="${exam.id}"
                                    data-index-number="${id_index}"
                                    data-test-group="${exam.testGroup}"
                                    data-grade-field-id="${grade.gradeFieldId}"
                                    data-report-type="9"
                                    data-file-type="pdf">
                                    دانلود
                                    <div id="dnl_spinner_${postFixId()}" class="uk-icon uk-spinner uk-position-center-left reportmaker_${postFixId(
                                      true,
                                    )} uk-margin-small-left" uk-spinner hidden></div>
                            </button>                            
                        </div>
                    </div>
                </div>
            </li>
            <li>
                <div>
                    <div class="uk-grid-collapse" uk-grid>
                        <div class="uk-width-2-3 uk-padding-small">
                        <p class="uk-text-primary uk-text-right uk-text-large uk-margin-small-bottom">روندنمای کیفی معلم</p>
                        <p class="uk-text-justify uk-text-small ">در این روندنما، نتایج خودارزیابی‌ها و زمان مطالعه واحدهای یادگیری محتوای آزمون هماهنگ در بازه زمانی آن در کنار نتایج آزمون هماهنگ به تفکیک هر واحد یادگیری نمایش داده می​‌شود.</p><br>
                        </div> 
                        <div class="uk-width-1-3 uk-inline">
                        <img class="uk-visible@m" src="/dist/assets/sactivity/teacher-quality.png" alt="">
                            <button class="[ js-download-button ] uk-inline uk-button uk-button-primary mr-padding-small uk-text-large"
                                    uk-toggle="target: .reportmaker_${postFixId()}"
                                    data-test-number="${grade.testNo}"
                                    data-exam-id="${exam.id}"
                                    data-test-group="${exam.testGroup}"
                                    data-grade-field-id="${grade.gradeFieldId}"
                                    data-index-number="${id_index}"
                                    data-report-type="10"
                                    data-file-type="pdf">
                                    دانلود
                                    <div id="dnl_spinner_${postFixId()}" class="uk-icon uk-spinner uk-position-center-left reportmaker_${postFixId(
                                      true,
                                    )} uk-margin-small-left" uk-spinner hidden></div>
                            </button>
                            </div>
                            </div>
                            </div>
                            </li>               
                            <li>
                            <div>
                            <div class="uk-grid-collapse" uk-grid>
                            <div class="uk-width-2-3 uk-padding-small">
                            <p class="uk-text-primary uk-text-right uk-text-large uk-margin-small-bottom">روندنمای کمی معلم</p>
                            <p class="uk-text-justify uk-text-small ">در این روندنما، نتایج خودارزیابی‌ها و زمان مطالعه دانش‌آموزان متناسب با محتوای آزمون هماهنگ در بازه زمانی آن در کنار نتایج آزمون هماهنگ در هر درس به تفکیک هر دانش‌آموز نمایش داده می​‌شود.</p><br>
                            </div> 
                      <div class="uk-width-1-3 uk-inline">
                            <img class="uk-visible@m" src="/dist/assets/sactivity/teacher-quantitive.png" alt="">
                            <button class="[ js-download-button ] uk-inline uk-button uk-button-primary mr-padding-small uk-text-large"
                                    uk-toggle="target: .reportmaker_${postFixId()}"
                                    data-test-number="${grade.testNo}"
                                    data-exam-id="${exam.id}"
                                    data-test-group="${exam.testGroup}"
                                    data-grade-field-id="${grade.gradeFieldId}"
                                    data-report-type="11"
                                    data-index-number="${id_index}"
                                    data-file-type="pdf">
                                    دانلود
                                    <div id="dnl_spinner_${postFixId()}" class="uk-icon uk-spinner uk-position-center-left reportmaker_${postFixId(
                                      true,
                                    )} uk-margin-small-left" uk-spinner hidden></div>
                            </button>                           
                        </div>
                    </div>
                </div>
            </li>
        </ul>
      `;
  }

  // reportType = 1 > مشاور
  // reportType = 2 > معلم
  // reportType = 3 > زیر موضوعی
  // reportType = 4 > مقایسه مدرسه
  // reportType = 5 > مقایسه کلاس
  // reportType = 8 > روندنمای مشاور
  // reportType = 9 > روندنمای كمی علم
  // reportType = 10 > روندنمای كیفی معلم
  // requestType = pdf | xls

  // __bindDownloads() {
  //   const buttons = document.querySelectorAll(".js-download-button");
  //   const staticDownloadButton = document.querySelectorAll(
  //     ".js_static-downloadable-button",
  //   );
  //   //debugger
  //   staticDownloadButton.forEach((button) => {
  //     let testNo = button.dataset.testNo;
  //     //let href = button.getAttribute("href");
  //     //debugger
  //     axios(`/api/School/GetExamIdByTestNo?testNo=${testNo}`).then(
  //       (examIdResponse) => {
  //         button.setAttribute(
  //           "href",
  //           `https://meraatbooklet.s3.ir-thr-at1.arvanstorage.com/${examIdResponse.data}.pdf`,
  //         );
  //       },
  //     );
  //   });

  //   const getDownloadableContent = (options) => {
  //     // console.log(options);
  //     const _that = this;
  //     return new Promise(function (resolve, reject) {
  //       const {
  //         examId,
  //         testNo,
  //         testGroup,
  //         requestType,
  //         reportType,
  //         gradeFieldId,
  //         examType,
  //       } = options;
  //       //console.log({ options, reportType });
  //       try {
  //         axios({
  //           method: "post",
  //           url: `/api/School/GetSchoolReport?testGroup=${testGroup}&testNo=${testNo}&requestType=${requestType}&reportType=${_that.props.reportTypesArray[reportType]}`,
  //           responseType: "blob",
  //           timeout: 600 * 10000,
  //           config: { headers: { "Content-Type": "multipart/form-data" } },
  //         })
  //           .then((result) => {
  //             const url = window.URL.createObjectURL(new Blob([result.data]));
  //             resolve(
  //               downloadBlob(
  //                 url,
  //                 "report-" + new Date().getTime() + `.${requestType}`,
  //               ),
  //             );
  //           })
  //           .catch((err) => {
  //             reject(null);
  //           });
  //       } catch (err) {
  //         reject(null);
  //       }
  //     });
  //   };

  //   buttons.forEach((btn) => {
  //     btn.addEventListener("click", async () => {
  //       // debugger;
  //       let options = {};
  //       options.testNo = btn.dataset.testNumber;
  //       options.testGroup = btn.dataset.testGroup;
  //       options.gradeFieldId = btn.dataset.gradeFieldId;
  //       options.reportType = btn.dataset.reportType;
  //       options.requestType = btn.dataset.fileType;
  //       options.examId = btn.dataset.examId;
  //       options.index = btn.dataset.indexNumber;
  //       const hasPrivilege = await axios.get(
  //         `/api/School/GetTestContractStatus?testNo=${options.examId}`,
  //       );
  //       // console.log(hasPrivilege.data);
  //       if (hasPrivilege.data === false) {
  //         logify({ status: "error" }, `آزمون خریداری نشده`);
  //         return;
  //       }
  //       let spinner = document.getElementById(
  //         `dnl_spinner_${
  //           options.examId + "_" + options.gradeFieldId + "_" + options.index
  //           //this.props.reportTypesArray[options.reportType]
  //         }`,
  //       );
  //       // console.log(spinner, this.props.reportTypesArray[options.reportType]);
  //       btn.setAttribute("disabled", "true");
  //       try {
  //         if (spinner) spinner.style.display = "block";
  //         getDownloadableContent(options)
  //           .then((res) => {
  //             btn.removeAttribute("disabled");
  //             if (spinner) spinner.style.display = "none";
  //           })
  //           .catch((error) => {
  //             setTimeout(() => {
  //               try {
  //                 getDownloadableContent(options)
  //                   .then((res) => {
  //                     btn.removeAttribute("disabled");
  //                     if (spinner) spinner.style.display = "none";
  //                   })
  //                   .catch((error) => {
  //                     logify(
  //                       {
  //                         pos: "bottom-center",
  //                         status: "warning",
  //                         icon: "ban",
  //                       },
  //                       "خطا در ساخت گزارش",
  //                     );
  //                     if (spinner) spinner.style.display = "none";
  //                     btn.removeAttribute("disabled");
  //                   });
  //               } catch (err) {
  //                 // console.log(err);
  //                 if (spinner) spinner.style.display = "none";
  //                 btn.removeAttribute("disabled");
  //               }
  //             }, 13000);
  //           });
  //       } catch (err) {
  //         console.log(err);
  //         btn.removeAttribute("disabled");
  //       }
  //     });
  //   });

  //   const goToContractsButtons = document.querySelectorAll(
  //     "[data-refer-to-contracts-to-pay-for-exam-id]",
  //   );

  //   if (goToContractsButtons.length > 0) {
  //     goToContractsButtons.forEach((btn) =>
  //       btn.addEventListener("click", () => {
  //         this.handleGotoContractsTab();
  //       }),
  //     );
  //   }
  // }

  __bindDownloads() {
    const buttons = document.querySelectorAll(".js-download-button");
    const staticDownloadButton = document.querySelectorAll(
      ".js_static-downloadable-button",
    );

    staticDownloadButton.forEach((button) => {
      const testNo = button.dataset.testNo;
      axios
        .get(`/api/School/GetExamIdByTestNo?testNo=${testNo}`)
        .then((examIdResponse) => {
          button.setAttribute(
            "href",
            `https://meraatbooklet.s3.ir-thr-at1.arvanstorage.com/${examIdResponse.data}.pdf`,
          );
        })
        .catch(() => {
          // silent – static booklet is not critical
        });
    });

    const getDownloadableContent = (options, attempt = 1) => {
      const _that = this;
      const maxAttempts = 4;
      // Longer delays for later attempts (certificate can take a long time)
      const delays = [0, 8000, 15000, 25000];

      return new Promise((resolve, reject) => {
        const {
          examId,
          testNo,
          testGroup,
          requestType,
          reportType,
          gradeFieldId,
        } = options;

        const doRequest = () => {
          axios({
            method: "post",
            url: `/api/School/GetSchoolReport?testGroup=${testGroup}&testNo=${testNo}&requestType=${requestType}&reportType=${_that.props.reportTypesArray[reportType]}`,
            responseType: "blob",
            timeout: 10 * 60 * 1000, // 10 minutes
          })
            .then((result) => {
              const url = window.URL.createObjectURL(new Blob([result.data]));
              resolve(
                downloadBlob(
                  url,
                  "report-" + new Date().getTime() + `.${requestType}`,
                ),
              );
            })
            .catch(() => {
              // Never throw / never log to console
              if (attempt < maxAttempts) {
                const nextDelay = delays[attempt] || 20000;
                setTimeout(() => {
                  getDownloadableContent(options, attempt + 1)
                    .then(resolve)
                    .catch(reject);
                }, nextDelay);
              } else {
                reject(null); // only reject after all retries are exhausted
              }
            });
        };

        // First attempt has no delay
        if (attempt === 1) {
          doRequest();
        } else {
          // subsequent attempts already waited in the previous catch
          doRequest();
        }
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const options = {
          testNo: btn.dataset.testNumber,
          testGroup: btn.dataset.testGroup,
          gradeFieldId: btn.dataset.gradeFieldId,
          reportType: btn.dataset.reportType,
          requestType: btn.dataset.fileType,
          examId: btn.dataset.examId,
          index: btn.dataset.indexNumber,
        };

        try {
          const hasPrivilege = await axios.get(
            `/api/School/GetTestContractStatus?testNo=${options.examId}`,
          );

          if (hasPrivilege.data === false) {
            logify({ status: "error" }, `آزمون خریداری نشده`);
            return;
          }
        } catch {
          // privilege check failed – treat as not allowed
          logify({ status: "error" }, `آزمون خریداری نشده`);
          return;
        }

        const spinner = document.getElementById(
          `dnl_spinner_${options.examId}_${options.gradeFieldId}_${options.index}`,
        );

        btn.setAttribute("disabled", "true");
        if (spinner) spinner.style.display = "block";

        getDownloadableContent(options)
          .then(() => {
            // success – nothing to do
          })
          .catch(() => {
            // all retries failed
            logify(
              {
                pos: "bottom-center",
                status: "warning",
                icon: "ban",
              },
              "خطا در ساخت گزارش",
            );
          })
          .finally(() => {
            if (spinner) spinner.style.display = "none";
            btn.removeAttribute("disabled");
          });
      });
    });

    const goToContractsButtons = document.querySelectorAll(
      "[data-refer-to-contracts-to-pay-for-exam-id]",
    );

    if (goToContractsButtons.length > 0) {
      goToContractsButtons.forEach((btn) =>
        btn.addEventListener("click", () => {
          this.handleGotoContractsTab();
        }),
      );
    }
  }

  handleGotoContractsTab() {
    const switcher = document.getElementById("main_tab_switcher");
    const order = document.getElementById("order");
    UIkit.switcher(switcher).show(
      Array.from(order.parentNode.children).indexOf(order),
    );
  }
}
