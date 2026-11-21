import axios from "axios";
import { $_ } from "../../../../common/utils/create.dom";
import { logify } from "../../../../common/utils/ukHelper";
// import * as UIkit from "uikit";

const teachersQuestionsModal = class {
  constructor(props) {
    const {
      container,
      gradeLessonId,
      _getActiveGradeData,
      handleQuizMakerAddTeachersQuestions,
      showLoader,
    } = props;

    this.container = container;
    this.state = {
      gradeLessonId,
      lessonList: [],
      gradeFieldId: 0,
      examList: [],
    };
    this.handleQuizMakerAddTeachersQuestions = (d, s) =>
      handleQuizMakerAddTeachersQuestions(d, s);
    this._getActiveGradeData = _getActiveGradeData;
    this.showLoader = showLoader;
    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    return this;
  }

  getTeachersQuestionsQuery(gradeLessonId = 0) {
    let query = `/api/School/GetTeacherExamList?gradeLessonId=${gradeLessonId}`;
    return query;
  }

  async fetchLessonList() {
    const query = this.getTeachersQuestionsQuery(this.state.gradeLessonId);
    const { data } = await axios(query);
    delete this.state.examList;
    this.state.examList = data;
  }

  async update() {
    await this.fetchLessonList(this.state.gradeLessonId);
    this.renderModalBody();
    this.bindModal();
  }

  async updateState(props) {
    const { gradeLessonId, gradeFieldId, lessonList } = props;

    this.state = { ...this.state, gradeLessonId, lessonList, gradeFieldId };
    await this.fetchLessonList();
    this.renderModalBody();
    this.bindModal();
  }

  resetInputs() {
    this.state.difficultCounted = 0;
    this.state.easyCounted = 0;
    this.state.intermediateCounted = 0;
  }

  renderModalBody() {
    $_.removeElementChildNodes(this.container);
    this.container.innerHTML = `<div  class="uk-modal-dialog uk-box-shadow-small">
    <div class="select-title">سؤال‌هاي ارسالي معلمان، درس</div>
    <select id="teachersQuestionsModalLessonSelectInput" class="uk-select">
    ${
      this.state.lessonList.length > 0
        ? this.state.lessonList
            .map(
              (lesson) =>
                `<option value="${lesson.gradeLessonId}" ${
                  this.state.gradeLessonId == lesson.gradeLessonId && "selected"
                }>${lesson.caption}</option>`
            )
            .join("")
        : ""
    }
    </select>
    <div class="teachers-question-pack">
    ${
      this.state.examList && this.state.examList["length"] > 0
        ? this.state.examList
            .map(
              (exam) =>
                `<div>
                  <ul>
                    <li class="teacher">${exam.teacherName}</li>
                    <li class="date"><span>${exam.examDate}</span></li>
                    <li class="title">${exam.testName}</li>
                    <li class="question-count">${exam.questionsCount} سؤال</li>
                    <li class="duration">${exam.duration} دقیقه</li>
                  </ul>
                    <button data-teachers-exam-id=${exam.examId} class="add-question-button uk-icon" uk-icon="icon: triangle-right; ratio: .9"></button>
                </div>`
            )
            .join("")
        : `<span>مجموعه سوال برای این درس ارائه نشده</span>`
    }
    </div>
    <a  class="uk-modal-close">بستن</a>                       
</div>
    `;
  }

  bindModal() {
    // Bind Lesson Selector
    const teachersQuestionsModalLessonSelectInput =
      this.container.querySelector("#teachersQuestionsModalLessonSelectInput");
    teachersQuestionsModalLessonSelectInput.addEventListener("change", () => {
      this.state.gradeLessonId = _.toNumber(
        teachersQuestionsModalLessonSelectInput.value
      );

      this.update();
    });

    this.bindSubmit();
  }

  bindSubmit() {
    const submitButtons = this.container.querySelectorAll(
      "button[data-teachers-exam-id]"
    );
    submitButtons.forEach((submitButton) => {
      submitButton.addEventListener("click", async (e) => {
        e.stopImmediatePropagation();
        let examId = _.toNumber(submitButton.dataset.teachersExamId);
        this.showLoader(5500);
        const teachersQuestionsResult = await axios(
          `/api/School/GetTeacherExamQuestions?examId=${examId}`
        );

        // console.log(teachersQuestionsResult.data);

        if (
          teachersQuestionsResult.data["length"] &&
          teachersQuestionsResult.data.length > 0
        )
          this.handleQuizMakerAddTeachersQuestions(
            teachersQuestionsResult.data,
            { ...this.state }
          );
      });
    });
  }
};

export default teachersQuestionsModal;
