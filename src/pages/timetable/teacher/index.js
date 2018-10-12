import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Radio} from 'antd';
import {TimetableTeacher as namespace, ManagesGrade, ManagesCourse, ManagesTeacher} from '../../../utils/namespace';
import {transformTimetableList, RadioSelector, Timetable, WeekIndex, Calendar} from '../../../components/Timetable';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import Flex from '../../../components/Flex';
import styles from '../index.less';


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  next: state[namespace].next,
  previous: state[namespace].previous,
  now: state[namespace].now,
  gradeList: state[ManagesGrade].list,
  courseList: state[ManagesCourse].list,
  teacherList: state[ManagesTeacher].list,
}))
export default class TimetableTeacher extends Component {

  state = {};

  componentDidMount() {
    const {gradeList} = this.props;
    if (!gradeList || !gradeList.length) {
      this.fetchGradeList();
    }
  }

  fetchGradeList = () => {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list'
    });
  };

  fetchCourseList = (payload) => {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesCourse + '/list',
      payload
    });
  };

  fetchTeacherList = (payload) => {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesTeacher + '/list',
      payload
    });
  };

  onGradeChange = e => {
    const gradeId = e.target.value;
    this.fetchCourseList({gradeId});
    const {dispatch, location: {pathname, query}} = this.props;
    dispatch(routerRedux.replace({pathname, query: {...query, gradeId, courseId: undefined, teacherId: undefined}}));
    dispatch({
      type: namespace + '/set',
      payload: {list: []}
    });
  };

  onCourseChange = e => {
    const courseId = e.target.value;
    const {dispatch, location: {pathname, query}} = this.props;
    this.fetchTeacherList({courseId, gradeId: query.gradeId});
    dispatch(routerRedux.replace({pathname, query: {...query, courseId, teacherId: undefined}}));
    dispatch({
      type: namespace + '/set',
      payload: {list: []}
    });
  };

  onTeacherChange = e => {
    const teacherId = e.target.value;
    const {dispatch, location: {pathname, query}} = this.props;
    dispatch(routerRedux.replace({pathname, query: {...query, teacherId}}));
  };

  render() {
    const {
      list = [], total, loading, now, next, previous,
      gradeList = [], courseList = [], teacherList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '教师课表';

    const breadcrumb = ['排课', '课表', title];

    const buttons = [];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    return (
      <Page header={header} loading={!!loading}>
        <div className="list-page-main">
          <div className="list-table-container">
            <RadioSelector title="年级" options={gradeList} onChange={this.onGradeChange}/>
            {
              query.gradeId && courseList && courseList.length ?
                <RadioSelector title="科目" options={courseList} onChange={this.onCourseChange}/>
                :
                null
            }
            {
              query.gradeId && query.courseId && teacherList && teacherList.length ?
                <RadioSelector title="教师" options={teacherList} onChange={this.onTeacherChange}/>
                :
                null
            }
            {
              query.gradeId && query.courseId && query.teacherId && list && list.length ?
                <div>
                  <Calendar {...{next, now, previous, dispatch, pathname, query}} />
                  <Timetable {...transformTimetableList(list)} now={now}/>
                </div>
                :
                null
            }
          </div>
        </div>
      </Page>

    );
  }
}


