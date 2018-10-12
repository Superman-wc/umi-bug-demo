import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, Modal} from 'antd';
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
        <GradeClassSelector
          gradeList={gradeList}
          courseList={courseList}
          onGradeChange={(gradeId) => {
            this.fetchCourseList({gradeId});
            dispatch(routerRedux.replace({pathname, query: {...query, gradeId}}));
          }}
          onCourseChange={(courseId) => {
            dispatch(routerRedux.replace({pathname, query: {...query, courseId}}))
          }}
        />
      </ListPage>
    )
  }
}
