import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {Modal, Form, Select, Input, Button, notification} from 'antd';
// import Keyboard from 'keyboardjs';
import styles from './index.less';
import {
  ManagesClass, ManagesCourse,
  ManagesGrade,
  ManagesPeriod, ManagesRoom,
  ManagesTeacher,
  TimetableBuild as namespace
} from "../../utils/namespace";
import Flex from '../Flex';
import Selection from './selection';
import Point from "./point";
import Range from './range';
import Rect from './rect';


const WHEEL = Symbol('wheel');
const START_MOVE = Symbol('start-move');
const MOUNTED = Symbol('mounted');
const START_SELECT = Symbol('start-select');

@connect(state => ({
  gradeList: state[ManagesGrade].list,
  roomList: state[ManagesRoom].list,
  periodList: state[ManagesPeriod].list,
  courseList: state[ManagesCourse].list,
  klassList: state[ManagesClass].list,
  lectureList: state[namespace].list,
}))
export default class CourseTable extends Component {

  static CID = 0;

  state = {
    scrollX: 0,
    scrollY: 0,
    width: 600,
    height: 585,
    selection: new Selection(),
    scrollOffset: new Point()
  };

  width= 600;
  height= 585;

  constructor() {
    super(...arguments);
    this.id = `CourseTable-${CourseTable.CID++}`;
  }


  componentDidMount() {
    this[MOUNTED] = true;
    this.element = window.document.getElementById(this.id);
    this.viewport = window.document.getElementById(this.id + '-view-port');

    this.setState({
      height: this.element.clientHeight,
      width: this.element.clientWidth
    });
    window.addEventListener('resize', this.onResize);
    this.props.dispatch({
      type: ManagesGrade + '/list'
    });
    // this.bindKeyboard();
    this.props.dispatch({
      type: ManagesRoom + '/list',
      payload: {s: 10000}
    });
  }

  componentWillUnmount() {
    delete this[MOUNTED];
    window.removeEventListener('resize', this.onResize);
    // this.unBindKeyboard();
  }

  // componentWillReceiveProps() {
  //   this.setState({
  //     height: this.element.clientHeight,
  //     width: this.element.clientWidth
  //   });
  // }

  /**
   * 绑定快捷键
   */
  // bindKeyboard = () => {
  //   if (!this._bindKeyboard) {
  //     this._bindKeyboard = true;
  //     Object.keys(this.keyboardMap).forEach(key => {
  //       Keyboard.bind(key, this.keyboardMap[key]);
  //     });
  //   }
  // };

  /**
   * 解绑键盘操作
   */
  // unBindKeyboard = () => {
  //   if (this._bindKeyboard) {
  //     Object.keys(this.keyboardMap).forEach(key => {
  //       Keyboard.unbind(key, this.keyboardMap[key]);
  //     });
  //     this._bindKeyboard = false;
  //   }
  // };


  /**
   * 快捷键映射
   */
    // keyboardMap = {
    // 'left': e => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //
    // },
    // 'right': e => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //
    // },
    // 'top': e => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //
    // },
    // 'down': e => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //
    // },
    // };

  onResize = () => {
    this[MOUNTED] && this.setState({
      height: this.element.clientHeight,
      width: this.element.clientWidth
    });
  };

  componentDidUpdate() {
    console.timeEnd('render');
  }

