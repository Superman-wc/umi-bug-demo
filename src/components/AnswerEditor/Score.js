import React from 'react';
import styles from './answer.less';

/**
 * 分数区
 * @param value
 * @returns {*}
 * @constructor
 */
export function Score({value = 10}) {
  const scores = [];
  for (let i = 0; i <= value; i++) {
    scores.push(
      <div key={i}>{i}</div>
    )
  }
  return (
    <div className={styles['score']}>{scores}</div>
  )
}
