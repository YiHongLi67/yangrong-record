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

export function getComment(uid, mid, page, rootid) {
    let url;
    if (rootid) {
        url = `/getcomment?mid=${mid}&rootid=${rootid}&page=${page}`;
    } else {
        if (page) {
            url = `/getcomment?uid=${uid}&mid=${mid}&page=${page}`;
        } else {
            url = `/getcomment?uid=${uid}&mid=${mid}`;
        }
    }
    return new Promise(async (resolve, reject) => {
        try {
            let res = await request({
                url,
                method: 'get'
            });
            resolve(res.data.err || res.data);
        } catch (e) {
            reject(e.message);
        }
    });
}
