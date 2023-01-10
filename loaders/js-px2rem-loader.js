// 默认参数
const defaultopts = {
    remUnit: 136.6, // rem unit value (default: 100)
    remFixed: 3 // rem value precision (default: 2)
};
// 获取webpack配置好的参数
const opts = this.getOptions;
// 将参数组合
const config = Object.assign({}, defaultopts, opts);
const px2remReg = /\b(\d+(\.\d+)?)px\b/g;

module.exports = function (source) {
    // return source;
    if (this.cacheable) {
        this.cacheable();
    }
    // 先test下有没有符合的如果有再进行替换;
    if (px2remReg.test(source)) {
        return source.replace(px2remReg, ($0, $1) => {
            let val = $1 / config.remUnit;
            // 精确到几位
            val = parseFloat(val.toFixed(config.remFixed));
            return val === 0 ? val : val + 'rem';
        });
    } else {
        return source;
    }
};
