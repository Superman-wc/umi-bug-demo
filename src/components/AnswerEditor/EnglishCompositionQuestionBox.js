import React, {Component} from 'react';
import {message} from 'antd';
import Element from "./Element";
import SubjectiveQuestionsBox from "./SubjectiveQuestionsBox";
import ContentEditableArea from "./ContentEditableArea";
import Uploader from './Uploader';
import {buildQiniuConfig} from "../../services";
import {AnswerEditor as namespace} from "../../utils/namespace";
import styles from './answer.less';

/**
 * 英语作文题
 * @returns {*}
 * @constructor
 */
export default class AnswerQuestionBox extends Component {

  static attributes = {
    number: {
      type: 'number',
      label: '题号',
      fieldOptions: {
        initialValue: 1,
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
    lineCount: {
      type: 'number', label: '行数',
      fieldOptions: {
        initialValue: 10,
      },
      props: {
        min: 5,
        max: 50
      }
    }
  };


  // shouldComponentUpdate(nextProps, nextState, nextContent) {
  //   const {value} = nextProps;
  //   const oldValue = this.props.value || {};
  //   return value && (
  //     value.number !== oldValue.number ||
  //     value.score !== oldValue.score ||
  //     value.content !== oldValue.content ||
  //     value.lineCount !== oldValue.lineCount
  //   )
  // }


  render() {
    const {value = {}, ...props} = this.props;
    const {number = 1, score = 1, content = '', lineCount} = value || {};

    const eleProps = {
      ...props,
      className: styles['english-composition-question-box'],
      element: value,
      border: true,
      role: {
        role: 'box',
        'data-type': value.type,
        'data-number': number,
        'data-score': score,
      },
    };


    const contentEditorProps = {
      value: content || '<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>',
      onChange: e => props.dispatch({
        type: namespace + '/setElementAttribute',
        payload: {
          key: 'content',
          value: e.value
        }
      }),
    };


    return (
      <Element {...eleProps}>
        <SubjectiveQuestionsBox score={score}>
          <div className={styles['question-toolbar']}>
            <label className={styles['question-number']}>
              {number}.
              {score ? `（${score}分）` : null}
            </label>
          </div>
          <ul>
          {
            new Array(lineCount || 1).fill('').map((it, index)=>
              <li key={index} >{index}</li>
            )
          }
          </ul>
          <ContentEditableArea {...contentEditorProps}/>
        </SubjectiveQuestionsBox>
      </Element>
    )
  }

}
