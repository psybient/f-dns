import { JsTable } from "../components/jsTable";
import { forEach, last, startsWith, includes, toNumber } from "lodash";
import { ls } from "../utils/localStorage.util";
import * as UIkit from "uikit";
import * as axios from "axios";
import { updateDetailRegistrationHandler } from "../sactivities";
import {
  ToggleRegistrationLoader,
  LogoUploadPreparing,
  activateButton,
  getSaveButton,
  updateFooter,
  activateFileUploader,
} from "../view/registration.view";
import { getState, setState } from "../utils/state.util";
import { LoadApiBlobData, LoadApiData } from "../../../common/callApi";
//export const activateXlsFileUploader = () => activateFileUploader();
export async function createGradeSwitches(grades) {
  var switcher = document.getElementById("registration_grade_switcher");
  var swithcers = [];
  var first;
  // registration_table is our root element, altough we will replace it with our first tables in data
  var table = document.querySelector("#registration_table");
  let parent = table.parentElement;
  ls.set(`${ls.prefix()}grades`, grades); // put grades in local storage to use maxClassNumber Inside jsTable

  parent.removeChild(table);
  var tbl = document.createElement("TABLE");
  if (grades.length === 0) return;
  tbl.setAttribute("id", ls.prefix() + grades[0].gradeFieldId);
  table = null;
  table = parent.appendChild(tbl);

  function _createSwitches(json, grade) {
    let tblId = ls.prefix() + grade.gradeFieldId;
    var forEachTbl = document.querySelector("#" + tblId);
    if (!forEachTbl) {
      parent = table.parentElement;
      parent.removeChild(table);
      let tbl = document.createElement("TABLE");
      //   console.log(grade);
      tbl.setAttribute("id", ls.prefix() + grade.gradeFieldId);
      table = null;
      table = parent.appendChild(tbl);
    }
    //console.log(json)
    JsTable.initialize(table, json);
    JsTable.generateTable();

    let li = document.createElement("LI");
    li.setAttribute("class", "exam-tab-margin js-switcher-li js-grade-switch");
    li.setAttribute("js-gradeid", grade.gradeFieldId);
    let link = document.createElement("A");
    link.setAttribute("class", "uk-text-center uk-text-primary");
    link.setAttribute("href", "#");
    link.setAttribute("js-gradeid", grade.gradeFieldId);
    link.setAttribute("id", "switch_" + grade.gradeFieldId);
    let text = document.createTextNode(grade.caption);
    link.appendChild(text);
    first = li.appendChild(link).cloneNode(true);

    switcher.appendChild(li);
    swithcers.push(link.cloneNode(true));

    link.addEventListener("click", (e) => {
      var gradeId = last(e.target.id.split("_"));
      setState({ ...getState(), gradeId: gradeId });
      ls.set(ls.prefix(), getState());
      var event = new CustomEvent("registrationGradeChanged", {
        bubbles: true,
        detail: {
          gradeId: gradeId,
        },
      });
      switcher.dispatchEvent(event);
    });

    return link;
  }
  // New approach to create data collections sequential
  //   const getGradeCollection = async (grades) => {
  //       const {data } = await axios(
  //         `/api/School/LoadStudentListToFilling?gradeFieldId=${grades[ccount].gradeFieldId}`
  //       );
  //       console.log(data);
  //   }
  //   const ret = () => _createSwitches(data, grades[ccount]);
  //   grades.forEach(grade=>{
  //   });
  var ccount = 0;
  const getGradeCollection = async (grades) => {
    axios(
      `/api/School/LoadStudentListToFilling?gradeFieldId=${grades[ccount].gradeFieldId}`
    )
      .then(function (response) {
        return response.data;
      })
      .then(function (json) {
        const ret = () => _createSwitches(json, grades[ccount]);
        let switches = ret();
        // console.log({ json });
        let switcher = document.getElementById("registration_grade_switcher");
        ccount++;
        if (ccount < grades.length) getGradeCollection(grades);
        if (ccount == grades.length) {
          var evt = new CustomEvent("registrationGradeChanged", {
            bubbles: true,
            detail: {
              gradeId: grades[0].gradeFieldId,
            },
          });

          switcher.dispatchEvent(evt);
          ToggleRegistrationLoader(false);
        }
      })
      .catch(function (err) {
        console.log(`Error: ${err}`);
      });
  };

  return getGradeCollection(grades);
}

