import React, { useState, useEffect, useRef } from 'react';
import Img from '../img/img';
import './imagegroup.css';
import PreviewMask from '../previewmask/previewmask';
import { publish, subscribe, unsubscribe } from 'pubsub-js';
import { getCls, getPropVal } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';

let updateShowId;

function ImageGroup(props) {
    const { urls, objectFit, text, alt, emitPreview } = props;
    const className = getCls(props.className, 'img-group');
    const groupWidth = getPropVal(props.groupWidth);
    const groupHeight = getPropVal(props.groupHeight);
    const imgWidth = getPropVal(props.imgWidth);
    const imgHeight = getPropVal(props.imgHeight);
    const borderRadius = getPropVal(props.borderRadius);
    const imggroup = useRef(null);
    let [showPreview, setShowPreview] = useState(getShow());

    useEffect(() => {
        updateShowId = subscribe('updateShow', (_, data) => {
            const isShowPreview = getShow();
            setShowPreview(isShowPreview);
            if (!isShowPreview) {
                return;
            }
            setTimeout(() => {
                publish('showMask', data);
            }, 10);
        });
        return () => {
            unsubscribe(updateShowId);
        };
    }, []);

    function getShow() {
        if (!imggroup.current) {
            return '';
        } else {
            return imggroup.current.getAttribute('data-show');
        }
    }

    return (
        <div ref={imggroup} className={className} style={{ width: groupWidth, height: groupHeight }}>
            {urls.map((url, idx) => {
                return (
                    <Img
                        key={url + idx}
                        src={url}
                        idx={idx}
                        urls={urls}
                        width={imgWidth}
                        height={imgHeight}
                        objectFit={objectFit}
                        text={text}
                        alt={alt}
                        borderRadius={borderRadius}
                        emitPreview={emitPreview}
                    ></Img>
                );
            })}
            {showPreview ? <PreviewMask urls={urls}></PreviewMask> : <></>}
        </div>
    );
}

ImageGroup.propTypes = {
    urls: PropTypes.array.isRequired,
    className: PropTypes.string,
    groupWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    groupHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    imgWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    imgHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    objectFit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none', 'scale-down']),
    text: PropTypes.string,
    alt: PropTypes.string,
    borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    emitPreview: PropTypes.bool
};

ImageGroup.defaultProps = {
    className: '',
    groupWidth: '',
    groupHeight: '',
    imgWidth: '',
    imgHeight: '',
    objectFit: 'cover',
    text: '预览',
    alt: '加载失败',
    borderRadius: 0,
    emitPreview: true
};

export default ImageGroup;
