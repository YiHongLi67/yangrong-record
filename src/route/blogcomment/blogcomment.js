import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Blog from '../../components/blog/blog';
import { getComment } from '../../axios/api';
import { _throttle } from '../../static/utils/utils';
import './blogcomment.css';
import { publish, subscribe, unsubscribe } from 'pubsub-js';

const winHeight = window.innerHeight;
let curPage = 1;
let prePage = 0;
let fetchDone = true;
let beforeTop = 0;
let blogCommtRefreshId;

export default function BlogComment(props) {
    const { pathName } = props;
    const {
        state: {
            blogData: { uid, mid, urls, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name },
            scrollTop
        }
    } = useLocation();
    let [comment, setComment] = useState([]);
    let [display, setDisplay] = useState('none');
    const navigate = useNavigate();

    useEffect(() => {
        document.onscroll = null;
        // allcomment 添加 scroll 事件
        document.onscroll = _throttle(appScroll, 200);
        fetchComment(curPage);
        blogCommtRefreshId = subscribe('blogCommtRefresh', _ => {
            curPage = 1;
            prePage = 0;
            setComment([]);
            fetchComment(curPage);
        });
        return () => {
            // 路由切换 组件卸载 reset 参数
            curPage = 1;
            prePage = 0;
            publish('toBlogs', { scrollTop });
            unsubscribe(blogCommtRefreshId);
        };
    }, []);

    async function fetchComment(page) {
        // comment 页面获取一级评论
        const response = await getComment(uid, mid, page);
        fetchDone = true;
        prePage = page;
        if (response.data.length > 0) {
            setComment(comment => {
                return [...comment, ...response.data];
            });
        }
        if (response.isEnd) {
            setDisplay('block');
            return;
        }
        curPage = page + 1;
    }

    function appScroll(e) {
        let currentTop = e.target.documentElement.scrollTop;
        if (currentTop <= beforeTop) {
            // 向上滚动
            beforeTop = currentTop;
            return;
        }
        beforeTop = currentTop;
        if (e.target.documentElement.scrollHeight - currentTop <= winHeight + 500 && fetchDone && curPage !== prePage) {
            fetchDone = false;
            fetchComment(curPage);
        }
    }

    function toBlogs(e) {
        if (e.target.className.indexOf('back') !== -1) {
            return;
        }
        navigate(`/`, {
            state: {}
        });
    }

    return (
        <>
            <div className='back font-18 w-main line-38 fixed w-full' onClick={toBlogs}>
                <span className='iconfont icon-arrow-left-bold font-20 pointer'></span>
                <span className='pointer weight-600'>返回</span>
            </div>
            <Blog
                className='all-comment'
                pathName={pathName}
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
            <div className='end align-center font-12 padding-t-6 padding-b-6 margin-t-4 margin-b-4 w-sub' style={{ display }}>
                <span>评论已经到底了~</span>
            </div>
        </>
    );
}
