import React from 'react';
import {connect} from 'dva';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import EditorPage from './EditorPage';


function EditorFile(props) {
  const {file, ...pageProps} = props;
  return (
    <div className={styles['editor-file']}>
      {
        file.pages && file.pages.length ?
          file.pages.map(page =>
            <EditorPage key={page.key} page={page} {...pageProps}/>
          )
          :
          null
      }
    </div>
  )
}

export default connect(state => ({
  file: state[namespace].file,
  activePageKey: state[namespace].activePageKey,
  activeColumnKey: state[namespace].activeColumnKey,
  activeElementKey: state[namespace].activeElementKey,
}))(EditorFile);
