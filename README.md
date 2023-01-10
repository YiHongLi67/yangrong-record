### yangrong-record.com 是关于杨蓉作品和动态的记录网站

01. 比如微博更新记录

### 优化

* 移动端上拉加载更多事件
* 移动端鼠标滚轮缩放事件
* 移动端二级评论css
* 文本中的图片未垂直居中
* 图片预览进度未垂直居中
* 移动端 blog图片只有一张时, 占据屏幕的 2/3 左右
* 展开全文
* 真实服务器头像禁止访问
* 头像加载错误显示默认头像
* V标识动画每条微博出现时都添加
* 数字格式化字符串显示
* 转发评论点赞为0不显示
* video scale 黑屏
* 加载当前blog全部mov/gif
* 评论`博主`logo
* 增加回到顶部按钮
* 评论排序
* 请求未完成时添加`加载动画`
* v认证标识
* 粉丝等级标识
* 会员标识

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
