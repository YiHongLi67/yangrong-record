import React, { useEffect } from 'react';
import PubSub from 'pubsub-js';
import './img.css';
import { useState } from 'react';

export default function Img(props) {
    let defaultProps = {
        alt: '',
        className: '',
        width: 200,
        height: 200,
        objectFit: 'cover'
    };
    let prefixCls = 'yr-img';
    let className = props.className ? ' ' + props.className : defaultProps.className;
    let alt = props.alt || defaultProps.alt;
    let width = props.width || defaultProps.width;
    let height = props.height || defaultProps.height;
    let objectFit;
    let objectFits = ['contain', 'cover', 'fill', 'none', 'scale-down'];
    if (Object.prototype.toString.call(props.objectFit) === '[object String]' && objectFits.indexOf(props.objectFit) !== -1) {
        objectFit = props.objectFit;
    } else {
        objectFit = defaultProps.objectFit;
    }
    let [urls] = useState(props.urls);
    let idx = props.idx;
    function showMask(e) {
        PubSub.publish('showMask', { isShow: true, urls, idx });
    }
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <>
            <div className='img-wrap overflow-hid inline-block vertical-m' onClick={showMask}>
                <img className={prefixCls + className} src={props.src} style={{ width: width + 'px', height: height + 'px', objectFit }} alt={alt} />
            </div>
        </>
    );
}
