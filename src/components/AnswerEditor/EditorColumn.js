import React, {Component} from 'react';
import classNames from 'classnames';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import EditorElement from './EditorElement';

export default class EditorColumn extends Component{
  render() {
    const {style, column, ...elementProps} = this.props;
    const {dispatch, activeColumnKey} = elementProps;
    const props = {
      id: column.key,
      className: classNames(styles['editor-column'], {
        [styles['active']]: activeColumnKey === column.key
      }),
      style: {
        ...style,
        width: column.width,
      },
      onClick: () => {
        dispatch({
          type: namespace + '/set',
          payload: {
            activeColumnKey: column.key
          }
        });
      },
      role: 'column'
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
}


