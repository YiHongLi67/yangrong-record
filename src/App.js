import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Blog from './components/blog/blog';
import './App.css';
import { getblog } from './axios/api';

const { Content, Footer } = Layout;

export default function App() {
    let [blogData, setBlogData] = useState([]);
    async function fetchBlog() {
        let response = await getblog();
        setBlogData(response);
    }
    useEffect(() => {
        fetchBlog();
        return () => {};
    }, []);
    return (
        <div className='app'>
            <Content className=''>
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
