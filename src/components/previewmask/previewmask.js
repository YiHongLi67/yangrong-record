import React, { useEffect, useRef, useState } from 'react';
import PubSub from 'pubsub-js';
import './previewmask.css';
import { _throttle } from '../../static/utils/utils';
import { antiShake } from '../../static/utils/utils';
import Img from '../img/img';
import { getBrowser } from '../../static/utils/utils';

let ratio = 1;
let curIdx = 0;
const browser = getBrowser();

export default function PreviewMask() {
    let [showMask, setShowMask] = useState(false);
    let [current, setCurrent] = useState(0);
    let [urls, setUrls] = useState([]);
    let [src, setSrc] = useState('');
    let [scaleRatio, setScaleRatio] = useState(1);
    let [transX, setTransX] = useState(0);
    let [transY, setTransY] = useState(0);
    let [rotate, setRotate] = useState(0);
    let [isFullScreen, setIsFullScreen] = useState(false);
    let [emitUp, setEmitUp] = useState(false);
    let [emitMove, setEmtitMove] = useState(false);
    let [parentNode, setParentNode] = useState(null);
    let [img] = useState(document.createElement('img'));
    let previewMask = useRef(null);
    let previewImg = useRef(null);
    let maskFoot = useRef(null);
    let throttleMove;
    let throttleMaskMove;

    useEffect(() => {
        PubSub.subscribe('showMask', (_, data) => {
            setParentNode(data.parentNode);
            setShowMask(true);
            setUrls(data.urls);
            setSrc(data.urls[data.idx]);
            curIdx = data.idx;
            setCurrent(data.idx);
            setTimeout(() => {
                PubSub.publish('changeStyle', { current: data.idx });
            }, 0);
            onImgLoad(data.urls[data.idx]);
        });
        PubSub.subscribe('changeImg', (_, data) => {
            if (data.idx === curIdx) {
                return;
            }
            setScaleRatio((ratio = 1));
            setTransX((transX = 0));
            setTransY((transY = 0));
            setRotate((rotate = 0));
            previewImg.current && previewImg.current.classList.add('no-trans');
            setSrc(data.urls[data.idx]);
            curIdx = data.idx;
            setCurrent(data.idx);
            PubSub.publish('changeStyle', { current: data.idx });
            onImgLoad(data.urls[data.idx]);
        });
        document.body.onmousedown = function () {
            // 取消选中元素和图片默认禁止拖拽
            return false;
        };
        return () => {
            PubSub.unsubscribe('showMask');
            PubSub.unsubscribe('changeImg');
        };
    }, []);

    function resetMask() {
        setShowMask(false);
        setScaleRatio((ratio = 1));
        setTransX((transX = 0));
        setTransY((transY = 0));
        setRotate((rotate = 0));
        setIsFullScreen((isFullScreen = false));
        setEmtitMove((emitMove = false));
        setEmitUp((emitUp = false));
        setParentNode(parentNode.setAttribute('data-show', ''));
    }

    function closeMask(e) {
        e.stopPropagation();
        if (isFullScreen) {
            if (e.target.id === 'close') {
                // 浏览器全屏模式下 click 的同时会触发模拟的 mousemove 事件
                // 因此无法通过设置 emitMove emitUp 判断鼠标行为是否是点击还是拖拽
                // 而全屏模式下本身解决了拖拽空白区域也会关闭 previewmask 的 bug, 因此不用通过 emitMove emitUp 解决
                resetMask();
            }
        } else {
            if (emitMove && emitUp) {
                // 在非全屏模式下, 通过设置 emitMove emitUp 来判断鼠标行为是点击还是拖拽
                return;
            }
            if (e.target.id === 'preview-mask' || e.target.id === 'close') {
                resetMask();
            }
        }
    }

    function toggleImg() {
        PubSub.publish('changeStyle', { current });
        curIdx = current;
        setCurrent(current);
        setSrc(urls[current]);
        setTransX((transX = 0));
        setTransY((transY = 0));
        setScaleRatio((ratio = 1));
        setRotate((rotate = 0));
        previewImg.current.classList.add('no-trans');
        onImgLoad(urls[current]);
    }

    function onImgLoad(src) {
        // 停止加载上一张图片
        img.src = '';
        if (src.indexOf('thumbnail') !== -1) {
            src = src.replace('thumbnail', 'normal');
        }
        // 开始加载下一张图片
        img.src = src;
        img.onload = function () {
            // 加载大图
            setSrc(src);
        };
    }

    function preImg() {
        if (current === 0) {
            curIdx = current;
            setCurrent(current);
            return;
        }
        current--;
        toggleImg();
    }

    function nextImg() {
        if (current === urls.length - 1) {
            curIdx = current;
            setCurrent(current);
            return;
        }
        current++;
        toggleImg();
    }

    function scaleImg(e) {
        previewImg.current.classList.remove('no-trans');
        if (e.deltaY < 0) {
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
        previewImg.current.classList.remove('no-trans');
        setScaleRatio((ratio = 50));
    }

    function shrink() {
        previewImg.current.classList.remove('no-trans');
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
        previewImg.current.classList.remove('no-trans');
        // 获取元素当前的偏移量
        let t = {
            tx: transX,
            ty: transY
        };
        // 记录鼠标的起始位置
        let start = {
            startX: e.clientX,
            startY: e.clientY
        };
        throttleMove = _throttle(move, 100, { begin: true, end: true }, t, start);
        document.addEventListener('mousemove', throttleMove);
        document.addEventListener('mouseup', up);
        e.preventDefault();
    }

    function resetStart(t, start, e) {
        t.tx = transX;
        t.ty = transY;
        start.startX = e.clientX;
        start.startY = e.clientY;
    }

    function move(e, ...args) {
        let [t, start] = args;
        setEmtitMove((emitMove = true));
        transX = t.tx + (e.clientX - start.startX) / ratio;
        transY = t.ty + (e.clientY - start.startY) / ratio;
        // getComputedStyle 获取到的是未缩放前的宽高
        // window.getComputedStyle(previewImg.current).width;
        // window.getComputedStyle(previewImg.current).height;
        // getBoundingClientRect 获取到的是缩放后的宽高
        // previewImg.current.getBoundingClientRect().width;
        // previewImg.current.getBoundingClientRect().height;
        let borderX,
            borderY,
            imgWidth = parseFloat(window.getComputedStyle(previewImg.current).width),
            imgHeight = parseFloat(window.getComputedStyle(previewImg.current).height),
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
                 * 由于图片高度为 100%, 所以宽口高度 winHeight 也就是图片高度 imgHeight
                 */
                borderY = (imgHeight - imgWidth * ratio) / 2 / ratio;
            } else {
                borderY = (imgWidth * ratio - imgHeight) / 2 / ratio;
            }
        }
        if (transX >= borderX) {
            // 向右拖拽
            transX = borderX;
            resetStart(t, start, e);
        }
        if (transX <= -borderX) {
            // 向左拖拽
            transX = -borderX;
            resetStart(t, start, e);
        }
        if (transY >= borderY) {
            // 向下拖拽
            transY = borderY;
            resetStart(t, start, e);
        }
        if (transY <= -borderY) {
            // 向上拖拽
            transY = -borderY;
            resetStart(t, start, e);
        }
        // 缩放比例大于 1, 在 mousemove 的时候设置边界值
        setTransX(transX);
        setTransY(transY);
    }

    function up() {
        if (ratio === 1) {
            // 如果缩放比例等于 1, 在 mouseup 的时候设置边界值为 0
            setTransX((transX = 0));
            setTransY((transY = 0));
        }
        previewImg.current.classList.add('no-trans');
        setShowMask((showMask = true));
        setEmitUp((emitUp = true));
        document.removeEventListener('mousemove', throttleMove);
        document.removeEventListener('mouseup', up);
        setTimeout(function () {
            setEmitUp((emitMove = false));
            setEmtitMove((emitUp = false));
        }, 100);
    }

    function maskDown(e) {
        let startX = e.clientX;
        let startY = e.clientY;
        throttleMaskMove = throttle(e => {
            if (e.clientX - startX === 0 && e.clientY - startY === 0) {
                return;
            }
            setEmtitMove((emitMove = true));
        }, 200);
        // 解决拖拽功能按钮释放鼠标后 preview-mask 会关闭的 bug
        document.addEventListener('mousemove', throttleMaskMove);
        document.addEventListener('mouseup', maskUp);
    }

    function maskUp() {
        setEmitUp((emitUp = true));
        document.removeEventListener('mousemove', throttleMaskMove);
        document.removeEventListener('mouseup', maskUp);
        setTimeout(() => {
            setEmitUp((emitUp = false));
            setEmtitMove((emitMove = false));
        }, 100);
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
        let FullScreen = document.webkitIsFullScreen || document.mozFullScreen || false;
        if (FullScreen) {
            document.exitFullscreen();
            setTimeout(() => {
                PubSub.publish('changeStyle', { current });
            }, 0);
        } else {
            previewMask.current.requestFullscreen();
        }
        setIsFullScreen((isFullScreen = !FullScreen));
    }

    function imgStyle() {
        return {
            transform: `scale3d(${scaleRatio}, ${scaleRatio}, 1) translate3d(${transX}px, ${transY}px, 0px) rotate(${rotate}deg)`,
            height: isFullScreen ? '100%' : 'calc(100vh - 70px)'
        };
    }

    function fullScreenTitle() {
        return isFullScreen ? '退出全屏' : '全屏';
    }

    function fullScreenCls() {
        return 'iconfont ' + (isFullScreen ? 'icon-quxiaoquanping_huaban' : 'icon-quanping');
    }

    function leftBtnStyle() {
        return {
            cursor: current === 0 ? 'no-drop' : 'pointer',
            color: current === 0 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
        };
    }
    function rightBtnStyle() {
        return {
            cursor: current === urls.length - 1 ? 'no-drop' : 'pointer',
            color: current === urls.length - 1 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
        };
    }

    function scaleMax() {
        return {
            cursor: ratio === 50 ? 'no-drop' : 'pointer',
            color: ratio === 50 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-9)'
        };
    }
    function scaleMin() {
        return {
            cursor: ratio === 1 ? 'no-drop' : 'pointer',
            color: ratio === 1 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-9)'
        };
    }

    function download() {
        let type = 'large';
        // type = 'normal';
        let _urls = urls;
        downloadImage(_urls[current].replace('thumbnail', type));
    }

    // IE 浏览器图片保存 (IE 其实用的就是 window.open)
    function SaveAs5(imgURL) {
        let oPop = window.open(imgURL, '', 'width=1, height=1, top=5000, left=5000');
        for (; oPop.document.readyState !== 'complete'; ) {
            if (oPop.document.readyState === 'complete') {
                break;
            }
        }
        oPop.document.execCommand('SaveAs');
        oPop.close();
    }

    function downloadImage(imgURL) {
        // 下载图片 (区分 IE 和非 IE 部分)
        if (browser === 'IE' || browser === 'Edge') {
            //IE 浏览器
            SaveAs5(imgURL);
        } else {
            //!IE
            let a = document.createElement('a');
            a.href = imgURL;
            document.body.appendChild(a); // 修复 firefox 中无法触发 click
            a.click();
            document.body.removeChild(a);
        }
    }

    let dom = showMask ? (
        <div
            id='preview-mask'
            ref={previewMask}
            className='preview-mask h-v-full w-v-full fixed'
            onClick={closeMask}
            onMouseDown={maskDown}
            onWheel={throttle(scaleImg, 200)}
        >
            <img
                ref={previewImg}
                className='preview-img absolute absolute-center pointer'
                src={src}
                alt='加载失败'
                onMouseDown={mousedown}
                style={imgStyle()}
            />
            <span className='progress relative'>
                {current + 1} / {urls.length}
            </span>
            <div className='mask-head fixed download left-0 top-0'>
                <span className='iconfont icon-xiazai-wenjianxiazai-05' title='下载原图' onClick={antiShake(download, 1000)}></span>
            </div>
            <div className='mask-head fixed right-0 top-0'>
                <span id='close' className='iconfont icon-24gl-delete' title='关闭' onClick={closeMask}></span>
                <span className={fullScreenCls()} title={fullScreenTitle()} onClick={fullScreen}></span>
                <span className='iconfont icon-fangda' title='最大化' style={scaleMax()} onClick={throttle(grow, 200)}></span>
                <span className='iconfont icon-suoxiao' title='最小化' style={scaleMin()} onClick={throttle(shrink, 200)}></span>
                <span className='iconfont icon-rotate-right' title='右旋转' onClick={rotateRight}></span>
                <span className='iconfont icon-rotate-left' title='左旋转' onClick={rotateLeft}></span>
            </div>
            <div className='toggle-btn left-btn margin-l-10 fixed' onClick={preImg} style={leftBtnStyle()}>
                <span className='iconfont icon-arrow-left-bold'></span>
            </div>
            <div className='toggle-btn right-btn margin-r-10 fixed' onClick={nextImg} style={rightBtnStyle()}>
                <span className='iconfont icon-arrow-right-bold'></span>
            </div>
            {isFullScreen ? (
                <></>
            ) : (
                <div className='mask-foot fixed w-v-full' ref={maskFoot}>
                    <div className='flex-center padding-t-6 padding-b-6 ie-box'>
                        {urls.map((src, idx) => {
                            return <Img key={src + idx} idx={idx} urls={urls} src={src} width='50px' text='' emitPreview={false}></Img>;
                        })}
                    </div>
                </div>
            )}
        </div>
    ) : (
        <></>
    );
    return dom;
}
