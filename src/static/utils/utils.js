import moment from 'moment';
import 'moment/locale/zh-cn';
import { off } from 'touchjs';
moment.locale('zh-cn');
export function throttle(fn, wait, ...args) {
    // 节流
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

export function _throttle(fn, wait, op = {}, ...args) {
    //节流 控制最后一次和第一次
    let timer = null;
    let pre = 0;
    return function (e) {
        let now = Date.now();
        if (now - pre > wait) {
            if (pre === 0 && !op.bengin) {
                pre = now;
                return;
            }
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            fn.call(this, e, ...args);
            pre = now;
        } else if (!timer && op.end) {
            timer = setTimeout(() => {
                fn.call(this, e, ...args);
                timer = null;
            }, wait);
        }
    };
}

export function judgeType(val) {
    // 类型判断
    switch (Object.prototype.toString.call(val)) {
        case '[object Number]':
            return 'number';
        case '[object String]':
            return 'string';
        case '[object Boolean]':
            return 'boolean';
        case '[object Undefined]':
            return 'undefined';
        case '[object Null]':
            return 'null';
        case '[object Function]':
            return 'function';
        case '[object Array]':
            return 'array';
        case '[object Object]':
            return 'object';
        case '[object Date]':
            return 'date';
        case '[object RegExp]':
            return 'regexp';
        default:
            return;
    }
}

let pre = 0;
export function antiShake(fn, wait, ...args) {
    return function (e) {
        // 事件的回调函数
        let now = new Date();
        if (now - pre > wait) {
            fn.call(this, e, ...args);
        }
        pre = now;
    };
}

export function formatTime(created_at) {
    created_at = new Date(created_at);
    if (new Date().getTime() - created_at.getTime() <= 1000 * 60 * 60 * 21) {
        return new Date(created_at).getTime();
    }
    return moment(created_at).format('YY-M-D HH: mm');
}

export function getBrowser() {
    // 判断浏览器类型
    let userAgent = navigator.userAgent; // 取得浏览器的 userAgent 字符串
    let isOpera = userAgent.indexOf('Opera') > -1;
    if (isOpera) {
        return 'Opera'; // 判断是否 Opera 浏览器
    }
    if (userAgent.indexOf('Firefox') > -1) {
        return 'FF'; // 判断是否 Firefox 浏览器
    }
    if (userAgent.indexOf('Chrome') > -1) {
        return 'Chrome';
    }
    if (userAgent.indexOf('Safari') > -1) {
        return 'Safari'; // 判断是否 Safari 浏览器
    }
    if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
        return 'IE'; // 判断是否 IE 浏览器
    }
    if (userAgent.indexOf('Trident') > -1) {
        return 'Edge'; // 判断是否 Edge 浏览器
    }
}

export function getCls(className, baseClass = '') {
    if (typeof className !== 'string') {
        throw Error('The className is a string');
    }
    if (typeof baseClass !== 'string') {
        throw Error('The baseClass is a string');
    }
    if (className.trim().length > 0) {
        if (baseClass.trim().length > 0) {
            return baseClass.trim() + ' ' + className.trim();
        } else {
            return className.trim();
        }
    } else {
        return baseClass.trim();
    }
}

export function getPropVal(propVal) {
    if (judgeType(propVal) === 'number') {
        return propVal + 'px';
    } else if (judgeType(propVal) === 'string') {
        return propVal;
    }
}

export function setDevice() {
    const resetDevice = function () {
        window.innerWidth > 750 ? (window.isPC = true) : (window.isPC = false);
    };
    resetDevice();
    window.addEventListener('resize', _throttle(resetDevice, 300, { bengin: true, end: true }));
}

