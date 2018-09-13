import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, Modal} from 'antd';
import {
  ManagesClass,
  ManagesGrade,
  ManagesStudent as namespace,
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import GradeClassSelector from "../../../components/GradeClassSelector";
import styles from './index.less';


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  classList: state[ManagesClass].list,
}))
export default class StudentList extends Component {

  state = {};

  componentDidMount() {
    const {gradeList} = this.props;
    if (!gradeList) {
      // this.fetchGradeList();
    }
  }

  fetchGradeList() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list',
    });
  }

  fetchClassList(payload) {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesClass + '/list',
      payload
    });
  }

  render() {
    const {
      list, total, loading,
      gradeList = [], classList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '学生列表';

    const breadcrumb = ['管理', '学生管理', title];

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
      {title: '学号', key: 'code'},
      {title: '姓名', key: 'name'},
      {title: '性别', key: 'gender'},
      {title: '选考科目', key: 'electionExaminationCourseEntityList'},
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
          classList={classList}
          onGradeChange={(gradeId) => this.fetchClassList({gradeId})}
          onClassChange={(classId) => {
            dispatch(routerRedux.replace({pathname, query: {...query, classId}}))
          }}
        />
      </ListPage>
    )
  }
}
