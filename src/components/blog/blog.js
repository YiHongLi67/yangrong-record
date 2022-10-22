import { Image, Avatar } from 'antd';
import React, { useState } from 'react';
import './blog.css';
import avatar from '../../static/images/avatar.png';

// 微博会员svg图标
// cn 欢度国庆icon
// 展开全文
// 发布时间格式化
// 评论详情
// 显示live
export default function Blog(props) {
    const [urls] = useState(props.urls);
    const [text] = useState(props.text);
    const [reposts_count] = useState(props.reposts_count);
    const [comments_count] = useState(props.comments_count);
    const [attitudes_count] = useState(props.attitudes_count);
    const [source] = useState(props.source);
    const [created_at] = useState(props.created_at);
    console.log(created_at, typeof created_at);
    let textHTML = { __html: text };
    let width = picWidth();
    const [pic_wrap_width] = useState(width.pic_wrap_width);
    const [pics_wrap_width] = useState(width.pics_wrap_width);
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
            case 15:
            case 17:
            case 16:
                width.pic_wrap_width = 'calc((100% - 12px) / 3)';
                width.pics_wrap_width = '75%';
                return width;
            default:
                width.pic_wrap_width = 0;
                width.pics_wrap_width = 0;
                return width;
        }
    }

    return (
        <div className='blogs'>
            <div className='blog padding-20 padding-b-0 ie-box'>
                <div className='blog-head flex'>
                    <a className='avatar'>
                        <Avatar size={50} src={avatar} />
                        <span className='v'>
                            <span className='iconfont icon-renzheng'></span>
                        </span>
                    </a>
                    <div className='flex flex-1 flex-col-center margin-l-10'>
                        <div>
                            <div className='flex flex-col-center'>
                                <a className='weight-900 gray-1 screen-name line-20 inline-block'>杨蓉</a>
                                <span className='iconfont icon-weibohuiyuan line-20 inline-block font-24 margin-l-4'></span>
                            </div>
                            <p className='margin-0 font-12 line-14 gray-2 margin-t-4'>
                                2小时前 来自 <span>{source}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className='blog-content'>
                    <div>
                        <p className='gray-1' dangerouslySetInnerHTML={textHTML}></p>
                    </div>
                    <Image.PreviewGroup>
                        <div className='margin-t-10'>
                            <div className='pics-wrap flex wrap' style={{ width: pics_wrap_width }}>
                                {urls.map((item, index) => (
                                    <div key={item + index} className='ie-box pic-wrap flex' style={{ width: pic_wrap_width }}>
                                        <Image src={item} placeholder={true} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Image.PreviewGroup>
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
