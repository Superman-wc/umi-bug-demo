import React, {Component} from 'react';
import classNames from 'classnames';
import styles from './answer.less';

const AbleMove = Symbol('#Answer.AbleMove');

export default class Element extends Component {

  constructor(props) {
    super(props);
    this.state = {
      x: props.element.x || 0,
      y: props.element.y || 0
    }
  }


  handleMouseDown = (e) => {
    if (!this[AbleMove] && this.props.ableMove) {
      const {x, y} = this.state;
      const {clientX, clientY} = e;
      this[AbleMove] = {clientX, clientY, x, y};
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    }
  };

  handleMouseMove = (e) => {
    if (this[AbleMove]) {
      let {clientX, clientY, x, y} = this[AbleMove];
      if (typeof this.props.ableMove === 'string') {
        if (this.props.ableMove.indexOf('x') >= 0) {
          x += e.clientX - clientX;
        }
        if (this.props.ableMove.indexOf('y') >= 0) {
          y += e.clientY - clientY;
        }
      } else {
        x += e.clientX - clientX;
        y += e.clientY - clientY;
      }

      document.body.setAttribute('data-move', 'true');
      this.setState({x, y, move: true});
    }
  };

  handleMouseUp = (e) => {
    if (this[AbleMove]) {
      let {clientX, clientY, x, y} = this[AbleMove];
      if (typeof this.props.ableMove === 'string') {
        if (this.props.ableMove.indexOf('x') >= 0) {
          x += e.clientX - clientX;
        }
        if (this.props.ableMove.indexOf('y') >= 0) {
          y += e.clientY - clientY;
        }
      } else {
        x += e.clientX - clientX;
        y += e.clientY - clientY;
      }
      this.setState({x, y, move: false});
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      document.body.removeAttribute('data-move');
      delete this[AbleMove];
    }
  };


  render() {

    const {role, element, border, active, focus, hover, onActive, onFocus, onHover, children, className,} = this.props;

    const {x = 0, y = 0, move} = this.state;

    const style = {...this.props.style, transform: `translateX(${x}px) translateY(${y}px)`};


    const props = {
      id: element.key,
      className: classNames(className, styles['element'], {
        [styles['active']]: active,
        [styles['focus']]: focus,
        [styles['hover']]: hover,
        [styles['border']]: border,
        [styles['move']]: move
      }),
      style,
      // onMouseDown: this.handleMouseDown,
      children,
      onClick: () => {
        onActive && onActive(element);
        // onFocus && onFocus(element);
      },
      // onMouseEnter: () => {
      //   onHover && onHover(element, true);
      // },
      // onMouseLeave: () => {
      //   onHover && onHover(element, false);
      // },
    };

    if (role) {
      Object.assign(props, role);
    }

    return (
      <div {...props} />
    )
  }
}
