import request from './axios';

export async function getblog() {
    let res = await request({
        url: '/getblog',
        method: 'get'
    });
    return new Promise((resolve, reject) => {
        resolve(res.data.data);
    });
}
