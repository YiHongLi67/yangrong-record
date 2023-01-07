import moment from 'moment';
import 'moment/locale/zh-cn';
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
    } else {
        return moment(created_at).format('YY-M-D HH: mm');
    }
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

export function resetDevice() {
    const setDevice = function () {
        console.log('setDevice');
        let userAgentInfo = navigator.userAgent;
        let Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
        let getArr = Agents.filter(i => userAgentInfo.includes(i));
        getArr.length ? (window.deviceIsPc = false) : (window.deviceIsPc = true);
    };
    setDevice();
    // window.onresize = setDevice;
}
