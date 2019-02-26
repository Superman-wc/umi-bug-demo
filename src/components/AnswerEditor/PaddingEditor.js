import React, {Component} from 'react';
import { InputNumber} from 'antd';
import styles from './answer.less';

export default class PaddingEditor extends Component {
  render() {
    const {value = [60, 45, 60, 45], onChange, min = 0, max = 200} = this.props;
    const buildProps = (index) => {
      return {
        style: {width: 60},
        max,
        min,
        value: value[index],
        onChange: v => {
          value[index] = v;
          onChange(value);
        }
      }
    };
    return (
      <div className={styles['padding-editor']}>
        <div/>
        <div><InputNumber {...buildProps(0)}/></div>
        <div/>
        <div><InputNumber {...buildProps(3)}/></div>
        <div/>
        <div><InputNumber {...buildProps(1)}/></div>
        <div/>
        <div><InputNumber {...buildProps(2)}/></div>
      </div>
    )
  }
}

