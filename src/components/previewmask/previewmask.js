import React, { useEffect, useState } from 'react';
import PubSub from 'pubsub-js';
import './previewmask.css';
import jQuery from 'jquery';
let ratio = 1;
let ismouseup = false,
    ismousemove = false;

export default function PreviewMask(props) {
    let $ = jQuery;
    let [showMask, setShowMask] = useState(false);
    let [current, setCurrent] = useState(0);
    let [urls, setUrls] = useState([]);
    let [src, setSrc] = useState('');
    let [scaleRatio, setScaleRatio] = useState(1);
    let [transX, setTransX] = useState(0);
    let [transY, setTransY] = useState(0);
    let [rotate, setRotate] = useState(0);
    let [isFullScreen, setIsFullScreen] = useState(false);
    let throttleMove;
    let maskMove = throttle(() => {
        ismousemove = true;
    }, 300);

    useEffect(() => {
        PubSub.subscribe('showMask', (_, data) => {
            setShowMask(data.isShow);
            setUrls(data.urls);
            setSrc(data.urls[data.idx]);
            setCurrent(data.idx);
            onImgLoad(data.urls[data.idx]);
        });
        document.body.onmousedown = function () {
            return false;
        };
        document.addEventListener('wheel', throttle(scaleImg, 200));
        return () => {};
    }, []);

    function onImgLoad(src) {
        if (src.indexOf('thumbnail') !== -1) {
            src = src.replace('thumbnail', 'normal');
        }
        let img = new Image();
        img.src = src;
        $(img).on('load', function () {
            // 加载大图
            setSrc(src);
        });
    }

    function closeMask(e) {
        if (ismousemove && ismouseup) {
            return;
        }
        if (e.target.id === 'preview-mask' || e.target.id === 'close') {
            setShowMask(false);
            setScaleRatio((ratio = 1));
            setTransX((transX = 0));
            setTransY((transY = 0));
            setRotate((rotate = 0));
        }
    }
    function toggleImg() {
        setCurrent(current);
        setSrc(urls[current]);
        setTransX((transX = 0));
        setTransY((transY = 0));
        setScaleRatio((ratio = 1));
        setRotate((rotate = 0));
        document.querySelector('.preview-img').classList.add('no-trans');
        onImgLoad(urls[current]);
    }

    function preImg() {
        if (current === 0) {
            setCurrent(0);
            return;
        }
        current--;
        toggleImg();
    }

    function nextImg() {
        if (current === urls.length - 1) {
            setCurrent(current);
            return;
        }
        current++;
        toggleImg();
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
        } else {
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
            if (ratio === 1) {
                setTransX((transX = 0));
                setTransY((transY = 0));
            }
        }
        setScaleRatio(ratio);
    }

    function grow() {
        document.querySelector('.preview-img') && document.querySelector('.preview-img').classList.remove('no-trans');
        setScaleRatio((ratio = 50));
    }

    function shrink() {
        document.querySelector('.preview-img') && document.querySelector('.preview-img').classList.remove('no-trans');
        setScaleRatio((ratio = 1));
        setTransX((transX = 0));
        setTransY((transY = 0));
    }

    // 节流
    function throttle(fn, wait, ...args) {
        let pre = 0;
        return function (e) {
            // 事件的回调函数
            let now = new Date();
            if (now - pre > wait) {
                fn.call(this, e, ...args);
                pre = now;
            }
        };
    }

    function mousedown(e) {
        document.querySelector('.preview-img').classList.remove('no-trans');
        // 获取元素当前的偏移量
        let tx = transX;
        let ty = transY;
        // 记录鼠标的起始位置
        let startX = e.clientX;
        let startY = e.clientY;
        throttleMove = throttle(move, 100, tx, ty, startX, startY);
        document.addEventListener('mousemove', throttleMove);
        document.addEventListener('mouseup', up);
        e.stopPropagation();
        e.preventDefault();
    }

    function move(e, ...args) {
        ismousemove = true;
        transX = args[0] + (e.clientX - args[2]) / ratio;
        transY = args[1] + (e.clientY - args[3]) / ratio;
        // setTransX((transX = args[0] + (e.clientX - args[2]) / ratio));
        // setTransY((transY = args[1] + (e.clientY - args[3]) / ratio));
        e.stopPropagation();
        let borderX,
            borderY,
            imgWidth = $('.preview-img').width(),
            imgHeight = $('.preview-img').height(),
            winWidth = window.innerWidth,
            winHeight = window.innerHeight;
        // 缩放比例为 1, 拖动的边界值在 mouseup 时设置为 0, 即无论怎么拖拽都是原始位置
        if (ratio === 1) {
            setTransX(transX);
            setTransY(transY);
            return;
        }
        // 缩放比例大于 1, 给拖拽设置边界值
        // 如果旋转后宽高未置反
        if (!isRotate()) {
            if (imgWidth * ratio < winWidth) {
                borderX = (winWidth - imgWidth * ratio) / 2 / ratio;
            } else {
                borderX = (imgWidth * ratio - winWidth) / 2 / ratio;
            }
            borderY = (imgHeight * (ratio - 1)) / 2 / ratio;
        } else {
            // 旋转后宽高置反
            // 缩放后图片的高度小于窗口宽度
            if (imgHeight * ratio < winWidth) {
                /**
                 * 可向左 / 向右拖拽的最大距离: (窗口宽度 - 图片高度 * 缩放比例) / 2 / 缩放比例
                 * 除以 2 是图片居中, 上下可 translate 的距离均分
                 * 为何除以缩放比例 ratio, 摸索出来的
                 */
                borderX = (winWidth - imgHeight * ratio) / 2 / ratio;
            } else {
                borderX = (imgHeight * ratio - winWidth) / 2 / ratio;
            }
            // 缩放后图片的宽度小于窗口高度
            if (imgWidth * ratio < winHeight) {
                /**
                 * 可向上 / 向下拖拽最的大距离: (窗口高度 - 图片宽度 * 缩放比例) / 2 / 缩放比例
                 * 由于图片高度为100%, 所以宽口高度 winHeight 也就是图片高度 imgHeight
                 */
                borderY = (imgHeight - imgWidth * ratio) / 2 / ratio;
            } else {
                borderY = (imgWidth * ratio - imgHeight) / 2 / ratio;
            }
        }
        if (transX >= borderX) {
            // 向右拖拽
            transX = borderX;
        }
        if (transX <= -borderX) {
            // 向左拖拽
            transX = -borderX;
        }
        if (transY >= borderY) {
            // 向下拖拽
            transY = borderY;
        }
        if (transY <= -borderY) {
            // 向上拖拽
            transY = -borderY;
        }
        // 缩放比例大于 1, 在 mousemove 的时候设置边界值
        setTransX(transX);
        setTransY(transY);
    }

    function up(e) {
        if (ratio === 1) {
            // 如果缩放比例等于 1, 在 mouseup 的时候设置边界值为 0
            setTransX((transX = 0));
            setTransY((transY = 0));
        }
        document.querySelector('.preview-img').classList.add('no-trans');
        e.stopPropagation();
        setShowMask((showMask = true));
        ismouseup = true;
        setTimeout(function () {
            ismouseup = false;
            ismousemove = false;
        }, 200);
        document.removeEventListener('mousemove', throttleMove);
        document.removeEventListener('mouseup', up);
    }

    function maskDown() {
        // 解决拖拽功能按钮释放鼠标后 preview-mask 会关闭的bug
        document.addEventListener('mousemove', maskMove);
        document.addEventListener('mouseup', maskUp);
    }

    function maskUp() {
        ismouseup = true;
        setTimeout(() => {
            ismouseup = false;
            ismousemove = false;
        }, 200);
        document.removeEventListener('mousemove', maskMove);
        document.removeEventListener('mouseup', maskUp);
    }

    function isRotate() {
        let remainder = (rotate / 90) % 2;
        return remainder === 1 || remainder === -1;
    }

    function rotateLeft(e) {
        setRotate(rotate => {
            return rotate - 90;
        });
    }

    function rotateRight(e) {
        setRotate(rotate => {
            return rotate + 90;
        });
    }

    function fullScreen(e) {
        const isFullScreen = document.webkitIsFullScreen || document.mozFullScreen || false;
        setIsFullScreen(!isFullScreen);
        if (isFullScreen) {
            document.exitFullscreen();
        } else {
            document.querySelector('.preview-mask').requestFullscreen();
        }
    }

    let dom = showMask ? (
        <div id='preview-mask' className='preview-mask h-v-full w-v-full fixed' onClick={closeMask} onMouseDown={maskDown}>
            <img
                id='preview-img'
                className='preview-img absolute absolute-center pointer'
                src={src}
                alt='translate3d(${moveX}px, ${moveY}px, 0)'
                onMouseDown={mousedown}
                style={{
                    transform: `scale3d(${scaleRatio}, ${scaleRatio}, 1) translate3d(${transX}px, ${transY}px, 0px) rotate(${rotate}deg)`,
                    height: isFullScreen ? '100%' : '85%'
                }}
            />
            <span className='progress relative'>
                {current + 1} / {urls.length}
            </span>
            <div className='mask-head fixed'>
                <span id='close' className='iconfont icon-24gl-delete' title='关闭' onClick={closeMask}></span>
                <span
                    className={'iconfont ' + (isFullScreen ? 'icon-quxiaoquanping_huaban' : 'icon-quanping')}
                    title={isFullScreen ? '退出全屏' : '全屏'}
                    onClick={fullScreen}></span>
                <span className='iconfont icon-fangda' title='最大化' onClick={throttle(grow, 200)}></span>
                <span className='iconfont icon-suoxiao' title='最小化' onClick={throttle(shrink, 200)}></span>
                <span className='iconfont icon-rotate-right' title='右旋转' onClick={rotateRight}></span>
                <span className='iconfont icon-rotate-left' title='左旋转' onClick={rotateLeft}></span>
            </div>
            <div
                className='toggle-btn left-btn margin-l-10 fixed'
                onClick={preImg}
                style={{
                    cursor: current === 0 ? 'no-drop' : 'pointer',
                    color: current === 0 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
                }}>
                <span className='iconfont icon-arrow-left-bold'></span>
            </div>
            <div
                className='toggle-btn right-btn margin-r-10 fixed'
                onClick={nextImg}
                style={{
                    cursor: current === urls.length - 1 ? 'no-drop' : 'pointer',
                    color: current === urls.length - 1 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
                }}>
                <span className='iconfont icon-arrow-right-bold'></span>
            </div>
            {isFullScreen ? <></> : <div className='mask-foot fixed w-v-full'></div>}
        </div>
    ) : (
        <></>
    );
    return dom;
}
