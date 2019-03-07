import React, {Component, createRef} from 'react';
import styles from './answer.less';
import Element from "./Element";
import ContentEditableArea from "./ContentEditableArea";
import SubjectiveQuestionsBox from "./SubjectiveQuestionsBox";
import {AnswerEditor as namespace} from "../../utils/namespace";

const line = '<u>　　　　　　　　　　　　</u>';

class CompletionQuestion extends Component {



  render() {
    const {number, value, onChange} = this.props;

    const props = {
      className: styles['completion-question'],
      role:'box',
      'data-type': 'sub-completion-question',
      'data-sub-number': number,
    };

    return (
      <div {...props}>
        {
          number ?
            <label>({number})</label>
            :
            null
        }
        <ContentEditableArea value={value || line} onChange={onChange}/>
      </div>
    )
  }
}

export default class CompletionQuestionBox extends Component {

  static attributes = {
    number: {
      type: 'number', label: '题号',
      fieldOptions: {
        initialValue: 1,
      }
    },
    score: {
      type: 'number', label: '总分数',
      fieldOptions: {
        initialValue: 10,
      }
    },
    count: {
      type: 'number', label: '小题数量',
      fieldOptions: {
        initialValue: 5,
      }
    }
  };

  render() {
    const {value = {}, ...props} = this.props;
    const {score = 1, number = 1, count = 3, content=[]} = value || {};
    const list = [];
    for (let i = 0; i < count; i++) {
      const _props = {
        number:count > 1 ? i + 1 : 0,
        value: content[i],
        onChange:(e)=>{
          const v= [...content];
          v[i] = e.value;
          props.dispatch({
            type: namespace + '/setElementAttribute',
            payload: {
              key: 'content',
              value: v
            }
          })
        }
      };
      list.push(
        <CompletionQuestion key={i} {..._props}/>
      )
    }

    const eleProps = {
      ...props,
      className:styles['completion-question-box'],
      element:value,
      border: true,
      ableMove:'y',
      role: {
        role:'box',
        'data-type': value.type,
        'data-number':number,
      },
    };

    return (
      <Element {...eleProps}>
        <SubjectiveQuestionsBox score={score}>
          <label>
            {number}.（{score}分）
          </label>
          {list}
        </SubjectiveQuestionsBox>
      </Element>
    )
  }
}


