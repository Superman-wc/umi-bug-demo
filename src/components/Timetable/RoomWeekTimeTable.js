import React, {Component, Fragment} from 'react';
import {Form, Select, Dropdown, Menu, notification, Spin, Button} from 'antd';
import {connect} from 'dva';
import {TimetableLecture as namespace} from "../../utils/namespace";
import Filter from './Filter';
import Flex from '../Flex';
import {RoomTimetable, transformLectureListToRoomWeekTimetable} from '../Lecture/index';


@connect(state => ({
  list: state[namespace].list,
  now: state[namespace].now,
  loading: state[namespace].loading,
  item: state[namespace].item,
}))
export default class RoomWeekTimeTable extends Component {

  state = {
    timetable: []
  };

  setTimetable = (list) => {
    this.setState({timetable: transformLectureListToRoomWeekTimetable(list || [])});
  };

  componentWillUnmount() {
    this.props.dispatch({
      type: namespace + '/set',
      payload: {
        list: [],
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list && nextProps.list !== this.props.list) {
      this.setTimetable(nextProps.list);
    }
  }


  render() {
    const {now, type, loading, dispatch} = this.props;
    const {timetable} = this.state;
    const props = {
      now,
      roomWeekLectures: timetable,
      renderTeacher: teacher => teacher ? teacher.name : null,
      renderKlass: klass => klass ? klass.name : null
    };
    const fetchLectureList = (changeType, {gradeId, weekIndex, type}) => {
      let payload;
      if (gradeId && type) {
        payload = {gradeId, type, weekIndex};
      }

      if (payload) {
        dispatch({
          type: namespace + '/list',
          payload,
        });
      } else {
        this.setState({timetable: []})
      }
    };
    return (
      <Spin spinning={!!loading}>
        <Flex align="middle" style={{padding: '5px 10px', background: '#eee', borderBottom: '1px solid #999'}}>
          <Filter type={type} onChange={fetchLectureList}/>
        </Flex>
        <RoomTimetable {...props}/>
      </Spin>
    )
  }
}


