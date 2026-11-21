export default (props) => {
    let id = props.id || new Date();
    const { caption, checked, gradeFieldId } = props;
    return `
        <label for="${id}_${gradeFieldId}" class="sharp-switch">
            <input id="${id}_${gradeFieldId}" type="checkbox" ${checked ? 'checked' : ''} 
                data-grade-field-id="${gradeFieldId}" 
                data-type="${id}">
            <span class="sharp-slider"></span>
            </label>
            <span class="content-list-text">${caption}</span>
`
}