import React, {Component, Fragment} from 'react';
import {Form, Select, Dropdown, Menu, notification, Spin, Button, Modal, Input} from 'antd';
import {connect} from 'dva';
import {
  TimetableBuild as namespace,
  ManagesGrade,
  ManagesRoom,
  ManagesClass,
  ManagesCourse,
  ManagesTeacher,
  ManagesPeriod,
} from "../../utils/namespace";
import Flex from '../Flex';
import {RoomTimetable, transformLectureListToRoomWeekTimetable} from '../Lecture/index';
import {LectrueTypeEnum, Enums} from '../../utils/Enum';


@connect(state => ({
  list: state[namespace].list,
  now: state[namespace].now,
  loading: state[namespace].loading,
  item: state[namespace].item,
  gradeList: state[ManagesGrade].list,
  klassList: state[ManagesClass].list,
  courseList: state[ManagesCourse].list,
  roomList: state[ManagesRoom].list,
  periodList: state[ManagesPeriod].list
}))
export default class RoomWeekTimeTable extends Component {

  state = {
    timetable: [],
    maxDayOfWeek: 6,
    maxTimeslot: 8
  };

  componentDidMount() {
    this.props.dispatch({
      type: ManagesRoom + '/list',
      payload: {s: 10000}
    });
    this.props.dispatch({
      type: ManagesGrade + '/list',
      payload: {s: 1000}
    });
  }


  setTimetable = (list, maxDayOfWeek = 6, maxTimeslot = 8, roomList = []) => {
    this.setState({
      timetable: transformLectureListToRoomWeekTimetable(list || [], maxDayOfWeek, maxTimeslot, roomList)
    });
  };


  componentWillReceiveProps(nextProps) {
    if (nextProps.list && nextProps.list !== this.props.list) {
      this.setTimetable(nextProps.list, this.state.maxDayOfWeek, this.state.maxTimeslot, nextProps.roomList || this.props.roomList);
    }
  }

  onGradeChange = gradeId => {
    this.setState({gradeId});
    this.props.dispatch({
      type: namespace + '/list',
      payload: {
        gradeId,
        s: 10000,
      }
    });
    this.props.dispatch({
      type: ManagesClass + '/list',
      payload: {
        gradeId,
        s: 10000,
      }
    });
    this.props.dispatch({
      type: ManagesCourse + '/list',
      payload: {
        gradeId,
        s: 10000,
      }
    });
    this.props.dispatch({
      type: ManagesPeriod + '/list',
      payload: {
        gradeId,
        s: 1000,
      },
      resolve: ({list}) => {
        console.log('period', list);
        let maxDayOfWeek = 0;
        let maxTimeslot = 0;
        const periodMap = list.reduce((map, it) => {
          maxDayOfWeek = Math.max(maxDayOfWeek, it.dayOfWeek);
          maxTimeslot = Math.max(maxTimeslot, it.timeslot);
          const arr = map[it.dayOfWeek] || [];
          arr[it.timeslot] = it;
          map[it.dayOfWeek] = arr;
          return map;
        }, []);
        this.setState({
          periodMap,
          maxDayOfWeek,
          maxTimeslot
        });
        console.log(maxDayOfWeek, maxTimeslot);
        this.setTimetable(this.props.list, maxDayOfWeek, maxTimeslot, this.props.roomList);
      }
    });

  };

