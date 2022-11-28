import React from 'react';
import ReactDOM from 'react-dom/client';
import './static/layout/iconfont.css';
import 'antd/dist/antd.css';
import './static/layout/theme.css';
import './static/layout/basic.css';
import './static/icon/svg.js';
import App from './App';
import { BrowserRouter, HashRouter } from 'react-router-dom';

const app = ReactDOM.createRoot(document.getElementById('app'));
app.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
