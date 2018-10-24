import React, {Component, Fragment} from 'react';
import {Form, Select, Dropdown, Menu, notification, Spin} from 'antd';
import {connect} from 'dva';
import {TimetableClass as namespace, TimetableClass} from "../../utils/namespace";
import Filter from './Filter';
import Flex from '../Flex';
import {transformTimetableList, Timetable, SubstituteModal, CancelModal} from "./index";
import {transformListToTimeTableOfRoomWeekSlot} from './transformTimetableList';
import TimetableCell from './TimetableCell';
import WeekOfDate from './WeekOfDate';
import RoomTimetable from './RoomTimetable';


@connect(state => ({
  list: state[TimetableClass].list,
  now: state[namespace].now,
  loading: state[TimetableClass].loading,
}))
export default class LectureTable extends Component {

  state = {};

  componentWillUnmount() {
    this.props.dispatch({
      type: TimetableClass + '/set',
      payload: {
        list: []
      }
    })
  }

  fetchLectureList = (changeType, {gradeId, klassId, teacherId, studentId, weekIndex, type}) => {
    let payload;
    if (this.props.type === 'klass' && gradeId && klassId) {
      payload = {gradeId, klassId, weekIndex};
    }
    else if (this.props.type === 'student' && gradeId && studentId) {
      payload = {gradeId, studentId, weekIndex};
    }
    else if (this.props.type === 'teacher' && gradeId && teacherId) {
      payload = {gradeId, teacherId, weekIndex};
    }
    else if (this.props.type === 'grade' && gradeId && type) {
      payload = {gradeId, type, weekIndex};
    }

    if (payload) {
      this.props.dispatch({
        type: TimetableClass + '/list',
        payload
      });
    } else {
      this.props.dispatch({
        type: TimetableClass + '/set',
        payload: {
          list: []
        }
      })
    }
  };

  render() {
    const {list, now, type, dispatch, loading} = this.props;

    const courseMenu = this.createMenu([
      {key: 'cancel', children: '取消', onClick:(lecture)=>this.setState({cancelModalVisible: true, cancelLeture: lecture})}
    ]);
    const teacherMenu = this.createMenu([
      {key: 'substitute', children: '代课', onClick:(lecture)=>this.setState({substituteModalVisible: true, substituteLecture: lecture})}
    ]);

    const swap = type === 'klass' ? {
      swapStart: (id) => {
        list.forEach(it => {
          delete it.available
        });
        this.setState({disabledLoading: true}, () => {
          dispatch({
            type: namespace + '/set',
            payload: {
              list: [...list]
            },
          });
          dispatch({
            type: namespace + '/available',
            payload: {id},
          });
        })
      },
      swap: (id, lectureId) => {
        dispatch({
          type: namespace + '/swap',
          payload: {
            id, lectureId
          },
          resolve: () => {
            notification.success({
              message: '换课成功'
            });
            this.setState({disabledLoading: false})
          }
        })
      },
      swapEnd: () => {
        list.forEach(it => {
          delete it.available
        });
        dispatch({
          type: namespace + '/set',
          payload: {
            list: [...list]
          },
        });
      },
    } : {};

    const timetableProps = {
      now,
      ...swap,
      renderCourse: (course, lecture) => (type === 'klass' && lecture.status !== 4) ?
        <Dropdown overlay={courseMenu(lecture)}><a>{course.name}</a></Dropdown> : course.name,

      renderTeacher: (teacher, lecture) => type === 'teacher' ?
        <Dropdown overlay={teacherMenu(lecture)}><a>{teacher.name}</a></Dropdown> : teacher.name
    };

    const cancelModalProps = {
      visible: this.state.cancelModalVisible,
      onOk: payload => {
        dispatch({
          type: namespace + '/cancel',
          payload: {
            id: this.state.cancelLeture.id,
            ...payload
          },
          resolve: () => {
            notification.success({
              message: '取消成功'
            });
            this.setState({cancelModalVisible: false})
          }
        });
      },
      onCancel: () => this.setState({cancelModalVisible: false})
    };

    const substituteModalProps = {
      lecture: this.state.substituteLecture,
      visible: this.state.substituteModalVisible,
      onOk: (payload) => {
        dispatch({
          type: namespace + '/modify',
          payload,
          resolve: () => {
            notification.success({
              message: '代课成功'
            });
            this.setState({substituteModalVisible: false});
          }
        });
      },
      onCancel: () => this.setState({substituteModalVisible: false})
    };


    return (
      <div>
        <Filter type={type} onChange={this.fetchLectureList}/>
        {
          type === 'grade' ?
            <Spin spinning={!!loading}>{LectureTable.renderRoomWeekSlot(list, now)}</Spin>
            :
            <Timetable {...transformTimetableList(list || [])} {...timetableProps} >
              <CancelModal {...cancelModalProps} />
              <SubstituteModal {...substituteModalProps}/>
            </Timetable>
        }
      </div>
    )
  }

  static renderRoomWeekSlot(list, now) {
    const data = transformListToTimeTableOfRoomWeekSlot(list || []) || [];
    return (
      <RoomTimetable data={data} now={now}/>
    )
  }

  createMenu = (menus = []) => lecture => (
    <Menu onClick={(e) => {
      const menu = menus.find(it=>it.key === e.key);
      if(menu && menu.onClick){
        menu.onClick(lecture)
      }
    }}>
      {
        menus.map(it =>
          <Menu.Item key={it.key}>{it.children}</Menu.Item>
        )
      }
    </Menu>
  )


}
