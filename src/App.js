import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import './App.css';
import { getblog } from './axios/api';
import { _throttle } from './static/utils/utils';
import { Routes, Route } from 'react-router-dom';
import BlogComment from './route/blogcomment/blogcomment';
import { publish, subscribe, unsubscribe } from 'pubsub-js';
import Blogs from './route/blogs/blogs';
import KeepAliveLayout, { useKeepOutlets, KeepAliveContext } from '@chanjs/keepalive';
import Header from './components/header/header';

const { Content, Footer } = Layout;
let beforeTop = 0;
let fetchDone = true;
let sinceId = '';
let preId = null;
const winHeight = window.innerHeight;
let toBlogsId;
let blogsRefreshId;

export default function App() {
    useEffect(() => {
        toBlogsId = subscribe('toBlogs', (_, data) => {
            document.onscroll = null;
            document.onscroll = _throttle(blogScroll, 200, { begin: true, end: true });
            document.documentElement.scrollTop = data.scrollTop;
        });
        blogsRefreshId = subscribe('blogsRefresh', () => {
            fetchDone = true;
            preId = null;
            sinceId = '';
            fetchBlog(sinceId);
        });
        if (window.location.pathname === '/') {
            fetchBlog(sinceId);
            document.onscroll = null;
            document.onscroll = _throttle(blogScroll, 200, { begin: true, end: true });
        }
        return () => {
            unsubscribe(toBlogsId, blogsRefreshId);
        };
    }, []);

    async function fetchBlog(since_id) {
        let response = await getblog(since_id);
        fetchDone = true;
        preId = since_id;
        if (response.length === 0) {
            return;
        }
        publish('updateBlogsData', response);
        sinceId = response[response.length - 1].mid;
    }

    function blogScroll(e) {
        let currentTop = e.target.documentElement.scrollTop;
        if (currentTop <= beforeTop) {
            // 向上滚动
            beforeTop = currentTop;
            return;
        }
        beforeTop = currentTop;
        if (e.target.documentElement.scrollHeight - currentTop <= winHeight + 400 && fetchDone && sinceId !== preId) {
            fetchDone = false;
            fetchBlog(sinceId);
        }
    }

    const MemoComponents = () => {
        // 使用 useKeepOutlets 代替 useOutlet
        const child = useKeepOutlets();
        return <>{child}</>;
    };

    return (
        <KeepAliveLayout keepalive={['/']}>
            <Header />
            <Content>
                <Routes>
                    <Route path='/' element={<MemoComponents />}>
                        <Route path='/' element={<Blogs pathName='/' />}></Route>
                        <Route path='/comment' element={<BlogComment pathName='/comment' />}></Route>
                    </Route>
                </Routes>
            </Content>
            <Footer className='fixed bottom-0 ie-box align-center w-full font-12'>©CopyRight yhl</Footer>
        </KeepAliveLayout>
    );
}
