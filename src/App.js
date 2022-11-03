import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Blog from './components/blog/blog';
import './App.css';
import { getblog } from './axios/api';
import ImageGroup from './components/imagegroup/imagegroup';
import PreviewMask from './components/previewmask/previewmask';

const { Content, Footer } = Layout;

export default function App() {
    let [blogData, setBlogData] = useState([]);
    let [page, setPage] = useState(1);
    let [height] = useState(window.innerHeight);
    async function fetchBlog(page) {
        let response = await getblog(page);
        setBlogData(blogData => {
            return [...blogData, ...response];
        });
    }
    useEffect(() => {
        // fetchBlog(page);
        let app = document.querySelector('.app');
        app.addEventListener('scroll', () => {
            if (app.scrollHeight - app.scrollTop === window.innerHeight) {
                // setPage(++page);
                // fetchBlog(page);
            }
        });
        return () => {};
    }, []);
    let baseUrl = 'http://114.132.218.229:50/images/thumbnail/2022/';
    let URLS1 = [
        `${baseUrl}0021KfBmly1h7iondsnhaj624836d7wj02.jpg`,
        `${baseUrl}0021KfBmly1h3rlvj84gij635s23ux6s02.jpg`,
        `${baseUrl}0021KfBmly1h6wvoptmakj642o2qcb2902.jpg`
    ];
    let URLS2 = [`${baseUrl}0021KfBmly1h6uldcxgi2j620q2wze8102.jpg`];
    return (
        <div className='app' style={{ height }}>
            <Content className='main'>
                <PreviewMask></PreviewMask>
                <ImageGroup urls={URLS1}></ImageGroup>
                <ImageGroup urls={URLS2}></ImageGroup>
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
