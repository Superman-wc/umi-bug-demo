import React, {Component} from 'react';
import PropsTypes from 'prop-types';
import Point from "./point";
import classnames from 'classnames';
import styles from './style/scrollbar.less';

const START_MOVE = Symbol('start-move');

export interface ScrollbarProps {
  style?: React.CSSProperties;
  className?: string,
  visible: boolean,
  direction: 'horizontal' | 'vertical';
  maxValue: number;
  value: number;
  size: number;
  onChange: (value: number) => void;
}

export default class Scrollbar extends Component<ScrollbarProps, any> {

  static propTypes = {
    direction: PropsTypes.oneOf(['horizontal', 'vertical']),
    className: PropsTypes.string,
    style: PropsTypes.object,
    visible: PropsTypes.bool,
    maxValue: PropsTypes.number,
    value: PropsTypes.number,
    size: PropsTypes.number,
    onChange: PropsTypes.func
  };

  static defaultProps = {
    direction: 'horizontal'
  };

  onMouseMove = (e) => {
    if (this[START_MOVE]) {
      const {clientX, clientY} = e;
      const {clientOffset: {x, y}, value, maxValue, direction, size, thumbSize} = this[START_MOVE];
      const {onChange} = this.props;
      const cx = clientX - x;
      const cy = clientY - y;
      if (direction === 'horizontal') {
        onChange && onChange(cx / (size - thumbSize) * maxValue + value);
      } else {
        onChange && onChange(cy / (size - thumbSize) * maxValue + value);
      }
    }
  };
  onMouseUp = (e) => {
    if (this[START_MOVE]) {
      const {clientX, clientY} = e;
      const {clientOffset: {x, y}, value, maxValue, direction, size, thumbSize} = this[START_MOVE];
      const {onChange} = this.props;
      const cx = clientX - x;
      const cy = clientY - y;
      if (direction === 'horizontal') {
        onChange && onChange(cx / (size - thumbSize) * maxValue + value);
      } else {
        onChange && onChange(cy / (size - thumbSize) * maxValue + value);
      }
      delete this[START_MOVE];
    }
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  render() {
    const {direction = 'horizontal', style, className, visible, maxValue, value, size} = this.props;
    const thumbSize = Math.max(size / maxValue * size / 2, 200);
    const _value = value / maxValue * (size - thumbSize);
    const _props = {
      style,
      className: classnames(styles['scrollbar'], styles['scrollbar-' + direction], className, {
        [styles['showed']]: visible
      })
    };
    const thumbStyle: React.CSSProperties = {};
    if (direction === 'horizontal') {
      thumbStyle.width = thumbSize;
      thumbStyle.transform = `translateX(${_value}px)`;
    } else {
      thumbStyle.height = thumbSize;
      thumbStyle.transform = `translateY(${_value}px)`;
    }
    const thumbProps = {
        className: styles['scrollbar-thumb'],
        style: thumbStyle,
        onMouseDown: (e) => {
          const {clientX, clientY} = e;
          document.addEventListener('mousemove', this.onMouseMove);
          document.addEventListener('mouseup', this.onMouseUp);
          this[START_MOVE] = {clientOffset: new Point(clientX, clientY), value, maxValue, direction, size, thumbSize};
        }
      }
    ;
    return (
      <div {..._props}>
        <div {...thumbProps}/>
      </div>
    )
  }
}
