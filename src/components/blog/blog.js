import { Avatar } from 'antd';
import React from 'react';
import './blog.css';
import avatar from '../../static/images/avatar.png';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import ImageGroup from '../../components/imagegroup/imagegroup';
import SvgIcon from '../svgicon/svgicon';
import BlogFoot from './blogfoot/blogfoot';
import { formatTime } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';

function Blog(props) {
    const { uid, mid, urls, text, source, created_at, region_name, isAllCommt, allCommt, className, pathName } = props;
    const width = picWidth();
    const pic_wrap_width = width && width.pic_wrap_width;
    const pics_wrap_width = width && width.pics_wrap_width;

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
        <div className={className ? className + ' blog-wrap' : 'blog-wrap'}>
            <div className='blog padding-20 padding-b-0 ie-box'>
                <div className='blog-head flex'>
                    <div>
                        <a className='avatar'>
                            <Avatar size={50} src={avatar} draggable={false} />
                            <span className='v'>
                                <SvgIcon iconClass='vip' width='42' height='672' viewBox='0 0 42 672' />
                            </span>
                        </a>
                    </div>
                    <div className='flex flex-1 margin-l-10'>
                        <div>
                            <div className='flex flex-col-center margin-t-4'>
                                <a className='weight-900 gray-1 screen-name line-20 inline-block'>杨蓉</a>
                                <SvgIcon iconClass='svip_8' />
                            </div>
                            <p className='font-12 line-14 gray-2 margin-t-4'>
                                {formatTime(created_at)} 来自 <span className='source'>{source}</span>
                            </p>
                            {region_name ? (
                                <p className='font-12 line-14 gray-2 margin-t-6'>
                                    <span>{region_name}</span>
                                </p>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </div>
                <div className='blog-content margin-t-6'>
                    <div>
                        <p className='gray-1 text' dangerouslySetInnerHTML={{ __html: text }}></p>
                    </div>
                    {urls.length ? (
                        <div className='margin-t-10'>
                            <ImageGroup
                                className='pics-wrap flex wrap'
                                urls={urls}
                                groupWidth={pics_wrap_width}
                                imgWidth={pic_wrap_width}
                                borderRadius='8px'
                            ></ImageGroup>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
                <BlogFoot blogData={props} mid={mid} avatar_uid={uid} isAllCommt={isAllCommt} allCommt={allCommt} pathName={pathName}></BlogFoot>
            </div>
        </div>
    );
}
Blog.propTypes = {
    uid: PropTypes.string.isRequired,
    mid: PropTypes.string.isRequired,
    urls: PropTypes.array.isRequired,
    text: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    region_name: PropTypes.string,
    isAllCommt: PropTypes.bool,
    allCommt: PropTypes.array,
    className: PropTypes.string,
    pathName: PropTypes.string.isRequired
};
Blog.defaultProps = {
    region_name: null,
    isAllCommt: false
};
export default Blog;
