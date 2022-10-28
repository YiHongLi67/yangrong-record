import { Image, Avatar } from 'antd';
import React, { useState } from 'react';
import './blog.css';
import avatar from '../../static/images/avatar.png';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

// 微博会员svg图标
// cn 欢度国庆icon
// 展开全文
// 发布时间格式化
// 评论详情
// live: 同时显示图片和live
export default function Blog(props) {
    const [urls] = useState(props.urls);
    const [text] = useState(props.text);
    const [reposts_count] = useState(props.reposts_count);
    const [comments_count] = useState(props.comments_count);
    const [attitudes_count] = useState(props.attitudes_count);
    const [source] = useState(props.source);
    const [created_at] = useState(formatTime(props.created_at));
    const [region_name] = useState(props.region_name);
    // console.log('blog', urls, text, reposts_count);
    function formatTime(created_at) {
        created_at = new Date(created_at);
        if (new Date().getTime() - created_at.getTime() <= 1000 * 60 * 60 * 21) {
            return new Date(created_at).getTime();
        } else {
            return moment(created_at).format('YY-M-D HH: mm');
        }
    }
    let textHTML = { __html: text };
    let [display] = useState(urls.length ? 'block' : 'none');
    let width = picWidth();
    const [pic_wrap_width] = useState(width && width.pic_wrap_width);
    const [pics_wrap_width] = useState(width && width.pics_wrap_width);
    function picWidth() {
        let width = {
            pic_wrap_width: 'calc((100% - 16px) / 4)',
            pics_wrap_width: '100%'
        };
        switch (urls.length) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 7:
            case 8:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 16:
                return width;
            case 5:
            case 6:
            case 9:
            case 15:
            case 17:
            case 18:
                width.pic_wrap_width = 'calc((100% - 12px) / 3)';
                width.pics_wrap_width = '75%';
                return width;
        }
    }

    return (
        <div className='blogs'>
            <div className='blog padding-20 padding-b-0 ie-box'>
                <div className='blog-head flex'>
                    <a className='avatar'>
                        <Avatar size={50} src={avatar} draggable={false} />
                        <span className='v'>
                            <span className='iconfont icon-renzheng'></span>
                        </span>
                    </a>
                    <div className='flex flex-1 margin-l-10'>
                        <div>
                            <div className='flex flex-col-center margin-t-4'>
                                <a className='weight-900 gray-1 screen-name line-20 inline-block'>杨蓉</a>
                                <span className='iconfont icon-weibohuiyuan line-20 inline-block font-24 margin-l-4'></span>
                            </div>
                            <p className='font-12 line-14 gray-2 margin-t-4'>
                                {created_at} 来自 <span className='source'>{source}</span>
                            </p>
                            <p className='font-12 line-14 gray-2 margin-t-6'>
                                <span>{region_name}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className='blog-content margin-t-6'>
                    <div>
                        <p className='gray-1 text' dangerouslySetInnerHTML={textHTML}></p>
                    </div>
                    <div className='margin-t-10' style={{ display }}>
                        <Image.PreviewGroup>
                            <div className='pics-wrap flex wrap' style={{ width: pics_wrap_width }}>
                                {urls.map((item, index) => (
                                    <div key={item + index} className='ie-box pic-wrap flex' style={{ width: pic_wrap_width }}>
                                        <Image src={item} placeholder={true} />
                                    </div>
                                ))}
                            </div>
                        </Image.PreviewGroup>
                    </div>
                </div>
                <div className='blog-foot flex line-38'>
                    <div className='flex flex-1 flex-row-center flex-col-center pointer'>
                        <span className='iconfont icon-zhuanfa margin-r-8'></span>
                        <span>{reposts_count}</span>
                    </div>
                    <div className='flex flex-1 flex-row-center flex-col-center pointer'>
                        <span className='iconfont icon-pinglun font-20 margin-r-8'></span>
                        <span>{comments_count}</span>
                    </div>
                    <div className='flex flex-1 flex-row-center flex-col-center pointer'>
                        <span className='iconfont icon-dianzan font-20 margin-r-8'></span>
                        <span>{attitudes_count}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
