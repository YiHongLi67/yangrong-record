import React, { useRef, useEffect } from 'react';
import { publish, subscribe, unsubscribe } from 'pubsub-js';
import './img.css';
import { getPropVal } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';

let changeStyleId;

function Img(props) {
    const width = getPropVal(props.width);
    const height = getPropVal(props.height);
    const { urls, idx, src, text, alt, objectFit, emitPreview, borderRadius, onClick } = props;
    const imgMask = useRef(null);
    const observerImg = useRef(null);

    useEffect(() => {
        if (!emitPreview) {
            // 不触发 preview 模态框, 即 preview->foot 下的缩略图, 激活当前预览图片对应的样式
            changeStyleId = subscribe('changeStyle', (_, data) => {
                if (data.current === idx) {
                    imgMask.current && imgMask.current.classList.remove('none');
                } else {
                    imgMask.current && imgMask.current.classList.add('none');
                }
            });
        }
        const Observer = new IntersectionObserver(entry => {
            if (entry[0].isIntersecting) {
                entry[0].target.setAttribute('src', src);
                Observer.unobserve(entry[0].target);
            }
        });
        Observer.observe(observerImg.current);
        return () => {
            unsubscribe(changeStyleId);
        };
    }, []);

    function setShow(e) {
        e.stopPropagation();
        if (emitPreview) {
            let parentNode = e.target.parentNode.parentNode;
            parentNode.setAttribute('data-show', 'true');
            publish('updateShow', { urls, idx, parentNode });
            onClick && onClick(e, idx);
        } else if (urls) {
            publish('changeImg', { urls, idx });
            onClick && onClick(e, idx);
        } else {
            onClick && onClick(e);
        }
    }

    return (
        <div className='img-wrap overflow-hid inline-block vertical-m relative' onClick={setShow} style={{ width, height, borderRadius }}>
            <img ref={observerImg} className='yr-img' src='' alt={alt} style={{ objectFit }} />
            <div className='img-mask absolute none' ref={imgMask}>
                {text}
            </div>
        </div>
    );
}

Img.propTypes = {
    // imagegroup 所需
    urls: PropTypes.array,
    idx: PropTypes.number,
    // img 所需
    src: PropTypes.string.isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    objectFit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none', 'scale-down']),
    text: PropTypes.string,
    alt: PropTypes.string,
    emitPreview: PropTypes.bool, // 点击图片是否触发预览模态框
    borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onclick: PropTypes.func
};

Img.defaultProps = {
    urls: null,
    idx: -1,
    iwidth: '150px',
    height: '',
    objectFit: 'cover',
    text: '预览',
    alt: '加载失败',
    emitPreview: false,
    borderRadius: 0
};

export default Img;