  render() {
    const {now, loading, dispatch, roomList = [], gradeList = [], klassList = [], courseList = []} = this.props;
    const {timetable, selectedLecture, maxDayOfWeek, maxTimeslot} = this.state;

    const props = {
      className: 'room-week-timetable-editable',
      now,
      roomWeekLectures: timetable,
      maxDayOfWeek, maxTimeslot,
      renderTeacher: teacher => teacher ? teacher.name : null,
      renderKlass: klass => klass ? klass.name : null,
      onSelect: lecture => {
        console.log(lecture);
        timetable.forEach(roomWeekLectures => {
          roomWeekLectures.weekLectures.forEach(dateLecture => {
            dateLecture.forEach(it => {
              it.selected = it === lecture
            });
          })
        });
        this.setState({timetable, selectedLecture: lecture});
      }
    };
    const fetchLectureList = (changeType, value) => {
      const {gradeId, weekIndex, type} = value;
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
        if (onFilterChange) {
          onFilterChange(changeType, value);
        }
        this.setTimetable([], roomList);
      }
    };
    const buttons = [];
    if (selectedLecture) {
      buttons.push({
        key: 'edit', children: '编辑', onClick: () => {
          this.setState({lectureModalVisible: true});
        }
      });
      if (typeof selectedLecture.id === 'number') {
        buttons.push({
          key: 'remove', children: '删除', onClick: () => {
            dispatch({
              type: namespace + '/remove',
              payload: {id: selectedLecture.id}
            })
          }
        })
      }
    }
    const selectStyle = {width: 120};
    return (
      <Spin spinning={!!loading}>
        <Flex align="middle" style={{padding: '5px 10px', background: '#eee', borderBottom: '1px solid #999'}}>
          <Form layout="inline">
            <Form.Item label="年级">
              <Select placeholder="请选择" onChange={this.onGradeChange} style={selectStyle}>
                {
                  gradeList.map(it =>
                    <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                  )
                }
              </Select>
            </Form.Item>
          </Form>
          <Flex.Item>
            {
              buttons.length ?
                <Button.Group>
                  {
                    buttons.map(it =>
                      <Button {...it} />
                    )
                  }
                </Button.Group>
                :
                null
            }
          </Flex.Item>
        </Flex>
        <RoomTimetable {...props} />
        <LectureModal visible={this.state.lectureModalVisible}
                      lecture={this.state.selectedLecture}
                      gradeId={this.state.gradeId}
                      klassList={this.props.klassList}
                      courseList={this.props.courseList}
                      onCancel={() => this.setState({lectureModalVisible: false})}
                      onOk={payload => {
                        payload.gradeId = this.state.gradeId;
                        payload.roomId = this.state.selectedLecture.room.id;
                        const {dayOfWeek, timeslot} = this.state.selectedLecture.period;
                        payload.periodId = this.state.periodMap[dayOfWeek][timeslot].id;
                        if (typeof  this.state.selectedLecture.id === 'number') {
                          payload.id = this.state.selectedLecture.id
                        }
                        console.log(
                          payload,
                          this.state.selectedLecture
                        );
                        dispatch({
                          type: namespace + (payload.id ? '/modify' : '/create'),
                          payload
                        });
                        this.setState({lectureModalVisible: false})
                      }}
        />
      </Spin>
    )
  }
}

@Form.create()
@connect(state => ({
  teacherList: state[ManagesTeacher].list,
}))
class LectureModal extends Component {

  state = {};

  componentDidMount() {

  }

  render() {
    const {
      visible, onCancel, onOk,
      klassList = [], courseList = [], teacherList = [],
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;

    const selectStyle = {width: '100%'};

    const wrapper = {
      labelCol: {span: 6},
      wrapperCol: {span: 16}
    };

    return (
      <Modal title="创建课表" visible={visible} onCancel={onCancel}
             onOk={() => {
               validateFieldsAndScroll((errors, payload) => {
                 if (errors) {
                   console.error(errors)
                 } else {
                   onOk(payload);
                 }
               })
             }}
      >
        <Form layout="horizontal">
          <Form.Item label="班级" {...wrapper}>
            {
              getFieldDecorator('klassId', {})(
                <Select placeholder="请选择" style={selectStyle}>
                  {
                    klassList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="学科" {...wrapper}>
            {
              getFieldDecorator('reserveName', {})(
                <Input/>
              )
            }
          </Form.Item>
          <Form.Item label="学科" {...wrapper}>
            {
              getFieldDecorator('courseId', {})(
                <Select placeholder="请选择" onChange={(courseId) => {
                  this.setState({courseId});
                  this.props.dispatch({
                    type: ManagesTeacher + '/list',
                    payload: {
                      gradeId: this.props.gradeId,
                      courseId,
                      s: 10000,
                    }
                  });
                }} style={selectStyle}>
                  {
                    courseList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="教师"  {...wrapper}>
            {
              getFieldDecorator('teacherId', {})(
                <Select placeholder={this.state.courseId ? '请选择' : '请先选择科目'} style={selectStyle}>
                  {
                    teacherList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}