export function registrationGradeChangeHandler(e) {
  let grade = JsTable.getGrade(e.detail.gradeId);
  const uploaderLockStatus = grade.isLock === 0 ? false : true;
  //console.log({ grade, uploaderLockStatus })
  activateFileUploader(uploaderLockStatus);

  ToggleRegistrationLoader(true);

  JsTable.refresh(e.detail.gradeId);
  setState({ ...getState(), gradeId: e.detail.gradeId });
  ls.set(ls.prefix(), getState());
  ToggleRegistrationLoader(false);
  updateFooter(e.detail.gradeId);
  if (JsTable.diff(e.detail.gradeId).length)
    activateButton(getSaveButton(), true);
  else activateButton(getSaveButton(), false);
}

export function bindFileUploader() {
  let bar = document.querySelector("#js_reg_progressbar");
  UIkit.upload(".js-registration-upload", {
    url: "/api/School/UploadStudentExcelFile",
    "data-type": "json",
    name: "json",
    multiple: false,
    beforeSend: function (environment) {
      ToggleRegistrationLoader(true);
      environment.headers["gradeFieldId"] = getState().gradeId;
    },
    error: function () {
      UIkit.modal.alert("خطا در فایل ارسالی");
    },
    complete: function () {
      //console.log('complete', arguments);
    },
    loadStart: function (e) {
      bar.removeAttribute("hidden");
      bar.max = e.total;
      bar.value = e.loaded;
    },
    progress: function (e) {
      bar.max = e.total;
      bar.value = e.loaded;
    },
    loadEnd: function (e) {
      bar.max = e.total;
      bar.value = e.loaded;
    },
    completeAll: function (HttpRequest) {
      ToggleRegistrationLoader(false);
      activateButton(getSaveButton());
      if (includes(JSON.stringify(HttpRequest.response), "##")) {
        let massage = JSON.stringify(HttpRequest.response).trim();
        let trimed = massage
          .replace("##|", "")
          .replace("\\", "")
          .replace('""', "");
        let substring = trimed.substr(0, trimed.length - 3);

        UIkit.modal.alert(substring);
      } else
        try {
          JsTable.refresh(getState().gradeId, HttpRequest.response);
        } catch (err) {
          console.log(err);
        } //

      setTimeout(function () {
        if (JsTable.diff(getState().gradeId).length)
          activateButton(getSaveButton(), true);
        else activateButton(getSaveButton(), false);

        bar.setAttribute("hidden", "hidden");
      }, 1000);
    },
  });
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

export async function loadSchoolLogo() {
  var bodyFormData = new FormData();
  let logo = await LoadApiBlobData("/api/School/GetLogo", bodyFormData);
  if (logo.size < 10) {
    return;
  } else {
    const logoImg = window.URL.createObjectURL(new Blob([logo]));
    document.querySelector("#logoImg").src = logoImg;
  }

  let idEdited = await LoadApiData(
    "/api/School/IsSchoolLogoEdited",
    bodyFormData
  );
  if (idEdited) {
    document
      .querySelector("#logoImgArrow")
      .setAttribute("style", "display:none");
    document.querySelector("#logoinput").setAttribute("style", "display:none");
  }
}
export function bindLogoFileUploader() {
  UIkit.upload(".js-upload", {
    url: "/api/School/UploadLogo",
    multiple: true,
    beforeSend: function (environment) {
      environment.responseType = "blob";

      const fi = document.querySelector("#logoinput");
      if (fi.files.length > 0) {
        const fsize = fi.files.item(0).size;
        const file = Math.round(fsize / 1024);
        if (file >= 3072) {
          UIkit.modal.alert("حجم فایل باید کمتر از سه مگابایت باشد!");
          environment.target.abort();
          // return false;
        }
      }
    },
    beforeAll: function (arg) {
      LogoUploadPreparing(false);
    },
    load: function () {},
    abort: function (e) {
      LogoUploadPreparing(false);
    },
    error: function (e) {
      LogoUploadPreparing(false);
      if (e.message != "Cannot read property 'abort' of undefined")
        UIkit.modal.alert("خطا در تصویر ارسالی !");
    },
    complete: function () {},
    loadStart: function (e) {},
    progress: function (e) {
      LogoUploadPreparing(true);
    },
    loadEnd: function (e) {},
    completeAll: function (HttpRequest) {
      LogoUploadPreparing(false);
      const logoImg = window.URL.createObjectURL(
        new Blob([HttpRequest.response])
      );
      document.querySelector("#logoImg").src = logoImg;
    },
  });
}

export function registrationSaveHandler(e) {
  var section = document.querySelector("#student_registration_section");

  let grade_id = ls.get(localStorage, ls.prefix()).gradeId;
  const diff = JsTable.diff(grade_id);

  const save = () => {
    ToggleRegistrationLoader(true);

    axios({
      method: "post",
      url: "/api/School/SaveStudentList",
      data: diff, //JsTable.diff(grade_id),
      config: { headers: { "Content-Type": "multipart/form-data" } },
    })
      .then(async (response) => {
        var response = response;
        let result = response.data;
        if (result == 1) {
          axios(
            `/api/School/LoadStudentListToFilling?gradeFieldId=${
              getState().gradeId
            }`
          )
            .then((response) => response.data)
            .then((json) => {
              //console.log({ json })
              JsTable.refresh(grade_id, json);
              ls.set(ls.prefix() + "init_" + grade_id, json); // Replace with new list, in order to get diff on new list
              var event = new CustomEvent(
                "RegistrationDetailSectionShouldUpdate",
                {
                  bubbles: true,
                  detail: {
                    gradeId: grade_id,
                  },
                }
              );
              section.dispatchEvent(event);
              ToggleRegistrationLoader(false);
              activateButton(getSaveButton(), false);
            })
            .catch((err) => console.log(err));
        } else {
          UIkit.modal.alert("خطا در ثبت");
        }
      })
      .catch(function (response) {
        console.log(response.message);
      });
  };

  var mustBeReplace = false;
  diff.every((row) => {
    if (row.nationalCode && row.nationalCode !== "0000000000") {
      mustBeReplace = true;
      return true;
    }
  });

  if (mustBeReplace) {
    UIkit.modal
      .confirm(
        ` آیا نام کاربری و رمز عبور دانش‌آموزان با کد ملی جایگزین شود؟ (بعد از جایگزینی می‌توانید نام کاربری و وضعیت را در آخر هر ردیف ملاحظه نمایید.) `,
        {
          labels: {
            cancel: "خیر",
            ok: "بلی",
          },
        }
      )
      .then(
        function () {
          diff[0].mustBeReplaced = true;
          save();
        },
        function () {
          save();
        }
      );
  } else save();
}

export function registrationLockHandler(e) {
  var section = document.querySelector("#student_registration_section");
  ToggleRegistrationLoader(true);
  let grade_id = ls.get(localStorage, ls.prefix()).gradeId;
  let id = ls.prefix() + grade_id;
  var db = ls.get(localStorage, id);
  var lockSuccess = false;
  axios({
    method: "post",
    url: "/api/School/SaveStudentList",
    data: db,
    config: { headers: { "Content-Type": "multipart/form-data" } },
  })
    .then((response) => {
      var response = response;
      var result = response.data;

      if (result == 1) {
        axios(
          `/api/School/LockStudentList?gradeFieldId=${getState().gradeId}&7=1`
        )
          .then((response) => response.data)
          .then((userMassage) => {
            if (includes(JSON.stringify(userMassage), "موفقیت")) {
              lockSuccess = true;
            }
            UIkit.modal.alert(userMassage);
          })
          .then(() => {
            updateDetailRegistrationHandler(); //  left panel table showing updated student count for each grade
            var event = new CustomEvent(
              "RegistrationDetailSectionShouldUpdate",
              {
                bubbles: true,
                detail: {
                  gradeId: grade_id,
                  lockStatus: result,
                },
              }
            );
            section.dispatchEvent(event);

            if (lockSuccess) {
              forEach(db, (el, i, arr) => {
                el["lockStatus"] = 1;
              });
              JsTable.refresh(grade_id, db);
              ls.set(
                ls.prefix() + "init_" + grade_id,
                ls.get(localStorage, ls.prefix() + grade_id)
              ); // To be able to get diff on new list
              activateButton(getSaveButton(), false);
              ToggleRegistrationLoader(false);
              activateFileUploader(false);
              console.log("here");
              lockSuccess = false;
            }
          })
          .catch(function (response) {
            console.log(response.message);
          });
      }
    })
    .then(() => {
      ToggleRegistrationLoader(false);
    })
    .catch((err) => console.log(err));
}

export const localLoad = () =>
  new Promise(function (resolve, reject) {
    UIkit.modal
      .confirm(
        ` در فرم ثبت نام نسخه ای از تغییرات بر
  روی سیستم شما وجود دارد، لطفا در صورتی که اولین بار است این پیام را مشاهده میکنید با گزینه پیش فرض ادامه دهید. `,
        {
          labels: {
            cancel: "استفاده از نسخه شما",
            ok: "دریافت آخرین نسخه از سرور",
          },
        }
      )
      .then(
        function () {
          resolve(true);
        },
        function () {
          resolve(false);
        }
      );
  });
