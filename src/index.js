import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/antd.css';
import 'animate.css';
import './static/layout/theme.css';
import './static/layout/basic.css';
import './static/layout/iconfont.css';
import './static/layout/font-flexible.less';
import './static/layout/flexible.less';
import './static/icon/svg.js';
import 'lib-flexible';
import { setDevice, setFontSize } from './static/utils/utils';
setDevice();
setFontSize();
import App from './App';
import { BrowserRouter, HashRouter } from 'react-router-dom';

const app = ReactDOM.createRoot(document.getElementById('app'));
app.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
