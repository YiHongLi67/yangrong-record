import React, { useEffect, useRef, useState } from 'react';
import { subscribe, unsubscribe } from 'pubsub-js';
import { on, off } from 'touchjs';
import $ from 'zepto-webpack';
import './previewmask.less';
import { throttle, _throttle, antiShake, judgeType, getCls, tap, doubletap, swipe } from '../../static/utils/utils';
import Source from '../source/source';
import { getBrowser } from '../../static/utils/utils';
import defaultImg from '../../static/images/default_img.png';
import { PropTypes } from 'prop-types';

const browser = getBrowser();
const img = document.createElement('img');

let ratio = 2;
let throttleSourceMove;
let throttleMaskMove;
let antiShakePreImg;
let antiShakeNextImg;
let emitUp = false;
let emitMove = false;
let showMaskId;
let index = 0;
let imgGroup = null;
let mTransX = 0;
let mTransY = 0;
let start = null;
let t = null;
let mVideoSrc = '';
let preview = null;
let status = 0;
let sp = null;
let timer = null;
let store = {};

function PreviewMask(props) {
    const { urls, pic_infos, isCommt, onClose } = props;
    let [showMask, setShowMask] = useState(true);
    let [curIdx, setCurIdx] = useState(0);
    let [src, setSrc] = useState('');
    let [videoSrc, setVideoSrc] = useState('');
    let [scaleRatio, setScaleRatio] = useState(ratio);
    let [transX, setTransX] = useState(0);
    let [transY, setTransY] = useState(0);
    let [rotate, setRotate] = useState(0);
    let [isFullScreen, setIsFullScreen] = useState(false);
    let [parentNode, setParentNode] = useState(null);
    let [sourceErr, setSourceErr] = useState(false);
    const previewMask = useRef(null);
    const previewImg = useRef(null);
    const maskFoot = useRef(null);
    const previewVideo = useRef(null);
    const progress = useRef(null);

    useEffect(() => {
        preview = previewMask.current;
        document.body.classList.add('overflow-hid');
        showMaskId = subscribe('showMask', (_, data) => {
            let idx = data.idx || 0;
            setParentNode(data.parentNode);
            imgGroup = data.parentNode;
            setSrc(data.urls[idx]);
            setCurIdx(idx);
            index = idx;
            onSrcLoad(-1, idx);
        });
        antiShakePreImg = antiShake(preImg, 100);
        antiShakeNextImg = antiShake(nextImg, 100);
        if (!window.isPC) {
            preview.addEventListener('touchstart', pinchstart);
            preview.addEventListener('touchmove', pinchmove);
            preview.addEventListener('touchend', pinchend);
            preview.addEventListener('touchcancel', pinchend);
            preview.addEventListener('touchstart', sourceDown);
            swipe(preview, swipeHorizontal, { direction: 'horizontal' });
            swipe(preview, swipeVertical, { direction: 'vertical' });
            // $(preview).on('swipe', e => {
            //     console.log('swipe', e);
            // });
            // $(preview).on('swipeleft', antiShakeNextImg);
            // $(preview).on('swiperight', antiShakePreImg);
            // $(preview).on('swipeup', resetMask);
            // $(preview).on('swipedown', resetMask);
        }
        return () => {
            unsubscribe(showMaskId);
        };
    }, []);

    function resetMask(e) {
        // console.log('resetMask', e);
        if (!window.isPC && ratio !== 1 && (e.type === 'swipeup' || e.type === 'swipedown')) return;
        preview.classList.remove('animate__fadeIn');
        preview.classList.add('animate__fadeOut');
        setTimeout(() => {
            img.src = '';
            previewVideo.current && previewVideo.current.setAttribute('src', ''); // 停止加载未加载完成的图片/视频
            setShowMask(false);
            document.body.classList.remove('overflow-hid');
            setScaleRatio((ratio = 1));
            setTransX((mTransX = 0));
            setTransY((mTransY = 0));
            setRotate(0);
            setIsFullScreen(false);
            emitMove = false;
            emitUp = false;
            imgGroup && setParentNode(imgGroup.setAttribute('data-show', ''));
            onClose && onClose();
        }, 300);
    }

    function closeMask(e) {
        e.stopPropagation();
        if (!window.isPC && e.target.id === 'close') {
            resetMask(e);
            return;
        }
        if (isFullScreen) {
            if (e.target.id === 'close') {
                // 浏览器全屏模式下 click 的同时会触发模拟的 mousemove 事件
                // 因此无法通过设置 emitMove emitUp 判断鼠标行为是否是点击还是拖拽
                // 而全屏模式下本身解决了拖拽空白区域也会关闭 previewmask 的 bug, 因此不用通过 emitMove emitUp 解决
                resetMask(e);
            }
        } else {
            if (emitMove && emitUp) {
                return; // 在非全屏模式下, 通过设置 emitMove emitUp 来判断鼠标行为是点击还是拖拽
            }
            if (e.target.id === 'preview-mask' || e.target.id === 'close') {
                //点击空白区域或关闭按钮关闭
                resetMask(e);
            }
        }
    }

    function changeStyle(operate) {
        let targetEle = previewVideo.current || previewImg.current;
        if (!targetEle) return;
        if (operate === 'add') {
            targetEle.classList.add('no-trans');
        } else if (operate === 'remove') {
            targetEle.classList.remove('no-trans');
        }
    }

    function changeImg(e, idx) {
        if (idx === curIdx) return;
        toggleImg(undefined, idx);
        setCurIdx(idx);
        index = idx;
    }

    function toggleImg(preIdx, idx) {
        const target = previewImg.current || previewVideo.current;
        if (target) {
            target.onerror = null;
        }
        changeStyle('add');
        setSrc(urls[idx]);
        setVideoSrc((mVideoSrc = ''));
        setTransX((mTransX = 0));
        setTransY((mTransY = 0));
        setScaleRatio((ratio = 1));
        setRotate(0);
        setSourceErr(false);
        onSrcLoad(preIdx, idx);
    }

    function showVideo() {
        setSourceErr(false);
        previewVideo.current.playbackRate = 0.5;
    }

    function onSrcLoad(preIdx, idx) {
        img.src = '';
        setVideoSrc((mVideoSrc = '')); // 停止加载未加载完成的图片/视频
        const type = judgeType(pic_infos[idx]) === 'object' && pic_infos[idx].type;
        if (type === 'jpg' || (type === 'gif' && isCommt)) {
            const normalUrl = getUrl('normal', idx);
            img.src = normalUrl;
            img.onload = function () {
                setSrc(normalUrl); // 加载大图
                setSourceErr(false);
            };
        }
        if (type === 'gif' && !isCommt) {
            const mp4Url = getUrl('normal', idx);
            setVideoSrc((mVideoSrc = mp4Url));
        }
        if (type === 'mov') {
            const movUrl = getUrl('mov', idx);
            setVideoSrc((mVideoSrc = movUrl));
        }
        setTimeout(() => {
            if (previewVideo.current) {
                previewVideo.current.onerror = e => {
                    if (e.cancelable) {
                        setSourceErr(true); // poster 可, src 不可
                    } else {
                        previewVideo.current && previewVideo.current.setAttribute('poster', defaultImg); // poster 不可, src 可
                    }
                };
            }
            if (previewImg.current) {
                previewImg.current.onerror = () => {
                    previewImg.current.src = defaultImg;
                    setSourceErr(true);
                };
            }
            // if (!window.isPC && isImg(preIdx) !== isImg(idx)) {
            //     console.log('m event'); // needn't
            // }
        }, 0);
    }

    function preImg() {
        console.log('preImg');
        if (index === 0) return;
        setCurIdx(curIdx => {
            return curIdx - 1;
        });
        toggleImg(index--, index);
    }

    function nextImg() {
        console.log('nextImg');
        if (index === urls.length - 1) return;
        setCurIdx(curIdx => {
            return curIdx + 1;
        });
        toggleImg(index++, index);
    }

    function scaleImg(e) {
        changeStyle('remove');
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
            if (ratio >= 50) ratio = 50;
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
            if (ratio <= 1) ratio = 1;
            if (ratio === 1) {
                setTransX((mTransX = 0));
                setTransY((mTransY = 0));
            }
        }
        setScaleRatio(ratio);
    }

    function grow() {
        changeStyle('remove');
        setScaleRatio((ratio = 50));
    }

    function shrink() {
        changeStyle('remove');
        setScaleRatio((ratio = 1));
        setTransX((mTransX = 0));
        setTransY((mTransY = 0));
    }

    function swipeHorizontal(e, direction, speed) {
        // if (speed < 60) return;
        // console.log(mTransX, speed);
        const { borderX } = cmpBorder();
        let targetEle = previewImg.current || previewVideo.current;
        targetEle.classList.remove('no-trans');
        targetEle.classList.add('trans-3');
        if (direction === 'left') {
            transX -= speed / ratio / 2;
            if (transX <= -borderX) {
                transX = -borderX;
            }
        }
        if (direction === 'right') {
            transX += speed / ratio / 2;
            if (transX >= borderX) {
                transX = borderX;
            }
        }
        setTransX((mTransX = transX));
        setTimeout(() => {
            targetEle.classList.remove('trans-3');
        }, 300);
    }

    function swipeVertical(e, direction, speed) {
        // if (speed < 60) return;
        // console.log(mTransY, speed);
        const { borderY } = cmpBorder();
        let targetEle = previewImg.current || previewVideo.current;
        targetEle.classList.remove('no-trans');
        targetEle.classList.add('trans-3');
        if (direction === 'up') {
            transY -= speed / ratio / 2;
            if (transY <= -borderY) {
                transY = -borderY;
            }
        }
        if (direction === 'down') {
            transY += speed / ratio / 2;
            if (transY >= borderY) {
                transY = borderY;
            }
        }
        setTransY((mTransY = transY));
        setTimeout(() => {
            targetEle.classList.remove('trans-3');
        }, 300);
    }

    function sourceDown(e) {
        if (!window.isPC && e.touches.length > 1) return;
        // console.log('dragstart', e.touches, e.targetTouches, e.changedTouches);
        if (status === 1 && timer) {
            // 超过规定时间内的单机/双击事件无效, 清除单机回调函数
            clearTimeout(timer);
            timer = null;
        }
        if (!window.isPC) {
            // $(preview).off('swipeleft', antiShakeNextImg);
            // $(preview).off('swiperight', antiShakePreImg);
            // $(preview).off('swipeup', resetMask);
            // $(preview).off('swipedown', resetMask);
        }
        e.target.classList.add('grabbing');
        previewVideo.current && previewVideo.current.pause();
        changeStyle('remove');
        // 获取元素当前的偏移量
        t = {
            tx: mTransX,
            ty: mTransY
        };
        // 记录鼠标的起始位置
        const touch = e.touches[0];
        const clientX = window.isPC ? e.clientX : touch.clientX;
        const clientY = window.isPC ? e.clientY : touch.clientY;
        start = {
            startX: clientX,
            startY: clientY,
            time: e.timeStamp
        };
        throttleSourceMove = _throttle(sourceMove, 100, { begin: true, end: true });
        if (window.isPC) {
            document.addEventListener('mousemove', throttleSourceMove);
            document.addEventListener('mouseup', sourceUp);
        } else {
            // $(preview).on('touchmove', throttleSourceMove);
            // $(preview).on('touchend', sourceUp);
            preview.addEventListener('touchmove', throttleSourceMove);
            preview.addEventListener('touchend', sourceUp);
        }
    }

    function resetStart(t, start, e) {
        const clientX = window.isPC ? e.clientX : e.touches[0].clientX;
        const clientY = window.isPC ? e.clientY : e.touches[0].clientY;
        t.tx = transX;
        t.ty = transY;
        start.startX = clientX;
        start.startY = clientY;
    }

    function cmpBorder() {
        let targetEle = previewImg.current || previewVideo.current;
        // getComputedStyle 获取到的是未缩放前的宽高
        // window.getComputedStyle(previewImg.current).width;
        // window.getComputedStyle(previewImg.current).height;
        // getBoundingClientRect 获取到的是缩放后的宽高
        // previewImg.current.getBoundingClientRect().width;
        // previewImg.current.getBoundingClientRect().height;
        let borderX,
            borderY,
            eleWidth = parseFloat(window.getComputedStyle(targetEle).width),
            eleHeight = parseFloat(window.getComputedStyle(targetEle).height),
            winWidth = window.innerWidth,
            winHeight = window.innerHeight;
        // 如果旋转后宽高未置反
        if (!isRotate()) {
            if (eleWidth * ratio < winWidth) {
                borderX = (winWidth - eleWidth * ratio) / 2 / ratio;
            } else {
                borderX = (eleWidth * ratio - winWidth) / 2 / ratio;
            }
            if (eleHeight * ratio < winHeight) {
                borderY = (winHeight - eleHeight * ratio) / 2 / ratio;
            } else {
                borderY = (eleHeight * ratio - winHeight) / 2 / ratio;
            }
            // borderY = (eleHeight * (ratio - 1)) / 2 / ratio;
        } else {
            // 旋转后宽高置反
            // 缩放后图片的高度小于窗口宽度
            if (eleHeight * ratio < winWidth) {
                /**
                 * 可向左 / 向右拖拽的最大距离: (窗口宽度 - 图片高度 * 缩放比例) / 2 / 缩放比例
                 * 除以 2 是图片居中, 上下可 translate 的距离均分
                 * 为何除以缩放比例 ratio, 摸索出来的
                 */
                borderX = (winWidth - eleHeight * ratio) / 2 / ratio;
            } else {
                borderX = (eleHeight * ratio - winWidth) / 2 / ratio;
            }
            // 缩放后图片的宽度小于窗口高度
            if (eleWidth * ratio < winHeight) {
                /**
                 * 可向上 / 向下拖拽最的大距离: (窗口高度 - 图片宽度 * 缩放比例) / 2 / 缩放比例
                 * 由于图片高度为 100%, 所以宽口高度 winHeight 也就是图片高度 eleHeight
                 */
                borderY = (eleHeight - eleWidth * ratio) / 2 / ratio;
            } else {
                borderY = (eleWidth * ratio - eleHeight) / 2 / ratio;
            }
        }
        return {
            borderX,
            borderY
        };
    }

    function sourceMove(e) {
        // console.log('dragmove', e.touches, e.targetTouches, e.changedTouches);
        if (!window.isPC && ratio === 1) return;
        if (emitUp) return; // 解决当 ratio 为 1 时, mousemove 设置 translate 后 mouseup 位置偶现不复原的 bug
        if (!window.isPC && ratio === 1) return;
        emitMove = true;
        const touch = e.changedTouches[0];
        const clientX = window.isPC ? e.clientX : touch.clientX;
        const clientY = window.isPC ? e.clientY : touch.clientY;
        transX = t.tx + (clientX - start.startX) / ratio;
        transY = t.ty + (clientY - start.startY) / ratio;
        // 缩放比例为 1, 拖动的边界值在 mouseup 时设置为 0, 即无论怎么拖拽都是原始位置
        if (ratio === 1) {
            setTransX((mTransX = transX));
            setTransY((mTransY = transY));
            return;
        }
        // 缩放比例大于 1, 给拖拽设置边界值
        const { borderX, borderY } = cmpBorder();
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
        setTransX((mTransX = transX));
        setTransY((mTransY = transY));
    }

    function sourceUp(e) {
        // console.log('dragend', e.touches, e.targetTouches, e.changedTouches);
        // preview.removeEventListener('touchmove', throttleSourceMove);
        // preview.removeEventListener('touchend', sourceUp);
        // return;
        const target = e.target;
        emitUp = true;
        previewVideo.current && mVideoSrc && previewVideo.current.play();
        target.classList.remove('grabbing');
        // 触发move事件
        if (ratio === 1) {
            // 如果缩放比例等于 1, 在 mouseup 的时候设置边界值为 0
            setTransX((mTransX = 0));
            setTransY((mTransY = 0));
        }
        changeStyle('add');
        setShowMask(true);
        document.body.classList.add('overflow-hid');
        if (!emitMove && !window.isPC) {
            // 仅触发单/双击事件
            const touch = e.changedTouches[0];
            sp = {
                st: e.timeStamp,
                sx: touch.clientX,
                sy: touch.clientY
            };
            if (sp.st - start.time > 250 || Math.abs(sp.sx - start.startX) > 10 || Math.abs(sp.sy - start.startY) > 10) {
                status = 0;
                clearTimeout(timer);
                timer = null;
            } else {
                if (status === 0) {
                    status++;
                    timer = setTimeout(() => {
                        // 单击
                        resetMask(e);
                        status = 0;
                        timer = null;
                    }, 250);
                } else {
                    // 双击
                    mScale(e);
                    status = 0;
                    clearTimeout(timer);
                    timer = null;
                }
            }
        }
        if (window.isPC) {
            document.removeEventListener('mousemove', throttleSourceMove);
            document.removeEventListener('mouseup', sourceUp);
        } else {
            // $(preview).on('swipeleft', antiShakeNextImg);
            // $(preview).on('swiperight', antiShakePreImg);
            // $(preview).on('swipeup', resetMask);
            // $(preview).on('swipedown', resetMask);
            preview.removeEventListener('touchmove', throttleSourceMove);
            preview.removeEventListener('touchend', sourceUp);
        }
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
        } else {
            previewMask.current.requestFullscreen();
        }
        setIsFullScreen(isFullScreen => {
            return !isFullScreen;
        });
    }

    function getUrl(type, idx) {
        const pic_info = judgeType(pic_infos[idx]) === 'object' ? pic_infos[idx] : {};
        const thumb = pic_info.thumbUrl || '';
        const normal = pic_info.normalUrl || '';
        const large = pic_info.largeUrl || '';
        const mov = pic_info.movUrl || '';
        switch (type) {
            case 'thumb':
                return thumb;
            case 'normal':
                return normal;
            case 'large':
                return large;
            case 'mov':
                return mov;
            default:
                return '';
        }
    }

    function download() {
        if (judgeType(pic_infos[curIdx]) === 'object') {
            const type = pic_infos[curIdx].type;
            if (isCommt) {
                downloadImage(getUrl('normal', curIdx));
            } else {
                if (type === 'mov') {
                    downloadImage(getUrl('mov', curIdx));
                } else if (type === 'jpg' || type === 'gif') {
                    downloadImage(getUrl('large', curIdx));
                }
            }
        }
    }

    // IE 浏览器图片保存 (IE 其实用的就是 window.open)
    function SaveAs5(imgURL) {
        imgURL = imgURL.replace('com/', 'com/download/');
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
        imgURL = imgURL.replace('com/', 'com/download/');
        // 下载图片 (区分 IE 和非 IE 部分)
        if (browser === 'IE' || browser === 'Edge') {
            // IE 浏览器
            SaveAs5(imgURL);
        } else {
            // !IE
            let a = document.createElement('a');
            a.href = imgURL;
            document.body.appendChild(a); // 修复 firefox 中无法触发 click
            a.click();
            document.body.removeChild(a);
        }
    }

    function isImg(idx) {
        if (idx < 0) return;
        const type = judgeType(pic_infos[idx]) === 'object' && pic_infos[idx].type;
        if (type === 'jpg' || (type === 'gif' && isCommt)) {
            return true;
        }
        if (type === 'gif' && !isCommt) {
            return false;
        }
        if (type === 'mov') {
            return false;
        }
    }

    function mScale(e) {
        // console.log('mScale', e);
        changeStyle('remove');
        if (ratio === 1) {
            setScaleRatio((ratio = 2.5));
        } else {
            setScaleRatio((ratio = 1));
            setTransX((mTransX = 0));
            setTransY((mTransY = 0));
        }
    }

    function pinchstart(e) {
        // console.log('pinchstart', e);
        changeStyle('remove');
        let touche1 = e.touches[0];
        let touche2 = e.touches[1];
        // 第一个触摸点的坐标
        store.pageX = touche1.pageX;
        store.pageY = touche1.pageY;
        store.moveable = true;
        if (touche2) {
            store.pageX2 = touche2.pageX;
            store.pageY2 = touche2.pageY;
        }
        store.originScale = ratio;
    }

    function pinchmove(e) {
        // console.log('pinchmove', e);
        if (!store.moveable) {
            return;
        }
        let touche1 = e.touches[0];
        let touche2 = e.touches[1];
        // 双指移动
        if (touche2) {
            // 第2个指头坐标在touchmove时候获取
            if (!store.pageX2) {
                store.pageX2 = touche2.pageX;
            }
            if (!store.pageY2) {
                store.pageY2 = touche2.pageY;
            }
            // 获取坐标之间的举例
            let getDistance = function (start, stop) {
                return Math.hypot(stop.x - start.x, stop.y - start.y);
            };
            // 双指缩放比例计算
            let zoom =
                getDistance(
                    {
                        x: touche1.pageX,
                        y: touche1.pageY
                    },
                    {
                        x: touche2.pageX,
                        y: touche2.pageY
                    }
                ) /
                getDistance(
                    {
                        x: store.pageX,
                        y: store.pageY
                    },
                    {
                        x: store.pageX2,
                        y: store.pageY2
                    }
                );
            // 应用在元素上的缩放比例
            let newScale = store.originScale * zoom;
            // 最大缩放比例限制
            if (newScale > 3) {
                newScale = 3;
            }
            if (newScale < 1) {
                newScale = 1;
                setTransX((transX = 0));
                setTransY((transX = 0));
            }
            // 图像应用缩放效果
            setScaleRatio((ratio = newScale));
        }
    }

    function pinchend(e) {
        // console.log('pinchend', e);
        store.moveable = false;
        delete store.pageX2;
        delete store.pageY2;
    }

    function sourceStyle() {
        let styleObj = {
            transform: `scale3d(${scaleRatio}, ${scaleRatio}, 1) translate3d(${transX}px, ${transY}px, 0px) rotate(${rotate}deg)`
        };
        if (window.isPC) {
            styleObj.height = isFullScreen || urls.length <= 1 ? '100%' : `calc(100vh - ${70}px)`;
            styleObj.bottom = 'unset';
        } else {
            styleObj.width = '100%';
        }
        return styleObj;
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

    function cursorStyle() {
        return {
            cursor: sourceErr ? 'no-drop' : ''
        };
    }

    return showMask ? (
        <div
            id='preview-mask'
            ref={previewMask}
            className='preview-mask h-v-full w-v-full fixed animate__animated animate__fadeIn'
            onClick={closeMask}
            onMouseDown={maskDown}
            onWheel={sourceErr ? null : throttle(scaleImg, 200)}
        >
            {isImg(curIdx) ? (
                <img
                    ref={previewImg}
                    className='preview-img absolute absolute-center grab'
                    src={src}
                    alt='加载失败'
                    onMouseDown={!sourceErr && window.isPC ? sourceDown : null}
                    style={{ ...sourceStyle(), ...cursorStyle() }}
                />
            ) : (
                <video
                    ref={previewVideo}
                    className='preview-video absolute absolute-center grab'
                    poster={src}
                    src={videoSrc}
                    autoPlay
                    muted
                    loop
                    onMouseDown={!sourceErr && window.isPC ? sourceDown : null}
                    onPlay={showVideo}
                    style={{ ...sourceStyle(), ...cursorStyle() }}
                ></video>
            )}
            <span className={getCls(window.isPC ? 'font-14' : 'font-18', 'progress relative')} ref={progress}>
                {curIdx + 1} / {urls.length}
            </span>
            {window.isPC && (
                <div className='mask-head fixed top-0 w-full margin-t-10 padding-l-10 padding-r-10 ie-box'>
                    <span className='iconfont icon-xiazai-wenjianxiazai-05 download' title='下载原图' onClick={antiShake(download, 1000)}></span>
                    <span id='close' className='iconfont icon-24gl-delete' title='关闭' onClick={closeMask}></span>
                    <span className={fullScreenCls()} title={fullScreenTitle()} onClick={fullScreen}></span>
                    <span
                        className='iconfont icon-fangda'
                        title='最大化'
                        style={{ ...scaleMax(), ...cursorStyle() }}
                        onClick={sourceErr ? null : grow}
                    ></span>
                    <span
                        className='iconfont icon-suoxiao'
                        title='最小化'
                        style={{ ...scaleMin(), ...cursorStyle() }}
                        onClick={sourceErr ? null : shrink}
                    ></span>
                    <span className='iconfont icon-rotate-right' title='右旋转' style={cursorStyle()} onClick={sourceErr ? null : rotateRight}></span>
                    <span className='iconfont icon-rotate-left' title='左旋转' style={cursorStyle()} onClick={sourceErr ? null : rotateLeft}></span>
                </div>
            )}
            {window.isPC && urls.length > 1 && (
                <>
                    <div className='toggle-btn left-btn margin-l-10 fixed' onClick={preImg} style={leftBtnStyle()}>
                        <span className='iconfont icon-arrow-left-bold'></span>
                    </div>
                    <div className='toggle-btn right-btn margin-r-10 fixed' onClick={nextImg} style={rightBtnStyle()}>
                        <span className='iconfont icon-arrow-right-bold'></span>
                    </div>
                </>
            )}
            {window.isPC && !isFullScreen && urls.length > 1 && (
                <div className='mask-foot fixed w-v-full' ref={maskFoot}>
                    <div className='flex-center padding-t-6 padding-b-6 ie-box'>
                        {urls.map((src, idx) => {
                            return (
                                <Source
                                    key={src + idx}
                                    idx={idx}
                                    curIdx={curIdx}
                                    urls={urls}
                                    src={src}
                                    width={`${50}px`}
                                    text=''
                                    lazy={false}
                                    onClick={changeImg}
                                ></Source>
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
    urls: PropTypes.array.isRequired,
    pic_infos: PropTypes.array,
    isCommt: PropTypes.bool,
    onClose: PropTypes.func
};
PreviewMask.defaultProps = {
    pic_infos: [],
    isCommt: false
};
export default PreviewMask;
