//https://github.com/GoogleChrome/proxy-polyfill
import _ from "lodash";
export const ProxyHelper = (function () {
  // internal state for #inputname field
  const User = {
    id: "", //inputname
    name: "",
  };

  const LoginUser = {
    //form: '',
    email: "",
    userName: "",
    password: "",
  };

  // bind input to object
  const inputNamedChange = function (obj) {
    if (!obj) return; // || !myObject.id || !myObject.name) return;
    Object.keys(obj).forEach((key) => {
      const input = document.getElementsByName(key)[0];
      // if (input) console.log(input.value);
      if (input)
        input.addEventListener("input", function (e) {
          if (input.getAttribute("data-type") === "number")
            obj[key] = _.toNumber(input.value);
          else obj[key] = input.value;
          //console.log(obj);
        });
    });
  };

  //--------------------------------------------------------------------------

  // bind input to object
  const inputChange = function (myObject) {
    if (!myObject || !myObject.id) return;

    const input = document.getElementById(myObject.id);
    if (input)
      input.addEventListener("input", function (e) {
        myObject.name = input.value;
        console.log(myObject.name);
      });
  };

  // proxy handler
  const inputHandler = {
    set: function (target, prop, newValue) {
      if (prop == "name" && target.id) {
        // update object property
        target[prop] = newValue;
        console.log(`Setting ${prop} from ${target[prop]} to ${newValue}`);
        // update input field value
        const input = document.getElementById(target.id);
        if (input) input.value = newValue;
        return true;
      } else return false;
    },
  };

  //--------------------------------------------------------------------------

  // create a profiling Proxy
  function makeProfiler(target) {
    const count = {},
      handler = {
        get: function (target, name) {
          if (name in target) {
            count[name] = (count[name] || 0) + 1;
            return target[name];
          }
        },
      };

    return {
      proxy: new Proxy(target, handler),
      count: count,
    };
  }

  //--------------------------------------------------------------------------

  // state handler object
  const stateHandler = {
    get(target, property, receiver) {
      console.log(`GET ${property}`);
      if (property in target) {
        return target[property];
      }
      return target; //'Oops! This property does not exist.';
    },
  };

  //--------------------------------------------------------------------------

  const onChange = (objToWatch, onChangeFunction) => {
    const handler = {
      get(target, property, receiver) {
        onChangeFunction();
        const value = Reflect.get(target, property, receiver);
        if (typeof value === "object") {
          return new Proxy(value, handler);
        }
        return value;
      },
      set(target, property, value, receiver) {
        onChangeFunction();
        console.log(`stateChange: ${property}: ${value}`);
        return Reflect.set(target, property, value);
      },
    };
    return new Proxy(objToWatch, handler);
  };

  //--------------------------------------------------------------------------

  function EnhanceGet(obj) {
    return new Proxy(obj, {
      get(target, prop, receiver) {
        if (target.hasOwnProperty(prop)) {
          return target[prop];
        }
        let regExp = /([a-z0-9]+)InUpperCase/gi;
        let propMatched = regExp.exec(prop);

        if (propMatched) {
          return target[propMatched[1]].toUpperCase();
        }

        let ANDRegExp = /([a-z0-9]+)And([a-z0-9]+)/gi;
        let propsMatched = ANDRegExp.exec(prop);
        if (propsMatched) {
          return [target[propsMatched[1]], target[propsMatched[2]]].join(" ");
        }
        return "not found";
      },
    });
  }

  function makeSimpleProfiler(target) {
    var count = Object.create(null);
    return {
      proxy: new Proxy(target, {
        get: function (target, name) {
          count[name] = (count[name] || 0) + 1;
          return Reflect.get(target, name);
        },
      }),
      get stats() {
        return count;
      },
    };
  }

  return {
    inputChange: inputChange,
    inputHandler: inputHandler,
    makeProfiler: makeProfiler,
    inputNamedChange: inputNamedChange,
    stateHandler: stateHandler,
    onChange: onChange,
    EnhanceGet: EnhanceGet,
    makeSimpleProfiler: makeSimpleProfiler,
    user: User,
    loginUser: LoginUser,
  };
  // create proxy
})();
