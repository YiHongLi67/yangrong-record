import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './blogfoot.css';
import { antiShake, _throttle } from '../../../static/utils/utils';
import { useEffect } from 'react';
import { getComment } from '../../../axios/api';
import { Modal } from 'antd';
import BlogComment from '../../comment/comment';
import { subscribe, unsubscribe } from 'pubsub-js';

let curPage = 1;
let prePage = 0;
let curCommt = {};

export default function BlogFoot(props) {
    const { blogData, mid, avatar_uid, isAllCommt, allCommtData } = props;
    const { reposts_count, comments_count, attitudes_count } = blogData;
    let [display, setDisplay] = useState(isAllCommt ? 'block' : 'none');
    let [comment, setComment] = useState([]);
    let [modalOpen, setModalOpen] = useState(false);
    let [replyDetail, setReplyDetail] = useState([]);
    let [beforeTop, setBeforeTop] = useState(0);
    let [fetchDone, setFetchDone] = useState(true);
    let [showEnd, setShowEnd] = useState('none');
    const navigate = useNavigate();

    async function fetchComment() {
        // 获取一级评论
        if (isAllCommt) {
            return;
        }
        let response = await getComment(avatar_uid, mid);
        setComment(response.data);
        if (display === 'none') {
            setDisplay('block');
        } else {
            setDisplay('none');
        }
    }

    function modalBodyScroll(e) {
        let currentTop = e.target.scrollTop;
        if (currentTop <= beforeTop) {
            // 向上滚动
            setBeforeTop(currentTop);
            return;
        }
        setBeforeTop(currentTop);
        if (e.target.scrollHeight - currentTop <= e.target.clientHeight + 400 && fetchDone && curPage !== prePage) {
            fetchReply(curPage, curCommt.rootid);
        }
    }

    async function fetchReply(page, rootid) {
        // 获取二级评论
        let response = await getComment(avatar_uid, mid, page, rootid);
        setFetchDone(true);
        prePage = page;
        if (response.data.length > 0) {
            setReplyDetail(replyDetail => {
                return [...replyDetail, ...response.data];
            });
        }
        if (response.isEnd) {
            setShowEnd('block');
            return;
        }
        curPage = page + 1;
    }

    function openModal() {
        setModalOpen(true);
        setReplyDetail([]);
        setShowEnd('none');
        setTimeout(() => {
            document.querySelector('.ant-modal-body').addEventListener('scroll', _throttle(modalBodyScroll, 200));
        }, 0);
    }

    function spreadReply(e, rootCommt, page) {
        if (rootCommt.mid === mid) {
            openModal();
            curCommt = rootCommt;
            fetchReply(page, rootCommt.rootid);
        }
    }

    function viewComment() {
        navigate(`/comment?mid=${mid}`, { state: blogData });
    }

    function closeModal() {
        curPage = 1;
        prePage = 0;
    }

    useEffect(() => {
        subscribe('fetchReply', (_, data) => {
            spreadReply(data.e, data.commtData, 1);
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
                        afterClose={closeModal}
                        closeIcon={<span className='iconfont icon-guanbi'></span>}
                    >
                        <BlogComment avatar_uid={avatar_uid} commtData={curCommt} replyDetail={replyDetail} isModal></BlogComment>
                        <div className='align-center font-12 padding-t-6 padding-b-6 margin-t-4 margin-b-4 w-sub' style={{ display: showEnd }}>
                            <span>没有更多回复了~</span>
                        </div>
                    </Modal>
                ) : (
                    <></>
                )}
                {allCommtData
                    ? allCommtData.map(item => {
                          return <BlogComment key={item.id} avatar_uid={avatar_uid} commtData={item}></BlogComment>;
                      })
                    : comment.map(item => {
                          return <BlogComment key={item.id} avatar_uid={avatar_uid} commtData={item}></BlogComment>;
                      })}
                {!isAllCommt ? (
                    <div className='align-center all-comment line-25' onClick={viewComment}>
                        <span className='margin-r-2'>查看全部{comments_count}条评论</span>
                        <span className='iconfont icon-arrow-right-bold font-12'></span>
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}
