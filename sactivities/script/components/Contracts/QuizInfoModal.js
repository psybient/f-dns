import UIkit from "uikit";
import axios from "axios";
import { $_ } from "../../../../common/utils/create.dom";
import { logify } from "../../../../common/utils/ukHelper";

const QuizInfoModal = class {
  constructor(props) {
    this.mainTabSwitcher = props.mainTabSwitcher;
    this.handleStudentListPresencyAcceptChange =
      props.handleStudentListPresencyAcceptChange;
    this.handleGotoStudentList = props.handleGotoStudentList;
    this.examScheduleModal = props.examScheduleModal;
    this.handleReRenderRegistration = props.handleReRenderRegistration;
    this.referPaymentModalRef = props.referPaymentModalRef;
    this.state = {
      participants: props.participants,
      orderInfo: props.orderInfo,
      examId: props.examId,
      typeId: props.typeId,
    };
    this.settings = {
      participantsCount: 0,
      participantsArray: [],
      participantsPrevCount: 0,
      participantsPrevArray: [],
      prevOrderInfo: { ...props.orderInfo },
    };
    this.modal = null;
    this.modalBody = null;
    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  init() {
    let modal = document.getElementById("exam_student_list_selection_modal");
    this.modal = UIkit.modal(modal);
    this.modalBody = modal.querySelector(
      "#exam_student_list_selection_modal_body"
    );
    return this;
  }

  updateParticipants() {
    const pCount = document.getElementById("participants_count");
    pCount.innerHTML = this.state.participants.filter(
      (el) => el.isPresent === true
    ).length;

    let count = this.settings.participantsCount;
    this.state.participants.forEach((el) => {
      if (el.isPresent === true) {
        count++;
        if (
          this.settings.participantsArray.includes(el.testPersonId) === false
        ) {
          this.settings.participantsArray.push(el.testPersonId);
        }
      } else {
        if (this.settings.participantsArray.includes(el.testPersonId)) {
          count--;
          const updatedList = $_.removeElementFromArrayAndEmmitZeroz(
            this.settings.participantsArray,
            el.testPersonId
          );
          delete this.settings.participantsArray;
          this.settings.participantsArray = updatedList;
        }
      }
      this.settings.participantsCount = count;
    });
  }

  render() {
    let loadingCover = document.getElementById("Wait_For_Done");
    $_.removeElementChildNodes(this.modalBody);
    const _that = this;

    const checkIfParticipantsChange = () => {
      let hasChanged = false;
      // if (
      //   _that.settings.participantsArray.length !==
      //   _that.settings.participantsPrevArray.length
      // ) {
      let changedArray = _that.settings.participantsArray.filter(
        (p) => _that.settings.participantsPrevArray.includes(p) === false
      );
      // console.log(changedArray);

      let changedPrevArray = _that.settings.participantsPrevArray.filter(
        (p) => _that.settings.participantsArray.includes(p) === false
      );
      // console.log(changedPrevArray);

      if (changedPrevArray.length > 0 || changedArray.length > 0)
        hasChanged = true;
      // console.log(changedArray, changedPrevArray);
      // }

      return hasChanged;
    };

    const checkIfOrderInfoChanged = () => {
      var hasChanged = false;

      const presentStudentsCount = this.state.participants.filter(
        (el) => el.isPresent === true
      ).length;

      for (let key in this.state.orderInfo) {
        if (
          this.state.orderInfo[key] !== this.settings.prevOrderInfo[key] &&
          !(
            presentStudentsCount == 0 &&
            this.state.orderInfo.participantsCount == 0
          )
        ) {
          hasChanged = true;
          break;
        }
      }
      return hasChanged;
    };

    const allSelectedStudentsRegistered = () => {
      var allRegistered = true;
      const unregisteredStudents = document.querySelectorAll(".scroll-to-this");

      if (unregisteredStudents.length > 0) {
        allRegistered = false;
      }
      return allRegistered;
    };

    // UIkit.util.on('#exam_student_list_selection_modal', 'shown', function() {

    //       console.log(allSelectedStudentsRegistered());

    UIkit.util.on("#exam_student_list_selection_modal", "shown", function () {
      if (!allSelectedStudentsRegistered()) {
        gotoRegistrationStudentList.classList.add("go-to-student-list");
        setTimeout(function () {
          gotoRegistrationStudentList.classList.remove("go-to-student-list");
        }, 2000);

        var emptyNameStudents = document.querySelectorAll(".scroll-to-this");
        emptyNameStudents.forEach((elem) => {
          elem.classList.add("flash-now");
        });
        setTimeout(function () {
          emptyNameStudents.forEach((elem) => {
            elem.classList.remove("flash-now");
          });
        }, 2000);

        if (emptyNameStudents.length > 0) {
          emptyNameStudents[emptyNameStudents.length - 1].scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }
    });

    //       //   // logify({ status: "warning" }, "لطفاً ليست اسامي دانش‌آموزان را تكميل نماييد.");
    //       //   }
    //     });

    const {
      examDate,
      lockDate,
      examId,
      examTypeId,
      gradeFieldCaption,
      gradeFieldId,
      isBridgeScience,
      participantsCount,
      printIt,
      testCaption,
      testNo,
      testPersonCount,
      isTimeToOrderOver,
      toolTip,
      afterLockEditable,
      hasBeenPurchased,
      has50Percent,
      canOrderOnlineAfterLock,
    } = this.state.orderInfo;

    // console.log('this.state.orderInfo');
    // console.log(this.state.orderInfo);

    // let maxClassNo = Math.max(...this.state.participants.map(o => o.classNo), 0);
    const classess = [];
    this.state.participants.forEach((el) => classess.push(el.classNo));
    const uniqueclassess = [...new Set(classess)];

    let hasParticipant = this.state.participants.some(
      (el) => el.isPresent === true
    );
    const checkCount = this.state.participants.filter(
      (el) => el.isPresent === true
    );

    const listOfParticipants = checkCount.map((el) => el.testPersonId);
    this.settings.participantsArray = [...listOfParticipants];
    this.settings.participantsPrevArray = [...listOfParticipants];
    this.settings.participantsCount = listOfParticipants.length;

    let hasEmptyStudentName = false;
    for (var key in this.state.participants) {
      if (Object.values(this.state.participants[key]).some((x) => x === " ")) {
        hasEmptyStudentName = true;
      }
    }

    const changeScienseSepInPack = ((gradeFieldId === 7 || gradeFieldId === 8 || gradeFieldId === 9) && toolTip.includes("بسته"));

    this.modalBody.innerHTML = `
			<button class="uk-modal-close-default" type="button" uk-close></button>	
      <div class="check-all-controlls ${isTimeToOrderOver === true || afterLockEditable || has50Percent 
                                        ? !canOrderOnlineAfterLock
                                          ? `disable-edit`
                                          : ``
                                        : ``}">
        <a id="handle_student_list_selectAll" data-is-active-checkbox="${
          hasParticipant ? "true" : "false"
        }">
          <img class="check-all" src="/dist/assets/sactivity/checkall.svg">
        </a>
        ${
          uniqueclassess.length > 1
            ? uniqueclassess
                .map(
                  (c) =>
                    `<a uk-icon="check" class="check-all-classes" data-student-list-data-class-number-checkall="${c}">${c}</a>`
                )
                .join("")
            : ""
        }

      </div>
			<ol id="student_list_scroll" class="student-list custom 
                ${isTimeToOrderOver === true || has50Percent 
                  ? !canOrderOnlineAfterLock 
                    ? `disable-edit` 
                    : ``
                  : ``}">
                ${this.state.participants
                  .map(
                    (p, index) =>
                      `<li class="
                        ${p.studentName === " "
                          ? "go-to-student-list scroll-to-this"
                          : ""}
                        ${(afterLockEditable && p.isPresent) ? "disable-unselected" : ""}
                        ${!p.isPresent && has50Percent ? "new-std" : ""}">
                    <input ${
                      p.disabled === false
                        ? `data-contract-order-student-presency-input="${p.testPersonId}" data-student-list-class-number="${p.classNo}"`
                        : ""
                    } 
                    class="uk-checkbox" ${
                      p.disabled ? "disabled" : ""
                    } type="checkbox" ${p.isPresent ? "checked" : ""}><span class="student-name">${
                        p.studentName
                      }</span>
                      <span class="closs-no">${p.classNo}</span>
                      </li>`
                  )
                  .join("")}
			</ol>

			<div class="exam-information 
          ${(isTimeToOrderOver === true || afterLockEditable || has50Percent) 
            ? !canOrderOnlineAfterLock 
              ? `disable-edit` 
              : ``
            : ``
          }
          ${changeScienseSepInPack ? "allow-to-change-siencesep" : "" }
      
      ">
				<p>شركت‌كنندگان</p>
				<p><span id="participants_count">${participantsCount}</span> از ${testPersonCount} نفر</p>
				<p>${testCaption}</p>
				<p>${gradeFieldCaption}</p>	
        <div ${this.state.typeId === 4 ? "hidden" : ""}>
        <p>${examDate}</p>			
        <p class="deadline">
          <span class="title">مهلت ثبت و ويرايش</span>
          <span class="date">${lockDate}</span>  
          <span class="info" uk-icon="icon: info; ratio: 0.7" uk-tooltip="title: پس از گذشت تاريخ مهلت ثبت و ويرايش امكان هيچ‌گونه تغيير اعم از تعداد دانش‌آموزان و تنظيمات آزمون وجود نخواهد داشت."></span>
        </p>
				<div ${
          (gradeFieldId === 7 || gradeFieldId === 8 || gradeFieldId === 9) & (Number(testCaption.replace(/[^0-9]/g, '')) > 0 ) & (Number(testCaption.replace(/[^0-9]/g, '')) < 7)
            ? ""
            : "hidden"
        }
        class="uk-animation-slide-left">
					<select class="uk-select" aria-label="Select" 
                    data-contract-order-student-exam-type-separate-select="${examId}">
						<option value="0">علوم </option>
						<option value="1">علوم تفكيكي</option>
					</select>
          <span class="info" uk-icon="icon: info; ratio: 0.7" uk-tooltip="title: علوم تفكيكي مخصوص مدارسي است كه علوم تجربي را به صورت درس‌هاي جداگانه فيزيك، شيمي، زيست و زمين‌شناسي تدريسي مي‌نمايند."></span>
        </div>
				<div class="uk-animation-slide-left">
					<select ${
            (Number(testCaption.replace(/[^0-9]/g, '')) > 0)
              ? ""
              : "disabled"
          }
          class="uk-select" aria-label="Select" 
                    data-contract-order-student-exam-type-print-select="${examId}">
						<option value="0">بدون پرينت</option>
						<option value="1">پرينت گزارش</option>
					</select>
					<span class="info" uk-icon="icon: info; ratio: 0.7" uk-tooltip="title: با درخواست پرينت گزارش‌ها پس از برگزاری آزمون و اعلام نتایج نهایی در سایت، گزارش‌های مدرسه و دانش‌آموزان پرینت و ارسال می‌شود؛ در صورت عدم درخواست، ده درصد تخفیف به آزمون اضافه خواهد شد.; cls: tooltip-justify uk-active"></span>
        </div>
				<div class="uk-animation-slide-left">
					<select class="uk-select" aria-label="Select" data-contract-order-student-exam-type-online-select="${examId}">
            <option value="0" ${canOrderOnlineAfterLock ? `hidden disabled`: ``}>حضوری</option> 
						<option value="1">آنلاین</option>
					</select>
        </div>
        </div>
				
			</div>
      <button id="cancel_order" class="cancel-button 
        ${(isTimeToOrderOver === true || afterLockEditable || has50Percent || !hasParticipant) 
          ? (!canOrderOnlineAfterLock)
            ? `hide-in-nowhere` 
            : hasParticipant ? `only-online` : `hide-in-nowhere`
          : ``
        }
      ">حذف سفارش</button>
			
      <button disabled id="handle_student_list_update" class="ok-button disable 
        ${isTimeToOrderOver === true && !changeScienseSepInPack 
          ? !canOrderOnlineAfterLock 
            ? `hide-in-nowhere` 
            : `only-online`          
          : ``
        }
        ">تأييد</button>
      
      ${((isTimeToOrderOver) && !changeScienseSepInPack) 
        ? `<div class="tool-tip ${canOrderOnlineAfterLock ? "only-online" : ""}">${toolTip}</div>`
        : ``
      }

			<div class="icon-buttons">
				<span data-contract-order-quiz-schedule-button=${gradeFieldId} 
        data-contract-order-quiz-schedule-button-caption="${gradeFieldCaption}" uk-icon="icon: calendar" uk-tooltip="title: برنامه آزمون ; pos: left"></span>
				<span data-contract-order-student-list-edit="${gradeFieldId}" uk-icon="icon: list" uk-tooltip="title: ثبت و اصلاح اسامي; pos: left"></span>
			</div>
    `;

    // bindings
    const acceptQuizChangeButton = this.modalBody.querySelector(
      "#handle_student_list_update"
    );

    const toggleAcceptButtonStatus = (
      statuslist = true,
      statusoptions = true
    ) => {
      if (!statuslist && !statusoptions) {
        acceptQuizChangeButton.setAttribute("disabled", "true");
        acceptQuizChangeButton.classList.add("disable");
        acceptQuizChangeButton.classList.remove("enable");
      } else {
        acceptQuizChangeButton.removeAttribute("disabled");
        acceptQuizChangeButton.classList.remove("disable");
        acceptQuizChangeButton.classList.add("enable");
      }
    };

    const studentListNods = this.modalBody.querySelectorAll(
      "[data-contract-order-student-presency-input]"
    );
    // console.log(studentListNods);
    studentListNods.forEach((studentNode) => {
      let testPersonId = _.toNumber(
        studentNode.dataset.contractOrderStudentPresencyInput
      );

      // select and deselect only with select all button
      studentNode.addEventListener("click", () => {
        // console.log(_that.state.typeId);
        // if (this.state.typeId !== 4) {
        const updatedList = [
          ..._that.state.participants.map((p) => {
            if (p.testPersonId === testPersonId) {
              p.isPresent = studentNode.checked ? true : false;
            }
            return p;
          }),
        ];

        _that.state.participants = updatedList;
        // const checkCount = updatedList.filter((el) => el.isPresent === true);
        // if (checkCount.length !== _that.settings.participantsCount) {
        _that.updateParticipants();
        // this.settings.participantsCount = checkCount.length;
        let hasChangedList = checkIfParticipantsChange();
        let hasChanged = checkIfOrderInfoChanged();

        toggleAcceptButtonStatus(hasChanged, hasChangedList);
        // }
      });
    });

    const examTypeSelect = this.modalBody.querySelector(
      "[data-contract-order-student-exam-type-separate-select]"
    );
    examTypeSelect.selectedIndex = this.state.orderInfo.isBridgeScience ? 1 : 0;

    examTypeSelect.addEventListener("change", () => {
      const selectedOption = $_.getSelectedOption(examTypeSelect);
      this.state.orderInfo.isBridgeScience =
        selectedOption.value === "0" ? false : true;
      let hasChangedList = checkIfParticipantsChange();
      let hasChanged = checkIfOrderInfoChanged();

      toggleAcceptButtonStatus(hasChanged, hasChangedList);
    });

    const examTypePrintSelect = this.modalBody.querySelector(
      "[data-contract-order-student-exam-type-print-select]"
    );
    examTypePrintSelect.selectedIndex = this.state.orderInfo.printIt ? 1 : 0;

    examTypePrintSelect.addEventListener("change", () => {
      const selectedOption = $_.getSelectedOption(examTypePrintSelect);
      this.state.orderInfo.printIt =
        selectedOption.value === "0" ? false : true;
      let hasChangedList = checkIfParticipantsChange();
      let hasChanged = checkIfOrderInfoChanged();

      toggleAcceptButtonStatus(hasChanged, hasChangedList);
    });

    const examTypeOnlineSelect = this.modalBody.querySelector(
      "[data-contract-order-student-exam-type-online-select]"
    );

    if(this.state.orderInfo.canOrderOnlineAfterLock)
      {this.state.orderInfo.examTypeId = 1}

    examTypeOnlineSelect.selectedIndex = this.state.orderInfo.examTypeId 
          ? 1 
          : 0;

    examTypeOnlineSelect.addEventListener("change", () => {
      const selectedOption = $_.getSelectedOption(examTypeOnlineSelect);

      this.state.orderInfo.examTypeId =
        selectedOption.value === "0" ? false : true;
      //psy check for diff
      let hasChangedList = checkIfParticipantsChange();
      let hasChanged = checkIfOrderInfoChanged();

      toggleAcceptButtonStatus(hasChanged, hasChangedList);
    });

    const studentListSelectAllButton = this.modalBody.querySelector(
      "#handle_student_list_selectAll"
    );

    studentListSelectAllButton.addEventListener("click", () => {
      let isActive = studentListSelectAllButton.dataset.isActiveCheckbox;
      if (isActive === "true") {
        this.state.participants.forEach((p) => {
          if (!p.disabled) p.isPresent = false;
        });
        studentListNods.forEach((studentNode) => {
          studentNode.checked = false;
        });
        studentListSelectAllButton.dataset.isActiveCheckbox = "false";
      } else {
        {
          this.state.participants.forEach((p) => {
            p.isPresent = true;
          });
          studentListNods.forEach((studentNode) => {
            studentNode.checked = true;
          });
          studentListSelectAllButton.dataset.isActiveCheckbox = "true";
        }
      }
      this.updateParticipants();
      let hasChangedList = checkIfParticipantsChange();
      let hasChanged = checkIfOrderInfoChanged();

      toggleAcceptButtonStatus(hasChanged, hasChangedList);
    });

    // get all check-unckeck classbase buttons
    const studentListSelectAllButtonClassBase = this.modalBody.querySelectorAll(
      "[data-student-list-data-class-number-checkall]"
    );

    // check/unckeck classes based on classbase buttons
    studentListSelectAllButtonClassBase.forEach((checkButton) => {
      checkButton.addEventListener("click", () => {
        const classesToCheck = checkButton.getAttribute(
          "data-student-list-data-class-number-checkall"
        );

        const classList = this.state.participants.filter(
          (el) => el.classNo == classesToCheck
        );

        const classPresents = classList.filter((el) => el.isPresent === true);

        let studentsToCheck = this.modalBody.querySelectorAll(
          "[data-student-list-class-number='" + classesToCheck + "']"
        );

        let mustScrolltoThis = studentsToCheck[studentsToCheck.length - 1];

        const observer = new window.IntersectionObserver(([entry]) => {
          entry.isIntersecting ? scrollAndCheck(0) : scrollAndCheck(300);
          observer.unobserve(mustScrolltoThis);
          return;
        });

        observer.observe(mustScrolltoThis);

        if (classPresents.length < classList.length) {
          classList.forEach((p) => {
            p.isPresent = true;
          });
        } else {
          classList.forEach((p) => {
            if (!p.disabled) p.isPresent = false;
          });
        }

        let scrollAndCheck = (delayTime) => {
          mustScrolltoThis.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          studentListNods.forEach((studentNode) => {
            if (
              studentNode.getAttribute("data-student-list-class-number") ==
              classesToCheck
            ) {
              setTimeout(function () {
                classPresents.length < classList.length
                  ? (studentNode.checked = true)
                  : (studentNode.checked = false);
              }, delayTime);
              studentNode.closest("li").classList.add("toggle-check-now");
              setTimeout(function () {
                studentNode.closest("li").classList.remove("toggle-check-now");
              }, 2000);
            }
          });
        };

        this.updateParticipants();

        let hasChangedList = checkIfParticipantsChange();
        let hasChanged = checkIfOrderInfoChanged();

        toggleAcceptButtonStatus(hasChanged, hasChangedList);
      });
    });

    // Open quiz schedule modal
    const gotoQuizScheduleModalButton = this.modalBody.querySelector(
      "[data-contract-order-quiz-schedule-button]"
    );

    gotoQuizScheduleModalButton.addEventListener("click", async () => {
      const gradeFieldId =
        gotoQuizScheduleModalButton.dataset.contractOrderQuizScheduleButton;
      this.examScheduleModal.render(gradeFieldId);
      this.examScheduleModal.modal.show();
    });

    // handle go to registration student list
    const gotoRegistrationStudentList = this.modalBody.querySelector(
      "[data-contract-order-student-list-edit]"
    );

    gotoRegistrationStudentList.addEventListener("click", () => {
      const gradeFieldId =
        gotoRegistrationStudentList.dataset.contractOrderStudentListEdit;
      this.handleGotoStudentList(gradeFieldId, this.modal);
    });

    acceptQuizChangeButton.addEventListener("click", async () => {
      loadingCover.classList.add('show-loader');
      const { examId, typeId, ...json } = { ...this.state };
      // console.log(json);

      const res = await axios.post(`/api/School/PlaceAnOrder`, json);
      if (res.data === 1 || res.data === -2) {
        loadingCover.classList.remove('show-loader');
        this.modal.hide();
        if (res.data === 1) logify({}, "تغییرات با موفقیت اعمال گردید.");
        if (res.data === -2)
          logify(
            { status: "success" },
            "تغييرات با موفقيت اعمال گرديد و مابه‌التفاوت به كيف پول واريز شد."
          );
        this.handleStudentListPresencyAcceptChange(examId, json);
        this.handleReRenderRegistration();
        if (_that.referPaymentModalRef) _that.referPaymentModalRef.render(true);
      } else if (res.data === -1) {
        logify({ status: "warning" }, "تغييري صورت نگرفته است.");
      } else if (res.data === -2) {
        logify(
          { status: "success" },
          "تغييرات با موفقيت اعمال گرديد و مابه‌التفاوت به كيف پول واريز شد."
        );
      } else {
        logify({ status: "warning" }, "اشکالی در ثبت تغییرات به وجود آمده");
      }
    });

    const cancelQuizOrderButton = this.modalBody.querySelector("#cancel_order");
    cancelQuizOrderButton.addEventListener("click", async () => {
      // console.log(this.state.participants);
      loadingCover.classList.add('show-loader');

      const presentStudentsCount = this.state.participants.filter(
        (el) => el.isPresent === true
      ).length;

      if (
        presentStudentsCount == 0 &&
        this.state.orderInfo.participantsCount == 0
      ) {
        logify({ status: "warning" }, "سفارشي جهت حذف وجود ندارد.");
      } else {
        const updatedList = [
          ...this.state.participants.map((p) => {
            if (p.disabled === false) p.isPresent = false;
            return p;
          }),
        ];

        this.state.participants = updatedList;
        const { examId, ...json } = { ...this.state };

        // console.log(json);
        const res = await axios.post(`/api/School/PlaceAnOrder`, json);

        const hasLockedStudent = this.state.participants.filter(
          (el) => el.disabled === true
        ).length;

        let hasLockedStudentText = "";
        let orderDeleted = "سفارش حذف شد.";

        if (res.data === 1 || res.data === -2) {
          this.modal.hide();
          loadingCover.classList.remove('show-loader');

          if (hasLockedStudent > 0) {
            hasLockedStudentText =
              " (دانش‌آموزاني كه پرداخت كرده‌اند قابل حذف نمي‌باشند.)";
            if (presentStudentsCount == hasLockedStudent) {
              orderDeleted = "";
              hasLockedStudentText =
                "دانش‌آموزاني كه پرداخت كرده‌اند قابل حذف نمي‌باشند.";
            }
          }
          if (res.data === 1) logify({}, orderDeleted + hasLockedStudentText);
          if (res.data === -2)
            logify(
              { status: "success" },
              "سفارش حذف شد و مبلغ آن به كيف پول واريز گرديد." +
                hasLockedStudentText
            );
          this.handleStudentListPresencyAcceptChange(examId, json, true);
        } else {
          logify({ status: "warning" }, "اشکالی در ثبت تغییرات به وجود آمده");
        }
      }
    });
  }
};
export default QuizInfoModal;
