const path = require('path'); // 引用 path 模块
const HtmlWebpackPlugin = require('html-webpack-plugin');
process.env.NODE_ENV = 'development';
module.exports = {
    // 使用开发模式打包
    mode: 'development',
    // 开发模式下打包后的文件不压缩处理
    devtool: 'cheap-module-source-map',
    // 入口文件
    entry: './src/index.js',
    // 打包后的出口文件
    output: {
        // 输出的路径: 是绝对路径 (导入path模块) 这里是用 node 来做的
        path: path.resolve(__dirname, 'record'),
        // 输出的文件名称
        filename: 'index.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './public/index.html'),
            title: 'yangrong-record',
            favicon: path.resolve('favicon.ico')
        })
    ],
    // 配置 webpack 开发模式下监测文件修改自动打包
    devServer: {
        static: './record',
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true
    },
    module: {
        // 详细 loader 配置
        rules: [
            // 打包 css 的配置
            {
                test: /\.css$/, // 使用正则表达式匹配 css 文件
                use: [
                    // use 数组中 loader 执行顺序, 从右到左, 从下到上, 依次执行
                    // 创建 style 标签, 将 js 中的样式资源插入进行, 添加到 head 中生效
                    'style-loader',
                    // 将 css 文件变成 commitjs 模块加载js中, 里面的内容是样式字符串
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(woff|woff2|ttf|)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.svg$/,
                loader: 'svg-sprite-loader',
                // 只处理指定目录下的 svg 文件 (所有 svg 都文件放到该文件夹下
                include: path.resolve(__dirname, './src/static/icon/svg'),
                options: {
                    symbolId: 'icon-[name]' // symbolId 和 use 使用的名称对应
                }
            },
            {
                test: /\.js|jsx$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },
                exclude: '/node_modules/' // 排除这个目录
            }
        ]
    }
};
