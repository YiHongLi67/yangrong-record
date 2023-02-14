import request from './axios';

export function getblog(params) {
    const { sinceId, mid } = params;
    let url;
    if (mid) {
        url = `/getblog?mid=${mid}`;
    } else if (sinceId) {
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
        if (!mid || !rootid || !page) throw new Error('params of (mid, rootid, page) is required');
        url = `/getcomment?mid=${mid}&rootid=${rootid}&page=${page}`;
    } else {
        if (page) {
            if (!uid || !mid || !page) throw new Error('params of (uid, mid, page) is required');
            url = `/getcomment?uid=${uid}&mid=${mid}&page=${page}`;
        } else {
            if (!uid || !mid) throw new Error('params of (uid, mid) is required');
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
