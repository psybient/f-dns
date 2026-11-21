import { startsWith } from 'lodash';

export const ls = (function () {
  return {
    prefix: () => "reg_tbl_",
    clear: () => localStorage.clear(),
    clearKeys: () => {
      for (let key in localStorage)
        if (startsWith(key, ls.prefix())) {
          delete localStorage[key]
        }
    },
    get: (object = localStorage, key) => {
      const item = object[key];
      return item ? JSON.parse(item) : undefined;
    },
    set: (key, value, param) => {
      if (!param)
         localStorage.setItem(key, JSON.stringify(value));
      else {
        const curr = localStorage[key] ?  JSON.parse(localStorage[key]) : {};
          curr[param] = value;
          localStorage.setItem(key, JSON.stringify(curr))
      }
    },
  };
})();
