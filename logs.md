### 待优化

* 18
* comment跳blog报错
* 下拉刷新
* 加载提示动画
* 双击放大, 将图片translate到视野区
* 移动端 ratio 不为 1 时, 拖拽图片偶现切图事件
* 切换图片时, 另一个手指触摸屏幕放开后位置不复原
* 缩放同时也应触发拖拽事件
* 微信内置浏览器拖拽事件卡顿
* QQ浏览器移动端无法下载图片
* 展开全文
* 真实服务器头像禁止访问
* 头像加载错误显示默认头像
* V标识动画每条微博出现时都添加
* 数字格式化字符串显示
* 转发评论点赞为0不显示
* 加载当前blog全部mov/gif
* 评论`博主`logo
* 增加回到顶部按钮
* 评论排序
* 请求未完成时添加`加载动画`

### media资源

* jpg `pid.jpg`
  + thumb: .jpg
  + normal: .jpg
  + large: .jpg
* gif `pid.gif`
  + thumb: .gif
  + normal: .mp4
  + large: .gif
* mov `pid.mov`
  + thumb: .jpg
  + normal: .jpg
  + large: .jpg
  + mov: .mov

### 图片 size 规格

* thumb: `https://wx2.sinaimg.cn/wap180/006Ur1aCgy1h962r87uo5g308i08akjl.gif`
* bmiddle: `https://wx2.sinaimg.cn/wap360/006Ur1aCgy1h962r87uo5g308i08akjl.gif`
* large: `https://wx2.sinaimg.cn/sti960/006Ur1aCgy1h962r87uo5g308i08akjl.gif`
* original: `https://wx2.sinaimg.cn/orj1080/006Ur1aCgy1h962r87uo5g308i08akjl.gif`
* largest: `https://wx2.sinaimg.cn/large/006Ur1aCgy1h962r87uo5g308i08akjl.gif`
* mw2000: `https://wx2.sinaimg.cn/mw2000/006Ur1aCgy1h962r87uo5g308i08akjl.gif`

* blog 获取 size 规格: bmiddle original largest(原图)
* comment--jpg 获取 size 规格: bmiddle original mw2000
* comment--gif 获取 size 规格: bmiddle original  -->  original === mw2000
