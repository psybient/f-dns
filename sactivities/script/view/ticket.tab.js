import axios from "axios";
// import { logify } from "../../../common/utils/ukHelper";
import _ from "lodash";
import NewTicketForm from "../components/Tickets/newTicketForm";
import TicketList from "../components/Tickets/ticketList";
import TicketChat from "../components/Tickets/ticketChat";

const TicketTab = class {
  constructor(props) {
    this.state = {
      // uploadedFiles: [], // Track uploaded files
      ticketTopics: null,
    };
    this.ticketListComponent = null;
    this.newTicketForm = null;
    this.toggler = null;
    this.ticketChatComponent = null;
    this.promiseReady = this.init();
  }

  async ready() {
    return this.promiseReady;
  }

  async init() {
    const { data } = await axios.get(`../api/School/SelTicketTopic`);
    this.state.ticketTopics = data;
    this.toggler = document.getElementById("tickets_wrapper");

    this.ticketChatComponent = await new TicketChat({
      toggler: this.toggler,
    }).ready();

    this.ticketListComponent = await new TicketList({
      toggler: this.toggler,
      ticketChat: this.ticketChatComponent,
    }).ready();

    this.newTicketForm = await new NewTicketForm({
      ticketTopics: data,
      toggler: this.toggler,
      chatComponent: this.ticketChatComponent,
      ticketList: this.ticketListComponent,
    }).ready();

    this.ticketListComponent.render();

    document
      .getElementById("goto_new_ticket_tab")
      .addEventListener("click", (e) => {
        e.preventDefault();
        if (this.toggler.classList.contains("chat-mode")) {
          this.toggler.classList.remove("chat-mode");
        }
        this.toggler.classList.add("new-ticket-mode");
      });

    document
      .getElementById("back_to_tickets_list")
      .addEventListener("click", (e) => {
        e.preventDefault();
        if (this.toggler.classList.contains("new-ticket-mode")) {
          this.toggler.classList.remove("new-ticket-mode");
        }
        if (this.toggler.classList.contains("chat-mode"))
          this.toggler.classList.remove("chat-mode");
      });

    return this;
  }
};

export default TicketTab;
