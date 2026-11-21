import { startsWith, isString, isArray } from "lodash";
import { qs } from "../uiHelpers";

export const $_ = (function () {
  return {
    icoBtn: (id, options) => {
      const { text, icon, tooltip } = options;
      //console.log(options)
      let span = document.createElement("SPAN");
      span.id = id;
      if (!text) {
        span.setAttribute("uk-icon", `icon:${icon}; ratio:1.4`);
        span.setAttribute("uk-tooltip", `title:${tooltip}`);
        span.classList.add("uk-icon-button");
      }
      return span;
    },
    icoButton: (id, options) => {
      const { icon, tooltip } = options;
      //console.log(options)
      let button = document.createElement("INPUT");
      button.id = id;
      //    / let text = document.createTextNode(tooltip);

      button.setAttribute("type", "button");

      // button.setAttribute("uk-icon", `icon:${icon}; ratio:1.4`);
      button.setAttribute("uk-tooltip", `title:${tooltip}`);
      addMultipleClasses(button, ["uk-icon-button"]);
      button.value = tooltip;
      return button;
    },
    icoOutline: (id = "", options = {}) => {
      const { text, icon, tooltip } = options;
      //console.log(options)
      let span = document.createElement("SPAN");
      if (id !== "") span.id = id;
      if (!text) {
        span.setAttribute("icon", `meraat-outline`);
        if (tooltip) span.setAttribute("uk-tooltip", `title:${tooltip}`);
        //span.classList.add("uk-icon-button");
      }
      return span;
    },
    addSplashTooltip: (el, massage, delay = 0, duration = 300) => {
      return el.setAttribute(
        "uk-tooltip",
        `title:${massage};pos: right;delay: ${delay};duration:${duration}`,
      );
    },
    removeSplashTooltip: (el) => {
      return el.removeAttribute("uk-tooltip");
    },
    toReadableDigit: (digit) => {
      if (digit.hasOwnProperty("toLocaleString")) {
        return digit.toLocaleString("ar-EG").replace(/٬/g, ",");
      } else {
        return Number(digit).toLocaleString("ar-EG").replace(/٬/g, ",");
      }
    },
    removeElementChildNodes: (parent) => {
      while (parent.firstChild) {
        // $(parent.firstChild).fadeOut(1000)
        //removeFadeOut(parent.firstChild, 200);
        parent.removeChild(parent.firstChild);
      }
    },
    removeElements: (selector) => {
      const del = (el) => {
        let parent = el.parentNode;
        if (parent) return parent.removeChild(el);
      };

      if (isElement(selector)) return del(selector);

      if (isArray(selector)) {
        // detect wheter class or Id has pass as for each selector
        return selector.map((sel) => {
          const el = isString(sel)
            ? startsWith(sel, ".")
              ? document.querySelector(sel)
              : document.getElementById(sel)
            : sel;
          if (el) {
            del(el);
          }
        });
      } else {
        var el = isString(selector)
          ? startsWith(selector, ".")
            ? document.querySelector(selector)
            : document.getElementById(selector)
          : selector;
        //console.log(el)
        if (el.hasOwnProperty("length")) {
          if (el.length !== 0) {
            el.map((e) => {
              if (e.parentNode) {
                del(el);
              }
            });
          }
        } else {
          if (el.parentNode) {
            del(el);
          }
        }
      }
      return el;
    },
    createFragment(html) {
      const frag = document.createDocumentFragment();
      const temp = document.createElement("div");

      temp.innerHTML = html;
      while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }
      return frag;
    },
    clickOn(selector) {
      var element = null;
      if (isElement(selector)) element = selector;
      else element = getNode(selector);
      let event = new Event("click");
      element.dispatchEvent(event);
    },
    timer(cb, delay) {
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => resolve(cb()), delay);
        } catch {
          (err) => console.log(err);
        }
      });
    },
    //const pause =(delay=> $_.timer(null,delay))
    pause: (delay) => {
      return new Promise((resolve, reject) => setTimeout(resolve, delay));
    },
    setTooltipWidth(type) {
      let tooltip = document.querySelector(".hint-tooltip-class");
      //console.log(tooltip)
      if (!tooltip) return;
      if (!tooltip["classList"]) return;
      switch (type) {
        case "slim":
          tooltip.classList.add("hint-tooltip-class__slim");
          break;
        case "wide":
          tooltip.classList.add("hint-tooltip-class__wide");
          break;
        case "xs":
          tooltip.classList.add("hint-tooltip-class__xs");
          break;
        case "slim":
          tooltip.classList.add("hint-tooltip-class__xss");
          break;
      }
    },
    insertAt(array, index, ...elementsArray) {
      return array.slice().splice(index, 0, ...elementsArray);
    },
    hasDuplicates(array) {
      return new Set(array).size !== array.length;
    },
    isElement: isElement,
    addScope: (s) => `: scope > ${s}`,
    getDomElementWhenReadyFor: (selector, duration = 60, interval = 1000) => {
      return new Promise((resolve, reject) => {
        let counter = 0;
        var getElementInterval = setInterval(function () {
          var element = qs(selector);
          if (isElement(element)) {
            //console.log(element)
            clearInterval(getElementInterval);
            return resolve(element);
          }
          counter += interval / 1000;
          if (counter >= duration) {
            clearInterval(getElementInterval);
            if (isElement(element)) {
              //console.log(element)
              resolve(element);
              return;
            }
            reject();
            return;
          }
        }, interval);
      });
    },
    setValidation: (el, status) => {
      // true : valid | false : invalid
      el.classList.add("uk-text-success");
      if (!status)
        if (!el.classList.contains("uk-form-danger"))
          el.classList.add("uk-form-danger");
        else el.classList.remove("uk-form-danger");
    },
    // Returns selected option from dropdown list passed as sel parameter
    getSelectedOption: (sel) => {
      var opt;
      for (var i = 0, len = sel.options.length; i < len; i++) {
        opt = sel.options[i];
        if (opt.selected === true) {
          break;
        }
      }
      return opt;
    },
    _moveArrayItem: (array, oldIndex, newIndex) => {
      if (newIndex >= array.length) {
        newIndex = array.length - 1;
      }
      array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
      return array;
    },
    move: (arr, fromIndex, toIndex) => {
      const [itemToMove] = arr.splice(fromIndex, 1); //take next item from the iterator
      arr.splice(toIndex, 0, itemToMove);

      //iterate and adjust indexes
      let index = toIndex;
      while (index !== fromIndex) {
        let nextIndex =
          fromIndex < toIndex
            ? index - 1 //descending
            : index + 1; //ascending

        const current = arr[index];
        const next = arr[nextIndex];

        //swap the questionNumber parameters
        [current.questionNumber, next.questionNumber] = [
          next.questionNumber,
          current.questionNumber,
        ];

        //go to the next item
        index = nextIndex;
      }
      return arr || [];
    },
    removeElementFromArray: (arr, item) => {
      const removedArr = [...arr].filter((q) => q !== item);
      return removedArr || [];
    },
    removeElementFromArrayAndEmmitZeroz: (arr, item) => {
      const removedArr = [...arr]
        .filter((q) => q !== item)
        .filter((item) => item); // remove
      return removedArr || [];
    },
    removeElementFromArrayOfOjects: (arr, item, prop = "dataId") => {
      const removedArr = [...arr].filter((q) => q[prop] !== item);
      return removedArr || [];
    },

    jsonToAttributes: (jsonBody) => {
      // try {
      //   const obj = JSON.parse(jsonBody);
      //   return Object.entries(obj)
      //     .map(([key, value]) => `${key}="${value}"`)
      //     .join(" ");
      // } catch (e) {
      //   console.error("Invalid JSON:", jsonBody, e);
      //   return "";
      // }
      if (!jsonBody) return "";

      let obj;
      try {
        obj = JSON.parse(jsonBody);
      } catch (e) {
        console.error("Invalid JSON in jsonToAttributes:", jsonBody, e);
        return "";
      }

      return Object.entries(obj)
        .map(([key, value]) => {
          if (value === null || value === undefined) return "";
          // escape quotes and wrap in single quotes to support HTML content
          const safeValue = String(value)
            .replace(/"/g, "&quot;") // escape double quotes
            .replace(/'/g, "&#39;"); // escape single quotes
          return `${key}='${safeValue}'`;
        })
        .join(" ");
    },
    escapeHtml(s) {
      return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },
  };
})();

function addMultipleClasses(el, classList) {
  if (!el) return;

  var list = classList || [];
  return list ? list.map((c) => el.classList.add(c)) : el;
}

//Returns true if it is a DOM node
function isNode(o) {
  return typeof Node === "object"
    ? o instanceof Node
    : o &&
        typeof o === "object" &&
        typeof o.nodeType === "number" &&
        typeof o.nodeName === "string";
}

//Returns true if it is a DOM element
function isElement(o) {
  return typeof HTMLElement === "object"
    ? o instanceof HTMLElement //DOM2
    : o &&
        typeof o === "object" &&
        o !== null &&
        o.nodeType === 1 &&
        typeof o.nodeName === "string";
}

function getNode(selector) {
  if (isElement(selector)) return selector;
  // if (isArray(selector)) {
  //     return selector.map(sel => {
  //         const el = isString(sel) ? startsWith(sel, ".") ? document.querySelector(sel) : document.getElementById(sel) : sel;
  //         if (el) {
  //             del(el)
  //         }
  //     });
  // }
  else {
    var el = isString(selector)
      ? startsWith(selector, ".")
        ? document.querySelector(selector)
        : document.getElementById(selector)
      : selector;
  }
  return el;
}
