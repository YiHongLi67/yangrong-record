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
            if (pre == 0 && !op.bengin) {
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
            return 'null';
        case '[object Array]':
            return 'array';
        case '[object Object]':
            return 'object';
        case '[object Date]':
            return 'date';
        case '[object RegExp]':
            return 'regexp';
    }
}