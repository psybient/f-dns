import axios from "axios";
import { logify } from "../../../common/utils/ukHelper";
import { $_ } from "../../../common/utils/create.dom";
import LazyLoad from "vanilla-lazyload";
import Sortable from "sortablejs";
import _, { indexOf } from "lodash";
import "@majidh1/jalalidatepicker";
import * as UIkit from "uikit";
import quizHistory from "./quiz.history.tab";
import moment from "moment-jalaali";
import randomQuestionsModal from "../components/QuizMaker/randomQuestionsModal";
import teachersQuestionsModal from "../components/QuizMaker/teachersQuestionsModal";
import CoverTemplateModal from "../components/QuizMaker/coverTemplateModal";
import questionSearchModal from "../components/QuizMaker/questionSearchModal";
import treeSelectUtils from "../utils/tree-select.util";
import stateModel from "../model/quizMaker-state-model";
const {
  getInitialState,
  getQuizCheckboxesStatus,
  questionNodeDefaultValues,
  quizInputsInitialData,
} = stateModel;
const { treeDomHandler, hierarchyTreeDomHandler } = treeSelectUtils;

const quizMakerTabSwitcherArray = [10011, 10012, 10013];
const quizMakerTabSwitcherNameArray = ["آنلاین", "حضوری", "اختصاصی"];

