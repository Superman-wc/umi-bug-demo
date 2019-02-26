import React from 'react';
import styles from './answer.less';

/**
 * 可输入区文本提示
 * @param text
 * @returns {*}
 * @constructor
 */
export default function Placeholder({text}) {
  return (
    <div className={styles['placeholder']}>{text}</div>
  )
}
