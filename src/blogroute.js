import React from 'react';
import { useEffect } from 'react';
import Blog from './components/blog/blog';

export default function BlogRoute(props) {
    const { blogData } = props;

    useEffect(() => {
        return () => {};
    }, []);

    return (
        <>
            {blogData.map(item => {
                let { mid, urls, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name } = item;
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
                    ></Blog>
                );
            })}
        </>
    );
}
