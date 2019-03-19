import React, {Fragment} from 'react';
import {connect} from 'dva';
import {Button, Form, Input} from 'antd';
import styles from './answer.less';
import AttributePanel from "./AttributePanel";
import {AnswerEditor as namespace} from "../../utils/namespace";

function EditorRightPanel(props){
  const {file, ...attributeProps} = props;
  const {activeElementKey, activeColumnKey, dispatch} = attributeProps;
  return (
    <Fragment>
      {
        file ?
          <section className={styles['editor-right-panel']}>
            {
              activeElementKey ?
                <AttributePanel score={file.score} {...attributeProps} />
                :
                null
            }
            {
              activeColumnKey ?
                <div className="tac">
                  <hr />
                  <Button type="danger" onClick={() => {
                    dispatch({
                      type: namespace + '/removeActiveColumn',
                      payload: {
                        key: activeColumnKey
                      }
                    })
                  }}>删除列</Button>
                </div>
                :
                null
            }
            {
              file.score ?
                <Form>
                  <hr/>
                  <Form.Item label="卷面总分" labelCol={{span: 8}} wrapperCol={{span: 14}}>
                    <Input readOnly value={file.score}/>
                  </Form.Item>
                </Form>
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
  activeColumnKey: state[namespace].activeColumnKey,
  attributePanelConfig: state[namespace].attributePanelConfig || {}
}))(EditorRightPanel);