const quizMaker = class {
  constructor(props) {
    this.state = getInitialState(props);
    // console.log(this.state);
    this.gradesSelect = null;
    this.lazyLoader = null;
    this.loader = null;
    this.questionBlock = null;
    this.tabSwitcher = null;
    this.mainSortable = null;
    this.cancelEditingButton = null;
    this.questionImageModal = null;
    this.quizSheetSortableSection = null;
    this.specialQuizSheetSortableSection = null;
    this.examHistory = null;
    this.quizSheetEntranceWrapper = null;
    this.questionsListPanel = null;
    this.questionCountBadge = null;
    this.submitBlock = null;
    this.submitQuizButton = null;
    this.preparedQuizesAccordionContainer = null;
    this.preparedQuizesModalToggler = null;
    this.quizSheetEntranceWrapper = null;
    this.randomQuestionsModalComponent = null;
    this.randomQuestionsModalWrapper = null;
    this.quizDate = null;
    this.quizClassListFieldset = null;
    this.teachersQuestionsModalComponent = null;
    this.teachersQuestionsModalWrapper = null;
    this.questionSearchModalComponent = null;
    this.questionSearchModalWrapper = null;
    this.emptyTemplateTogller = null;
    this.serverDate = null;
    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    // try {
    const gradeFieldsResult = await axios.get(
      "/api/School/GetTestMakerGradeField",
    );
    // console.log(gradeFieldsResult);
    // debugger;
    if (gradeFieldsResult.status === 200)
      gradeFieldsResult.data.forEach((grade) => this.state.grades.push(grade));
    else {
      console.log("Error Fetching data");
      return;
    }

    // generate an array structure to hold info for each grade
    this.state.grades.forEach((grade) =>
      this.state.data.push({
        lessonList: [],
        quizSheet: new Map(),
        quizSheetBase: new Map(),
        specialQuizSheet: new Map(),
        questions: new Map(),
        classes: new Map(), //[],
        seasonUnits: new Map(),
        units: new Map(),
        detailUnits: new Map(),
        sortableComponent: null,
        sheetSequence: [],
        sheetSequenceBase: [],
        specialSheetSequence: [],
        isEditingMode: false,
        isSpecialEditingMode: false,
        editingData: { id: 0, mode: "" },
        specialEditingData: { id: 0, mode: "" },
        gradeFieldId: grade.gradeFieldId,
        // baseGradeFieldId: grade.gradeLessonId,
        isTemplateModalConfirmed: false,
      }),
    );

    this.gradesSelect = document.getElementById("school_grade_list");
    this.loader = document.querySelector(".main-loader");
    this.questionImageModal = document.getElementById("mobileModalImages");
    this.quizClassListFieldset = document.getElementById("quizClassList");
    this.questionBlock = document.getElementById(
      "quize_maker_question_section",
    );
    this.quizSheetEntranceWrapper = document.getElementById(
      "selection_questions_entrance",
    );
    this.questionsListPanel =
      document.getElementsByClassName("selections-part")[0];
    this.tabSwitcher = document.getElementById("quize_maker_tab_switcher");
    this.cancelEditingButton = document.getElementById("cancel_quize_editing");
    this.quizDate = document.getElementById("quizDate");
    this.quizStartTimeElement = document.getElementById("quizStartTime");
    this.quizEndTimeElement = document.getElementById("quizEndTime");
    const startTimeOptions =
      this.quizStartTimeElement.querySelectorAll("option");
    this.quizStartTimeElement.addEventListener("change", (e) => {
      startTimeOptions.forEach((el) => {
        if (el.value.trim() === e.target.value.trim()) {
          el.setAttribute("selected", "selected");
        } else {
          el.removeAttribute("selected");
        }
      });

      const endTimeOptions = this.quizEndTimeElement.querySelectorAll("option");
      this.quizEndTimeElement.addEventListener("change", (e) => {
        endTimeOptions.forEach((el) => {
          if (el.value.trim() === e.target.value.trim()) {
            el.setAttribute("selected", "selected");
          } else {
            el.removeAttribute("selected");
          }
        });
      });
    });

    //this.cancelEditingButton = document.getElementById("cancel_quize_editing");
    this.questionCountBadge = document.getElementById("question_count_badge");
    this.submitBlock = document.getElementById("quizMaker_submit_block");
    this.submitQuizButton = document.getElementById("submit_quize_button");
    // console.log(this.state);
    if (this.checkHasTestMaker() === false) {
      this.submitQuizButton.classList.add("not-allowed-to-use");
    }

    const _that = this;

    setTimeout(function () {
      //moy -- timeout added to prevent calling  "exam_creation" & "exam_maker_wrapper" before load
      UIkit.util.on("#karpooshe_main_section", "shown", async function () {
        if (
          document
            .getElementById("exam_creation")
            .classList.contains("uk-active") &&
          document
            .getElementById("exam_maker_wrapper")
            .classList.contains("uk-active")
        ) {
          const getContractStatusResult = await axios.get(
            `/api/School/GetContractStatus`,
          );
          // console.log(getContractStatusResult.data);
          const contractsStatus = getContractStatusResult.data;
          delete _that.state.contractsStatus;
          _that.state["contractsStatus"] = contractsStatus;
          if (
            _that.checkHasTestMaker(
              contractsStatus,
              _that.state.activeGrade.id,
            ) === false
          ) {
            _that.submitQuizButton.classList.add("not-allowed-to-use");
          } else {
            if (_that.submitQuizButton.classList.contains("not-allowed-to-use"))
              _that.submitQuizButton.classList.remove("not-allowed-to-use");
          }
          // console.log("exam maker is selected");
        }
      });
    }, 3000);
    // if(this.state.contractsStatus)
    // let btnSubmit = this.submitBlock.querySelector("button");
    // this.quizSheetEntranceWrapper =document
    //     .getElementById("selection_questions_entrance")
    this.preparedQuizesAccordionContainer = document.getElementById(
      "prepared-quizes_accordion_container",
    );
    this.preparedQuizesModalToggler = document.getElementById(
      "prepared_quizes_modal_toggler",
    );
    this.teachersQuestionsModalWrapper = document.getElementById(
      "teachers_questions_modal_wrapper",
    );

    this.questionSearchModalWrapper = document.getElementById(
      "question_search_modal_wrapper",
    );

    this.quizSheetSortableSection =
      document.getElementById("quiz_sheet_section");
    this.specialQuizSheetSortableSection = document.getElementById(
      "specialQuizSheetContainer",
    );
    // const _that = this;

    // Initiate Bindings

    [...Object.keys(this.state.quizInputs)].forEach((key, i) => {
      const inputElement = document.getElementById(key);

      if (inputElement) {
        let type = inputElement.getAttribute("type");
        inputElement.addEventListener("change", async (e) => {
          // Handles standard components data binding
          if (type) this.state.quizInputs[key] = inputElement.value;
        });
      }
    });

    document.getElementById("quizName").addEventListener("keydown", (e) => {
      this.state.quizInputs["quizName"] = e.target.value;
    });

    // This should move into cover template code and change by refrence soon
    document
      .getElementById("quiz_submit_template_modal_reject_buttom")
      .addEventListener("click", () => {
        // console.log("abort changing template");
        this._getActiveGradeData().isTemplateModalConfirmed = false;
      });

    // Prevent uikit switcher event and trigger it manualy
    //  update state befor animation ends
    this.tabSwitcher.querySelectorAll("li").forEach((link) => {
      link.addEventListener("click", (e) => {
        let index = _.toNumber(link.firstChild.dataset.tabIndex);
        let id = _.toNumber(link.firstChild.dataset.tabId);
        if (this.state.activeTab.id === id) return;
        // set active tab manually and instantly in state
        this.state.activeTab.id = id;
        this.state.activeTab.name = link.firstChild.textContent;
        // this.examHistory.setExamType(id);
        // this.cancelEditingButton;
        this._setEditButtonVisibility();
        this.tabSwitcher
          .querySelectorAll("li")
          [index].dispatchEvent(new Event("click"));
        // UIkit.switcher(this.tabSwitcher).show(index);
      });
    });

    if (
      this.quizSheetSortableSection &&
      $_.isElement(this.quizSheetSortableSection)
    ) {
      const sortable = Sortable.create(this.quizSheetSortableSection, {
        dataIdAttr: "gradeLessonId",
        group: `mainSortabeGroup`,
        // dataIdAttr: 'gradeId',
        // choosenClass: 'drag-selected-gray',
        dragClass: "drag-selected-blue",
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.85,
        onEnd: function (evt) {
          const options = {
            id: _.toNumber(evt.clone.dataset.gradeLessonId),
            oldIndex: evt.oldIndex,
            newIndex: evt.newIndex,
          };
          if (options.oldIndex === options.newIndex) return;
          let data = _that._getActiveGradeData();
          const sortedSheetSequence = $_._moveArrayItem(
            data.sheetSequence,
            options.oldIndex,
            options.newIndex,
          );
          delete data.sheetSequence;
          data.sheetSequence = sortedSheetSequence;
          _that._updateQuizSheetQuestionsOrder();
          _that._renderQuizSheet();
        },
      });
    }
    const specialSortable = Sortable.create(
      this.specialQuizSheetSortableSection,
      {
        dataIdAttr: "gradeLessonId",
        group: `mainSpecialSortabeGroup`,
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.85,
        onEnd: function (evt) {
          const options = {
            id: _.toNumber(evt.clone.dataset.gradeLessonId),
            oldIndex: evt.oldIndex,
            newIndex: evt.newIndex,
          };
          if (options.oldIndex === options.newIndex) return;
          let data = _that._getActiveGradeData();
          const sortedSheetSequence = $_._moveArrayItem(
            data.specialSheetSequence,
            options.oldIndex,
            options.newIndex,
          );
          delete data.specialSheetSequence;
          data.specialSheetSequence = sortedSheetSequence;
          _that._updateQuizSheetQuestionsOrder("specialSheetSequence");
          _that._renderSpecialQuizSheet();
        },
      },
    );

    jalaliDatepicker.startWatch({
      autoHide: true,
      showEmptyBtn: false,
      zIndex: 99999999,
      // minDate: "today",
    });

    // collapse toggler
    document
      .getElementById("quiz_sheet_collapse_toggle_on")
      .addEventListener("click", () => {
        this.state.isQuizSheetCollapse = true;
        this.submitBlock.style.display = "none";
      });
    document
      .getElementById("quiz_sheet_collapse_toggle_off")
      .addEventListener("click", () => {
        this.state.isQuizSheetCollapse = false;
        this.submitBlock.style.display = "block";
      });
    // Save exam button
    // document
    //   .getElementById("submit_quize_button")
    this.submitQuizButton.addEventListener("click", async () => {
      _that.showLoader(500);
      if (_that.checkHasTestMaker(null, _that.state.activeGrade.id) === false) {
        // debugger;
        _that.submitQuizButton.classList.add("not-allowed-to-use");
        _that.handleGotoContractsTab();
        return false;
      } else {
        const getContractStatusResult = await axios.get(
          `/api/School/GetContractStatus`,
        );
        // console.log(getContractStatusResult.data);
        const contractsStatus = getContractStatusResult.data;

        if (
          _that.checkHasTestMaker(
            contractsStatus,
            _that.state.activeGrade.id,
          ) === false
        ) {
          delete this.state.contractsStatus;
          this.state["contractsStatus"] = contractsStatus;
          this.submitQuizButton.classList.add("not-allowed-to-use");
          this.handleGotoContractsTab();
          return false;
        }
      }
      const examType = this.state.activeTab.id;
      let activeGradeData = this._getActiveGradeData();
      if (this.state.quizInputs.quizClassList.length === 0) {
        isValidToSubmit = false;
        logify(
          { status: "warning", pos: "bottom-center" },
          "کلاس یا کلاسهای مورد نظر جهت سنجش را انتخاب نمایید",
        );
        return;
      }

      if (examType !== 10013 && activeGradeData.sheetSequence.length === 0) {
        isValidToSubmit = false;
        logify(
          { status: "warning", pos: "bottom-center" },
          "درسی برای آزمون انتخاب نشده",
        );
        return;
      }

      if (
        examType === 10013 &&
        activeGradeData.specialSheetSequence.length === 0
      ) {
        isValidToSubmit = false;
        logify(
          { status: "warning", pos: "bottom-center" },
          "درسی برای آزمون انتخاب نشده",
        );
        return;
      }

      let isValidToSubmit = await this.validate();
      if (isValidToSubmit === false) return;
      // if (isValidToSubmit === false) {
      //   if (this.checkHasTestMaker()) {
      //     //s {
      //     // debugger;
      //     this.handleGotoContractsTab();
      //   }
      //   return;
      // }
      // } else {
      //   // if (this.state.quizInputs.quizClassList.length === 0) {
      //   //   isValidToSubmit = false;
      //   //   logify(
      //   //     { status: "warning", pos: "bottom-center" },
      //   //     "کلاس یا کلاسهای مورد نظر جهت سنجش را انتخاب نمایید"
      //   //   );
      //   //   return;
      //   // }
      // }

      let isInEditMode =
        activeGradeData.isEditingMode || activeGradeData.isSpecialEditingMode;
      let shouldUseId = false;
      if (isInEditMode) {
        if (activeGradeData.isEditingMode && examType !== 10013) {
          if (activeGradeData.editingData.mode === "edit") shouldUseId = true;
        } else {
          if (activeGradeData.isSpecialEditingMode && examType === 10013) {
            if (activeGradeData.specialEditingData.mode === "edit")
              shouldUseId = true;
          }
        }
      }

      if (activeGradeData.isTemplateModalConfirmed) {
        UIkit.modal("#uk_template_modal_component").hide();
        const json = this.generateServerJson(
          shouldUseId
            ? activeGradeData[
                examType !== 10013 ? "editingData" : "specialEditingData"
              ].id
            : 0,
        );

        // console.log(json);
        // debugger;
        let response = await axios
          .post("/api/School/SaveTestMakerSettings", json)
          .catch((err) => console.log(err));
        // console.log(response);
        if (response && response.data && response.data > 0) {
          activeGradeData.isTemplateModalConfirmed = false;
          let changeMode = "ثبت";
          if (
            activeGradeData.isEditingMode &&
            this.state.activeTab.id !== 10013
          ) {
            changeMode = "ویرایش";
            activeGradeData.isEditingMode = false;
          }
          if (
            activeGradeData.isSpecialEditingMode &&
            this.state.activeTab.id === 10013
          ) {
            changeMode = "ویرایش";
            activeGradeData.isSpecialEditingMode = false;
          }
          this.reset(activeGradeData);
          logify(
            { status: "success", pos: "bottom-center" },
            `آزمون ${this.state.activeTab.name} در پایه ${this.state.activeGrade.name}  با موفقیت ${changeMode} گردید`,
          );
          await $_.pause(1000);
          // if (changeMode === "ثبت")
          await Promise.resolve(
            this.examHistory.reRender(true)//.updateOpenAccordions(response.data),
          );
          logify(
            { status: "success", pos: "bottom-center" },
            `به صفحه مدیریت آزمونهای ساخته شده منتقل می شوید . . . `,
          );
          await $_.pause(1500);

          await this.examHistory.show();
        } else
          logify({ status: "warning", pos: "bottom-center" }, `اشکال در ثبت`);
      } else {
        // Yganeh // added to bind options-color with input for first time ///////////////
        UIkit.util.on(
          "#uk_template_modal_component",
          "beforeshow",
          function () {
            document.getElementById("options_face").style.backgroundColor =
              document.getElementById("optionNumberRGB").value;
          },
        );
        //////////////////////////////////////////////////////////////
        UIkit.modal("#uk_template_modal_component").show();
        activeGradeData.isTemplateModalConfirmed = true;
      }
    });

    // Instatiate Quiz History Tab
    this.examHistory = await new quizHistory({
      setExamEditingEnvironment: (id, type, data) =>
        this.setExamEditingEnvironment(id, type, data),
      showLoader: (time) => this.showLoader(time),
      grades: [...this.state.grades],
    }).ready();

    // Random questions Modal
    this.randomQuestionsModalWrapper = document.getElementById(
      "randomQuestionsModalWrapper",
    );
    //console.log(this.state.activeGradeLessonId);
    this.randomQuestionsModalComponent = await new randomQuestionsModal({
      container: this.randomQuestionsModalWrapper,
      handleQuizMakerAddRandomQuestions: (d, s) =>
        this.handleQuizMakerAddRandomQuestions(d, s),
      gradeLessonId: this.state.activeGradeLessonId,
      parentGradeLessonId: this.state.activeBaseGradeLessonId,
      // Instatiate RandomQuestions Modal base on active grade
      // Later on we will use update() method to re-render modal base on active grade
    }).ready();

    this.questionSearchModalComponent = await new questionSearchModal({
      container: this.questionSearchModalWrapper,
      handleQuizMakerAddSearchedQuestion: (d) =>
        this.handleQuizMakerAddSearchedQuestion(d),
      _getActiveGradeData: () => this._getActiveGradeData(),
      showLoader: () => this.showLoader(),
      gradeFieldId: this.state.activeGrade.id,
      // parentGradeLessonId: this.state.activeGradeLessonId,
      gradeLessonId: this.state.activeBaseGradeLessonId, //activeGradeLessonId,
      // Instatiate RandomQuestions Modal base on active grade
      // Later on we will use update() method to re-render modal base on active grade
    }).init();

    // set cover template default values here
    this.coverTemplateModal = new CoverTemplateModal("template_modal", {
      // separateFirstPage: true,
      templateId: 1,
      templateType: false,
      questionNumberRGB: "#FF0000",
      optionNumberRGB: "#00B050",
      optionNumberForm: 1,
      collectorName: "",
      hasJustQuestionFace: false,
      hasMediaLink: true,
    });

    this.preparedQuizesModalToggler.addEventListener("click", async () => {
      this.showLoader(5000);
      const preparedQuizListResult = await axios(
        `/api/School/GetExamHistory?gradefieldid=${this.state.activeGrade.id}`,
      );

      // console.log(preparedQuizListResult.data);
      $_.removeElementChildNodes(this.preparedQuizesAccordionContainer);
      this.preparedQuizesAccordionContainer.innerHTML =
        preparedQuizListResult.data
          .map((d) => {
            //console.log(d);
            return `<li class="">
              <a class="uk-accordion-title" href="#">
              <span>${d.caption} (<span dir="ltr">${
                d.educationalYear
              }</span>)</span>
              <span>${d.presentNo} نفر<br>${d.examDate}</span>
              </a>
              <button class="add-question-button uk-icon" data-quiz-number="${
                d.examId
              }" uk-icon="icon: triangle-right; ratio: .9"></button>
              <div class="uk-accordion-content">
                  <div>
                    <table>
                      <tbody>
                       ${d.details
                         .map(
                           (item) =>
                             `<tr><td>${item.lessonName}</td><td>${item.questionNumber} سؤال</td><td>${item.description}</td></tr>`,
                         )
                         .join("")}
                      </tbody>
                    </table>
                  </div>
              </div>
          </li>`;
          })
          .join("");

      this.showLoader(0, "hide");

      $_.pause(100).then(() => {
        const addPreparedQuizButtons =
          this.preparedQuizesAccordionContainer.querySelectorAll(
            "button.add-question-button",
          );
        addPreparedQuizButtons.forEach((btn) => {
          // const activeGrade = this._getActiveGradeData();
          btn.addEventListener("click", async (e) => {
            await this.handleQuizMakerAddPreparedQuestion(btn);
          });
          //});
        });
      });
    });
    this.teachersQuestionsModalComponent = await new teachersQuestionsModal({
      container: this.teachersQuestionsModalWrapper,
      handleQuizMakerAddTeachersQuestions: (d, s) =>
        this.handleQuizMakerAddTeachersQuestions(d, s),
      gradeLessonId: this.state.activeBaseGradeLessonId,
      _getActiveGradeData: () => this._getActiveGradeData(),
      //handleQuizMakerAddTeachersQuestions,
      showLoader: () => this.showLoader(),
      // Instatiate RandomQuestions Modal base on active grade
      // Later on we will use update() method to re-render modal base on active grade
    }).ready();
    // This ensures that the class instance's reference is updated with the generated static DOM elements and their bindings
    // only after all the inside components have been rendered and bound asynchronously.
    this.emptyTemplateTogller = (() => {
      let emptyExamMakerHandler = document.getElementById(
        "exam_maker_container",
      );
      let emptyExamMakerText = document.getElementById("exam_maker_empty_text");
      return (status) => {
        if (status) {
          emptyExamMakerText.removeAttribute("hidden");
          emptyExamMakerHandler.style.display = "none";
        } else {
          emptyExamMakerText.setAttribute("hidden", "true");
          emptyExamMakerHandler.style.display = "block";
        }
      };
    })();

    this.serverDate = await this._getServerDate();
    return this;
  }

  // Main rendering callback
  render() {
    // console.log(this.state.grades);
    if (this.state.grades.length > 0) {
      // emptyExamMakerText.setAttribute("hidden", "true");
      // emptyExamMakerHandler.style.display = "block";
      this.emptyTemplateTogller(false);
    } else {
      this.emptyTemplateTogller(true);
    }
    this.gradesSelect.innerHTML += this.state.grades
      .map(
        ({ gradeFieldId, gradeFieldCaption }) =>
          `<option value="${gradeFieldId}" data-option-grade-field-id="${gradeFieldId}">${gradeFieldCaption}</option>`,
      )
      .join("");

    this.gradesSelect.addEventListener("change", async (e) => {
      let gradeId = _.toNumber(e.target.value);

      if (this.state.activeGrade.id !== gradeId) {
        this.state.activeGrade.id = gradeId;
        this.state.activeGrade.name = $_.getSelectedOption(
          e.target,
        ).textContent;
      }
      await this.renderGrade();
      if (this.checkHasTestMaker(null, gradeId) === false) {
        this.submitQuizButton.classList.add("not-allowed-to-use");
      } else this.submitQuizButton.classList.remove("not-allowed-to-use");
    });

    this.cancelEditingButton.classList.remove("editmode");
    this.cancelEditingButton.addEventListener("click", () => {
      this._resetState();
      this.renderGrade();
      //switch back
      this.examHistory.show();
      this.questionCountBadge.innerHTML = "";
      // document
      //   .getElementById("selection_questions_entrance")
      this.quizSheetEntranceWrapper.classList.add("disable-entrance");
    });
    $_.pause(10).then(() => this._setActiveGrade(0));

    // Init lazyLoader component
    const questionsLazyLoad = new LazyLoad({
      container: this.questionBlock,
    });
    this.lazyLoader = questionsLazyLoad;
  }

  async addNewGrade(gradeFieldInfo) {
    // console.log(gradeFieldInfo);
    this.state.grades.push(gradeFieldInfo);
    this.state.data.push({
      lessonList: [],
      quizSheet: new Map(),
      quizSheetBase: new Map(),
      specialQuizSheet: new Map(),
      questions: new Map(),
      classes: new Map(), //[],
      units: new Map(),
      detailUnits: new Map(),
      seasonUnits: new Map(),
      sortableComponent: null,
      sheetSequence: [],
      sheetSequenceBase: [],
      specialSheetSequence: [],
      isEditingMode: false,
      isSpecialEditingMode: false,
      editingData: { id: 0, mode: "" },
      specialEditingData: { id: 0, mode: "" },
      gradeFieldId: gradeFieldInfo.gradeFieldId,
      // baseGradeFieldId: grade.gradeLessonId,
      isTemplateModalConfirmed: false,
    });

    this.gradesSelect.innerHTML += `<option value="${gradeFieldInfo.gradeFieldId}" 
          data-option-grade-field-id="${gradeFieldInfo.gradeFieldId}">${gradeFieldInfo.gradeFieldCaption}</option>`;
    // const _gradeRef = this._getActiveGradeData(_.toNumber(gradeFieldInfo.id));
    // _gradeRef.classes.clear();
    this.state.activeGrade.id = gradeFieldInfo.gradeFieldId;
    await this._renderLessonContainer();
    this._setActiveGrade(gradeFieldInfo.gradeFieldId);
    this.emptyTemplateTogller(false);
    // await this.renderGrade();
  }
  async resetGradeClassess(gradeFieldId) {
    let noExammakerBanner = document
      .getElementById("exam_maker_empty_text")
      .hasAttribute("hidden");
    if (noExammakerBanner) {
      const _gradeRef = this._getActiveGradeData(gradeFieldId);
      _gradeRef.classes.clear();
      await this.renderGrade();
      this.emptyTemplateTogller(false);
    }
  }
  async removeClass(gradeFieldId) {
    const gradeFieldsResult = await axios.get(
      "/api/School/GetTestMakerGradeField",
    );
    // console.log(gradeFieldsResult);
    if (gradeFieldsResult.status === 200) {
      delete this.state.grades;
      this.state.grades = [];
      gradeFieldsResult.data.forEach((grade) => this.state.grades.push(grade));
      let toRemoveGradeFieldIds = [];
      this.state.data.forEach((gradeData) => {
        if (
          this.state.grades.filter(
            (g) => g.gradeFieldId === gradeData.gradeFieldId,
          ).length === 0
        ) {
          toRemoveGradeFieldIds.push(gradeData.gradeFieldId);
        }
      });
      const _gradeRef = this._getActiveGradeData(gradeFieldId);

      if (toRemoveGradeFieldIds.length === 0) {
        _gradeRef.classes.clear();
        delete _gradeRef.lessonList;
        _gradeRef.lessonList = [];
        this._setActiveGrade(gradeFieldId);
      } else {
        // toRemoveGradeFieldIds.forEach((id) =>
        const newData = $_.removeElementFromArrayOfOjects(
          this.state.data,
          toRemoveGradeFieldIds[0],
          "gradeFieldId",
        );
        // );
        delete this.state.data;
        this.state.data = newData;
        $_.removeElementChildNodes(this.gradesSelect);
        this.gradesSelect.innerHTML += this.state.grades
          .map(
            ({ gradeFieldId, gradeFieldCaption }) =>
              `<option value="${gradeFieldId}" data-option-grade-field-id="${gradeFieldId}">${gradeFieldCaption}</option>`,
          )
          .join("");
        if (this.state.grades.length > 0) {
          this._setActiveGrade(this.state.grades[0].gradeFieldId);
          this.emptyTemplateTogller(false);
        } else this.emptyTemplateTogller(true);
      }
    } else {
      console.log("Error Fetching data");
      return;
    }
  }

  // Main rendering function that re-renders view base on selected grade
  async renderGrade() {
    if (this.state.initialPass !== true) this.showLoader();

    // const quizClassListFieldset = document.getElementById("quizClassList");
    $_.removeElementChildNodes(this.quizClassListFieldset);
    const dataGradeRef = this._getActiveGradeData();

    // init new classList strategy
    const classListFetcher = async (id) =>
      await axios.get(`/api/School/GetClassesGroup?gradefieldid=${id}`);

    if (dataGradeRef.classes.size === 0) {
      const classListResults = await classListFetcher(
        this.state.activeGrade.id,
      );
      const { data } = classListResults;
      // console.log(data);
      data.forEach((user) =>
        dataGradeRef.classes.set(user.classGroupNo, [...user.items]),
      );
    }

    let markup = "";
    dataGradeRef.classes.forEach((value, key) => {
      markup += `<li><input class="uk-checkbox" ${
        this.state.quizInputs.quizClassList.includes(key) ? "checked" : ""
      } type="checkbox" value="${key}" data-node-id="${key}" data-node-type="root" >
      <label class="uk-accordion-title">كلاس ${key}</label>
      <div class="uk-accordion-content">
        ${value
          .map(
            (user) =>
              `<label><input class="uk-checkbox" type="checkbox" value="${
                user.studentNo
              }" ${
                this.state.quizInputs.quizStudentList.includes(user.studentNo)
                  ? "checked"
                  : ""
              }
              data-parent-unit-id="${key}"
              data-node-type="leaf">${
                user.firstName + " " + user.lastName
              }</input></label>`,
          )
          .join("")}
      </div>
      </li>`;
    });

    $_.removeElementChildNodes(this.quizClassListFieldset);
    this.quizClassListFieldset.innerHTML = markup;
    await $_.pause(10);

    const leafs = this.quizClassListFieldset.querySelectorAll(
      'input[data-node-type="leaf"]',
    );
    const roots = this.quizClassListFieldset.querySelectorAll(
      'input[data-node-type="root"]',
    );
    const nodes = this.quizClassListFieldset.querySelectorAll("input");
    nodes.forEach((node) => {
      node.addEventListener("click", async (e) => {
        this.showLoader();
        await $_.pause(101);
        treeDomHandler(this.quizClassListFieldset, node);

        // psy set value for class list and student list
        const selectedStudents = [...leafs]
          .filter((leaf) => leaf.checked)
          .map((leaf) => _.toNumber(leaf.value));
        delete this.state.quizInputs.quizStudentList;
        this.state.quizInputs.quizStudentList = [...selectedStudents];

        const selectedRoots = [...roots]
          .filter(
            (root) => root.checked || root.classList.contains("half-checked"),
          )
          .map((root) => _.toNumber(root.value));
        // console.log(selectedRoots);
        delete this.state.quizInputs.quizClassList;
        this.state.quizInputs.quizClassList = [...selectedRoots];
      });
    });

    await this._renderLessonContainer();
    await this._renderSpecialQuizLessonContainer();
    await this._renderQuizSheet();
    await this._renderSpecialQuizSheet();
    await this._renderQuizSettings();
    // await this.randomQuestionsModalComponent.show({
    //   //container: randomQuestionsModalWrapper,
    //   gradeFieldId: this.state.activeGrade.id,
    //   gradeLessonId: this.state.activeGradeLessonId,
    //   lessonList: this._getActiveGradeData().lessonList,
    // });
    this._setEditButtonVisibility();
    if (this.state.initialPass) this.state.initialPass = false;
  }

  _setEditButtonVisibility() {
    let examTypeId = this.state.activeTab.id;
    let dataGradeRef = this._getActiveGradeData();
    if (dataGradeRef.isEditingMode && examTypeId !== 10013)
      this.cancelEditingButton.classList.add("editmode");
    else if (dataGradeRef.isSpecialEditingMode && examTypeId === 10013)
      this.cancelEditingButton.classList.add("editmode");
    else this.cancelEditingButton.classList.remove("editmode");

    if (dataGradeRef.isEditingMode || dataGradeRef.isSpecialEditingMode) {
      this.examHistory.toggleSwitcherDisablity(true);
      this.tabSwitcher.style.pointerEvents = "none";
    } else {
      this.examHistory.toggleSwitcherDisablity(false);
      this.tabSwitcher.style.pointerEvents = "inherit";
    }

    if (examTypeId === 10013) {
      this.quizSheetEntranceWrapper.style.top = "50000000000px";
      this.questionsListPanel.style.display = "none";
    } else {
      this.quizSheetEntranceWrapper.style.top = "17px";
      this.questionsListPanel.style.display = "block";
    }

    let startTimeWrapper = this.quizStartTimeElement.closest("div.time-input");
    let endTimeWrapper = this.quizEndTimeElement.closest("div.time-input");
    let quizDateWrapper = this.quizDate.parentElement;
    let classListDisabler =
      this.quizClassListFieldset.parentElement.querySelector(
        "div.class-select-input",
      );

    if (examTypeId === 10013 || examTypeId === 10012) {
      startTimeWrapper.classList.add("time-input-disabled");
      endTimeWrapper.classList.add("time-input-disabled");
    } else {
      startTimeWrapper.classList.remove("time-input-disabled");
      endTimeWrapper.classList.remove("time-input-disabled");
      // classListDisabler.classList.remove("time-input-disabled");
      // quizDateWrapper.classList.remove("date-input-disabled");
    }
  }

  async setExamEditingEnvironment(examId, editMode, datum) {
    // console.log(datum);
    const {
      // separateFirstPage,
      templateId,
      templateType,
      questionNumberRGB,
      optionNumberRGB,
      optionNumberForm,
      collectorName,
      hasJustQuestionFace,
      hasMediaLink,
      ...inputsAndSettings
    } = datum.testMakerSettings;

    this.coverTemplateModal.setInputValues({
      // separateFirstPage,
      templateId,
      templateType,
      questionNumberRGB,
      optionNumberRGB,
      optionNumberForm,
      collectorName,
      hasJustQuestionFace,
      hasMediaLink,
    });
    [...Object.keys(this.state.quizSettings)].forEach((key) => {
      if (inputsAndSettings[key])
        this.state.quizSettings[key] = inputsAndSettings[key];
    });
    [...Object.keys(this.state.quizInputs)].forEach((key) => {
      if (inputsAndSettings[key]) {
        this.state.quizInputs[key] = inputsAndSettings[key];
        if (
          key !== "quizClassList" &&
          key !== "quizStudentList" &&
          key !== "quizStartTime" &&
          key !== "quizEndTime"
        ) {
          document.getElementById(key).value = inputsAndSettings[key];
        }
        if (key === "quizStartTime") {
          let time = inputsAndSettings[key].slice(0, -3);
          this.quizStartTimeElement.value = time;
          this.quizStartTimeElement.querySelectorAll("option").forEach((el) => {
            if (el.value.trim() === time)
              el.setAttribute("selected", "selected");
            else el.removeAttribute("selected");
          });
        }
        if (key === "quizEndTime") {
          let time = inputsAndSettings[key].slice(0, -3);
          this.quizEndTimeElement.value = time;
          this.quizEndTimeElement.querySelectorAll("option").forEach((el) => {
            if (el.value.trim() === time)
              el.setAttribute("selected", "selected");
            else el.removeAttribute("selected");
          });
        }
      }
    });

    this.state.quizSettings.isQuizNagativePoint =
      inputsAndSettings.quizNagativePoint;
    this.state.quizSettings.isFinalCalculation = inputsAndSettings.quizFactor;

    let capsulationRef = this._getActiveGradeData(
      inputsAndSettings.gradeFieldId,
    );
    // debugger;
    // this.state.data.filter(
    //   (ref) => ref.gradeFieldId === inputsAndSettings.gradeFieldId
    // )[0];

    let examTypeId = inputsAndSettings.quizTypeId;
    let tabIndex = quizMakerTabSwitcherArray.indexOf(examTypeId);
    this.state.activeTab.id = examTypeId;
    this.state.activeTab.name = quizMakerTabSwitcherNameArray[tabIndex];

    if (examTypeId !== 10013) {
      capsulationRef.isEditingMode = true; //examId;
      capsulationRef.editingData.id = examId;
      capsulationRef.editingData.mode = editMode;
      capsulationRef.quizSheet.clear();
      inputsAndSettings.questionNodes.forEach((node) => {
        if (capsulationRef.quizSheet.has(node.gradeLessonId))
          capsulationRef.quizSheet.set(node.gradeLessonId, [
            ...capsulationRef.quizSheet.get(node.gradeLessonId),
            node,
          ]);
        else capsulationRef.quizSheet.set(node.gradeLessonId, [node]);
      });
      delete capsulationRef.sheetSequence;
      capsulationRef.sheetSequence = [];
      capsulationRef.quizSheet.forEach((value, key) => {
        capsulationRef.sheetSequence.push(key);
      });
    } else {
      capsulationRef.isSpecialEditingMode = true; //examId;
      capsulationRef.specialEditingData.id = examId;
      capsulationRef.specialEditingData.mode = editMode;
      capsulationRef.quizSheet.clear();
      inputsAndSettings.questionNodes.forEach((node) => {
        if (capsulationRef.specialQuizSheet.has(node.gradeLessonId))
          capsulationRef.specialQuizSheet.set(node.gradeLessonId, [
            ...capsulationRef.specialQuizSheet.get(node.gradeLessonId),
            node,
          ]);
        else capsulationRef.specialQuizSheet.set(node.gradeLessonId, [node]);
      });
      delete capsulationRef.specialSheetSequence;
      capsulationRef.specialSheetSequence = [];
      capsulationRef.specialQuizSheet.forEach((value, key) => {
        capsulationRef.specialSheetSequence.push(key);
      });
    }
    this._setActiveGrade(inputsAndSettings.gradeFieldId);
    UIkit.toggle("#exam_history_switchback").toggle();
    $_.pause(10).then(() => UIkit.switcher(this.tabSwitcher).show(tabIndex));
  }

  _resetState() {
    let activeGradeData = this._getActiveGradeData();
    let examTypeId = this.state.activeTab.id;
    activeGradeData[
      examTypeId !== 10013 ? "quizSheet" : "specialQuizSheet"
    ].clear();
    activeGradeData[
      examTypeId !== 10013 ? "isEditingMode" : "isSpecialEditingMode"
    ] = false;
    delete activeGradeData[
      examTypeId !== 10013 ? "sheetSequence" : "specialSheetSequence"
    ];
    activeGradeData[
      examTypeId !== 10013 ? "sheetSequence" : "specialSheetSequence"
    ] = [];
    [...Object.keys(quizInputsInitialData)].forEach((key) => {
      if (key !== "quizClassList" && key !== "quizStudentList") {
        this.state.quizInputs[key] = quizInputsInitialData[key];
        document.getElementById(key).value = quizInputsInitialData[key];
      }
    });
  }

  reset(activeGradeData) {
    // reset form
    let examTypeId = this.state.activeTab.id;
    activeGradeData[
      examTypeId !== 10013 ? "quizSheet" : "specialQuizSheet"
    ].clear();
    delete activeGradeData[
      examTypeId !== 10013 ? "sheetSequence" : "specialSheetSequence"
    ];
    activeGradeData[
      examTypeId !== 10013 ? "sheetSequence" : "specialSheetSequence"
    ] = [];
    [...Object.keys(quizInputsInitialData)].forEach((key) => {
      if (key !== "quizClassList" && key !== "quizStudentList") {
        this.state.quizInputs[key] = quizInputsInitialData[key];
        document.getElementById(key).value = quizInputsInitialData[key];
      }
    });

    delete this.state.quizInputs.quizClassList;
    this.state.quizInputs.quizClassList = [];
    //psy should delete studentList as well
    delete this.state.quizInputs.quizStudentList;
    this.state.quizInputs.quizStudentList = [];
    this._setActiveGrade(this.state.activeGrade.id);
  }

  generateServerJson(examId) {
    const data = this._getActiveGradeData();
    const coverTemplateJson = { ...this.coverTemplateModal.state };

    let isSepecialQuiz = this.state.activeTab.id === 10013;
    const inputsFieldsData = { ...this.state.quizInputs };
    // let isTeacherQuiz = this.state.activeTab.id === 10014;
    // if (isTeacherQuiz) {
    //   if (inputsFieldsData.quizClassList.length === 0)
    //     inputsFieldsData.quizClassList.push(1);
    //   if (inputsFieldsData.quizStudentList.length === 0)
    //     inputsFieldsData.quizStudentList.push(1001);
    //   if (inputsFieldsData.quizDate.length === 0)
    //     inputsFieldsData.quizDate = moment().format("jYYYY/jMM/jDD");
    // }
    const json = {
      examId: examId,
      gradeFieldId: this.state.activeGrade.id,
      quizTypeId: this.state.activeTab.id, //10011,
      ...this.state.quizInputs,
      quizFactor: this.state.quizSettings.isFinalCalculation ? 1 : 0,
      quizNagativePoint: this.state.quizSettings.isQuizNagativePoint ? 1 : 0,
      ...coverTemplateJson,
    };
    const questionNodes = [];
    // console.log(
    //   data[isSepecialQuiz ? "specialSheetSequence" : "sheetSequence"]
    // );
    data[isSepecialQuiz ? "specialSheetSequence" : "sheetSequence"].forEach(
      (gradeId) => {
        // console.log(isSepecialQuiz);
        data[isSepecialQuiz ? "specialQuizSheet" : "quizSheet"]
          .get(gradeId)
          .forEach((question) => {
            questionNodes.push({ ...question });
          });
      },
    );
    // console.log(questionNodes);
    json["questionNodes"] = questionNodes;
    return json;
  }

  _setActiveGrade(id) {
    if (this.state.grades.length == 0) return;
    if (id === 0)
      this.gradesSelect.getElementsByTagName("option")[0].selected = "selected";
    else {
      let properOption = this.gradesSelect.querySelectorAll(
        `option[data-option-grade-field-id="${id}"]`,
      )[0];
      properOption.selected = "selected";
    }
    this.gradesSelect.dispatchEvent(new Event("change"));
  }

  _getActiveGradeData(id = 0) {
    // returns current grade representive data
    let activeGradeId = id === 0 ? this.state.activeGrade.id : id;

    const row = this.state.data.filter(
      (d) => d.gradeFieldId === activeGradeId, //this.state.activeGrade.id
    )[0];
    return row;
  }

  // _getSelectedUnits() {
  //   let ref = this._getActiveGradeData();
  //   return ref.units.get(this.state.activeGradeLessonId);
  // }

  // _getSelectedDetailUnits() {
  //   let ref = this._getActiveGradeData();
  //   return ref.detailUnits.get(this.state.activeGradeLessonId);
  // }

  // _getSelectedSeasonUnits() {
  //   let ref = this._getActiveGradeData();
  //   return ref.seasonUnits.get(this.state.activeGradeLessonId);
  // }

  _getSelectedUnitsData() {
    let ref = this._getActiveGradeData();
    return {
      units: ref.units.get(this.state.activeGradeLessonId) || [],
      detailUnits: ref.detailUnits.get(this.state.activeGradeLessonId) || [],
      seasonUnits: ref.seasonUnits.get(this.state.activeGradeLessonId) || [],
    };
  }

  _getCachedQuestions() {
    return this._getActiveGradeData().questions.get(
      this.state.activeGradeLessonId,
    );
  }

  _updateQuizSheetQuestionsOrder(array = "sheetSequence") {
    // The alternative is specialSheetSequence
    const data = this._getActiveGradeData();
    let questionCount = 1;
    data[array].forEach((key, i) => {
      let questions =
        data[array === "sheetSequence" ? "quizSheet" : "specialQuizSheet"].get(
          key,
        );
      let length = questions.length;
      let sortedQuestions = [...questions].sort(
        (a, b) => a.questionNumber - b.questionNumber,
      );
      const alignedOrders = sortedQuestions.map((q, j) => {
        return {
          ...q,
          questionNumber: questionCount + j,
        };
      });
      data[array === "sheetSequence" ? "quizSheet" : "specialQuizSheet"].set(
        key,
        alignedOrders,
      );
      questionCount += length;
    });
  }

  _renderLessonContainer() {
    return new Promise(async (resolve, reject) => {
      // printout the main wrappers for units preview
      const gradeLessonContainer = document.getElementById(
        "grade_lesson_container",
      );
      const data = this._getActiveGradeData();
      $_.removeElementChildNodes(gradeLessonContainer);
      gradeLessonContainer.innerHTML = `
          <select id="grade_lesson_list" class="uk-select uk-position-z-index" uk-sticky="end: !.define-content">
          </select>
          <ul id="lesson_unit_tree" class="uk-list"></ul><button  uk-toggle="target: #grade_lesson_container; cls: show-lessons-pane">بستن</button>`;

      await $_.pause(10);
      const lessonSelector = document.getElementById("grade_lesson_list");
      const lessonUnitsTree = document.getElementById("lesson_unit_tree");

      if (data.lessonList.length === 0) {
        let lessonListData = await axios.get(
          `/api/School/GetTestMakerLessons?gradeFieldId=${this.state.activeGrade.id}`,
        );

        lessonListData.data.forEach((lesson) => data.lessonList.push(lesson));
      }

      lessonSelector.innerHTML = data.lessonList
        .map(
          (lesson) =>
            `<option value="${lesson.gradeLessonId}"
            data-base-grade-lesson-id="${lesson.parentGradeLessonId}"
            data-base-grade-lesson-caption="${lesson.parentCaption}"
            > ${lesson.caption}</option>`,
        )
        .join("");

      lessonSelector.addEventListener("change", async (e) => {
        // init rendering unit tree
        const gradeLessonId = _.toNumber(e.target.value);
        const baseGradeLessonId = _.toNumber(
          $_.getSelectedOption(e.target).dataset.baseGradeLessonId,
        );
        this.state.activeGradeLessonId = gradeLessonId;
        this.state.activeBaseGradeLessonId = baseGradeLessonId;
        $_.removeElementChildNodes(lessonUnitsTree);
        const treeData = await axios.get(
          `/api/School/GetTestMakerTreeL2?gradeLessonId=${gradeLessonId}`,
        );

        // Update all the sub components base on selected lesson Id
        this.randomQuestionsModalComponent.updateState({
          gradeFieldId: this.state.activeGrade.id,
          gradeLessonId: this.state.activeGradeLessonId,
          parentGradeLessonId: this.state.activeBaseGradeLessonId,
          lessonList: this._getActiveGradeData().lessonList,
        });

        this.teachersQuestionsModalComponent.updateState({
          gradeFieldId: this.state.activeGrade.id,
          gradeLessonId: this.state.activeBaseGradeLessonId,
          lessonList: this._getActiveGradeData().lessonList,
        });

        this.questionSearchModalComponent.updateState({
          gradeFieldId: this.state.activeGrade.id,
        });
        // Update study unit tree
        this._renderHierarchyUnits(treeData.data);
      });
      lessonSelector.dispatchEvent(new Event("change"));
      return resolve(true);
    });
  }

  async _renderSpecialQuizLessonContainer() {
    const data = this._getActiveGradeData();
    const specialQuizLessonContainer = document.getElementById(
      "specialQuizLessonContainer",
    );

    const __renderLessonList = () => {
      $_.removeElementChildNodes(specialQuizLessonContainer);
      let markup = ``;
      data.lessonList.forEach((lesson) => {
        if (
          data.specialSheetSequence.includes(lesson.gradeLessonId) === false
        ) {
          markup += `<div>${lesson.caption}
          <a data-base-grade-lesson-id=${lesson.parentGradeLessonId}
          data-grade-lesson-id="${lesson.gradeLessonId}"></a></div>`;
        }
      });
      specialQuizLessonContainer.innerHTML = markup;
    };

    __renderLessonList();
    await $_.pause(10);

    const lessonLinkElements = specialQuizLessonContainer.querySelectorAll("a");

    [...lessonLinkElements].forEach((lessonLink) =>
      lessonLink.addEventListener("click", () => {
        const gradeLessonId = _.toNumber(lessonLink.dataset.gradeLessonId);
        const baseGradeLessonId = _.toNumber(
          lessonLink.dataset.baseGradeLessonId,
        );
        if (data.specialSheetSequence.includes(gradeLessonId) === false) {
          data.specialSheetSequence.push(gradeLessonId);
        }

        const lessonBaseObject = data.lessonList.filter(
          (lesson) => lesson.gradeLessonId === gradeLessonId,
        )[0];

        data.specialQuizSheet.set(gradeLessonId, [
          {
            ...questionNodeDefaultValues,
            gradeLessonCaption: lessonBaseObject.caption,
            gradeLessonId: gradeLessonId,
            questionNumber: 1,
            parentGradeLessonId: baseGradeLessonId,
            parentCaption: lessonBaseObject.parentCaption,
          },
        ]);
        // console.log(data.specialQuizSheet.get(gradeLessonId));
        this._updateQuizSheetQuestionsOrder("specialSheetSequence");
        this._renderSpecialQuizLessonContainer();
        this._renderSpecialQuizSheet();
      }),
    );
  }

  async _renderSpecialQuizSheet() {
    // const specialQuizSheetContainer = document.getElementById(
    //   "specialQuizSheetContainer"
    // );
    const data = this._getActiveGradeData();
    $_.removeElementChildNodes(this.specialQuizSheetSortableSection);

    const __getlessonCaption = (gradeLessonId) =>
      data.lessonList.filter(
        (lesson) => lesson.gradeLessonId === gradeLessonId,
      )[0].caption;

    let markup = ``;

    data.specialSheetSequence.forEach((gradeLessonId) => {
      let questionList = data.specialQuizSheet.get(gradeLessonId);
      markup += `	<li data-grade-lesson-id ="${gradeLessonId}" class="uk-open">
      <a class="uk-accordion-title" href="#">
        ${__getlessonCaption(gradeLessonId)}

        <span>
        ${
          questionList.length === 1
            ? questionList[0].questionNumber
            : questionList[questionList.length - 1].questionNumber +
              " - " +
              questionList[0].questionNumber
        }
        </span>
        <button data-special-sheet-button-type="addQuestion" uk-icon="icon: plus-circle; ratio: 0.7" uk-tooltip="افزودن سؤال"></button>
      </a>
      <div class="uk-accordion-content keep-in-count"
      data-grade-lesson-id="${gradeLessonId}">

      `;

      questionList.forEach(
        (q) =>
          (markup += `
            <ol data-correct-answer = "${
              q.answerCode
            }" data-question-number = "${q.questionNumber}" >
              <span class="${
                q.answerCode === 1 ? "fill" : ""
              } question-choice-box">1</span>
              <span class="${
                q.answerCode === 2 ? "fill" : ""
              } question-choice-box">2</span>
              <span class="${
                q.answerCode === 3 ? "fill" : ""
              } question-choice-box">3</span>
              <span class="${
                q.answerCode === 4 ? "fill" : ""
              } question-choice-box">4</span>
              <button class="remove-special-question" uk-icon="icon: close; ratio: 0.8" uk-tooltip="حذف سؤال"></button>
            </ol>`),
      );
      //.join("");
      markup += `</div>
      </li>`;
    });

    $_.removeElementChildNodes(this.specialQuizSheetSortableSection);
    this.specialQuizSheetSortableSection.innerHTML = markup;
    await $_.pause(100);

    let addButtons = this.specialQuizSheetSortableSection.querySelectorAll(
      'button[data-special-sheet-button-type="addQuestion"]',
    );
    addButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        let referenceElement = btn.closest("li");
        let gradeLessonId = _.toNumber(referenceElement.dataset.gradeLessonId);
        // console.log(referenceElement.dataset.baseGradeLessonId);
        // psy important for random
        let currentLessonListOfGrade = data.specialQuizSheet.get(gradeLessonId);
        let lessonCaption = __getlessonCaption(gradeLessonId);
        data.specialQuizSheet.set(gradeLessonId, [
          ...currentLessonListOfGrade,
          {
            ...questionNodeDefaultValues,
            gradeLessonCaption: lessonCaption,
            gradeLessonId: gradeLessonId,
            questionNumber:
              currentLessonListOfGrade[currentLessonListOfGrade.length - 1]
                .questionNumber + 1,
            parentGradeLessonId: gradeLessonId,
            parentCaption: lessonCaption,
          },
        ]);
        this._updateQuizSheetQuestionsOrder("specialSheetSequence");
        this._renderSpecialQuizSheet();
      });
    });

    let removeSpecialQuestionButtons =
      this.specialQuizSheetSortableSection.querySelectorAll(
        "button.remove-special-question",
      );
    removeSpecialQuestionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const data = this._getActiveGradeData();
        let questionNumber = _.toNumber(
          btn.closest("ol").dataset.questionNumber,
        );
        let gradeLessonId = _.toNumber(btn.closest("li").dataset.gradeLessonId);
        let questionsArray = data.specialQuizSheet.get(gradeLessonId);

        const updatedList = $_.removeElementFromArrayOfOjects(
          questionsArray,
          questionNumber,
          "questionNumber",
        );

        if (updatedList.length > 0)
          data.specialQuizSheet.set(gradeLessonId, updatedList);
        else {
          data.specialQuizSheet.delete(gradeLessonId);
          // Also update sheet sequence if last node removed
          const updatedArray = data.specialSheetSequence.filter(
            (id) => id !== gradeLessonId,
          );
          if (updatedArray.length > 0) {
            delete data.specialSheetSequence;
            data.specialSheetSequence = updatedArray;
          } else {
            delete data.specialSheetSequence;
            data.specialSheetSequence = [];
          }
          this._renderSpecialQuizLessonContainer();
        }
        this._updateQuizSheetQuestionsOrder("specialSheetSequence");
        this._renderSpecialQuizSheet();
      });
    });

    //bind answerSheet
    let choiceButtons = this.specialQuizSheetSortableSection.querySelectorAll(
      "span.question-choice-box",
    );

    choiceButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        let questionNumber = _.toNumber(
          btn.closest("ol").dataset.questionNumber,
        );
        let gradeLessonId = _.toNumber(btn.closest("li").dataset.gradeLessonId);
        let answerCode = _.toNumber(btn.innerHTML);
        // console.log({ questionNumber, gradeLessonId, answerCode });
        data.specialQuizSheet
          .get(gradeLessonId)
          .filter((q) => q.questionNumber === questionNumber)[0].answerCode =
          answerCode;

        this._renderSpecialQuizSheet();
      });
    });
  }

  async _renderQuizSheet() {
    //const _that = this;
    // renderPsy
    const activeGradeData = this._getActiveGradeData();
    let markup = [];

    activeGradeData.sheetSequence.forEach((key) => {
      const value = activeGradeData.quizSheet.get(key);
      let baseGradeLessonId = value[0] ? value[0].parentGradeLessonId : 0;
      // console.log(value[0]);
      // console.log({ key, value, baseGradeLessonId });
      let len = activeGradeData.sheetSequence.length;
      const links = [];
      const sortedValues = [...value].sort(
        (a, b) => a.questionNumber - b.questionNumber,
      );
      sortedValues.forEach((val) => {
        links.push(val.dataId);
      });

      this.quizSheetEntranceWrapper.classList.remove("disable-entrance"); //psyyeg

      markup.push(`
            <li
              class="${
                (activeGradeData.sheetSequence[len - 1] === key) ===
                this.state.activeGradeLessonId
                  ? "uk-open"
                  : key === this.state.activeGradeLessonId ||
                      key === this.state.activeBaseGradeLessonId
                    ? "uk-open"
                    : ""
              }"
              data-grade-lesson-id="${baseGradeLessonId}" >
                <a class="uk-accordion-title new-header-design" href="#">
                <button id="remove_all_lesson_questions_${baseGradeLessonId}" class="remove-all-lesson-questions
                uk-button" uk-icon="icon: trash; ratio: 0.8" data-grade-lesson-id="${baseGradeLessonId}"></button>
                <p>${value[0].parentCaption}</p>
                    <span>
                    ${
                      sortedValues.length === 1
                        ? sortedValues[0].questionNumber
                        : sortedValues[0].questionNumber +
                          " - " +
                          sortedValues[sortedValues.length - 1].questionNumber
                    }
                    </span>
                </a>

                <ol id="sortable_${baseGradeLessonId}"
                data-base-grade-lesson-id="${baseGradeLessonId}"
                data-grade-lesson-id="${baseGradeLessonId}"
                class="question-sortable-item uk-accordion-content keep-in-count">
                    ${links
                      .map((link, i) => {
                        const {
                          activeYear,
                          dataId,
                          difficultyLevelCaption,
                          difficultyLevelId,
                          gradeLessonCaption,
                          gradeLessonId,
                          insDate,
                          isRotatable,
                          hasVideo,
                          isUsed,
                          option1,
                          option2,
                          option3,
                          option4,
                          questionFace,
                          answerFace,
                          questionType,
                          rightCount,
                          totalCount,
                          wrongCount,
                          blankCount,
                          studyUnitCaption,
                          seasonCaption,
                          detailCaption,
                          mediaLink,
                        } = sortedValues[i];
                        const shouldHideInfo =
                          rightCount + wrongCount + blankCount === 0;

                        const expandedQuestionCaption =
                          seasonCaption +
                          " - " +
                          studyUnitCaption +
                          " - " +
                          detailCaption;
                        return `
                    <li data-question-id="${link}"
                        class="${
                          difficultyLevelCaption == "دشوار"
                            ? "hardQuestionback"
                            : difficultyLevelCaption == "متوسط"
                              ? "intermediateQuestionback"
                              : "easyQuestionback"
                        }">
                        <button uk-close data-question-id="${link}"></button>
                        <a class="dont-show-modal" uk-icon="icon: image; ratio: 1" href="#mobileModalImages" uk-toggle></a>

                        <ul class="hidden-info-data">

                          <li class="${
                            difficultyLevelCaption == "دشوار"
                              ? "hardQuestion"
                              : difficultyLevelCaption == "متوسط"
                                ? "intermediateQuestion"
                                : "easyQuestion"
                          }">${difficultyLevelCaption}</li>

                          <li ${
                            shouldHideInfo ? "hidden" : ""
                          }>${totalCount} نفر</li>
                          <li ${
                            shouldHideInfo ? "hidden" : ""
                          }>%${rightCount} صحیح</li>
                          <li ${
                            shouldHideInfo ? "hidden" : ""
                          }>%${wrongCount} غلط</li>
                          <li ${
                            shouldHideInfo ? "hidden" : ""
                          }>%${blankCount} سفید</li>
                          ${
                            isUsed
                              ? `<li><button class="history-info-button question-history-info"
                              data-info-button-position="collapse"
                              data-question-id="${dataId}"
                             uk-icon="icon: history; ratio: 0.9"></button>
                            <div class="history-info-container-expanded" uk-drop="mode: click; pos: bottom-right; offset: 8">
                              <ol id="questionUsageHistory_collapse_${dataId}" class="reset-list-counter">

                              </ol>
                            </div></li>`
                              : `<li></li>`
                          }
                           ${
                             hasVideo
                               ? `<li><span data-media-link="${mediaLink}" class="has-movie-sign" uk-icon="icon: video-camera; ratio: 0.75"
                                 uk-tooltip="title: فيلم دارد; pos: bottom"></span></li>`
                               : `<li></li>`
                           }

                        </ul>
                        <div class="hidden-info">
                        <div>${expandedQuestionCaption}
                           <span>كد ${dataId}</span>
                        </div>
                        <div>
                          <img src="${questionFace}" >
                          <img src="${option1}" >
                          <img src="${option2}" >
                          <img src="${option3}" >
                          <img src="${option4}" >
                        </div>
                        <div>
                          <img src="${answerFace}">
                        </div>
                        </div>
                      </div>
                    </li>

                    `;
                      })
                      .join("")}
                </ol>
            </li>`);
      this.questionCountBadge.innerHTML =
        sortedValues[sortedValues.length - 1].questionNumber;
    });

    this.quizSheetSortableSection.innerHTML = markup.join("");

    await $_.pause(50);

    const removeAllLessonListQuestionsButton =
      this.quizSheetSortableSection.querySelectorAll(
        "button.remove-all-lesson-questions",
      );
    removeAllLessonListQuestionsButton.forEach((btn) =>
      btn.addEventListener("click", async () => {
        let userConcent = false;
        try {
          await UIkit.modal
            .confirm(
              `  تمامی سوالاتِ این درس حذف خواهند شد، آیا اطمینان دارید؟`,
              {
                labels: {
                  cancel: "خیر",
                  ok: "بلی",
                },
              },
            )
            .then(async () => {
              userConcent = true;
            });
        } catch {
          (err) => console.log(err);
        }

        if (userConcent === true) {
          this.showLoader();
          let id = _.toNumber(btn.dataset.gradeLessonId);

          let sequence =
            this.state.activeTab.id !== 10013
              ? "sheetSequence"
              : "specialSheetSequence";
          let sheet =
            this.state.activeTab.id !== 10013
              ? "quizSheet"
              : "specialQuizSheet";
          const newSequence = $_.removeElementFromArrayAndEmmitZeroz(
            activeGradeData[sequence],
            id,
          );
          delete activeGradeData[sequence];
          activeGradeData[sequence] = newSequence;
          activeGradeData[sheet].delete(id);
          this._renderQuestionSection();
          this._updateQuizSheetQuestionsOrder();
          this._renderQuizSheet();
        }
      }),
    );

    //bind history info
    this.quizSheetSortableSection
      .querySelectorAll("button.history-info-button")
      .forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          this.showLoader();
          let id = btn.dataset.questionId;
          const { data } = await axios.get(
            `/api/School/GetQuestionHistory?dataid=${id}`,
          );
          const quizUsedHistory = this.quizSheetSortableSection.querySelector(
            `#questionUsageHistory_collapse_${id}`,
          );
          data.length > 0
            ? (quizUsedHistory.innerHTML = data
                .map((d) => `<li>${d.historyDescription}</li>`)
                .join(""))
            : (quizUsedHistory.innerHTML =
                "اين سؤال در آزمون‌های شما استفاده نشده است.");
        });
      });

    //bind media links
    this.quizSheetSortableSection
      .querySelectorAll("span[data-media-link]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          let videoTag = document
            .querySelector("#answer_media_player_video_source")
            .setAttribute("src", btn.dataset.mediaLink);
          // console.log(videoTag);
          UIkit.modal("#answers-video-moadal").show();
        });
      });

    // Bind images modal
    let openModalButtons = this.quizSheetSortableSection.querySelectorAll(
      "a.dont-show-modal[uk-toggle]",
    );
    openModalButtons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        let id = btn.closest("li").dataset.questionId;
        let modalMarkup = await this._getQuestionImagesMarkup(id);
        this.questionImageModal.innerHTML = modalMarkup;
      });
    });
    // Bind delete buttons remove questions
    let removeQuestionButtons = this.quizSheetSortableSection.querySelectorAll(
      "button[data-question-id][uk-close]",
    );
    removeQuestionButtons.forEach((btn) => {
      //delete questions from quiz sheet
      btn.addEventListener("click", (e) => {
        let questionId = _.toNumber(btn.dataset.questionId);
        let gradeLessonId = _.toNumber(btn.closest("ol").dataset.gradeLessonId);
        // console.log(gradeLessonId);
        // console.log(activeGradeData.quizSheet.get(gradeLessonId), questionId);
        // console.log(activeGradeData);
        const updatedList = $_.removeElementFromArrayOfOjects(
          activeGradeData.quizSheet.get(gradeLessonId),
          questionId,
        );
        // debugger;
        if (updatedList.length > 0)
          activeGradeData.quizSheet.set(gradeLessonId, updatedList);
        else {
          activeGradeData.quizSheet.delete(gradeLessonId);
          // Also update sheet sequence if last node removed
          const updatedArray = activeGradeData.sheetSequence.filter(
            (id) => id !== gradeLessonId,
          );
          if (updatedArray.length > 0) {
            delete activeGradeData.sheetSequence;
            activeGradeData.sheetSequence = updatedArray;
          } else {
            delete activeGradeData.sheetSequence;
            activeGradeData.sheetSequence = [];
            document
              .getElementById("close_questions_list")
              .dispatchEvent(new Event("click"));

            this.quizSheetEntranceWrapper.classList.add("disable-entrance");
          }
        }
        this._updateQuizSheetQuestionsOrder();
        this._renderQuizSheet();

        // Add question to question list if list is currently loaded
        let questionTag = this.questionBlock.querySelector(
          `.question-block[data-question-id="${questionId}"]`,
        );
        if (questionTag) questionTag.classList.remove("added");
      });
    });

    //Bind sortable component // psyBase
    activeGradeData.quizSheet.forEach((value, key, arr) => {
      // console.log({ value, key });
      const sortableElement = this.quizSheetSortableSection.querySelector(
        `[data-base-grade-lesson-id="${value[0].parentGradeLessonId}"].question-sortable-item`,
      );
      if (sortableElement) {
        const sortableComponent = new Sortable(sortableElement, {
          group: `group${value[0].parentGradeLessonId}`,
          dataIdAttr: "parentGradeLessonId",
          // choosenClass: "drag-selected-gray",
          // dragClass: "drag-selected-new",
          animation: 150,
          fallbackOnBody: true,
          swapThreshold: 0.65,
          onEnd: function (evt) {
            const questionId = evt.clone.dataset.questionId;
            const options = {
              group: evt.target.dataset.baseGradeLessonId,
              id: questionId,
              oldIndex: evt.oldIndex,
              newIndex: evt.newIndex,
            };
            let gradeQuestions = activeGradeData.quizSheet.get(
              _.toNumber(options.group),
            );
            activeGradeData.quizSheet.set(
              _.toNumber(options.group),
              $_.move(gradeQuestions, options.oldIndex, options.newIndex),
            );
          },
        });
      }
    });
  }

  async _getQuestionImagesMarkup(id) {
    this.state.activeQuestionImageModal = id;
    this.showLoader();
    const { data } = await axios(
      `/api/School/GetTestMakerQuestionImages?dataid=${id}`,
    );
    if (this.questionImageModal.classList.contains("uk-open") === false)
      UIkit.modal(this.questionImageModal).show();
    $_.removeElementChildNodes(this.questionImageModal);
    return `<div>
        <button class="uk-modal-close-default" type="button" uk-close></button>
        <div>
          ${data.map((img) => `<img src="${img.address}">`).join("")}
        </div>
        </div>
    `;
  }

  async updateQuizSheet(btnEventTarget, type = "addToSheet") {
    // psy change and check for parent
    const btn = btnEventTarget.target.closest("button");
    const wrapper = btn.closest("div");
    wrapper.classList.add("added");
    const questionId = _.toNumber(btn.dataset.questionId);
    const parentGradeLessonId = _.toNumber(btn.dataset.baseGradeLessonId);
    const gradeData = this._getActiveGradeData();
    const questuionList = gradeData.questions.get(
      this.state.activeGradeLessonId, //gradeLessonId //this.state.activeGradeLessonId
    );
    let baseGradeLessonId = this.state.activeBaseGradeLessonId;
    // console.log(parentGradeLessonId, baseGradeLessonId);
    const question = questuionList.filter((q) => q.dataId === questionId)[0];

    const sheet = gradeData.quizSheet.get(parentGradeLessonId);

    if (sheet) sheet.push({ ...question, questionNumber: sheet.length });
    else {
      gradeData.quizSheet.set(parentGradeLessonId, [
        //this.state.activeBaseGradeLessonId, [
        { ...question, questionNumber: 0 },
      ]);
      gradeData.sheetSequence.push(parentGradeLessonId); //this.state.activeBaseGradeLessonId);
    }
    await $_.pause(100);
    this._updateQuizSheetQuestionsOrder();
    this._renderQuizSheet();
  }

  async _fetchQuestionList() {
    const {
      isCommonExamin,
      isSelfExamin,
      isEasy,
      isMedium,
      isHard,
      isJustUnused,
      isFinalCalculation,
      isShowChoices,
    } = this.state.quizSettings;

    const DifficultyLevelIds = [isEasy, isMedium, isHard].filter(
      (item) => item,
    ); //.map(item=>1);
    let QuestionType = 0;
    if (isCommonExamin && isSelfExamin) QuestionType = 3;
    else QuestionType = isCommonExamin || isSelfExamin || "0";

    // let { units, detailUnits } = this._getSelectedUnits() || {
    //   units: [],
    //   detailUnits: [],
    // };
    // const units = this._getSelectedUnits() || [];
    // const detailUnits = this._getSelectedDetailUnits() || [];
    // const seasonUnits = this._getSelectedSeasonUnits() || [];
    const { units, detailUnits, seasonUnits } = this._getSelectedUnitsData();

    if (units && units.length === 0) {
      if (detailUnits && detailUnits.length === 0) {
        this._getActiveGradeData().questions.set(
          this.state.activeGradeLessonId,
          [],
        );
        return [];
      }
    }
    // console.log(units);

    //psy edit
    let query = `/api/School/GetQuestionList?gradeLessonId=${
      this.state.activeGradeLessonId
    }&SeasonCode=${seasonUnits.join(",")}
    &StudyUnits=${units.join(",")}
    &DetailsCode=${detailUnits.join(",")}
    &QuestionType=${QuestionType}&DifficultyLevelIds=${DifficultyLevelIds.join(
      ",",
    )}&NewOnes=${isJustUnused ? isJustUnused : 0}&FactorType=${
      isFinalCalculation ? isFinalCalculation : 0
    }`;

    const { data } = await axios.get(query);
    this._getActiveGradeData().questions.set(
      this.state.activeGradeLessonId,
      data ? data : [],
    );
    return data;
  }

  _renderQuestionSection() {
    const questionSectionWrapper = this.questionBlock;
    const activeGradeData = this._getActiveGradeData();
    if (this.state.quizSettings.isShowChoices)
      questionSectionWrapper.classList.remove("no-options");
    else questionSectionWrapper.classList.add("no-options");
    const questionsMarkupList = [];
    const questions = this._getCachedQuestions();
    const quizSheetForGradeLesson = activeGradeData.quizSheet.get(
      this.state.activeBaseGradeLessonId,
    );
    questions.forEach((q) => {
      let isSelected = false;
      if (quizSheetForGradeLesson)
        for (let question of quizSheetForGradeLesson) {
          if (question.dataId === q.dataId) {
            isSelected = true;
            break;
          }
        }
      const {
        activeYear,
        dataId,
        difficultyLevelCaption,
        difficultyLevelId,
        gradeLessonCaption,
        gradeLessonId,
        parentGradeLessonId,
        insDate,
        isRotatable,
        isUsed,
        hasVideo,
        option1,
        option2,
        option3,
        option4,
        questionFace,
        answerFace,
        questionType,
        rightCount,
        totalCount,
        wrongCount,
        blankCount,
        mediaLink,
      } = q;

      const shouldHideInfo = rightCount + wrongCount + blankCount === 0;
      questionsMarkupList.push(`
            <div class="question-block ${
              isSelected ? "added" : ""
            }" data-question-id="${dataId}">
                <div class="lazy-container">
                <img data-src="${questionFace}" class="lazy">
                    <img data-src="${option1}" class="lazy">
                    <img data-src="${option2}" class="lazy">
                    <img data-src="${option3}" class="lazy">
                    <img data-src="${option4}" class="lazy">



                    <ul uk-accordion>
                        <li>
                            <a class="uk-accordion-title" href="#"></a>
                            <div class="uk-accordion-content">
                            <img data-src="${answerFace}" class="lazy">
                            </div>
                        </li>
                    </ul>

                    <span><span>كد</span> ${dataId}</span>

                </div>

                <div class="info-area">
                ${
                  isUsed
                    ? `<button class="history-info-button question-history-info" data-question-id="${dataId}"
                   uk-icon="icon: history; ratio: 0.75"></button>
                  <div class="history-info-container" uk-drop="mode: click; pos: left-top; offset: 8">
                    <ol id="questionUsageHistory_${dataId}">

                    </ol>
                  </div>`
                    : ""
                }
                  ${
                    hasVideo
                      ? `<span data-media-link="${mediaLink}" class="has-movie-sign" uk-icon="icon: video-camera; ratio: 0.75"
                      uk-tooltip="title: فيلم دارد; pos: bottom" ></span>`
                      : ""
                  }
                </div>
                <ul>
                    <li class="${
                      difficultyLevelCaption == "دشوار"
                        ? "hardQuestion"
                        : difficultyLevelCaption == "متوسط"
                          ? "intermediateQuestion"
                          : "easyQuestion"
                    }">${difficultyLevelCaption}</li>

                    <li ${shouldHideInfo ? "hidden" : ""}>${totalCount} نفر</li>
                    <li ${
                      shouldHideInfo ? "hidden" : ""
                    }>%${rightCount} صحیح</li>
                    <li ${
                      shouldHideInfo ? "hidden" : ""
                    }>%${wrongCount} غلط</li>
                    <li ${
                      shouldHideInfo ? "hidden" : ""
                    }>%${blankCount} سفید</li>
                    <button class="add-question-button" disabled uk-icon="icon: triangle-right; ratio: 1.3"
                        data-question-id="${dataId}"
                        data-grade-lesson-id="${gradeLessonId}"
                        data-base-grade-lesson-id="${parentGradeLessonId}">
                       <svg width="26" height="26" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" data-svg="plus">
                           <rect x="9" y="4" width="2" height="12" rx="1" ry="1" fill="white"></rect>
                           <rect x="4" y="9" width="12" height="2"  rx="1" ry="1" fill="white"></rect>
                       </svg>
                    </button>

                </ul>
            </div>
            `); //answer_media_player_video_source |  href="#answers-video-moadal uk-toggle"
    });
    let html = [...questionsMarkupList].join("") || "";
    questionSectionWrapper.innerHTML = html;

    questionSectionWrapper
      .querySelectorAll("button.add-question-button")
      .forEach((btn) => {
        $_.timer(() => btn.removeAttribute("disabled"), 1000);
        btn.addEventListener("click", async (e) => {
          await this.updateQuizSheet(e);
        });
      });

    questionSectionWrapper
      .querySelectorAll("button.history-info-button")
      .forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          this.showLoader();
          let id = btn.dataset.questionId;
          const { data } = await axios.get(
            `/api/School/GetQuestionHistory?dataid=${id}`,
          );
          const quizUsedHistory = questionSectionWrapper.querySelector(
            `#questionUsageHistory_${id}`,
          );
          data.length > 0
            ? (quizUsedHistory.innerHTML = data
                .map((d) => `<li>${d.historyDescription}</li>`)
                .join(""))
            : (quizUsedHistory.innerHTML =
                "اين سؤال در آزمون‌های شما استفاده نشده است.");
        });
      });

    questionSectionWrapper
      .querySelectorAll("span[data-media-link]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          let videoTag = document
            .querySelector("#answer_media_player_video_source")
            .setAttribute("src", btn.dataset.mediaLink);
          // console.log(videoTag);
          UIkit.modal("#answers-video-moadal").show();
        });
      });

    if (questionsMarkupList.length > 0) this.lazyLoader.update();
  }

  async _renderHierarchyUnits(units) {
    const lessonUnitTree = document.getElementById("lesson_unit_tree");
    const activeDataRef = this._getActiveGradeData();
    const studyUnitsWithCatchedQuestions = [];
    let catchedQuestionList = activeDataRef.questions.get(
      this.state.activeBaseGradeLessonId,
    );
    // console.log(catchedQuestionList);
    if (catchedQuestionList) {
      // console.log(this.state.activeBaseGradeLessonId);
      // console.log({
      //   unitCode: catchedQuestionList[0].studyUnitCode,
      //   detailUnitCode: catchedQuestionList[0].detailCode,
      // });

      catchedQuestionList.forEach((q) => {
        if (studyUnitsWithCatchedQuestions.includes(q.studyUnitCode) === false)
          studyUnitsWithCatchedQuestions.push({
            studyUnitCode: q.studyUnitCode,
            detailCode: q.detailCode,
          });
      });
      // console.log(studyUnitsWithCatchedQuestions);
    }
    const markups = [];
    $_.removeElementChildNodes(lessonUnitTree);
    // moy
    const gradeFieldIdValue = this.state.data[0].gradeFieldId;
    //
    for (let item of units) {
      let markup = `<li>
            <label><input class="uk-checkbox" data-leaf-level="0"
             data-node-id="${item.id}"
            type="checkbox" value="${item.id}">${item.caption}</label>
            <ul>
               `;
      item.childNode.forEach((child) => {
        const anyDirectLeafSelected = [...studyUnitsWithCatchedQuestions]
          .map((s) => s.studyUnitCode)
          .includes(child.value)
          ? true
          : false;
        markup += `<li><label><input
        ${anyDirectLeafSelected ? "checked" : ""}
          class="uk-checkbox" data-node-id="${child.id}"
            data-leaf-level="${child.leafLevel}"
            data-parent-unit-id="${item.id}" type="checkbox"
            value="${child.value}">${child.caption}</label>

              <ul data-unit-id=${child.id} data-root-id="${
                item.id
              }" class="detail-lesson-unit" style="${
                gradeFieldIdValue < 10 ? "display:none" : ""
              }">

              ${child.detailChildNode
                .map((innerChild) => {
                  var shouldGetSelected = false;
                  // const anyDetailNodesSelected =
                  studyUnitsWithCatchedQuestions.forEach((s) => {
                    if (
                      s.detailCode == innerChild.value &&
                      s.studyUnitCode == child.value
                    )
                      shouldGetSelected = true;
                  });
                  return `<li><label><input
                ${shouldGetSelected ? "checked" : ""}
                  class="uk-checkbox" data-node-id="${innerChild.id}"
                    data-leaf-level="${innerChild.leafLevel}"
                    data-parent-unit-id="${child.id}" type="checkbox"
                    value="${innerChild.value}">${innerChild.caption}</label>`;
                })
                .join("")}
              </ul>
            </li>`;
      });
      markup += `</ul>
        </li>`;
      markups.push(markup);
    }
    lessonUnitTree.innerHTML = markups.join("");
    await $_.pause(500);

    //psy changed scope from document to wrapper
    const leafs = lessonUnitTree.querySelectorAll('input[data-leaf-level="8"]');

    const roots = lessonUnitTree.querySelectorAll('input[data-leaf-level="0"]');

    roots.forEach((rootNode) => {
      let rootCheckedStatus = false;
      const directLeafs = [...leafs].filter(
        (leaf) => leaf.dataset.parentUnitId === rootNode.dataset.nodeId,
      );
      // console.log(directLeafs);
      for (let leaf of directLeafs) {
        let nodes = [
          ...document.querySelectorAll(
            `ul[data-parent-unit-id="${leaf.dataset.nodeId}`,
          ),
        ].filter((checkbox) => checkbox.cheked);
        const hasDetailLeafWithSelectedNode = nodes.length > 0;
        if (leaf.checked == true || hasDetailLeafWithSelectedNode) {
          rootCheckedStatus = true;
          break;
        }
      }
      if (rootCheckedStatus) {
        rootNode.checked = true;
      } else {
        rootNode.checked = false;
      }
    });
    const nodes = lessonUnitTree.querySelectorAll("input");

    const childLeafs = lessonUnitTree.querySelectorAll(
      'input[data-leaf-level="9"]',
    );

    await this._fetchQuestionList();
    this._renderQuestionSection();
    //    [...roots, ...leafs]
    nodes.forEach((node) => {
      node.addEventListener("click", async (e) => {
        this.showLoader();
        // await $_.pause(101);
        // await $_.pause(500);
        //psy edit
        await hierarchyTreeDomHandler(lessonUnitTree, node);

        const currentGradeData = this._getActiveGradeData();

        const selectedSeasonUnits = [...roots]
          .filter((node) => node.checked)
          .map((node) => node.value);

        const selectedUnits = [...leafs]
          .filter((leaf) => leaf.checked)
          .map((leaf) => leaf.value);

        const selectedDetailUnits = [...childLeafs]
          .filter((childLeaf) => childLeaf.checked)
          .map((child) => child.value);

        // console.log({ selectedUnits, selectedDetailUnits });

        currentGradeData.units.set(
          this.state.activeGradeLessonId,
          selectedUnits.length > 0 ? selectedUnits : [],
        );
        // psyBase
        currentGradeData.detailUnits.set(
          this.state.activeGradeLessonId,
          selectedDetailUnits.length > 0 ? selectedDetailUnits : [],
        );

        currentGradeData.seasonUnits.set(
          this.state.activeGradeLessonId,
          selectedSeasonUnits.length > 0 ? selectedSeasonUnits : [],
        );

        await this._fetchQuestionList();
        this._renderQuestionSection();
        // debugger;
        // this.questionsListPanel.querySelectorAll("button.add-button");
      });
    });
  }

  async _renderQuizSettings() {
    const settingsContainer = document.getElementById(
      "quize_options_container",
    );

    const checkBoxes = getQuizCheckboxesStatus(this.state);

    let grouping = 0;
    const markup = [];
    checkBoxes.forEach((checkBox) => {
      let html = "";
      if (grouping < checkBox.group) {
        html += "<hr/>";
        grouping = checkBox.group;
      }
      html += `<label class="options-switch ${checkBox.class}"><span>${
        checkBox.caption
      }
                        </span><label class="sharp-violet-switch">
                            <input id="${checkBox.id}"
                            type="checkbox"
                            ${
                              this.state.quizSettings[`${checkBox.dataField}`]
                                ? "checked"
                                : ""
                            }
                            data-field-id="${checkBox.dataField}"
                            data-value-field="${checkBox.dataValue}" >
                            <span class="sharp-violet-slider ${
                              checkBox.color
                            }"></span>
                        </label>
					 </label>`;
      markup.push(html);
    });

    // Attach other settings
    const quizeServerSettingCheckboxes = [
      {
        id: "with_final_calculation_checkbox",
        caption: "محاسبه كارنامه با ضرايب",
        group: 0,
        dataField: "isFinalCalculation",
        value: this.state.quizSettings.isFinalCalculation,
        dataValue: 1,
      },
      {
        id: "calculate_negative_points",
        caption: "محاسبه نمره منفی",
        group: 0,
        dataField: "isQuizNagativePoint",
        value: this.state.quizSettings.isQuizNagativePoint,
        dataValue: 1,
      },
    ];

    const serverSettingsMarkup = [];
    quizeServerSettingCheckboxes.forEach((checkbox) => {
      serverSettingsMarkup.push(`
        <label class="options-switch">${checkbox.caption}
                <label class="sharp-violet-switch">
                    <input id="${checkbox.id}" type="checkbox"
                    ${
                      this.state.quizSettings[`${checkbox.dataField}`]
                        ? "checked"
                        : ""
                    }
                    data-field-id="${checkbox.dataField}"
                    data-value-field="${checkbox.dataValue}" >
                    <span class="sharp-violet-slider"></span>
                </label>
            </label>
        `);
    });

    const quizServerSettingsWrapper = document.getElementById(
      "quiz_server_settings",
    );
    settingsContainer.innerHTML = markup.join("");
    quizServerSettingsWrapper.innerHTML = serverSettingsMarkup.join("");

    $_.pause(100).then(() => {
      [...settingsContainer.querySelectorAll("input")].forEach((c) => {
        c.addEventListener("change", async (e) => {
          this.state.quizSettings[`${e.target.dataset.fieldId}`] = e.target
            .checked
            ? _.toNumber(e.target.dataset.valueField)
            : 0;
          await this._fetchQuestionList();
          this._renderQuestionSection();
        });
      });

      [...quizServerSettingsWrapper.querySelectorAll("input")].forEach((c) => {
        c.addEventListener("change", (e) => {
          this.state.quizSettings[`${e.target.dataset.fieldId}`] = e.target
            .checked
            ? _.toNumber(e.target.dataset.valueField)
            : 0;
        });
      });
    });
  }

  async handleQuizMakerAddRandomQuestions(randomQuizQuestionsResult, state) {
    const activeGrade = this._getActiveGradeData();
    // console.log(state);
    // let gradeLessonId = state.gradeLessonId;
    let parentGradeLessonId = state.parentGradeLessonId;
    // debugger;
    let sheet =
      this.state.activeTab.id !== 10013 ? "quizSheet" : "specialQuizSheet";

    let sequence =
      this.state.activeTab.id !== 10013
        ? "sheetSequence"
        : "specialSheetSequence";

    if (activeGrade[sequence].includes(parentGradeLessonId) === false) {
      activeGrade[sequence].push(parentGradeLessonId);
      activeGrade.quizSheet.set(parentGradeLessonId, randomQuizQuestionsResult);
    } else {
      // update on existiong list bse on questions not exist currently
      if (activeGrade[sheet].has(parentGradeLessonId)) {
        const currentQuestionsOnList =
          activeGrade[sheet].get(parentGradeLessonId);
        randomQuizQuestionsResult.forEach((q) => {
          const checkDuplicate = [...currentQuestionsOnList].filter(
            (item) => item.dataId === q.dataId,
          );
          if (checkDuplicate.length === 0) currentQuestionsOnList.push(q); // psy
        });
        activeGrade[sheet].set(parentGradeLessonId, currentQuestionsOnList);
      }
    }

    UIkit.modal(this.randomQuestionsModalWrapper).hide();
    this._renderQuestionSection();
    this._updateQuizSheetQuestionsOrder();
    this._renderQuizSheet();
  }

  handleQuizMakerAddTeachersQuestions(data, state) {
    const activeGrade = this._getActiveGradeData();

    let gradeLessonId = state.gradeLessonId;
    let sheet =
      this.state.activeTab.id < 10013 ? "quizSheet" : "specialQuizSheet";

    let sequence =
      this.state.activeTab.id < 10013
        ? "sheetSequence"
        : "specialSheetSequence";

    if (activeGrade[sequence].includes(gradeLessonId) === false) {
      activeGrade[sequence].push(gradeLessonId);
      activeGrade.quizSheet.set(gradeLessonId, data);
    } else {
      // update on existiong list bse on questions not exist currently
      if (activeGrade[sheet].has(gradeLessonId)) {
        const currentQuestionsOnList = activeGrade[sheet].get(gradeLessonId);
        data.forEach((q) => {
          const checkDuplicate = [...currentQuestionsOnList].filter(
            (item) => item.dataId === q.dataId,
          );
          if (checkDuplicate.length === 0) currentQuestionsOnList.push(q); // psy
        });
        activeGrade[sheet].set(gradeLessonId, currentQuestionsOnList);
      }
    }

    UIkit.modal(".teachers-questions").hide();
    this._renderQuestionSection();
    this._updateQuizSheetQuestionsOrder();
    this._renderQuizSheet();
    this.showLoader(0, "hide");
  }

  async handleQuizMakerAddSearchedQuestion(questionNodes) {
    const activeGrade = this._getActiveGradeData();

    let sheet =
      this.state.activeTab.id !== 10013 ? "quizSheet" : "specialQuizSheet";

    let sequence =
      this.state.activeTab.id !== 10013
        ? "sheetSequence"
        : "specialSheetSequence";
    // console.log(questionNodes);
    questionNodes.forEach((node) => {
      let gradeLessonId = node.parentGradeLessonId;

      if (activeGrade[sequence].includes(gradeLessonId) === false) {
        activeGrade[sequence].push(gradeLessonId);

        activeGrade.quizSheet.set(gradeLessonId, [node]); //questionNodes);
      } else {
        // update on existiong list bse on questions not exist currently
        if (activeGrade[sheet].has(gradeLessonId)) {
          const currentQuestionsOnList = activeGrade[sheet].get(gradeLessonId);
          // questionNodes.forEach((q) => {
          const checkDuplicate = [...currentQuestionsOnList].filter(
            (item) => item.dataId === node.dataId,
          );
          if (checkDuplicate.length === 0) currentQuestionsOnList.push(node); // psy
          // });
          activeGrade[sheet].set(gradeLessonId, currentQuestionsOnList);
        }
      }
    });

    UIkit.modal(this.questionSearchModalWrapper).hide();
    this._renderQuestionSection();
    this._updateQuizSheetQuestionsOrder();
    this._renderQuizSheet();
  }

  async handleQuizMakerAddPreparedQuestion(btn) {
    const activeGrade = this._getActiveGradeData();
    let examId = _.toNumber(btn.dataset.quizNumber);
    let userConcent = false;
    // if (userConcent === false) return;
    if (activeGrade.sheetSequence.length > 0)
      try {
        await UIkit.modal
          .confirm(
            `  دروس انتخاب شده در این پایه حذف و با سوالاتِ آزمون آماده جایگزین میشود، آیا اطمینان دارید؟`,
            {
              labels: {
                cancel: "خیر",
                ok: "بلی",
              },
            },
          )
          .then(async () => {
            userConcent = true;
          });
      } catch {
        (err) => console.log(err);
      }
    else userConcent = true;
    if (userConcent === true) {
      this.showLoader(5500);
      const preparedQuizQuestionsResult = await axios(
        `/api/School/GetExamHistoryQuestions?examid=${examId}`,
      );

      activeGrade.isEditingMode = false;
      activeGrade.quizSheet.clear();
      delete activeGrade.sheetSequence;
      activeGrade.sheetSequence = [];
      preparedQuizQuestionsResult.data.forEach((node) => {
        if (activeGrade.quizSheet.has(node.parentGradeLessonId))
          activeGrade.quizSheet.set(node.parentGradeLessonId, [
            ...activeGrade.quizSheet.get(node.parentGradeLessonId),
            node, //psy
          ]);
        else {
          activeGrade.quizSheet.set(node.parentGradeLessonId, [node]);
          activeGrade.sheetSequence.push(node.parentGradeLessonId);
        }
      });
      UIkit.modal(".default-exams").hide();
      await this._renderLessonContainer();
      this._updateQuizSheetQuestionsOrder();
      await this._renderQuizSheet();
      this._setEditButtonVisibility();
      this.showLoader(0, "hide");
    } else {
      UIkit.toggle(this.preparedQuizesModalToggler).toggle();
      //.dispatchEvent(new Event("click"));
      // UIkit.modal(".default-exams").show();
    }
  }

  async _getServerDate() {
    const serverDate = await axios(`/api/School/GetDateTime`);
    return serverDate.data || new Date.now();
  }

  async validate() {
    let isValid = true;
    let examTypeId = this.state.activeTab.id;
    let keys = [...Object.keys(this.state.quizInputs)].filter(
      (key) => key !== "quizClassList" && key !== "quizStudentList",
    );
    const data = this._getActiveGradeData();

    let hasDuplicsate = false;
    data.quizSheet.forEach((value, key) => {
      if ($_.hasDuplicates([...value].map((item) => item.dataId)))
        hasDuplicsate = true;
    });

    if (hasDuplicsate) {
      logify(
        { status: "warning", pos: "bottom-center" },
        "سوالی تکراری در لیست ساخته شده موجود است !",
      );
      //debugger;
      return false;
    }
    // return false;
    let sheet = data[examTypeId !== 10013 ? "quizSheet" : "specialQuizSheet"];
    // console.log(sheet);
    if (sheet.size === 0) {
      logify(
        { status: "warning", pos: "bottom-center" },
        "سوالی برای امتحان انتخاب نشده",
      );
      return false;
    }

    let questionCount = 0;
    for (let key of sheet.keys()) {
      sheet.get(key).forEach((el) => questionCount++);
    }
    if (questionCount > 200) {
      logify(
        { status: "warning", pos: "bottom-center" },
        "حداکثر تعداد سوالات مجاز 200 گزینه میباشد",
      );
      return false;
    }

    if (examTypeId === 10013) {
      let hasQuestionsWithNoAnswer = [];
      data.specialSheetSequence.forEach((lessonId) => {
        if (
          data.specialQuizSheet
            .get(lessonId)
            .filter((question) => question.answerCode === 0).length > 0
        )
          hasQuestionsWithNoAnswer.push(true);
      });

      if (hasQuestionsWithNoAnswer.map((r) => r).length > 0) {
        logify(
          { status: "warning", pos: "bottom-center" },
          "پاسخ صحیح برخی سوالات تستی انتخاب نشده ",
        );
        return false;
      }
    }

    if (this.quizDate.value === "") {
      logify(
        { status: "warning", pos: "bottom-center" },
        "تاریخ برگزاری آزمون مشخص نگردیده است",
      );
      return false;
    }

    const serverDate = this.serverDate; // || this._getServerDate();
    const today = moment(serverDate.persianDateTime, "jYYYY/jMM/jDD").format(
      "jYYYY/jMM/jDD",
    );

    if (moment(this.quizDate.value.trim()).isBefore(today)) {
      logify(
        { status: "warning", pos: "bottom-center" },
        "تاریخ برگزاری آزمون پیش از تاریخ روز جاری انتخاب شده",
      );
      return false;
    }

    if (examTypeId === 10011) {
      let quizStartTime = moment(
        this.quizStartTimeElement.value.trim(),
        "hh:mm",
      );
      let quizEndTime = moment(this.quizEndTimeElement.value.trim(), "hh:mm");

      if (quizStartTime.isSameOrAfter(quizEndTime)) {
        logify(
          { status: "warning", pos: "bottom-center" },
          "زمان شروع آزمون با پایان مطابقت ندارد",
        );
        return false;
      }
    }

    for (let key of keys) {
      let value = this.state.quizInputs[key];
      let el = document.getElementById(key);
      if (el)
        if (value === "" || value === 0) {
          if (el) {
            if (examTypeId === 10014) {
              if (el.id === "quizName") {
                el.setCustomValidity("فیلید الزامیست");
                isValid = false;
                break;
              }
            } else {
              el.setCustomValidity("فیلید الزامیست");
              isValid = false;
              break;
            }
          }
        } else {
          el.setCustomValidity("");
        }
      // }

      if (isValid === false) {
        logify(
          { status: "warning", pos: "bottom-center" },
          "فیلد های مشخص شده را تکمیل نمایید",
        );
        return isValid;
      }
      //  else {

      //   }
      return isValid;
    }
  }

  checkHasTestMaker(status, gradeId = 0) {
    let isValid = false;
    if (status) {
      if (gradeId === 0) isValid = status.some((g) => g.hasTestMaker);
      else
        isValid = status.filter((g) => g.gradeFieldId == gradeId)[0]
          .hasTestMaker;
    } else {
      if (gradeId === 0)
        isValid = this.state.contractsStatus.some((g) => g.hasTestMaker);
      else
        isValid = this.state.contractsStatus.filter(
          (g) => g.gradeFieldId == gradeId,
        )[0].hasTestMaker;
    }
    // console.log(isValid);
    return isValid;
  }

  handleGotoContractsTab() {
    const switcher = document.getElementById("main_tab_switcher");
    const order = document.getElementById("order");
    UIkit.switcher(switcher).show(
      Array.from(order.parentNode.children).indexOf(order),
    );
  }

  showLoader(n = 200, type = "show") {
    if (type === "show") {
      this.loader.classList.remove("loaded");
      $_.pause(n).then(() => this.loader.classList.add("loaded"));
    } else this.loader.classList.add("loaded");
  }
};

export default quizMaker;
