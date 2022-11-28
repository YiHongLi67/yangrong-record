import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import './App.css';
import { getblog } from './axios/api';
import { _throttle } from './static/utils/utils';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AllComment from './components/comment/allcomment/allcomment';
import { subscribe } from 'pubsub-js';
import BlogRoute from './blogroute';
import KeepAliveLayout, { useKeepOutlets, KeepAliveContext } from '@chanjs/keepalive';

const { Header, Content, Footer } = Layout;
let beforeTop = 0;
let fetchDone = true;
let sinceId = '';
let preId = null;
const winHeight = window.innerHeight;

export default function App() {
    let [blogData, setBlogData] = useState([]);
    // const navigate = useNavigate();

    useEffect(() => {
        subscribe('reloadBlog', (_, data) => {
            document.onscroll = null;
            document.onscroll = _throttle(blogScroll, 200, { begin: true, end: true });
            document.documentElement.scrollTop = data.scrollTop;
        });
        if (window.location.pathname === '/') {
            fetchBlog(sinceId);
            document.onscroll = null;
            document.onscroll = _throttle(blogScroll, 200, { begin: true, end: true });
        }
        return () => {};
    }, []);

    async function fetchBlog(since_id) {
        let response = await getblog(since_id);
        fetchDone = true;
        preId = since_id;
        if (response.length === 0) {
            return;
        }
        setBlogData(blogData => {
            return [...blogData, ...response];
        });
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
        if (e.target.documentElement.scrollHeight - currentTop <= winHeight + 500 && fetchDone && sinceId !== preId) {
            fetchDone = false;
            fetchBlog(sinceId);
        }
    }

    let icon = [<span className='iconfont icon-shouye'></span>];
    const MemoComponents = () => {
        // 使用 useKeepOutlets 代替 useOutlet
        const child = useKeepOutlets();
        return <>{child}</>;
    };

    return (
        <KeepAliveLayout keepalive={['/']}>
            <Header theme='white' className='fixed top-0 ie-box w-full'>
                <div className='logo'></div>
                <Menu
                    theme='white'
                    mode='horizontal'
                    defaultSelectedKeys={['1']}
                    onClick={function (data) {
                        if (data.key === '1') {
                            setBlogData([]);
                            fetchDone = true;
                            preId = null;
                            sinceId = '';
                            fetchBlog(sinceId);
                        }
                    }}
                    items={new Array(2).fill(null).map((_, index) => {
                        const key = index + 1;
                        return {
                            key,
                            icon: icon[index]
                        };
                    })}
                />
            </Header>
            <Content>
                <Routes>
                    <Route path='/' element={<MemoComponents />}>
                        <Route path='/' element={<BlogRoute blogData={blogData} />}></Route>
                        <Route path='/comment' element={<AllComment />}></Route>
                    </Route>
                </Routes>
            </Content>
            <Footer className='fixed bottom-0 ie-box align-center w-full'>©copyRight yhl</Footer>
        </KeepAliveLayout>
    );
}
