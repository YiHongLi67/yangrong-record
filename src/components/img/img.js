import React, { useRef, useEffect } from 'react';
import { publish } from 'pubsub-js';
import './img.css';
import { getPropVal } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';

function Img(props) {
    const width = getPropVal(props.width);
    const height = getPropVal(props.height);
    const { urls, sourceType, lazySource, idx, curIdx, src, text, alt, objectFit, emitPreview, borderRadius, lazy, onClick } = props;
    const imgMask = useRef(null);
    const observerImg = useRef(null);
    const observerVideo = useRef(null);

    useEffect(() => {
        if (lazy) {
            const imgTag = document.createElement('img');
            let timer;
            const imgObserver = new IntersectionObserver(img => {
                imgTag.onload = () => {
                    img[0].target.setAttribute('src', lazySource);
                    imgObserver.unobserve(img[0].target);
                };
                if (img[0].isIntersecting) {
                    img[0].target.setAttribute('src', src);
                    if (!lazySource) {
                        imgObserver.unobserve(img[0].target);
                        return;
                    }
                    // return;
                    if (sourceType === 'gif' || sourceType === 'jpg') {
                        timer = setTimeout(() => {
                            imgTag.src = lazySource;
                        }, 2000);
                    }
                    if (sourceType === 'mov') {
                        const videoTag = document.createElement('video');
                        videoTag.autoplay = 'autoplay';
                        videoTag.muted = 'muted';
                        const videoObserver = new IntersectionObserver(video => {
                            videoTag.onloadeddata = () => {
                                video[0].target.setAttribute('src', lazySource);
                                video[0].target.classList.add('z-index');
                                img[0].target.classList.remove('z-index');
                                videoObserver.unobserve(video[0].target);
                            };
                            if (video[0].isIntersecting) {
                                timer = setTimeout(() => {
                                    videoTag.src = lazySource;
                                }, 2000);
                            } else {
                                // 当 video 消失于视线时还未加载完成, 则结束 video 的加载
                                videoTag.src = '';
                                observerVideo.current && observerVideo.current.setAttribute('src', '');
                                clearTimeout(timer);
                                videoTag.onloadedmetadata = null;
                            }
                        });
                        videoObserver.observe(observerVideo.current);
                    }
                } else {
                    // 当 gif 消失于视线时还未加载完成, 则结束 gif 的加载
                    imgTag.src = '';
                    clearTimeout(timer);
                    imgTag.onload = null;
                }
            });
            imgObserver.observe(observerImg.current);
        }
        return () => {};
    }, []);

    function clickEvent(e) {
        e.stopPropagation();
        if (emitPreview) {
            // setShow
            let parentNode = e.target.parentNode.parentNode;
            parentNode.setAttribute('data-show', 'true');
            publish('updateShow', { urls, idx, parentNode });
            onClick && onClick(e, idx);
        } else if (urls) {
            onClick && onClick(e, idx);
        } else {
            onClick && onClick(e);
        }
    }

    return (
        <div className='img-wrap overflow-hid inline-block vertical-m relative' onClick={clickEvent} style={{ width, height, borderRadius }}>
            <img className='yr-img z-index' ref={observerImg} src={lazy ? '' : src} alt={alt} style={{ objectFit }} />
            {sourceType === 'mov' && (
                <video ref={observerVideo} className='yr-video' autoPlay muted loop src={lazy ? '' : lazySource} style={{ objectFit }}></video>
            )}
            {sourceType !== 'jpg' && (
                <span className='absolute source-type right-0 bottom-0' style={{ borderTopLeftRadius: borderRadius }}>
                    {sourceType === 'mov' ? 'Live' : '动图'}
                </span>
            )}
            <div className='img-mask absolute none' ref={imgMask} style={{ display: idx === curIdx ? 'flex' : null }}>
                {text}
            </div>
        </div>
    );
}

Img.propTypes = {
    // imagegroup 所需
    urls: PropTypes.array,
    sourceType: PropTypes.oneOf(['jpg', 'gif', 'mov']),
    lazySource: PropTypes.string,
    idx: PropTypes.number,
    // previewmask 所需
    curIdx: PropTypes.number,
    // img 所需
    src: PropTypes.string.isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    objectFit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none', 'scale-down']),
    text: PropTypes.string,
    alt: PropTypes.string,
    emitPreview: PropTypes.bool, // 点击图片是否触发预览模态框
    borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lazy: PropTypes.bool,
    onclick: PropTypes.func
};

Img.defaultProps = {
    urls: null,
    sourceType: 'jpg',
    lazySource: '',
    idx: -1,
    curIdx: -2,
    iwidth: '150px',
    height: '',
    objectFit: 'cover',
    text: '预览',
    alt: '加载失败',
    emitPreview: false,
    borderRadius: 0,
    lazy: true
};

export default Img;
