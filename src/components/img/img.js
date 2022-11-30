import React, { useState, useRef, useEffect } from 'react';
import { publish, subscribe, unsubscribe } from 'pubsub-js';
import './img.css';
import { judgeType } from '../../static/utils/utils';

let changeStyleId;

export default function Img(props) {
    // 用户传入的属性
    let [src] = useState(props.src);
    let [width] = useState(getWidth(props.width));
    let [height] = useState(getHeight(props.height));
    let [objectFit] = useState(getObjFit(props.objectFit));
    let [text] = useState(getText(props.text));
    let [alt] = useState(getAlt(props.alt));
    let [emitPreview] = useState(getEmitPreview(props.emitPreview));
    const { borderRadius } = props;

    // 封装组件所需的属性
    let [urls] = useState(props.urls);
    let [idx] = useState(props.idx);
    let imgMask = useRef(null);
    let observerImg = useRef(null);

    useEffect(() => {
        changeStyleId = subscribe('changeStyle', (_, data) => {
            if (emitPreview) {
                return;
            }
            if (data.current === idx) {
                imgMask.current && imgMask.current.classList.remove('none');
            } else {
                imgMask.current && imgMask.current.classList.add('none');
            }
        });
        let Observer = new IntersectionObserver(entry => {
            if (entry[0].isIntersecting) {
                entry[0].target.setAttribute('src', src);
                Observer.unobserve(entry[0].target);
            }
        });
        Observer.observe(observerImg.current);
        return () => {
            unsubscribe(changeStyleId);
        };
    }, []);

    function getWidth(width) {
        if (judgeType(width) === 'number') {
            return width + 'px';
        } else if (judgeType(width) === 'string') {
            return width;
        } else {
            return '150px';
        }
    }

    function getHeight(height) {
        if (judgeType(height) === 'number') {
            return height + 'px';
        } else if (judgeType(height) === 'string') {
            return height;
        } else {
            return '';
        }
    }

    function getObjFit(objFit) {
        let objFits = ['contain', 'cover', 'fill', 'none', 'scale-down'];
        if (objFits.indexOf(objFit) !== -1) {
            return objFit;
        } else {
            return 'cover';
        }
    }

    function getText(text) {
        if (judgeType(text) === 'string') {
            return text;
        } else {
            return '预览';
        }
    }

    function getAlt(alt) {
        if (judgeType(alt) === 'string') {
            return alt;
        } else {
            return '加载失败';
        }
    }

    function setShow(e) {
        e.stopPropagation();
        if (emitPreview) {
            let parentNode = e.target.parentNode.parentNode;
            parentNode.setAttribute('data-show', 'true');
            publish('updateShow', { urls, idx, parentNode });
        } else {
            publish('changeImg', { urls, idx });
        }
    }

    function getEmitPreview(emitPreview) {
        if (judgeType(emitPreview) === 'boolean') {
            return emitPreview;
        } else {
            return true;
        }
    }

    return (
        <div className='img-wrap overflow-hid inline-block vertical-m relative' onClick={setShow} style={{ width, height, borderRadius }}>
            <img ref={observerImg} className='yr-img' src='' alt={alt} style={{ objectFit }} />
            <div className='img-mask absolute none' ref={imgMask}>
                {text}
            </div>
        </div>
    );
}
