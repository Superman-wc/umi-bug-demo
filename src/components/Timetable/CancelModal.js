import React, {Component} from 'react';
import {Modal, Form, Input} from 'antd';

class CancelModal extends Component {

  render() {
    const {
      visible, onOk, onCancel,
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      title: '取消课程',
      visible,
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            onOk && onOk(payload);
          }
        })
      }
    };
    return (
      <Modal {...modalProps}>
        <Form layout="vertical">
          <Form.Item label="取消原因：" required>
            {
              getFieldDecorator('memo', {
                rules: [{required: true, message: '请设置取消原因'}]
              })(
                <Input.TextArea autosize={{minRows: 3, maxRows: 10}}/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(CancelModal);
