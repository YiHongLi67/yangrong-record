import React, { useEffect, useRef, useState } from 'react';
import { subscribe, unsubscribe } from 'pubsub-js';
import './previewmask.css';
import { throttle, _throttle, antiShake } from '../../static/utils/utils';
import Img from '../img/img';
import { getBrowser } from '../../static/utils/utils';
import { PropTypes } from 'prop-types';

const browser = getBrowser();
const img = document.createElement('img');
let ratio = 1;
let throttleImgMove;
let throttleMaskMove;
let emitUp = false;
let emitMove = false;
let showMaskId;

function PreviewMask(props) {
    const { urls } = props;
    let [showMask, setShowMask] = useState(false);
    let [curIdx, setCurIdx] = useState(0);
    let [src, setSrc] = useState('');
    let [scaleRatio, setScaleRatio] = useState(1);
    let [transX, setTransX] = useState(0);
    let [transY, setTransY] = useState(0);
    let [rotate, setRotate] = useState(0);
    let [isFullScreen, setIsFullScreen] = useState(false);
    let [parentNode, setParentNode] = useState(null);
    let previewMask = useRef(null);
    let previewImg = useRef(null);
    let maskFoot = useRef(null);

    useEffect(() => {
        showMaskId = subscribe('showMask', (_, data) => {
            setParentNode(data.parentNode);
            setShowMask(true);
            document.body.classList.add('overflow-hid');
            setSrc(data.urls[data.idx]);
            setCurIdx(data.idx);
            setTimeout(() => {}, 0);
            onImgLoad(data.urls[data.idx]);
        });
        return () => {
            unsubscribe(showMaskId);
        };
    }, []);

    function resetMask() {
        setShowMask(false);
        document.body.classList.remove('overflow-hid');
        setScaleRatio((ratio = 1));
        setTransX(0);
        setTransY(0);
        setRotate(0);
        setIsFullScreen(false);
        emitMove = false;
        emitUp = false;
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

    function changeImg(e, idx) {
        if (idx === curIdx) {
            return;
        }
        setCurIdx(idx);
        toggleImg(urls[idx]);
    }

    function toggleImg(src) {
        setSrc(src);
        setTransX(0);
        setTransY(0);
        setScaleRatio((ratio = 1));
        setRotate(0);
        previewImg.current.classList.add('no-trans');
        onImgLoad(src);
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
        if (curIdx === 0) {
            return;
        }
        setCurIdx(curIdx => {
            return curIdx - 1;
        });
        toggleImg(urls[curIdx - 1]);
    }

    function nextImg() {
        if (curIdx === urls.length - 1) {
            return;
        }
        setCurIdx(curIdx => {
            return curIdx + 1;
        });
        toggleImg(urls[curIdx + 1]);
    }

    function scaleImg(e) {
        previewImg.current.classList.remove('no-trans');
        if (e.deltaY < 0) {
            if (ratio >= 50) {
                ratio += 0;
            } else if (ratio >= 28) {
                ratio += 8;
                if (ratio >= 50) {
                    ratio = 50;
                }
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
                setTransX(0);
                setTransY(0);
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
        setTransX(0);
        setTransY(0);
    }

    function imgDown(e) {
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
        throttleImgMove = _throttle(imgMove, 100, { begin: true, end: true }, t, start);
        document.addEventListener('mousemove', throttleImgMove);
        document.addEventListener('mouseup', imgUp);
        e.preventDefault();
    }

    function resetStart(t, start, e) {
        t.tx = transX;
        t.ty = transY;
        start.startX = e.clientX;
        start.startY = e.clientY;
    }

    function imgMove(e, ...args) {
        if (emitUp) {
            // 解决当 ratio 为 1 时, mousemove 设置 translate 后 mouseup 位置偶现不复原的 bug
            return;
        }
        let [t, start] = args;
        emitMove = true;
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

    function imgUp() {
        if (ratio === 1) {
            // 如果缩放比例等于 1, 在 mouseup 的时候设置边界值为 0
            setTransX(0);
            setTransY(0);
        }
        previewImg.current.classList.add('no-trans');
        setShowMask(true);
        document.body.classList.add('overflow-hid');
        emitUp = true;
        document.removeEventListener('mousemove', throttleImgMove);
        document.removeEventListener('mouseup', imgUp);
        setTimeout(function () {
            emitUp = false;
            emitMove = false;
        }, 100);
    }

    function maskDown(e) {
        let startX = e.clientX;
        let startY = e.clientY;
        throttleMaskMove = throttle(e => {
            if (e.clientX - startX === 0 && e.clientY - startY === 0) {
                return;
            }
            emitMove = true;
        }, 200);
        // 解决拖拽功能按钮释放鼠标后 preview-mask 会关闭的 bug
        document.addEventListener('mousemove', throttleMaskMove);
        document.addEventListener('mouseup', maskUp);
        // 取消选中元素和图片默认禁止拖拽
        e.preventDefault();
    }

    function maskUp() {
        emitUp = true;
        document.removeEventListener('mousemove', throttleMaskMove);
        document.removeEventListener('mouseup', maskUp);
        setTimeout(() => {
            emitUp = false;
            emitMove = false;
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
            setTimeout(() => {}, 0);
        } else {
            previewMask.current.requestFullscreen();
        }
        setIsFullScreen(isFullScreen => {
            return !isFullScreen;
        });
    }

    function download() {
        let type = 'large';
        // type = 'normal';
        let _urls = urls;
        downloadImage(_urls[curIdx].replace('thumbnail', type));
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
            cursor: curIdx === 0 ? 'no-drop' : 'pointer',
            color: curIdx === 0 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
        };
    }
    function rightBtnStyle() {
        return {
            cursor: curIdx === urls.length - 1 ? 'no-drop' : 'pointer',
            color: curIdx === urls.length - 1 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
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

    return showMask ? (
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
                onMouseDown={imgDown}
                style={imgStyle()}
            />
            <span className='progress relative'>
                {curIdx + 1} / {urls.length}
            </span>
            <div className='mask-head fixed download left-0 top-0'>
                <span className='iconfont icon-xiazai-wenjianxiazai-05' title='下载原图' onClick={antiShake(download, 1000)}></span>
            </div>
            <div className='mask-head fixed right-0 top-0'>
                <span id='close' className='iconfont icon-24gl-delete' title='关闭' onClick={closeMask}></span>
                <span className={fullScreenCls()} title={fullScreenTitle()} onClick={fullScreen}></span>
                <span className='iconfont icon-fangda' title='最大化' style={scaleMax()} onClick={grow}></span>
                <span className='iconfont icon-suoxiao' title='最小化' style={scaleMin()} onClick={shrink}></span>
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
                            return (
                                <Img
                                    key={src + idx}
                                    idx={idx}
                                    curIdx={curIdx}
                                    urls={urls}
                                    src={src}
                                    width='50px'
                                    text=''
                                    lazy={false}
                                    onClick={changeImg}
                                ></Img>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    ) : (
        <></>
    );
}
PreviewMask.propTypes = {
    urls: PropTypes.array.isRequired
};
PreviewMask.defaultProps = {};
export default PreviewMask;
