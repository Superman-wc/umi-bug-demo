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
  return (
    <Element className={styles['answer-question-box']} {...props} element={value} border ableMove="y">
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
