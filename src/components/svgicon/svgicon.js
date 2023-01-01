import React from 'react';
import PropTypes from 'prop-types';
import './svgicon.css';
function SvgIcon(props) {
    const { iconClass, fill, iW, iH, width, height, viewBox } = props;
    return (
        <i aria-hidden='true' className={'i-svg ' + iconClass} width={iW} height={iH}>
            <svg className={'svg ' + iconClass} width={width} height={height} viewBox={viewBox}>
                <use xlinkHref={'#icon-' + iconClass} fill={fill} />
            </svg>
        </i>
    );
}
SvgIcon.propTypes = {
    // svg名字
    iconClass: PropTypes.string.isRequired,
    // 填充颜色
    fill: PropTypes.string,
    iW: PropTypes.string,
    iH: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    viewBox: PropTypes.string
};
SvgIcon.defaultProps = {
    fill: 'currentColor',
    iW: '',
    iH: '',
    width: '100',
    height: '100',
    viewBox: '0 0 100 100'
};
export default SvgIcon;
