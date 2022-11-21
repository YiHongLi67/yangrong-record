import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Blog from '../../blog/blog';
import BlogComment from '../comment';
import { getComment } from '../../../axios/api';

export default function AllComment() {
    const {
        state: { uid, mid, urls, text, reposts_count, comments_count, attitudes_count, source, created_at, region_name }
    } = useLocation();
    let [comment, setComment] = useState([]);
    let [page, setPage] = useState(1);

    async function fetchComment() {
        const comment = await getComment(uid, mid, page);
        setComment(comment);
    }

    useEffect(() => {
        fetchComment();
        return () => {};
    }, []);

    return (
        <>
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
            {comment.map(item => {
                return <BlogComment key={item.id} avatar_uid={uid} commtData={item}></BlogComment>;
            })}
        </>
    );
}
