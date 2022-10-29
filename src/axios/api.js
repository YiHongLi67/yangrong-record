import request from './axios';

export function getblog() {
    return new Promise(async (resolve, reject) => {
        try {
            let res = await request({
                url: '/getblog',
                method: 'get'
            });
            resolve(res.data.err || res.data.data);
        } catch (e) {
            reject(e.message);
        }
    });
}
