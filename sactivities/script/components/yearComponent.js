import * as axios from "axios";
import { getState, setState } from "../utils/state.util";
import { $on } from "../../../common/uiHelpers";
export const yearComponent = (function () {
  var switches = [];
  let ul = document.getElementById("yearComponent");

  const setActiveTab = (year) => {
    for (let tab of switches) {
      //console.log(tab)
      if (year === Number(tab.dataset.activeYear))
        tab.classList.add("uk-active");
      else tab.classList.remove("uk-active");
    }
  };

  const setActiveYear = async (activeYear) => {
    //debugger
    await axios
      .post(
        `/api/School/SetSchoolActiveYearLog?selectedActiveYearByUser=${activeYear}`
      )
      .then((response) => {
        if (response.status === 200) {
          window.location.reload();
        }
      });
  };

  return {
    init: async () => {
      const data = await axios("/api/School/GetSchoolActiveYearLog").then(
        (response) => response.data
      );
      // console.log(data);
      let selectedActiveYear = data[0].selectedActiveYearByUser;

      if (data[data.length - 1].activeYear - selectedActiveYear > 1) {
        document.getElementById("order").style.display = "none";
        document.getElementById("order_tab_container").style.display = "none";
        // document.getElementById("exam_creation").style.display = "none";
        // document.getElementById("exam_maker_wrapper").style.display = "none";
      }

      // if(data[data.length - 1].activeYear - selectedActiveYear > 1) {

      // }

      ul.innerHTML += data
        .map((item) => {
          return `
                        <option class="js-year-switcher"
                        ${
                          item.activeYear == selectedActiveYear
                            ? "selected"
                            : ""
                        } 
                        data-active-year="${item.activeYear}">${
            item.activeYearDsc
          }
                        </option>
                      `;
        })
        .join("");
      switches = document.getElementById("yearComponent");
      $on(switches, "change", (e) => {
        let selectedYear = Number(
          switches.options[switches.selectedIndex].getAttribute(
            "data-active-year"
          )
        );
        setActiveYear(selectedYear);
      });
      return this;
    },
    setActiveYear: async (activeYear) => {
      await axios.set(
        `/api/School/GetSchoolActiveYearLog?selectedActiveYearByUser=${activeYear}`
      );
    },
  };
})();

// This could controll time line switch at the header
// const switches = document.querySelectorAll('.js-year-switcher');
// for (let switchee of switches) {
//     $on(switchee, 'click', (e) => switchtabs(e.currentTarget));
// }

// year switcher at the top left of page
function switchTabs(targetElement) {
  var elements = document.getElementsByClassName("toggle-grade");
  _.forEach(elements, (el) => {
    el.classList.add("tab-drop-position-hide");
  });
  targetElement.querySelector("div").classList.remove("tab-drop-position-hide");
}
