import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, notification, Checkbox, Button} from 'antd';
import {ManagesSubject as namespace} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';


@connect(state => ({
  all: state[namespace].all || [],
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading
}))
@Form.create({
  mapPropsToFields(props) {
    const {list = []} = props;
    return {
      subjectIds: Form.createFormField({value: list && list.length ? list.map(it => it.id) : undefined})
    };
  }
})
export default class SubjectListPage extends Component {

  state = {};

  render() {
    const {
      all = [], loading, location, dispatch,
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;

    const title = '科目列表';

    const breadcrumb = ['管理', '科目管理', title];


    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={[{key:'rollback'}]}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );
    const wrapper = {
      labelCol: {span: 0},
      wrapperCol: {span: 24}
    };

    return (
      <Page header={header}
            location={location}
            loading={!!loading}
      >
        <Form layout="vertical" style={{paddingTop: 200, width: 600, margin: '0 auto'}} onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          validateFieldsAndScroll((errors, payload) => {
            if (errors) {
              console.error(errors);
            } else {
              payload.subjectIds = payload.subjectIds.join(',');
              dispatch({
                type: namespace + '/create',
                payload,
                resolve: () => {
                  notification.success({message: '设置成功'});
                }
              });
            }
          })
        }}>
          <Form.Item {...wrapper}
                     label={
                       <span style={{fontSize: 18, marginBottom: '1em', display: 'inline-block'}}>
                         请选择学校开设的科目
                       </span>
                     }
          >
            {
              getFieldDecorator('subjectIds', {
                rules: [{message: '请输入科目名称', required: true}]
              })(
                <Checkbox.Group onChange={console.log}>
                  <Row>
                    {
                      all.map(it =>
                        <Col span={6} key={it.id} style={{marginBottom: '1em'}}>
                          <Checkbox value={it.id}>{it.name}</Checkbox>
                        </Col>
                      )
                    }
                  </Row>

                </Checkbox.Group>
              )
            }
          </Form.Item>
          <div><Button htmlType="submit" type="primary" style={{width: 200, display: 'block'}}>确定</Button></div>
        </Form>
      </Page>
    );
  }
}
