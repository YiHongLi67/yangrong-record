import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Blog from '../../components/blog/blog';
import { getComment } from '../../axios/api';
import { _throttle } from '../../static/utils/utils';
import './blogcomment.css';
import { subscribe, unsubscribe } from 'pubsub-js';

const winHeight = window.innerHeight;
let curPage = 1;
let prePage = 0;
let fetchDone = true;
let beforeTop = 0;
let blogCommtRefreshId;
let scrollTop, blogData;

function BlogComment() {
    let { state } = useLocation();
    const [_blogData] = useState(state && state.blogData);
    const [_scrollTop] = useState(state && state.scrollTop);
    let [allCommt, setAllCommt] = useState([]);
    let [display, setDisplay] = useState('none');
    const navigate = useNavigate();
    const { uid, mid, pic_ids, pic_num, pic_infos, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } =
        blogData || _blogData;

    useEffect(() => {
        scrollTop = _scrollTop;
        blogData = { ..._blogData };
        // allcomment 添加 scroll 事件
        document.addEventListener('scroll', _throttle(appScroll, 200, { before: true, end: true }));
        fetchComment(curPage);
        blogCommtRefreshId = subscribe('blogCommtRefresh', _ => {
            curPage = 1;
            prePage = 0;
            setAllCommt([]);
            fetchComment(curPage);
        });
        return () => {
            // 路由切换 组件卸载 reset 参数
            curPage = 1;
            prePage = 0;
            unsubscribe(blogCommtRefreshId);
        };
    }, []);

    async function fetchComment(page) {
        // comment 页面获取一级评论
        const response = await getComment(uid, mid, page);
        fetchDone = true;
        prePage = page;
        if (response.data.length > 0) {
            setAllCommt(allCommt => {
                return [...allCommt, ...response.data];
            });
        }
        if (response.isEnd) {
            setDisplay('block');
            return;
        }
        curPage = page + 1;
    }

    function appScroll(e) {
        if (window.location.pathname === '/comment') {
            let currentTop = document.documentElement.scrollTop || document.body.scrollTop;
            if (currentTop <= beforeTop) {
                // 向上滚动
                beforeTop = currentTop;
                return;
            }
            beforeTop = currentTop;
            if (e.target.documentElement.scrollHeight - currentTop <= winHeight + 100 && fetchDone && curPage !== prePage) {
                fetchDone = false;
                fetchComment(curPage);
            }
        }
    }

    function toBlogs(e) {
        if (e.target.className.indexOf('back') !== -1) {
            return;
        }
        navigate(`/`, {
            state: {}
        });
        // 手机端 QQ/微信/QQ浏览器 获取到的 document.documentElement.scrollTop始终为 0
        document.body.scrollTop = scrollTop;
        document.documentElement.scrollTop = scrollTop;
    }

    return (
        <>
            <div className='back font-18 w-main line-24 fixed w-full vertical-m clear' onClick={toBlogs}>
                <span className='iconfont icon-arrow-left-bold font-20 pointer float-l'></span>
                <span className='pointer weight-600 float-l'>返回</span>
            </div>
            <Blog
                className='all-comment'
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
                isAllCommt
                allCommt={allCommt}
            />
            <div className='end align-center font-12 padding-t-6 padding-b-6 margin-t-4 margin-b-4 w-sub' style={{ display }}>
                <span>评论已经到底了~</span>
            </div>
        </>
    );
}
export default BlogComment;
