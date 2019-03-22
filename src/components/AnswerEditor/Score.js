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
  const valueStr = value + '';


  scores.push(<ScoreItem key={0} value={0}/>);

  // 整数按位分割， 反向， 个位在前，
  valueStr.split('').reverse().forEach((s, v) => {
    const m = valueStr.length - 1 > v ? 9 : parseInt(s, 10);
    const k = Math.pow(10, v);
    for (let i = 1; i <= m; i++) {
      const j = i * k;
      scores.push(
        <ScoreItem key={j} value={j}/>
      )
    }
  });

  if (value > 10) {
    scores.push(<ScoreItem key={value} value={value}/>);
  }


  const props = {
    className: styles['score'],
    role: 'box',
    'data-type': 'score-list'
  };
  return (
    <div {...props}>{scores}</div>
  )
}

function ScoreItem({value}) {
  return (
    <div role="box" data-type="score" data-value={value}>{value}</div>
  )
}
