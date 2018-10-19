import React, {Component, Fragment} from 'react';
import {Form, Select, Dropdown, Menu, notification} from 'antd';
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

  fetchLectureList = (type, payload) => {
    // if (type === 'grade' || type === 'course') {
    //   this.props.dispatch({
    //     type: TimetableClass + '/set',
    //     payload: {
    //       list: []
    //     }
    //   })
    // } else {
    if (
      (this.props.type === 'klass' && payload.gradeId && payload.klassId) ||
      (this.props.type === 'student' && payload.gradeId && payload.studentId) ||
      (this.props.type === 'teacher' && payload.gradeId && payload.teacherId) ||
      (this.props.type === 'grade' && payload.gradeId && payload.type)
    ) {
      this.props.dispatch({
        type: TimetableClass + '/list',
        payload
      })
    } else {
      this.props.dispatch({
        type: TimetableClass + '/set',
        payload: {
          list: []
        }
      })
    }
    // }
  };

  render() {
    const {list, now, type, dispatch} = this.props;

    const courseMenu = (lecture) => (
      <Menu onClick={(e) => {
        switch (e.key) {
          case 'cancel':
            this.setState({cancelModalVisible: true, cancelLeture: lecture});
          default:
            break;
        }
      }}>
        {
          [
            {key: 'cancel', children: '取消',}
          ].map(it =>
            <Menu.Item {...it}/>
          )
        }
      </Menu>
    );

    const teacherMenu = (lecture) => (
      <Menu onClick={(e) => {
        switch (e.key) {
          case 'substitute':
            this.setState({substituteLecture: lecture, substituteModalVisible: true});
            break;
          default:
            break;
        }
      }}>
        {
          [
            {key: 'substitute', children: '代课',}
          ].map(it =>
            <Menu.Item {...it}/>
          )
        }
      </Menu>
    );

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
            <div>{this.renderRoomWeekSlot(list, now)}</div>
            :
            <Timetable {...transformTimetableList(list || [])} {...timetableProps} >
              <CancelModal {...cancelModalProps} />
              <SubstituteModal {...substituteModalProps}/>
            </Timetable>
        }
      </div>
    )
  }

  renderRoomWeekSlot(list, now) {
    const data = transformListToTimeTableOfRoomWeekSlot(list || []) || [];

    console.log(data);

    return (
      <RoomTimetable data={data} now={now} />
    )
  }
}
