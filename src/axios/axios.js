import axios from 'axios';

const request = axios.create({
    baseURL: 'http://127.0.0.1:5000', //后端接口的基准地址
    timeout: 5000
});
//拦截请求
request.interceptors.request.use(config => {
    return config;
});
//拦截响应
request.interceptors.response.use(
    response => {
        return response;
    },
    function (error) {
        //对响应的错误做点什么
        return Promise.reject(error);
    }
);

export default request;
