import React, { useState, useEffect, useRef } from 'react';
import Img from '../img/img';
import './imagegroup.css';
import PreviewMask from '../previewmask/previewmask';
import PubSub from 'pubsub-js';
import { judgeType } from '../../static/utils/utils';

// previewmask 事件的回调函数

export default function ImageGroup(props) {
    let [urls] = useState(getUrls(props.urls));
    let imggroup = useRef(null);
    let [show, setShow] = useState(getShow());
    let [className] = useState(getCls(props.className));
    let [groupWidth] = useState(getSize(props.groupWidth));
    let [groupHeight] = useState(getSize(props.groupHeight));
    let [imgWidth] = useState(props.imgWidth);
    let [imgHeight] = useState(props.imgHeight);
    let [objectFit] = useState(props.objectFit);
    let [text] = useState(props.text);
    let [alt] = useState(props.alt);
    const { borderRadius } = props;

    useEffect(() => {
        PubSub.subscribe('updateShow', (_, data) => {
            setShow((show = getShow()));
            if (!show) {
                return;
            }
            setTimeout(() => {
                PubSub.publish('showMask', data);
            }, 10);
        });
        return () => {
            PubSub.unsubscribe('updateShow');
        };
    }, []);

    function getUrls(urls) {
        if (judgeType(urls) === 'array') {
            return urls;
        } else {
            return [];
        }
    }

    function getShow() {
        if (!imggroup.current) {
            return '';
        } else {
            return imggroup.current.getAttribute('data-show');
        }
    }

    function getCls(className) {
        if (judgeType(className) === 'string') {
            return 'img-group ' + className.trim();
        } else {
            return 'img-group';
        }
    }

    function getSize(size) {
        if (judgeType(size) === 'number') {
            return size + 'px';
        } else if (judgeType(size) === 'string') {
            return size;
        } else {
            return '';
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
            {show ? <PreviewMask></PreviewMask> : <></>}
        </div>
    );
}
