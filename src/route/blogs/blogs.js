import React, { useState } from 'react';
import { useEffect } from 'react';
import Blog from '../../components/blog/blog';
import { PropTypes } from 'prop-types';
import { subscribe, unsubscribe } from 'pubsub-js';
import { Radio } from 'antd';
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
