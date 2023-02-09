import React, { useRef, useEffect } from 'react';
import { getCls, getPropVal } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';
import defaultImg from '../../static/images/default_img.png';
// import axios from 'axios';
// const CancelToken = axios.CancelToken;

function Video(props) {
    const width = getPropVal(props.width);
    const height = getPropVal(props.height);
    const {
        className,
        urls,
        lazySrcType,
        idx,
        curIdx,
        src,
        poster,
        text,
        alt,
        objectFit,
        emitPreview,
        borderRadius,
        lazy,
        onClick,
        style,
        lazyTime
    } = props;
    const observerVideo = useRef(null);

    useEffect(() => {
        if (lazy) {
            // const source = CancelToken.source();
            let timer;
            const videoObserver = new IntersectionObserver(video => {
                if (video[0].isIntersecting) {
                    timer = setTimeout(() => {
                        video[0].target.setAttribute('src', src);
                        /**
                         * 方案一:
                         * 使用 axios 请求, 待资源完全下载完成后取消监视,
                         * 此方法用户等待时间过长且再次请求没有缓存, 没有请求完成视频不会播放, 体验感差
                         */
                        // axios({ method: 'get', url: lazySource, cancelToken: source.token })
                        //     .then(_ => {
                        //         imgObserver.unobserve(img[0].target);
                        //         videoObserver.unobserve(video[0].target);
                        //     })
                        //     .catch(_ => { });
                        /**
                         * 方案二:
                         * 监听 video ended 事件, 当视频播放完毕则视频肯定全部加载完成了, 此时取消监视
                         * 当设置为 loop 时, 无法监听 video ended 事件
                         */
                        video[0].target.onended = _ => {
                            videoObserver.unobserve(video[0].target);
                            video[0].target.play();
                            video[0].target.loop = true;
                        };
                    }, lazyTime);
                } else {
                    // 当 video 消失于视线时还未加载完成, 则结束 video 的加载
                    // source.cancel();
                    video[0].target.setAttribute('src', '');
                    clearTimeout(timer);
                }
            });
            videoObserver.observe(observerVideo.current);
        }
        return () => {};
    }, []);

    function playSpeed() {
        observerVideo.current.playbackRate = 0.5;
    }

    function loadErr() {
        const img = document.createElement('img');
        img.src = poster;
        img.onerror = () => {
            observerVideo.current.poster = defaultImg;
        };
    }

    return (
        <video
            ref={observerVideo}
            className={getCls(className || '', 'yr-video')}
            poster={poster}
            autoPlay
            muted
            src={lazy ? '' : src}
            style={{ objectFit, ...style }}
            onPlay={playSpeed}
            onError={loadErr}
        ></video>
    );
}

Video.propTypes = {
    // imagegroup 所需
    urls: PropTypes.array,
    lazySrcType: PropTypes.oneOf(['jpg', 'gif', 'mov']),
    lazySource: PropTypes.string,
    idx: PropTypes.number,
    // previewmask 所需
    curIdx: PropTypes.number,
    // video 所需
    className: PropTypes.string,
    style: PropTypes.object,
    src: PropTypes.string.isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    objectFit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none', 'scale-down']),
    text: PropTypes.string,
    alt: PropTypes.string,
    emitPreview: PropTypes.bool, // 点击图片是否触发预览模态框
    borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lazy: PropTypes.bool,
    onclick: PropTypes.func,
    lazyTime: PropTypes.number
};

Video.defaultProps = {
    urls: null,
    lazySrcType: 'jpg',
    lazySource: '',
    idx: -1,
    curIdx: -2,
    iwidth: '150px',
    height: '',
    objectFit: 'cover',
    text: '预览',
    alt: '',
    emitPreview: false,
    borderRadius: 0,
    lazy: true,
    style: {},
    lazyTime: 1000
};

export default Video;
