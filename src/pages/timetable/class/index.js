import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Radio, Select, CheckBox, Dropdown, Menu, notification} from 'antd';
import {TimetableClass as namespace, ManagesGrade, ManagesClass} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import {
  transformTimetableList,
  RadioSelector,
  Timetable,
  LabelBox,
  Calendar,
  CancelModal
} from '../../../components/Timetable';

import styles from '../index.less';

import LectureTable from '../../../components/Timetable/LectureTable';
export default class KlassTimeTable extends Component {

  state = {};


  render() {
    const {
      list = [], total, loading, now, next, previous,
      gradeList = [], classList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '班级课表';

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
            <LectureTable type="klass"/>
          </div>
        </div>
      </Page>

    );
  }
}

// @connect(state => ({
//   total: state[namespace].total,
//   list: state[namespace].list,
//   next: state[namespace].next,
//   previous: state[namespace].previous,
//   now: state[namespace].now,
//   loading: state[namespace].loading && !state[namespace].disabledLoading,
//   gradeList: state[ManagesGrade].list,
//   classList: state[ManagesClass].list,
// }))
// export default class KlassTimeTable extends Component {
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
//   fetchClassList = (payload) => {
//     const {dispatch} = this.props;
//     dispatch({
//       type: ManagesClass + '/list',
//       payload
//     });
//   };
//
//   onGradeChange = e => {
//     const gradeId = e.target.value;
//     this.fetchClassList({gradeId});
//     const {dispatch, location: {pathname, query}} = this.props;
//     dispatch(routerRedux.replace({pathname, query: {...query, gradeId, klassId: undefined}}));
//     dispatch({
//       type: namespace + '/set',
//       payload: {list: []}
//     });
//   };
//
//   onClassChange = klassId => {
//     // const klassId = e.target.value;
//     const {dispatch, location: {pathname, query}} = this.props;
//     dispatch(routerRedux.replace({pathname, query: {...query, klassId}}));
//   };
//
//   render() {
//     const {
//       list = [], total, loading, now, next, previous,
//       gradeList = [], classList = [],
//       location, dispatch
//     } = this.props;
//
//     const {pathname, query} = location;
//
//     const title = '班级课表';
//
//     const breadcrumb = ['排课', '课表', title];
//
//     const buttons = [];
//
//     const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
//     const header = (
//       <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
//     );
//
//     const klassGroup = classList && classList.length && Object.entries(classList.reduce((group, it) => {
//       const arr = group[it.type] || [];
//       arr.push(it);
//       group[it.type] = arr;
//       return group;
//     }, {})).map(([key, list]) => ({key, list})) || [];
//
//     const klassGroupLabels = {
//       1: '行政班',
//       3: '选考班',
//       4: '学考班'
//     };
//
//     const menu = (lecture) => (
//       <Menu onClick={(e) => {
//         switch (e.key) {
//           case 'cancel':
//             console.log(lecture);
//             this.setState({cancelModalVisible: true, cancelLeture: lecture});
//
//           default:
//             break;
//         }
//       }}>
//         {
//           [
//             {key: 'cancel', children: '取消',}
//           ].map(it =>
//             <Menu.Item {...it}/>
//           )
//         }
//       </Menu>
//     );
//
//     const timetableProps = {
//       now,
//       swapStart: (id) => {
//         list.forEach(it => {
//           delete it.available
//         });
//         this.setState({disabledLoading: true}, () => {
//           dispatch({
//             type: namespace + '/set',
//             payload: {
//               list: [...list]
//             },
//           });
//           dispatch({
//             type: namespace + '/available',
//             payload: {id},
//           });
//         })
//       },
//       swap: (id, lectureId) => {
//         dispatch({
//           type: namespace + '/swap',
//           payload: {
//             id, lectureId
//           },
//           resolve: () => {
//             notification.success({
//               message: '换课成功'
//             });
//             this.setState({disabledLoading: false})
//           }
//         })
//       },
//       swapEnd: () => {
//         list.forEach(it => {
//           delete it.available
//         });
//         dispatch({
//           type: namespace + '/set',
//           payload: {
//             list: [...list]
//           },
//         });
//       },
//       renderCourse: (course, lecture) => lecture.status !== 4 ?
//         <Dropdown overlay={menu(lecture)}><a>{course.name}</a></Dropdown> : course.name
//     };
//
//
//     const cancelModalProps = {
//       visible: this.state.cancelModalVisible,
//       onOk: (payload) => {
//         dispatch({
//           type: namespace + '/cancel',
//           payload: {
//             id: this.state.cancelLeture.id,
//             ...payload
//           },
//           resolve: () => {
//             notification.success({
//               message: '取消成功'
//             });
//             this.setState({cancelModalVisible: false})
//           }
//         });
//       },
//       onCancel: () => this.setState({cancelModalVisible: false})
//     }
//
//
//     return (
//       <Page header={header} loading={loading && !this.state.disabledLoading}>
//         <div className="list-page-main">
//           <div className="list-table-container">
//
//             <LectureTable type="klass" />
//
//             <RadioSelector title="年级" options={gradeList} onChange={this.onGradeChange}/>
//             {
//               query.gradeId && classList && classList.length ?
//                 <LabelBox title="班级">
//                   <Select style={{width: 200, margin: 5}} placeholder="请选择班级" onChange={this.onClassChange}>
//                     {
//                       klassGroup.map(it =>
//                         <Select.OptGroup key={it.key} label={klassGroupLabels[it.key]}>
//                           {
//                             it.list.map(it =>
//                               <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
//                             )
//                           }
//                         </Select.OptGroup>
//                       )
//                     }
//                   </Select>
//                 </LabelBox>
//                 :
//                 null
//             }
//             {
//               query.gradeId && query.klassId && classList && classList.length && list && list.length ?
//                 <div>
//                   <Calendar {...{next, now, previous, dispatch, pathname, query}} />
//                   <Timetable {...transformTimetableList(list)} {...timetableProps}>
//                     <CancelModal {...cancelModalProps}/>
//                   </Timetable>
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


