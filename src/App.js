import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu } from 'antd';
import Blog from './components/blog/blog';
import './App.css';
import { getblog } from './axios/api';
import { _throttle } from './static/utils/utils';
import SvgIcon from './components/svgicon/svgicon';

const { Header, Content, Footer } = Layout;

export default function App() {
    let [blogData, setBlogData] = useState([]);
    let [winHeight] = useState(window.innerHeight);
    let [beforeTop, setBeforeTop] = useState(0);
    let [fetchDone, setFetchDone] = useState(true);
    let [sinceId, setSinceId] = useState('');
    let [preId, setPreId] = useState(null);
    let main = useRef(null);
    let [width, setWidth] = useState('100vw');

    useEffect(() => {
        fetchBlog(sinceId);
        return () => {};
    }, []);

    async function fetchBlog(sinceId) {
        let response = await getblog(sinceId);
        setFetchDone((fetchDone = true));
        setPreId(sinceId);
        if (response.length === 0) {
            return;
        }
        setSinceId(response[response.length - 1].mid);
        setBlogData(blogData => {
            return [...blogData, ...response];
        });
        getWidth();
    }

    function getWidth() {
        setTimeout(() => {
            if (main.current.clientHeight < main.current.scrollHeight) {
                setWidth('calc(100vw - 17px)');
            } else {
                setWidth('100vw');
            }
        }, 0);
    }

    function scroll(e) {
        let currentTop = e.target.scrollTop;
        if (currentTop <= beforeTop) {
            // 向上滚动
            setBeforeTop((beforeTop = currentTop));
            return;
        }
        setBeforeTop((beforeTop = currentTop));
        if (e.target.scrollHeight - currentTop <= winHeight + 1000 && fetchDone && sinceId !== preId) {
            setFetchDone((fetchDone = false));
            fetchBlog(sinceId);
        }
    }

    let icon = [<span className='iconfont icon-shouye'></span>];

    return (
        <div className='app' onScroll={_throttle(scroll, 200, { begin: true, end: true })}>
            <Header theme='white' className='fixed top-0 ie-box' style={{ width }}>
                <div className='logo'></div>
                <Menu
                    theme='white'
                    mode='horizontal'
                    defaultSelectedKeys={['1']}
                    onClick={function (data) {
                        if (data.key === '1') {
                            setBlogData([]);
                            setFetchDone(true);
                            setPreId(null);
                            setSinceId('');
                            fetchBlog('');
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
            <Content className='main' ref={main}>
                <SvgIcon iconClass='vip' fill='red'></SvgIcon>
                {/* <SvgIcon iconClass='svip_8'></SvgIcon> */}
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
                            region_name={region_name}
                        ></Blog>
                    );
                })}
            </Content>
            <Footer className='fixed bottom-0 ie-box align-center' style={{ width }}>
                ©copyRight yhl
            </Footer>
        </div>
    );
}
