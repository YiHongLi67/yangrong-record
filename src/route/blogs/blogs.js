import React from 'react';
import { useEffect } from 'react';
import Blog from '../../components/blog/blog';
import { PropTypes } from 'prop-types';

function Blogs(props) {
    const { blogsData, pathName } = props;

    useEffect(() => {
        return () => {};
    }, []);

    return (
        <>
            {blogsData.map(blogData => {
                const { mid, urls, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } = blogData;
                return (
                    <Blog
                        key={mid}
                        mid={mid}
                        uid='1858065064'
                        urls={urls}
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
    blogsData: PropTypes.array.isRequired,
    pathName: PropTypes.string.isRequired
};
export default Blogs;
