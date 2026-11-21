export default (props, gradeNo, checked = false) => {
  //console.log(props);
  //     const { classNo, itemId, caption, studentCount }
  //         = props;
  return `
     <div  class="uk-width-1-1 uk-inline class-list-padding">
        <label class="switch">
             <input type="checkbox" data-class-no="${props.classNo}" ${
    checked ? "checked" : ""
  }>
             <span class="slider round"></span>
        </label>                                        
        <span class="class-list-text">كلاس ${props.classNo} (${
    props.studentCount
  } نفر)</span>
        <button data-class-no ="${props.classNo}" data-grade-no="${gradeNo}" 
        class="[ js-download-button__class-list ] uk-text-success uk-position-center-left" uk-icon="icon:excel-file; ratio:1.2"></span>
     </div>`;
  // Should return selct component
};
