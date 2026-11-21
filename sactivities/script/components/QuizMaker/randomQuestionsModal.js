import axios from "axios";
import { $_ } from "../../../../common/utils/create.dom";
import { logify } from "../../../../common/utils/ukHelper";
// import UIkit from "uikit";

const initialStateProps = {
  easyCount: 0,
  easyCounted: 0,
  intermediateCount: 0,
  intermediateCounted: 0,
  difficultCount: 0,
  difficultCounted: 0,
  easyDuplicate: false,
  intermediateDuplicate: false,
  difficultDuplicate: false,
};

const randomQuizModel = class {
  constructor(props) {
    const {
      container,
      gradeLessonId,
      parentGradeLessonId,
      _getActiveGradeData,
      handleQuizMakerAddRandomQuestions,
    } = props; //, gradeLessonId, gradeFieldId, lessonList } = props;

    this.container = container;
    this.state = {
      ...initialStateProps,
      gradeLessonId,
      parentGradeLessonId,
      lessonList: [],
      gradeFieldId: 0,
      units: [],
      dynamicSelectedIndex: 0,
      mainSelectedIndex: 0,
    };
    this.handleQuizMakerAddRandomQuestions = (d, s) =>
      handleQuizMakerAddRandomQuestions(d, s);
    this._getActiveGradeData = _getActiveGradeData;

    this.promiseReady = this.init();
    // this.mainSelect = null;
    // this.dynamicSelect = null;
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    return this;
  }

  async fetchUnitsList(gradeLessonId) {
    const { data } = await axios(
      `/api/School/GetLessonContent?gradeLessonId=${gradeLessonId}`
    );
    delete this.state.units;
    this.state.units = data.map((unit) => {
      return { ...unit, checked: false };
    });

    this.state.units[0].checked = true; // Manally select first unit
    //console.log(this.state.units);
  }

  generateAccidentalQuestionQuery(hasRelease = false) {
    let query = `/api/School/GetAccidentalQuestions?hasRelease=${hasRelease}&gradeLessonId=${
      this.state.gradeLessonId
    }&educationIdList=${[...this.state.units]
      .filter((unit) => unit.checked)
      .map((unit) => unit.id)
      .join(",")}&easyDuplicate=${
      this.state.easyDuplicate
    }&intermediateDuplicate=${
      this.state.intermediateDuplicate
    }&difficultDuplicate=${this.state.difficultDuplicate}${
      hasRelease
        ? `&easyRequestNumber=${this.state.easyCounted}&intermediateRequestNumber=${this.state.intermediateCounted}&difficultRequestNumber=${this.state.difficultCounted}`
        : ""
    }`;
    // console.log(query);
    return query;
  }

  async fetchQuestionCount() {
    const query = this.generateAccidentalQuestionQuery(false);
    const { data } = await axios(query);
    this.state = { ...this.state, ...data[0] };
  }

  async update() {
    await this.fetchUnitsList(this.state.gradeLessonId);
    await this.fetchQuestionCount();
    this.renderModalBody();
    this.bindModal();
  }

  async updateQuestionCount() {
    await this.fetchQuestionCount();
    this.renderModalBody();
    this.bindModal();
  }

  async updateState(props) {
    const { gradeLessonId, gradeFieldId, lessonList } = props;
    //console.log(gradeLessonId);

    this.state = { ...this.state, gradeLessonId, lessonList, gradeFieldId };
    //debugger;
    await this.fetchUnitsList(this.state.gradeLessonId);
    await this.fetchQuestionCount();
    this.renderModalBody();
    this.bindModal();
  }

  resetInputs() {
    this.state.difficultCounted = 0;
    this.state.easyCounted = 0;
    this.state.intermediateCounted = 0;
  }

  renderModalBody() {
    //console.log(this.state);
    $_.removeElementChildNodes(this.container);
    this.container.innerHTML = ` 
    <div class="uk-modal-dialog uk-box-shadow-small">
        <div class="select-title">سؤالات اتفاقي از درس</div>
        <select id="randomQuestionModalLessonSelectInput" class="uk-select">
        ${
          this.state.lessonList.length > 0
            ? this.state.lessonList
                .map((lesson) => {
                  return `<option data-parent-grade-lesson-id="${
                    lesson.parentGradeLessonId
                  }" value="${lesson.gradeLessonId}" ${
                    this.state.gradeLessonId == lesson.gradeLessonId
                      ? "selected"
                      : ""
                  }>${lesson.caption}</option>`;
                })
                .join("")
            : ""
        }
        </select>  
        <div class="source">
            <span>از ابتداي</span>
            <select id="selectUnitFrom_${this.state.gradeFieldId}_${
      this.state.gradeLessonId
    }" class="unit-range-select uk-select">
            ${this.state.units
              .map(
                (unit, i) =>
                  `<option value="${unit.id}" ${
                    i === this.state.mainSelectedIndex && "selected"
                  } >${unit.fullCaption}</option>`
              )
              .join("")}
            </select>
        </div>

        <div class="source">
            <span>تا انتهاي</span>
            <select id="selectUnitTo_${this.state.gradeFieldId}_${
      this.state.gradeLessonId
    }"  class="unit-range-select uk-select">
            ${this.state.units
              .map(
                (unit, i) =>
                  `<option value="${unit.id}"
                    ${i === this.state.dynamicSelectedIndex && "selected"}
                  >${unit.fullCaption}</option>`
              )
              .join("")}
            </select>
        </div>

        <div class="questions-statics">
        <div>
            <div class="info-block">
            <div class="easy-green">
                <input value=${
                  this.state.easyCounted
                } data-input-question-count-for="easyCount" type="number" value="0" max="${
      this.state.easyCount
    }" min="0">
                <label>آسان</label>
                <span class="max-available">${this.state.easyCount}</span>
                <label class="options-switcher">
                <label class="sharp-violet-switch">
                    <input data-component-type="easy" type="checkbox" ${
                      this.state.easyDuplicate ? "checked" : ""
                    }>
                    <span class="sharp-violet-slider itsEasy"></span>
                </label>
                <span>غيرتكراري</span>
                </label>
            </div>
            </div>
            <div class="info-block">
            <div class="med-orange">
                <input type="number" value=${
                  this.state.intermediateCounted
                } data-input-question-count-for="intermediateCount" value="0" max="${
      this.state.intermediateCount
    }" min="0">
                <label>متوسط</label>
                <span class="max-available">${
                  this.state.intermediateCount
                }</span>
                <label class="options-switcher">
                <label class="sharp-violet-switch">
                    <input data-component-type="intermediate" type="checkbox"  ${
                      this.state.intermediateDuplicate ? "checked" : ""
                    }>
                    <span class="sharp-violet-slider itsIntermediate"></span>
                </label>
                <span>غيرتكراري</span>
                </label>                                  
            </div>
            </div>

            <div class="info-block">
            <div class="hard-red">
                <input type="number" value=${
                  this.state.difficultCounted
                } data-input-question-count-for="difficultCount" value="0" max="${
      this.state.difficultCount
    }" min="0">
                <label>دشوار</label>
                <span class="max-available">${this.state.difficultCount}</span>
                <label class="options-switcher">
                <label class="sharp-violet-switch">
                    <input data-component-type="difficult" type="checkbox"  ${
                      this.state.difficultDuplicate ? "checked" : ""
                    }>
                    <span class="sharp-violet-slider itsHard"></span>
                </label>
                    <span>غيرتكراري</span>
                </label>                                  
            </div>
            </div>  
        </div>

        <div class="add-random" id="add_random_question_list_button" >
            <button 
            class="add-question-button uk-icon" uk-icon="icon: triangle-right; ratio: 1.3"></button>
            <span id="requested_question_count">0</span>
            <span>سؤال</span>
        </div>
        
        </div>
    <a class="uk-modal-close">بستن</a> 
    </div>`;
  }

  bindModal() {
    // Bind Lesson Selector
    const randomQuestionModalLessonSelectInput = this.container.querySelector(
      "#randomQuestionModalLessonSelectInput"
    );
    randomQuestionModalLessonSelectInput.addEventListener("change", () => {
      this.state.gradeLessonId = _.toNumber(
        randomQuestionModalLessonSelectInput.value
      );
      this.state.parentGradeLessonId = _.toNumber(
        $_.getSelectedOption(randomQuestionModalLessonSelectInput).dataset
          .parentGradeLessonId //.value
      );
      this.state.dynamicSelectedIndex = 0;
      this.state.mainSelectedIndex = 0;

      this.update();
    });

    // Bind Repeatitive checkboxes
    const checkboxes = this.container.querySelectorAll(
      "input[data-component-type]"
    );
    checkboxes.forEach((checkbox) =>
      checkbox.addEventListener("change", () => {
        let checkboxType = checkbox.dataset.componentType;
        this.state[`${checkboxType}Duplicate`] = checkbox.checked;
        this.updateQuestionCount();
      })
    );

    this.updateSelectedQuestionCountBadge();
    this.bindSlects();
    this.bindInputs();
    this.bindSubmit();
    //this.resetInputs();
  }

  updateSelectedQuestionCountBadge() {
    const selectedQuestionsCount = this.container.querySelector(
      "#requested_question_count"
    );
    selectedQuestionsCount.innerHTML =
      this.state.easyCounted +
      this.state.intermediateCounted +
      this.state.difficultCounted;
  }

  bindSlects() {
    const getSelectComponentUnitStatus = (unit, mainSelect, dynamicSelect) => {
      if (unit.sortOrder - 1 == dynamicSelect.selectedIndex) return true;
      if (unit.sortOrder - 1 == mainSelect.selectedIndex) return true;
      if (
        unit.sortOrder - 1 < dynamicSelect.selectedIndex &&
        unit.sortOrder - 1 > mainSelect.selectedIndex
      ) {
        return true;
      }
      if (
        unit.sortOrder - 1 < mainSelect.selectedIndex ||
        unit.sortOrder - 1 > dynamicSelect.selectedIndex
      )
        return false;
    };

    // init select component
    const [mainSelect, dynamicSelect] = this.container.querySelectorAll(
      "select.unit-range-select "
    );
    //let lessonDetailId = mainSelect.dataset.gradeLessonDetailId;

    mainSelect.addEventListener("change", (e) => {
      const index = mainSelect.selectedIndex;
      this.state.mainSelectedIndex = index;
      this.state.dynamicSelectedIndex = index;
      //console.log(index);
      dynamicSelect.selectedIndex = index;

      $_.pause(0).then(() => {
        //const stateRef = getLessonDetailRefrence(lessonDetailId);
        this.state.units.forEach(
          (unit) =>
            (unit.checked = getSelectComponentUnitStatus(
              unit,
              mainSelect,
              dynamicSelect
            ))
        );
        // console.log(this.state.units);
        this.updateQuestionCount();
      });
    });
    // mainSelect.dispatchEvent(new Event("change"));

    dynamicSelect.addEventListener("change", (e) => {
      e.stopImmediatePropagation();
      if (mainSelect.selectedIndex > dynamicSelect.selectedIndex) {
        e.preventDefault();
        logify(
          { status: "warning", pos: "bottom-center" },
          `بازه انتخابی نادرست می باشد`
        );
        dynamicSelect.selectedIndex = this.state.dynamicSelectedIndex; //mainSelect.selectedIndex;
        return false;
      }

      //const stateRef = getLessonDetailRefrence(lessonDetailId);
      $_.pause(0).then(() => {
        this.state.units.forEach(
          (unit) =>
            (unit.checked = getSelectComponentUnitStatus(
              unit,
              mainSelect,
              dynamicSelect
            ))
        );
        this.state.dynamicSelectedIndex = dynamicSelect.selectedIndex;
        //console.log(this.state.units);
        this.updateQuestionCount();
      });
    });
    // }
  }

  bindInputs() {
    const inputs = this.container.querySelectorAll(
      "input[data-input-question-count-for]"
    );
    inputs.forEach((input) => {
      let inputType = input.dataset.inputQuestionCountFor;
      input.addEventListener("keyup", () => {
        if (input.value > 40) {
          logify(
            { pos: "bottom-center", status: "warning", icon: "ban" },
            "امکان درخواست حداکثر 40 سوال فراهم می باشد"
          );
          input.value = 40;
        }
        this.state[`${inputType}ed`] = _.toNumber(input.value) || 0;
        this.updateSelectedQuestionCountBadge();
      });
    });
  }

  bindSubmit() {
    const submitButton = this.container.querySelector(
      "#add_random_question_list_button"
    );
    submitButton.addEventListener("click", async (e) => {
      e.stopImmediatePropagation();
      const isFormValid = this.validate();
      if (isFormValid === false) {
        e.preventDefault();
        // this.container.querySelector(
        //   "#random_question_modal_error_section"
        // ).innerHTML = "تعداد سوال انتخابی بیشتر از سوالات موجود است";
        return;
      }
      const query = this.generateAccidentalQuestionQuery(true);
      // console.log(query);
      const res = await axios(query);

      if (res.data["length"] && res.data.length > 0)
        this.handleQuizMakerAddRandomQuestions(
          res.data,
          { ...this.state }
          //_.toNumber(this.state.gradeLessonId)
        );
      this.resetInputs();
      this.renderModalBody();
      this.bindModal();
    });
  }

  validate() {
    let selectedSum =
      this.state.easyCounted +
      this.state.intermediateCounted +
      this.state.difficultCounted;
    if (selectedSum == 0) {
      logify(
        { status: "warning", pos: "bottom-center" },
        "تعداد سوالات درخواستی وارد نگردیده"
      );
      return false;
    }

    if (selectedSum > 40) {
      logify(
        { status: "warning", pos: "bottom-center" },
        "امکان ارائه حداکثر 40 سوال در مجموع فراهم می باشد"
      );
      return false;
    }

    if (
      this.state.easyCount < this.state.easyCounted ||
      this.state.intermediateCount < this.state.intermediateCounted ||
      this.state.difficultCount < this.state.difficultCounted
    ) {
      //debugger;
      logify(
        { status: "warning", pos: "bottom-center" },
        "تعداد سوال انتخابی بیشتر از سوالات موجود است"
      );
      return false;
    }
    return true;
  }
};

export default randomQuizModel;
