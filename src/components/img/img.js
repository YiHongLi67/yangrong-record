import React, { useRef, useEffect } from 'react';
import { getCls, getPropVal } from '../../static/utils/utils';
import defaultImg from '../../static/images/default_img.png';
import { PropTypes } from 'prop-types';
// import axios from 'axios';
// const CancelToken = axios.CancelToken;

function Img(props) {
    const {
        className,
        lazySrcType,
        lazySource,
        idx,
        curIdx,
        src,
        text,
        alt,
        objectFit,
        emitPreview,
        borderRadius,
        lazy,
        onClick,
        style,
        lazyTime,
        isPreview
    } = props;
    const observerImg = useRef(null);

    useEffect(() => {
        init();
        return () => {};
    }, [props.curIdx]);

    function init() {
        if (lazy) {
            interObs();
        } else {
            bindErrEvent();
        }
    }

    function interObs() {
        const imgTag = document.createElement('img');
        let timer;
        const imgObserver = new IntersectionObserver(img => {
            imgTag.onload = () => {
                img[0].target.setAttribute('src', lazySource);
                bindErrEvent();
                imgObserver.unobserve(img[0].target);
            };
            if (img[0].isIntersecting) {
                img[0].target.setAttribute('src', src);
                bindErrEvent();
                if (!lazySource) {
                    // 如果 lazySource 不存在, 则直接取消观察, 不加载 lazySource
                    imgObserver.unobserve(img[0].target);
                    return;
                }
                if (lazySrcType === 'jpg' || lazySrcType === 'gif') {
                    // 如果 lazySource 存在, 并且 lazySrcType 是 gif 或者 jpg, 则加载 lazySource
                    timer = setTimeout(() => {
                        imgTag.src = lazySource;
                    }, lazyTime);
                }
            } else {
                // 当 gif 消失于视线时还未加载完成, 则结束 gif 的加载
                imgTag.src = '';
                clearTimeout(timer);
                imgTag.onload = null;
            }
        });
        observerImg.current && imgObserver.observe(observerImg.current);
    }

    function bindErrEvent() {
        if (observerImg.current) {
            observerImg.current.onError = function () {
                observerImg.current.src = defaultImg;
            };
        }
    }

    return (
        <img
            className={getCls(className || '', 'yr-img')}
            ref={observerImg}
            src={lazy && !isPreview ? '' : src}
            alt={alt}
            style={{ objectFit, ...style }}
        />
    );
}

Img.propTypes = {
    // imagegroup 所需
    lazySrcType: PropTypes.oneOf(['jpg', 'gif', 'mov']),
    lazySource: PropTypes.string,
    idx: PropTypes.number,
    // previewmask 所需
    curIdx: PropTypes.number,
    // img 所需
    className: PropTypes.string,
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
    style: PropTypes.object,
    lazyTime: PropTypes.number,
    isPrevie: PropTypes.bool
};

Img.defaultProps = {
    lazySrcType: 'jpg',
    lazySource: '',
    idx: -1,
    curIdx: -2,
    width: '150px',
    height: '',
    objectFit: 'cover',
    text: '预览',
    alt: '',
    emitPreview: false,
    borderRadius: 0,
    lazy: true,
    style: {},
    lazyTime: 1000,
    isPrevie: false
};

export default Img;
