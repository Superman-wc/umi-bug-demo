import React from 'react';
import PropTypes from 'prop-types';
import classname from 'classnames';
import './index.less';

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
  // draggable: boolean,
  // onDragOver: PropTypes.func,
  // onDragStart: PropTypes.func,
  // onDrop: PropTypes.func,
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
    // draggable: PropTypes.boolean,
    // onDragOver: PropTypes.func,
    // onDragStart: PropTypes.func,
    // onDrop: PropTypes.func,
  };

  render() {
    const {
      id, className, children, direction, style, isItem, justify, align, prefixCls, overflow, wrap,
      // draggable, onDragOver, onDragStart, onDrop
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
    //draggable={draggable} onDragOver={onDragOver} onDragStart={onDragStart} onDrop={onDrop}

    return (
      <section id={id} className={_className} style={style}

      >
        {children}
      </section>
    );
  }
}


