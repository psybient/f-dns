export default (exam, data) => {
    const getClassSelector = (id => {
        switch (id) {
            case 0:
                return {
                    classSelector: 'not-synced-student',
                    tooltipTitle: 'همگام‌سازی نشده'
                };
            case 1:
                return {
                    classSelector: 'not-started-student',
                    tooltipTitle: 'هنوز شروع نكرده'
                };
            case 2:
                return {
                    classSelector: 'online-student',
                    tooltipTitle: 'در حال برگزاری آزمون'
                };
            case 4:
                return {
                    classSelector: 'finish-student',
                    tooltipTitle: 'اتمام آزمون'
                };
        }
    });


    return data.map(student => {
        const { cellphone,
            classNo,
            finishDate,
            flag,
            linkStatus,
            startDate,
            studentName,
            testPersonId,
        } = student;
        const { classSelector, tooltipTitle } = getClassSelector(flag);
        return ` <tr>
            <td>
                <div class="${classSelector}"
                    uk-tooltip="title: ${tooltipTitle}; pos: left"></div>
            </td>
            <td>${studentName}</td>
            <td>${classNo}</td>
            <td>${startDate}</td>
            <td>${finishDate}</td>
            <td><span class="${linkStatus == 1 ? "uk-text-success" : "uk-text-muted"}" uk-icon="${linkStatus == 1 ? "check" : "close"}"></span></td>
            <td>${cellphone && cellphone.length > 1 ? `<a uk-icon="receiver" href="tel:${cellphone}" uk-tooltip="title: ${cellphone}; pos: right"></a>` : `-`}
            </td>
        </tr>`
    }).join("")
}
