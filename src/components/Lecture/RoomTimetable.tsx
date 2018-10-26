import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {BaseComponentProps, ICustomRender, IEvent, INow, IRoomWeekLectures, WEEK} from "./interface";
import WeekOfDate from "./WeekOfDate";
import Timeslot from "./Timeslot";
import RoomWeekLecture from "./RoomWeekLecture";
import './style/RoomTimetable.less';

export interface BaseRoomTimetableProps {
  roomWeekLectures?: Array<IRoomWeekLectures>;
  now?: INow
}

export type RoomTimetableProps = BaseRoomTimetableProps & BaseComponentProps & IEvent & ICustomRender;

export default class RoomTimetable extends Component<RoomTimetableProps, any> {
  static propTypes = {
    roomWeekLectures: PropTypes.array,
    now: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    prefixCls: PropTypes.string,

    renderCourse: PropTypes.func,
    renderTeacher: PropTypes.func,
    renderKlass: PropTypes.func,
    renderRoom: PropTypes.func,

    draggable: PropTypes.bool,
    onDragStart: PropTypes.func,
    onDragOver: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDrop: PropTypes.func,
  };

  static defaultProps = {
    prefixCls: 'room-timetable-wrapper',
  };

  render() {
    const {
      roomWeekLectures, now,
      prefixCls, className, style, children,
      ...lectureProps
    } = this.props;

    const props = {
      style,
      className: classnames(prefixCls, className)
    };
    const headerClassName = `${prefixCls}-header`;
    const weekClassName = `${prefixCls}-header-week`;
    const timeslotListClassName = `${prefixCls}-header-timeslot-list`;
    return (
      <div {...props}>
        <div className={headerClassName}>
          <div>星期 \ 教室</div>
          {
            WEEK.map((week, index) =>
              <div key={week} className={weekClassName}>
                <WeekOfDate index={index} now={now}/>
                <div className={timeslotListClassName}>
                  <Timeslot count={9}/>
                </div>
              </div>
            )
          }
        </div>
        <RoomWeekLecture roomWeekLectures={roomWeekLectures} {...lectureProps} />
        {children}
      </div>
    )
  }
}


