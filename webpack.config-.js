const path = require('path'); // 引用path模块
module.exports = {
    // 这里是commrnt.js语法
    // 入口文件
    entry: './src/index.js',
    // 打包后的出口文件
    output: {
        // 输出的路径  是绝对路径(导入path模块) 这里是用node来做的
        path: path.resolve(__dirname, 'yangrong-record'),
        // 输出的文件名称
        filename: 'index.js'
    },
    // loader的配置
    module: {
        // 详细loader配置
        rules: [
            // 打包css的配置
            {
                test: /\.css$/, // 使用正则表达式,匹配那些文件
                use: [
                    // use数组中loader执行顺序, 从右到左, 从下到上, 依次执行
                    // 创建style标签, 将js中的样式资源插入进行, 添加到head中生效
                    'style-loader',
                    // 将css文件变成commitjs模块加载js中, 里面的内容是样式字符串
                    'css-loader'
                ]
            },
            // {
            //     test: /\.(eot|woff2?|ttf|svg)$/,
            //     exclude: path.resolve(__dirname, '../src/icons'), //不处理指定svg的文件(所有使用的svg文件放到该文件夹下)
            //     use: [
            //         {
            //             loader: 'url-loader',
            //             options: {
            //                 name: '[name]-[hash:5].min.[ext]',
            //                 limit: 5000, // fonts file size <= 5KB, use 'base64'; else, output svg file
            //                 outputPath: 'font',
            //                 publicPath: 'font'
            //             }
            //         }
            //     ]
            // },
            {
                test: /\.svg$/,
                loader: 'svg-sprite-loader',
                include: path.resolve(__dirname, '../src/icons'), //只处理指定svg的文件(所有使用的svg文件放到该文件夹下)
                options: {
                    symbolId: 'icon-[name]' //symbolId和use使用的名称对应      <use xlinkHref={"#icon-" + iconClass} />
                }
            }
        ]
    },
    // 使用开发模式打包
    mode: 'development'
};
