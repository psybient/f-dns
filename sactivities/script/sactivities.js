import $, { error } from "jquery";
import UIkit from "uikit";
import { initProgressBar } from "./utils/progress.util";
import RegDetailTemplate from "./view/registration.detail.template";
import { ReportTemplate } from "./view/schoolReport.template";
import ManagementReportTemplate from "./view/management.report";
import teachersTabModule from "./view/teachers.tab.view";
import regularExamTabModule from "./view/regular.exam.tab.js";
import { ls } from "./utils/localStorage.util";
import * as axios from "axios";
import { $_ } from "../../common/utils/create.dom";
import { initDownloadButton } from "../../common/components/_animationButtonPlayPause";
import { getDownloadableContentOfBlobApi } from "../../common/utils/downloadBlob";
import { qi } from "../../common/uiHelpers";
import { yearComponent } from "./components/yearComponent";
// import Worker from "./sactivityDataProvider.worker.js";
import { getDetailReportData } from "./model/DetailReport";
import quizMaker from "./view/quiz.maker.tab";
import ContractManager from "./view/contracts.tab.js";
import RegistrationManager from "./view/registration.tab.js";
import CreditManager from "./components/CreditModals/creditManager";
import EditProfile from "./view/edit.profile.info.js";
import TicketTab from "./view/ticket.tab.js";

import("uikit/dist/js/uikit-icons").then((Icons) => UIkit.use(Icons.default));

const observer = new MutationObserver(() => {
  document.querySelectorAll("[uk-height-viewport]").forEach((el) => {
    if (el.style.minHeight && el.style.minHeight.includes("100vh")) {
      el.style.minHeight = el.style.minHeight.replace("100vh", "100dvh");
    }
  });
});

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ["style"],
  subtree: true,
});

// // clean localStorage on closeing the window
window.addEventListener("unload", function (e) {
  ls.clearKeys(ls.prefix());
});

//   clear keys that starts with reg_tbl if any exist
if (localStorage[ls.prefix()]) ls.clearKeys(ls.prefix());

export const updateDetailRegistrationHandler = async function () {
  const details = () =>
    axios("/api/School/StudentListStatus")
      .then((response) => response.data)
      .then((grades) => {
        // console.log(grades);
        // console.log("updateDetailRegistrationHandler");
        let renderDetail = new RegDetailTemplate(grades);
        renderDetail.Render();
        //renderDetail = null;
      });
  return await details(); //.then((result) => result);
};

const getContractStatusResult = axios.get(`/api/School/GetContractStatus`);
const loaderElement = document.querySelector(".main-loader");

const getSchoolPresentTestReportData = () =>
  new Promise(function (resolve, reject) {
    // console.time("getSchoolPresentTestReportData");
    axios("/api/School/GetSchoolPresentTestReportData")
      .then((response) => response.data)
      .then((result) => {
        resolve(result);
        // console.timeEnd("getSchoolPresentTestReportData");
      });
  });

// // init registration :
const initRegistrationTabPromise = () =>
  new Promise(async (resolve, reject) => {
    const rm = new RegistrationManager();
    const rmRef = await rm.ready();
    return resolve(rmRef);
  });

const getChartsDb = new Promise((resolve) => {
  axios("/api/School/GetSchoolPresentTestChartData")
    .then((response) => response.data)
    .then((chartsDb) => resolve(chartsDb));
});

// init balance report
const initManagementReportPromise = () =>
  new Promise(async (resolve, reject) => {
    const [balanceDb, chartsDb] = await Promise.all([
      getSchoolPresentTestReportData(),
      getChartsDb,
    ]);
    // console.log(balanceDb, chartsDb);
    // getSchoolPresentTestReportData()
    //   .then((balanceDb) => {
    // console.time("creating-balance");
    let mrt = new ManagementReportTemplate(balanceDb, chartsDb);
    mrt.Render();
    // console.timeEnd("creating-balance");
    resolve(mrt);
    // })
    // .catch((err) => console.log(err));
  });

