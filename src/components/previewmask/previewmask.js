import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import './previewmask.css';
import jQuery from 'jquery';

export default function PreviewMask(props) {
    let $ = jQuery;
    let [showMask, setShowMask] = useState(false);
    let [current, setCurrent] = useState(0);
    let [urls, setUrls] = useState([]);
    let [src, setSrc] = useState('');

    function onImgLoad(src) {
        if (src.indexOf('thumbnail') !== -1) {
            src = src.replace('thumbnail', 'normal');
        }
        let img = new Image();
        img.src = src;
        $(img).on('load', function () {
            PubSub.publish('loadNormal', src);
        });
    }

    function closeMask() {
        setShowMask(false);
    }

    function preImg() {
        if (current > 0) {
            onImgLoad(urls[current - 1]);
            setCurrent(current => {
                return --current;
            });
        }
        if (current === 0) {
            setCurrent(0);
        }
    }

    function nextImg() {
        if (current < urls.length - 1) {
            onImgLoad(urls[current + 1]);
            setCurrent(current => {
                return ++current;
            });
        }
        if (current === urls.length - 1) {
            setCurrent(urls.length - 1);
        }
    }

    useEffect(() => {
        PubSub.subscribe('showMask', (_, data) => {
            setShowMask(data.isShow);
            setUrls(data.urls);
            setSrc(data.urls[data.idx]);
            setCurrent(data.idx);
            onImgLoad(data.urls[data.idx]);
        });
        PubSub.subscribe('loadNormal', (_, src) => {
            setSrc(src);
        });
        document.addEventListener('click', function (e) {
            if (e.target.id === 'preview-mask') {
                setShowMask(false);
                e.stopPropagation();
            }
        });
        return () => {};
    }, []);

    let dom = showMask ? (
        <div id='preview-mask' className='preview-mask h-v-full w-v-full fixed'>
            <img className='preview-img absolute absolute-center' src={src} alt='' />
            <div className='mask-head fixed w-v-full'>
                <span className='progress relative'>
                    {current + 1} / {urls.length}
                </span>
                <span className='iconfont icon-24gl-delete' onClick={closeMask}></span>
                <span className='iconfont icon-fangda'></span>
                <span className='iconfont icon-suoxiao'></span>
                <span className='iconfont icon-rotate-right'></span>
                <span className='iconfont icon-rotate-left'></span>
            </div>
            <div className='toggle-btn fixed w-v-full'>
                <div
                    className='flex-center margin-l-10'
                    onClick={preImg}
                    style={{
                        cursor: current === 0 ? 'no-drop' : 'pointer',
                        color: current === 0 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
                    }}>
                    <span className='iconfont icon-arrow-left-bold'></span>
                </div>
                <div
                    className='flex-center margin-r-10'
                    onClick={nextImg}
                    style={{
                        cursor: current === urls.length - 1 ? 'no-drop' : 'pointer',
                        color: current === urls.length - 1 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
                    }}>
                    <span className='iconfont icon-arrow-right-bold'></span>
                </div>
            </div>
            <div className='mask-foot fixed w-v-full'></div>
        </div>
    ) : (
        <></>
    );
    return dom;
}
