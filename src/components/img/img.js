import React, { useRef, useEffect } from 'react';
import { publish } from 'pubsub-js';
import './img.css';
import { getPropVal } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';

function Img(props) {
    const width = getPropVal(props.width);
    const height = getPropVal(props.height);
    const { urls, idx, curIdx, src, text, alt, objectFit, emitPreview, borderRadius, lazy, onClick } = props;
    const imgMask = useRef(null);
    const observerImg = useRef(null);

    useEffect(() => {
        if (lazy) {
            const Observer = new IntersectionObserver(entry => {
                if (entry[0].isIntersecting) {
                    entry[0].target.setAttribute('src', src);
                    Observer.unobserve(entry[0].target);
                }
            });
            Observer.observe(observerImg.current);
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
            <img ref={observerImg} className='yr-img' src={lazy ? '' : src} alt={alt} style={{ objectFit }} />
            <div className='img-mask absolute none' ref={imgMask} style={{ display: idx === curIdx ? 'flex' : null }}>
                {text}
            </div>
        </div>
    );
}

Img.propTypes = {
    // imagegroup 所需
    urls: PropTypes.array,
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
