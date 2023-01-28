import { Avatar } from 'antd';
import React, { useEffect, useState } from 'react';
import avatar from '../../static/images/avatar.png';
import moment from 'moment';
import ImageGroup from '../../components/imagegroup/imagegroup';
import SvgIcon from '../svgicon/svgicon';
import BlogFoot from './blogfoot/blogfoot';
import { formatTime, getCls, getMobileFont, _throttle } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';
import './blog.css';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

function Blog(props) {
    const { uid, mid, pic_ids, pic_infos, pic_num, text, source, created_at, region_name, isAllCommt, allCommt, pathName } = props;
    const { thumbUrls } = pic_infos;
    const className = getCls(props.className, 'blog-wrap');
    const width = picWidth();
    const [pic_wrap_width, set_pic_wrap_width] = useState(width.pic_wrap_width);
    const [pics_wrap_width, set_pics_wrap_width] = useState(width.pics_wrap_width);

    useEffect(() => {
        window.addEventListener('resize', _throttle(updateWidth, 500, { begin: true, end: true }));
        return () => {};
    });

    function updateWidth() {
        const width = picWidth();
        set_pic_wrap_width(width.pic_wrap_width);
        set_pics_wrap_width(width.pics_wrap_width);
    }

    function picWidth() {
        if (window.innerWidth <= 540) {
            const width = {
                pic_wrap_width: `calc((100% - ${12}px) / 3)`,
                pics_wrap_width: '100%'
            };
            switch (pic_ids.length) {
                case 1:
                    width.pic_wrap_width = `66%`;
                    width.pics_wrap_width = '100%';
                    return width;
                case 4:
                    width.pic_wrap_width = `calc((100% - ${8}px) / 2)`;
                    width.pics_wrap_width = '66.6%';
                    return width;
                default:
                    return width;
            }
        } else if (window.innerWidth <= 750) {
            const width = {
                pic_wrap_width: `calc((100% - ${12}px) / 3)`,
                pics_wrap_width: '100%'
            };
            switch (pic_ids.length) {
                case 1:
                    width.pic_wrap_width = `50%`;
                    width.pics_wrap_width = '100%';
                    return width;
                case 4:
                    width.pic_wrap_width = `calc((100% - ${8}px) / 2)`;
                    width.pics_wrap_width = '66.6%';
                    return width;
                default:
                    return width;
            }
        } else {
            const width = {
                pic_wrap_width: `calc((100% - ${16}px) / 4)`,
                pics_wrap_width: '100%'
            };
            switch (pic_ids.length) {
                case 5:
                case 6:
                case 9:
                case 15:
                case 17:
                case 18:
                    width.pic_wrap_width = `calc((100% - ${12}px) / 3)`;
                    width.pics_wrap_width = '75%';
                    return width;
                default:
                    return width;
            }
        }
    }

    return (
        <div className={className}>
            <div className='blog ie-box'>
                <div className='blog-head flex'>
                    <div>
                        <a className='avatar'>
                            <Avatar src={avatar} draggable={false} />
                            <span className='v flex'>
                                <SvgIcon iconClass='vip' width='42' height='672' viewBox='0 0 42 672' />
                            </span>
                        </a>
                    </div>
                    <div className='flex flex-1 margin-l-10'>
                        <div>
                            <div className='flex flex-col-center margin-t-4'>
                                <a
                                    className={getCls(
                                        window.isPC ? 'font-12 line-12' : 'font-16 line-14',
                                        'weight-900 gray-1 screen-name inline-block'
                                    )}
                                >
                                    杨蓉
                                </a>
                                <SvgIcon iconClass='svip_8' />
                            </div>
                            <p
                                className={'font-12 line-14 gray-2 margin-t-4 ellipsis blog-msg'}
                                style={{ width: window.isPC ? `calc(100vw - ${90}px)` : `calc(100vw - 88px - ${50}px)` }}
                            >
                                {formatTime(created_at)}&nbsp;来自&nbsp;<span className='source'>{source}</span>
                            </p>
                            {window.isPC && region_name ? (
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
                        <p
                            className={getCls(window.isPC ? 'font-14 line-12' : getMobileFont('comment-text'), 'gray-1 text')}
                            dangerouslySetInnerHTML={{ __html: text }}
                        ></p>
                    </div>
                    {pic_ids.length ? (
                        <div className='margin-t-10'>
                            <ImageGroup
                                className='pics-wrap flex wrap'
                                urls={pic_infos.map(item => {
                                    return item.thumbUrl;
                                })}
                                pic_ids={pic_ids}
                                pic_num={pic_num}
                                pic_infos={pic_infos}
                                groupWidth={pics_wrap_width}
                                imgWidth={pic_wrap_width}
                                borderRadius={`${8}px`}
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
    pic_ids: PropTypes.array.isRequired,
    pic_infos: PropTypes.array.isRequired,
    pic_num: PropTypes.number.isRequired,
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
    isAllCommt: false,
    className: ''
};
export default Blog;
