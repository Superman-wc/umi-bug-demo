import React, {Component} from 'react';
import {connect} from 'dva';
import {Form, Input, Spin, Button,} from 'antd';
import {Authenticate as namespace} from '../../utils/namespace';
import Particles from '../../components/Particles';
import styles from './index.less';


@Form.create()
@connect(state => ({
  // loading: state[namespace].loading,
}))
export default class LoginPage extends Component {
  render() {
    const {form: {getFieldDecorator, validateFieldsAndScroll}, loading, dispatch} = this.props;

    return (
      <div className={styles['login-page']}>
        <Particles />
        <Spin spinning={!!loading} size="large" tip="正在登录...">
          <div className={styles['login-box']}>
            <div className={styles['login-box-left']}>
              <img src="https://res.yunzhiyuan100.com/smart-campus/logo-blue.png" width={150}/>
              <h1>智慧校园</h1>
            </div>
            <div className={styles['line']}/>
            <Form layout="horizontal">
              <Form.Item label="手机号" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                {
                  getFieldDecorator('username', {
                    rules: [{required: true, message: '请输入用户名'}],
                  })(
                    <Input
                      placeholder="请输入用户名"
                      onChange={() => {

                      }}
                    />
                  )}
              </Form.Item>

              <Form.Item label="密码" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                {
                  getFieldDecorator('password', {
                    rules: [{required: true, message: '请输入密码'}],
                  })(
                    <Input
                      type="password"
                      placeholder="请输入密码"
                      onChange={() => {

                      }}
                    />
                  )}
              </Form.Item>

              <Form.Item wrapperCol={{span: 18, offset: 6}}>
                <Button type="primary" style={{display: 'block', width: '100%'}} onClick={() => {
                  validateFieldsAndScroll((errors, payload) => {
                    console.log(errors, payload);
                    if (errors) {
                      console.error(errors);
                    } else {
                      dispatch({
                        type:  namespace+ '/login',
                        payload
                      });
                    }
                  })
                }}>登录</Button>
              </Form.Item>
            </Form>
          </div>
        </Spin>
      </div>
    );
  }
}
