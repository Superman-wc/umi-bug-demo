import React, {Fragment} from 'react';
import {connect} from 'dva';
import styles from './answer.less';
import AttributePanel from "./AttributePanel";
import {AnswerEditor as namespace} from "../../utils/namespace";

function EditorRightPanel(props){
  const {file, activeElementKey, attributePanelConfig={}} = props;
  return (
    <Fragment>
      {
        file ?
          <section className={styles['editor-right-panel']}>
            {
              activeElementKey ?
                <AttributePanel config={attributePanelConfig || {}} onDelete={() => {
                  this.handleDeleteElement();
                }}/>
                :
                null
            }
          </section>
          :
          null
      }
    </Fragment>
  )
}

export default connect(state=>({
  file: state[namespace].file,
  activeElementKey: state[namespace].activeElementKey,
  attributePanelConfig: state[namespace].attributePanelConfig || {}
}))(EditorRightPanel);

