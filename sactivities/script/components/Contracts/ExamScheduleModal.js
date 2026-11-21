import UIkit from "uikit";
import axios from "axios";
// import { $_ } from "../../../../common/utils/create.dom";
const ExamScheduleModal = class {
  constructor(props) {
    // console.log(props);
    this.modalElement = null;
    this.modal = null;
    this.modalBody = null;
    this.state = { data: [], history: new Map() };
    this.promiseReady = this.init();
  }

  init() {
    this.modalElement = document.getElementById("exam_schedule_modal");
    this.modal = UIkit.modal(this.modalElement);
    this.modalBody = this.modalElement.querySelector(
      "#exam_schedule_modal_body"
    );
    return this;
  }
  ready() {
    return this.promiseReady;
  }
  async fetchData(gradeFieldId,examTypeId) {
    const res = await axios.get(
      `/api/School/GetExamSchedule?gradeFieldId=${gradeFieldId}&examTypeId=${examTypeId}`,
    );
    // console.log(quizSchedulRes);
    return res.data;
  }
  async render(gradeFieldId, examTypeId = 156) {
    const markup = [];
    if (gradeFieldId == 0) {
      markup.push(`<div class="exam-info">اشکال در لود</div>`);
    } else {
      const data = await this.fetchData(gradeFieldId, examTypeId);
      // console.log(data);
      const { activeYear, secondCaption, gradeFieldCaption } = data[0];
      markup.push(
        `<div class="exam-info">
					<p>برنامه آزمون ${gradeFieldCaption}</p>
					<p>${activeYear}</p>
          ${examTypeId == 156 ?
            `<a href="https://www.meraat.ir/download/webpublicresource-examschedules-examschedulesresourceno_${gradeFieldId}.pdf" target="_blank">دانلود برنامه آزمون</a>`
            : examTypeId == 57 
              ? `<a href="https://www.meraat.ir/download/webpublicresource-examschedules-examschedulesresourceno_descriptive_${gradeFieldId}.pdf" target="_blank">دانلود برنامه آزمون</a>`
              : ``
          }
				</div>
        <div class="exam-items">
        ${data
          .map((exam) => {
            const { examDate, caption, secondCaption } = exam;
            return `<div>
					            <p examNo="${secondCaption}">${caption}</p><p>
                        ${examTypeId == 57 && secondCaption > 3 ? `<small>متعاقباً اعلام<br>مي‌شود</small>` : examDate.replace(/^0+/, "")}
                      </p>
				            </div>`;
          })
          .join("")}
          </div>`
      );
      //   this.data.exams.forEach((exam) => console.log(exam));
    }
    this.modalBody.innerHTML = markup.join("");
  }
};
export default ExamScheduleModal;