  // componentWillReceiveProps(nextProps) {
  //   if (
  //     (nextProps.lectureList !== this.props.lectureList) ||
  //     (nextProps.roomList !== this.props.roomList) ||
  //     (nextProps.periodList !== this.props.periodList)
  //   ) {
  //     const lectureList = nextProps.lectureList || this.props.roomList;
  //     const roomList = nextProps.roomList || this.props.roomList;
  //     const periodList = nextProps.periodList || this.props.periodList;
  //
  //     if (lectureList && roomList && periodList) {
  //       console.log(lectureList, roomList, periodList);
  //     }
  //   }
  // }


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
    });
  };

  onWheel = e => {
    const {deltaX, deltaY} = e;
    const {scrollOffset} = this.state;
    const {lectureWidth, lectureHeight} = this;
    this.setState({
      showScrollbar: true,
      scrollOffset: new Point(
        Math.min(lectureWidth, Math.max(scrollOffset.x + deltaX, 0)),
        Math.min(lectureHeight, Math.max(scrollOffset.y + deltaY, 0)))
    }, () => {
      clearTimeout(this[WHEEL]);
      this[WHEEL] = setTimeout(() => {
        this[MOUNTED] && this.setState({showScrollbar: false});
      }, 2000);
    });
    e.preventDefault();
    e.stopPropagation();
  };

  onMouseDown = e => {
    const {clientX, clientY} = e;
    const {scrollOffset} = this.state;
    this[START_MOVE] = {clientOffset: new Point(clientX, clientY), scrollOffset};
  };
  onMouseMove = e => {
    if (this[START_MOVE]) {
      const {clientOffset, scrollOffset} = this[START_MOVE];
      const x = e.clientX - clientOffset.x;
      const y = e.clientY - clientOffset.y;
      const {lectureWidth, lectureHeight} = this;
      this.setState({
        showScrollbar: true,
        scrollOffset: new Point(
          Math.min(lectureWidth, Math.max(scrollOffset.x - x, 0)),
          Math.min(lectureHeight, Math.max(scrollOffset.y - y, 0))
        )
      });
    }
  };
  onMouseUp = e => {
    if (this[START_MOVE]) {
      const {clientOffset, scrollOffset} = this[START_MOVE];
      const x = e.clientX - clientOffset.x;
      const y = e.clientY - clientOffset.y;
      const {lectureWidth, lectureHeight} = this;
      this.setState({
        showScrollbar: false,
        scrollOffset: new Point(
          Math.min(lectureWidth, Math.max(scrollOffset.x - x, 0)),
          Math.min(lectureHeight, Math.max(scrollOffset.y - y, 0))
        )
      });
      delete this[START_MOVE];
    }
  };


  render() {
    console.time('render');
    const {
      periodList = [],
      roomList = [],
      lectureList = [],
      gradeList = [],
      dispatch,
    } = this.props;
    const {width, height, selectedLecture, gradeId, selection, scrollOffset} = this.state;
    const weekWidth = 30;
    const periodWidth = 40;
    const headerWidth = weekWidth + periodWidth;
    const headerHeight = 45;
    const viewPortWidth = width - headerWidth;
    const viewPortHeight = height - headerHeight;

    const stdWidth = Math.max(90, viewPortWidth / Math.floor(viewPortWidth / 90));
    const stdHeight = Math.max(90, viewPortHeight / Math.floor(viewPortHeight / 90));

    const viewRowCount = Math.floor(viewPortHeight / stdHeight);
    const viewColCount = Math.floor(viewPortWidth / stdWidth);
    const viewStartRow = Math.floor(scrollOffset.y / stdHeight);
    const viewStartCol = Math.floor(scrollOffset.x / stdWidth);

    this.lectureWidth = stdWidth * roomList.length - viewPortWidth;
    this.lectureHeight = stdHeight * periodList.length - viewPortHeight;

    const roomIndexMap = {};
    const roomMap = {};

    const renderRoomList = ((list = []) => {
      return list.map((room, index) => {
        const style = {left: index * stdWidth, width: stdWidth, height: headerHeight, top: 0};
        roomIndexMap[room.id] = index;
        roomMap[index] = room;
        return (
          <span data-id={room.id} className={styles['room']} key={room.id} style={style}>{room.name}</span>);
      });
    })(roomList);
    const roomListStyle = {
      top: 0, left: headerWidth, width: roomList.length * stdWidth, height: headerHeight,
      transform: `translateX(${-scrollOffset.x}px)`,
    };

    const periodIndexMap = {};
    const periodMap = {};

    const renderPeriodList = ((list = []) => {
      const weekPeriod = list.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.timeslot - b.timeslot).reduce((map, it) => {
        const week = map[it.dayOfWeek] || [];
        week.push(it);
        map[it.dayOfWeek] = week;
        return map;
      }, {});
      const weekComponents = [];
      const WEEK = ['一', '二', '三', '四', '五', '六', '日'];
      let weekTop = 0;
      let periodTop = 0;
      const periodComponents = [];
      let periodIndex = 0;
      Object.keys(weekPeriod).forEach(key => {
        const periods = weekPeriod[key];
        const week = WEEK[key];
        const weekHeight = periods.length * stdHeight;
        const weekStyle = {
          height: weekHeight,
          top: weekTop,
          width: weekWidth,
          left: 0
        };
        weekTop += weekHeight;
        weekComponents.push(
          <span className={styles['week']} key={key} style={weekStyle}>{`星期${week}`}</span>
        );

        periods.forEach(period => {
          const periodStyle = {
            top: periodTop,
            left: 0,
            width: periodWidth,
            height: stdHeight,
          };
          periodComponents.push(
            <span className={styles['period']} key={period.id}
                  style={periodStyle}>{`第${period.timeslot + 1}节`}</span>
          );
          periodTop += stdHeight;
          periodIndexMap[period.id] = periodIndex;
          periodMap[periodIndex] = period;
          periodIndex++;
        });
      });

      return {weekComponents, periodComponents};
    })(periodList);
    const periodListStyle = {
      width: periodWidth,
      height: periodList.length * stdHeight,
      top: headerHeight,
      left: weekWidth,
      transform: `translateY(${-scrollOffset.y}px)`,
    };
    const weekListStyle = {
      width: weekWidth, top: headerHeight, left: 0, height: periodList.length * stdHeight,
      transform: `translateY(${-scrollOffset.y}px)`,
    };

    const contains = (range, rect2) => {
      const {start, end} = range;
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(start.x - end.x);
      const h = Math.abs(start.y - end.y);
      return new Rect(x, y, w, h).isOverlap(rect2);
    };

    const renderLectureList = ((list) => {
      const table = {};
      const viewEndCol = Math.min(viewStartCol + viewColCount, roomList.length - 1);
      const viewEndRow = Math.min(viewStartRow + viewRowCount, periodList.length - 1);

      // const range = selection.getRange();
      //
      // console.log(JSON.stringify(range), scrollOffset.x, scrollOffset.y);

      list.forEach(it => {
        const col = roomIndexMap[it.room.id];

        if (col >= viewStartCol && col <= viewEndCol) {
          const row = periodIndexMap[it.period.id];

          if (row >= viewStartRow && row <= viewEndRow) {
            const style = {
              left: col * stdWidth,
              top: row * stdHeight,
              width: stdWidth,
              height: stdHeight,
            };
            const key = `${row}-${col}`;
            table[key] = (
              <Lecture key={key} style={style} lecture={it}
                       selected={selectedLecture && selectedLecture.id === it.id}
                // selected={contains(range, style)}
                       onClick={(lecture) => {
                         gradeId && this.setState({selectedLecture: lecture});
                       }}
                       onEdit={(lecture) => {
                         gradeId && this.setState({selectedLecture: lecture, lectureModalVisible: true})
                       }}
              />
            )
          }
        }
      });
      for (let col = viewStartCol; col <= viewEndCol; col++) {
        for (let row = viewStartRow; row <= viewEndRow; row++) {
          const key = `${row}-${col}`;
          if (!table[key]) {
            const style = {
              left: col * stdWidth,
              top: row * stdHeight,
              width: stdWidth,
              height: stdHeight,
            };
            table[key] = (
              <Lecture key={key} style={style}
                       lecture={{period: periodMap[row], room: roomMap[col], id: key}}
                // selected={contains(range, style)}
                       selected={selectedLecture && selectedLecture.id === key}
                       onClick={(lecture) => {
                         gradeId && this.setState({selectedLecture: lecture});
                       }}
                       onEdit={(lecture) => {
                         gradeId && this.setState({selectedLecture: lecture, lectureModalVisible: true})
                       }}
              />
            )
          }
        }
      }
      return Object.keys(table).map(key => table[key]);
    })(lectureList);


    const lectureListStyle = {
      top: headerHeight,
      left: headerWidth,
      width: roomList.length * stdWidth,
      height: periodList.length * stdHeight,
      transform: `translateX(${-scrollOffset.x}px) translateY(${-scrollOffset.y}px)`,
    };

    const buttons = [];

    if (selectedLecture && gradeId) {
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
              payload: {id: selectedLecture.id},
              resolve: () => {
                notification.success({
                  message: '删除成功'
                })
              }
            })
          }
        })
      }
    }
    if (gradeId) {
      buttons.push({
        key: 'refresh', children: '刷新', onClick: () => {
          this.props.dispatch({
            type: namespace + '/list',
            payload: {
              gradeId,
              s: 10000,
            }
          });
        }
      });
    }


    return (
      <Flex direction="column">
        <Flex align="middle" style={{height: 50, padding: '5px 10px', background: '#eee',}}>
          <Form layout="inline">
            <Form.Item label="年级">
              <Select placeholder="请选择" onChange={this.onGradeChange} style={{width: 120}}>
                {
                  gradeList.map(it =>
                    <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                  )
                }
              </Select>
            </Form.Item>
          </Form>
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
        </Flex>

        <div id={this.id} className={styles['timetable']}
             onWheel={this.onWheel}
             onMouseMove={this.onMouseMove}
             onMouseUp={this.onMouseUp}>
          <div className={classnames(styles['header'], {[styles['show-scrollbar']]: this.state.showScrollbar})}
               onMouseEnter={() => {
                 clearTimeout(this[WHEEL]);
                 if (!this.state.showScrollbar) {
                   this[MOUNTED] && this.setState({showScrollbar: true});
                 }
               }}
               onMouseLeave={() => {
                 clearTimeout(this[WHEEL]);
                 this[WHEEL] = setTimeout(() => {
                   if (this.state.showScrollbar) {
                     this[MOUNTED] && this.setState({showScrollbar: false});
                   }
                 }, 3000);
               }}
          >
            <div className={styles['header-box']}>
                 <span className={styles['header-period']} onClick={() => {
                   this.setState({scrollOffset: new Point(scrollOffset.x, 0)})
                 }}>星期</span>
              <span className={styles['header-room']} onClick={() => {
                this.setState({scrollOffset: new Point(0, scrollOffset.y)})
              }}>教室</span>
            </div>

            {
              roomListStyle.width > viewPortWidth ?
                <Scrollbar direction="horizontal"
                           style={{width: viewPortWidth, left: headerWidth, height: 12, top: height - 12}}
                           size={viewPortWidth}
                           maxValue={roomListStyle.width - viewPortWidth}
                           value={scrollOffset.x}
                           onChange={value => {
                             this.setState({
                               scrollOffset: new Point(
                                 Math.min(this.lectureWidth, Math.max(value, 0)),
                                 scrollOffset.y
                               )
                             })
                           }}
                />
                :
                null

            }
            {
              periodListStyle.height > viewPortHeight ?
                <Scrollbar direction="vertical"
                           size={viewPortHeight}
                           maxValue={periodListStyle.height - viewPortHeight}
                           value={scrollOffset.y}
                           style={{width: 12, left: width - 12, height: viewPortHeight, top: headerHeight}}
                           onChange={value => {
                             this.setState({
                               scrollOffset: new Point(
                                 scrollOffset.x,
                                 Math.min(this.lectureHeight, Math.max(value, 0)),
                               )
                             })
                           }}
                />
                :
                null
            }
            <div className={styles['room-list']} style={roomListStyle} onMouseDown={this.onMouseDown}>
              {renderRoomList}
            </div>
            <div className={styles['week-list']} style={weekListStyle} onMouseDown={this.onMouseDown}>
              {renderPeriodList.weekComponents}
            </div>
            <div className={styles['period-list']} style={periodListStyle} onMouseDown={this.onMouseDown}>
              {renderPeriodList.periodComponents}
            </div>
          </div>


          <div id={this.id + '-view-port'} className={styles['lecture-list']} style={lectureListStyle}
               onMouseDown={(e) => {
                 const {clientX, clientY} = e;
                 let {x, y} = this.viewport.getBoundingClientRect();
                 x = clientX - x + scrollOffset.x;
                 y = clientY - y + scrollOffset.y;
                 this[START_SELECT] = new Point(x, y);
               }}
               onMouseMove={(e) => {
                 if (this[START_SELECT]) {
                   const {clientX, clientY} = e;
                   let {x, y} = this.viewport.getBoundingClientRect();
                   x = clientX - x + scrollOffset.x;
                   y = clientY - y + scrollOffset.y;
                   this.setState({selection: new Selection(this[START_SELECT], new Point(x, y))});
                 }
               }}
               onMouseUp={e => {
                 if (this[START_SELECT]) {
                   const {clientX, clientY} = e;
                   let {x, y} = this.viewport.getBoundingClientRect();
                   x = clientX - x + scrollOffset.x;
                   y = clientY - y + scrollOffset.y;
                   this.setState({selection: new Selection(this[START_SELECT], new Point(x, y))});
                   delete this[START_SELECT];
                 }
               }}
          >
            {renderLectureList}
          </div>

        </div>
        <LectureModal
          visible={this.state.lectureModalVisible}
          lecture={this.state.selectedLecture}
          gradeId={this.state.gradeId}
          klassList={this.props.klassList}
          courseList={this.props.courseList}
          onCancel={() => this.setState({lectureModalVisible: false})}
          onOk={payload => {
            payload.gradeId = this.state.gradeId;
            payload.roomId = this.state.selectedLecture.room.id;
            payload.periodId = this.state.selectedLecture.period.id;
            if (typeof  this.state.selectedLecture.id === 'number') {
              payload.id = this.state.selectedLecture.id
            }
            console.log(
              payload,
              this.state.selectedLecture
            );
            this.props.dispatch({
              type: namespace + (payload.id ? '/modify' : '/create'),
              payload,
              resolve: () => {
                notification.success({
                  message: payload.id ? '修改成功' : '创建成功'
                })
              }
            });
            this.setState({lectureModalVisible: false})
          }}
        />
      </Flex>
    );
  }


}


