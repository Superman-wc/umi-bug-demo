import React from 'react';
import styles from './answer.less';
import Element from "./Element";
import ContentEditableArea from "./ContentEditableArea";
import {QuestionTypeEnum} from "../../utils/Enum";
import {AnswerEditor as namespace} from "../../utils/namespace";
import ChoiceQuestionBox from "./ChoiceQuestionBox";

export default function TitleBox({value = {}, ...props}) {
  return (
    <Element  {...props} className={styles['title-box']} element={value}>
      <ContentEditableArea placeholder="请输入标题" value={value.title} onChange={(e)=>{
        console.log(e);
        props.dispatch({
          type: namespace + '/setElementAttribute',
          payload: {
            key: 'title',
            value: e.value
          }
        });
      }} />
    </Element>
  )
}



TitleBox.attributes = {

  title: {
    type: 'textarea', label: '标题',
    fieldOptions: {
      initialValue: '',
    },
  }
};
