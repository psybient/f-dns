import { escapeForHTML } from "../utils/security.util";
import "../utils/localStorage.util";
import { ls } from "../utils/localStorage.util";
import { isString, last, includes, forEach, toNumber } from "lodash";
import { makeRangeIterator } from "../utils/generator.util";
import { activateButton, getSaveButton } from "../view/registration.view";
import { getState } from "../utils/state.util";
export const JsTable = (function () {
  let table = null;
  let data = [];
  let tabIndex = 0;
  let maxClassNum = 0;
  let dt = new Map();
  var setting = {
    emit: [
      "centerId",
      "roleId",
      "gradeFieldId",
      "tempNo",
      "lockStatus",
      "linked",
      "mustBeReplaced",
      "password",
      "replacingMessage",
      "encryptTestPersonId",
      "testPersonId",
      "teacherStudentClassId",
    ],
    columnes: [
      {
        fieldName: "rank",
        title: "ردیف",
        colgroup: "table-col_row-no",
        fieldType: "display",
      },
      {
        fieldName: "name",
        title: "نام",
        colgroup: "table-col_family",
        fieldType: "text",
      },
      {
        fieldName: "family",
        title: "نام خانوادگي",
        colgroup: "table-col_family",
        fieldType: "text",
      },
      {
        fieldName: "father",
        title: "نام پدر",
        colgroup: "table-col_family",
        fieldType: "text",
      },
      {
        fieldName: "class",
        title: "کلاس",
        colgroup: "table-col_family",
        fieldType: "select",
      },
      {
        fieldName: "nationalCode",
        title: "کد ملی",
        colgroup: "table-col_family",
        fieldType: "text",
      },
      {
        fieldName: "userName",
        title: "پيام",
        colgroup: "table-col_family",
        fieldType: "text",
      },
      // {
      //     fieldName: 'password',
      //     title: 'رمز عبور',
      //     colgroup: 'table-col_family',
      //     fieldType: 'text',
      // },

      // {
      //     fieldName: 'replacingMessage',
      //     title: 'پیام',
      //     colgroup: 'table-col_family',
      //     fieldType: 'text',
      // },
    ], //, '', 'password'
  };

  const mutateMaxClassNumber = function (gradeId) {
    let lsGrades = ls.get(localStorage, `${ls.prefix()}grades`);
    let currGrade = toNumber(
      gradeId
        ? gradeId
        : getState().hasOwnProperty("gradeId")
        ? getState().gradeId
        : data[0].gradeFieldId
    );
    let grade = lsGrades.filter((g) => g.gradeFieldId === currGrade)[0];
    // debugger;
    if (grade) maxClassNum = grade.maxClassNum;
    else maxClassNum = lsGrades[0].maxClassNum;
  };

  const initialize = function (tableSelector, arr) {
    table = tableSelector;
    data = arr;
    mutateMaxClassNumber();
  };

  const getGrade = function (gradeId) {
    gradeId = gradeId || _getCurrentGradeId();

    let grades = ls.get(localStorage, `${ls.prefix()}grades`);

    let currGrade = grades.filter((g) => g.gradeFieldId === +gradeId)[0];
    return currGrade;
  };

  function _getCurrentGradeId() {
    let currGradeId = toNumber(getState().gradeId);
    return currGradeId;
  }

  const _generateTableColGroup = function () {
    let colgroup = document.createElement("COLGROUP"); //this.table.createTHead();
    for (let key of Object.keys(data[0])) {
      if (!includes(setting.emit, key)) {
        let col = document.createElement("COL");
        colgroup.appendChild(col);
      }
    }
    table.appendChild(colgroup).cloneNode(true);
  };

  const _generateTableHead = function () {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key in data[0]) {
      if (!includes(setting.emit, key)) {
        let th = document.createElement("th");
        let text = document.createTextNode(
          setting.columnes.filter((n) => n.fieldName == key).map((v) => v.title)
        );

        if (key == "userName") {
          let elem = document.createElement("div");
          elem.innerHTML = `<span uk-icon="icon: link" uk-tooltip="نام کاربری و رمز عبور" style="width:20px"></span>`;
          th.appendChild(elem);
        } else {
          th.appendChild(text);
        }
        row.appendChild(th);
      }
    }
  };

  const generateTable = async function (d, style = true) {
    if (style) _generateTableColGroup();
    var rankCounter = 0;
    const st_db = [];
    if (d) {
      if (isString(d)) d = JSON.parse(d);
    }
    data = d ? d : ls.get(localStorage, table.id) || data;
    var isLock = false;
    for (let element of data) {
      // console.log(element);
      let row = table.insertRow();
      row.setAttribute("js-rank", rankCounter++);
      st_db.push(element);

      var span = null;

      if (element["lockStatus"] === 1) {
        isLock = true;
        row.setAttribute("js-lock-row", "true");
        span = document.createElement("SPAN");
        span.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" data-svg="lock"><rect fill="none" stroke="#000" height="10" width="13" y="8.5" x="3.5"></rect><path fill="none" stroke="#000" d="M6.5,8 L6.5,4.88 C6.5,3.01 8.07,1.5 10,1.5 C11.93,1.5 13.5,3.01 13.5,4.88 L13.5,8"></path></svg>`;
      }
      for (let key in element) {
        // console.log(key);
        if (!includes(setting.emit, key)) {
          var cell = row.insertCell();
          cell.setAttribute("id", "cell_" + tabIndex++);
          cell.setAttribute("tabIndex", tabIndex);
          if (tabIndex % 7 > 1) {
            if (tabIndex % 7 !== 5) {
              cell.setAttribute("contenteditable", "true");
            }
          }
          var innerContent = "";
          const field = [...setting.columnes].filter((v) => {
            return v.fieldName == key; //? setting.columnes.filter(v => v.fieldName == key)[0].fieldType : 'none';
          });
          
          const fieldType = field[0].fieldType;

          if (fieldType === "select") {
            // let selected = setting.columnes.filter(v => v.fieldName == key)
            //   ? setting.columnes.filter(v => v.fieldName == key)[0].class
            //   : 'none';
            let it = makeRangeIterator(1, maxClassNum + 1, 1);
            // console.log(element[key].class)
            // innerContent += `<option value="${element[key]}">${element[key]}</option>`;
            let result = it.next();
            while (!result.done) {
              // if (result.value !== element[key])
              innerContent += `<option value="${result.value}" ${
                result.value !== element[key] ? "" : "selected='selected'"
              }>${result.value}</option>`;
              result = it.next();
            }

            let select = document.createElement("SELECT");
            if (isLock) select.setAttribute("disabled", "true");
            select.innerHTML = innerContent;
            cell.appendChild(select);
          } else {
            if (tabIndex % 7 > 0) {
              let text = document.createTextNode(element[key]);
              cell.appendChild(text);
            }
          }



          if (tabIndex % 7 == 0) {
            cell.innerHTML = `
                        
                        <div class="uk-inline uk-width-1-1">
                            <div class="${
                              element["replacingMessage"] ==
                              "کد ملی جایگزین نام کاربری و رمز عبور شد"
                                ? "uk-text-success"
                                : "uk-text-danger"
                            }">
                                <a class="${
                                  element["replacingMessage"] == ""
                                    ? "uk-text-secondary"
                                    : ""
                                }" href="#" uk-icon="info"></a>
                                <div uk-drop="mode: click; pos: right-center; boundary: !#reg_tbl_${element["gradeFieldId"]}">
                                    <div class="user-pass-info uk-box-shadow-small">
                                        <p><span>نام كاربري: </span>${
                                          element["userName"]
                                        }</p>
                                        <p><span>رمز عبور: </span>${
                                          element["password"]
                                        }</p>
                                        <p class="${
                                          element["replacingMessage"] ==
                                          "کد ملی جایگزین نام کاربری و رمز عبور شد"
                                            ? ""
                                            : "uk-text-danger"
                                        }">${element["replacingMessage"]}</p>
                                        <p class="entrance">
                                          <a  href="https://students.meraat.ir/account/login?StudentAuth=${
                                            element["encryptTestPersonId"]
                                          }" target="_blank">ورود به کارپوشه دانش‌آموز</a>
                                       </p>
                                       
                                    </div>
                                </div>
                            </div>
                        </div>

                        `;
            // let username = document.createTextNode(element["userName"]);
            // let pass = document.createTextNode(element["password"]);
            // let log = document.createTextNode(element["replacingMessage"]);
            // let breakline = document.createElement('br');
            // cell.appendChild(breakline);
            // cell.appendChild(username);
            // cell.appendChild(breakline);
            // cell.appendChild(pass);
            // cell.appendChild(breakline);
            // cell.appendChild(log);
          }

          if (fieldType === "display" || isLock) {
            cell.setAttribute("js-display-only", "true");
            cell.setAttribute("contenteditable", "false");
          }

          if (tabIndex % 7 == 6 || tabIndex % 7 == 5) {
            cell.setAttribute("js-display-only", "false");
            cell.setAttribute("contenteditable", "true");
            if (tabIndex % 7 == 5) {
              cell.firstChild.removeAttribute("disabled");
            }
          }          

          dt.set(cell, {
            parent: row,
            text: element[key] || "",
            id: tabIndex,
            title: key,
          });
        }
      } //end inner for

      if (span) {
        row.appendChild(span);
        span = null;
      }
      isLock = false;
    } // end outer for

    ls.set(table.id, st_db);
    if (
      !ls.get(localStorage, ls.prefix() + "init_" + last(table.id.split("_")))
    )
      ls.set(ls.prefix() + "init_" + last(table.id.split("_")), st_db);
    _generateTableHead();
    // table.addEventListener('click', e => clickProxy(e));
    table.addEventListener("input", (e) => editProxy(e));
    table.addEventListener("change", (event) => {
      var target = event.target;
      var selectedValue = event.target.value;
      if (
        target &&
        target.tagName &&
        target.tagName.toLowerCase() == "select"
      ) {
        let targetCell = dt.get(target.parentElement);
        let d = ls.get(localStorage, table.id);
        let rowOrder = targetCell.parent.getAttribute("js-rank");
        d[rowOrder][targetCell.title] = escapeForHTML(selectedValue);
        ls.set(table.id, d);
        activateButton(getSaveButton(), true);
      }
    });
  };

  // const clickProxy = function(e) {
  //     var target = e.target;
  //     if (target && target.tagName && target.tagName.toLowerCase() == 'td') {
  //         if (!target.querySelector('select') && !target.getAttribute("js-display-only")) {
  //             //make cell editable
  //             target.setAttribute('contenteditable', 'true');
  //             //on blur close the editable field and return to normal cell.
  //             target.onblur = function() {
  //                 this.setAttribute('contenteditable', 'false');
  //             };
  //         }
  //     }
  // };

  const editProxy = function (e) {
    var event = new CustomEvent("registrationModelChanged", {
      bubbles: true,
      detail: {
        _originalEvent: e,
        _table: table,
      },
    });

    table.dispatchEvent(event);
    var target = e.target;
    if (target && target.tagName && target.tagName.toLowerCase() == "td") {
      //#register_save_button
      activateButton(getSaveButton(), true);

      let targetCell = dt.get(target);
      targetCell.text = escapeForHTML(e.target.innerText);
      let d = ls.get(localStorage, table.id);
      let rowOrder = targetCell.parent.getAttribute("js-rank");
      d[rowOrder][targetCell.title] = escapeForHTML(e.target.innerText);
      ls.set(table.id, d);
    }
  };

  const refresh = (tbl_id, data) => {
    tabIndex = 0;
    //if it never initialized before
    let tmpid = table.id; //table ? table.id : ls.prefix() + tbl_id;
    mutateMaxClassNumber(tbl_id);

    let parent = document.getElementById(tmpid).parentElement;
    parent.removeChild(table);
    let tbl = document.createElement("TABLE");
    //tbl.id = tbl_id;
    tbl.setAttribute("id", ls.prefix() + tbl_id);
    dt.clear();
    table = null;
    table = parent.appendChild(tbl);

    if (data) generateTable(data);
    else generateTable();

    return true;
  };

  function diffe(a, b) {
    var difArr = [];
    forEach(a, (ael) => {
      let mirror = b.filter((bel) => bel.rank === ael.rank)[0];
      var flag = false;
      forEach(ael, (e, i) => {
        if (mirror[i] !== e) flag = true;
      });
      if (flag) {
        difArr.push(mirror);
        flag = false;
      }
    });
    return difArr;
  }

  const diff = function (id) {
    let dif = diffe(
      ls.get(localStorage, ls.prefix() + "init_" + id),
      ls.get(localStorage, ls.prefix() + id)
    );
    //console.log(dif)
    return dif;
  };

  function diffe(a, b) {
    //console.log(a, b)
    var difArr = [];
    forEach(a, (ael) => {
      let mirror = b.filter((bel) => bel.rank === ael.rank)[0];
      var flag = false;
      //console.log(mirror)
      forEach(ael, (e, i) => {
        //console.log(mirror[i])
        if (mirror[i] !== e) flag = true;
      });
      if (flag) {
        difArr.push(mirror);
        flag = false;
      }
    });
    return difArr;
  }

  return {
    initialize,
    generateTable,
    refresh,
    getGrade,
    diff,
  };
})();
