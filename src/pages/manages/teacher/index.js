import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, DatePicker, Input, notification} from 'antd';
import {
  ManagesClass, ManagesCourse,
  ManagesGrade,
  ManagesTeacher as namespace,
} from '../../../utils/namespace';

import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import GradeClassSelector from "../../../components/GradeClassSelector";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  courseList: state[ManagesCourse].list,
}))
export default class StudentList extends Component {

  state = {};

  componentDidMount() {
    const {gradeList} = this.props;
    if (!gradeList) {
      this.fetchGradeList();
    }
  }

  fetchGradeList() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list',
    });
  }

  fetchCourseList(payload) {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesCourse + '/list',
      payload
    });
  }

  render() {
    const {
      list, total, loading,
      gradeList = [], courseList = [],
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
        scrollHeight={205}
      >
        {/*<GradeClassSelector*/}
          {/*gradeList={gradeList}*/}
          {/*courseList={courseList}*/}
          {/*onGradeChange={(gradeId) => {*/}
            {/*this.fetchCourseList({gradeId});*/}
            {/*dispatch(routerRedux.replace({pathname, query: {...query, gradeId}}));*/}
          {/*}}*/}
          {/*onCourseChange={(courseId) => {*/}
            {/*dispatch(routerRedux.replace({pathname, query: {...query, courseId}}))*/}
          {/*}}*/}
        {/*/>*/}
        <TeacherModal {...teacherModalProps}/>
      </ListPage>
    )
  }
}

@Form.create({
  mapPropsToFields(props) {
    const {name, code, mobile, subjectIds} = props.item || {};
    return {
      name: Form.createFormField({value: name || undefined}),
      code: Form.createFormField({value: code || undefined}),
      mobile: Form.createFormField({value: mobile || undefined}),
      // subjectIds: Form.createFormField({value: subjectIds || undefined}),
    }
  }
})
class TeacherModal extends Component {
  render() {
    const {
      visible, onCancel, onOk, item,
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
          <Form.Item label="手机号" {...wrapper}>
            {
              getFieldDecorator('mobile', {
                rules: [{message: '请输入手机号', required: true}]
              })(
                <Input maxLength={11} placeholder="请输入手机号"/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
