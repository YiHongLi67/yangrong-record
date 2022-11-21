import React, { useState } from 'react';
import { Link, Route, Router, useNavigate } from 'react-router-dom';
import './blogfoot.css';
import { antiShake, _throttle } from '../../../static/utils/utils';
import { useEffect } from 'react';
import { getComment } from '../../../axios/api';
import { Modal } from 'antd';
import BlogComment from '../../comment/comment';
import { subscribe, unsubscribe } from 'pubsub-js';
import AllComment from '../../comment/allcomment/allcomment';

export default function BlogFoot(props) {
    const { blogData, mid, avatar_uid } = props;
    const { reposts_count, comments_count, attitudes_count } = blogData;
    let [display, setDisplay] = useState('none');
    let [comment, setComment] = useState([]);
    let [modalOpen, setModalOpen] = useState(false);
    let [curCommt, setCurCommt] = useState({});
    let [replyDetail, setReplyDetail] = useState([]);
    const navigate = useNavigate();

    async function fetchComment() {
        if (display === 'none') {
            const comment = await getComment(avatar_uid, mid);
            setComment(comment);
            setDisplay('block');
        } else {
            setDisplay('none');
        }
    }

    async function fetchReply(e, item) {
        if (item.mid === mid) {
            setCurCommt(item);
            let reply = await getComment(avatar_uid, mid, 1, item.rootid);
            setReplyDetail(reply);
            setModalOpen(true);
        }
    }

    function viewComment() {
        navigate('/comment', { state: blogData });
    }

    useEffect(() => {
        subscribe('fetchReply', (_, data) => {
            fetchReply(data.e, data.commtData);
        });
        return () => {
            unsubscribe('fetchReply');
        };
    }, []);

    return (
        <div className='blog-foot'>
            <div className='comment flex line-38'>
                <div className='flex flex-1 flex-row-center flex-col-center pointer'>
                    <span className='iconfont icon-zhuanfa margin-r-8'></span>
                    <span>{reposts_count}</span>
                </div>
                <div className='flex flex-1 flex-row-center flex-col-center pointer' onClick={antiShake(fetchComment, 500)}>
                    <span className='iconfont icon-pinglun font-20 margin-r-8'></span>
                    <span>{comments_count}</span>
                </div>
                <div className='flex flex-1 flex-row-center flex-col-center pointer'>
                    <span className='iconfont icon-dianzan font-20 margin-r-8'></span>
                    <span>{attitudes_count}</span>
                </div>
            </div>
            <div className='comment-detail' style={{ display }}>
                {modalOpen ? (
                    <Modal
                        className='comment-detail modal-comment'
                        title={curCommt.reply.reply_count + '条回复'}
                        centered
                        width='45%'
                        bodyStyle={{ height: '70vh', overflow: 'auto', padding: '16px 20px' }}
                        open={modalOpen}
                        onOk={() => setModalOpen(false)}
                        onCancel={() => setModalOpen(false)}
                        footer={null}
                        closeIcon={<span className='iconfont icon-guanbi'></span>}
                    >
                        <BlogComment avatar_uid={avatar_uid} commtData={curCommt} replyDetail={replyDetail} isModal></BlogComment>
                    </Modal>
                ) : (
                    <></>
                )}
                {comment.map(item => {
                    return <BlogComment key={item.id} avatar_uid={avatar_uid} commtData={item}></BlogComment>;
                })}
                <div className='align-center all-comment line-25' onClick={viewComment}>
                    <span className='margin-r-2'>查看全部{comments_count}条评论</span>
                    <span className='iconfont icon-arrow-right-bold font-12'></span>
                </div>
            </div>
        </div>
    );
}
