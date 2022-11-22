import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Blog from '../../blog/blog';
import { getComment } from '../../../axios/api';
let curPage = 1;
let prePage = 0;
let fetchDone = true;

export default function AllComment() {
    const {
        state: { uid, mid, urls, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name }
    } = useLocation();
    let [winHeight] = useState(window.innerHeight);
    let [comment, setComment] = useState([]);
    let [beforeTop, setBeforeTop] = useState(0);

    async function fetchComment(page) {
        const response = await getComment(uid, mid, page);
        fetchDone = true;
        prePage = page;
        if (response.length === 0) {
            return;
        }
        curPage = page + 1;
        setComment(comment => {
            return [...comment, ...response];
        });
        // getWidth();
    }

    function callback(e) {
        let currentTop = e.target.scrollTop;
        if (currentTop <= beforeTop) {
            // 向上滚动
            setBeforeTop(currentTop);
            return;
        }
        setBeforeTop(currentTop);
        if (e.target.scrollHeight - currentTop <= winHeight + 1000 && fetchDone && curPage !== prePage) {
            fetchDone = false;
            fetchComment(curPage);
        }
    }

    useEffect(() => {
        fetchComment(curPage);
        document.querySelector('.app').addEventListener('scroll', callback);
        return () => {};
    }, []);

    return (
        <>
            {curPage}
            <Blog
                key={mid}
                mid={mid}
                uid='1858065064'
                urls={urls}
                text={text}
                reposts_count={reposts_count}
                comments_count={comments_count}
                attitudes_count={attitudes_count}
                source={source}
                created_at={created_at}
                region_name={region_name}
                isAllCommt
                allCommtData={comment}
            ></Blog>
        </>
    );
}
