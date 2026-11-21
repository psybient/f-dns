export default () => {
  return `
    <tr>
        <th><span>واحد یادگیری</span>
        <button data-sort-property="captionSortOrder"
            data-sort-order="asc"></button>
        </th>
       <!--<th>
         <span> بانک سؤال <span class="new-feature">جديد</span></span>
        </th>-->
        <th>
            <span>تعداد دانش‌آموزان <br>سنجش‌شده</span>
            <button data-sort-property="studentCount"
            data-sort-order="asc"></button>
        </th>
        <th>
            <span>درصد <br>عملكرد</span>
            <button data-sort-property="percent"
            data-sort-order="asc"></button>
        </th>
        <th>عملكرد <br>دانش‌آموزان</th>
        <th>سؤال‌ها و وضعیت <br>پاسخ‌گویی</th>
    </tr>`;
};
