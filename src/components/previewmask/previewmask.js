import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import './previewmask.css';
import jQuery from 'jquery';
let ratio = 1;

export default function PreviewMask(props) {
    let $ = jQuery;
    let [showMask, setShowMask] = useState(false);
    let [current, setCurrent] = useState(0);
    let [urls, setUrls] = useState([]);
    let [src, setSrc] = useState('');
    let [scaleRatio, setScaleRatio] = useState(1);

    useEffect(() => {
        PubSub.subscribe('showMask', (_, data) => {
            setShowMask(data.isShow);
            setUrls(data.urls);
            setSrc(data.urls[data.idx]);
            setCurrent(data.idx);
            onImgLoad(data.urls[data.idx]);
        });
        PubSub.subscribe('loadNormal', (_, src) => {
            setScaleRatio((ratio = 1));
            document.querySelector('.preview-img').classList.add('no-trans');
            setSrc(src);
        });
        document.addEventListener('click', e => {
            if (e.target.id === 'preview-mask') {
                setShowMask(false);
                e.stopPropagation();
            }
        });
        document.addEventListener('wheel', throttle(scaleImg, 300));
        return () => {};
    }, []);

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
        setScaleRatio((ratio = 1));
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

    function scaleImg(e) {
        if (!document.querySelector('#preview-mask')) {
            return;
        }
        document.querySelector('.preview-img') && document.querySelector('.preview-img').classList.remove('no-trans');
        if (e.wheelDelta > 0) {
            if (ratio >= 50) {
                ratio += 0;
            } else if (ratio >= 28) {
                ratio += 8;
            } else if (ratio >= 16) {
                ratio += 6;
            } else if (ratio >= 8) {
                ratio += 4;
            } else if (ratio >= 4) {
                ratio += 2;
            } else {
                ratio += 1;
            }
            setScaleRatio(ratio);
        } else if (e.wheelDelta < 0) {
            if (ratio <= 1) {
                ratio -= 0;
            } else if (ratio <= 4) {
                ratio -= 1;
            } else if (ratio <= 8) {
                ratio -= 2;
            } else if (ratio <= 16) {
                ratio -= 4;
            } else if (ratio <= 28) {
                ratio -= 6;
            } else {
                ratio -= 8;
            }
            setScaleRatio(ratio);
        }
    }

    function grow() {
        document.querySelector('.preview-img') && document.querySelector('.preview-img').classList.remove('no-trans');
        setScaleRatio((ratio = 50));
    }

    function shrink() {
        document.querySelector('.preview-img') && document.querySelector('.preview-img').classList.remove('no-trans');
        setScaleRatio((ratio = 1));
    }

    // 节流
    function throttle(fn, wait) {
        let timer;
        return function (e) {
            if (!timer) {
                timer = setTimeout(() => {
                    fn.call(this, e);
                    timer = null;
                }, wait);
            }
        };
    }

    let dom = showMask ? (
        <div id='preview-mask' className='preview-mask h-v-full w-v-full fixed'>
            <img
                className='preview-img absolute absolute-center pointer'
                src={src}
                alt=''
                style={{ transform: `scale3d(${scaleRatio}, ${scaleRatio}, 1)` }}
            />
            <div className='mask-head fixed w-v-full'>
                <span className='progress relative'>
                    {current + 1} / {urls.length}
                </span>
                <span className='iconfont icon-24gl-delete' onClick={closeMask}></span>
                <span id='fangda' className='iconfont icon-fangda' onClick={throttle(grow, 300)}></span>
                <span id='suoxiao' className='iconfont icon-suoxiao' onClick={throttle(shrink, 300)}></span>
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
