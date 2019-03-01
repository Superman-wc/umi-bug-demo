import React, {Component, createRef} from 'react';
import styles from './answer.less';
import Element from "./Element";
import ContentEditableArea from "./ContentEditableArea";
import SubjectiveQuestionsBox from "./SubjectiveQuestionsBox";

const line = '<u>　　　　　　　　　　　　</u>';

class CompletionQuestion extends Component {

  ref = createRef();

  render() {
    const {number, defaultValue} = this.props;
    return (
      <div className={styles['completion-question']}>
        {
          number ?
            <label>({number})</label>
            :
            null
        }
        <ContentEditableArea ref={this.ref} defaultValue={defaultValue || line}/>
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

  ref = createRef();

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (
      nextProps.value && this._render_content_args !== JSON.stringify(nextProps.value)
    ) {
      // console.log('render content', JSON.stringify(nextProps.value), this._render_content_args);
      // this.ref.current.value = this.renderContent(nextProps.value);
    }
  }

  renderContent = (value = {}) => {
    const {number = 1, score = 1, count = 3} = value || {};
    this._render_content_args = JSON.stringify(value || {});
    const ret = [];
    const line = '<u>　　　　　　　　　　　　</u>';
    if (score) {

      let str = `<div>${number}.`;
      if (count < 2) {
        str += `（${score}分）${line}`;
      } else {
        const s = [];
        for (let j = 1; j <= count; j++) {
          s.push(`（${j}）${line}`);
        }
        str += `（${score}分）${s.join('　　')}`;
      }
      str += '</div>';
      ret.push(str);

    } else {

      let str = `<div>${number}.`;
      if (count < 2) {
        str += `${line}`;
      } else {
        const s = [];
        for (let j = 1; j <= count; j++) {
          s.push(`（${j}）${line}`);
        }
        str += `${s.join('　　')}`;
      }
      str += '</div>';
      ret.push(str);

    }

    return ret.join('<br/>');
  };

  render() {
    const {value = {}, ...props} = this.props;
    const {score = 1, number = 1, count = 3} = value || {};
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(
        <CompletionQuestion key={i} number={count > 1 ? i + 1 : 0}/>
      )
    }
    return (
      <Element className={styles['completion-question-box']} {...props} element={value} border ableMove="y">
        <SubjectiveQuestionsBox score={score}>
          <label>
            {number}.（{score}分）
          </label>
          {
            list
          }
          {/*<ContentEditableArea ref={this.ref} defaultValue={this.renderContent(this.props.value || {})}/>*/}
        </SubjectiveQuestionsBox>
      </Element>
    )
  }
}


