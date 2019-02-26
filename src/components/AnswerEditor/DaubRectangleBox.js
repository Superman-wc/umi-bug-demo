import React from 'react';
import styles from './answer.less';

/**
 * 涂抹矩形框
 * @param checked
 * @param text
 * @param onClick
 * @returns {*}
 * @constructor
 */
export default function DaubRectangleBox({checked, text, onClick}) {
  return (
    <div data-checked={checked} className={styles['daub-rectangle-box']} onClick={onClick}>
      <div>{text}</div>
    </div>
  )
}

/**
 * 数字号码区
 * @param value
 * @returns {Array}
 * @constructor
 */
export function NumberArea({value}) {
  const ret = [];
  for (let i = 0; i < 10; i++) {
    ret.push(
      <DaubRectangleBox key={i} checked={i + '' === value} text={i}/>
    )
  }
  return ret;
}

/**
 * 字母区
 * @param count
 * @param value
 * @param onClick
 * @returns {Array}
 * @constructor
 */
export function LetterArea({count = 4, value = '', onClick}) {
  const ret = [];
  const len = 65 + Math.min(count, 26);
  for (let i = 65; i < len; i++) {
    const char = String.fromCharCode(i);
    const checked = value.indexOf(char) >= 0;
    ret.push(
      <DaubRectangleBox key={i} checked={checked} text={char} onClick={() => {
        onClick(char);
      }}/>
    )
  }
  return ret;
}
