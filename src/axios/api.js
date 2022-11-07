import request from './axios';

export function getblog(sinceId) {
    let url;
    if (sinceId) {
        url = `/getblog?sinceId=${sinceId}`;
    } else {
        url = '/getblog';
    }
    return new Promise(async (resolve, reject) => {
        try {
            let res = await request({
                url,
                method: 'get'
            });
            resolve(res.data.err || res.data.data);
        } catch (e) {
            reject(e.message);
        }
    });
}
