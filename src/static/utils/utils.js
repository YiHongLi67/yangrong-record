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

export function queryString(url) {
    url = url.split('?')[1].split('#')[0];
    let reg = /([^?&=]+)=*([^?&=]*)/g;
    /**
     * @reg 相关说明
     * ()表示子组
     * [^]表示字符类取反,比如[^abc]匹配的就是不是a和b和c的单个字符，[^?&=]匹配不是^和?和=的单个字符.
     * 字符类[]后面的+和*表示量词
     * + 等价于 {1,} 重复1次或多次
     * * 等价于 {0,} 重复0次或多次
     */
    let params = {};
    url.replace(reg, function (subStr, key, value) {
        params[key] = value;
    });
    return params;
}
