import React, {Component, Fragment} from 'react';
import Element from "./Element";
import styles from "./answer.less";

/**
 * 英语翻译题目
 */
export default class EnglishTranslationQuestionBox extends Component {

  static attributes = {
    number: {
      type: 'number', label: '题号',
      fieldOptions: {
        initialValue: 1,
      }
    },
    stem: {
      type: 'string', label: '题干',
      fieldOptions: {
        initialValue: '',
      }
    },
    score: {
      type: 'number', label: '分值',
      fieldOptions: {
        initialValue: 10,
      },
      props: {
        min: 1,
        max: 100
      }
    },
    answer: {
      type: 'string', label: '答案',
      fieldOptions: {
        initialValue: '',
      }
    },
  };

  render() {
    const {value = {}, onChange, ...props} = this.props;
    const {number = 1, score = 1, content = '', stem = '', answer = ''} = value || {};

    const eleProps = {
      ...props,
      className: styles['english-translation-question-box'],
      element: value,
      role: {
        role: 'box',
        'data-type': value.type,
        'data-number': number,
        'data-score': score,
        'data-value': answer
      },
    };

    return (
      <Element {...eleProps}>
        <div className={styles['stem-box']}>
          {
            number ?
              <label>{number}.</label>
              :
              null
          }
          <span>{stem}</span>
        </div>
        <div className={styles['answer-box']} role="box" data-type="english-translation-question-answer-box">
          <span>{answer}</span>
        </div>
      </Element>
    )
  }

}
