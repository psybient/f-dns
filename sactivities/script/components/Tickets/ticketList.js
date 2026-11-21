import axios from "axios";
// import { logify } from "../../../common/utils/ukHelper";
import _ from "lodash";
import { $_ } from "../../../../common/utils/create.dom";
const TicketList = class {
  constructor(props) {
    this.state = {
      // uploadedFiles: [], // Track uploaded files
      // ticketTopics: null,
      searchPhrase: "",
      searchAttribute: "",
      ticketList: [],
      selectedTicketId: 0,
    };
    this.ticketChat = props.ticketChat;
    this.toggler = props.toggler;
    this.wrapper = null;
    this.filterTicketListSelect = null;
    this.filterTicketListInput = null;
    this.refreshTicketList = null;
    this.promiseReady = this.init();
  }

  async ready() {
    return this.promiseReady;
  }

  async fetchTicketList(count = 0, statusId = 0, topicId = 0) {
    const { data } = await axios.get(
      `../api/School/GetTicket?topCount=${count}&ticketStatusId=${statusId}&topicId=${topicId}`
    );
    // console.log(data);
    return data;
  }

  async init() {
    this.state.ticketList = await this.fetchTicketList();
    this.wrapper = document.getElementById("ticket_list_content_wrapper");
    this.filterTicketListSelect = document.getElementById(
      "filter_ticket_list_select"
    );
    this.filterTicketListInput = document.getElementById(
      "filter_ticket_list_input"
    );
    this.refreshTicketList = document.getElementById(
      "refresh_ticket_list_button"
    );

    this.refreshTicketList.addEventListener("click", async () => {
      // delete this.state.filteredTickets;
      // this.state.filteredTickets = [];
      await this.render(true);
      // this.renderListBody();
      if (this.state.selectedTicketId > 0) {
        this.ticketChat.render(this.state.selectedTicketId);
      }
    });

    this.filterTicketListSelect.addEventListener("change", (e) => {
      let selected = $_.getSelectedOption(this.filterTicketListSelect);
      this.state.searchAttribute = selected.value;
      this.render();
    });

    this.filterTicketListInput.addEventListener("keyup", (e) => {
      this.state.searchPhrase = this.filterTicketListInput.value;
      this.render();
    });

    this.ticketChat.setTicketListComponentRef(this);
    return this;
  }

  setActiveTicket(id) {
    this.state.selectedTicketId = id;
  }

  async render(hard = false, hasChange = false, changedObj = {}) {
    if (hard) {
      delete this.state.ticketList;
      this.state.ticketList = await this.fetchTicketList();
    } else if (hasChange) {
      let index = 0;
      this.state.ticketList.filter((t, i) => {
        if (t.id === changedObj.id) {
          index = i;
          return t;
        }
      });

      this.state.ticketList[index] = changedObj;
      // this.state.filteredTickets[f_index] = changedObj;
    }

    const that = this;
    $_.removeElementChildNodes(this.wrapper);
    const filteredList = [];
    if (this.state.searchAttribute !== "") {
      this.state.ticketList.forEach((ticket) => {
        if (ticket.statusCaption === this.state.searchAttribute)
          filteredList.push(ticket);
      });
    } else {
      this.state.ticketList.forEach((ticket) => {
        filteredList.push(ticket);
      });
    }

    const finalList = [];
    // console.log(filteredList);
    if (this.state.searchPhrase !== "") {
      filteredList.forEach((ticket) => {
        if (
          ticket.subject.search(this.state.searchPhrase) > -1 ||
          ticket.id.toString().search(this.state.searchPhrase) > -1
        )
          finalList.push(ticket);
      });
    } else
      filteredList.forEach((ticket) => {
        finalList.push(ticket);
      });

    const headerMarkup = `
         <div class="list-header">
									<div class="cell cell-1">موضوع</div>
									<div class="cell cell-2">شناسه</div>
									<div class="cell cell-3">وضعیت</div>
									<div class="cell cell-4">آخرین بروزرسانی</div>
									<div class="cell cell-5"></div>
								</div>`;

    if (finalList.length === 0) {
      this.wrapper.innerHTML = `
         ${headerMarkup}
        <div class="no-ticket"><span>تیکتی جهت نمایش وجود ندارد.</span></div>`;
      return;
    }

    this.wrapper.innerHTML = `
                                ${headerMarkup}
                                ${finalList
                                  .map(
                                    (item, i) => `<div style="${
                                      !item.attention ||
                                      (item.statusCaption == "بسته" &&
                                        item.isUserSatisfied == null)
                                        ? "background-color: #f7fcfd"
                                        : ""
                                    }" data-ticket-list-id="${
                                      item.id
                                    }" class="list-content ${
                                      (this.state.selectedTicketId === 0 &&
                                        i === 0) ||
                                      this.state.selectedTicketId === item.id
                                        ? "selected-ticket"
                                        : ""
                                    }">
                    ${
                      !item.attention ||
                      (item.statusCaption == "بسته" &&
                        item.isUserSatisfied == null)
                        ? '<span class="attention" uk-icon="commenting"></span>'
                        : ""
                    }
                    <div class="cell cell-1">${item.subject}</div>
										<div class="cell cell-2">${item.fakeId}</div>
										<div class="cell cell-3">${item.statusCaption}</div>
										<div class="cell cell-4">
                          <span>${item.persianInsDate}</span>
                          <span>${item.solarInsDate}</span>
                          <span>${item.hoursAndMinutes}</span>
                    </div>

										<div class="cell cell-5">
											<span class="${
                        item.isUserSatisfied == null
                          ? ""
                          : item.isUserSatisfied
                          ? "like"
                          : "dislike"
                      }"></span>
										</div>
									</div>`
                                  )
                                  .join("")}`;

    const ticketListNodes = this.wrapper.querySelectorAll(
      "[data-ticket-list-id]"
    );
    ticketListNodes.forEach((div) => {
      div.addEventListener("click", async () => {
        let id = div.dataset.ticketListId;
        this.state.selectedTicketId = _.toNumber(id);
        let hasChange = await this.updateTicketItem(
          this.state.selectedTicketId
        );
        if (hasChange) {
          await that.render();
        }

        ticketListNodes.forEach((tElement) =>
          tElement.classList.remove("selected-ticket")
        );
        div.classList.add("selected-ticket");

        setTimeout(() => {
          div.scrollIntoView({ block: "center" });
        }, 100);

        await that.ticketChat.render(id, false, this, false);
        if (that.toggler.classList.contains("new-ticket-mode"))
          that.toggler.classList.remove("new-ticket-mode");
        that.toggler.classList.add("chat-mode");
      });
    });
  }

  async updateTicketItem(id, changedObject = null) {
    let ticketItem = changedObject;
    let index = 0;
    const refItem = this.state.ticketList.filter((item, i) => {
      if (item.id === id) {
        index = i;
        return item;
      }
    })[0];

    if (ticketItem == null) {
      const res = await axios.get(`../api/School/GetTicketById?id=${id}`);
      // console.log(res);
      ticketItem = res.data[0];
    }
    // console.log(refItem);
    let hasChange = false;
    for (let key of Object.keys(refItem)) {
      // console.log({ ref: refItem[key], main: ticketItem[key] });
      if (refItem[key] !== ticketItem[key]) {
        hasChange = true;
        break;
      }
    }
    if (hasChange) {
      this.state.ticketList[index] = ticketItem;
    }
    return hasChange;
  }
};

export default TicketList;