//Initialize Teachers Tab
const initTeachersTabPromise = () =>
  new Promise(async (resolve, reject) => {
    return resolve(teachersTabModule.init());
  });

//Initialize regular exam Tab
const initRegularQuizeTabPromise = () =>
  new Promise(async (resolve, reject) => {
    return resolve(
      await regularExamTabModule.init().catch((err) => console.log(err)),
    );
  });

// this will handle data fetch and renderin of detail-report tab
const initDetailReport = async () =>
  new Promise(async (resolve, reject) => {
    // const worker = new Worker();

    // worker.onmessage = function (event) {
    //   const message = event.data;
    //   // console.log("Worker message received:", message);

    //   if (!message || typeof message !== "object") {
    //     console.error("Worker message is invalid:", message);
    //     return reject(new Error("Worker data is undefined or not an object."));
    //   }
    const message = await getDetailReportData();
    try {
      function cb() {
        const detailReportSection = new ReportTemplate(message);
        detailReportSection.Render();
      }
      return resolve(cb);
    } catch (err) {
      console.error("Error during report rendering:", err);
      return reject(err);
    }
    //   };
  });

const initQuizMakerPromise = (props) =>
  new Promise(async (resolve, reject) => {
    try {
      const qm = await new quizMaker(props).ready();
      qm.render();
      return resolve(qm);
    } catch (err) {
      console.log(err);
    }
  });

const initContractsTabPromise = () =>
  new Promise(async (resolve, reject) => {
    const creditManager = await new CreditManager().ready();
    const urlParams = new URLSearchParams(window.location.search);
    const bankParam = urlParams.get("banktransaction");
    if (creditManager)
      await creditManager.render(bankParam === "1" ? true : false);

    // console.log(bankParam);
    if (bankParam === "1") {
      creditManager.showModal();
    }
    const contractsManager = await new ContractManager({
      creditManager,
    }).ready();
    // console.log(contractsManager);
    return resolve(contractsManager);
  });

const ProfileManagerPromise = () =>
  new Promise(async (resolve, reject) => {
    const modal = document.getElementById("#profile");
    const profileManager = await new EditProfile({ modal: modal }).ready();
    profileManager.render();
    return resolve(profileManager);
  });

const initTicketTabPromise = () =>
  new Promise(async (resolve, reject) => {
    const ticketTab = await new TicketTab({}).ready();
    // ticketTab.render();
    return resolve(ticketTab);
  });

document.addEventListener("DOMContentLoaded", async function () {
  const contractsStatus = await getContractStatusResult;
  // console.log(contractsStatus);

  try {
    var dr = null;
    const rm = await initRegistrationTabPromise();

    setTimeout(() => {
      loaderElement.classList.add("loaded");
      initProgressBar();
    }, 500);

    const [mr, t, rq, qm, c, pf, tt] = await Promise.all([
      // initRegistrationTabPromise(),
      initManagementReportPromise(),
      initTeachersTabPromise(),
      initRegularQuizeTabPromise(),
      initQuizMakerPromise({ contractsStatus: contractsStatus.data }),
      initContractsTabPromise(),
      ProfileManagerPromise(),
      initTicketTabPromise(),
    ]).catch((err) => console.log(err));
    // .finally(() => {
    //   if (hasContract === false)
    //     setTimeout(() => {
    //       loaderElement.classList.add("loaded");
    //     }, 100);
    // });
    // console.log(rm, mr, t, rq, qm, c);
    rm.setQuizMakerInstance(qm);
    c.setQuizMakerInstance(qm);
    c.setRegistrationInstance(rm);
    // console.log(contractsStatus.data);
    const hasContract = await renderTabSwitchers(
      contractsStatus.status === 200 ? contractsStatus.data : [],
    );
    // debugger;
    const yearComponentReference = await yearComponent.init();
    // console.log(yearComponentReference);

    if (hasContract) {
      dr = await initDetailReport();
      // .catch((err) => console.log(err))
      // .finally(
      //   async () => {
      // const detailInitCallback = await dr();
      let detailReportTabSwitcher =
        document.querySelector("#detail_report_tab");
      // debugger;
      if (detailReportTabSwitcher) {
        $_.removeElements(".saving-dot-loader");
        detailReportTabSwitcher
          .querySelector("a")
          .classList.remove("uk-hidden");
        if (detailReportTabSwitcher.hasOwnProperty("animate")) {
          detailReportTabSwitcher.animate(
            [
              { transform: "translateX(30px)" },
              { transform: "translateX(0px)" },
            ],
            {
              duration: 600,
              iterations: 1,
            },
          );
        }
      }
      detailReportTabSwitcher.addEventListener(
        "click",
        (e) => {
          // e.stopImmediatePropagation();
          dr();
        },
        { once: true },
      );
      // setTimeout(() => {
      //     loaderElement.classList.add("loaded");
      //   }
      //   // }, 100)
      // );
      // console.log(dr);
    }
    // else {
    // setTimeout(() => {
    //   loaderElement.classList.add("loaded");
    // }, 100);
    // }

    await customBindings();
    // .catch((err) => console.log(err))
    // .finally(() => loaderElement.classList.add("loaded"));

    // if (hasContract == false) {
    // setTimeout(() => {
    //   let mainSwithcer = UIkit.switcher("#main_tab_switcher");
    //   window.mainSwithcer = mainSwithcer;
    //   mainSwithcer.show(-1);
    //   // loaderElement.classList.add("loaded");
    // }, 100);
    // }
  } catch (error) {
    console.log(error);
    loaderElement.classList.add("loaded");
  }
});

