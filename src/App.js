import React from 'react';
import { Layout } from 'antd';
import Blog from './components/blog/blog';
import ajaxData from './static/json/blog-data.json';
import './App.css';

const { Content, Footer } = Layout;

export default function App() {
    let blogData = [];
    for (let item of ajaxData) {
        let propsObj = {};
        propsObj['mid'] = item.mblog['mid'];
        propsObj['text'] = item.mblog['text'];
        propsObj['created_at'] = item.mblog['created_at'];
        propsObj['reposts_count'] = item.mblog['reposts_count'];
        propsObj['comments_count'] = item.mblog['comments_count'];
        propsObj['attitudes_count'] = item.mblog['attitudes_count'];
        propsObj['pic_ids'] = item.mblog['pic_ids'];
        propsObj['pic_num'] = item.mblog['pic_num'];
        propsObj['pics'] = item.mblog['pics'];
        propsObj['region_name'] = item.mblog['region_name'];
        propsObj['source'] = item.mblog['source'];
        propsObj['textLength'] = item.mblog['textLength'];
        blogData.push(propsObj);
    }
    return (
        <div className='app'>
            <Content className=''>
                {blogData.map(item => {
                    let urls = [];
                    let { mid, pics, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } = item;
                    pics &&
                        pics.forEach(pic => {
                            urls.push(pic.large.url);
                        });
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
            <Footer style={{ textAlign: 'center' }}>©copyright yhl</Footer>
        </div>
    );
}
