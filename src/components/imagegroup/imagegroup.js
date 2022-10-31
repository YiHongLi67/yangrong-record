import React, { useState } from 'react';
import Img from '../img/img';
import './imagegroup.css';

export default function ImageGroup(props) {
    let defaultProps = {
        urls: []
    };
    let urls;
    if (Object.prototype.toString.call(props.urls) === '[object Array]') {
        urls = props.urls;
    } else {
        urls = defaultProps.urls;
    }
    return (
        <div>
            {urls.map((url, idx) => {
                return <Img src={url} key={url + idx} idx={idx} urls={urls}></Img>;
            })}
        </div>
    );
}
