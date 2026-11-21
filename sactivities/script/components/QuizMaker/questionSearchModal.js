import axios from "axios";
import { $_ } from "../../../../common/utils/create.dom";
import { logify } from "../../../../common/utils/ukHelper";

const questionSearchModal = class {
  constructor(props) {
    const {
      container,
      gradeLessonId,
      _getActiveGradeData,
      showLoader,
      handleQuizMakerAddSearchedQuestion,
      gradeFieldId,
    } = props; //, gradeLessonId, gradeFieldId, lessonList } = props;

    this.container = container;
    this.state = {
      searchQuery: "",
      questionList: [],
      fullQuestionList: [],
      activeQuestionId: 0,
      gradeFieldId,
    };
    this.handleQuizMakerAddSearchedQuestion = (d) =>
      handleQuizMakerAddSearchedQuestion(d);
    this._getActiveGradeData = _getActiveGradeData;
    this.questionModalSearchButton = null;
    this.searchQuestionInputBox = null;
    this.searchQuestionResultContainer = null;
    this.searchQuestionImageContainer = null;
    this.searchQuestionAddToQuizSheetButton = null;
  }

  async init() {
    // this.state = { ...this.state, gradeLessonId, lessonList, gradeFieldId };
    // await this.fetchQuestionList();
    this.renderModalBody();
    await $_.pause(50);
    this.questionModalSearchButton = this.container.querySelector(
      "#question_modal_search_button"
    );

    this.searchQuestionInputBox = this.container.querySelector(
      "#question_modal_search_textbox"
    );

    this.searchQuestionResultContainer = this.container.querySelector(
      "#question_modal_result_container"
    );

    this.searchQuestionImageContainer = this.container.querySelector(
      "#question_modal_image_container"
    );

    this.searchQuestionAddToQuizSheetButton = this.container.querySelector(
      "#question_search_add_to_quiz_sheet_button"
    );

    this.searchQuestionAddToQuizSheetButton.setAttribute(
      "disabled",
      "disabled"
    );

    this.searchQuestionAddToQuizSheetButton.addEventListener(
      "click",
      async () => {
        const questionData = await this.fetchQuestionNodes(
          this.state.activeQuestionId
        );

        this.handleQuizMakerAddSearchedQuestion(questionData);

        this.reset();
      }
    );

    this.questionModalSearchButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const isCustom = e.isTrusted;
      if (this.searchQuestionInputBox.value.length)
        if (this.searchQuestionInputBox.value.split(",").length > 40) {
          logify(
            { status: "warning", pos: "bottom-center" },
            `تعداد سوالات مشخص شده باید کمتر از 40 مورد باشد`
          );
          return;
        }
      this.state.searchQuery = this.searchQuestionInputBox.value;
      // const questionList =
      if (isCustom === true) await this.fetchQuestionImages();
      if (this.state.questionList.length === 0) {
        this.searchQuestionResultContainer.innerHTML = isCustom
          ? `<span>سوالی پیدا نشد!</span>`
          : "";
        this.state.activeQuestionId = 0;
        this.searchQuestionAddToQuizSheetButton.setAttribute(
          "disabled",
          "disabled"
        );
        return;
      }
      this.searchQuestionAddToQuizSheetButton.removeAttribute("disabled");
      this.state.activeQuestionId = this.state.questionList[0];
      $_.removeElementChildNodes(this.searchQuestionResultContainer);
      $_.removeElementChildNodes(this.searchQuestionImageContainer);
      const resMarkup = this.getSerchResultMarkup();

      this.searchQuestionResultContainer.innerHTML = resMarkup
        .map((q) => q.node)
        .join("");

      this.searchQuestionImageContainer.innerHTML = resMarkup
        .map((q) => q.image)
        .join("");

      this.container
        .querySelectorAll(`a[data-found-question-id]`)
        .forEach((element) => {
          let id = _.toNumber(element.dataset.foundQuestionId);
          element.addEventListener("click", () => {
            this.state.activeQuestionId = id;
          });
        });

      this.container
        .querySelectorAll(`button[data-found-question-remove-button-id]`)
        .forEach((element) => {
          let id = _.toNumber(element.dataset.foundQuestionRemoveButtonId);
          element.addEventListener("click", async () => {
            const removedQuestionList = $_.removeElementFromArray(
              this.state.questionList,
              id
            );
            const removedQuestionFullList = $_.removeElementFromArrayOfOjects(
              this.state.fullQuestionList,
              id
            );

            delete this.state.questionList;
            delete this.state.fullQuestionList;
            this.state.questionList = removedQuestionList;
            this.state.fullQuestionList = removedQuestionFullList;

            await this.init();

            this.questionModalSearchButton.dispatchEvent(new Event("click"));

            if (this.state.questionList.length > 0) {
              this.state.activeQuestionId = this.state.questionList[0];
              this.container.querySelector(
                "#question_modal_search_textbox"
              ).value = this.state.questionList.join(",");
            }
          });
        });
    });
    return this;
  }

  getSerchResultMarkup() {
    return this.state.questionList.map((id) => {
      let questionImages = this.state.fullQuestionList.filter(
        (q) => q.dataId === id
      );
      return {
        node: `<li ><a href="#" data-found-question-id="${id}">${id}</a>
                    <button data-found-question-remove-button-id="${id}" type="button" uk-close></button>
              </li>`,
        image: `<li>
              ${questionImages
                .map((img) => ` <img src="${img.address}">`)
                .join("")}
             </li>`,
      };
    });
  }

  async fetchQuestionImages() {
    let query = `/api/School/GetTestMakerRangeQuestionImages?dataIds=${this.state.searchQuery.split(
      ","
    )}&gradeFieldId=${this.state.gradeFieldId}`;
    const { data } = await axios(query);
    delete this.state.questionList; // = const foundQuestions = [];
    delete this.state.fullQuestionList;
    this.state.questionList = [];
    data.forEach((element) => {
      if (this.state.questionList.includes(element.dataId) === false)
        this.state.questionList.push(element.dataId);
    });
    await $_.pause(0);
    this.state.fullQuestionList = [...data];
  }

  async updateState(props) {
    const { gradeFieldId } = props;
    //console.log(gradeLessonId);

    this.state = { ...this.state, gradeFieldId };
    //debugger;
  }

  async fetchQuestionNodes() {
    let query = `/api/School/LoadSelectedQuestionIds?dataIds=${this.state.questionList.join(
      ","
    )}&gradeFieldId=${this.state.gradeFieldId}`;
    const { data } = await axios(query);
    return data;
  }

  updateFoundQuestionSection() {}

  async reset() {
    delete this.state.questionList;
    delete this.state.fullQuestionList;
    this.state.questionList = [];
    this.state.fullQuestionList = [];
    this.state.activeQuestionId = 0;
    await this.init();
  }

  renderModalBody() {
    $_.removeElementChildNodes(this.container);
    this.container.innerHTML = `
    <div class="uk-modal-dialog uk-box-shadow-small">
    <button id="question_search_add_to_quiz_sheet_button" class="add-searched-question-button uk-icon" data-quiz-number="1707" uk-icon="icon: triangle-right; ratio: 1"></button>
    <div class="uk-search uk-search-default uk-width-1-1 uk-border-rounded">
      <a href="" id="question_modal_search_button" uk-search-icon="true" class="uk-icon uk-search-icon"></a>  
      <input  id="question_modal_search_textbox" class=" uk-search-input uk-box-shadow-small uk-border-rounded uk-text-small" type="search" placeholder="جستجوي سؤال ... , ... , ..." value="">
    </div>
    <div class="search-result" id="result_container">
      <ul id="question_modal_result_container" class="uk-subnav uk-subnav-pill" uk-switcher="animation: uk-animation-fade">
                                                                                                                                                                                          
      </ul>
      <ul id="question_modal_image_container" class="uk-switcher uk-margin">
          
      </ul>
    </div>
    <p class="uk-modal-close">بستن</p>    
</div>
    `;
  }
};

export default questionSearchModal;
