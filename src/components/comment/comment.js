import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Comment as AntdComment } from 'antd';
import './comment.less';
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

    useEffect(() => {
        Array.from(document.querySelectorAll('.url-icon')).map(imgIcon => {
            const className = window.isPC ? '' : getMobileFont('comment-text').split(' ')[1].match(/\d+/);
            imgIcon.classList.add(`height-${className}`);
        });
        return () => {};
    });

    return (
        <>
            <AntdComment
                avatar={<Avatar size={window.isPC ? 30 : 26} src={user_avatar} alt='头像无法访问' />}
                content={
                    <>
                        <div>
                            <span className='comment-user-name font-12 line-12'>
                                <a className={window.isPC ? '' : getMobileFont('comment-user-name')}>
                                    {avatar_uid === uid ? user_name + ' 博主' + (window.isPC ? '：' : '') : user_name + (window.isPC ? '：' : '')}
                                </a>
                            </span>
                            <span
                                className={getCls(
                                    window.isPC ? 'font-14 line-12' : `block ${getMobileFont('comment-text')}`,
                                    'comment-text comment-text-l1'
                                )}
                                dangerouslySetInnerHTML={{ __html: text }}
                            ></span>
                        </div>
                        {pic_infos ? (
                            <div>
                                <Source
                                    src={pic_infos.thumbUrl}
                                    width={window.isPC ? `${120}px` : `320px`}
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
                        <div className={getCls(window.isPC ? 'font-12 line-12' : 'font-14 line-14', 'clear operate-wrap')}>
                            <div className='comments-msg float-l'>
                                <span>{formatTime(created_at)}</span>
                                <span>&nbsp;{source}</span>
                            </div>
                            <div className='operate float-r flex-center'>
                                <span className='iconfont icon-31zhuanfa'></span>
                                <span className='iconfont icon-pinglun'></span>
                                <span className='iconfont icon-dianzan'>
                                    {like_counts ? (
                                        <span className={getCls(window.isPC ? 'font-12 line-12' : 'font-14 line-14', 'padding-l-6 like')}>
                                            {like_counts}
                                        </span>
                                    ) : (
                                        <></>
                                    )}
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
                                              <div className='clear'>
                                                  <span
                                                      className={
                                                          getCls(window.isPC ? '' : getMobileFont('comment-user-name') + '', 'comment-user-name') +
                                                          (!window.isPC && !isModal ? ' float-l' : '')
                                                      }
                                                  >
                                                      <a
                                                          className={
                                                              'inline-block' +
                                                              (!window.isPC && !isModal ? ` ${getMobileFont('comment-text').split(' ')[1]}` : '')
                                                          }
                                                      >
                                                          {avatar_uid === uid
                                                              ? user_name + ' 博主' + (isModal && !window.isPC ? '' : '：')
                                                              : user_name + (isModal && window.isPC ? '：' : '')}
                                                      </a>
                                                  </span>
                                                  <span
                                                      className={
                                                          getCls(isModal && !window.isPC ? 'block comment-text-l2' : '', 'comment-text') +
                                                          ' ' +
                                                          getCls(window.isPC ? 'font-14 line-12' : getMobileFont('comment-text'))
                                                      }
                                                      dangerouslySetInnerHTML={{ __html: text }}
                                                  ></span>
                                              </div>
                                              <div className={getCls(window.isPC ? 'font-12 line-12' : 'font-14 line-14', 'clear operate-wrap')}>
                                                  <div className='comments-msg float-l'>
                                                      <span>{formatTime(created_at)}</span>
                                                      <span>&nbsp;{source}</span>
                                                  </div>
                                                  <div className='operate float-r flex-center'>
                                                      <span className='iconfont icon-31zhuanfa'></span>
                                                      <span className='iconfont icon-pinglun'></span>
                                                      <span className='iconfont icon-dianzan'>
                                                          {like_counts ? (
                                                              <span
                                                                  className={getCls(
                                                                      window.isPC ? 'font-12 line-12' : 'font-14 line-14',
                                                                      'padding-l-6 like'
                                                                  )}
                                                              >
                                                                  {like_counts}
                                                              </span>
                                                          ) : (
                                                              <></>
                                                          )}
                                                      </span>
                                                  </div>
                                              </div>
                                          </>
                                      }
                                      actions={[
                                          !isModal && reply.avatar_reply && reply.reply_count !== reply.avatar_reply.length ? (
                                              <span
                                                  className='fold-comments inline-flex flex-col-center'
                                                  onClick={antiShake(fetchReply, 500, commtData)}
                                              >
                                                  <span className={window.isPC ? 'font-12' : getMobileFont('fold-comments')}>
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
                                          <span className='fold-comments inline-flex flex-col-center' onClick={antiShake(fetchReply, 500, commtData)}>
                                              <span className={window.isPC ? 'font-12' : getMobileFont('fold-comments')}>
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
