export const validateInput = (input, name, isRequire = false) =>
  (function () {
    let isValid = false;
    let isFilled = true;
    var massage = "";
    var value = "";
    //console.log(name)
    if (input.tagName === "INPUT") value = input.value;
    else if (input.tagName === "SELECT")
      value = input.value == "جناب آقاي / سركار خانم" ? "" : input.value;
    else if (input.tagName === "TEXTAREA") value = input.value;
    if (value === "") {
      input.setAttribute("required", "true");
      isFilled = false;
    } else {
      // Any custom validation exept for checking filled status
      input.removeAttribute("required");
      input.setCustomValidity("");
    }

    const customValidation = input.getAttribute("data-custom-validation");
    // console.log(customValidation);
    switch (customValidation) {
      case "phone":
        if (isFilled === false) {
          massage = "وارد کردن شماره تلفن همراه الزامی می باشد";
          break;
        }
        const isPhoneValid = validatePhoneNumber(input.value);
        if (!isPhoneValid)
          massage = "شماره تلفن همراه با فرمت نامناسب وارد شده است";
        break;
      case "select":
        const isSelectValid =
          input.value && input.value !== "" && input.selectedIndex !== 0; //psynim
        //console.log({ val: input.value, res: isSelectValid })
        if (!isSelectValid) massage = ` برای  ${name} گزینه ای انتخاب نشده است`;
        break;
      case "zip":
        // debugger;
        const postalCodeRegex =
          /^(?!0)\d(?!([0-9])\1{3})[1-9]{3}[1346-9][013-46-9][1-9](?!\1{8})\d$/;
        // debugger;
        const testPostalCode = postalCodeRegex.test(input.value);
        console.log(testPostalCode);
        if (testPostalCode === -1) {
          massage = "کد پستی با فرمت نامناسب وارد شده است";
        }
        break;
      default:
        isValid = true;
    }

    if (!isFilled) {
      if (name && name.trim() !== "توضیحات") {
        massage = `وارد نمودن ${name ? name.trim() : "فیلد"} الزامی می باشد`;
        input.setAttribute("required", "");
        //input.setCustomValidity(massage)
      } else {
        input.removeAttribute("required");
        //input.setCustomValidity("")
      }
    } else {
      input.removeAttribute("required");
    }
    if (!isValid) {
      input.setCustomValidity(massage);
      isValid = false;
    }
    //console.log(massage)
    return massage;
  })();

export const validatePhoneNumber = function (value) {
  value = value
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

  if (value === "") {
    //setValidation(phoneNumberInput, false);
    return false;
  }

  if (value.length !== 11 || value.charAt(0) !== "0") {
    // setValidation(phoneNumberInput, false);
    return false;
  }

  let status = /^\d*$/.test(value) && parseInt(value) <= 9999999999;
  //setValidation(phoneNumberInput, status);
  //console.log("validatePhoneNumber", status)
  return status;
};
