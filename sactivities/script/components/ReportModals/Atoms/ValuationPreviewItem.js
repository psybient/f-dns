export default (props) => {
    //console.log(props);
    if (props) {
        const { gradeFieldId, id, shamsiToDate, quizCaption } = props;
        return `
    <div class="uk-inline">
        <h1>${quizCaption}</h1>
        <p>${shamsiToDate}</p>
        <div class="uk-grid-collapse uk-child-width-1-3 uk-text-center" uk-grid>

            <div><button data-report-type="21" data-exam-id="${id}" 
             class="uk-icon-button uk-light [ js-report-modal__download-button ] " uk-icon="download"></button></div>
            <div><button data-report-type="22" data-exam-id="${id}"
             class="uk-icon-button uk-light [ js-report-modal__download-button ] " uk-icon="download"></button></div>
            <div class="toggle-usage-${id}">
                <div class="uk-icon-button uk-light drop-download" uk-icon="download" uk-toggle="target: .toggle-usage-${id}; animation: uk-animation-fade">
                    
                </div>
            </div>
            
            <div class="toggle-usage-${id}" hidden>
            <button data-report-type="23" data-exam-id="${id}" data-report-format="xls" class="uk-text-success  [ js-report-modal__download-button ] " uk-icon="icon: excel-file; ratio: 1.4" style="background-color: white"></button>
            <button data-report-type="23" data-exam-id="${id}" data-report-format="pdf" class="uk-text-danger  [ js-report-modal__download-button ] " uk-icon="icon: pdf-file; ratio: 1.4" style="background-color: white"></button>
            </div>
            


            <div>برنامه داخلی</div>    
            <div>کارنامه دانش​‌آموز</div>
            <div>گزارش مدرسه</div>             
        </div>
        <button data-exam-id="${id}" data-grade-field-id="${gradeFieldId}" class="[ js-report-modal__close-button ] " uk-close></button>
    </div>`
    } else return `
    <div class="uk-inline">
    <h1>   فاقد برنامه ریزی </h1>
    </div>`
}