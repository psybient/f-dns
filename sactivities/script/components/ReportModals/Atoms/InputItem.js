
import { v4 as uuidv4 } from 'uuid';
export default (props) => {
    const { id, type, className, defaultValue,
        handler, attributes } = props
    const input = document.createElement('input');
    input.type = type ? type : "text";
    input.id = id ? id : uuidv4();
    input.value = defaultValue ? defaultValue : '';
    input.className = className ? className : "input-text";
    if (attributes) {
        Object.keys(attributes).map(attr => {
            input.setAttribute(attr, attributes[attr])
        })
    }

    if (handler) {
        if (type === "text") {
            input.addEventListener("input", (e) => {
                e.stopImmediatePropagation();
                //console.log(e)
                handler(e)
            })
        }
        if (type === "button")
            input.onclick = (e) => handler(e)
    }
    return input;

}