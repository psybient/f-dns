import { getState } from "../utils/state.util";

export const activateButton = (button, TRUE) =>
  TRUE
    ? button.classList.contains("disable-button")
      ? button.classList.remove("disable-button")
      : ""
    : button.classList.add("disable-button");
export const getSaveButton = () =>
  document.querySelector("#register_save_button");
export const getLockButton = () =>
  document.querySelector("#lock_and_save_button");
export const getSwitch = (id) => document.querySelector(`#switch_${id}`);
export const activateFileUploader = (TRUE = true) => {
  let uploader = document.querySelector(
    'input[type="file"].js-xls-reg_uploader'
  );
  let form = document.querySelector("#xls_file_uploader");
  if (TRUE) {
    uploader.disabled = true;
    form.style.color = "gray";
  } else {
    uploader.disabled = false;
    form.style.color = "#2950a3";
  }
  //uploader.disabled = TRUE>0 ? "disabled" : false; //if none send it's true
  //form.style.color = TRUE ? "gray" : "#2950a3";
  //let uploaderprofile = document.querySelector('input[accept=".jpg,.png"]');
  //uploaderprofile.disabled = false;
  document
    .querySelector("#profile-image-container")
    .classList.add("logo-decision");
};

// show and hide test " لطفا صبر کنید " on registration async callbacks
export const ToggleRegistrationLoader = (ON) => {
  document
    .querySelector("#reg_loader")
    .setAttribute("style", ON ? "display:block" : "display:none");

  // document.querySelector("#profile-image-container").setAttribute("style", "display:block");
    document
    .querySelector("#profile-image-container")
    .classList.add("logo-decision");
};

// logo is uplaoding
export const LogoUploadPreparing = (ON) => {
  document
    .querySelector("#logoImgArrow")
    .setAttribute("style", !ON ? "display:inline-block" : "display:none");
  if (ON) {
    document.querySelector("#logoImg").src =
      "/dist/assets/sactivity/school-profile.png";
    document.querySelector("#liquiduplod").classList.add("begin-liquid-uplod");
  } else
    document
      .querySelector("#liquiduplod")
      .classList.remove("begin-liquid-uplod");
};

// Animation and loging of current grade that it's list is editing
export const updateFooter = (id) => {
  let footer = document.getElementById("registration_footer");
  let text = getSwitch(getState().gradeId).innerHTML;
  footer.innerHTML = `<hr>
    <span class="mr-button-text uk-padding uk-padding-remove-top ">
        <span class="color-splash"  uk-icon="icon:  file-edit; ratio:1.2" ></span>
        <span class="flip-arrow"  uk-icon="icon:  arrow-right; ratio:1.2" ></span>
        <span class="fade-in">
            ${text} 
        </span>
   </span>
`;
};

function getTable(id) {
  document.querySelector("#" + ls.prefix() + id);
}
