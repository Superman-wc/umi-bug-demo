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
 * 解答题
 * @returns {*}
 * @constructor
 */
export default class AnswerQuestionBox extends Component {

  static attributes = {
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
      },
      props: {
        min: 1,
        max: 100
      }
    },
  };


  shouldComponentUpdate(nextProps, nextState, nextContent) {
    const {value} = nextProps;
    const oldValue = this.props.value || {};
    return value && (
      value.number !== oldValue.number ||
      value.score !== oldValue.score ||
      value.content !== oldValue.content
    )
  }


  render() {
    const {value = {}, ...props} = this.props;
    const {number = 1, score = 1, content = ''} = value || {};

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
        'data-score': score,
      },
    };

    console.log('render AnswerQuestionBox');

    const uploadProps = {
      qiNiuYunConfig: buildQiniuConfig(profile && profile.token),
      success: ({url}) => {
        message.success('上传图片成功');
        console.log(url);
        document.execCommand('insertImage', false, url);
      }
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
      allowDragUpload: true,
      uploadConfig: uploadProps,
    };


    return (
      <Element {...eleProps}>
        <SubjectiveQuestionsBox score={score}>
          <div className={styles['question-toolbar']}>
            <label className={styles['question-number']}>
              {number}.
              {score ? `（${score}分）` : null}
            </label>
            <Uploader {...uploadProps}><a>上传图片</a></Uploader>
          </div>
          <ContentEditableArea {...contentEditorProps}/>
        </SubjectiveQuestionsBox>
      </Element>
    )
  }

}