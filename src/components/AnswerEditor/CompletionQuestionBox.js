import React, {Component, createRef} from 'react';
import styles from './answer.less';
import Element from "./Element";
import ContentEditableArea from "./ContentEditableArea";
import SubjectiveQuestionsBox from "./SubjectiveQuestionsBox";

export default class CompletionBox extends Component {

  static attributes = {
    startNumber: {
      type: 'number', label: '起始题号',
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
    rowCount: {
      type: 'number', label: '大题数量',
      fieldOptions: {
        initialValue: 5,
      }
    },
    colCount: {
      type: 'number', label: '小题数量',
      fieldOptions: {
        initialValue: 3,
      }
    }
  };

  ref = createRef();

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (
      nextProps.value && this._render_content_args !== JSON.stringify(nextProps.value)
    ) {
      console.log('render content', JSON.stringify(nextProps.value), this._render_content_args);
      this.ref.current.value = this.renderContent(nextProps.value);
    }
  }

  renderContent = (value = {}) => {
    const {startNumber = 1, score = 15, rowCount = 5, colCount = 3, statisticsScore = false} = value || {};
    this._render_content_args = JSON.stringify(value || {});
    const ret = [];
    const aveScore = Math.ceil(score / (rowCount));
    const line = '<u>　　　　　　　　　　　　</u>';
    if (score && statisticsScore) {
      for (let i = 0; i < rowCount; i++) {
        let str = `<div>${startNumber + i}.`;
        if (colCount < 2) {
          str += `（${aveScore}分）${line}`;
        } else {
          const s = [];
          for (let j = 1; j <= colCount; j++) {
            s.push(`（${j}）${line}`);
          }
          str += `（${aveScore}分）${s.join('　　')}`;
        }
        str += '</div>';
        ret.push(str);
      }
    } else {
      for (let i = 0; i < rowCount; i++) {
        let str = `<div>${startNumber + i}.`;
        if (colCount < 2) {
          str += `${line}`;
        } else {
          const s = [];
          for (let j = 1; j <= colCount; j++) {
            s.push(`（${j}）${line}`);
          }
          str += `${s.join('　　')}`;
        }
        str += '</div>';
        ret.push(str);
      }
    }

    return ret.join('<br/>');
  };

  render() {
    const {value = {}, ...props} = this.props;
    const {score = 15, statisticsScore = false} = value || {};
    return (
      <Element className={styles['completion-box']} {...props} element={value} border ableMove="y">
        <SubjectiveQuestionsBox score={score} statisticsScore={statisticsScore}>
          <ContentEditableArea ref={this.ref} defaultContent={this.renderContent(this.props.value || {})}/>
        </SubjectiveQuestionsBox>
      </Element>
    )
  }
}
