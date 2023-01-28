import React, { useRef, useEffect } from 'react';
import { publish } from 'pubsub-js';
import './source.css';
import { getCls, getPropVal } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';
import Img from '../img/img';
import Video from '../video/video';
// import axios from 'axios';
// const CancelToken = axios.CancelToken;

function Source(props) {
    const width = getPropVal(props.width);
    const height = getPropVal(props.height);
    const { urls, pic_num, sourceType, lazySource, lazySrcType, idx, curIdx, src, text, alt, objectFit, emitPreview, borderRadius, lazy, onClick } =
        props;
    const imgMask = useRef(null);

    useEffect(() => {
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
        const reg = /^\d+/;
        if (pic_num && reg.test(width)) {
            return `${width.match(/^\d+/) * 1.2}%`;
        }
        return width;
    }

    return (
        <div
            className='img-wrap overflow-hid inline-block vertical-m relative'
            onClick={clickEvent}
            style={{ width, height, borderRadius, paddingTop: getHeight() }}
        >
            {lazySource ? (
                lazySrcType === 'mov' || lazySrcType === 'mp4' ? (
                    <Video poster={src} src={lazySource} />
                ) : lazySrcType === 'jpg' || lazySrcType === 'gif' ? (
                    <Img src={src} lazySource={lazySource} />
                ) : (
                    <></>
                )
            ) : (
                <Img src={src} lazy={false} />
            )}
            {sourceType !== 'jpg' && (
                <span
                    className={getCls(sourceType === 'mov' ? 'mov' : '', 'absolute source-type right-0 bottom-0')}
                    style={{ borderTopLeftRadius: borderRadius }}
                >
                    {sourceType === 'mov' ? 'Live' : '动图'}
                </span>
            )}
            <div className='img-mask absolute none' ref={imgMask} style={{ display: idx === curIdx ? 'flex' : null }}>
                {text}
            </div>
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

Source.defaultProps = {
    urls: null,
    sourceType: 'jpg',
    lazySource: '',
    lazySrcType: 'jpg',
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

export default Source;
