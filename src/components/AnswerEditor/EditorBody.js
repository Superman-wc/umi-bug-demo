import React from 'react';
import {connect} from 'dva';
import styles from './answer.less';
import CreateFilePanel from "./CreateFilePanel";
import {AnswerEditor as namespace} from "../../utils/namespace";
import EditorFile from './EditorFile';


function EditorBody(props) {
  const {file, dispatch} = props;
  console.log(file);
  return (
    <main className={styles['editor-body']}>
      {
        file ?
          <EditorFile file={file}/>
          :
          <CreateFilePanel dispatch={dispatch}/>
      }
    </main>
  )
}

export default connect(state => ({
  file: state[namespace].file,
}))(EditorBody);
