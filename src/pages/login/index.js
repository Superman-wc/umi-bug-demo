import React, {Component} from 'react';
import {connect} from 'dva';
import {Form, Input, Spin, Button,} from 'antd';
import Particles from '../../components/Particles';
import {Authenticate} from "../../utils/namespace";
import styles from './index.less';


@Form.create()
@connect(state=>({
  loading: state.loading.models[Authenticate]
}))
export default class LoginPage extends Component {
  render() {
    const {form: {getFieldDecorator, validateFieldsAndScroll}, loading, dispatch} = this.props;

    return (
      <div className={styles['login-page']}>
        <Particles/>
        <Spin spinning={!!loading} size="large" tip="正在登录...">
          <div className={styles['login-box']}>
            <div className={styles['login-box-left']}>
              <img src="https://res.yunzhiyuan100.com/smart-campus/logo-blue.png" width={150}/>
              <h1>智慧校园</h1>
            </div>
            <div className={styles['line']}/>
            <Form layout="horizontal">
              <Form.Item label="用户名" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                {
                  getFieldDecorator('username', {
                    initialValue:'清明夏至',
                    rules: [{required: true, message: '请输入用户名'}],
                  })(
                    <Input placeholder="请输入用户名" />
                  )}
              </Form.Item>

              <Form.Item label="密码" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                {
                  getFieldDecorator('password', {
                    initialValue:'123456',
                    rules: [{required: true, message: '请输入密码'}],
                  })(
                    <Input type="password" placeholder="请输入密码" />
                  )}
              </Form.Item>

              <Form.Item wrapperCol={{span: 18, offset: 6}}>
                <Button type="primary" style={{display: 'block', width: '100%'}} onClick={() => {
                  validateFieldsAndScroll((errors, payload) => {
                    if (errors) {
                      console.error(errors);
                    } else {
                      dispatch({
                        type: Authenticate + '/login',
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
