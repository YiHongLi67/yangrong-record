import { Image, Avatar } from 'antd';
import React, { useState } from 'react';
import './blog.css';
import avatar from '../../static/images/avatar.png';

export default function Blog(props) {
    const [picUrl] = useState(props.picUrl);
    let width = picWidth();
    const [pic_wrap_width] = useState(width.pic_wrap_width);
    const [pics_wrap_width] = useState(width.pics_wrap_width);
    function picWidth() {
        let width = {
            pic_wrap_width: 'calc((100% - 16px) / 4)',
            pics_wrap_width: '100%'
        };
        switch (picUrl.length) {
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
        }
    }

    return (
        <div className='blogs'>
            <div className='blog padding-20 padding-b-0 ie-box'>
                <div className='blog-head flex'>
                    <a className='avatar'>
                        <Avatar size={50} src={avatar} />
                    </a>
                    <div className='flex flex-1 flex-col-center margin-l-6'>
                        <div>
                            <a className='weight-900 gray-1 screen-name'>杨蓉</a>
                            <p className='margin-0 font-12 line-14 gray-2 margin-t-4'>2小时前 来自 渔渔姑娘的iPhone端</p>
                        </div>
                    </div>
                </div>
                <div className='blog-content'>
                    <div>
                        <p className='gray-1'>百坭村“大喇叭”有一则通知，今晚#大山的女儿# 要在CCTV-8黄金强档播出📢 ​​​</p>
                    </div>
                    <Image.PreviewGroup>
                        <div className='margin-t-10'>
                            <div className='pics-wrap flex wrap' style={{ width: pics_wrap_width }}>
                                {picUrl.map((item, index) => (
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
                        <span>1000</span>
                    </div>
                    <div className='flex flex-1 flex-row-center flex-col-center pointer'>
                        <span className='iconfont icon-pinglun font-20 margin-r-8'></span>
                        <span>1234</span>
                    </div>
                    <div className='flex flex-1 flex-row-center flex-col-center pointer'>
                        <span className='iconfont icon-dianzan font-20 margin-r-8'></span>
                        <span>10000</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
