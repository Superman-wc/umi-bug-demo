import React, {Fragment} from 'react';
import {AnswerEditor as namespace} from "../../utils/namespace";
import TitleBox from "./TitleBox";
import StudentInfoBox from "./StudentInfoBox";
import ChoiceQuestionBox from "./ChoiceQuestionBox";
import CompletionQuestionBox from "./CompletionQuestionBox";
import AnswerQuestionBox from "./AnswerQuestionBox";
import EnglishTranslationQuestionBox from './EnglishTranslationQuestionBox';
import EnglishCompositionQuestionBox from './EnglishCompositionQuestionBox';

const ElementTypes = {
  'student-info': StudentInfoBox,
  'choice-question': ChoiceQuestionBox,
  'answer-question': AnswerQuestionBox,
  'completion-question': CompletionQuestionBox,
  'english-translation-question': EnglishTranslationQuestionBox,
  'english-composition-question': EnglishCompositionQuestionBox,
};

export default function EditorElement({element, ...restProps}) {

  const {activeElementKey, focusElementKey, dispatch} = restProps;

  const props = {
    ...restProps,
    value: element,
    onChange: () => {
    },
    onActive: () => {
      console.log('激活组件', element.key);
      const payload = {activeElementKey: element.key};
      const eleClass = ElementTypes[element.type];
      if (eleClass && eleClass.attributes) {
        payload.attributePanelConfig = Object.entries(eleClass.attributes).reduce((map, [key, obj]) => {
          map[key] = {
            ...obj,
            value: element[key],
            onChange: (value) => {
              dispatch({
                type: namespace + '/setElementAttribute',
                payload: {
                  key, value
                }
              });

              obj.onChange && obj.onChange({self: obj, key, value, dispatch, element});
              console.log(element, key, value);
            }
          };
          return map;
        }, {});
        payload.showAttributePanel = true;
      } else {
        payload.attributePanelConfig = {};
        payload.showAttributePanel = false;
      }
      dispatch({
        type: namespace + '/set',
        payload
      });
    },
    active: element.key === activeElementKey,
    focus: element.key === focusElementKey,
  };
  return (

    <Fragment key={element.key}>
      {
        element.type === 'page-title' ?
          <TitleBox {...props}/>
          :
          element.type === 'student-info' ?
            <StudentInfoBox {...props}/>
            :
            element.type === 'choice-question' ?
              <ChoiceQuestionBox {...props}/>
              :
              element.type === 'completion-question' ?
                <CompletionQuestionBox {...props}/>
                :
                element.type === 'answer-question' ?
                  <AnswerQuestionBox {...props}/>
                  :
                  element.type === 'english-translation-question' ?
                    <EnglishTranslationQuestionBox {...props} />
                    :
                    element.type === 'english-composition-question' ?
                      <EnglishCompositionQuestionBox {...props} />
                      :
                      null
      }
    </Fragment>
  )
}
