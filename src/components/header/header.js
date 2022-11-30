import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { publish } from 'pubsub-js';
const { Header: AntdHeader } = Layout;

const icons = [<span className='iconfont icon-shouye'></span>];

export default function Header() {
    const navigate = useNavigate();

    return (
        <AntdHeader theme='white' className='fixed top-0 ie-box w-full'>
            <div className='logo'></div>
            <Menu
                theme='white'
                mode='horizontal'
                defaultSelectedKeys={['1']}
                onClick={function (data) {
                    if (data.key === '1') {
                        navigate(`/`);
                        publish('blogsRefresh');
                    }
                }}
                items={icons.map((icon, index) => {
                    const key = index + 1;
                    return {
                        key,
                        icon
                    };
                })}
            />
        </AntdHeader>
    );
}
