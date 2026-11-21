export default function(props) {
    const {
        cellphone,
        centerTeacherId,
        currentWeek,
        fullName,
        karpoosheCount,
        karpoosheLink,
        reportCount,
        l2,
    } = props;
    return `
        <a class="uk-accordion-title uk-inline" href="#">
            <div class="teachers-name">${fullName}</div>
        </a>
        <div class="login-info ${l2.length < 1 ? `no-lesson" uk-tooltip="نخست پايه و درس براي معلم تعريف نماييد."` : `"`}>
            <a class="uk-inline teachers-link js-send-sms_button">
                <span>پیامک لينك كارپوشه</span>
                <div class="dot-pulse uk-hidden"></div>
                <button uk-icon="commenting" class="comment-icon"></button>
            </a>
  

            <a class="uk-inline teachers-link" href="${karpoosheLink}" target="_blank"> 
                <span>ورود</span>
                <span uk-icon="sign-in" class="sign-in"></span>
            </a>
            <button class="teachers-link" uk-icon="copy" uk-tooltip="كپي لينك" data-link-address ="${karpoosheLink}"
                onclick="navigator.clipboard.writeText(this.dataset.linkAddress); this.classList.remove('copy-animation'); void this.offsetWidth; this.classList.add('copy-animation'); setTimeout(() => this.classList.remove('copy-animation'), 500)"></button>   
        </div>

            
            <button id="deleteTeacherRecord_${centerTeacherId}" class="delete-teacher" uk-icon="trash" uk-tooltip="حذف معلم"></button>
            <div class="uk-accordion-content">
                <div class="lesson-input-selects">
                    <select id="baseSelect_${centerTeacherId}" name="baseSelect" 
                    data-select-component="select">
                        <option value="0" disabled selected>پایه</option>
    
                    </select>
                    <select id="lessonSelect_${centerTeacherId}" name="lessonSelect" 
                    data-select-component="select">
                        <option disabled selected>درس</option>
                       
                    </select>
                    <div class="dropdown-miltiple-button-teachers">كلاس‌ها</div>
                    <fieldset id="classSelect_${centerTeacherId}" name="classSelect" 
                        data-select-component="checkbox" class="dropdown-miltiple" 
                    uk-drop="mode: click; offset: 0">
                        <label><input class="uk-checkbox" type="checkbox"> 1</label>
                        <label><input class="uk-checkbox" type="checkbox"> 2</label>
                        <label><input class="uk-checkbox" type="checkbox"> 3</label>
                        <label><input class="uk-checkbox" type="checkbox"> 4</label>
                    </fieldset>
                    <button id="submitTeacherCourse_${centerTeacherId}" uk-icon="icon: plus-circle; ratio: 1.3"></button>

                </div>
                <div class="uk-inline teachers-lessons-classes">
                ${l2 && l2.length > 0 ? l2.map(lesson =>
        `<div>
                        ${lesson.gradeLessonDetailCaption} | ${lesson.gradeFieldCaption} | كلاس‌هاي ${lesson.classList.split(",").join(" - ")} 
                        <button id="deleteLessonButton_${lesson.teacherGradeLessonDetailId}" uk-icon="trash"></button>
                        </div>`).join("") : ""}
                    
                    </div>
                <div class="uk-inline teachers-activity-info">
                    <span>${currentWeek}</span>
                    <span>دفعات ورود به کارپوشه این هفته: <span>${karpoosheCount}</span></span>
                    <span>دفعات ساخت گزارش در کل: <span>${reportCount}</span></span>
                    <span>${cellphone} <span uk-icon="receiver"></span></span>
                </div>
    </div>`
}