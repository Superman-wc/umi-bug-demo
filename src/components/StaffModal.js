import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Modal, Form, Input} from 'antd';



@Form.create({
  mapPropsToFields: props => {
    return {
      appId:Form.createFormField({value: props.item && props.item.appId || undefined}),
      username: Form.createFormField({value: props.item && props.item.username || undefined}),
      mobile: Form.createFormField({value: props.item && props.item.mobile || undefined}),
      // password: Form.createFormField({value: props.item && props.item.password || undefined}),
      // confirmPassword: Form.createFormField({value: props.item && props.item.confirmPassword || undefined}),
      nick: Form.createFormField({value: props.item && props.item.nick || undefined}),
      email: Form.createFormField({value: props.item && props.item.email || undefined}),

    }
  }
})
export default class StaffModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
    item: PropTypes.object,
    onCancel: PropTypes.func,
    visible: PropTypes.bool,
  };

  state = {};

  render() {

    const {
      onOk, onCancel, item = {}, visible, appId,
      form: {getFieldDecorator, validateFieldsAndScroll},
    } = this.props;

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };

    return (
      <Modal title={item && item.id ? '修改操作员' : '创建操作员'}
             visible={visible}
             onOk={() => {
               validateFieldsAndScroll((errors, payload) => {
                 if (errors) {
                   console.log(errors)
                 } else {
                   if (!payload.username) {
                     payload.username = payload.mobile;
                   }
                   if (item && item.id) {
                     payload.id = item.id;
                   }
                   payload.appId = appId;
                   onOk(payload);
                 }
               });
             }}
             onCancel={onCancel}>
        <Form layout="horizontal">


          {
            !(item && item.id) ?
              <Fragment>
                <Form.Item label="手机号" {...formItemLayout}>
                  {
                    getFieldDecorator('mobile', {
                      rules: [{
                        required: true,
                        message: '请输入手机号'
                      }]
                    })(
                      <Input type="phone" placeholder="请输入手机号"/>
                    )
                  }
                </Form.Item>
                <Form.Item label="用户名" {...formItemLayout} hasFeedback>
                  {
                    getFieldDecorator('username', {})(
                      <Input placeholder="请输入账户名"/>
                    )
                  }
                </Form.Item>
                <Form.Item label="密码" {...formItemLayout} hasFeedback>
                  {
                    getFieldDecorator('password', {
                      rules: [{
                        required: true,
                        message: '请输入密码'
                      }]
                    })(
                      <Input type="password" placeholder="请输入密码"/>
                    )
                  }
                </Form.Item>
                <Form.Item label="重复密码" {...formItemLayout} hasFeedback>
                  {
                    getFieldDecorator('confirmPassword', {
                      rules: [{
                        required: true,
                        message: '请输入重复密码'
                      }]
                    })(
                      <Input type="password" placeholder="请再次输入密码"/>
                    )
                  }
                </Form.Item>
              </Fragment>
              :
              null
          }
          <Form.Item label="昵称" {...formItemLayout}>
            {
              getFieldDecorator('nick')(
                <Input placeholder="请输入昵称"/>
              )
            }
          </Form.Item>
          <Form.Item label="E-mail" {...formItemLayout}>
            {
              getFieldDecorator('email')(
                <Input type="email" placeholder="请输入E-Mail"/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
