import React from 'react';
import PropTypes from 'prop-types';
import classname from 'classnames';
import './index.less';

// interface IEventHandler {
//   (e:any):void
// }

export interface FlexProps {
  id?: string;
  prefixCls?: string;
  className?: string;
  direction?: string,
  justify?: string,
  align?: string,
  isItem?: boolean,
  style?: React.CSSProperties,
  overflow: string,
  wrap: boolean,
  draggable?: boolean;
  onDragStart?: React.DragEventHandler<HTMLElement>;
  onDragOver?: React.DragEventHandler<HTMLElement>;
  onDragEnd?: React.DragEventHandler<HTMLElement>;
  onDrop?: React.DragEventHandler<HTMLElement>;
  onTransitionEnd?: React.DragEventHandler<HTMLElement>;
}

export default class Flex extends React.Component<FlexProps, any> {

  static Item;

  static defaultProps = {
    prefixCls: 'flex-wrapper',
  };

  static propTypes = {
    id: PropTypes.string,
    prefixCls: PropTypes.string,
    direction: PropTypes.string,
    justify: PropTypes.string,
    align: PropTypes.string,
    isItem: PropTypes.bool,
    overflow: PropTypes.string,
    wrap: PropTypes.bool,
    draggable: PropTypes.bool,
    onDragOver: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrop: PropTypes.func,
    onDragEnd: PropTypes.func,
    onTransitionEnd: PropTypes.func,
  };

  render() {
    const {
      className, children, direction, isItem, justify, align, prefixCls, overflow, wrap,
      ...props
    } = this.props;
    const _className = classname(className, prefixCls, {
      [prefixCls + '-direction-' + direction]: direction,
      [prefixCls + '-justify-' + justify]: justify,
      [prefixCls + '-align-' + align]: align,
      [prefixCls + '-item']: isItem,
      [prefixCls + '-overflow-' + overflow]: overflow,
      [prefixCls + '-wrap']: wrap,
      [prefixCls + '-nowrap']: !wrap,
    });


    return (
      <section className={_className} {...props}>
        {children}
      </section>
    );
  }
}


