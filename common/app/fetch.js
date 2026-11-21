import { LoadApiData, PutApiData } from '../callApi';
let bodyFormData = new FormData();
bodyFormData.append('personRoleId', '');
export const appFetch = (url, args) => {
    var query = url || '';
    let argsCount = args && args["length"];
    if (argsCount) {
        query += '?';
        args.map(v => {
            query += v.name.trim() + "=" + JSON.stringify(v.value).trim() + "&"
        });
        //query = query.split(" ").join("");
        [...query].pop();
        //console.log(query); // This logs all api addresses
    }
    //should remove & sigh at the end
    //console.log(query);
    if (query.length > 0)
        return new Promise(async function (resolve) {
            try {
                const result = await LoadApiData(query, bodyFormData);
                //console.log(result); // this logs all returned data from apis
                resolve(result);
            } catch (err) { console.log(err) }
        });
    else
        return false;
};