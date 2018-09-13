import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './index.less';

export interface FlexItemProps {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties,
  overflow?: PropTypes.string,
  onClick?: PropTypes.func,
  onContextMenu?: PropTypes.func,
  onDoubleClick?: PropTypes.func,
  onMouseDown?: PropTypes.func,
  onMouseEnter?: PropTypes.func,
  onMouseLeave?: PropTypes.func,
  onMouseMove?: PropTypes.func,
  onMouseOut?: PropTypes.func,
  onMouseOver?: PropTypes.func,
  onMouseUp?: PropTypes.func,
  onScroll?:PropTypes.func,
  onWheel?:PropTypes.func,
}

export default class FlexItem extends React.Component<FlexItemProps, any> {
  static defaultProps = {
    prefixCls: 'flex-wrapper-item',
  };

  // static propTypes = {
  //   prefixCls: PropTypes.string,
  //   overflow: PropTypes.string,
  //   onClick: PropTypes.func,
  //   onContextMenu: PropTypes.func,
  //   onDoubleClick: PropTypes.func,
  //   onMouseDown: PropTypes.func,
  //   onMouseEnter: PropTypes.func,
  //   onMouseLeave: PropTypes.func,
  //   onMouseMove: PropTypes.func,
  //   onMouseOut: PropTypes.func,
  //   onMouseOver: PropTypes.func,
  //   onMouseUp: PropTypes.func,
  // };

  render() {
    const {
      prefixCls, className, style, children, overflow,
      onClick,
      onContextMenu,
      onDoubleClick,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseOut,
      onMouseOver,
      onMouseUp,
      onScroll,
      onWheel,
    } = this.props;
    return (
      <main className={classnames(prefixCls, className, {
        [prefixCls + '-' + overflow]: overflow
      })} style={style}
            onClick={onClick}
            onContextMenu={onContextMenu}
            onDoubleClick={onDoubleClick}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            onMouseOut={onMouseOut}
            onMouseOver={onMouseOver}
            onMouseUp={onMouseUp}
            onScroll={onScroll}
            onWheel={onWheel}
      >
        {children}
      </main>
    );
  }
}

