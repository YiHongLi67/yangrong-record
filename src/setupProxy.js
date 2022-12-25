import { createProxyMiddleware } from 'http-proxy-middleware';
export default function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:8888/',
            changeOrigin: true,
            pathRewrite: {
                '^/api': ''
            }
        })
    );
    app.use(
        '/mov',
        createProxyMiddleware({
            target: 'http://localhost:7777/',
            changeOrigin: true,
            pathRewrite: {
                '^/apc': ''
            }
        })
    );
}