async function renderTabSwitchers(contractsStatus) {
  const isAnyTrueForContract = () => contractsStatus.some((g) => g.status);

  const checkContracts = isAnyTrueForContract();
  // console.log(checkContracts);
  const hasContract = contractsStatus.length && checkContracts;
  if (hasContract === false) {
    const detailReportTabContainer = document.getElementById(
      "detail_report_tab_container",
    );
    // console.log(detailReportTabContainer);
    $_.removeElementChildNodes(detailReportTabContainer);
    $_.removeElements(detailReportTabContainer);
  }
  // `<li id="detail_report_tab" style="min-width: 35px" class="tabs-switcher mr-padding-small loading-dot-dot-dot report-tabs">
  //                             <p class="saving-dot-loader"><span>.</span><span>.</span><span>.</span></p>
  //                             <a style="" class="uk-border-rounded uk-hidden" href="#">گزارش واحدهای یادگیری</a><span>
  //                               <a href="/docs/index#Sch-SelfAssess" target="_blank" class="uk-animation-scale-up uk-animation-fast" uk-icon="question"></a>
  //                             </span>
  //                         </li>`
  //                       : ``
  const markup = `<li id="student_register" class="tabs-switcher mr-padding-small report-tabs" disabled="true">
                    <a class="uk-border-rounded uk-animation-fast" href="#">دانش‌آموزان</a><span>
                      <a href="/docs/index#Sch-OrderReq" target="_blank" class="uk-animation-scale-up uk-animation-fast" uk-icon="question"></a>
                    </span>
                  </li>

                  <li id="" class="tabs-switcher uk-inline mr-padding-small report-tabs">
                    <a class="uk-border-rounded uk-animation-fast" href="#">نمایش آزمون هماهنگ</a><span>
                        <a href="/docs/index#Sch-OnlineExam" target="_blank" class="uk-animation-scale-up uk-animation-fast" uk-icon="question"></a>
                      </span>
                  </li>

                  <li id="management_report_section_switcher" class="tabs-switcher uk-inline mr-padding-small report-tabs">
                      <a class="uk-border-rounded uk-animation-fast" href="#">گزارش آزمون هماهنگ</a><span>
                        <a href="/docs/index#Sch-ExamReports" target="_blank" class="uk-animation-scale-up uk-animation-fast" uk-icon="question"></a>
                      </span>
                  </li>

                  <li id="teachers_tab" class="tabs-switcher mr-padding-small report-tabs">
                      <a class="uk-border-rounded uk-animation-fast" href="#">معلمان</a><span>
                        <a href="/docs/index#Sch-Teachers" target="_blank" class="uk-animation-scale-up uk-animation-fast" uk-icon="question"></a>
                      </span>                      
                  </li>
						
                  ${
                    checkContracts
                      ? `<li id="detail_report_tab" style="min-width: 35px" class="tabs-switcher mr-padding-small loading-dot-dot-dot report-tabs">
                              <p class="saving-dot-loader"><span>.</span><span>.</span><span>.</span></p>
                              <a style="" class="uk-border-rounded uk-hidden" href="#">گزارش واحدهای یادگیری</a><span>
                                <a href="/docs/index#Sch-SelfAssess" target="_blank" class="uk-animation-scale-up uk-animation-fast" uk-icon="question"></a>
                              </span>
                          </li>`
                      : ``
                  }
                      
                  
            
                  <li id="exam_creation" class="tabs-switcher uk-inline mr-padding-small report-tabs">
                    <a class="uk-border-rounded uk-animation-fast violet-button" href="#">آزمون‌ساز</a><span>
                      <a href="/docs/index#Sch-TestMaker" target="_blank" class="uk-animation-scale-up uk-animation-fast" uk-icon="question"></a>
                    </span>
                  </li>

                  <li id="order" class="tabs-switcher uk-inline mr-padding-small report-tabs ${
                    checkContracts ? "" : "uk-active"
                  }" >
                    <a class="uk-border-rounded uk-animation-fast" href="#">سفارش</a>
                    ${
                      contractsStatus[0].gradeFieldId > 9
                        ? `<div class="store-link"><button id="link_to_final_store"  >كتاب‌هاي<br>تشريحي </button></div>`
                        : contractsStatus[0].gradeFieldId < 7 
                          ? `<div class="store-link"><button id="link_to_final_store"  >كتاب‌هاي<br>قصه و داستان </button></div>`
                          : ``
                    } 
                    <span>
                      <a href="/docs/index#Sch-OrderInit" target="_blank" class="uk-animation-scale-up uk-animation-fast" uk-icon="question"></a>
                    </span>
                    
                  </li>

                  <li id="tickets_tab" class="tabs-switcher mr-padding-small report-tabs">
                      <a class="uk-border-rounded uk-animation-fast" href="#">تيكت</a><span>
                        <a href="/docs/index#Sch-Ticket" target="_blank" class="uk-animation-scale-up uk-animation-fast" uk-icon="question"></a>
                      </span>
                  </li>`;
    const switcherNavComponent = document.getElementById("main_tab_switcher");
    switcherNavComponent.innerHTML = markup;

    if (document.getElementById("link_to_final_store"))
    {
        let linkToFinal = document.getElementById("link_to_final_store");
        linkToFinal.addEventListener("click", async (e) => {
          e.preventDefault();

          const res = await axios.get("/api/School/GetPersonRoleId");

          if (res.data) {
            const url = `https://${contractsStatus[0].gradeFieldId > 9 ? 'final.meraat': 'instory'}.ir/book/explore?auth=auto&personroleid=${res.data}`;

            window.open(url, "_blank", "noopener,noreferrer");
          }
        });
    }
  
  // await $_.pause(101);
  // if (hasContract) {
  //   // check is worker job is done
  //   let detailReportTabSwitcher = document.querySelector("#detail_report_tab");
  //   debugger;
  //   if (detailReportTabSwitcher) {
  //     $_.removeElements(".saving-dot-loader");
  //     detailReportTabSwitcher.querySelector("a").classList.remove("uk-hidden");
  //     if (detailReportTabSwitcher.hasOwnProperty("animate")) {
  //       detailReportTabSwitcher.animate(
  //         [{ transform: "translateX(30px)" }, { transform: "translateX(0px)" }],
  //         {
  //           duration: 600,
  //           iterations: 1,
  //         }
  //       );
  //     }
  //   }
  // }
  return hasContract;
}

