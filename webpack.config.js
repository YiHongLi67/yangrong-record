const path = require('path'); // 引用 path 模块
const HtmlWebpackPlugin = require('html-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 提取 css 成单独的文件
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin'); // 压缩 css
const TerserWebpackPlugin = require('terser-webpack-plugin'); // 压缩 js
// "dev": "webpack serve --config ./webpack.dev.js",
// "build": "webpack --config ./webpack.prod.js",
// babel 环境变量
// 方案一: 安装 cross-env
// 启动命令: cross-env NODE_ENV=development/production webpack serve --config ./webpack.config.js
// 方案二: 配置 process.env.NODE_ENV = 'development'
// process.env.NODE_ENV = 'development';
let isProduction = process.env.NODE_ENV === 'production';
const getStyleLoader = loader => {
    return [
        // use 数组中 loader 执行顺序, 从右到左, 从下到上, 依次执行
        // 创建 style 标签, 将 js 中的样式资源插入进行, 添加到 head 中生效
        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
        // 将 css 文件变成 commitjs 模块加载 js中, 里面的内容是样式字符串
        'css-loader',
        {
            // 处理 css 兼容性问题, 配和 package.json 中的 browserslist 来指定兼容性
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: ['postcss-preset-env']
                }
            }
        },
        loader
    ].filter(Boolean);
};
module.exports = {
    // 使用开发模式打包
    mode: isProduction ? 'production' : 'development',
    // 开发模式下打包后的文件不压缩处理
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    // 入口文件
    entry: './src/index.js',
    // 打包后的出口文件
    output: {
        // 输出的路径: 是绝对路径 (导入path模块) 这里是用 node 来做的
        path: path.resolve(__dirname, 'yangrong-record'),
        filename: isProduction ? 'static/js/[name].[contenthash:10].js' : 'static/js/[name].js', // 输出的文件名称
        chunkFilename: isProduction ? 'static/js/[name].[contenthash:10].chunk.js' : 'static/js/[name].chunk.js', // import 导入的文件打包后输出的文件名称
        // hash:10 使用 hash 值的前10位; ext 自动补全文件后缀名; query 有参数的话携带上
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
        clean: true
    },
    // 配置 webpack 开发模式下监测文件修改自动打包
    devServer: {
        static: './yangrong-record',
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true, // 开启热更新功能
        historyApiFallback: true //解决前端路由刷新 404
    },
    resolve: {
        // webpack 解析模块加载的配置选项
        extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'] // 自动补全文件扩展名
    },
    optimization: {
        splitChunks: {
            chunks: 'all' //打包后的代码进行分割, 不放在一个文件中
        },
        runtimeChunk: {
            name: entrypoint => `runtime~${entrypoint.name}` // 解决代码分割后缓存失效
        },
        minimize: isProduction,
        minimizer: [new CssMinimizerWebpackPlugin(), new TerserWebpackPlugin()]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'yangrong-record',
            template: './public/index.html', // 解析生成 HTML 首页
            favicon: './public/favicon.png'
        }),
        // new EslintWebpackPlugin({
        //     context: path.resolve(__dirname, './src'), // 配置 eslint 语法检查
        //     exclude: '/node_modules/',
        //     cache: true,
        //     // 配置 eslint 缓存
        //     cacheLocation: path.resolve(__dirname, './node_modules/.cache/.eslintcache')
        // }),
        !isProduction && new ReactRefreshWebpackPlugin(), // 激活 js 的 HMR(热更新) 功能
        // 这里有个坑, 大家记得要搜 @pmmmwh/react-refresh-webpack-plugin 还有个不带@pmmmwh的包, 那个包会报错
        isProduction &&
            new MiniCssExtractPlugin({
                filename: 'static/css[name].[contenthash:10].css', // 提取 css 到单独文件中
                chunkFilename: 'static/css[name].[contenthash:10].chunk.css'
            }),
        isProduction && new CssMinimizerWebpackPlugin()
    ].filter(Boolean),
    module: {
        // 详细 loader 配置
        rules: [
            {
                test: /\.css$/, // 使用正则表达式匹配 css 文件
                use: getStyleLoader() // 打包 css 的配置
            },

            {
                test: /\.less$/,
                use: getStyleLoader('less-loader') // 打包 less 的配置
            },

            {
                test: /\.s[ac]ss$/,
                use: getStyleLoader('sass-loader') // 打包 scss/sass 的配置
            },

            {
                test: /\.styl$/,
                use: getStyleLoader('stylus-loader') // 打包 stylus 的配置
            },
            {
                test: /\.(png|jpe?g||gif|webp|icn)$/i,
                type: 'asset', // asset 可将资源转为 base64 编码
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024 // 小于 10kb 的图片转为 base64 编码
                    }
                }
            },
            {
                test: /\.(woff|woff2|ttf|mp4|mov)$/i,
                type: 'asset/resource' // asset/resource 保持原来的编码
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
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        cacheDirectory: true, // 开启缓存
                        cacheCompression: false, // 缓存文件不压缩
                        plugins: [!isProduction && 'react-refresh/babel'].filter(Boolean) // 激活 js 的 HMR(热更新) 功能
                    }
                },
                exclude: '/node_modules/', // 排除这个目录
                include: path.resolve(__dirname, './src') // 包含这个目录
            }
        ]
    }
};
