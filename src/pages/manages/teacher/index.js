import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, DatePicker, Input, notification, Checkbox} from 'antd';
import {
  ManagesClass, ManagesCourse,
  ManagesGrade, ManagesSubject,
  ManagesTeacher as namespace,
} from '../../../utils/namespace';

import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import styles from './index.less';



@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  courseList: state[ManagesCourse].list,
  subjectList: state[ManagesSubject].list,
}))
export default class StudentList extends Component {

  state = {};

  componentDidMount() {
    const {subjectList, dispatch} = this.props;
    if (!subjectList) {
      dispatch({
        type: ManagesSubject + '/list',
        payload: {s: 1000}
      })
    }
  }

  // fetchGradeList() {
  //   const {dispatch} = this.props;
  //   dispatch({
  //     type: ManagesGrade + '/list',
  //   });
  // }
  //
  // fetchCourseList(payload) {
  //   const {dispatch} = this.props;
  //   dispatch({
  //     type: ManagesCourse + '/list',
  //     payload
  //   });
  // }

  render() {
    const {
      list, total, loading,
      gradeList = [], courseList = [], subjectList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '教师列表';

    const breadcrumb = ['管理', '师资管理', title];

    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          this.setState({visible: true, item: null});
        },
      },
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '姓名', key: 'name'},
      {title: '工号', key: 'code'},
      {title: '手机号', key: 'mobile'},
      {title: '教学科目', key: 'subjectList', render: v => v.map(it => <span className={styles['subject-item']} key={it.id}>{it.name}</span>)},
      {
        title: '操作',
        key: 'operate',
        width: 80,
        render: (id, row) => (
          <TableCellOperation
            operations={{
              edit: () => {
                this.setState({visible: true, item: row});
              },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
      },
    ];

    const teacherModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      subjectList,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        console.log(payload);
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '教师成功'});
            this.setState({visible: false});
          }
        });
      }
    };

    return (
      <ListPage
        operations={buttons}
        location={location}
        loading={!!loading}
        columns={columns}
        breadcrumb={breadcrumb}
        list={list}
        total={total}
        pagination
        title={title}
        scrollHeight={176}
      >
        <TeacherModal {...teacherModalProps}/>
      </ListPage>
    )
  }
}

@Form.create({
  mapPropsToFields(props) {
    const {name, code, mobile, subjectsList} = props.item || {};
    return {
      name: Form.createFormField({value: name || undefined}),
      code: Form.createFormField({value: code || undefined}),
      mobile: Form.createFormField({value: mobile || undefined}),
      subjectIds: Form.createFormField({value: subjectsList && subjectsList.length && subjectsList.map(it => (it.id)) || undefined})
    }
  }
})
class TeacherModal extends Component {
  render() {
    const {
      visible, onCancel, onOk, item, subjectList,
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改教师' : '创建教师',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
            if (payload.subjectIds && payload.subjectIds.length) {
              payload.subjectIds = payload.subjectIds.join(',')
            }
            onOk(payload);
          }
        })
      }
    };
    const wrapper = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    };
    return (
      <Modal {...modalProps}>
        <Form layout="horizontal">
          <Form.Item label="姓名" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入姓名', required: true}]
              })(
                <Input maxLength={64} placeholder="请输入姓名"/>
              )
            }
          </Form.Item>
          <Form.Item label="工号" {...wrapper}>
            {
              getFieldDecorator('code', {
                rules: [{message: '请输入工号', required: true}]
              })(
                <Input maxLength={24} placeholder="请输入工号"/>
              )
            }
          </Form.Item>
          <Form.Item label="手机号" {...wrapper} extra="微信登录时需要填写">
            {
              getFieldDecorator('mobile')(
                <Input maxLength={11} placeholder="请输入手机号"/>
              )
            }
          </Form.Item>
          <Form.Item label="教学科目" {...wrapper}>
            {
              getFieldDecorator('subjectIds')(
                <Checkbox.Group options={subjectList.map(it => ({value: it.id, label: it.name}))}/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
