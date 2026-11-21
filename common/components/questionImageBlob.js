import * as axios from 'axios';
export default function (id, part = 0, type = "blob") { //type= 'blob' || 'file'
    return new Promise(async (resolve, reject) => {
        var bodyFormData = new FormData();
        bodyFormData.append('dataId', id);
        bodyFormData.append('qContentType', part);
        //let result =  //LoadApiBlobData('/api/Content/downloadQuestionImages', bodyFormData);
        try {
            //const { data } = await axios.get('http://foo.bar/')
            const { data } = await (async () =>
                 axios({
                    method: 'POST',
                    //url: '/api/MyMeraat/downloadQuestionImages',
                    url: `../api/MyMeraat/GetQuestionAddress`,
                    data: bodyFormData,
                    //responseType: 'blob',
                    config: { headers: { 'Content-Type': 'multipart/form-data' } }
                }))().catch((error) => {
                    console.log(Object.keys(error), error.message);
                    reject('IMAGES NOT AVALABLE LOCALLY');
                    throw new Error('IMAGES NOT AVALABLE LOCALLY');
                });
           
            // if (!data) {
            //     reject('IMAGES NOT AVALABLE LOCALLY');
            //     throw new Error('IMAGES NOT AVALABLE LOCALLY');
            // }

            //console.log(data)
            //let url = window.URL.createObjectURL(new Blob([data]));
            resolve(data);//url);
        } catch (error) {
            console.log(Object.keys(error), error.message);
        }

    })
};
