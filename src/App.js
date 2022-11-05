import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Blog from './components/blog/blog';
import './App.css';
import { getblog } from './axios/api';
import { throttle } from './static/utils/utils';

const { Content, Footer } = Layout;

// 优化: 鼠标向上滚动也会发送请求, 向下滚动到阈值偶尔会触发多次请求

export default function App() {
    let [blogData, setBlogData] = useState([]);
    let [page, setPage] = useState(1);
    let [height] = useState(window.innerHeight);
    let beforeTop = 0;
    let currentTop = 0;

    useEffect(() => {
        fetchBlog(page);
        let app = document.querySelector('.app');
        app.addEventListener('scroll', throttle(scroll, 200));
        return () => {};
    }, []);

    async function fetchBlog(page) {
        let response = await getblog(page);
        setBlogData(blogData => {
            return [...blogData, ...response];
        });
    }

    function scroll(e) {
        currentTop = e.target.scrollTop;
        if (currentTop <= beforeTop) {
            beforeTop = currentTop;
            // 向上滚动
            return;
        }
        beforeTop = currentTop;
        if (Math.round(e.target.scrollHeight - currentTop) <= window.innerHeight + 500) {
            setPage(++page);
            fetchBlog(page);
            console.log('fetch');
        }
    }

    return (
        <div className='app' style={{ height }}>
            <Content className='main'>
                {blogData.map(item => {
                    let { mid, urls, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } = item;
                    return (
                        <Blog
                            key={mid}
                            urls={urls}
                            text={text}
                            reposts_count={reposts_count}
                            comments_count={comments_count}
                            attitudes_count={attitudes_count}
                            source={source}
                            created_at={created_at}
                            region_name={region_name}></Blog>
                    );
                })}
            </Content>
            <Footer style={{ textAlign: 'center' }}>©copyRight yhl</Footer>
        </div>
    );
}