function Lecture(props) {
  const {
    className, children, style,
    onEdit, onClick, lecture, selected
  } = props;
  const {
    id, type, course, room, teacher, reserveName,
    klass, available, status, memo,
  } = lecture;
  const _props = {
    style,
    className: classnames(styles['lecture'], className, {
      [styles[`lecture-klass-type-${klass && klass.type}`]]: klass && klass.type && course && course.id !== 'reserve',
      [styles[`lecture-course-${course && course.code}`]]: course,
      [styles[`lecture-available`]]: available,
      [styles[`lecture-selected`]]: selected
    })
  };
  return (
    <span data-id={id} {..._props} onClick={() => onClick(lecture)} onContextMenu={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onEdit(lecture)
    }}>
          <div className={styles['lecture-border']}>
          {
            course && klass && klass.type === 1 ?
              <div className={styles['lecture-course']}>{course.name}</div>
              :
              null
          }
            {reserveName ? <div className={styles['lecture-course']}>{reserveName}</div> : null}
            {
              klass ?
                <div
                  className={
                    classnames(styles['lecture-klass'], {
                        [styles['lecture-course']]: klass.type !== 1
                      }
                    )
                  }>
                  {klass.name}
                </div>
                :
                null
            }
            {teacher ? <div className={styles['lecture-teacher']}>{teacher.name}</div> : null}
            {children}
          </div>
          </span>
  )
}

