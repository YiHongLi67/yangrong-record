import React, { useState, useRef } from 'react';
import { Avatar, Comment } from 'antd';
import './comment.css';
import Img from '../img/img';
import avatar from '../../static/images/avatar.png';
import { antiShake, throttle, _throttle } from '../../static/utils/utils';
import { useEffect } from 'react';
import { getComment } from '../../axios/api';
import ImageGroup from '../../components/imagegroup/imagegroup';
import { formatTime } from '../../static/utils/utils';
import { Button, Modal } from 'antd';
import { isEditable } from '@testing-library/user-event/dist/utils';

export default function YrComment(props) {
    const { reposts_count, comments_count, attitudes_count, mid, avatar_uid } = props;
    let [display, setDisplay] = useState('none');
    let [comment, setComment] = useState([]);
    let [modalOpen, setModalOpen] = useState(false);
    // let [replyCount, setReplyCount] = useState(0);
    let [curCommt, setCurCommt] = useState({});
    let [replyDetail, setReplyDetail] = useState([]);

    async function fetchComment() {
        if (display === 'none') {
            console.log('fetch');
            const comment = await getComment(avatar_uid, mid);
            setComment(comment);
            setDisplay('block');
        } else {
            setDisplay('none');
        }
    }

    async function fetchReply(e, item) {
        setCurCommt(item);
        let reply = await getComment(avatar_uid, mid, 1, item.rootid);
        setReplyDetail(reply);
        setModalOpen(true);
    }

    useEffect(() => {
        return () => {};
    });

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
                        <Comment
                            key={curCommt.id}
                            avatar={<Avatar src={curCommt.user_avatar} alt='Han Solo' />}
                            content={
                                <>
                                    <div>
                                        <span className='comment-user-name'>
                                            <a>{avatar_uid === curCommt.uid ? curCommt.user_name + ' 博主：' : curCommt.user_name + '：'}</a>
                                        </span>
                                        <span className='comment-text' dangerouslySetInnerHTML={{ __html: curCommt.text }}></span>
                                    </div>
                                    {curCommt.pic_urls ? (
                                        <div>
                                            <Img src={curCommt.pic_urls.thumbnail} width='120px' text=''></Img>
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                    <div className='collapse'>
                                        <div className='comments-msg float-l'>
                                            <span>{formatTime(curCommt.created_at)}</span>
                                            <span>&nbsp;{curCommt.source}</span>
                                        </div>
                                        <div className='operate float-r flex-center'>
                                            <span className='iconfont icon-zhuanfa'></span>
                                            <span className='iconfont icon-pinglun'></span>
                                            <span className='iconfont icon-dianzan'>
                                                {curCommt.like_counts ? <span className='padding-l-6'>{curCommt.like_counts}</span> : <></>}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            }
                            actions={replyDetail.map(subItem => {
                                const { uid, text, user_avatar, user_name, created_at, id, like_counts, pic_urls, source } = subItem;
                                return (
                                    <Comment
                                        key={id}
                                        className='reply-inner'
                                        content={
                                            <>
                                                <div>
                                                    <span className='comment-user-name'>
                                                        <a>{avatar_uid === uid ? user_name + ' 博主：' : user_name + '：'}</a>
                                                    </span>
                                                    <span className='comment-text' dangerouslySetInnerHTML={{ __html: text }}></span>
                                                </div>
                                                <div className='collapse operate-wrap'>
                                                    <div className='comments-msg float-l'>
                                                        <span>{formatTime(created_at)}</span>
                                                        <span>&nbsp;{source}</span>
                                                    </div>
                                                    <div className='operate float-r flex-center'>
                                                        <span className='iconfont icon-zhuanfa'></span>
                                                        <span className='iconfont icon-pinglun'></span>
                                                        <span className='iconfont icon-dianzan'>
                                                            {like_counts ? <span className='padding-l-6'>{like_counts}</span> : <></>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        }
                                    ></Comment>
                                );
                            })}
                        ></Comment>
                    </Modal>
                ) : (
                    <></>
                )}
                {comment.map(item => {
                    const { text, user_avatar, user_name, created_at, uid, id, like_counts, pic_urls, reply, source } = item;
                    const textHTML = { __html: text };
                    return (
                        <Comment
                            key={id}
                            avatar={<Avatar src={user_avatar} alt='Han Solo' />}
                            content={
                                <>
                                    <div>
                                        <span className='comment-user-name'>
                                            <a>{avatar_uid === uid ? user_name + ' 博主：' : user_name + '：'}</a>
                                        </span>
                                        <span className='comment-text' dangerouslySetInnerHTML={textHTML}></span>
                                    </div>
                                    {pic_urls ? (
                                        <div>
                                            <Img src={pic_urls.thumbnail} width='120px' text=''></Img>
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                    <div className='collapse'>
                                        <div className='comments-msg float-l'>
                                            <span>{formatTime(created_at)}</span>
                                            <span>&nbsp;{source}</span>
                                        </div>
                                        <div className='operate float-r flex-center'>
                                            <span className='iconfont icon-zhuanfa'></span>
                                            <span className='iconfont icon-pinglun'></span>
                                            <span className='iconfont icon-dianzan'>
                                                {like_counts ? <span className='padding-l-6'>{like_counts}</span> : <></>}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            }
                            actions={
                                reply.avatar_reply &&
                                reply.avatar_reply.map(subItem => {
                                    const { uid, text, user_avatar, user_name, created_at, id, like_counts, pic_urls, source } = subItem;
                                    const textHTML = { __html: text };
                                    return (
                                        <Comment
                                            key={id}
                                            className='reply-inner'
                                            content={
                                                <>
                                                    <div>
                                                        <span className='comment-user-name'>
                                                            <a>{avatar_uid === uid ? user_name + ' 博主：' : user_name + '：'}</a>
                                                        </span>
                                                        <span className='comment-text' dangerouslySetInnerHTML={textHTML}></span>
                                                    </div>
                                                    <div className='collapse operate-wrap'>
                                                        <div className='comments-msg float-l'>
                                                            <span>{formatTime(created_at)}</span>
                                                            <span>&nbsp;{source}</span>
                                                        </div>
                                                        <div className='operate float-r flex-center'>
                                                            <span className='iconfont icon-zhuanfa'></span>
                                                            <span className='iconfont icon-pinglun'></span>
                                                            <span className='iconfont icon-dianzan'>
                                                                {like_counts ? <span className='padding-l-6'>{like_counts}</span> : <></>}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            }
                                            actions={[
                                                reply.reply_count ? (
                                                    <span className='fold-comments' onClick={antiShake(fetchReply, 500, item)}>
                                                        <span>共{reply.reply_count}条回复</span>
                                                        <span className='iconfont icon-zhankai1'></span>
                                                    </span>
                                                ) : (
                                                    <></>
                                                )
                                            ]}
                                        ></Comment>
                                    );
                                })
                            }
                        ></Comment>
                    );
                })}
            </div>
        </div>
    );
}
