import { ProxyHelper as proxy } from "../../../common/utils/proxy.utils";
import { validateInput } from "../../../common/app/validation";
import { $_ } from "../../../common/utils/create.dom";
import { logify } from "../../../common/utils/ukHelper";
import TeacherAccordionItem from "../components/TeacherAccordionItem";
import _ from "lodash";
import * as UIkit from "uikit";
import _fetch from "../../../common/_Fetch";

export default (function () {
  const apis = {
    teachersInfo: {
      getTeachersInfo: {
        url: "/api/School/GetTeachersInfo",
      },
      insertTeacherInfo: {
        url: "/api/School/InsertTeacherInfo",
        method: "post",
      },
      deleteTeacher: {
        url: "/api/School/DeleteTeacher",
      },
    },
    teacherLessons: {
      getTeacherGradeFields: {
        url: "/api/School/GetTeacherGradeFields",
      },
      getTeacherLessons: {
        url: "/api/School/GetTeacherLessons",
      },
      getTeacherClasses: {
        url: "/api/School/GetTeacherClasses",
      },
      insertTeacherLesson: {
        url: "/api/School/InsertTeacherLesson",
        methord: "post",
      },
      deleteTeacherGradeLessonDetail: {
        url: "/api/School/DeleteTeacherGradeLessonDetail",
        method: "post",
      },
      sendTeacherSMS: {
        url: "/api/School/SendTeacherSMS",
      },
    },
  };

  return {
    dom: {
      formContainer: "addTeacherRecord_Form",
      submitButtonId: "insertTeacherInfo_button",
      teacherListContainer: "teachersList_accordion",
      deleteButtonsSelector: "button.delete-teacher",
      lessonSelectCOntainer: "lesson-input-selects",
      sendTeacherSMS: ".js-send-sms_button",
      sendTeacherIcon: ".comment-icon",
      deleteTeacherLessonButton: "deleteLessonButton_",
      copyToClipboardButton: ".js-copy-karpooshe-link_button",
      animatedDots: ".dot-pulse",
    },
    _fetch: _fetch(apis),
    state: {
      addTeacherForm: {
        fields: [
          { name: "genderId", fieldName: "جنسیت" },
          { name: "firstName", fieldName: "نام" },
          { name: "lastName", fieldName: "نام خانوادگی" },
          { name: "cellPhoneNo", fieldName: "شماره تلفن همراه" },
        ],
        values: {
          genderId: "",
          firstName: "",
          lastName: "",
          cellPhoneNo: "",
        },
        inputs: [], // Holds input elements
      },
      teachers: {
        data: [],
        container: null, // fill up later in initForm
      },
    },
    setTeachersListData: function (data) {
      this.state.teachers.data.length = 0;
      this.state.teachers.data = [];
      this.state.teachers.data = [...data];
    },
    resetFormValuesAndState: function () {
      this.state.addTeacherForm.inputs.forEach((el) => {
        if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
      });
      Object.keys(this.state.addTeacherForm.values).forEach(
        (key) => (this.state.addTeacherForm.values[key] = "")
      );
    },
    bindDeleteButton: function (container, centerTeacherId) {
      let button = container.querySelector(this.dom.deleteButtonsSelector);
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        UIkit.modal
          .confirm(` آیا از حذف اطلاعات معلم اطمینان دارید؟ `, {
            labels: {
              cancel: "خیر",
              ok: "بلی",
            },
          })
          .then(
            async () => {
              const deleteStatus = await this._fetch(
                "teachersInfo",
                "deleteTeacher",
                { centerTeacherId: centerTeacherId }
              );
              if (deleteStatus) {
                const updatedTeachersList = [
                  ...this.state.teachers.data,
                ].filter(
                  (record) => record.centerTeacherId !== centerTeacherId
                );
                this.setTeachersListData(updatedTeachersList);
                this.renderTeachersList();
              }
            },
            function () {
              // In case of rejection
            }
          );
      });
    },
    bindSmsSending: async function (container, props) {
      const button = container.querySelector(this.dom.sendTeacherSMS);
      const SMSIcon = container.querySelector(this.dom.sendTeacherIcon);
      const dotsDance = container.querySelector(this.dom.animatedDots);
      button.addEventListener("click", async (e) => {
        dotsDance.classList.remove("uk-hidden");
        button.classList.add("uk-text-primary");
        button.classList.add("disable-sms-sending");
        SMSIcon.setAttribute("uk-icon", "comment");
        button.disabled = true;
        let resault = await this._fetch("teacherLessons", "sendTeacherSMS", {
          ...props,
        });
        setTimeout(() => {
          button.classList.remove("disable-sms-sending");
        }, 30000);
        $_.pause(3000).then(() => {
          button.disabled = false;
          button.classList.remove("uk-text-primary");
          SMSIcon.setAttribute("uk-icon", "commenting");
          dotsDance.classList.add("uk-hidden");
          if (!!resault) logify({}, "پیامک با موفقیت ارسال گردید");
          else logify({}, "اشکال در ارسال پیامک");
        });
      });
    },
    bindCopyToClipboardButton: async function (container, info) {
      const button = container.querySelector(this.dom.copyToClipboardButton);
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const tempInput = document.createElement("INPUT");
        tempInput.style = "position:absolute;left:-1000px;top:-1000px";
        tempInput.value = info.karpoosheLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      });
    },
    bindDeleteTeacherGradeLessonDetail: async function (
      container,
      info,
      teacherGradeFields,
      classListMap
    ) {
      info.l2.forEach((lesson) => {
        const button = container.querySelector(
          `#${this.dom.deleteTeacherLessonButton}${lesson.teacherGradeLessonDetailId}`
        );
        button.addEventListener("click", async (e) => {
          e.preventDefault();
          UIkit.modal
            .confirm(` آیا از حذف درس اطمینان دارید؟ `, {
              labels: {
                cancel: "خیر",
                ok: "بلی",
              },
            })
            .then(
              async () => {
                const deleteStatus = await this._fetch(
                  "teacherLessons",
                  "deleteTeacherGradeLessonDetail",
                  {
                    teacherGradeLessonDetailId:
                      lesson.teacherGradeLessonDetailId,
                  }
                );

                if (deleteStatus) {
                  const updatedTeachersList = [...this.state.teachers.data].map(
                    (record) => {
                      if (record.centerTeacherId === info.centerTeacherId) {
                        return {
                          ...record,
                          l2: (() =>
                            [...record.l2].filter(
                              (lessonItem) =>
                                lessonItem.teacherGradeLessonDetailId !==
                                lesson.teacherGradeLessonDetailId
                            ))(),
                        };
                      } else return { ...record };
                    }
                  );
                  this.setTeachersListData(updatedTeachersList);
                  this.renderTeacherLessonList({
                    container,
                    centerTeacherId: info.centerTeacherId,
                    teacherGradeFields,
                    classListMap,
                  });
                }
              },
              function () {
                // In case of rejection
              }
            );
        });
      });
    },
    initInsertTeacherInfoForm: function () {
      proxy.inputNamedChange(this.state.addTeacherForm.values);
      const formElement = document.getElementById(this.dom.formContainer);
      const submitButton = formElement.querySelector(
        `#${this.dom.submitButtonId}`
      );
      const inputsKeyArray = Object.keys(this.state.addTeacherForm.values);
      inputsKeyArray.forEach((key) => {
        this.state.addTeacherForm.inputs.push(
          document.getElementsByName(key)[0]
        );
      });
      this.state.teachers.container = document.getElementById(
        this.dom.teacherListContainer
      );
      submitButton.addEventListener(
        "click",
        async (e) => {
          e.preventDefault();
          let validationMassages = [];
          this.state.addTeacherForm.inputs.every((input, i) => {
            let validityMassage = validateInput(
              input,
              "فیلد " +
                this.state.addTeacherForm.fields.filter(
                  (field) => field.name === inputsKeyArray[i]
                )[0].fieldName
            );
            if (validityMassage !== "") {
              validationMassages.push(validityMassage);
              e.stopImmediatePropagation();
              return false;
            } else return true;
          });

          let isValid = true;
          let invalidList = [];
          validationMassages.forEach((massage) => {
            if (massage !== "") {
              isValid = false;
              invalidList.push({ input: e.target, massage: massage });
            }
          });
          if (isValid) {
            let teachersList = await this._fetch(
              "teachersInfo",
              "insertTeacherInfo",
              this.state.addTeacherForm.values
            );
            this.resetFormValuesAndState(); // clear out inputs
            this.setTeachersListData(teachersList);
            this.renderTeachersList();
          } else {
            logify({}, invalidList[0].massage);
          }
        },
        false
      );
    },
    renderTeachersList: function () {
      let teachersAccordionComponents = [];
      let first = 0;
      this.state.teachers.data.forEach((info) => {
        teachersAccordionComponents.push(`<li id="teacher_accordion_item_${
          info.centerTeacherId
        }" data-center-teacher-id="${
          info.centerTeacherId
        }" class="teacher-accordion-item
                                                 ${
                                                   first === 0 ? "uk-open" : ""
                                                 }">
                                                 </li>`);
        first++;
      });
      $_.removeElementChildNodes(this.state.teachers.container);
      this.state.teachers.container.innerHTML =
        teachersAccordionComponents.join("");
      $_.pause(0).then(async () => {
        const teacherGradeFields = await this._fetch(
          "teacherLessons",
          "getTeacherGradeFields"
        );
        const classListMap = new Map(); // initially fetch classLists to avoid callback on select change
        await Promise.all(
          teacherGradeFields.map(async (grade) => {
            const classList = await this._fetch(
              "teacherLessons",
              "getTeacherClasses",
              { gradeFieldId: grade.gradeFieldId }
            );
            classListMap.set(grade.gradeFieldId, classList);
          })
        );

        this.state.teachers.data.forEach((info) => {
          const markup = TeacherAccordionItem({ ...info });
          const container = this.state.teachers.container.querySelector(
            `#teacher_accordion_item_${info.centerTeacherId}`
          );
          container.innerHTML = markup;
          $_.pause(0).then(() => {
            this.bindTeacherDetails(
              container,
              info,
              teacherGradeFields,
              classListMap
            );
          });
        });
      });
    },
    bindTeacherDetails: async function (
      container,
      info,
      teacherGradeFields,
      classListMap
    ) {
      this.bindDeleteButton(container, info.centerTeacherId);
      this.bindSmsSending(container, {
        centerTeacherId: info.centerTeacherId,
        fullName: info.fullName,
        cellphone: info.cellphone,
        karpoosheLink: info.karpoosheLink,
      });
      // this.bindCopyToClipboardButton(container, info);
      this.bindDeleteTeacherGradeLessonDetail(
        container,
        info,
        teacherGradeFields,
        classListMap
      );
      this.bindSelectRegion(container, {
        centerTeacherId: info.centerTeacherId,
        teacherGradeFields,
        classListMap,
      });
    },
    bindSelectRegion: async function (container, props) {
      const { centerTeacherId, teacherGradeFields, classListMap } = props;
      const lessonSelectContainer = container.querySelector(
        ".lesson-input-selects"
      );
      const selects = [
        ...lessonSelectContainer.querySelectorAll("[data-select-component]"),
      ];
      const baseSelect = selects.filter(
        (select) => select.name === "baseSelect"
      )[0];
      const lessonSelect = selects.filter(
        (select) => select.name === "lessonSelect"
      )[0];
      const classSelect = selects.filter(
        (select) => select.name === "classSelect"
      )[0];
      let baseSelectmarkup = `<option value="0" disabled selected>پایه</option>
`;
      teacherGradeFields.forEach(
        (grade) =>
          (baseSelectmarkup += `<option value="${grade.gradeFieldId}">${grade.caption}</option>`)
      );
      baseSelect.innerHTML = baseSelectmarkup;
      // Init and bind grade select box
      baseSelect.addEventListener("change", async (e) => {
        // Init and bind lesson select box
        const lessons = await this._fetch(
          "teacherLessons",
          "getTeacherLessons",
          { gradeFieldId: _.toNumber(e.target.value) }
        );
        $_.removeElementChildNodes(lessonSelect);
        $_.removeElementChildNodes(classSelect);
        let optionsMarkup = `<option disabled selected> درس</option> `;
        lessons.forEach(
          (lesson) =>
            (optionsMarkup += `<option value="${lesson.gradeLessonDetailId}" >${lesson.caption}</option >`)
        );
        lessonSelect.innerHTML = optionsMarkup;
      });
      // Init and bind lesson select box
      lessonSelect.addEventListener("change", (e) => {
        const classes = classListMap.get(_.toNumber(baseSelect.value)); //this.getTeacherClasses(baseSelect.value)
        $_.removeElementChildNodes(classSelect);
        let optionsMarkup = ``;
        classes.forEach(
          (clas) =>
            (optionsMarkup += `<label> <input value="${clas.classNo}" class="uk-checkbox" type="checkbox"> ${clas.classNo}</label>`)
        );
        classSelect.innerHTML = optionsMarkup;
      });
      //init submit button for insertTeacherLesson
      const submitTeacherCourse = document.querySelector(
        `#submitTeacherCourse_${centerTeacherId} `
      );
      submitTeacherCourse.addEventListener("click", async (e) => {
        e.stopImmediatePropagation();
        let clsList = [...classSelect.querySelectorAll("input")]
          .filter((el) => el.checked)
          .map((el) => el.value)
          .join(",");
        if (lessonSelect.value > 0 && clsList.length > 0) {
          let resault = await this._fetch(
            "teacherLessons",
            "insertTeacherLesson",
            {
              centerTeacherId: centerTeacherId,
              gradeLessonDetailId: lessonSelect.value,
              classList: clsList,
            }
          );
          if (resault) {
            this.setTeachersListData(resault);
            this.renderTeacherLessonList({
              container,
              centerTeacherId,
              teacherGradeFields,
              classListMap,
            });
          }
        } else {
          logify({}, "لطفا فرم را تکمیل فرمایید");
        }
      });
    },
    renderTeacherLessonList(props) {
      //
      const { container, centerTeacherId, teacherGradeFields, classListMap } =
        props;
      $_.removeElementChildNodes(container);
      const info = [...this.state.teachers.data].filter(
        (item) => item.centerTeacherId === centerTeacherId
      )[0];
      const markup = TeacherAccordionItem({ ...info });
      props.container.innerHTML = markup;
      $_.pause(0).then(() => {
        this.bindTeacherDetails(
          container,
          info,
          teacherGradeFields,
          classListMap
        );
      });
    },
    init: async function () {
      const result = await this._fetch("teachersInfo", "getTeachersInfo");
      this.state.teachers.data = result;
      this.initInsertTeacherInfoForm();
      this.renderTeachersList();
      return this;
    },
  };
})();
