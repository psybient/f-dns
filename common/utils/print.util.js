
import print from 'print-js';

function printing() {
    //print button using print-js
    var node = document.createElement("BUTTON");                 // Create a <li> node
    node.id = "btnPrintJs";
    node.nodeValue = "print";
    node.textContent = "پرینت";
    node.onclick = () => {
        printJS('report_wrapper', 'html');
    };
    var btn = document.querySelector('#report_wrapper').appendChild(node).cloneNode(true); //     printButton.innerHTML = ` <button type="button" onclick="printJS('printJS-form', 'html')">
}