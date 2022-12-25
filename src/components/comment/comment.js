import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Comment as AntdComment } from 'antd';
import './comment.css';
import { formatTime } from '../../static/utils/utils';
import Source from '../source/source';
import { antiShake, _throttle } from '../../static/utils/utils';
import { publish } from 'pubsub-js';

function Comment(props) {
    const { avatar_uid, commtData, replyDetail, isModal } = props;
    const { uid, text, user_avatar, user_name, created_at, like_counts, pic_infos, reply, source } = commtData;
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

    return (
        <AntdComment
            avatar={<Avatar src={user_avatar} alt='头像无法访问' />}
            content={
                <>
                    <div>
                        <span className='comment-user-name'>
                            <a>{avatar_uid === uid ? user_name + ' 博主：' : user_name + '：'}</a>
                        </span>
                        <span className='comment-text' dangerouslySetInnerHTML={{ __html: text }}></span>
                    </div>
                    {pic_infos ? (
                        <div>
                            <Source
                                src={pic_infos.thumbUrl}
                                width='120px'
                                text=''
                                borderRadius='8px'
                                sourceType={pic_infos.type}
                                lazySource={pic_infos.type === 'gif' ? pic_infos.normalUrl : ''}
                            ></Source>
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
                            <span className='iconfont icon-dianzan'>{like_counts ? <span className='padding-l-6'>{like_counts}</span> : <></>}</span>
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
                                  actions={[
                                      !isModal && reply.avatar_reply && reply.reply_count !== reply.avatar_reply.length ? (
                                          <span className='fold-comments' onClick={antiShake(fetchReply, 500, commtData)}>
                                              <span>共{reply.reply_count}条回复</span>
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
                                          <span>共{reply.reply_count}条回复</span>
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
