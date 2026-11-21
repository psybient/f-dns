const quizMakerTabSwitcherArray = [10011, 10012, 10013];
const quizMakerTabSwitcherNameArray = ["آنلاین", "حضوری", "اختصاصی"];
const questionNodeDefaultValues = {
  answerCode: 0,
  dataId: 0,
  quizFactor: 0,
  studyUnitCaption: "",
  studyUnitCode: 0,
};

const quizInputsInitialData = {
  quizName: "",
  quizDate: "",
  quizClassList: [],
  quizStudentList: [],
  quizStartTime: "10:00",
  quizEndTime: "11:00",
  quizDuration: 30,
};

const getInitialState = (props) => {
  return {
    activeTab: {
      id: quizMakerTabSwitcherArray[0],
      name: quizMakerTabSwitcherNameArray[0],
    },
    activeGrade: { id: 0, name: "" },
    activeGradeLessonId: 0,
    activeBaseGradeLessonId: 0,
    quizSettings: {
      isCommonExamin: 1,
      isSelfExamin: 2,
      isEasy: 54,
      isMedium: 53,
      isHard: 52,
      isFinalCalculation: 0,
      isShowChoices: 1,
      isQuizNagativePoint: 0,
      // isJustUnused: 0,
    },
    quizInputs: { ...quizInputsInitialData },
    specialQuizInputs: { ...quizInputsInitialData },
    grades: [],
    data: [],
    examHistoryData: [],
    initialPass: true,
    // isEditingMode: 0,
    activeQuestionImageModal: 0,
    activeExamHistoryList: [],
    isQuizSheetCollapse: false,
    ...props,
  };
};

const getQuizCheckboxesStatus = (state) => {
  return [
    {
      id: "easy_checkbox",
      caption: "آسان",
      group: 0,
      dataField: "isEasy",
      value: state.quizSettings.isEasy,
      dataValue: 54,
      class: "options-switch-1-3-1",
      color: "itsEasy",
    },
    {
      id: "medium_checkbox",
      caption: "متوسط",
      group: 0,
      dataField: "isMedium",
      value: state.quizSettings.isMedium,
      dataValue: 53,
      class: "options-switch-1-3-2",
      color: "itsIntermediate",
    },
    {
      id: "hard_checkbox",
      caption: "دشوار",
      group: 0,
      dataField: "isHard",
      value: state.quizSettings.isHard,
      dataValue: 52,
      class: "options-switch-1-3-3",
      color: "itsHard",
    },
    {
      id: "common_exam_checkbox",
      caption: "مقدماتی",
      group: 0,
      dataField: "isCommonExamin",
      value: state.quizSettings.isCommonExamin,
      dataValue: 1,
      class: "options-switch-1-2-1",
      color: "",
    },
    {
      id: "slef_examin_checkbox",
      caption: "پیشرفته",
      group: 0,
      dataField: "isSelfExamin",
      value: state.quizSettings.isSelfExamin,
      dataValue: 2,
      class: "options-switch-1-2-2",
      color: "",
    },

    {
      id: "show_choices_checkbox",
      caption: "نمایش گزینه‌ها",
      group: 0,
      dataField: "isShowChoices",
      value: state.quizSettings.isShowChoices,
      dataValue: 1,
      class: "options-switch-1-2-1",
      color: "",
    },
    {
      id: "just-unused_checkbox",
      caption: "سؤال غيرتكراري",
      group: 0,
      dataField: "isJustUnused",
      value: state.quizSettings.isJustUnused,
      dataValue: 1,
      class: "options-switch-1-2-2",
    },
  ];
};

const stateModel = {
  questionNodeDefaultValues,
  quizInputsInitialData,
  getInitialState,
  getQuizCheckboxesStatus,
};

export default stateModel;
