import request from './axios';

export function getblog(page) {
    return new Promise(async (resolve, reject) => {
        try {
            let res = await request({
                url: `/getblog?page=${page}`,
                method: 'get'
            });
            resolve(res.data.err || res.data.data);
        } catch (e) {
            reject(e.message);
        }
    });
}
