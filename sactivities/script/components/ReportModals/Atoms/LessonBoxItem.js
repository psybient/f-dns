export default (props) => {
  //console.log(props);
  const { id, items, title, handler } = props;
  const SelectItem = (item, isActive = false) => {
    const { caption, value } = item;
    let li = document.createElement("LI");
    li.setAttribute("data-value", value);
    if (isActive) {
      li.setAttribute("style", "background-color:#2196f3;");
      handler(value);
    }
    li.innerHTML = `<a>${caption}</a>`;
    return li;
  };

  const selectItems = items.map((item) =>
    SelectItem(item, items[0] === item ? true : false)
  );

  const selectElements = selectItems.map((li, i, arr) => {
    li.onclick = function (e) {
      let value = _.toNumber(li.getAttribute("data-value"));
      selectItems.forEach((item) => item.removeAttribute("style"));
      li.setAttribute("style", "background-color:#2196f3;");
      handler(value);
    };
    return li;
  });
  return {
    body: `<label class="label-title">${title}</label>
            <div class="lesson-selector">
                <ul id="rangeSelect_${id}"
                class="uk-subnav uk-subnav-pill" uk-switcher>
                </ul>
            </div>`,
    id: `rangeSelect_${id}`,
    childElements: selectElements,
  };
};
