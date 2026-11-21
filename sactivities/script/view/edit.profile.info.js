import axios from "axios";
import { $_ } from "../../../common/utils/create.dom";
import { logify } from "../../../common/utils/ukHelper";
import UIkit from "uikit";
import { generate } from "../../../common/app/captcha.generator";
import { appEnv } from "../../../common/global.env";
import { validateInput } from "../../../common/app/validation";

const EditProfile = class {
  constructor(props) {
    this.modal = props.modal;
    this.inputs = {
      edit_schoolname: "",
      edit_firstname: "",
      edit_lastname: "",
      edit_phone: "",
      edit_cellphone: "",
      edit_email: "",
      edit_state: "0",
      edit_city: "0",
      edit_zipcode: "",
      edit_address: "",
      edit_section: "0",
      edit_type: "0",
      edit_gender: "0",
      edit_manager_gender: "0",
      edit_user_name: "",
      // agent fields (NEW)
      edit_agent_gender: "0",
      edit_agent_firstname: "",
      edit_agent_lastname: "",
      edit_agent_cellphone: "",
      edit_agent_email: "",
      // edit_prev_pass: "",
      edit_new_pass: "",
      edit_confirm_new_pass: "",
    };
    this.inputsRef = {};
    this.state = {
      isCaptchaValid: false,
      isFormvalid: false,
      sectionCode: 0,
      captchaText: "",
      adminCellPhone: 0,
      isWithUserPassChange: false,
      adminUserName: "",
    };
    this.data = {
      states: [],
    };
    this.dom = {
      modal: null,
      stateSelectInput: null,
      citySelectInput: null,
      capthaLine: null,
      schoolForm: null,
      managerForm: null,
      captcha_code_input: null,
      send_captcha_code_to_validate: null,
      submitButton: null,
      sms_verification_input: null,
      verificationCodeSection: null,
      refreshCaptchaButton: null,
      with_user_pass_change_toggler: null,
      capthaLine: null,
      inputs: {
        edit_schoolname: null,
        edit_firstname: null,
        edit_lastname: null,
        edit_phone: null,
        edit_cellphone: null,
        edit_email: null,
        edit_state: null,
        edit_city: null,
        edit_zipcode: null,
        edit_address: null,
        edit_section: null,
        edit_type: null,
        edit_gender: null,
        edit_manager_gender: null,
        edit_user_name: null,
        // agent fields (NEW)
        edit_agent_gender: null,
        edit_agent_firstname: null,
        edit_agent_lastname: null,
        edit_agent_cellphone: null,
        edit_agent_email: null,
        // edit_prev_pass: null,
        edit_new_pass: null,
        edit_confirm_new_pass: null,
      },
    };
    this.promiseReady = this.init();
  }

  ready() {
    return this.promiseReady;
  }

  async init() {
    var timerCountDown = null;
    let countDownSection = document.getElementById("time");
    this.dom.captcha_code_input = document.getElementById("captcha_code_input");
    this.dom.submitButton = document.getElementById("submit_profile_edit");
    this.dom.stateSelectInput = document.getElementById("edit_state");
    this.dom.citySelectInput = document.getElementById("edit_city");
    this.dom.capthaLine = document.getElementById("captcha_line");
    this.dom.schoolForm = document.getElementById("school_profile_form");
    this.dom.managerForm = document.getElementById("manager_profile_form");
    this.dom.passwordForm = document.getElementById("password_form");
    this.dom.smsNumberMessage = document.getElementById("sms_number_message");

    this.dom.with_user_pass_change_toggler = document.getElementById(
      "with_user_pass_change_toggler"
    );

    this.dom.send_captcha_code_to_validate = document.getElementById(
      "send_captcha_code_to_validate"
    );
    this.dom.sms_verification_input = document.getElementById(
      "sms_verification_input"
    );
    this.dom.verificationCodeSection = document.getElementById(
      "verificationCodeSection"
    );

    this.dom.inputs = {
      edit_schoolname: document.getElementById("edit_schoolname"),
      edit_firstname: document.getElementById("edit_firstname"),
      edit_lastname: document.getElementById("edit_lastname"),
      edit_phone: document.getElementById("edit_phone"),
      edit_cellphone: document.getElementById("edit_cellphone"),
      edit_email: document.getElementById("edit_email"),
      edit_zipcode: document.getElementById("edit_zipcode"),
      edit_address: document.getElementById("edit_address"),
      edit_section: document.getElementById("edit_section"),
      edit_type: document.getElementById("edit_type"),
      edit_gender: document.getElementById("edit_gender"),
      edit_manager_gender: document.getElementById("edit_manager_gender"),
      edit_user_name: document.getElementById("edit_user_name"),
      // agent inputs (NEW)
      edit_agent_gender: document.getElementById("edit_agent_gender"),
      edit_agent_firstname: document.getElementById("edit_agent_firstname"),
      edit_agent_lastname: document.getElementById("edit_agent_lastname"),
      edit_agent_cellphone: document.getElementById("edit_agent_cellphone"),
      edit_agent_email: document.getElementById("edit_agent_email"),
      // edit_prev_pass: document.getElementById("edit_prev_pass"),
      edit_new_pass: document.getElementById("edit_new_pass"),
      edit_confirm_new_pass: document.getElementById("edit_confirm_new_pass"),
    };

    this.dom.modal = document.getElementById("profile");

    const smsApiInitialUrl =
      appEnv.url.indexOf("?") > -1
        ? "../api/Account/SendCaptchaValidationSMS"
        : "/api/Account/SendCaptchaValidationSMS";
    const callSmsApi = (sms, code, fake) => {
      return new Promise((resolve) => {
        if (fake) {
          return resolve("22222");
        }
        axios(
          `${smsApiInitialUrl}?cellphonenumber=${sms}&captchaCode=${code}&isRegistration=true`
        )
          .then((response) => {
            // console.log(response);
            return response.data;
          })
          .then((result) => resolve(result))
          .catch((err) => console.log(err));
      });
    };

    const getCaptchaFromServer = async function () {
      const { data } = await axios.get("/api/Account/GetRandomSMSNumber");
      // console.log(data);
      return data;
    };

    const Timer = function (p1, p2) {
      var dt = new Date();
      var countDownDate = dt.setMinutes(dt.getMinutes() + p1);
      countDownDate = dt.setSeconds(dt.getSeconds() + p2);
      timerCountDown = setInterval(function () {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = (
          "00" + Math.floor((distance % (1000 * 60)) / 1000)
        ).slice(-2);
        if (minutes < 2) {
          countDownSection.innerHTML = minutes + ":" + seconds;
        }
        if (distance < 0) {
          initSuccessfulSmsLogin(-2);
        }
      }, 100);
    };

    const initSuccessfulSmsLogin = (code) => {
      if (code === 1) {
        // $(this.dom.sms_verification_input).show("slow");
        $(this.dom.send_captcha_code_to_validate).hide("fast");
        this.dom.submitButton.removeAttribute("disabled");
        $(this.dom.verificationCodeSection).slideDown("slow");
        this.dom.verificationCodeSection.removeAttribute("hidden");
        this.dom.sms_verification_input.focus();
        this.dom.capthaLine.classList.add("disabled-captha");
        this.dom.schoolForm.classList.add("disabled-form");
        this.dom.managerForm.classList.add("disabled-form");
        this.dom.passwordForm.classList.add("disabled-form");
        countDownSection.removeAttribute("hidden");
        //verificationCodeInput.focus();
        // errorMassages.innerHTML = "";
      } else {
        this.dom.refreshCaptchaButton.dispatchEvent(new Event("click"));
        // $(this.dom.sms_verification_input).hide("slow");
        this.dom.sms_verification_input.value = "";
        this.dom.captcha_code_input.value = "";
        setTimeout(() => this.dom.captcha_code_input.focus(), 101);
        $(this.dom.send_captcha_code_to_validate).show("fast");
        this.dom.submitButton.setAttribute("disabled", "disabled");
        $(this.dom.verificationCodeSection).hide("slow");
        this.dom.verificationCodeSection.setAttribute("hidden", "");
        this.dom.capthaLine.classList.remove("disabled-captha");
        this.dom.schoolForm.classList.remove("disabled-form");
        this.dom.managerForm.classList.remove("disabled-form");
        this.dom.passwordForm.classList.remove("disabled-form");
        countDownSection.setAttribute("hidden", "");
        countDownSection.innerHTML = "2:00";
        clearInterval(timerCountDown);
      }
    };

    const stateList = await axios.get(`/api/School/GetStates`);
    this.data.states = stateList.data;
    this.dom.stateSelectInput.innerHTML += this.data.states
      .map((st) => {
        return `<option value="${st.geographicalId}"
      ${
        st.geographicalId === this.inputs.edit_state
          ? `selected="selected"`
          : ""
      }>${st.options_name}</option>`;
      })
      .join("");

    document
      .getElementById("freelancer_profile_manager_link")
      .addEventListener("click", async () => {
        const profileInfo = await axios.get(`/api/School/GetSchoolProfile`);
        // console.log(profileInfo.data);
        this.state.adminCellPhone = profileInfo.data.u1x_Cell;
        this.dom.smsNumberMessage.innerHTML =
          "پيامك به شماره " + profileInfo.data.u1x_Cell + " ارسال خواهد شد.";
        this.state.adminUserName = profileInfo.data.u1x_UserName;
        this.setProfileData(profileInfo.data);
        this.setInputValues();

        let index = 0;
        let len = this.data.states.length;
        for (let i = 0; i < len; i++) {
          if (this.data.states[i].geographicalId === this.inputs.edit_state) {
            index = i;
            break;
          }
        }
        this.dom.stateSelectInput.selectedIndex = index + 1;
        //render cities
        if (this.inputs.edit_state !== "0") {
          const cityList = await axios.get(
            `/api/School/GetCities?geographicalId=${this.inputs.edit_state}`
          );

          this.dom.citySelectInput.innerHTML = cityList.data
            .map((city) => {
              return `<option value="${city.geographicalId}"  ${
                this.inputs.edit_city === city.geographicalId
                  ? `selected="selected"`
                  : ""
              }>${city.options_name}</option>`;
            })
            .join("");
        }
      });

    this.dom.stateSelectInput.addEventListener("change", async (e) => {
      const selected = $_.getSelectedOption(this.dom.stateSelectInput);
      if (selected.value !== "0") {
        const cityList = await axios.get(
          `/api/School/GetCities?geographicalId=${selected.value}`
        );
        // console.log(this.inputs);
        $_.removeElementChildNodes(this.dom.citySelectInput);
        this.dom.citySelectInput.innerHTML = cityList.data
          .map((city, i) => {
            return `<option value="${city.geographicalId}" ${
              this.inputs.edit_city === city.geographicalId
                ? `selected="selected"`
                : ""
            }>${city.options_name}</option>`;
          })
          .join("");
      }
    });

    this.dom.with_user_pass_change_toggler.addEventListener("click", (e) => {
      this.state.isWithUserPassChange = e.target.checked;
      // console.log(this.state);
    });

    //generate captcha
    let ctx = document.getElementById("myCanvas").getContext("2d");
    let captchaText = await getCaptchaFromServer();
    this.state.captchaText = captchaText;
    let paintedCaptcha = generate(ctx, captchaText);
    //refresh capcha
    this.dom.refreshCaptchaButton = document.getElementById(
      "captcha_code_refresh_button"
    );

    this.dom.refreshCaptchaButton.addEventListener("click", async () => {
      let captchaText = await getCaptchaFromServer();
      let paintedCaptcha = generate(ctx, captchaText.toLowerCase());
      this.state.captchaText = paintedCaptcha;
    });

    this.dom.send_captcha_code_to_validate.addEventListener(
      "click",
      async () => {
        const that = this;
        const isCellPhoneProvided = validateInput(
          this.dom.inputs.edit_cellphone
        );
        // console.log(isCellPhoneProvided);
        // debugger
        if (isCellPhoneProvided.length > 0) {
          logify({ status: "warning" }, isCellPhoneProvided);
          return;
        }

        // const tail = this.dom.inputs.edit_cellphone.value.slice(1);
        const tail = this.state.adminCellPhone.slice(1);
        let fullPhoneNumber = "%2B98" + tail;
        // console.log(fullPhoneNumber);

        const values = this.getInputValues();
        const errors = this.validateFields();
        if (Object.keys(errors).length !== 0) {
          logify({ status: "warning" }, errors[Object.keys(errors)[0]]);
          return;
        }

        let captchaVal = this.dom.captcha_code_input.value;
        if (captchaVal == "") {
          logify(
            { status: "warning" },
            "کد کپچا جهت صحت سنجی و دریافت کد تایید را وارد فرمایید"
          );
          return;
        } else if (captchaVal !== this.state.captchaText) {
          logify({ status: "warning" }, "کد کپچا اشتباه است");
          return;
        }

        this.dom.send_captcha_code_to_validate.setAttribute("disable", "true");
        this.dom.send_captcha_code_to_validate.innerHTML += `<div id="fetchSpinner" uk-spinner></div>`;
        callSmsApi(fullPhoneNumber, captchaVal)
          .then((result) => {
            // console.log(result);
            $_.removeElements("fetchSpinner");
            if (result === -2) {
              logify({ status: "danger" }, "عدم تطابق کد کپچای وارد شده");
            } else if (result === 0 || result === -1 || result === -3) {
              console.log("faild");
              that.state.isCaptchaValid = false;
            } else {
              initSuccessfulSmsLogin(result);
              that.state.isCaptchaValid = true;
              // this.dom.sms_verification_input.removeAttribute("hidden");
              Timer(2, 0);

              // setTimeout(() => initSuccessfulSmsLogin(-2), 2000 * 60);
            }
          })
          .catch((err) => console.log(err));
      }
    );

    this.dom.submitButton.addEventListener("click", async (e) => {
      if (this.state.isCaptchaValid === false) {
        logify({ status: "danger" }, "مراحل صحت سنجی انجام نشده");
        return;
      }

      let verificationCode = this.dom.sms_verification_input.value;

      if (verificationCode.length === 0) {
        logify({ status: "danger" }, "کد پیامک شده را وارد نمایید");
        return;
      } else if (verificationCode.length < 5) {
        logify({ status: "danger" }, "کد پیامک شده را به درستی وارد نمایید");
        return;
      }

      const fields = this.transformFieldsForAPI();

      const profileUpdateResult = await axios
        .post(
          `/api/School/UpdateSchoolProfile?jsonPhrase='${JSON.stringify(
            fields
          )}'&smsCode=${verificationCode}`
        )
        .catch((err) => console.log(err));
      var isWarning = false;
      var message = "";
      if (profileUpdateResult) {
        // console.log(profileUpdateResult);
        if (profileUpdateResult.status === 200) {
          if (profileUpdateResult.data === "-2") {
            isWarning = true;
            message = "عدم تطابق کد تایید با عدد وارد شده";
          } else if (profileUpdateResult.data === 1) {
            isWarning = false;
            message = "تغییرات با موفقیت ثبت گردید";
          } else {
            message = "اشکال در ثبت اطلاعات";
            isWarning = true;
          }
        }
      } else {
        message =
          "اشکالی در آپدیت اطلاعات به وجود آمده، لطفا مجددا تلاش فرمایید.";
        isWarning = true;
      }
      logify(isWarning ? { status: "warning" } : {}, message);
      if (isWarning === false) {
        initSuccessfulSmsLogin(-2);
        UIkit.modal(this.dom.modal).hide();
      } //else {
      //   // this.dom.refreshCaptchaButton.dispatchEvent(new Event("click"));
      //   // initSuccessfulSmsLogin(-2);
      // }
    });
    return this;
  }

  setProfileData(info) {
    const {
      m3x_address,
      m3x_tel,
      m3x_zip,
      school_city,
      school_name,
      school_state,
      school_training,
      school_gender,
      section_code,
      u1x_Cell,
      u1x_Email,
      u1x_Famili,
      u1x_Name,
      u1x_Gender,
      u1x_UserName,
      // agent fields (NEW)
      u2x_Name,
      u2x_Famili,
      u2x_Cell,
      u2x_Email,
      u2x_Gender,
    } = info;
    // console.log(u1x_UserName);
    this.inputs.edit_schoolname = school_name;
    this.inputs.edit_firstname = u1x_Name;
    this.inputs.edit_lastname = u1x_Famili;
    this.inputs.edit_phone = m3x_tel;
    this.inputs.edit_cellphone = u1x_Cell;
    this.inputs.edit_email = u1x_Email;
    // this.inputs.c = username;
    this.inputs.edit_state = school_state;
    this.inputs.edit_city = school_city;
    this.inputs.edit_zipcode = m3x_zip;
    this.inputs.edit_address = m3x_address;
    this.inputs.edit_section = section_code;
    this.inputs.edit_type = _.toString(school_training);
    this.inputs.edit_gender = school_gender;
    this.inputs.edit_manager_gender = u1x_Gender;
    this.inputs.edit_user_name = u1x_UserName;

    // agent -> populate inputs (NEW)
    this.inputs.edit_agent_firstname = u2x_Name || "";
    this.inputs.edit_agent_lastname = u2x_Famili || "";
    this.inputs.edit_agent_cellphone = u2x_Cell || "";
    this.inputs.edit_agent_email = u2x_Email || "";
    this.inputs.edit_agent_gender = u2x_Gender || "0";

    delete this.inputsRef;
    this.inputsRef = { ...this.inputs };
    // console.log(this.inputsRef);
  }

  getInputValues() {
    for (const key in this.dom.inputs) {
      if (Object.hasOwnProperty.call(this.dom.inputs, key)) {
        const element = this.dom.inputs[key];
        this.inputs[key] = element.value;
      }
    }
    const selectedState = $_.getSelectedOption(this.dom.stateSelectInput);
    const selectedCity = $_.getSelectedOption(this.dom.citySelectInput);
    const selectedSection = $_.getSelectedOption(this.dom.inputs.edit_section);
    const selectedType = $_.getSelectedOption(this.dom.inputs.edit_type);
    const selectedGender = $_.getSelectedOption(this.dom.inputs.edit_gender);
    const selectManagerGender = $_.getSelectedOption(
      this.dom.inputs.edit_manager_gender
    );

    const selectAgentGender = $_.getSelectedOption(
      this.dom.inputs.edit_agent_gender
    );

    this.inputs.edit_state = selectedState ? selectedState.value : 0;
    this.inputs.edit_city = selectedCity ? selectedCity.value : 0;
    this.inputs.edit_section = selectedSection ? selectedSection.value : 0;
    this.inputs.edit_type = selectedType ? selectedType.value : 0;
    this.inputs.edit_gender = selectedGender ? selectedGender.value : 0;
    this.inputs.edit_manager_gender = selectManagerGender
      ? selectManagerGender.value
      : 0;
    this.inputs.edit_agent_gender = selectAgentGender
      ? selectAgentGender.value
      : 0;

    return this.inputs;
  }

  setInputValues() {
    function setSelected(select, val) {
      // console.log({ select, val });
      // if (select.id == "edit_manager_gender") debugger;
      for (var i = 0, j = select.options.length; i < j; ++i) {
        if (select.options[i].value == val) {
          select.selectedIndex = i;
          break;
        }
      }
    }

    for (const key in this.inputs) {
      if (Object.hasOwnProperty.call(this.inputs, key)) {
        const value = this.inputs[key];
        const element = this.dom.inputs[key];
        if (element) {
          if (element.tagName === "SELECT") {
            // if (element.id !== "edit_state" && element.id !== "edit_city") {
            setSelected(element, _.toString(value));
            element.setAttribute("value", value);
            // }
          } else if (element.tagName === "INPUT") {
            element.value = _.toString(value);
          }
        }
      }
    }
  }

  validateFields() {
    const errors = {};
    const emmitFields = [];
    if (this.state.isWithUserPassChange === false) {
      emmitFields.push("edit_user_name");
      emmitFields.push("edit_new_pass");
      emmitFields.push("edit_confirm_new_pass");
    }

    var hasChange = false;
    for (const key in this.inputs) {
      if (emmitFields.includes(key) !== true) {
        if (this.inputs[key] != this.inputsRef[key]) hasChange = true;
      }
    }

    if (hasChange === false) {
      errors.formNotChaneged = "تغییری در فرم ایجاد نشده‌است.";
      return errors;
    }
    const skipFields = [
      "edit_email",
      "edit_agent_gender",
      "edit_agent_firstname",
      "edit_agent_lastname",
      "edit_agent_cellphone",
      "edit_agent_email",
    ];
    // emmitFields.push("edit_email");
    emmitFields.push("edit_state");
    emmitFields.push("edit_city");
    emmitFields.push("edit_section");
    emmitFields.push("edit_type");
    emmitFields.push("edit_gender");
    emmitFields.push("edit_manager_gender");
    emmitFields.push("edit_agent_gender"); // agent gender is a select; ensure it is emitted

    // Check if any field is empty
    for (const key in this.inputs) {
      // console.log(this.inputs[key]);
      // console.log({ key, status: skipFields.includes(key) });
      if (
        !this.inputs[key] &&
        emmitFields.includes(key) != true &&
        skipFields.includes(key) != true
      ) {
        // console.log(key);
        errors[key] = "تمامی فیلدها می‌بايست تکمیل گردند.";
      }
    }

    const zipCodePattern = /^\d{10}$/;
    if (!zipCodePattern.test(this.inputs.edit_zipcode)) {
      errors.edit_zipcode = "كد پستي را به صورت صحيح وارد نماييد.";
    }

    const selectedState = $_.getSelectedOption(this.dom.stateSelectInput);
    if (selectedState) {
      if (selectedState.value === "0" || selectedState.value === 0) {
        errors.edit_state = "استان خود را انتخاب كنيد.";
      }
    } else errors.edit_state = "استان خود را انتخاب كنيد.";

    const selectedCity = $_.getSelectedOption(this.dom.citySelectInput);
    if (selectedCity) {
      if (selectedCity.value === "0" || selectedCity.value === 0) {
        errors.edit_city = "شهر خود را انتخاب كنيد.";
      }
    } else errors.edit_city = "شهر خود را انتخاب كنيد.";
    // const selectedSection = $_.getSelectedOption(this.dom.edit_section);
    // if (selectedSection) {
    //   if (selectedSection.value === "0" || selectedSection.value === 0) {
    //     errors.edit_section = "دوره تحصیلی را انتخاب كنيد.";
    //   }
    // } else errors.edit_state = "دوره تحصیلی را انتخاب كنيد.";

    const selectedType = $_.getSelectedOption(this.dom.inputs.edit_type);
    if (selectedType) {
      if (selectedType.value === "0" || selectedType.value === 0) {
        errors.edit_type = "نوع مدرسه را انتخاب كنيد.";
      }
    } else errors.edit_type = "نوع مدرسه را انتخاب كنيد.";

    const selectedGender = $_.getSelectedOption(this.dom.inputs.edit_gender);
    if (selectedGender) {
      if (selectedGender.value === "0" || selectedGender.value === 0) {
        errors.edit_gender = "جنسیت دانش آموزان مدرسه را انتخاب كنيد.";
      }
    } else errors.edit_gender = "جنسیت دانش آموزان مدرسه را انتخاب كنيد.";

    const selectedManagerGender = $_.getSelectedOption(
      this.dom.inputs.edit_manager_gender
    );
    if (selectedManagerGender) {
      if (
        selectedManagerGender.value === "0" ||
        selectedManagerGender.value === 0
      ) {
        errors.edit_manager_gender = "جنسیت مدیر مدرسه را انتخاب كنيد.";
      }
    } else errors.edit_manager_gender = "جنسیت مدیر مدرسه را انتخاب كنيد.";

    // agent gender validation (NEW) - optional, but if you want to require agent gender uncomment
    const selectedAgentGender = $_.getSelectedOption(
      this.dom.inputs.edit_agent_gender
    );
    if (selectedAgentGender) {
      if (
        selectedAgentGender.value === "0" ||
        selectedAgentGender.value === 0
      ) {
        // If you want to force agent gender to be set, uncomment the line below:
        // errors.edit_agent_gender = "جنسیت نماینده مدرسه را انتخاب کنید.";
      }
    } // else errors.edit_agent_gender = "جنسیت نماینده مدرسه را انتخاب کنید.";

    if (this.state.isWithUserPassChange) {
      if (this.inputs.edit_new_pass !== this.inputs.edit_confirm_new_pass) {
        errors.edit_confirm_new_pass =
          "تأیید رمز عبور با رمز عبور وارد شده مطابق ندارد.";
      } else {
        if (this.inputs.edit_new_pass.length < 5)
          errors.edit_new_pass = "حداقل کاراکتر مجاز برای رمز پنج رقم می باشد";
      }
    }
    return errors;
  }

  transformFieldsForAPI() {
    const serverFields = {
      u1x_UserName: this.state.adminUserName,
      u1x_PassWord: this.inputs.edit_new_pass,
    };

    const transformedInputs = {
      school_name: this.inputs.edit_schoolname,
      u1x_Name: this.inputs.edit_firstname,
      u1x_Famili: this.inputs.edit_lastname,
      m3x_tel: this.inputs.edit_phone,
      u1x_Cell: this.inputs.edit_cellphone,
      u1x_Email: this.inputs.edit_email,
      school_state: _.toNumber(this.inputs.edit_state),
      school_city: _.toNumber(this.inputs.edit_city),
      m3x_zip: this.inputs.edit_zipcode,
      m3x_address: this.inputs.edit_address,
      // section_code: _.toNumber(this.inputs.edit_section),
      school_training: _.toNumber(this.inputs.edit_type),
      school_gender: _.toNumber(this.inputs.edit_gender),
      u1x_Gender: _.toNumber(this.inputs.edit_manager_gender),
      // agent fields (NEW)
      u2x_Name: this.inputs.edit_agent_firstname,
      u2x_Famili: this.inputs.edit_agent_lastname,
      u2x_Cell: this.inputs.edit_agent_cellphone,
      u2x_Email: this.inputs.edit_agent_email,
      u2x_Gender: _.toNumber(this.inputs.edit_agent_gender),
    };
    if (this.state.isWithUserPassChange)
      return { ...serverFields, ...transformedInputs };
    // console.log(transformedInputs);
    return transformedInputs;
  }

  render() {}
};

export default EditProfile;
