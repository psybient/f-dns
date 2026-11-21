import { ls } from "./localStorage";
let stack = [];
//ls.clear(); // development only
let state = {
  visited: ls.get("visited") || [],
  user: "",
  introPlayCount: ls.get("introPlayCount") || 0,
  activeTab: ls.get("activeTab"),
  repeatedPhoneVerificationNo: ls.get("repeatedPhoneVerificationNo"),
};

export const getState = () => {
  //console.log(JSON.stringify(state));
  return state;
};

export const setState = (nextState) => {
  state = nextState;
};
