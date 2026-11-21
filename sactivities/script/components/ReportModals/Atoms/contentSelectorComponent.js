import CheckboxItem from "./CheckboxItem";

export default ({ items, gradeFieldId }) => {
    return ` <label class="label-title">محتوا</label>
    ${items.map(item => CheckboxItem({ ...item, gradeFieldId: gradeFieldId })).join('')}
   `
}

// ` <label class="sharp-switch">
// <input type="checkbox" checked>
// <span class="sharp-slider"></span>
// </label>
// <span class="content-list-text">خودارزیابی</span>
// <label class="sharp-switch">
// <input type="checkbox">
// <span class="sharp-slider"></span>
// </label>
// <span class="content-list-text">آزمون هماهنگ</span>`