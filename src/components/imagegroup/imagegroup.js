import React, { useState, useEffect, useRef } from 'react';
import Img from '../img/img';
import './imagegroup.css';
import PreviewMask from '../previewmask/previewmask';
import { publish, subscribe, unsubscribe } from 'pubsub-js';
import { judgeType, getCls } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';

let updateShowId;

function ImageGroup(props) {
    const { urls, objectFit, text, alt } = props;
    const className = getCls(props.className, 'img-group');
    const groupWidth = getSize(props.groupWidth);
    const groupHeight = getSize(props.groupHeight);
    const imgWidth = getSize(props.imgWidth);
    const imgHeight = getSize(props.imgHeight);
    const borderRadius = getBorderRadius(props.borderRadius);
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

    function getSize(size) {
        if (judgeType(size) === 'number') {
            return size + 'px';
        } else if (judgeType(size) === 'string') {
            return size;
        }
    }

    function getBorderRadius(borderRadius) {
        if (judgeType(borderRadius) === 'string') {
            return borderRadius;
        } else if (judgeType(borderRadius) === 'number') {
            return borderRadius + 'px';
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
                    ></Img>
                );
            })}
            {showPreview ? <PreviewMask></PreviewMask> : <></>}
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
    borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
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
    borderRadius: 0
};
export default ImageGroup;
