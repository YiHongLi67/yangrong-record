import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './blogfoot.css';
import { antiShake, getCls, _throttle } from '../../../static/utils/utils';
import { useEffect } from 'react';
import { getComment } from '../../../axios/api';
import { Modal } from 'antd';
import Comment from '../../comment/comment';
import { publish, subscribe, unsubscribe } from 'pubsub-js';
import PropTypes from 'prop-types';

let curPage = 1;
let prePage = 0;
let beforeTop = 0;
let fetchDone = true;
let curCommt = {};
let fetchReplyId;

function BlogFoot(props) {
    const { blogData, mid, avatar_uid, isAllCommt, allCommt, pathName } = props;
    const { reposts_count, comments_count, attitudes_count } = blogData;
    let [showDetail, setShowDetail] = useState(isAllCommt ? 'block' : 'none');
    let [partCommt, setPartCommt] = useState([]);
    let [modalOpen, setModalOpen] = useState(false);
    let [replyDetail, setReplyDetail] = useState([]);
    let [showEnd, setShowEnd] = useState('none');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReplyId = subscribe('fetchReply', (_, data) => {
            spreadReply(data.e, data.commtData);
        });
        return () => {
            unsubscribe(fetchReplyId);
        };
    }, []);

    async function fetchComment(e) {
        // 获取一级评论
        if (isAllCommt) {
            publish('blogCommtRefresh');
            return;
        }
        let parentNode = null;
        if (e.target.localName === 'span') {
            parentNode = e.target.parentNode;
        } else {
            parentNode = e.target;
        }
        if (showDetail === 'block') {
            setShowDetail('none');
            parentNode.classList.remove('comment-active-color');
            return;
        }
        let response = await getComment(avatar_uid, mid);
        setPartCommt(response.data);
        setShowDetail('block');
        parentNode.classList.add('comment-active-color');
    }

    function modalBodyScroll(e) {
        let currentTop = e.target.scrollTop;
        if (currentTop <= beforeTop) {
            // 向上滚动
            beforeTop = currentTop;
            return;
        }
        beforeTop = currentTop;
        if (e.target.scrollHeight - currentTop <= e.target.clientHeight + 400 && fetchDone && curPage !== prePage) {
            fetchDone = false;
            fetchReply(curPage, curCommt.rootid);
        }
    }

    async function fetchReply(page, rootid) {
        // 获取二级评论
        let response = await getComment(avatar_uid, mid, page, rootid);
        fetchDone = true;
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
        resetModal();
        setReplyDetail([]);
        setShowEnd('none');
        setTimeout(() => {
            const modalBody = document.querySelector('.ant-modal-body');
            const modalWrap = document.querySelector('.ant-modal-wrap');
            modalBody.onscroll = null;
            modalBody.onscroll = _throttle(modalBodyScroll, 200, { begin: true, end: true });
            if (!window.deviceIsPc) {
                modalWrap.style.top = 'unset';
            }
        }, 0);
    }

    function spreadReply(e, rootCommt) {
        if (rootCommt.mid === mid && pathName === window.location.pathname) {
            curPage = 1;
            prePage = 0;
            openModal();
            curCommt = rootCommt;
            fetchReply(curPage, rootCommt.rootid);
        }
    }

    function viewComment() {
        navigate(`/comment?mid=${mid}`, { state: { blogData, scrollTop: document.documentElement.scrollTop } });
    }

    function resetModal() {
        curPage = 1;
        prePage = 0;
        beforeTop = 0;
    }

    function getComCls() {
        let baseCls = 'flex flex-1 flex-row-center flex-col-center pointer';
        if (isAllCommt) return getCls('comment-active-color', baseCls);
        return baseCls;
    }

    return (
        <div className='blog-foot'>
            <div className='comment flex line-38'>
                <div className='flex flex-1 flex-row-center flex-col-center pointer'>
                    <span className='iconfont icon-31zhuanfa margin-r-8'></span>
                    <span className='font-12'>{reposts_count}</span>
                </div>
                <div className={getComCls()} onClick={antiShake(fetchComment, 500)}>
                    <span className='iconfont icon-pinglun margin-r-4'></span>
                    <span className='font-12'>{comments_count}</span>
                </div>
                <div className='flex flex-1 flex-row-center flex-col-center pointer'>
                    <span className='iconfont icon-dianzan margin-r-8'></span>
                    <span className='font-12'>{attitudes_count}</span>
                </div>
            </div>
            <div className='comment-detail' style={{ display: showDetail }}>
                {modalOpen ? (
                    <Modal
                        className='comment-detail modal-comment'
                        title={<div className='font-16 line-22 align-center'>{curCommt.reply.reply_count + '条回复'}</div>}
                        centered
                        width={window.deviceIsPc ? '45vw' : '100vw'}
                        bodyStyle={{ height: window.deviceIsPc ? '70vh' : '90vh', overflow: 'auto' }}
                        open={modalOpen}
                        onOk={() => setModalOpen(false)}
                        onCancel={() => setModalOpen(false)}
                        footer={null}
                        closeIcon={<span className='iconfont icon-guanbi line-22'></span>}
                    >
                        <Comment avatar_uid={avatar_uid} commtData={curCommt} replyDetail={replyDetail} isModal></Comment>
                        <div className='align-center font-12 padding-t-6 padding-b-6 margin-t-4 margin-b-4 w-sub' style={{ display: showEnd }}>
                            <span>没有更多回复了~</span>
                        </div>
                    </Modal>
                ) : (
                    <></>
                )}
                {allCommt
                    ? allCommt.map(item => {
                          return <Comment key={item.id} avatar_uid={avatar_uid} commtData={item}></Comment>;
                      })
                    : partCommt.map(item => {
                          return <Comment key={item.id} avatar_uid={avatar_uid} commtData={item}></Comment>;
                      })}
                {!isAllCommt ? (
                    <div className='align-center show-all line-25' onClick={viewComment}>
                        <span className='margin-r-2 font-12'>查看全部{comments_count}条评论</span>
                        <span className='iconfont icon-arrow-right-bold font-12'></span>
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}
BlogFoot.propTypes = {
    blogData: PropTypes.object.isRequired,
    mid: PropTypes.string.isRequired,
    avatar_uid: PropTypes.string.isRequired,
    isAllCommt: PropTypes.bool,
    allCommt: PropTypes.array,
    pathName: PropTypes.string.isRequired
};
BlogFoot.defaultProps = {
    isAllCommt: false
};
export default BlogFoot;
