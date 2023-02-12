import React from 'react';
import { Layout } from 'antd';
import './App.less';
import { Routes, Route } from 'react-router-dom';
import BlogComment from './route/blogcomment/blogcomment';
import Blogs from './route/blogs/blogs';
import KeepAliveLayout, { useKeepOutlets, KeepAliveContext } from '@chanjs/keepalive';
import Header from './components/header/header';
const { Content, Footer } = Layout;

export default function App() {
    const MemoComponents = () => {
        // 使用 useKeepOutlets 代替 useOutlet
        const child = useKeepOutlets();
        return <>{child}</>;
    };
    return (
        <KeepAliveLayout keepalive={['/', '/comment']}>
            <Header />
            <Content>
                <Routes>
                    <Route path='/' element={<MemoComponents />}>
                        <Route path='/' element={<Blogs />} />
                        <Route path='/comment' element={<BlogComment />} />
                    </Route>
                </Routes>
            </Content>
            {window.isPC && <Footer className='fixed bottom-0 ie-box align-center w-full font-12'>©CopyRight yhl</Footer>}
        </KeepAliveLayout>
    );
}
