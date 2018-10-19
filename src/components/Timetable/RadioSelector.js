import React from 'react';
import classnames from "classnames";
import {Radio} from 'antd';
import LabelBox from './LabelBox';
import styles from './index.less';

export default function RadioSelector({style, className, title, options = [], defaultValue, onChange}) {
  return (
    <LabelBox className={className} style={style} title={title}>
      <Radio.Group defaultValue={defaultValue}
                   buttonStyle="solid"
                   className={classnames(styles['radio-group-buttons'], className)}
                   onChange={onChange}
      >
        {
          options.map(({name, id}) =>
            <Radio.Button key={id} value={id}>{name}</Radio.Button>
          )
        }
      </Radio.Group>
    </LabelBox>
  );
}
