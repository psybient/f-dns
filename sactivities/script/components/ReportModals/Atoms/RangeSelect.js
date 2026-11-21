export default (props) => {
    //console.log(props);
    const { id, items, title, handler } = props;
    const SelectItem = (value, isActive = false) => {
        let li = document.createElement("LI");
        li.setAttribute("data-value", value)
        if (isActive)
            li.classList.add("uk-active");
        li.innerHTML = `<a>${value}</a>`
        return li;
    }


    const selectItems = items.map(
        item => SelectItem(item, items[0] === item ? true : false)
    )

    const selectElements = selectItems.map((li, i, arr) => {
        li.onclick = function (e) {
            let value = _.toNumber(li.getAttribute("data-value"))
            arr.forEach(element => {
                element.classList.remove("uk-active")
            });
            li.classList.add("uk-active")
            //console.log(value)
            handler(value)
        }
        return li
    })
    return {
        body: `<label class="label-title">${title}</label>
            <div class="number-selector">
                <ul id="rangeSelect_${id}"
                class="uk-subnav uk-subnav-pill" uk-switcher>
                </ul>
            </div>`,
        id: `rangeSelect_${id}`,
        childElements: selectElements
    }
}