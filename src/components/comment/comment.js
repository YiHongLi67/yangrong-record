import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Comment as AntdComment } from 'antd';
import './comment.css';
import { formatTime, getCls, getMobileFont } from '../../static/utils/utils';
import Source from '../source/source';
import { antiShake, _throttle } from '../../static/utils/utils';
import PreviewMask from '../previewmask/previewmask';
import { publish } from 'pubsub-js';

function Comment(props) {
    const { avatar_uid, commtData, replyDetail, isModal } = props;
    const { uid, text, user_avatar, user_name, created_at, like_counts, pic_infos, reply, source } = commtData;
    let [previewOpen, setPreviewOpen] = useState(false);
    let replyCommt;
    if (isModal) {
        replyCommt = replyDetail;
    } else {
        replyCommt = reply.avatar_reply || [];
    }

    function fetchReply(e, commtData) {
        // 向 blogfoot 发布 fetchReply
        publish('fetchReply', { e, commtData });
    }

    function showPreview(e, idx) {
        setPreviewOpen(true);
        setTimeout(() => {
            publish('showMask', { urls: [pic_infos.thumbUrl] });
        }, 10);
    }

    return (
        <>
            <AntdComment
                avatar={<Avatar size={window.deviceIsPc ? 30 : 26} src={user_avatar} alt='头像无法访问' />}
                content={
                    <>
                        <div>
                            <span className='comment-user-name font-12 line-20'>
                                <a>
                                    {avatar_uid === uid
                                        ? user_name + ' 博主' + (window.innerWidth > 750 ? '：' : '')
                                        : user_name + (window.innerWidth > 750 ? '：' : '')}
                                </a>
                            </span>
                            <span
                                className={getCls(
                                    window.innerWidth > 750 ? 'font-14 line-20' : `block ${getMobileFont('comment-text')}`,
                                    'comment-text comment-text-l1'
                                )}
                                dangerouslySetInnerHTML={{ __html: text }}
                            ></span>
                        </div>
                        {pic_infos ? (
                            <div>
                                <Source
                                    src={pic_infos.thumbUrl}
                                    width={window.deviceIsPc ? `${120}px` : `400px`}
                                    text=''
                                    borderRadius={`${8}px`}
                                    sourceType={pic_infos.type}
                                    lazySource={pic_infos.type === 'gif' ? pic_infos.normalUrl : ''}
                                    emitPreview
                                    onClick={showPreview}
                                ></Source>
                            </div>
                        ) : (
                            <></>
                        )}
                        <div className='collapse font-12 line-20'>
                            <div className='comments-msg float-l'>
                                <span>{formatTime(created_at)}</span>
                                <span>&nbsp;{source}</span>
                            </div>
                            <div className='operate float-r flex-center'>
                                <span className='iconfont icon-31zhuanfa'></span>
                                <span className='iconfont icon-pinglun'></span>
                                <span className='iconfont icon-dianzan'>
                                    {like_counts ? <span className='padding-l-6 like font-12 float-r'>{like_counts}</span> : <></>}
                                </span>
                            </div>
                        </div>
                    </>
                }
                actions={
                    replyCommt.length
                        ? replyCommt.map(subCommt => {
                              const { uid, text, user_name, created_at, id, like_counts, source } = subCommt;
                              return (
                                  <AntdComment
                                      key={id}
                                      className='reply-inner'
                                      content={
                                          <>
                                              <div>
                                                  <span className='comment-user-name font-12 line-20'>
                                                      <a>
                                                          {avatar_uid === uid
                                                              ? user_name + ' 博主' + (isModal && window.innerWidth <= 750 ? '' : '：')
                                                              : user_name + (isModal && window.innerWidth > 750 ? '：' : '')}
                                                      </a>
                                                  </span>
                                                  <span
                                                      className={
                                                          getCls(isModal && window.innerWidth <= 750 ? 'block comment-text-l2' : '', 'comment-text') +
                                                          ' ' +
                                                          getCls(window.innerWidth > 750 ? 'font-14 line-20' : getMobileFont('comment-text'))
                                                      }
                                                      dangerouslySetInnerHTML={{ __html: text }}
                                                  ></span>
                                              </div>
                                              <div className='collapse operate-wrap font-12 line-20'>
                                                  <div className='comments-msg float-l'>
                                                      <span>{formatTime(created_at)}</span>
                                                      <span>&nbsp;{source}</span>
                                                  </div>
                                                  <div className='operate float-r flex-center'>
                                                      <span className='iconfont icon-31zhuanfa'></span>
                                                      <span className='iconfont icon-pinglun'></span>
                                                      <span className='iconfont icon-dianzan'>
                                                          {like_counts ? <span className='padding-l-6 font-12'>{like_counts}</span> : <></>}
                                                      </span>
                                                  </div>
                                              </div>
                                          </>
                                      }
                                      actions={[
                                          !isModal && reply.avatar_reply && reply.reply_count !== reply.avatar_reply.length ? (
                                              <span className='fold-comments' onClick={antiShake(fetchReply, 500, commtData)}>
                                                  <span className={window.innerWidth > 750 ? 'font-12' : getMobileFont('fold-comments')}>
                                                      共{reply.reply_count}条回复
                                                  </span>
                                                  <span className='iconfont icon-zhankai1'></span>
                                              </span>
                                          ) : (
                                              false
                                          )
                                      ].filter(Boolean)}
                                  ></AntdComment>
                              );
                          })
                        : [
                              <AntdComment
                                  className='reply-inner'
                                  actions={[
                                      !isModal && reply.reply_count ? (
                                          <span className='fold-comments' onClick={antiShake(fetchReply, 500, commtData)}>
                                              <span className={window.innerWidth > 750 ? 'font-12' : getMobileFont('fold-comments')}>
                                                  共{reply.reply_count}条回复
                                              </span>
                                              <span className='iconfont icon-zhankai1'></span>
                                          </span>
                                      ) : (
                                          false
                                      )
                                  ].filter(Boolean)}
                              ></AntdComment>
                          ]
                }
            ></AntdComment>
            {previewOpen && (
                <PreviewMask
                    urls={[pic_infos.thumbUrl]}
                    pic_infos={[pic_infos]}
                    onClose={() => {
                        setPreviewOpen(false);
                    }}
                    isCommt
                ></PreviewMask>
            )}
        </>
    );
}
Comment.propTypes = {
    isModal: PropTypes.bool,
    replyDetail: PropTypes.array
};
Comment.defaultProps = {
    isModal: false
};
export default Comment;
