import React from 'react';
import PropTypes from 'prop-types';
import './svgicon.css';
const SvgIcon = props => {
    const { iconClass, fill, width, height, viewBox } = props;
    return (
        <i aria-hidden='true' className={'i-' + iconClass}>
            <svg className={'svg ' + iconClass} width={width} height={height} viewBox={viewBox}>
                <use xlinkHref={'#icon-' + iconClass} fill={fill} />
            </svg>
        </i>
    );
};
SvgIcon.propTypes = {
    // svg名字
    iconClass: PropTypes.string.isRequired,
    // 填充颜色
    fill: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    viewBox: PropTypes.string
};
SvgIcon.defaultProps = {
    fill: 'currentColor',
    width: '100',
    height: '100',
    viewBox: '0 0 100 100'
};
export default SvgIcon;
