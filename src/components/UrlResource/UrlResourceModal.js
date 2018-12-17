import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Modal, Form, Input, Select} from 'antd';
import {Enums, URLResourceCategoryEnum, EnableStatusEnum} from '../../utils/Enum';

@Form.create({
  mapPropsToFields: props => {
    return {
      category: Form.createFormField({value: props.item && props.item.category || undefined}),
      status: Form.createFormField({value: props.item && props.item.status && props.item.status.toString() || undefined}),
      description: Form.createFormField({value: props.item && props.item.description || undefined}),
    }
  }
})
export default class UrlResourceModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
    item: PropTypes.object,
    onCancel: PropTypes.func,
    visible: PropTypes.bool,
  };

  render() {

    const {
      onOk, onCancel, item = {}, visible,
      form: {getFieldDecorator, validateFieldsAndScroll, setFieldsValue},
    } = this.props;

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };

    return (
      <Modal title={"修改URL资源 - " + item.controllerName}
             visible={visible}
             onOk={() => {
               validateFieldsAndScroll((errors, payload) => {
                 if (errors) {
                   console.log(errors)
                 } else {
                   if (item.id) {
                     payload.id = item.id;
                   }
                   onOk(payload);
                 }
               });
             }}
             onCancel={onCancel}>
        <Form layout="horizontal">
          <Form.Item label="类别" {...formItemLayout} hasFeedback>
            {
              getFieldDecorator('category', {
                initialValue: item ? item.category : undefined,
                rules: [{required: true, message: '请选择类别'}]
              })(
                <Input readOnly />
              )
            }
            {/*<Select placeholder="请选择类别">*/}
            {/*{*/}
            {/*Enums(URLResourceCategoryEnum).map(it =>*/}
            {/*<Select.Option key={it.value} value={it.value + ''}>{it.name}</Select.Option>*/}
            {/*)*/}
            {/*}*/}
            {/*</Select>*/}
          </Form.Item>
          <Form.Item label="状态" {...formItemLayout} hasFeedback>
            {
              getFieldDecorator('status', {
                initialValue: item ? item.status + '' : undefined,
                rules: [{required: true, message: '请选择状态'}]
              })(
                <Select placeholder="请选择状态">
                  {
                    Enums(EnableStatusEnum).map(it =>
                      <Select.Option key={it.value} value={it.value + ''}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="描述" {...formItemLayout} hasFeedback>
            {
              getFieldDecorator('description', {
                initialValue: item ? item.description : undefined,
                rules: [{required: true, message: '请输入描述'}]
              })(
                <Input readOnly />
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
