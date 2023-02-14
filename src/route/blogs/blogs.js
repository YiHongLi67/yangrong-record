import React, { useEffect, useState } from 'react';
import Blog from '../../components/blog/blog';
import { Radio } from 'antd';
import { getMobileFont } from '../../static/utils/utils';
import { getblog } from '../../axios/api';
import { _throttle } from '../../static/utils/utils';
import { subscribe, unsubscribe } from 'pubsub-js';
import { PreMid } from '../../context/context';

let beforeTop = 0;
let fetchDone = true;
let sinceId = '';
let preId = null;
const winHeight = window.innerHeight;
let blogsRefreshId;

export default function Blogs() {
    let [blogsData, setBlogsData] = useState([]);
    const [premid, setPremid] = useState('');

    function changePremid(premid) {
        setPremid(premid);
    }

    useEffect(() => {
        document.addEventListener('scroll', _throttle(blogScroll, 200, { begin: true, end: true }));
        blogsRefreshId = subscribe('blogsRefresh', () => {
            blogsRefresh();
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
        if (window.location.pathname === '/') {
            fetchBlog(sinceId);
        }
        return () => {
            unsubscribe(blogsRefreshId);
        };
    }, []);

    async function fetchBlog(since_id) {
        const isRefresh = sinceId === '';
        let response = await getblog({ sinceId: since_id });
        fetchDone = true;
        preId = since_id;
        setBlogsData(blogsData => {
            if (isRefresh) {
                return [...response];
            } else {
                return [...blogsData, ...response];
            }
        });
        if (response.length === 0) {
            return;
        }
        sinceId = response[response.length - 1].mid;
    }

    function blogsRefresh() {
        fetchDone = true;
        preId = null;
        sinceId = '';
        fetchBlog(sinceId);
    }

    function blogScroll(e) {
        let currentTop = document.documentElement.scrollTop || document.body.scrollTop;
        if (window.location.pathname === '/') {
            if (currentTop <= beforeTop) {
                // 向上滚动
                beforeTop = currentTop;
                return;
            }
            beforeTop = currentTop;
            if (e.target.documentElement.scrollHeight - currentTop <= winHeight + 100 && fetchDone && sinceId !== preId) {
                fetchDone = false;
                fetchBlog(sinceId);
            }
        }
    }

    function changeFontSize(e) {
        window.fontSize = e.target.value;
    }

    return (
        <PreMid.Provider value={{ premid, changePremid }}>
            <Radio.Group name='radiogroup' defaultValue={window.fontSize} size='large' onChange={changeFontSize}>
                <Radio value={14} className={getMobileFont('radio')}>
                    14
                </Radio>
                <Radio value={16} className={getMobileFont('radio')}>
                    16
                </Radio>
                <Radio value={18} className={getMobileFont('radio')}>
                    18
                </Radio>
                <Radio value={20} className={getMobileFont('radio')}>
                    20
                </Radio>
                <Radio value={24} className={getMobileFont('radio')}>
                    24
                </Radio>
                <Radio value={30} className={getMobileFont('radio')}>
                    30
                </Radio>
            </Radio.Group>
            {blogsData.map(blogData => {
                const { mid, pic_ids, pic_num, pic_infos, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } =
                    blogData;
                return (
                    <Blog
                        key={mid}
                        mid={mid}
                        uid='1858065064'
                        // uid='6330711166'
                        pic_ids={pic_ids}
                        pic_num={pic_num}
                        pic_infos={pic_infos}
                        text={text}
                        reposts_count={reposts_count}
                        comments_count={comments_count}
                        attitudes_count={attitudes_count}
                        source={source}
                        created_at={created_at}
                        region_name={region_name}
                    ></Blog>
                );
            })}
        </PreMid.Provider>
    );
}
