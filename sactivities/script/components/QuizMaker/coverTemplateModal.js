import { $_ } from "../../../../common/utils/create.dom";
class CoverTemplateModal {
  constructor(container, defaultData) {
    this.container = document.getElementById(container);
    this.state = { ...defaultData };
    this.inputs = this.container.querySelectorAll("input:not([type='button'])"); //:not([type='button'])

    this.templateIdComponent = this.container.querySelector(
      "#templateId_component"
    );
    this.optionNumberFormComponent =
      this.container.querySelector("#options_face");

    this.init();
    this.setInputValues(defaultData);
  }

  init() {
    this.inputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        this.handleInputChange(input, e.target);
      });
    });

    // Initialize covers
    this.templateIdComponent.setAttribute(
      "data-selected-template-id",
      this.state.templateId
    );
    this.templateIdComponent
      .querySelectorAll("a[data-template-id]")
      .forEach((a) => {
        let id = _.toNumber(a.dataset.templateId);
        a.addEventListener("click", (e) => {
          this.state.templateId = id;
          this.templateIdComponent.setAttribute(
            "data-selected-template-id",
            this.state.templateId
          );
        });
      });
    //initialize question faces (option number form)
    this.optionNumberFormComponent.setAttribute(
      "data-selected-option-number-form",
      this.state.templateId
    );
    this.optionNumberFormComponent
      .querySelectorAll("a[data-option-number-form]")
      .forEach((a) => {
        let id = _.toNumber(a.dataset.optionNumberForm);
        a.addEventListener("click", (e) => {
          this.state.optionNumberForm = id; //a.dataset.optionNumberForm;
          this.optionNumberFormComponent.setAttribute(
            "data-selected-option-number-form",
            this.state.optionNumberForm
          );
        });
      });

    // Init submit button
    const submitButton = document.getElementById("submit_quize_button");
    document
      .getElementById("quiz_submit_template_modal_accept_buttom")
      .addEventListener("click", () => {
        submitButton.setAttribute("disable", true);
        submitButton.dispatchEvent(new Event("click"));
        $_.timer(() => submitButton.removeAttribute("disable"), 1500);
      });

    // test state on demand
    // this.container
    //   .querySelector("#getCoverState")
    //   .addEventListener("click", () => {
    //     console.log(this.state);
    //     return this.state;
    //   });
  }

  setInputValues(data = this.state) {
    this.inputs.forEach((input) => {
      switch (input.id) {
        case "separate_first_page":
          input.checked = data.templateType;
          
          // Yeganeh // added to toggle template type based on separate_first_page checkbox for first time  ///////////////
          input.checked ? this.templateIdComponent.classList.add('fullpage') : this.templateIdComponent.classList.remove('fullpage');
          ///////////////////////////////////////////////////////////////
          
          break;
        // case "templateType":
        //   input.checked = data.templateType;
        //   break;
        case "questionNumberRGB":
          input.value = data.questionNumberRGB;
          break;
        case "optionNumberRGB":
          input.value = data.optionNumberRGB;
          break;
        case "collectorName":
          input.value = data.collectorName;
          break;
        case "hasJustQuestionFace":
          input.checked = data.hasJustQuestionFace;
          break;
        case "hasMediaLink":
          input.checked = data.hasMediaLink;
          break;
        default:
          break;
      }
      // Set templateId component value
      this.templateIdComponent.setAttribute(
        "data-selected-template-id",
        data.templateId
      );
      this.templateIdComponent
        .querySelectorAll("a[data-template-id]")
        .forEach((a) => {
          let id = _.toNumber(a.dataset.templateId);
          if (id === data.templateId) {
            a.closest("li").classList.add("uk-active");
          } else a.closest("li").classList.remove("uk-active");
        });

      // Set optionNumberForm value
      this.optionNumberFormComponent.setAttribute(
        "data-selected-option-number-form",
        data.optionNumberForm
      );
      this.optionNumberFormComponent
        .querySelectorAll("a[data-option-number-form]")
        .forEach((a) => {
          let id = _.toNumber(a.dataset.optionNumberForm);
          if (id === data.optionNumberForm) {
            a.closest("li").classList.add("uk-active");
          } else a.closest("li").classList.remove("uk-active");
        });
    });
  }

  handleInputChange(input, target) {
    switch (input.id) {
      case "separate_first_page":
        this.state.templateType = target.checked;
        break;
      case "templateId_component":
        this.state.templateId = target.getAttribute("data-template-id");
        break;
      // case "templateType":
      //   this.state.templateType = target.checked;
      //   break;
      case "questionNumberRGB":
        this.state.questionNumberRGB = target.value;
        break;
      case "optionNumberRGB":
        this.state.optionNumberRGB = target.value;
        break;
      case "collectorName":
        this.state.collectorName = target.value;
        break;
      case "hasJustQuestionFace":
        this.state.hasJustQuestionFace = target.checked;
        break;
      case "hasMediaLink":
        this.state.hasMediaLink = target.checked;
        break;
      default:
        break;
    }
  }
}

export default CoverTemplateModal;
