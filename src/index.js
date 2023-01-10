import React from 'react';
import ReactDOM from 'react-dom/client';
import './static/layout/iconfont.css';
import 'antd/dist/antd.css';
import './static/layout/theme.css';
import './static/layout/basic.css';
import './static/layout/flexible.css';
import './static/icon/svg.js';
import 'lib-flexible';
import { resetDevice } from './static/utils/utils';
resetDevice();
import App from './App';
import { BrowserRouter, HashRouter } from 'react-router-dom';

const app = ReactDOM.createRoot(document.getElementById('app'));
app.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
