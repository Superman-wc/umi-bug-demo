import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, Modal} from 'antd';
import {
  ManagesClass,
  ManagesGrade,
  ManagesStudent as namespace, TimetableStudent,
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
      this.fetchGradeList();
    }
  }

  fetchGradeList() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list',
    });
  }

  fetchClassList(payload) {
    const {dispatch, location: {pathname, query}} = this.props;
    dispatch(routerRedux.replace({pathname, query: {...query, ...payload}}));
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
      {
        title: '选考科目', key: 'electionExaminationCourseEntityList',
        render: list => list.map(it => <span className={styles['separate']} key={it.id}>{it.name}#{it.id}</span>)
      },
      {
        title: '学考科目', key: 'studyExaminationCourseEntityList',
        render: list => list.map(it => <span className={styles['separate']} key={it.id}>{it.name}#{it.id}</span>)
      },
      {
        title: '操作',
        key: 'operate',
        width: 80,
        render: (id, item) => (
          <TableCellOperation
            operations={{
              edit: () => {
                this.setState({visible: true, item});
              },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
              timetable: {
                children: '课表',
                onClick: () => {
                  dispatch(routerRedux.push({
                    pathname: TimetableStudent,
                    query: {studentId: id, gradeId: item.gradeId, name: item.name}
                  }))
                }
              }
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
        scrollHeight={215}
      >
        <GradeClassSelector
          gradeList={gradeList}
          classList={classList}
          onGradeChange={(gradeId) => this.fetchClassList({gradeId})}
          onClassChange={(klassId) => {
            dispatch(routerRedux.replace({pathname, query: {...query, klassId, p: undefined}}))
          }}
        />
      </ListPage>
    )
  }
}
