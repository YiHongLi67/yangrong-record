import React, { useState } from 'react';
import { useEffect } from 'react';
import Blog from '../../components/blog/blog';
import { PropTypes } from 'prop-types';
import { subscribe, unsubscribe } from 'pubsub-js';
import { Avatar } from 'antd';
import avatar from '../../static/images/avatar.png';

let updateBlogsDataId;
let blogsRefreshId;

function Blogs(props) {
    const { pathName } = props;
    let [blogsData, setBlogsData] = useState([]);

    useEffect(() => {
        updateBlogsDataId = subscribe('updateBlogsData', (_, data) => {
            setBlogsData(blogsData => {
                return [...blogsData, ...data];
            });
        });
        blogsRefreshId = subscribe('blogsRefresh', () => {
            setBlogsData([]);
        });
        return () => {
            unsubscribe(updateBlogsDataId);
            unsubscribe(blogsRefreshId);
        };
    }, []);

    return (
        <>
            {/* <div>
                <p className='font-12 line-14'>12 14 杨蓉yr</p>
                <p className='font-14 line-20'>14 20 杨蓉yr</p>
                <p className='font-16 line-22'>16 22 杨蓉yr</p>
                <p className='font-18 line-25'>18 25 杨蓉yr</p>
                <p className='font-20 line-32'>20 32 杨蓉yr</p>
                <p className='font-24 line-38'>24 38 杨蓉yr</p>
                <p className='font-30 line-48'>30 48 杨蓉yr</p>
            </div> */}
            <Avatar src={avatar} />
            {blogsData.map(blogData => {
                const { mid, pic_ids, pic_infos, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } = blogData;
                return (
                    <Blog
                        key={mid}
                        mid={mid}
                        uid='1858065064'
                        // uid='6330711166'
                        pic_ids={pic_ids}
                        pic_infos={pic_infos}
                        text={text}
                        reposts_count={reposts_count}
                        comments_count={comments_count}
                        attitudes_count={attitudes_count}
                        source={source}
                        created_at={created_at}
                        region_name={region_name}
                        pathName={pathName}
                    ></Blog>
                );
            })}
        </>
    );
}
Blogs.propTypes = {
    pathName: PropTypes.string.isRequired
};
export default Blogs;
