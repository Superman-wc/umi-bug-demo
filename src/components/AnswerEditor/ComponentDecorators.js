import React, {Component, Fragment, createRef} from 'react';
import {Form, Checkbox, Button, Menu, Icon, Input, InputNumber, Select} from 'antd';
import classNames from 'classnames';
import hoistStatics from 'hoist-non-react-statics';
import uuid from 'uuid/v4';
import styles from './answer.less';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'WrappedComponent';
}

export function argumentContainer(Container, WrappedComponent, displayNamePrefix = 'div') {
  /* eslint no-param-reassign:0 */
  Container.displayName = `${displayNamePrefix}(${getDisplayName(WrappedComponent)})`;
  Container.WrappedComponent = WrappedComponent;
  return hoistStatics(Container, WrappedComponent);
}

export function WrapperComponent(name, props) {
  return function (WrappedComponent) {
    return argumentContainer(
      class extends Component {
        render() {
          const {wrappedComponentRef, ...restProps} = this.props;
          const wrapperProps = {
            [name]: props
          };
          if (wrappedComponentRef) {
            wrapperProps.ref = wrappedComponentRef;
          }
          const _props = {
            ...wrapperProps,
            ...restProps,
          };
          return (
            <WrappedComponent {..._props}/>
          )
        }
      },
      WrappedComponent,
      name
    )
  }
}

export function SupportDrag(props) {
  return WrapperComponent('drag', {
    onDrag: function (e) {
    },
    onDragStart: function (e) {
      console.log(this, e.type)
    },
    onDragEnd: function (e) {
      console.log(this, e.type)
    },
    onDragOver: function (e) {
    },
    onDragLeave: function (e) {
    },
    onDragEnter: function (e) {
    },
    onDragExit: function (e) {
    },
    draggable: true,
    ...props
  });
}

export function SupportMove() {
  const SupportMoveSymbol = Symbol('#SupportMove');
  return function (Component) {
    if (!Component[SupportMoveSymbol]) {
      Component[SupportMoveSymbol] = true;
      const _onMouseDown = Component.prototype.onMouseDown;
      Component.prototype.onMouseDown = function (e) {
        _onMouseDown && _onMouseDown.call(this, e);
        if (!this[SupportMoveSymbol]) {
          const {x = 0, y = 0} = this.state;
          const {clientX, clientY} = e;
          this[SupportMoveSymbol] = {
            x, y, clientX, clientY
          };
          let transform = (s) => this.transform ? this.transform(s) : s;
          const checkPositionChange = (e, move) => {
            let {x = 0, y = 0, clientX = 0, clientY = 0} = this[SupportMoveSymbol];
            const _x = transform(e.clientX - clientX);
            const _y = transform(e.clientY - clientY);
            // if (_x || _y) {
              x += _x;
              y += _y;
              this.onPositionChange ?
                this.onPositionChange({x, y, move})
                :
                this.setState({x, y, move});
            // }
          };
          const onMouseMove = e=>{
            if (this[SupportMoveSymbol]) {
              checkPositionChange(e, true);
            }
          };
          const onMouseUp = e=>{
            if (this[SupportMoveSymbol]) {
              checkPositionChange(e, false);
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mousemove', onMouseUp);
              delete this[SupportMoveSymbol];
            }
          };
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mousemove', onMouseUp);
        }
      }
    }
  };
}
