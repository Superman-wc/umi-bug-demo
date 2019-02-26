import React from 'react';
import classNames from 'classnames';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import EditorColumn from './EditorColumn';

export default function EditorPage(props) {
  const {page, ...columnProps} = props;
  const {dispatch, activePageKey} = columnProps;
  const style = {
    width: page.width,
    height: page.height,
    padding: page.padding.map(it => it + 'px').join(' '),
  };
  const className = classNames(styles['editor-page'], {
    [styles['active']]: activePageKey === page.key,
  });

  return (
    <div id={page.key} className={className} style={style} onClick={() => {
      dispatch({
        type: namespace + '/set',
        payload: {
          activePageKey: page.key,
        }
      });
    }}>
      {
        page.columns.map(column =>
          <EditorColumn key={column.key} column={column} {...columnProps} />
        )
      }
    </div>
  )
}

