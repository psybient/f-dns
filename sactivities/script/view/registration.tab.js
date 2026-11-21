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
import { $_ } from "../../../common/utils/create.dom";

const RegistrationManager = class {
  constructor(props) {
    this.quizMakerRef = null;
    this.gradesData = null;
    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    const initialFetchForRegistration = () =>
      new Promise(function (resolve, reject) {
        resolve(axios("/api/School/InitializeStudentList"));
      });
    await initialFetchForRegistration();
    const { data } = await axios("/api/School/LoadSchoolRelatedGradeField");
    // console.log(data);
    delete this.gradesData;
    this.gradesData = data;

    await this.createGradeSwitches(data);
    await this.loadFreelanceTeacherLogo();
    this.bindFileUploader();
    this.bindLogoFileUploader();

    document.addEventListener(
      "registrationGradeChanged",
      this.registrationGradeChangeHandler
    );

    document
      .querySelector("#lock_and_save_button")
      .addEventListener("click", this.registrationLockHandler);
    document
      .querySelector("#register_save_button")
      .addEventListener("click", (e) =>
        this.registrationSaveHandler(this.quizMakerRef, this.gradesData, e)
      );
    document.addEventListener(
      "registrationDetailSectionShouldUpdate",
      updateDetailRegistrationHandler
    );

    await updateDetailRegistrationHandler();
    return this;
  }

  setQuizMakerInstance(ref) {
    this.quizMakerRef = ref;
  }

  async reRender() {
    const { data } = await axios("/api/School/LoadSchoolRelatedGradeField");
    if (data) {
      ls.clearKeys(ls.prefix());
      // console.log("registration data", data);
      delete this.gradesData;
      this.gradesData = data;
      await this.createGradeSwitches();
    }
  }

  async createGradeSwitches() {
    // console.log(grades);
    // ls.clear();
    if (localStorage[ls.prefix()]) ls.clearKeys(ls.prefix());

    // to reset from class manager
    const container = document.getElementById("registration_table_conteiner");
    $_.removeElementChildNodes(container);
    container.innerHTML = `<table id="registration_table"></table>`;

    var switcher = document.getElementById("registration_grade_switcher");
    $_.removeElementChildNodes(switcher);
    var swithcers = [];
    var first;
    // registration_table is our root element, altough we will replace it with our first tables in data
    var table = document.querySelector("#registration_table");
    let parent = table.parentElement;
    ls.set(`${ls.prefix()}grades`, this.gradesData); // put grades in local storage to use maxClassNumber Inside jsTable
    parent.removeChild(table);
    var tbl = document.createElement("TABLE");

    let emptyRegistrationHandler = document.getElementById(
      "student_registration_container"
    );
    let emptyRegistrationText = document.getElementById(
      "student_registration_empty_text"
    );
    if (this.gradesData.length === 0) {
      emptyRegistrationText.removeAttribute("hidden");
      emptyRegistrationHandler.style.display = "none";
      return;
    } else {
      emptyRegistrationText.setAttribute("hidden", "true");
      emptyRegistrationHandler.style.display = "flex";
    }
    tbl.setAttribute("id", ls.prefix() + this.gradesData[0].gradeFieldId);
    table = null;
    table = parent.appendChild(tbl);

    function _createSwitches(json, grade) {
      let tblId = ls.prefix() + grade.gradeFieldId;
      var forEachTbl = document.querySelector("#" + tblId);
      if (!forEachTbl) {
        parent = table.parentElement;
        parent.removeChild(table);
        let tbl = document.createElement("TABLE");
        // console.log(grade);
        tbl.setAttribute("id", ls.prefix() + grade.gradeFieldId);
        table = null;
        table = parent.appendChild(tbl);
      }
      // console.log(json);
      JsTable.initialize(table, json);

      JsTable.generateTable();

      let li = document.createElement("LI");
      li.setAttribute(
        "class",
        "exam-tab-margin js-switcher-li js-grade-switch"
      );
      li.setAttribute("js-gradeid", grade.gradeFieldId);
      li.setAttribute("data-unique-teacher-class-id", grade.gradeFieldId);
      let link = document.createElement("A");
      link.setAttribute("href", "#");
      link.setAttribute("js-gradeid", grade.gradeFieldId);
      link.setAttribute("id", "switch_" + grade.gradeFieldId);
      link.setAttribute("uk-tooltip", "title:" + grade.caption + "; pos: left");
      let text = document.createTextNode(grade.caption);
      link.appendChild(text);
      first = li.appendChild(link).cloneNode(true);

      switcher.appendChild(li);
      swithcers.push(link.cloneNode(true));

      link.addEventListener("click", (e) => {
        // debugger;
        // console.log(e.target.id);
        // console.log(last(e.target.id.split("_")));
        var gradeId = last(e.target.id.split("_"));
        // console.log(gradeId);
        setState({ ...getState(), gradeId: gradeId });
        ls.set(ls.prefix(), getState());
        // console.log(getState());
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
        .then(async function (json) {
          // console.log(json);
          const j = await json;
          // console.log(j);
          const ret = () => _createSwitches(j, grades[ccount]);
          let switches = ret();
          // console.log(switches);
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
            // console.log(grades[0].gradeFieldId);
            setTimeout(() => {
              // debugger;
              switcher.dispatchEvent(evt);
            }, 1500);
            // debugger;
            ToggleRegistrationLoader(false);
          }
        })
        .catch(function (err) {
          console.log(`Error: ${err}`);
        });
    };

    return getGradeCollection([...this.gradesData]);
  }

  registrationGradeChangeHandler(e) {
    let grade = JsTable.getGrade(e.detail.gradeId);
    const uploaderLockStatus = grade.isLock === 0 ? false : true;
    //console.log({ grade, uploaderLockStatus })
    // debugger;
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

  bindFileUploader() {
    let bar = document.querySelector("#js_reg_progressbar");
    UIkit.upload(".js-registration-upload", {
      url: "/api/School/UploadStudentExcelFile",
      "data-type": "json",
      name: "json",
      multiple: false,
      beforeSend: function (environment) {
        ToggleRegistrationLoader(true);
        environment.headers["gradeFieldId"] = getState().gradeId;
        // environment.headers["gradeFieldId"] = getState().gradeId;
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

  async loadFreelanceTeacherLogo() {
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
        .querySelector("#logoImgArrow").remove();
        // .setAttribute("style", "display:none");
      document
        .querySelector("#logoinput")
        .setAttribute("style", "display:none");
    }
  }

  // bindLogoFileUploader() {
  //   UIkit.upload(".js-upload", {
  //     url: "/api/School/UploadLogo",
  //     multiple: true,
  //     beforeSend: function (environment) {
  //       environment.responseType = "blob";

  //       const fi = document.querySelector("#logoinput");
  //       if (fi.files.length > 0) {
  //         const fsize = fi.files.item(0).size;
  //         const file = Math.round(fsize / 1024);
  //         if (file >= 3072) {
  //           UIkit.modal.alert("حجم فایل باید کمتر از سه مگابایت باشد!");
  //           environment.target.abort();
  //           // return false;
  //         }
  //       }
  //     },
  //     beforeAll: function (arg) {
  //       LogoUploadPreparing(false);
  //     },
  //     load: function () {},
  //     abort: function (e) {
  //       LogoUploadPreparing(false);
  //     },
  //     error: function (e) {
  //       LogoUploadPreparing(false);
  //       if (e.message != "Cannot read property 'abort' of undefined")
  //         UIkit.modal.alert("خطا در تصویر ارسالی !");
  //     },
  //     complete: function () {},
  //     loadStart: function (e) {},
  //     progress: function (e) {
  //       LogoUploadPreparing(true);
  //     },
  //     loadEnd: function (e) {},
  //     completeAll: function (HttpRequest) {
  //       LogoUploadPreparing(false);
  //       const logoImg = window.URL.createObjectURL(
  //         new Blob([HttpRequest.response])
  //       );
  //       document.querySelector("#logoImg").src = logoImg;
  //     },
  //   });
  // }

bindLogoFileUploader() {
    const input = document.querySelector("#logoinput");
    const modal = document.querySelector("#logoCropModal");
    const image = document.querySelector("#logoCropImage");
    const area = document.querySelector("#logoCropArea");
    const zoom = document.querySelector("#logoCropZoom");

    this.logoFile = null;

    let imageScale = 1;
    let baseScale = 1;
    let imageX = 0;
    let imageY = 0;
    let startX = 0;
    let startY = 0;
    let dragging = false;

    const renderImage = () => {
        image.style.transform =
            `translate(${imageX}px, ${imageY}px) scale(${imageScale})`;
    };

    input.addEventListener("change", (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            UIkit.modal.alert("فرمت تصویر باید JPG یا PNG باشد!");
            input.value = "";
            return;
        }

        this.logoFile = file;

        const reader = new FileReader();

        reader.onload = (event) => {
            image.onload = () => {
              modal.classList.add("active");

              requestAnimationFrame(() => {
                  const areaSize = area.clientWidth;
                  const circleSize = areaSize * 0.8;

                  baseScale = circleSize / Math.max(image.naturalWidth, image.naturalHeight);
                  imageScale = baseScale;

                  imageX = (areaSize - image.naturalWidth * imageScale) / 2;
                  imageY = (areaSize - image.naturalHeight * imageScale) / 2;

                  image.style.width = `${image.naturalWidth}px`;
                  image.style.height = `${image.naturalHeight}px`;

                  zoom.value = 100;
                  renderImage();
              });
          };  

            image.src = event.target.result;
        };

        reader.readAsDataURL(file);
    });

    zoom.addEventListener("input", () => {
        const newScale = Number(zoom.value) / 100;
        const newImageScale = baseScale * newScale;

        const centerX = area.clientWidth / 2;
        const centerY = area.clientHeight / 2;

        const ratio = newImageScale / imageScale;

        imageX = centerX - (centerX - imageX) * ratio;
        imageY = centerY - (centerY - imageY) * ratio;

        imageScale = newImageScale;

        renderImage();
    });

    area.addEventListener("pointerdown", (e) => {
        dragging = true;
        startX = e.clientX - imageX;
        startY = e.clientY - imageY;
        area.setPointerCapture(e.pointerId);
    });

    area.addEventListener("pointermove", (e) => {
        if (!dragging) return;

        imageX = e.clientX - startX;
        imageY = e.clientY - startY;

        renderImage();
    });

    area.addEventListener("pointerup", () => {
        dragging = false;
    });

    area.addEventListener("pointercancel", () => {
        dragging = false;
    });

    document.querySelector("#logoCropConfirm").addEventListener("click", () => {
        const canvas = document.createElement("canvas");
        const outputSize = 500;

        canvas.width = outputSize;
        canvas.height = outputSize;

        const ctx = canvas.getContext("2d");

        const areaSize = area.clientWidth;
        const circleSize = areaSize * 0.8;
        const circleOffset = areaSize * 0.1;

        const scaleRatio = outputSize / circleSize;

        ctx.clearRect(0, 0, outputSize, outputSize);

        ctx.save();

        ctx.beginPath();
        ctx.arc(
            outputSize / 2,
            outputSize / 2,
            outputSize / 2,
            0,
            Math.PI * 2
        );
        ctx.clip();

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, outputSize, outputSize);

        ctx.scale(scaleRatio, scaleRatio);

        ctx.drawImage(
            image,
            imageX - circleOffset,
            imageY - circleOffset,
            image.naturalWidth * imageScale,
            image.naturalHeight * imageScale
        );

        ctx.restore();

        canvas.toBlob((blob) => {
            if (!blob) {
                UIkit.modal.alert("خطا در آماده‌سازی تصویر!");
                return;
            }

            this.croppedLogoFile = new File(
                [blob],
                "school-logo.png",
                { type: "image/png" }
            );

            const formData = new FormData();
            formData.append("logo", this.croppedLogoFile);

            const xhr = new XMLHttpRequest();

            xhr.open("POST", "/api/School/UploadLogo", true);
            xhr.responseType = "blob";

            xhr.upload.onprogress = () => {
                LogoUploadPreparing(true);
            };

            xhr.onload = () => {
                LogoUploadPreparing(false);

                if (xhr.status >= 200 && xhr.status < 300) {
                    const uploadedBlob = xhr.response && xhr.response.size
                        ? xhr.response
                        : blob;

                    document.querySelector("#logoImg").src =
                        URL.createObjectURL(uploadedBlob);

                    modal.classList.remove("active");
                    input.value = "";
                    this.logoFile = null;
                    this.croppedLogoFile = null;
                } else {
                    UIkit.modal.alert("خطا در بارگذاری لوگوی مدرسه!");
                }
            };

            xhr.onerror = () => {
                LogoUploadPreparing(false);
                UIkit.modal.alert("خطا در ارتباط با سرور!");
            };

            LogoUploadPreparing(true);
            xhr.send(formData);

        }, "image/png");
    });


    const closeModal = () => {
        modal.classList.remove("active");
        input.value = "";
    };

    document.querySelector("#logoCropClose").addEventListener("click", closeModal);
    document.querySelector("#logoCropCancel").addEventListener("click", closeModal);
}

  registrationSaveHandler(ref, gradeData, e) {
    // console.log(e);
    var section = document.querySelector("#student_registration_section");
    // console.log(ls.prefix());
    // let lsRef = ls.get(localStorage, ls.prefix());
    // console.log(lsRef);
    // console.log(getState());
    // let grade_id = e.detail.gradeId; //lsRef ? lsRef.gradeId : getState().gradeId;
    // console.log(grade_id);
    let grade_id = ls.get(localStorage, ls.prefix()).gradeId;

    const diff = JsTable.diff(grade_id);
    // console.log(diff);
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
          // console.log(result);
          if (result == 1) {
            // console.log(getState().gradeId);
            axios(
              `/api/School/LoadStudentListToFilling?gradeFieldId=${
                getState().gradeId
              }`
            )
              .then((response) => response.data)
              .then((json) => {
                // console.log({ json });
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
                // console.log(gradeData);
                const classData = gradeData.filter(
                  (d) => d.gradeFieldId === _.toNumber(grade_id)
                )[0];
                // console.log(classData);
                ref.resetGradeClassess(classData.gradeFieldId);
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

  registrationLockHandler(e) {
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
            `/api/School/LockStudentList?gradeFieldId=${
              getState().gradeId
            }&lockParam=1`
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

  localLoad = () =>
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
};

export default RegistrationManager;
