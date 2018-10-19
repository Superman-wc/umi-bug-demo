import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Radio} from 'antd';
import {TimetableStudent as namespace, ManagesGrade, ManagesCourse, ManagesTeacher} from '../../../utils/namespace';
import {transformTimetableList, Timetable, Calendar} from '../../../components/Timetable';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import Flex from '../../../components/Flex';
import styles from '../index.less';


import LectureTable from '../../../components/Timetable/LectureTable';
export default class TeacherTimeTable extends Component {

  state = {};


  render() {
    const {
      list = [], total, loading, now, next, previous,
      gradeList = [], classList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '学生课表';

    const breadcrumb = ['排课', '课表', title];

    const buttons = [];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );


    return (
      <Page header={header} loading={loading && !this.state.disabledLoading}>
        <div className="list-page-main">
          <div className="list-table-container">
            <LectureTable type="student"/>
          </div>
        </div>
      </Page>

    );
  }
}

// @connect(state => ({
//   total: state[namespace].total,
//   list: state[namespace].list,
//   loading: state[namespace].loading,
//   next: state[namespace].next,
//   previous: state[namespace].previous,
//   now: state[namespace].now,
//   gradeList: state[ManagesGrade].list,
//   courseList: state[ManagesCourse].list,
//   teacherList: state[ManagesTeacher].list,
// }))
// export default class TimetableTeacher extends Component {
//
//   state = {};
//
//   componentDidMount() {
//     const {gradeList} = this.props;
//     if (!gradeList || !gradeList.length) {
//       this.fetchGradeList();
//     }
//   }
//
//   fetchGradeList = () => {
//     const {dispatch} = this.props;
//     dispatch({
//       type: ManagesGrade + '/list'
//     });
//   };
//
//   fetchCourseList = (payload) => {
//     const {dispatch} = this.props;
//     dispatch({
//       type: ManagesCourse + '/list',
//       payload
//     });
//   };
//
//   fetchTeacherList = (payload) => {
//     const {dispatch} = this.props;
//     dispatch({
//       type: ManagesTeacher + '/list',
//       payload
//     });
//   };
//
//   onGradeChange = e => {
//     const gradeId = e.target.value;
//     this.fetchCourseList({gradeId});
//     const {dispatch, location: {pathname, query}} = this.props;
//     dispatch(routerRedux.replace({pathname, query: {...query, gradeId, courseId: undefined, teacherId: undefined}}));
//     dispatch({
//       type: namespace + '/set',
//       payload: {list: []}
//     });
//   };
//
//   onCourseChange = e => {
//     const courseId = e.target.value;
//     const {dispatch, location: {pathname, query}} = this.props;
//     this.fetchTeacherList({courseId, gradeId: query.gradeId});
//     dispatch(routerRedux.replace({pathname, query: {...query, courseId, teacherId: undefined}}));
//     dispatch({
//       type: namespace + '/set',
//       payload: {list: []}
//     });
//   };
//
//   onTeacherChange = e => {
//     const teacherId = e.target.value;
//     const {dispatch, location: {pathname, query}} = this.props;
//     dispatch(routerRedux.replace({pathname, query: {...query, teacherId}}));
//   };
//
//   render() {
//     const {
//       list = [], total, loading, now, next, previous,
//       gradeList = [], courseList = [], teacherList = [],
//       location, dispatch
//     } = this.props;
//
//     const {pathname, query} = location;
//
//     const title = '学生课表';
//
//     const breadcrumb = ['排课', '课表', title];
//
//     const buttons = [{
//       key: 'rollback'
//     }];
//
//     const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
//     const header = (
//       <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
//     );
//
//     console.log(now);
//
//     return (
//       <Page header={header} loading={!!loading}>
//         <div className="list-page-main">
//           <div className="list-table-container">
//             {
//               list && list.length ?
//                 <div>
//                   <Calendar {...{next, now, previous, dispatch, pathname, query}} />
//                   <Timetable {...transformTimetableList(list)} now={now}/>
//                 </div>
//                 :
//                 null
//             }
//           </div>
//         </div>
//       </Page>
//
//     );
//   }
// }


