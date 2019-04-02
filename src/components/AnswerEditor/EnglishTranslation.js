import React, {Component, Fragment} from 'react';

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
  };

  render(){

    return (
      <div>英语翻译题</div>
    )
  }

}
