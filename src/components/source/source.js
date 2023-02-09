import React, { useRef, useEffect } from 'react';
import { publish } from 'pubsub-js';
import './source.css';
import { getCls, getPropVal, judgeType } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';
import Img from '../img/img';
import Video from '../video/video';
import touch from 'touchjs';
import { useState } from 'react';

function Source(props) {
    const className = getPropVal(props.className);
    const width = getPropVal(props.width);
    const height = getPropVal(props.height);
    const paddingTop = getPropVal(props.paddingTop);
    const {
        urls,
        pic_num,
        sourceType,
        lazySrcType,
        src,
        text,
        idx,
        curIdx,
        alt,
        objectFit,
        emitPreview,
        borderRadius,
        lazy,
        onClick,
        showMask,
        style,
        sourceCls,
        lazyTime,
        isPreview
    } = props;
    let lazySource;
    if (isPreview) {
        if (curIdx === idx) {
            lazySource = props.lazySource;
        } else {
            lazySource = '';
        }
    } else {
        lazySource = props.lazySource;
    }
    const imgWrap = useRef(null);

    useEffect(() => {
        if (window.isPC) return;
        touch.on(imgWrap.current, 'tap', clickEvent);
        return () => {};
    }, []);

    function clickEvent(e) {
        e.stopPropagation();
        if (emitPreview && urls) {
            // blog setShow
            let parentNode = e.target.parentNode.parentNode;
            parentNode.setAttribute('data-show', 'true');
            publish('updateShow', { urls, idx, parentNode });
        }
        onClick && onClick(e, idx);
    }

    function getHeight() {
        if (paddingTop) return paddingTop;
        const reg = /^\d+/;
        if (pic_num && reg.test(width)) {
            return `${width.match(/^\d+/) * 1.2}%`;
        }
        return width;
    }

    return (
        <div
            className={getCls(className || '', 'img-wrap overflow-hid inline-block vertical-m relative')}
            onClick={window.isPC ? clickEvent : null}
            style={{ width, height, borderRadius, paddingTop: getHeight() }}
            ref={imgWrap}
        >
            {lazySource ? (
                lazySrcType === 'mov' || lazySrcType === 'mp4' ? (
                    <Video
                        className={sourceCls}
                        poster={src}
                        src={lazySource}
                        objectFit={objectFit}
                        style={style}
                        lazyTime={lazyTime}
                        curIdx={curIdx}
                        idx={idx}
                        isPreview={isPreview}
                    />
                ) : lazySrcType === 'jpg' || lazySrcType === 'gif' ? (
                    <Img
                        className={sourceCls}
                        src={src}
                        lazySource={lazySource}
                        objectFit={objectFit}
                        style={style}
                        lazyTime={lazyTime}
                        curIdx={curIdx}
                        idx={idx}
                        isPreview={isPreview}
                    />
                ) : (
                    <></>
                )
            ) : (
                <Img
                    className={sourceCls}
                    src={src}
                    lazy={false}
                    objectFit={objectFit}
                    style={style}
                    curIdx={curIdx}
                    idx={idx}
                    isPreview={isPreview}
                />
            )}
            {sourceType !== 'jpg' && (
                <span
                    className={getCls(sourceType === 'mov' ? 'mov' : '', 'absolute source-type right-0 bottom-0')}
                    style={{ borderTopLeftRadius: borderRadius }}
                >
                    {sourceType === 'mov' ? 'Live' : '动图'}
                </span>
            )}
            {showMask && (
                <div className='img-mask absolute none' style={{ display: idx === curIdx ? 'flex' : null }}>
                    {text}
                </div>
            )}
        </div>
    );
}

Source.propTypes = {
    // imagegroup 所需
    urls: PropTypes.array,
    pic_num: PropTypes.number,
    sourceType: PropTypes.oneOf(['jpg', 'gif', 'mov']),
    lazySource: PropTypes.string,
    lazySrcType: PropTypes.oneOf(['jpg', 'gif', 'mov', 'mp4']),
    idx: PropTypes.number,
    // previewmask 所需
    curIdx: PropTypes.number,
    isPreview: PropTypes.bool,
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
    paddingTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    showMask: PropTypes.bool,
    style: PropTypes.object,
    sourceCls: PropTypes.string,
    lazyTime: PropTypes.number
};

Source.defaultProps = {
    urls: null,
    sourceType: 'jpg',
    lazySource: '',
    lazySrcType: 'jpg',
    idx: -1,
    curIdx: -2,
    isPreview: false,
    width: '150px',
    height: '',
    objectFit: 'cover',
    text: '预览',
    alt: '',
    emitPreview: false,
    borderRadius: 0,
    lazy: true,
    showMask: true,
    style: {}
};

export default Source;
