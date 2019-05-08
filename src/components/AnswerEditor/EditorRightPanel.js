import React, {Fragment, Component} from 'react';
import {connect} from 'dva';
import {Button, Form, Input, Popconfirm, Tabs} from 'antd';
import styles from './answer.less';
import AttributePanel from "./AttributePanel";
import {AnswerEditor as namespace} from "../../utils/namespace";
import {PrintFields} from './CreateFilePanel';

// const PrintFormFields = Form.create()(PrintFields);

class EditorRightPanel extends Component {
  render() {
    const {query, file, form, ...attributeProps} = this.props;
    const {activeElementKey, activeColumnKey, dispatch} = attributeProps;
    return (
      <Fragment>
        {
          file ?
            query.readOnly ?
              <section className={styles['editor-right-panel']}>
                <Tabs>
                  <Tabs.TabPane key="打印要求" tab="打印要求">
                    <div style={{padding: '100px 50px 20px 50px'}}>
                      <h3 className="tac">请按如下要求设置打印机</h3>
                      <h4>
                        <label>尺寸：</label>
                        <span style={{color: '#f00'}}>{file.print.type}</span>
                      </h4>
                      <h4>
                        <label>布局：</label>
                        <span style={{color: '#f00'}}>{file.print.direction}</span>
                      </h4>
                      <h4>
                        <label>边距：</label>
                        <span style={{color: '#f00'}}>无</span>
                      </h4>
                      <h4>
                        <label>背景图形：</label>
                        <span style={{color: '#f00'}}>需要</span>
                      </h4>
                    </div>
                    <div className="tac">
                      <Button type="primary" onClick={() => {
                        dispatch({
                          type: namespace + '/print',
                        })
                      }}>打印</Button>
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </section>
              :
              <section className={styles['editor-right-panel']}>
                {
                  activeElementKey ?
                    <Tabs>
                      <Tabs.TabPane key="元素" tab="元素">
                        <AttributePanel score={file.score} {...attributeProps} />
                      </Tabs.TabPane>
                    </Tabs>
                    :
                    null
                }
                {
                  activeColumnKey ?
                    <Tabs>
                      <Tabs.TabPane key="列" tab="列">
                        <div className="tac">
                          <Button.Group>
                            <Button>添加列</Button>
                            <Popconfirm
                              placement="rightBottom"
                              title="删除列将会删除列内的所有内容，确定要删除列吗？"
                              okText="删除"
                              cancelText="取消"
                              onConfirm={() => {
                                dispatch({
                                  type: namespace + '/removeActiveColumn',
                                  payload: {
                                    key: activeColumnKey
                                  }
                                })
                              }}>
                              <Button type="danger">删除列</Button>
                            </Popconfirm>
                          </Button.Group>
                        </div>
                      </Tabs.TabPane>
                    </Tabs>
                    :
                    null
                }
                {
                  file.score ?
                    <Tabs>
                      <Tabs.TabPane key="卷面" tab="卷面">
                        <Form>
                          <Form.Item label="卷面总分" labelCol={{span: 8}} wrapperCol={{span: 14}}>
                            <Input readOnly value={file.score}/>
                          </Form.Item>

                        </Form>
                      </Tabs.TabPane>
                    </Tabs>
                    :
                    null
                }
                <Tabs>
                  <Tabs.TabPane key="页面" tab="页面">
                    <Form>
                      <PrintFields form={form} showHelp={false} onChange={(payload) => {
                        console.log(payload);
                        dispatch({
                          type: namespace + '/setOptions',
                          payload,
                        })
                      }}/>
                    </Form>
                  </Tabs.TabPane>
                </Tabs>
              </section>
            :
            null
        }
      </Fragment>
    )
  }
}


export default connect(state => ({
  file: state[namespace].file,
  activeElementKey: state[namespace].activeElementKey,
  activeColumnKey: state[namespace].activeColumnKey,
  attributePanelConfig: state[namespace].attributePanelConfig || {}
}))(Form.create()(EditorRightPanel));

