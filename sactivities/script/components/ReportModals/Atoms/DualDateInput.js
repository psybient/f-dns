import InputItem from './InputItem';
export default (props) => {
    //console.log(props)
    const { container, inputs } = props;

    if (inputs) {
        const datePickers = inputs.map(input => {
            return InputItem(input)
        })
        container.innerHTML = `<label class="label-title">بازه زمانی</label>`
        datePickers.map(datePicker => {
            container.innerHTML += `<div></div>`
            container.appendChild(datePicker)
            container.innerHTML += `<span class="uk-text-primary" uk-icon="calendar"></span> `
        })
        return datePickers;
    }
}