class Scrollbar extends Component {


  onMouseMove = (e) => {
    if (this[START_MOVE]) {
      const {clientX, clientY} = e;
      const {clientOffset: {x, y}, value, maxValue, direction, size, thumbSize} = this[START_MOVE];
      const {onChange} = this.props;
      const cx = clientX - x;
      const cy = clientY - y;
      if (direction === 'horizontal') {
        onChange && onChange(cx / (size - thumbSize) * maxValue + value);
      } else {
        onChange && onChange(cy / (size - thumbSize) * maxValue + value);
      }
    }
  };
  onMouseUp = (e) => {
    if (this[START_MOVE]) {
      const {clientX, clientY} = e;
      const {clientOffset: {x, y}, value, maxValue, direction, size, thumbSize} = this[START_MOVE];
      const {onChange} = this.props;
      const cx = clientX - x;
      const cy = clientY - y;
      if (direction === 'horizontal') {
        onChange && onChange(cx / (size - thumbSize) * maxValue + value);
      } else {
        onChange && onChange(cy / (size - thumbSize) * maxValue + value);
      }
      delete this[START_MOVE];
    }
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  render() {
    const {direction = 'horizontal', style, maxValue, value, size} = this.props;
    const thumbSize = Math.max(size / maxValue * size / 2, 200);
    const _value = value / maxValue * (size - thumbSize);
    const _props = {
      style,
      className: classnames(styles['scrollbar'], styles['scrollbar-' + direction])
    };
    const thumbStyle = {};
    if (direction === 'horizontal') {
      thumbStyle.width = thumbSize;
      thumbStyle.transform = `translateX(${_value}px)`;
    } else {
      thumbStyle.height = thumbSize;
      thumbStyle.transform = `translateY(${_value}px)`;
    }
    const thumbProps = {
        className: styles['scrollbar-thumb'],
        style: thumbStyle,
        onMouseDown: (e) => {
          const {clientX, clientY} = e;
          document.addEventListener('mousemove', this.onMouseMove);
          document.addEventListener('mouseup', this.onMouseUp);
          this[START_MOVE] = {clientOffset: new Point(clientX, clientY), value, maxValue, direction, size, thumbSize};
        }
      }
    ;
    return (
      <div {..._props}>
        <div {...thumbProps}/>
      </div>
    )
  }
}


@Form.create({
  mapPropsToFields: (props) => {
    return {
      klassId: Form.createFormField({value: props.lecture && props.lecture.klass && props.lecture.klass.id || undefined}),
      courseId: Form.createFormField({value: props.lecture && props.lecture.course && props.lecture.course.id || undefined}),
      teacherId: Form.createFormField({value: props.lecture && props.lecture.teacher && props.lecture.teacher.id || undefined}),
      reserveName: Form.createFormField({value: props.lecture && props.lecture.reserveName || undefined}),
    }
  }
})
@connect(state => ({
  teacherList: state[ManagesTeacher].list,
}))
class LectureModal extends Component {

