import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {notification, Button, Modal, Icon, Spin} from 'antd';
import {TimetableLecture as namespace} from '../../utils/namespace';
import Flex from '../Flex';
import {Timetable, transformLectureListToWeekTimetable, WeekOfDate} from '../Lecture/index';
import Filter from './Filter';
import CancelModal from './CancelModal';
import SubstituteModal from './SubstituteModal';
import Lecture from "../Lecture/Lecture";
import styles from './index.less';

@connect(state => ({
  list: state[namespace].list,
  now: state[namespace].now,
  loading: state[namespace].loading,
}))
export default class WeekTimeTable extends Component {
  state = {
    timetable: transformLectureListToWeekTimetable([])
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.list !== this.props.list) {
      this.setTimetable(nextProps.list);
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: namespace + '/set',
      payload: {
        list: [],
      }
    });
  }


  setTimetable = (list) => {
    this.setState({timetable: transformLectureListToWeekTimetable(list || [])});
  };

  render() {
    const {
      loading, dispatch, now, type,
    } = this.props;

    const {timetable, selectedLecture} = this.state;

    const buttons = [];

    if (selectedLecture && typeof selectedLecture.id === 'number' && selectedLecture.type === 1) {

      if (!this.state.startSwap && (type === 'klass' || type === 'teacher')) {
        type === 'klass' && buttons.push({
          key: 'cancel-lecture', children: '取消课程',
          onClick: () => {
            this.setState({cancelModalVisible: true});
          }
        });
        type === 'teacher' && buttons.push({
          key: 'substitute', children: '代课', onClick: () => {
            this.setState({substituteModalVisible: true});
          }
        });
        type === 'klass' && buttons.push({
          key: 'swap', children: '换课', onClick: () => {
            dispatch({
              type: namespace + '/available',
              payload: {id: selectedLecture.id},
              resolve: ({total, list}) => {
                if (total && list && list.length) {
                  timetable.forEach(dateLectures => {
                    dateLectures.forEach(it => {
                      it.available = list.indexOf(it.id) !== -1;
                    });
                  });
                  this.setState({startSwap: true, timetable}, () => {
                    notification.info({
                      message: '可以进行更换的课程',
                      description: '请在课表上选择红色虚线的课程进行换课'
                    });
                  });
                } else {
                  notification.warn({
                    message: '没有可以进行更换的课程',
                  });
                }
              }
            });

          }
        });
      } else {
        buttons.push({
          key: 'swap', children: '取消换课', type: 'primary',
          onClick: () => {
            timetable.forEach(dateLectures => {
              dateLectures.forEach(it => {
                delete it.available;
              });
            });
            this.setState({startSwap: false, timetable});
          }
        });
      }
    }


    const timetableProps = {
      now,
      type: 'klass',
      weekLectures: timetable,
      onSelect: lecture => {
        console.log(lecture);
        if (!this.state.startSwap) {
          timetable.forEach(dateLecture => {
            dateLecture.forEach(it => {
              it.selected = it === lecture
            })
          });
          this.setState({timetable, selectedLecture: lecture});
        } else {
          if (selectedLecture && lecture.available) {
            Modal.confirm({
              className: styles['swap-dialog'],
              width: 650,
              autoFocusButton: true,
              title: '再次确认换课',
              content: (
                <Flex align="middle">
                  <SwapLecture lecture={selectedLecture} now={now}/>
                  <Icon type="swap" theme="outlined" style={{fontSize: '60px', margin: '30px', color: '#5bdf32'}}/>
                  <SwapLecture lecture={lecture} now={now}/>
                </Flex>
              ),
              onOk: () => {
                dispatch({
                  type: namespace + '/swap',
                  payload: {
                    id: selectedLecture.id,
                    lectureId: lecture.id
                  },
                  resolve: () => {
                    notification.success({
                      message: '换课成功'
                    });
                    this.setState({startSwap: false, selectedLecture: null});
                  }
                })
              }
            });
          }
        }
      }
    };

    const cancelModalProps = {
      visible: this.state.cancelModalVisible,
      onOk: payload => {
        if (selectedLecture) {
          dispatch({
            type: namespace + '/cancel',
            payload: {
              id: selectedLecture.id,
              ...payload
            },
            resolve: () => {
              notification.success({
                message: '取消成功'
              });
              this.setState({cancelModalVisible: false})
            }
          });
        }
      },
      onCancel: () => this.setState({cancelModalVisible: false})
    };

    const substituteModalProps = {
      lecture: selectedLecture,
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

    const fetchLectureList = (changeType, {gradeId, klassId, teacherId, studentId, weekIndex, type}) => {
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
        dispatch({
          type: namespace + '/list',
          payload,
        });
      } else {
        this.setTimetable([]);
      }
    };

    return (
      <Spin spinning={!!loading}>
        <Flex align="middle" style={{padding: '5px 10px', background: '#eee', borderBottom: '1px solid #999'}}>
          <Filter type={type} onChange={fetchLectureList} disabled={this.state.startSwap}/>
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
        <Timetable {...timetableProps} >
          <CancelModal {...cancelModalProps}/>
          <SubstituteModal {...substituteModalProps} />
        </Timetable>
      </Spin>
    );
  }
}

function SwapLecture({lecture, now}) {
  return (
    <Flex.Item className={styles['swap-item']}>
      <Flex align="middle" justify="center">
        <WeekOfDate className={styles['swap-dialog-week-of-date']} now={now} index={lecture.period.dayOfWeek}/>
        <div className={styles['swap-dialog-timeslot']}>第{lecture.period.timeslot + 1}节</div>
      </Flex>
      <Lecture lecture={lecture}/>
    </Flex.Item>
  )
}
