import axios from "axios";
export default (apis) => {
  return async function (type, name, parameters) {
    let isPostOperation = false;
    var query = "";
    let Api = {};
    if (apis[type] && apis[type] !== undefined)
      if (apis[type][name] && apis[type][name] !== undefined) {
        Api = apis[type][name];
        query = Api.url;
        if (Api.method && Api.method === "post") isPostOperation = true;
      }
    if (parameters) {
      query += "?";
      Object.keys(parameters).forEach((key) => {
        query += `${key}=${parameters[key]}&`;
      });
      query = query.slice(0, -1);
    }
    //console.log(query);
    try {
      //debugger
      const resault = await axios[isPostOperation ? "post" : "get"](query)
        .then((response) => {
          return response.data;
        })
        .catch((err) => console.log(err));
      //console.log(resault);
      return resault;
    } catch (err) {
      console.log(err);
      return false;
    }
  };
};
