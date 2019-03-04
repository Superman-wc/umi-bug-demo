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
    const props = {
      role: 'box',
      'data-type': 'score',
      'data-value': i
    };
    scores.push(
      <div key={i} {...props}>{i}</div>
    )
  }
  const props = {
    className:styles['score'],
    role: 'box',
    'data-type': 'score-list'
  };
  return (
    <div {...props}>{scores}</div>
  )
}
