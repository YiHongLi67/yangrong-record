import React, { useState } from 'react';
import { useEffect } from 'react';
import Blog from '../../components/blog/blog';
import { PropTypes } from 'prop-types';
import { subscribe, unsubscribe } from 'pubsub-js';
import { Avatar, Radio } from 'antd';
import avatar from '../../static/images/avatar.png';
import { getMobileFont } from '../../static/utils/utils';

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

    function changeFontSize(e) {
        window.fontSize = e.target.value;
    }

    return (
        <>
            {/* <div>
                <p className='font-12 line-12'>12 20 杨蓉 yr</p>
                <p className='font-14 line-14'>14 22 杨蓉 yr</p>
                <p className='font-16 line-16'>16 25 杨蓉 yr</p>
                <p className='font-18 line-18'>18 28 杨蓉 yr</p>
                <p className='font-20 line-20'>20 32 杨蓉 yr</p>
                <p className='font-24 line-24'>24 38 杨蓉 yr</p>
                <p className='font-30 line-30'>30 48 杨蓉 yr</p>
                <p className='font-38 line-38'>38 60 杨蓉 yr</p>
            </div> */}
            {/* <Avatar src={avatar} /> */}
            <Radio.Group name='radiogroup' defaultValue={window.fontSize} size='large' onChange={changeFontSize}>
                <Radio value={14} className={getMobileFont('radio')}>
                    14
                </Radio>
                <Radio value={16} className={getMobileFont('radio')}>
                    16
                </Radio>
                <Radio value={18} className={getMobileFont('radio')}>
                    18
                </Radio>
                <Radio value={20} className={getMobileFont('radio')}>
                    20
                </Radio>
                <Radio value={24} className={getMobileFont('radio')}>
                    24
                </Radio>
                <Radio value={30} className={getMobileFont('radio')}>
                    30
                </Radio>
            </Radio.Group>
            {blogsData.map(blogData => {
                const { mid, pic_ids, pic_num, pic_infos, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } =
                    blogData;
                return (
                    <Blog
                        key={mid}
                        mid={mid}
                        uid='1858065064'
                        // uid='6330711166'
                        pic_ids={pic_ids}
                        pic_num={pic_num}
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
