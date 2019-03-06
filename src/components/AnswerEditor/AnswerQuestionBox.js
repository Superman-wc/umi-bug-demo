import React from 'react';
import styles from './answer.less';
import Element from "./Element";
import SubjectiveQuestionsBox from "./SubjectiveQuestionsBox";
import ContentEditableArea from "./ContentEditableArea";
import Uploader from './Uploader';
import {buildQiniuConfig} from "../../services";
import {AnswerEditor as namespace} from "../../utils/namespace";

/**
 * 解答题
 * @returns {*}
 * @constructor
 */
export default function AnswerQuestionBox({value = {}, ...props}) {
  const {number = 1, score = 1} = value || {};

  const {profile, dispatch} = props;

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
        <div className={styles['question-toolbar']}>
          <label className={styles['question-number']}>
            {number}.
            {score ? `（${score}分）` : null}
          </label>
          <Uploader qiNiuYunConfig={buildQiniuConfig(profile && profile.token)}
                    success={({url}) => {
                      dispatch({
                        type: namespace + '/setElementAttribute',
                        payload: {
                          key: 'img',
                          value: url
                        }
                      })
                    }}>
            <a>上传图片</a>
          </Uploader>
        </div>
        {
          value.img ?
            <img src={value.img} style={{maxWidth: '100%', maxHeight: '100%', position:'absolute', zIndex:10}}/>
            :
            null
        }
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
