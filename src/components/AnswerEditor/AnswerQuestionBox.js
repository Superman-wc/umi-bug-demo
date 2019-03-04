import React from 'react';
import styles from './answer.less';
import Element from "./Element";
import SubjectiveQuestionsBox from "./SubjectiveQuestionsBox";
import ContentEditableArea from "./ContentEditableArea";


/**
 * 解答题
 * @returns {*}
 * @constructor
 */
export default function AnswerQuestionBox({value = {}, ...props}) {
  const {number = 1, score = 1} = value || {};

  const eleProps = {
      ...props,
      className: styles['answer-question-box'],
      element: value,
      border: true,
      ableMove: 'y',
      role: {
        role: 'box',
        'data-type': value.type,
        'data-number': number,
      },
    };

  return (
    <Element {...eleProps}>
      <SubjectiveQuestionsBox score={score}>
        <div className={styles['question-number']}>
          {number}.
          {score ? `（${score}分）` : null}
        </div>
        <ContentEditableArea defaultValue={'<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>'}/>
      </SubjectiveQuestionsBox>
    </Element>
  )
}

AnswerQuestionBox.attributes = {
  number: {
    type: 'number', label: '题号',
    fieldOptions: {
      initialValue: 1,
    }
  },
  score: {
    type: 'number', label: '分值',
    fieldOptions: {
      initialValue: 10,
    }
  },
};
