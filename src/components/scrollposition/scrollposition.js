import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageScrollContext } from '../../context/context';
import { _throttle } from '../../static/utils/utils';

export default function ScrollToPosition({ children }) {
    const location = useLocation();
    const { pathname } = location;
    const scrollTo = _pathname => {
        const scrollY = sessionStorage.getItem(_pathname || pathname);
        // 为了避免 scrollY 为 0 引起的滚动到顶部后没有记录的 bug, 将交互改为在150px内直接滚动到顶部
        if (scrollY) {
            const scrollResult = Number(scrollY) < 150 ? 0 : Number(scrollY);
            // 手机端 QQ/微信/QQ浏览器 获取到的 document.documentElement.scrollTop 始终为 0
            // scrollTop 也可以试试 window.scrollY, window.scrollTo(x, y)
            document.body.scrollTop = scrollY;
            document.documentElement.scrollTop = scrollY;
        }
    };
    // 路由切换时重新绑定一次最新的 pathname
    useEffect(() => {
        const scrollHandler = _throttle(
            () => {
                // 点击切换路由时会触发一次 scroll，此时 scrollY 为 0
                if (window.scrollY > 0) {
                    sessionStorage.setItem(pathname, String(document.body.scrollTop || document.documentElement.scrollTop));
                }
            },
            200,
            { begin: true, end: true }
        );
        window.addEventListener('scroll', scrollHandler);
        return () => {
            // 做好清理
            window.removeEventListener('scroll', scrollHandler);
        };
    }, [pathname]);
    return <PageScrollContext.Provider value={scrollTo}>{children}</PageScrollContext.Provider>;
}
