import React from 'react';
import styles from './answer.less';
import Element from "./Element";
import {LetterArea} from "./DaubRectangleBox";

export function OptionArea({number = 1, count = 4, value=''}) {
  return (
    <div className={styles['options-area']}>
      <label>{number}</label>
      <LetterArea count={count} value={value}/>
    </div>
  )
}

export default function ChoiceQuestionBox({value = {}, ...props}) {
  const {startNumber = 1, count = 10, optionCount = 4} = value || {};
  const ret = [];
  for (let i = startNumber; i < startNumber + count; i++) {
    ret.push(
      <OptionArea key={i} number={i} count={optionCount}/>
    )
  }
  return (
    <Element className={styles['choice-question-box']} {...props} element={value} ableMove>
      {ret}
    </Element>
  )
}

ChoiceQuestionBox.attributes = {
  startNumber: {
    type: 'number', label: '起始题号',
    fieldOptions: {
      initialValue: 1,
    }
  },
  count: {
    type: 'number', label: '数量',
    fieldOptions: {
      initialValue: 10,
    }
  },
  optionCount: {
    type: 'number', label: '选项数量',
    fieldOptions: {
      initialValue: 4,
    }
  }
};
