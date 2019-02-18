import React, {Component, Fragment} from 'react';
import {SketchPicker} from 'react-color';
import {Input} from 'antd';
import styles from './index.less';

export default class ColorPicker extends Component {

  constructor(props) {
    super(...arguments);
    this.state = {
      visible: false,
      value: props.value || '#fff'
    }
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  render() {
    return (
      <div className={styles['color-picker']}>
        <Input readOnly
               value={this.state.value.toUpperCase()}
               onFocus={() => {
                 clearTimeout(this._leave_sid);
                 this.setState({visible: true});
                 this._focus = true;
               }}
               onBlur={() => {
                 this._focus = false;
                 if (!this._hover) {
                   clearTimeout(this._leave_sid);
                   this.setState({visible: false});
                 }
               }}
        />
        {

          <span className={styles['picker-wrap']} style={{display: this.state.visible ? 'block' : 'none'}}
                onMouseEnter={() => {
                  this._hover = true;
                  clearTimeout(this._leave_sid);
                  console.log(this._hover);
                }}
                onMouseLeave={() => {
                  this._hover = false;
                  console.log(this._hover);
                  this._leave_sid = setTimeout(() => {
                    !this._focus && this._mounted && this.setState({visible: false});
                  }, 500);
                }}>
              <SketchPicker
                color={this.state.value}
                onChangeComplete={({hex}) => {
                  this.setState({value: hex});
                  this.props.onChange && this.props.onChange(hex);
                }}/>
            </span>
        }
      </div>
    )
  }
}


