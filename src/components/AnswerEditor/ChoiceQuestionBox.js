import React, {Component} from 'react';
import styles from './answer.less';
import Element from "./Element";
import {LetterArea, JudgeArea} from "./DaubRectangleBox";
import {QuestionTypeEnum} from '../../utils/Enum';
import {AnswerEditor as namespace} from "../../utils/namespace";


export function OptionArea ({number = 1, count = 4, value, type = QuestionTypeEnum.单选题, onChange}) {
  const props = {
    className: styles['options-area'],
    role: 'box',
    'data-type': 'choice-question',
    'data-number': number,
    'data-sub-type': type,
    'data-value': value,
  };

  return (
    <div {...props}>
      <label>{number}</label>
      {
        type * 1 === QuestionTypeEnum.判断题 ?
          <JudgeArea value={value} onChange={onChange}/>
          :
          <LetterArea count={count} value={value || ''} onChange={onChange}/>
      }
    </div>
  )

}


export default class ChoiceQuestionBox extends Component {

  static attributes = {
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
      },
      onChange({dispatch}) {
        dispatch({
          type: namespace + '/autoQuestionNumber',
        });
      }
    },
    questionType: {
      type: 'enum',
      label: '题型',
      enumClass: QuestionTypeEnum,
      fieldOptions: {
        initialValue: QuestionTypeEnum.单选题,
      },
      onChange({value, dispatch}) {
        dispatch({
          type: namespace + '/setElementAttribute',
          payload: {
            key: 'optionCount',
            value: value === QuestionTypeEnum.判断题 ? 2 : 4
          }
        })
      }
    },
    optionCount: {
      type: 'number',
      label: '选项数量',
      fieldOptions: {
        initialValue: 4,
      }
    },
    answer: {
      type: 'string', label: '答案',
      fieldOptions: {
        initialValue: '',
      }
    }
  };

  shouldComponentUpdate(nextProps, nextState, nextContent) {
    const {value} = nextProps;
    const oldValue = this.props.value || {};
    return value && (
      value.startNumber !== oldValue.startNumber ||
      value.count !== oldValue.count ||
      value.optionCount !== oldValue.optionCount ||
      value.questionType !== oldValue.questionType ||
      value.answer !== oldValue.answer ||
      nextProps.activeElementKey !== this.props.activeElementKey
    );
  }


  render() {
    console.log('render ChoiceQuestionBox');
    const {value = {}, ...props} = this.props;
    let {
      startNumber = 1,
      count = 10,
      optionCount = 4,
      questionType = QuestionTypeEnum.单选题,
      answer = [],
      key,
    } = value || {};
    const {dispatch, activeElementKey} = props;
    const ret = [];

    answer = typeof answer === 'string' ?
      (
        questionType === QuestionTypeEnum.多选题 ?
          answer.toUpperCase().split(',')
          :
          answer.toUpperCase().replace(/,/g, '').split('')
      )
      :
      Array.isArray(answer) ?
        answer
        :
        [];

    for (let i = 0; i < count; i++) {
      const _props = {
        number: i + startNumber,
        count: optionCount,
        type: questionType,
        value: answer[i],
        onChange: (v) => {
          if (key === activeElementKey) {
            if (questionType * 1 === QuestionTypeEnum.多选题) {
              if ((answer[i] || '').indexOf(v) >= 0) {
                answer[i] = (answer[i] || '').replace(v, '');
              } else {
                answer[i] = (answer[i] || '') + v;
              }
            } else {
              answer[i] = v;
            }
            dispatch({
              type: namespace + '/setElementAttribute',
              payload: {
                key: 'answer',
                value: [...answer]
              }
            });
          }
        }
      };
      ret.push(
        <OptionArea key={i} {..._props}/>
      )
    }

    const eleProps = {
      ...props,
      className: styles['choice-question-box'],
      element: value,
      ableMove: true,
      role: {
        role: 'box',
        'data-type': value.type,
      },
    };

    return (
      <Element {...eleProps}>
        {ret}
      </Element>
    )
  }
}


