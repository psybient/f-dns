import * as axios from 'axios';
export default function (id) {
    return new Promise((resolve, reject) => {
        var bodyFormData = new FormData();
        bodyFormData.append('testNo', id);
        axios({
            method: 'POST',
            url: `/api/MyMeraat/GetAnswerSheetImage`,
            responseType: 'blob',
            data: bodyFormData,
            //timeout: 30000,
            config: { headers: { 'Content-Type': 'multipart/form-data' } }
        })
            .then((response) => {
                if (!response.data) {
                    reject("No Image Found");
                    //throw "No Image Found";
                }
                else {
                    let result = response.data;
                    //console.log(result.data)
                    const url = window.URL.createObjectURL(new Blob([result]));
                    resolve(url);
                }
            })
            .catch(err => console.log(err))
    })
};
