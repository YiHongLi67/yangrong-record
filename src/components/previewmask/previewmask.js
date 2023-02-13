import React, { useEffect, useRef, useState } from 'react';
import { subscribe, unsubscribe } from 'pubsub-js';
import touch from 'touchjs';
const { on, off } = touch;
import './previewmask.less';
import { throttle, _throttle, antiShake, judgeType, getCls, isFullScreen } from '../../static/utils/utils';
import Source from '../source/source';
import { getBrowser } from '../../static/utils/utils';
import defaultImg from '../../static/images/default_img.png';
import { PropTypes } from 'prop-types';
import { Button } from 'antd';

const browser = getBrowser();
const img = document.createElement('img');

let ratio = 1;
let throttleSourceMove;
let throttleMaskMove;
let emitUp = false;
let emitMove = false;
let showMaskId;
let _curIdx = 0;
let imgGroup = null;
let mTransX = 0;
let mTransY = 0;
let start = null;
let t = null;
let mVideoSrc = '';
let preview = null;
let _viewTX = 0;
let viewSTX = 0;
let STX = 0;
let isPC = false;

// 组件函数同步代码 -> return html结构 -> useEffect -> 消息订阅回调函数 -> 更新组件(执行组件函数)

function PreviewMask(props) {
    const { urls, pic_infos, isCommt, onClose, pic_num } = props;
    let [showMask, setShowMask] = useState(true);
    let [curIdx, setCurIdx] = useState(_curIdx);
    let [src, setSrc] = useState('');
    let [videoSrc, setVideoSrc] = useState('');
    let [scaleRatio, setScaleRatio] = useState(ratio);
    let [transX, setTransX] = useState(0);
    let [transY, setTransY] = useState(0);
    let [rotate, setRotate] = useState(0);
    let [viewTX, setViewTX] = useState(0);
    let [isFull, setIsFull] = useState(!window.isPC);
    let [sourceErr, setSourceErr] = useState(false);
    const previewMask = useRef(null);
    const previewImg = useRef(null);
    const maskFoot = useRef(null);
    const previewVideo = useRef(null);
    const save = useRef(null);
    const saveBtn = useRef(null);
    const viewSource = useRef(null);

    (function () {
        const _isPC = isPC;
        isPC = window.isPC;
        if (_isPC !== window.isPC) {
            // console.log('refresh');
        }
    })();

    useEffect(() => {
        preview = previewMask.current;
        document.body.classList.add('overflow-hid');
        showMaskId = subscribe('showMask', (_, data) => {
            let idx = data.idx || 0;
            imgGroup = data.parentNode;
            setSrc(data.urls[idx]);
            setCurIdx((_curIdx = idx));
            setViewTX((_viewTX = -idx * window.innerWidth));
            if (window.isPC) onSrcLoad(-1, idx);
            // else isFullScreen(true, preview);~
        });
        if (window.isPC) return;
        const imgWraps = document.querySelectorAll('.view-source .img-wrap');
        imgWraps.forEach(imgWrap => {
            on(imgWrap, 'hold', hold);
            on(imgWrap, 'tap', resetMask);
            on(imgWrap, 'doubletap', mScale);
            on(imgWrap, 'pinchstart', pinchstart);
            on(imgWrap, 'dragstart', sourceDown);
            on(imgWrap, 'drag', sourceMove);
            on(imgWrap, 'dragend', sourceUp);
            on(imgWrap, 'dragstart', viewDown);
            on(imgWrap, 'drag', viewMove);
            on(imgWrap, 'dragend', viewUp);
            on(imgWrap, 'swipeend', swipeend);
            on(imgWrap, 'swipestart', getTransX);
            on(imgWrap, 'swipeend', mChangeImg);
            on(save.current, 'tap', closeSave);
            on(saveBtn.current, 'tap', mSave);
            on(saveBtn.current, 'touchstart', setBtnStyle);
            on(saveBtn.current, 'touchend', setBtnStyle);
        });
        preview.addEventListener('contextmenu', closeMenu);
        return () => {
            unsubscribe(showMaskId);
        };
    }, []);

    function resetMask(e) {
        e.preventDefault();
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
            setIsFull(false);
            emitMove = false;
            emitUp = false;
            imgGroup && imgGroup.setAttribute('data-show', '');
            onClose && onClose();
        }, 300);
    }

    function closeMask(e) {
        e.stopPropagation();
        if (!window.isPC && e.target.id === 'close') {
            resetMask(e);
            return;
        }
        if (isFull) {
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

    function changeStyle(operate, targetEle = previewVideo.current || previewImg.current) {
        if (!targetEle) return;
        if (operate === 'add') {
            targetEle.classList.add('no-trans');
        } else if (operate === 'remove') {
            targetEle.classList.remove('no-trans');
        }
    }

    function getTransX() {
        STX = transX;
    }

    function mChangeImg(e) {
        if (e.factor > 3) return;
        const { borderX } = cmpBorder();
        changeStyle('remove', viewSource.current);
        if (e.direction === 'right' && STX === borderX) {
            preImg();
        }
        if (e.direction === 'left' && STX === -borderX) {
            nextImg();
        }
    }

    function changeImg(e, idx) {
        if (idx === _curIdx) return;
        toggleImg(undefined, idx);
        setCurIdx((_curIdx = idx));
        setViewTX((_viewTX = -idx * window.innerWidth));
    }

    function toggleImg(preIdx, idx) {
        const target = previewImg.current || previewVideo.current;
        if (target) target.onerror = null;
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
        }, 0);
    }

    function preImg() {
        if (_curIdx === 0) return;
        const pre = _curIdx;
        _curIdx -= 1;
        setCurIdx(_curIdx);
        setViewTX((_viewTX = -_curIdx * window.innerWidth));
        toggleImg(pre, _curIdx);
    }

    function nextImg() {
        if (_curIdx === urls.length - 1) return;
        const pre = _curIdx;
        _curIdx += 1;
        setCurIdx(_curIdx);
        setViewTX((_viewTX = -_curIdx * window.innerWidth));
        toggleImg(pre, _curIdx);
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

    function viewDown(e) {
        // 获取元素当前的偏移量
        viewSTX = _viewTX;
    }

    function viewMove(e) {
        const { borderX } = cmpBorder();
        if (e.direction === 'right' && transX !== borderX) return;
        if (e.direction === 'left' && transX !== -borderX) return;
        viewTX = viewSTX + e.distanceX;
        const maxBorderX = 0;
        const minBorderX = -(pic_num - 1) * window.innerWidth;
        if (viewTX < minBorderX) viewTX = minBorderX;
        if (viewTX > maxBorderX) viewTX = maxBorderX;
        setViewTX((_viewTX = viewTX));
    }

    function viewUp(e) {
        const { distanceX } = e;
        if (Math.abs(distanceX) > (window.innerWidth / 3) * 2) {
            // 切换图片
            if (distanceX > 0) {
                // 向右滑动, 切换上一张
                preImg();
            } else {
                // 向左滑动, 切换下一张
                nextImg();
            }
        } else {
            // 当前图片位置还原
            setViewTX((_viewTX = -_curIdx * window.innerWidth));
        }
    }

    function sourceDown(e) {
        e.target.classList.add('grabbing');
        const targetEle = getTargetEle();
        if (window.isPC) {
            previewVideo.current && previewVideo.current.pause();
        } else {
            targetEle.tagName.toLowerCase() === 'video' && targetEle.pause();
        }
        changeStyle('remove');
        // 获取元素当前的偏移量
        t = {
            tx: mTransX,
            ty: mTransY
        };
        // 记录鼠标的起始位置
        const touch = e.originEvent && e.originEvent.touches[0];
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
        }
    }

    function resetStart(t, start, e) {
        const clientX = window.isPC ? e.clientX : e.originEvent.touches[0].clientX;
        const clientY = window.isPC ? e.clientY : e.originEvent.touches[0].clientY;
        t.tx = transX;
        t.ty = transY;
        start.startX = clientX;
        start.startY = clientY;
    }
    function getTargetEle() {
        const imgWraps = document.querySelectorAll('.view-source .img-wrap');
        let targetEle;
        if (window.isPC) {
            targetEle = previewImg.current || previewVideo.current;
        } else {
            targetEle = imgWraps[_curIdx] && imgWraps[_curIdx].children[0];
        }
        return targetEle;
    }

    function cmpBorder() {
        const targetEle = getTargetEle();
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
        if (!window.isPC && ratio === 1) return;
        if (emitUp) return; // 解决当 ratio 为 1 时, mousemove 设置 translate 后 mouseup 位置偶现不复原的 bug
        emitMove = true;
        const touch = e.originEvent && e.originEvent.changedTouches[0];
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
        const target = e.target;
        emitUp = true;
        const targetEle = getTargetEle();
        if (window.isPC) {
            previewVideo.current && mVideoSrc && previewVideo.current.play();
        } else {
            targetEle.tagName.toLowerCase() === 'video' && targetEle.play();
        }
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
        if (window.isPC) {
            document.removeEventListener('mousemove', throttleSourceMove);
            document.removeEventListener('mouseup', sourceUp);
        } else {
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

    function changeIsfull(e) {
        isFullScreen(!isFull, preview);
        setIsFull(isFull => {
            return !isFull;
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

    function setBtnStyle(e) {
        if (e.type === 'touchstart') {
            e.target.classList.add('save-btn-style');
        } else {
            e.target.classList.remove('save-btn-style');
        }
    }

    function mSave(e) {
        download();
        setTimeout(() => {
            closeSave(e);
        }, 500);
    }

    function download() {
        if (judgeType(pic_infos[_curIdx]) === 'object') {
            const type = pic_infos[_curIdx].type;
            if (isCommt) {
                downloadImage(getUrl('normal', _curIdx));
            } else {
                if (type === 'mov') {
                    downloadImage(getUrl('mov', _curIdx));
                } else if (type === 'jpg' || type === 'gif') {
                    downloadImage(getUrl('large', _curIdx));
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

    function cmpLazySrc(idx) {
        if (idx < 0) return;
        const sourceType = (judgeType(pic_infos[idx]) === 'object' && pic_infos[idx].type) || null;
        if (sourceType === 'jpg') {
            return { lazySrcType: 'jpg', lazySource: (judgeType(pic_infos[idx]) === 'object' && pic_infos[idx].normalUrl) || null };
        }
        if (sourceType === 'gif') {
            const lazySource = (judgeType(pic_infos[idx]) === 'object' && pic_infos[idx].normalUrl) || null;
            if (isCommt) return { lazySrcType: 'gif', lazySource };
            return { lazySrcType: 'mp4', lazySource };
        }
        if (sourceType === 'mov') {
            return { lazySrcType: 'mov', lazySource: (judgeType(pic_infos[idx]) === 'object' && pic_infos[idx].movUrl) || null };
        }
    }

    function mScale(e) {
        if (ratio === 1) {
            if (isWLtH()) {
                setScaleRatio((ratio = 6));
            } else {
                setScaleRatio((ratio = 3));
            }
        } else {
            setScaleRatio((ratio = 1));
            setTransX((mTransX = 0));
            setTransY((mTransY = 0));
        }
    }

    function closeMenu(e) {
        e.preventDefault();
    }

    function hold() {
        save.current && save.current.classList.remove('none');
    }

    function closeSave(e) {
        e.stopPropagation();
        save.current && save.current.classList.add('none');
    }

    function isWLtH() {
        const w = parseFloat(window.getComputedStyle(getTargetEle()).width);
        const h = parseFloat(window.getComputedStyle(getTargetEle()).height);
        return w > h;
    }

    function pinchstart() {
        changeStyle('remove');
        const originRatio = ratio;
        on(preview, 'pinch', e => {
            // 应用在元素上的缩放比例
            let newScale = originRatio * e.scale;
            // 最大/小缩放比例限制
            if (isWLtH()) {
                if (newScale > 6) {
                    newScale = 6;
                }
            } else {
                if (newScale > 3) {
                    newScale = 3;
                }
            }
            if (newScale < 1) {
                newScale = 1;
                setTransX((transX = 0));
                setTransY((transX = 0));
            }
            // 图像应用缩放效果
            setScaleRatio((ratio = newScale));
        });
    }

    function swipeend(e) {
        if (e.factor > 4) return;
        const { borderX, borderY } = cmpBorder();
        const targetEle = getTargetEle();
        targetEle.classList.remove('no-trans');
        targetEle.classList.add('trans-3');
        transX += e.distanceX;
        transY += e.distanceY;
        if (e.distanceX < 0) {
            // left
            if (transX <= -borderX) {
                transX = -borderX;
            }
        }
        if (e.distanceX > 0) {
            // right
            if (transX >= borderX) {
                transX = borderX;
            }
        }
        if (e.distanceY < 0) {
            // up
            if (transY <= -borderY) {
                transY = -borderY;
            }
        }
        if (e.distanceY > 0) {
            // doun
            if (transY >= borderY) {
                transY = borderY;
            }
        }
        setTransX((mTransX = transX));
        setTransY((mTransY = transY));
        setTimeout(() => {
            targetEle.classList.remove('trans-3');
        }, 300);
    }

    function sourceStyle() {
        let styleObj = {
            transform: `scale3d(${scaleRatio}, ${scaleRatio}, 1) translate3d(${transX}px, ${transY}px, 0px) rotate(${rotate}deg)`
        };
        if (window.isPC) {
            styleObj.height = isFull || urls.length <= 1 ? '100%' : `calc(100vh - ${70}px)`;
            styleObj.bottom = 'unset';
        } else {
            styleObj.width = '100%';
        }
        return styleObj;
    }

    function mSourceStyle(idx) {
        return idx === _curIdx
            ? {
                  transform: `scale3d(${scaleRatio}, ${scaleRatio}, 1) translate3d(${transX}px, ${transY}px, 0px) rotate(${rotate}deg)`
              }
            : {};
    }

    function fullScreenTitle() {
        return isFull ? '退出全屏' : '全屏';
    }

    function fullScreenCls() {
        return 'iconfont ' + (isFull ? 'icon-quxiaoquanping_huaban' : 'icon-quanping');
    }

    function leftBtnStyle() {
        return {
            cursor: _curIdx === 0 ? 'no-drop' : 'pointer',
            color: _curIdx === 0 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
        };
    }
    function rightBtnStyle() {
        return {
            cursor: _curIdx === urls.length - 1 ? 'no-drop' : 'pointer',
            color: _curIdx === urls.length - 1 ? 'rgba(204, 204, 204, 0.5)' : 'var(--w-color-gray-7)'
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
            className={getCls(window.isPC ? '' : 'opacity-1', 'preview-mask h-full w-full fixed animate__animated animate__fadeIn')}
            onClick={closeMask}
            onMouseDown={maskDown}
            onWheel={sourceErr ? null : throttle(scaleImg, 200)}
        >
            {window.isPC ? (
                isImg(_curIdx) ? (
                    <img
                        ref={previewImg}
                        className='preview-img absolute-center grab'
                        src={src}
                        alt='加载失败'
                        onMouseDown={!sourceErr && window.isPC ? sourceDown : null}
                        style={{ ...sourceStyle(), ...cursorStyle }}
                    />
                ) : (
                    <video
                        ref={previewVideo}
                        className='preview-video absolute-center grab'
                        poster={src}
                        src={videoSrc}
                        autoPlay
                        muted
                        loop
                        onMouseDown={!sourceErr && window.isPC ? sourceDown : null}
                        onPlay={showVideo}
                        style={{ ...sourceStyle(), ...cursorStyle() }}
                    ></video>
                )
            ) : (
                <div
                    ref={viewSource}
                    className='view-source clear h-full no-trans'
                    style={{ width: `calc(100vw * ${pic_num})`, transform: `translate3d(${viewTX}px, 0, 0)` }}
                >
                    {urls.map((src, idx) => {
                        const { lazySrcType, lazySource } = cmpLazySrc(idx);
                        return (
                            <Source
                                className='flex flex-col-center'
                                key={src + idx}
                                alt={sourceErr ? '加载失败' : ''}
                                idx={idx}
                                curIdx={curIdx}
                                urls={urls}
                                src={src}
                                width='100vw'
                                height='100%'
                                paddingTop={0}
                                text=''
                                lazySource={curIdx === idx ? lazySource : ''}
                                lazySrcType={lazySrcType}
                                showMask={false}
                                style={mSourceStyle(idx)}
                                sourceCls='preview-source'
                                lazyTime={0}
                                isPreview={true}
                            ></Source>
                        );
                    })}
                </div>
            )}
            {urls.length > 1 && (
                <span className={getCls(window.isPC ? 'font-14' : 'font-18', 'progress fixed')}>
                    {curIdx + 1} / {urls.length}
                </span>
            )}
            {window.isPC && (
                <div className='mask-head fixed top-0 w-full margin-t-10 padding-l-10 padding-r-10 ie-box'>
                    <span className='iconfont icon-xiazai-wenjianxiazai-05 download' title='下载原图' onClick={antiShake(download, 1000)}></span>
                    <span id='close' className='iconfont icon-24gl-delete' title='关闭' onClick={closeMask}></span>
                    <span className={fullScreenCls()} title={fullScreenTitle()} onClick={changeIsfull}></span>
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
            {window.isPC && !isFull && urls.length > 1 && (
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
            <div ref={save} className='save w-full h-full absolute top-0 none animate__animated animate__fadeIn'>
                <Button className='absolute-center font-20 line-20' ref={saveBtn}>
                    保存原图
                </Button>
            </div>
        </div>
    ) : (
        <></>
    );
}
PreviewMask.propTypes = {
    urls: PropTypes.array.isRequired,
    pic_infos: PropTypes.array,
    pic_num: PropTypes.number,
    isCommt: PropTypes.bool,
    onClose: PropTypes.func
};
PreviewMask.defaultProps = {
    pic_infos: [],
    isCommt: false,
    pic_num: 1
};
export default PreviewMask;
