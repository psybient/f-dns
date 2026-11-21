export default (gradeFieldId, studyUnit) => {
  if (studyUnit.length === 0) return [];
  const { id, caption, percent, studentCount, duration } = studyUnit;

  return ` 
    <tr>
        <td>${caption}</td>
        <!--<td><button data-tree-id="${id}"
        data-report-type="allQuestions" class="uk-icon-button 
        uk-light uk-icon" uk-icon="download"></button></td>-->
        <td>${studentCount}</td>
        <td>${percent}</td>
        <td><button data-tree-id="${id}"
                    data-report-type="comparative" class="uk-icon-button uk-light uk-icon" uk-icon="download"></button></td>                                
        <td><button data-tree-id="${id}" 
                    data-report-type="question" class="uk-icon-button uk-light uk-icon" uk-icon="download"></button></td>    
    </tr>`;
};
