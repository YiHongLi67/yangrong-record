import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Blog from '../../components/blog/blog';
import { getblog, getComment } from '../../axios/api';
import { _throttle, queryString } from '../../static/utils/utils';
import './blogcomment.css';
import { subscribe, unsubscribe } from 'pubsub-js';
import { PageScrollContext } from '../../context/context';
const winHeight = window.innerHeight;

let curPage = 1;
let prePage = 0;
let fetchDone = true;
let beforeTop = 0;
let blogCommtRefreshId;
let uid = '';
let mid = '';

function BlogComment() {
    let location = useLocation();
    const changeScroll = useContext(PageScrollContext);
    let [blogData, setBlogData] = useState({});
    let [allCommt, setAllCommt] = useState([]);
    let [display, setDisplay] = useState('none');
    const navigate = useNavigate();
    const { pic_ids, pic_num, pic_infos, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } = blogData || {};
    useEffect(() => {
        // allcomment 添加 scroll 事件
        document.addEventListener('scroll', _throttle(appScroll, 200, { before: true, end: true }));
        // 移动端虚拟返回键返回时, 拿不到路由跳转携带的 state
        const search = queryString(location.search);
        uid = search.uid;
        mid = search.mid;
        sessionStorage.setItem(location.pathname, String(0));
        fetchBlog(1);
        fetchComment(curPage, 2);
        blogCommtRefreshId = subscribe('blogCommtRefresh', (_, data) => {
            fetchDone = true;
            beforeTop = 0;
            curPage = 1;
            prePage = 0;
            sessionStorage.setItem(location.pathname, String(0));
            if (data) {
                uid = data.uid;
                mid = data.mid;
            }
            setDisplay('none');
            setBlogData({});
            fetchBlog(3);
            setAllCommt([]);
            fetchComment(curPage, 4);
        });
        return () => {
            // 路由切换 组件卸载 reset 参数
            curPage = 1;
            prePage = 0;
            unsubscribe(blogCommtRefreshId);
        };
    }, []);

    async function fetchBlog(num) {
        const response = await getblog({ mid });
        setBlogData(response[0]);
    }

    async function fetchComment(page, num) {
        // comment 页面获取一级评论
        const response = await getComment(uid, mid, page);
        fetchDone = true;
        prePage = page;
        if (response.data.length > 0) {
            setAllCommt(allCommt => {
                return [...allCommt, ...response.data];
            });
            setTimeout(() => {
                document.body.classList.remove('overflow-hid');
            }, 100);
        }
        if (response.isEnd) {
            setDisplay('block');
            return;
        }
        curPage = page + 1;
    }

    function appScroll(e) {
        if (window.location.pathname === '/comment' && !document.body.classList.contains('overflow-hid')) {
            let currentTop = document.documentElement.scrollTop || document.body.scrollTop;
            if (currentTop <= beforeTop) {
                // 向上滚动
                beforeTop = currentTop;
                return;
            }
            beforeTop = currentTop;
            if (e.target.documentElement.scrollHeight - currentTop <= winHeight + 100 && fetchDone && curPage !== prePage) {
                fetchDone = false;
                fetchComment(curPage, 5);
            }
        }
    }

    function toBlogs(e) {
        if (e.target.className.indexOf('back') !== -1) {
            return;
        }
        navigate(`/`);
        setTimeout(() => {
            changeScroll('/');
        }, 0);
    }

    return (
        <>
            <div className='back font-18 w-main line-24 fixed w-full vertical-m clear' onClick={toBlogs}>
                <span className='iconfont icon-arrow-left-bold font-20 pointer float-l'></span>
                <span className='pointer weight-600 float-l'>返回</span>
            </div>
            {uid && created_at && (
                <Blog
                    className='all-comment'
                    key={mid}
                    mid={mid}
                    uid={uid}
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
            )}
            <div className='end align-center font-12 padding-t-6 padding-b-6 margin-t-4 margin-b-4 w-sub' style={{ display }}>
                <span>评论已经到底了~</span>
            </div>
        </>
    );
}
export default BlogComment;