export function getMobileFont(className) {
    const fontSize = window.fontSize || 18;
    switch (fontSize) {
        case 14:
            switch (className) {
                case 'screen-name':
                case 'comment-user-name':
                case 'show-all':
                case 'fold-comments':
                    return 'font-12 line-12';
                case 'text':
                case 'comment-text':
                case 'radio':
                    return 'font-14 line-14';
                default:
                    return '';
            }
        case 16:
            switch (className) {
                case 'comment-user-name':
                    return 'font-12 line-12';
                case 'screen-name':
                case 'show-all':
                case 'fold-comments':
                    return 'font-14 line-14';
                case 'text':
                case 'comment-text':
                case 'radio':
                    return 'font-16 line-16';
                default:
                    return '';
            }
        case 18:
            switch (className) {
                case 'comment-user-name':
                    return 'font-14 line-14';
                case 'screen-name':
                case 'show-all':
                case 'fold-comments':
                    return 'font-16 line-16';
                case 'text':
                case 'comment-text':
                case 'radio':
                    return 'font-18 line-18';
                default:
                    return '';
            }
        case 20:
            switch (className) {
                case 'comment-user-name':
                    return 'font-16 line-16';
                case 'screen-name':
                case 'show-all':
                case 'fold-comments':
                    return 'font-18 line-18';
                case 'text':
                case 'comment-text':
                case 'radio':
                    return 'font-20 line-20';
                default:
                    return '';
            }
        case 24:
            switch (className) {
                case 'comment-user-name':
                    return 'font-16 line-16';
                case 'screen-name':
                case 'show-all':
                case 'fold-comments':
                    return 'font-18 line-18';
                case 'text':
                case 'comment-text':
                case 'radio':
                    return 'font-24 line-24';
                default:
                    return '';
            }
        case 30:
            switch (className) {
                case 'comment-user-name':
                    return 'font-16 line-16';
                case 'screen-name':
                case 'show-all':
                case 'fold-comments':
                    return 'font-18 line-18';
                case 'text':
                case 'comment-text':
                case 'radio':
                    return 'font-30 line-30';
                default:
                    return '';
            }
        default:
            return '';
    }
}

export function setFontSize() {
    const vw = window.innerWidth;
    if (vw <= 280) {
        window.fontSize = 30;
        return;
    }
    if (vw <= 375) {
        window.fontSize = 20;
        return;
    }
    if (vw <= 540) {
        window.fontSize = 18;
        return;
    }
    if (vw <= 750) {
        window.fontSize = 16;
        return;
    }
    window.fontSize = 20;
}

export function isFullScreen(isFull = false, el) {
    const doc = document;
    if (isFull) {
        if (!el) throw new Error('if isFull is true, an el param is required');
        if (el.requestFullScreen) {
            el.requestFullScreen();
        } else if (el.webkitRequestFullScreen) {
            el.webkitRequestFullScreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.msRequestFullScreen) {
            el.msRequestFullScreen();
        }
        return;
    }
    if (doc.exitFullscreen) {
        doc.exitFullscreen();
    } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen(); //早期IE浏览器
    } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen(); //早期Chrome浏览器
    } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen(); //早期火狐浏览器
    }
}

let status = 0;
const tapDefaults = {
    time: 250,
    offset: 10
};
// m端单机
export function tap(node, a, b) {
    let st, sx, sy;
    let opts, callback;
    if (typeof a === 'function') {
        callback = a;
        opts = Object.assign({}, tapDefaults, b);
    } else {
        callback = b;
        opts = Object.assign({}, tapDefaults, a);
    }
    node.addEventListener(
        'touchstart',
        e => {
            // e.preventDefault(); // 阻止浏览器默认行为，防止触摸过程页面滚动
            const touch = e.targetTouches[0];
            st = e.timeStamp;
            sx = touch.pageX;
            sy = touch.pageY;
        },
        false
    );
    node.addEventListener(
        'touchend',
        e => {
            const touch = e.changedTouches[0];
            if (
                // 若为长按，则将时间判定条件更改
                e.timeStamp - st <= opts.time &&
                Math.abs(touch.pageX - sx) <= opts.offset &&
                Math.abs(touch.pageY - sy) <= opts.offset
            ) {
                callback && callback(e);
            }
        },
        false
    );
}