  state = {};

  fetchTeacherList = (courseId) => {
    this.props.dispatch({
      type: ManagesTeacher + '/list',
      payload: {
        gradeId: this.props.gradeId,
        courseId,
        s: 10000,
      }
    });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.lecture && nextProps.lecture !== this.props.lecture) {
      if (nextProps.lecture.course && nextProps.lecture.course.id) {
        this.fetchTeacherList(nextProps.lecture.course.id);
        this.setState({courseId: nextProps.lecture.course.id});
      } else {
        this.setState({courseId: null});
      }
    }
  }

  render() {
    const {
      visible, onCancel, onOk, lecture,
      klassList = [], courseList = [], teacherList = [],
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;

    const selectStyle = {width: '100%'};

    const wrapper = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    };

    return (
      <Modal title={lecture && typeof lecture.id === 'number' ? "修改课表" : '创建课表'} visible={visible} onCancel={onCancel}
             onOk={() => {
               validateFieldsAndScroll((errors, payload) => {
                 if (errors) {
                   console.error(errors)
                 } else {
                   if (payload.reserveName) {
                     delete payload.courseId;
                     delete payload.teacherId;
                   }
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
              getFieldDecorator('courseId', {})(
                <Select placeholder="请选择" onChange={(courseId) => {

                  this.setState({courseId});
                  this.fetchTeacherList(courseId);

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
                    this.state.courseId && teacherList.map(it =>
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
                <Input placeholder="如果是班会、自修"/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
