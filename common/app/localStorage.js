//let hljs = require('highlight.js');
//import { startsWith } from 'lodash';
const prefix = "meraat-web-app";
export const ls = (function () {
  return {
    clear: () => localStorage.clear(prefix),
    get: (prop, key = prefix) => {
      if (prop) {
        const item = localStorage.getItem(key); // //object[key];
        //console.log(JSON.parse(item))
        return item ? JSON.parse(item)[prop] : undefined;
      } else return JSON.parse(localStorage.getItem(key));
    },
    set: (value) => {
      //console.log(value)
      localStorage.setItem(prefix, JSON.stringify(value));
    },
    getStorage() {
      const item = localStorage.getItem(prefix);
      //console.log((item))
      return item ? JSON.parse(item) : {};
    },
  };
})();