// m端双击
function handler(node, inject) {
    let st, sx, sy;
    node.addEventListener(
        'touchstart',
        e => {
            // e.preventDefault();
            const touch = e.targetTouches[0];
            st = e.timeStamp;
            sx = touch.pageX;
            sy = touch.pageY;
        },
        false
    );
    node.addEventListener(
        'touchend',
        e => {
            const touch = e.changedTouches[0];
            inject(e, {
                time: e.timeStamp - st,
                offsetX: Math.abs(touch.pageX - sx),
                offsetY: Math.abs(touch.pageY - sy)
            });
        },
        false
    );
}
export function doubletap(node, a, b) {
    let opts, callback;
    let status = 0;
    if (typeof a === 'function') {
        callback = a;
        opts = Object.assign({}, tapDefaults, b);
    } else {
        callback = b;
        opts = Object.assign({}, tapDefaults, a);
    }
    handler(node, (e, info) => {
        if (info.time <= opts.time && info.offsetX <= opts.offset && info.offsetY <= opts.offset) {
            if (status === 0) {
                status = 1;
                // 时间间隔太长则重置状态
                setTimeout(() => {
                    status = 0;
                }, opts.time);
            } else if (status === 1) {
                callback && callback(e);
                status = 0;
            }
        } else {
            status = 0;
        }
    });
}

// m端swipe(轻扫)
const swipeDefaults = {
    direction: 'horizontal', // vertical
    speed: 60,
    offset: 100,
    prevent: false
};
export function swipe(node, a, b) {
    let opts, callback, sTime, sTouch, eTouch;
    function swipestart(e) {
        if (opts.prevent) {
            e.preventDefault();
        }
        if (e.touches.length > 1) return;
        sTime = e.timeStamp;
        sTouch = eTouch = e.targetTouches[0];
        if (typeof opts.touchmove === 'function') {
            node.addEventListener('touchmove', swipemove, false);
        }
        node.addEventListener('touchend', swipeend, false);
    }
    function swipemove(e) {
        eTouch = e.targetTouches[0];
        if (opts.direction === 'horizontal') {
            opts.touchmove(eTouch.pageX - sTouch.pageX);
        } else {
            opts.touchmove(eTouch.pageY - sTouch.pageY);
        }
    }
    function swipeend(e) {
        eTouch = e.changedTouches[0];
        let time = e.timeStamp - sTime;
        let offset, direction;
        if (opts.direction === 'horizontal') {
            offset = eTouch.pageX - sTouch.pageX;
            direction = offset > 0 ? 'right' : 'left';
        } else {
            offset = eTouch.pageY - sTouch.pageY;
            direction = offset > 0 ? 'down' : 'up';
        }
        const speed = (Math.abs(offset) / time) * 1000;
        offset = Math.abs(offset);
        if ((offset < 60 && speed > 200) || (offset >= 60 && speed > 300)) {
            callback && callback(e, direction, speed);
        }
        node.removeEventListener('touchmove', swipemove);
        node.removeEventListener('touchend', swipeend);
    }
    if (typeof a === 'function') {
        callback = a;
        opts = Object.assign({}, swipeDefaults, b);
    } else {
        callback = b;
        opts = Object.assign({}, swipeDefaults, a);
    }
    node.addEventListener('touchstart', swipestart, false);
}

const pressDefaults = { time: 1000, offset: 10 };
export function press(node, a, b) {
    let opts, callback, sx, sy;
    let timer = null;
    if (typeof a === 'function') {
        callback = a;
        opts = Object.assign({}, pressDefaults, b);
    } else {
        callback = b;
        opts = Object.assign({}, pressDefaults, a);
    }
    node.addEventListener(
        'touchstart',
        e => {
            // e.preventDefault();
            const touch = e.targetTouches[0];
            sx = touch.pageX;
            sy = touch.pageY;
            timer = setTimeout(() => {
                callback && callback(e);
            }, opts.time);
        },
        false
    );
    node.addEventListener(
        'touchmove',
        e => {
            const touch = e.targetTouches[0];
            if (Math.abs(touch.pageX - sx) > opts.offset || Math.abs(touch.pageY - sy) > opts.offset) {
                clearTimeout(timer);
            }
        },
        false
    );
    node.addEventListener(
        'touchend',
        () => {
            clearTimeout(timer);
        },
        false
    );
}
