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
  const valueStr = value+'';


  scores.push(
    <div key={0} {...{
      role: 'box',
      'data-type': 'score',
      'data-value': 0
    }}>0</div>
  );

  // 整数按位分割， 反向， 个位在前，
  valueStr.split('').reverse().forEach((s, v)=>{
    const m = valueStr.length-1>v ? 9 : parseInt(s, 10);
    const k = Math.pow(10, v);
    for(let i=1; i<=m; i++){
      const j = i*k;
      const props = {
        role: 'box',
        'data-type': 'score',
        'data-value': j
      };
      scores.push(
        <div key={j} {...props}>{j}</div>
      )
    }
  });

  // const m = Math.min(value, 9);
  //
  // for (let i = 0; i <= m; i++) {
  //   const props = {
  //     role: 'box',
  //     'data-type': 'score',
  //     'data-value': i
  //   };
  //   scores.push(
  //     <div key={i} {...props}>{i}</div>
  //   )
  // }
  //
  // if(value>10) {
  //   const s = Math.ceil(value / 10);
  //   if (s) {
  //     for (let i = 1; i <= s; i++) {
  //       const k = i * 10;
  //       const props = {
  //         role: 'box',
  //         'data-type': 'score',
  //         'data-value': i * 10
  //       };
  //       scores.push(
  //         <div key={k} {...props}>{k}</div>
  //       )
  //     }
  //   }
  // }

  const props = {
    className: styles['score'],
    role: 'box',
    'data-type': 'score-list'
  };
  return (
    <div {...props}>{scores}</div>
  )
}
