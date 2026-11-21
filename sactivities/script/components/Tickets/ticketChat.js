import axios from "axios";
import { logify } from "../../../../common/utils/ukHelper";
import _ from "lodash";
import { $_ } from "../../../../common/utils/create.dom";
// import moment from "moment-jalaali";
const TicketChat = class {
  constructor(props) {
    this.state = {
      uploadedFiles: [],
      id: 0,
      ticketDetailList: [],
      shouldClose: false,
    };
    this.toggler = props.toggler;
    this.ticketListComponent = null;
    this.backToTicketList = null;
    this.wrapper = null;
    this.chatArea = null;
    // this.chatTitle = null;
    this.closedTicketPrompt = null;
    this.createTicketButton = null;
    this.chatTextArea = null;
    this.writeMessageArea = null;
    this.topicSelect = null;
    this.attachentList = null;
    this.promiseReady = this.init();
  }

  async ready() {
    return this.promiseReady;
  }

  setTicketListComponentRef(ref) {
    this.ticketListComponent = ref;
  }

  async fetchChatList(id = 0) {
    const { data } = await axios.get(
      `../api/School/GetTicketDetail?ticketId=${id}`
    );
    // console.log(data);
    return data;
  }

  init() {
    this.wrapper = document.getElementById("chat_area");
    this.backToTicketList = document.getElementById("back_to_tickets_tab");
    this.backToTicketList.addEventListener("click", () => {
      this.toggler.classList.remove("chat-mode");
    });
    this.chatArea = document.getElementById("ticket_chat_list");
    this.fileUploader = document.getElementById("ticket_chat_file_uploader");
    this.uploadList = document.getElementById("ticket_chat_attachment_area");
    this.createTicketButton = document.getElementById(
      "ticket_chat_submit_button"
    );
    this.chatTextArea = document.getElementById("ticket_chat_textarea");
    this.writeMessageArea = document.getElementById("message_area");
    this.closedTicketPrompt = document.getElementById(
      "ticket_is_close_wrapper"
    );
    // this.chatTitle = document.getElementById("ticket_accept_supporting");
    this.fileUploader.addEventListener("change", (e) =>
      this.handleFileUpload(e)
    );
    this.uploadList.addEventListener("click", (e) => this.handleFileRemove(e));
    this.createTicketButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.createTicket();
    });
    this.closedTicketPrompt.querySelector("a").addEventListener("click", () => {
      this.resetForm();
      this.toggler.classList.remove("chat-mode");
      this.toggler.classList.add("new-ticket-mode");
    });
    return this;
  }

  async render(id, lastChatAnimate, chatScroll, closeMessageAnimate) {
    const that = this;
    $_.removeElementChildNodes(this.chatArea);
    this.state.id = id;
    let ticketRef = this.ticketListComponent.state.ticketList.filter(
      (item) => item.id == id
    )[0];
    this.state.ticketDetailList = await this.fetchChatList(id);

    const shouldClose = ticketRef.shouldClose;
    const isClose = ticketRef.ticketStatusId === 631;
    const isSatisfy = ticketRef.isUserSatisfied;
    const ticketDate = ticketRef.solarInsDate;
    const ticketTime = ticketRef.hoursAndMinutes;
    const supporter = ticketRef.supporterFullName;

    this.setChatModeStatus(isClose || shouldClose ? false : true);
    let closeMessageTemplate = `${
      shouldClose && isClose === false
        ? `<div class="message meraat ${
            isSatisfy == null ? "" : "uk-animation-slide-right"
          }">
									<div>
										<h1 class="title"> ${supporter}</h1>
										<p>آیا تیکت بسته شود؟</p>
										<div class="feedback ${isSatisfy == null ? "" : isSatisfy ? "yes" : "no"}">
											<button data-ticket-accept-terminate="">بله</button>
											<button data-ticket-deny-terminate="">خیر</button>
										</div>
                		<p>در صورت عدم پاسخگویی تیکت بعد از 3 روز به‌طور خودکار بسته خواهد شد.</p>
										<span class="date">
											<span>${ticketTime}</span>${ticketDate}
										</span>                     
									</div>																
								</div>`
        : ""
    }

     ${
       isClose
         ? `<div class="message meraat must-animate">
									<div>
										<h1 class="title"> مرآت</h1>
                    <p>آیا از پشتیبانی رضایت داشتید؟</p>
										<div class="feedback ${isSatisfy == null ? "" : isSatisfy ? "yes" : "no"}">
											<button data-ticket-satisfaction-button="accept">بله</button>
											<button data-ticket-satisfaction-button="deny">خیر</button>
										</div>
										<span class="date">
											<span>${ticketTime}</span>${ticketDate}
										</span>                    
									</div>																
								</div>
                    `
         : ""
     }`;

    const chatMarkup = [];
    //this.chatArea.innerHTML = `
    //  ${
    const ticketListLength = this.state.ticketDetailList.length - 1;
    this.state.ticketDetailList.forEach((chat, i) => {
      //  console.log(chat);
      const {
        description,
        emailSent,
        files,
        id,
        persianInsDate,
        solarInsDate,
        hoursAndMinutes,
        isUseful,
        //  shouldClose,
        smsSent,
        speaker,
        couldDelete,
        supporterPersonRoleId,
        ticketId,
        filesList,
        isStaticConversationPost,
        staticConversationPostType,
        staticConversationPostValue,
        logoAddress,
      } = chat;

      const dialogMarkup =
        isStaticConversationPost === true
          ? `<div class="message ${
              supporterPersonRoleId === 0 ? "user" : "meraat"
            } must-move">
									<div>
										<h1 class="title">
                    ${
                      logoAddress.length == 0
                        ? `<div class="user-profile-icon" speaker="${speaker.charAt(
                            0
                          )}"><span>${speaker.charAt(0)}</span></div>`
                        : `<img class="user-profile-image" src="${logoAddress}">`
                    }
                      ${supporterPersonRoleId === 0 ? "مدیریت مدرسه" : speaker}
                    </h1>
										<p>${description}</p>
										<div class="feedback ${staticConversationPostValue === "No" ? "no" : "yes"}">
											<button>بله</button>
											<button>خیر</button>
										</div>
                		<p>در صورت عدم پاسخگویی تیکت بعد از 3 روز به‌طور خودکار بسته خواهد شد.</p>
										<span class="date">
											<span>${hoursAndMinutes}</span>${solarInsDate}
										</span>                    
									</div>																
								</div>`
          : `
       <div class="${i == ticketListLength ? "must-animate" : ""}  message ${
              supporterPersonRoleId === 0 ? "user" : "meraat"
            }">
									<div>
										<h1 class="title">
                    ${
                      logoAddress.length == 0
                        ? `<div class="user-profile-icon" speaker="${speaker.charAt(
                            0
                          )}"><span>${speaker.charAt(0)}</span></div>`
                        : `<img class="user-profile-image" src="${logoAddress}">`
                    }
                      ${supporterPersonRoleId === 0 ? "مدیریت مدرسه" : speaker}
                    </h1>
										<p>${description}</p>
										<span class="date">
											<span>${hoursAndMinutes}</span>${solarInsDate}
										</span>
                      
										${
                      filesList?.length > 0
                        ? `${filesList
                            .map((file, i) => {
                              return `<a class="link" target="_blank" uk-icon="link" href="${file}" >فایل ${
                                i + 1
                              }</a>`;
                            })
                            .join("")}`
                        : ""
                    }									

                    <div class="like-button remove-like-animation" ${
                      supporterPersonRoleId === 0
                        ? isUseful
                          ? `style="pointer-events: none; user-select: none; opacity: 0.2"`
                          : "hidden"
                        : ""
                    } >
                      <input data-is-useful-ticket-reply="${id}" type="checkbox" id="check_${id}" ${
              isUseful ? "checked" : ""
            }>
                      <label for="check_${id}">
                      <svg class="unchecked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" stroke="none" stroke-width="1.5" fill="#d8dce0">
                        <path d="m17.5,29.71c-.55,0-1.02-.2-1.41-.59-.39-.39-.59-.86-.59-1.41v-10.18c0-.27.05-.52.16-.76.11-.24.25-.45.44-.64l5.43-5.4c.25-.23.55-.38.89-.42.34-.05.67,0,.99.17.32.17.55.4.69.7.14.3.17.61.09.92l-1.12,4.6h5.45c.53,0,1,.2,1.4.6.4.4.6.87.6,1.4v2c0,.12-.01.24-.04.38-.02.13-.06.26-.11.38l-3,7.05c-.15.33-.4.62-.75.85-.35.23-.72.35-1.1.35h-8Zm-6,0c-.55,0-1.02-.2-1.41-.59-.39-.39-.59-.86-.59-1.41v-9c0-.55.2-1.02.59-1.41.39-.39.86-.59,1.41-.59s1.02.2,1.41.59c.39.39.59.86.59,1.41v9c0,.55-.2,1.02-.59,1.41-.39.39-.86.59-1.41.59Z"/>
                      </svg>
                      <svg class="checked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
                        <circle class="circle-1" cx="8.85" cy="7.44" r="1.5"/>
                        <circle class="circle-2" cx="33.2" cy="33.67" r="1"/>
                        <circle class="circle-3" cx="32.08" cy="8.25" r=".75"/>
                        <circle class="circle-3" cx="8.33" cy="35.38" r=".75"/>
                        <path class="flower-1" d="m9.1,5.37c-.24.14-.54.06-.68-.18s-.06-.54.18-.68.54-.06.68.18.06.54-.18.68Zm-2.42.32c-.28,0-.5.22-.5.5,0,.28.22.5.5.5s.5-.22.5-.5c0-.28-.22-.5-.5-.5Zm-.43,2.75c-.14.24-.06.54.18.68s.54.06.68-.18.06-.54-.18-.68-.54-.06-.68.18Zm2.17,1.75c.14.24.44.32.68.18s.32-.44.18-.68-.44-.32-.68-.18-.32.44-.18.68Zm2.6-1c.28,0,.5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5Zm.43-2.75c.14-.24.06-.54-.18-.68s-.54-.06-.68.18-.06.54.18.68.54.06.68-.18Z"/>
                        <path class="flower-2" d="m7.83,33.13c0-.28.22-.5.5-.5s.5.22.5.5c0,.28-.22.5-.5.5s-.5-.22-.5-.5Zm-1.02,1.38c.14-.24.06-.54-.18-.68s-.54-.06-.68.18-.06.54.18.68.54.06.68-.18Zm0,1.75c-.14-.24-.44-.32-.68-.18s-.32.44-.18.68.44.32.68.18.32-.44.18-.68Zm1.52.88c-.28,0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5Zm1.52-.87c-.14.24-.06.54.18.68s.54.06.68-.18.06-.54-.18-.68-.54-.06-.68.18Zm0-1.75c.14.24.44.32.68.18s.32-.44.18-.68-.44-.32-.68-.18-.32.44-.18.68Z"/>
                        <path class="flower-3" d="m32.7,36.17c0-.28.22-.5.5-.5s.5.22.5.5c0,.28-.22.5-.5.5s-.5-.22-.5-.5Zm3.1-1c.14-.24.06-.54-.18-.68s-.54-.06-.68.18-.06.54.18.68.54.06.68-.18Zm0-3c-.14-.24-.44-.32-.68-.18s-.32.44-.18.68.44.32.68.18.32-.44.18-.68Zm-2.6-1.5c-.28,0-.5.22-.5.5,0,.28.22.5.5.5s.5-.22.5-.5-.22-.5-.5-.5Zm-2.6,1.5c-.14.24-.06.54.18.68s.54.06.68-.18.06-.54-.18-.68-.54-.06-.68.18Zm0,3c.14.24.44.32.68.18s.32-.44.18-.68-.44-.32-.68-.18-.32.44-.18.68Z"/>
                        <path class="flower-2" d="m32.58,6c0,.28-.22.5-.5.5s-.5-.22-.5-.5.22-.5.5-.5.5.22.5.5Zm-2.88.87c-.14.24-.06.54.18.68s.54.06.68-.18.06-.54-.18-.68-.54-.06-.68.18Zm0,2.75c.14.24.44.32.68.18s.32-.44.18-.68-.44-.32-.68-.18-.32.44-.18.68Zm2.38,1.38c.28,0,.5-.22.5-.5,0-.28-.22-.5-.5-.5s-.5.22-.5.5c0,.28.22.5.5.5Zm2.38-1.37c.14-.24.06-.54-.18-.68s-.54-.06-.68.18-.06.54.18.68.54.06.68-.18Zm0-2.75c-.14-.24-.44-.32-.68-.18s-.32.44-.18.68.44.32.68.18.32-.44.18-.68Z"/>
                        <line class="line line-1" x1="33.2" y1="33.67" x2="37.16" y2="37.63"/>
                        <line class="line line-4" x1="32.08" y1="8.25" x2="36.74" y2="3.59"/>
                        <line class="line line-3" x1="8.73" y1="7.3" x2="4.63" y2="3.2"/>
                        <line class="line line-2" x1="8.33" y1="35.38" x2="5.72" y2="37.99"/>
                        <path class="line line-2" d="m24.47,8.03c-1.32-1.84,1.6-5.11,2.06-2.97.37,1.74-4.2,0-2.68-2.97"/>
                        <path class="line line-6" d="m27.15,32.66c.75,1.37-2.07,5.62-2.82,3.96-.64-1.42,3.02-1.3,3.76,1.36"/>
                        <line class="line line-7" x1="33.46" y1="29.71" x2="37.97" y2="29.71"/>
                        <line class="line line-5" x1="7.56" y1="13.99" x2="2.91" y2="13.99"/>
                        <path class="hand" d="m17.5,29.71c-.55,0-1.02-.2-1.41-.59-.39-.39-.59-.86-.59-1.41v-10.18c0-.27.05-.52.16-.76.11-.24.25-.45.44-.64l5.43-5.4c.25-.23.55-.38.89-.42.34-.05.67,0,.99.17.32.17.55.4.69.7.14.3.17.61.09.92l-1.12,4.6h5.45c.53,0,1,.2,1.4.6.4.4.6.87.6,1.4v2c0,.12-.01.24-.04.38-.02.13-.06.26-.11.38l-3,7.05c-.15.33-.4.62-.75.85-.35.23-.72.35-1.1.35h-8Zm-6,0c-.55,0-1.02-.2-1.41-.59-.39-.39-.59-.86-.59-1.41v-9c0-.55.2-1.02.59-1.41.39-.39.86-.59,1.41-.59s1.02.2,1.41.59c.39.39.59.86.59,1.41v9c0,.55-.2,1.02-.59,1.41-.39.39-.86.59-1.41.59Z"/>    
                      </svg>
                    </div>
                    ${
                      couldDelete
                        ? `<div class="delete-confirmation uk-animation-slide-bottom-small toggle-delete-${id}" hidden>
                          <p>آیا از پاک کردن پیام اطمینان دارید؟</p>
                          <span class="reject" uk-icon="icon: close; ratio: 0.9" uk-toggle="target: .toggle-delete-${id}"></span>
                          <span data-remove-ticket-reply="${id}" uk-icon="icon: check; ratio: 0.9" class="accept" uk-toggle="target: .toggle-delete-${id}"></span>			
                        </div>`
                        : ``
                    }              
                  </div>
                    ${
                      couldDelete
                        ? `<span class="delete-message toggle-delete-${id}" uk-icon="trash" uk-toggle="target: .toggle-delete-${id}"></span>`
                        : ``
                    }

          </div>
       `;
      chatMarkup.push(dialogMarkup);
    });

    chatMarkup.push(closeMessageTemplate);

    this.chatArea.innerHTML = chatMarkup.join("");
    this.setCloseModeStatus(isClose);

    if (shouldClose && isClose === false) {
      this.chatArea
        .querySelector("[data-ticket-accept-terminate]")
        .addEventListener("click", async () => {
          const closeTicketRes = await axios.post(
            `../api/School/TicketShouldBeClosed?ticketId=${ticketRef.id}`
          );
          // console.log(closeTicketRes);

          const updateTicketRes = await axios.post(
            `../api/School/UpdTicket?id=${ticketRef.id}&ticketStatusId=631&isUserSatisfied=-1`
          );
          // console.log(updateTicketRes);
          if (updateTicketRes.data === 1) {
            logify({}, "درخواست بسته شدن تیکت تایید گردید.");
            const updateTicketRes = await axios.get(
              `/api/School/GetTicketById?id=${this.state.id}`
            );
            if (updateTicketRes.data) {
              await this.ticketListComponent.render(
                false,
                true,
                updateTicketRes.data[0]
              );
            }
          }
          await this.render(this.state.id, true, true, false);
        });

      this.chatArea
        .querySelector("[data-ticket-deny-terminate]")
        .addEventListener("click", async () => {
          const openTicketRes = await axios.post(
            `../api/School/TicketShouldBeOpened?ticketId=${this.state.id}`
          );
          if (openTicketRes.data === 1) {
            logify({ status: "wanrning" }, "درخواست بسته شدن تیکت رد شد.");
            const updatedTicketRes = await axios.get(
              `/api/School/GetTicketById?id=${this.state.id}`
            );
            if (updatedTicketRes.data) {
              await this.ticketListComponent.render(
                false,
                true,
                updatedTicketRes.data[0]
              );
            }
            await this.render(this.state.id, false, true, false);
          }
        });
    }

    if (isClose) {
      {
        this.chatArea
          .querySelectorAll("[data-ticket-satisfaction-button]")
          .forEach(async (el) => {
            el.addEventListener("click", async () => {
              let userChoice = el.dataset.ticketSatisfactionButton;
              const updateTicketRes = await axios.post(
                `../api/School/UpdTicket?id=${
                  ticketRef.id
                }&ticketStatusId=0&isUserSatisfied=${
                  userChoice == "accept" ? 1 : 0
                }`
              );
              // console.log(updateTicketRes);
              if (updateTicketRes.data === 1) {
                logify({}, "از اینکه در نظرسنجی شرکت نمودید متشکریم");
                const updatedTicketRes = await axios.get(
                  `/api/School/GetTicketById?id=${that.state.id}`
                );
                // console.log(updatedTicketRes);
                await that.ticketListComponent.render(
                  false,
                  true,
                  updatedTicketRes.data[0]
                );
                await that.render(that.state.id, false, true);
              }
            });
          });
      }
    }

    this.chatArea
      .querySelectorAll("[data-remove-ticket-reply]")
      .forEach((removeButton) => {
        removeButton.addEventListener("click", async () => {
          const id = _.toNumber(removeButton.dataset.removeTicketReply);
          //   console.log(this.state.ticketDetailList);
          let isLastMessage = false;
          // if (this.state.ticketDetailList.length === 1) {
          // برای نمایش انیمیشن حذف یک پیام رندر مجدد بعد از حذف پیام غیرفعال شده به همین دلیل تعداد پیام‌ها از روی دیتا تعداد درست پیام‌ها نمی‌باشد
          // برای تشخیص اینکه پیامی که حذف می‌شود آخرین پیام است یا نه باید تعداد المان‌های داخل ناحیه چت را شمرد.
          if (this.chatArea.childElementCount === 1) {
            isLastMessage = true;
          }
          if (isLastMessage) {
            const checkChatList = await this.fetchChatList(id);
            if (checkChatList.length > 1) {
              delete this.state.ticketDetailList;
              this.state.ticketDetailList = checkChatList.data;
              logify(
                { status: "danger" },
                "عدم امکان حذف تیکت به دلیل پیام حدید از سوی کارشناس"
              );
              this.render(id, false, false);
              return;
            }
          }
          const removeReplyRes = await axios.post(
            `../api/School/DelTicketDetail?ticketDetailId=${id}`
          );
          // console.log(removeReplyRes);
          if (removeReplyRes.data === 1) {
            let messageTopic = isLastMessage ? "تیکت" : "پیام";

            logify({}, `حذف ${messageTopic} با موفقیت انجام شد.`);
            if (isLastMessage) {
              this.toggler.classList.remove("chat-mode");
              this.ticketListComponent.render(true);
              return;
            }

            const mustRemoveMessage = removeButton.closest(".message");
            mustRemoveMessage.style =
              "--mh: " +
              mustRemoveMessage.getBoundingClientRect().height +
              "px";

            mustRemoveMessage.classList.remove("uk-animation-slide-bottom");
            await $_.pause(100);
            mustRemoveMessage.classList.add("terminate-message");
            await $_.pause(600);
            mustRemoveMessage.remove();

            // this.render(this.state.id, false, true);
          } else if (removeReplyRes.data === -1) {
            logify(
              { status: "warning" },
              "شما دسترسی لازم برای حذف پیام  را ندارید"
            );
          }
        });
      });

    this.chatArea
      .querySelectorAll("[data-is-useful-ticket-reply]")
      .forEach((likeButton) => {
        likeButton.addEventListener("click", async () => {
          const id = likeButton.dataset.isUsefulTicketReply;
          const isChecked = likeButton.checked;
          const setUsefullRes = await axios.post(
            `../api/School/UpdTicketDetail?ticketDetailId=${id}&isUseful=${isChecked}`
          );
        });
      });

    if (chatScroll) {
      this.chatArea.scrollTop = this.chatArea.scrollHeight;
    }

    if (lastChatAnimate) {
      document
        .querySelectorAll(".must-animate")[0]
        .classList.add("uk-animation-slide-bottom");
    }

    if (closeMessageAnimate) {
      document
        .querySelectorAll(".must-move")[0]
        .classList.add("uk-animation-slide-left-medium");
    }

    setTimeout(function () {
      const likeButtons = document.querySelectorAll(".like-button");

      likeButtons.forEach((elem) => {
        elem.classList.remove("remove-like-animation");
      });
    }, 3000);
  }

  setCloseModeStatus(status) {
    if (status) {
      this.closedTicketPrompt.removeAttribute("hidden");
    } else this.closedTicketPrompt.setAttribute("hidden", true);
  }

  setChatModeStatus(status) {
    if (status) {
      this.writeMessageArea.removeAttribute("hidden");
    } else {
      this.writeMessageArea.setAttribute("hidden", "true");
    }
  }

  handleFileUpload(event) {
    const files = Array.from(event.target.files);
    let logStatus = { size: false, len: false };

    // Validate files
    const validFiles = files.filter((file) => {
      if (file.size > 10000000) {
        if (logStatus.size === false) {
          logify(
            { status: "danger" },
            `فایل ${file.name} بیش از 10 مگابایت است.`
          );
          logStatus.size = true;
        }
        return false;
      }
      if (this.state.uploadedFiles.length >= 5) {
        if (logStatus.len === false) {
          logify(
            { status: "warning" },
            "حداکثر 5 فایل می‌توانید بارگذاری کنید."
          );
        }
        return false;
      }
      return true;
    });

    // Add valid files to state
    const uniqueFiles = new Set(
      this.state.uploadedFiles.map((file) => file.name)
    );
    this.state.uploadedFiles = [
      ...this.state.uploadedFiles,
      ...validFiles
        .filter((file) => !uniqueFiles.has(file.name))
        .slice(0, 5 - this.state.uploadedFiles.length),
    ];

    if (
      [...uniqueFiles].length + validFiles.length !==
      this.state.uploadedFiles.length
    ) {
      if ([...uniqueFiles].length + validFiles.length > 5)
        logify(
          { status: "warning" },
          `حداکثر 5 فایل در هر پیامم قابل ارسال است`
        );
      else {
        logify({ status: "danger" }, `نام فایل تکراری می باشد`);
        return;
      }
    }
    // Clear file input and re-render upload list
    this.fileUploader.value = null;
    this.renderUploadList();
  }

  handleFileRemove(event) {
    let element = event.target.closest("a");
    // Remove file from state
    this.state.uploadedFiles = this.state.uploadedFiles.filter(
      (file) => file.name !== element.dataset.removeNewTicketFileItem
    );

    // Re-render upload list
    this.renderUploadList();
  }

  renderUploadList() {
    this.uploadList.innerHTML = this.state.uploadedFiles
      .map(
        (file) => `
        <div class="attachment">
            <a data-remove-new-ticket-file-item="${file.name}" class="delete-attachment" uk-icon="icon: close; ratio: 0.7"></a>
            <span class="uploading-attachment" uk-spinner="ratio: 0.4"></span>
            <span class="file-name">${file.name}</span>
		</div>
       `
      )
      .join("");
  }

  async createTicket() {
    const description = this.chatTextArea.value.trim();

    if (!description) {
      logify({}, "لطفاً شرح درخواست خود را وارد کنید.");
      return;
    }

    const formData = new FormData();
    formData.append("ticketId", this.state.id);
    formData.append("supporterPersonRoleId", 0);
    formData.append("description", description);

    this.state.uploadedFiles.forEach((file) => formData.append("files", file));

    if (this.state.uploadedFiles.length > 0)
      this.uploadList
        .querySelectorAll("div.attachment")
        .forEach((el) => el.classList.add("uploading"));
    this.createTicketButton.setAttribute("hidden", true);
    this.fileUploader.setAttribute("disabled", "disabled");
    this.chatTextArea.setAttribute("disabled", "disabled");

    try {
      // API Call
      const response = await axios.post(
        "../api/School/InsTicketDetail",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === 1) {
        this.resetForm();
        this.render(this.state.id, true, true);
      } else if (response.data.status === 0) {
        logify({}, "مشکلاتی در ثبت تیکت به وجود آمده است.");
      } else if (response.data.status === -1) {
        logify({}, "مشکلاتی در آپلود فایلهای تیکت به وجود آمده است.");
      }
    } catch (error) {
      console.error("API Error:", error);
      logify({}, "خطایی در ارتباط با سرور رخ داد.");
    } finally {
      this.createTicketButton.removeAttribute("hidden");
      this.fileUploader.removeAttribute("disabled");
      this.chatTextArea.removeAttribute("disabled");
    }
  }

  resetForm() {
    this.chatTextArea.value = "";
    this.createTicketButton.removeAttribute("hidden");
    delete this.state.uploadedFiles;
    this.state.uploadedFiles = [];
    this.renderUploadList();
  }
};

export default TicketChat;
