import React from 'react';
import Flex from '../Flex';
import styles from './WeekTimeTable.less';

export default function LabelBox({style, className, title, children}) {
  return (
    <Flex className={styles['label-box']} style={style}>
      {
        title ?
          <h3><span>{title}:</span></h3>
          :
          null
      }
      {children}
    </Flex>
  );
}
