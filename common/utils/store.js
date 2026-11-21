//let hljs = require('highlight.js');
import { startsWith } from 'lodash';

export const store = (function () {
    let prefix = "meraat-report-app";
  return {
   
    clear: () => localStorage.clear(prefix),
    clearKeys: () => {
      for (let key in localStorage) 
        if (startsWith(key, prefix)) {
          //console.log(key);//
          delete localStorage[key]
        }
      },
      get: (object = localStorage, key) => {
        const item = object[key]; //localStorage.getItem("st_db")//
        return item ? JSON.parse(item) : undefined;
      },
        set: (key, value) => {
          localStorage.setItem(key, JSON.stringify(value));
        },
          display: (object = localStorage) => {
          
            const renderedObject = {};
            const keys = Object.keys(object);
            keys.map(item => (renderedObject[item] = store.get(object, item)));
            console.log(JSON.stringify(renderedObject, null, '  '));
            
          },
  };
  }) ();
