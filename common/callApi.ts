var axios = require('axios');
import { mNotification } from './notifyMessage';

export async function LoadApiData(ApiUrl, bodyFormData) {
    var result = [];
    await axios({
        method: 'post',
        url: ApiUrl,
        data: bodyFormData,
        config: { headers: { 'Content-Type': 'multipart/form-data' } }
    })
        .then((response) => {
            result = response.data;
        })
        .catch(function (response) {
            //console.log(response.message)
            if (response.response.status == 403)
                mNotification('danger', 'ban', 'دسترسی محدود شده است!');
            else if (response.response.status == 401)
                mNotification('danger', 'ban', 'دسترسی برای کاربران سیستم');
        });

    return result
}

export async function LoadApiBlobData(ApiUrl, bodyFormData) {
    var result = [];
    await axios({
        method: 'post',
        url: ApiUrl,
        data: bodyFormData,
        responseType: 'blob',
        config: { headers: { 'Content-Type': 'multipart/form-data' } }
    })
        .then((response) => {
            result = response.data;
        })
        .catch(function (response) {
            if (response.response.status == 403)
                mNotification('danger', 'ban', 'دسترسی محدود شده است!');
            else if (response.response.status == 401)
                mNotification('danger', 'ban', 'دسترسی برای کاربران سیستم');
        });

    return result
}

export async function PutApiData(ApiUrl, bodyFormData, config) {
    var result = [];
    await axios.put(ApiUrl, bodyFormData, config)
        .then(function (res) {
            result = res.data
        })
        .catch(function (err) {
            if (err.response.status == 403)
                mNotification('danger', 'ban', 'دسترسی محدود شده است!');
            else if (err.response.status == 401)
                mNotification('danger', 'ban', 'دسترسی برای کاربران سیستم');
        });
    return result;
}

export function httpRequestErrorHandler(err) {
    if (err.response.status == 403)
        mNotification('danger', 'ban', 'دسترسی محدود شده است!');
    else if (err.response.status == 401)
        mNotification('danger', 'ban', 'دسترسی برای کاربران سیستم');
    else
        return err;
}

export async function axiosMultiFetch(ArrayOfPathsToAPIcall){
      const [kData,filterList] = await axios.all([
        axios.get('api/MyMeraat/LoadKarpoosheDataCollection'),
        axios.get('/api/MyMeraat/LoadLessonWithNoContent')
      ]).catch(err=>httpRequestErrorHandler(err))

      .then(axios.spread((kData, filteList) => {
        //do something with both responses
     }))
}
