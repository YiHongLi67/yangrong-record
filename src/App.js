import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import './App.less';
import { getblog } from './axios/api';
import { _throttle } from './static/utils/utils';
import { Routes, Route } from 'react-router-dom';
import BlogComment from './route/blogcomment/blogcomment';
import { subscribe, unsubscribe } from 'pubsub-js';
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
    let [blogsData, setBlogsData] = useState([]);
    useEffect(() => {
        document.addEventListener('scroll', _throttle(blogScroll, 200, { begin: true, end: true }));
        toBlogsId = subscribe('toBlogs', (_, data) => {
            // 手机端 QQ/微信/QQ浏览器 获取到的 document.documentElement.scrollTop始终为 0
            document.body.scrollTop = data.scrollTop;
            document.documentElement.scrollTop = data.scrollTop;
            // alert(`body: ${document.body.scrollTop}, documentElement: ${document.documentElement.scrollTop}`);
        });
        blogsRefreshId = subscribe('blogsRefresh', () => {
            blogsRefresh();
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
        if (window.location.pathname === '/') {
            fetchBlog(sinceId);
        }
        return () => {
            unsubscribe(toBlogsId, blogsRefreshId);
        };
    }, []);

    async function fetchBlog(since_id) {
        // console.log('fetch');
        const isRefresh = sinceId === '';
        let response = await getblog(since_id);
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

    const MemoComponents = () => {
        // 使用 useKeepOutlets 代替 useOutlet
        const child = useKeepOutlets();
        return <>{child}</>;
    };

    return (
        <>
            <KeepAliveLayout keepalive={['/']}>
                <Header />
                <Content>
                    <Routes>
                        <Route path='/' element={<MemoComponents />}>
                            {/* <Route path='/'> */}
                            <Route path='/' element={<Blogs pathName='/' blogsData={blogsData} />}></Route>
                            <Route path='/comment' element={<BlogComment pathName='/comment' />}></Route>
                        </Route>
                    </Routes>
                </Content>
                {window.isPC && <Footer className='fixed bottom-0 ie-box align-center w-full font-12'>©CopyRight yhl</Footer>}
            </KeepAliveLayout>
        </>
    );
}
