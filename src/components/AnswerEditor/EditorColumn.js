import React from 'react';
import classNames from 'classnames';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import EditorElement from './EditorElement';

export default function EditorColumn({column, ...elementProps}) {
  const {dispatch, activeColumnKey} = elementProps;
  const props = {
    id: column.key,
    className: classNames(styles['editor-column'], {
      [styles['active']]: activeColumnKey === column.key
    }),
    style: {width: column.width, marginLeft: column.path[1] !== 0 ? column.colSpan : 0},
    onClick: () => {
      dispatch({
        type: namespace + '/set',
        payload: {
          activeColumnKey: column.key
        }
      });
    }
  };
  return (
    <div key={column.key} {...props}>
      {
        column.elements && column.elements.length ?
          column.elements.map(element =>
            <EditorElement key={element.key} element={element} {...elementProps} />
          )
          :
          null
      }
    </div>
  )
}
