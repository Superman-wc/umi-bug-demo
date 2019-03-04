import React, {Component, Fragment, createRef} from 'react';
import { Form, Checkbox, Button, Menu, Icon, Input, InputNumber, Select} from 'antd';
import classNames from 'classnames';
import uuid from 'uuid/v4';
import styles from './answer.less';
import {NumberArea} from './DaubRectangleBox';
import Element from './Element';


/**
 * 学号框
 */
class StudentCodeBox extends Component {

  state = {
    value: '',
    length: 8
  };

  componentDidMount() {
    const {value, length = 8} = this.props;
    this.setState({value, length});
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (nextProps.value !== this.props.value || nextProps.length !== this.props.length) {
      this.setState({value: nextProps.value, length: nextProps.length});
    }
  }


  render() {
    const {focus, value = '', length = 8} = this.state;
    const codes = value.split('');
    for (let i = 0, len = length - codes.length; i < len; i++) {
      codes.push('');
    }
    return (
      <div className={[styles['student-code-box'], focus ? styles['focus'] : ''].join(' ')}>
        <input maxLength={length} value={value}
               onChange={(e) => {
                 const v = e.target.value.replace(/[^\d]/g, '');
                 this.setState({value: v});
                 this.props.onChange && this.props.onChange(v);
               }}
               onFocus={() => {
                 this.setState({focus: true});
                 this.props.onFocus && this.props.onFocus();
               }}
               onBlur={() => {
                 this.setState({focus: false});
                 this.props.onBlur && this.props.onBlur();
               }}
        />
        {
          codes.map((value, key) =>
            <div key={key} className={styles['student-code-col']}>
              <div className={styles['student-code-value']}>{value}</div>
              <NumberArea value={value}/>
            </div>
          )
        }

      </div>
    )
  }
}

/**
 * 学生信息框
 * @param value
 * @param onChange
 * @param style
 * @param props
 * @returns {*}
 * @constructor
 */
export default function StudentInfoBox({value, onChange, style, ...props}) {
  const eleProps = {
    ...props,
    className:styles['student-info-box'],
    style: {...style, width: (value.length || 8) * 28 + 1},
    element: value,
    border: true,
    role: {
      role:'box',
      'data-type': value.type,
    },
  };
  return (
    <Element {...eleProps}>
      <div className={styles['student-info-header']}>
        <label>班级：</label>
        <label>姓名：</label>
      </div>
      <StudentCodeBox value={value.code} length={value.length || 8} onChange={(code) => {
        value.code = code;
        onChange && onChange(value);
      }}/>
    </Element>
  )
}

StudentInfoBox.attributes = {
  code: {
    type: 'string', label: '学号前缀',
    fieldOptions: {
      initialValue: new Date().getFullYear().toString(),
      rules: [{pattern: /\d+/g, message: '请输入数字学号前缀'}]
    }
  },
  length: {
    type: 'number', label: '学号长度',
    fieldOptions: {
      initialValue: 8,
      rules: [{min: 6, max: 12}]
    },
  },
};