// //after every event on page
async function customBindings() {
  //let loaderComponent = document.querySelector('.main-loader');
  let dropArea = document.querySelector(".js-registration-upload");

  //disable upload files on locked grade
  dropArea.addEventListener("dragenter", preventDefaultUploadBehaviour, false);

  // init download button inside d&d area's placeholder
  const listDownloadButton = qi("anim_button_container"); //initButton(qi("anim_button_container"));
  const btns = [
    // {
    //   id: "anim_dnl_0",
    //   text: "دانلود صورتحساب مدرسه",
    //   url: "/api/School/GetSchoolBill",
    // },
    // {
    //   id: "anim_dnl_1",
    //   text: "دانلود صورتحساب مستقل دانش‌آموزان",
    //   url: "/api/School/GetStudentBill",
    // },
    {
      id: "anim_dnl_2",
      text: "دانلود اطلاعات کاربری دانش آموزان",
      url: "/api/School/GetSchoolStudentUserList",
    },
    {
      id: "anim_dnl_3",
      text: "لیبل نام کاربری دانش آموزان",
      url: "/api/School/StudentInfoLabel",
    },
  ];
  const downloadButtonsPromiseArray = btns.map((btn) =>
    initDownloadButton(listDownloadButton, btn.id, btn.text),
  );
  // const pr = await exe();
  // returns final promise that includes animation getting run base on the time for promise to get resolve
  const callbacks = await Promise.all(downloadButtonsPromiseArray);
  //
  //executed.map(el=>el().then(c=>console.log(c)))
  for (let btn in btns) {
    document.getElementById(btns[btn].id).addEventListener("click", (e) => {
      callbacks[btn](() =>
        getDownloadableContentOfBlobApi(
          btns[btn].url,
          btns[btn].id === "anim_dnl_3" ? "pdf" : "xls",
        ),
      );
    });
  }

  // .then(() => {
  // Promise.resolve(initDetailReport)
  // .then(() => {
  let helpContainer = document.querySelector(".btn-pluss-wrapper");
  helpContainer.classList.add("help-enter");
  // } else {
  //   console.log("no detailReportTabSwitcher");
  // }

  // Edge doesn't support this , we check to see if HTMLElement has animation attribute

  // change chat Link to mobile
  if (isMobile()) {
    var linkChangeNeed = document.getElementById("chatChange");
    var chatLink = linkChangeNeed
      .getAttribute("href")
      .replace("/webchat.html?", "/chat.html?");
    linkChangeNeed.setAttribute("href", chatLink);
  }
  // if (pageLoader)
  //   setTimeout(() => {
  //     pageLoader.end(); //.classList.add('loaded');
  //   }, 0);
  // initProgressBar();
  initSidebar();
  dynamicviewport();
  window.addEventListener("resize", dynamicviewport);
  // pageLoader.end();
  // setTimeout(() => {
  //   loaderElement.classList.add("loaded");
  // }, 100);
  import("uikit/dist/js/uikit-icons").then((Icons) => UIkit.use(Icons.default));
}

// to add and remove default functionality on file uploader
// Base on state of grade being lock or not
function preventDefaultUploadBehaviour(e) {
  if (document.querySelector("input[type=file].js-xls-reg_uploader").disabled) {
    e.preventDefault();
    e.stopPropagation();
    UIkit.modal.alert("لیست دانش آموزان این پایه قفل می باشد. ");
  }
}

function initSidebar() {
  // // This code is marked due to help modul being unfinished and after it getting complete should get uncomment
  // document.querySelector('#sidebar_help_link').addEventListener('click', (e) => {
  //     e.preventDefault();
  //     UIkit.modal("#help-modal").show()
  // });

  document
    .querySelector("#sidebar_logout_link")
    .addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#header_logout_button").click();
    });
}

// this code can ask for user's consent on closing the browser tab.
// window.addEventListener("beforeunload", function (e) {
//     var confirmationMessage = "\o/";

//     (e || window.event).returnValue = confirmationMessage; //Gecko + IE
//     return confirmationMessage; //Webkit, Safari, Chrome
// });

// module.hot.accept(

// );

window.isMobile = function () {
  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4),
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

function dynamicviewport() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
