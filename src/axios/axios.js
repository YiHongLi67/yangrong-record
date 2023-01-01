import axios from 'axios';

let baseURL = 'http://localhost:5500';
// baseURL = 'https://yangrong-record.com:5500';

const request = axios.create({
    baseURL, //后端接口的基准地址
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
