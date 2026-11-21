import * as axios from 'axios';
export default function (media) {
    const Endpoint = '/api/MyMeraat/'
    return new Promise(async (resolve, reject) => {
        try {
            //const { data } = await axios.get('http://foo.bar/')
            let query = Endpoint + "GetVideoFileAddress" + `?mediaId=${media.id}&hashedCode=${media.hash}`;
            //console.log(query)
            const { data } =  await axios.get(query)//await(async () =>
           
            resolve(data);//url);
        } catch (error) {
            console.log(Object.keys(error), error.message);
        }
    
    })
};