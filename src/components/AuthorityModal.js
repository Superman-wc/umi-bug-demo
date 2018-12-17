import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import PropTypes from 'prop-types';
import {Modal, Form, Input, Select} from 'antd';
import {Enums, EnableStatusEnum} from '../utils/Enum';


@Form.create({
  mapPropsToFields: props => {
    return {
      name: Form.createFormField({value: props.item && props.item.name || undefined}),
      status: Form.createFormField({value: props.item && props.item.status && props.item.status.toString() || undefined}),
      description: Form.createFormField({value: props.item && props.item.description || undefined}),
    }
  }
})
export default class AuthorityModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
    item: PropTypes.object,
    onCancel: PropTypes.func,
    visible: PropTypes.bool,
    loading: PropTypes.bool,
  };

  state = {};

  render() {

    const {
      onOk, onCancel, item = {}, visible, loading, appId,
      form: {getFieldDecorator, validateFieldsAndScroll},
    } = this.props;

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };

    return (
      <Modal title={item && item.id ? '修改角色' : '创建角色'} visible={visible} confirmLoading={!!loading}
             onCancel={onCancel}
             onOk={() => {
               validateFieldsAndScroll((errors, payload) => {
                 if (errors) {
                   console.log(errors)
                 } else {
                   if (item.id) {
                     payload.id = item.id;
                     payload.name = item.name;
                     payload.appId = item.appId;
                   }else{
                     payload.name = 'ROLE_' + appId.toUpperCase() + '_' + payload.name.toUpperCase();
                     payload.appId = appId;
                   }
                   onOk(payload);
                 }
               });
             }}
      >
        <Form layout="horizontal">
          <Form.Item label="角色ID" {...formItemLayout} hasFeedback>
            {
              getFieldDecorator('name', {
                initialValue: item ? item.name : undefined,
                rules: [{
                  required: true,
                  message: '请输入角色ID'
                }, (rules, value, cb) => {
                  if (/^[a-zA-Z_][a-zA-Z\d_]*$/g.test(value)) {
                    cb();
                  } else {
                    cb('只允许输入字母数字下划线，且必须是字母开头，小写将自动转为大写');
                  }
                }]
              })(
                <Input disabled={item && !!item.id} addonBefore={item && item.id ? null : `ROLE_${appId.toUpperCase()}_`}
                       placeholder="请输入角色ID"/>
              )
            }
          </Form.Item>
          <Form.Item label="角色描述" {...formItemLayout} hasFeedback>
            {
              getFieldDecorator('description', {
                initialValue: item ? item.description : undefined,
                rules: [{
                  required: true,
                  message: '请输入角色描述'
                }]
              })(
                <Input placeholder="请输入角色描述"/>
              )
            }
          </Form.Item>
          <Form.Item label="状态" {...formItemLayout} hasFeedback>
            {
              getFieldDecorator('status', {
                initialValue: item ? item.status + '' : undefined,
                rules: [{required: true, message: '请选择状态'}]
              })(
                <Select placeholder="请选择状态">
                  {
                    Enums(EnableStatusEnum).filter(it => it.value * 1 !== 1).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
