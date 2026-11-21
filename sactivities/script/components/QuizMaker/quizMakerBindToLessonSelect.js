export default (props) => {
  // console.log(props);
  const { gradeFieldId, lesson } = props;
  const units = lesson.studyUnit;
  const gradeLessonDetailId = lesson.gradeLessonDetailId;

  const Option = (
    id,
    caption //, type = 'from') => {
  ) => `<option value="${id}">${caption}</option>`;

  const List = (id, caption, gradeLessonDetailId) => {
    //let len = units.length;
    return `<li><label><input data-value="${id}" class="uk-checkbox lesson-item_checkbox" 
        data-grade-lesson-detail-id="${gradeLessonDetailId}"
        type="checkbox">${caption}</label></li>`;
  };

  return ` 
    <tr>
        <td>
        <label class="switch">
            <input type="checkbox" data-grade-lesson-detail-id="${gradeLessonDetailId}"
            class="grade-switcher_checkbox">
            <span class="slider round"></span>
        </label>                                                
        </td>
        <td>${lesson.caption}</td>
        <td>
            <select id="selectFrom_${gradeFieldId}_${gradeLessonDetailId}" 
            data-select-type="main" data-grade-lesson-detail-id="${gradeLessonDetailId}" class="">
                ${units
                  .map((unit) => Option(unit.id, unit.fullCaption))
                  .join("")}
            </select>
        </td>   
        <td>
            <select id="selectTo_${gradeFieldId}_${gradeLessonDetailId}" 
            data-select-type="dynamic" data-grade-lesson-detail-id="${gradeLessonDetailId}" class="">
                ${units
                  .map((unit) => Option(unit.id, unit.fullCaption))
                  .join("")}
            </select>
        </td>
        <td>
            <button id="filter_${gradeFieldId}_${gradeLessonDetailId}" class="filter" uk-icon="filter"></button>
            <div class="drop-area uk-card uk-card-default" uk-drop="mode: click; pos: right-center">
                <button class="uk-drop-close uk-position-top-right" type="button" uk-close></button>
                <p>${lesson.caption}</p>

                <div class="uk-panel">
                    <ul class="uk-list uk-text-right lessonLists" id="listFrom_${gradeFieldId}_${gradeLessonDetailId}">
                        ${units
                          .map((unit) =>
                            List(unit.id, unit.fullCaption, gradeLessonDetailId)
                          )
                          .join("")}
                    </ul>
                </div>                
            </div>
        </td>
    </tr>`;
};
