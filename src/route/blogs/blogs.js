import React, { useState } from 'react';
import { useEffect } from 'react';
import Blog from '../../components/blog/blog';
import { PropTypes } from 'prop-types';
import { subscribe, unsubscribe } from 'pubsub-js';

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
            {blogsData.map(blogData => {
                const { mid, pic_ids, pic_infos, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } = blogData;
                return (
                    <Blog
                        key={mid}
                        mid={mid}
                        uid='1858065064'
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
