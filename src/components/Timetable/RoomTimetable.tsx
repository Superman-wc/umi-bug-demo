import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {BaseComponentProps, ICustomRender, IEvent, INow, IRoomWeekLectures, WEEK} from "./interface";
import WeekOfDate from "./WeekOfDate";
import Timeslot from "./Timeslot";
import RoomWeekLecture from "./RoomWeekLecture";
import './style/RoomTimetable.less';

export interface BaseRoomTimetableProps {
  roomWeekLectures?: Array<IRoomWeekLectures>;
  now?: INow,
  maxDayOfWeek?: number,
  maxTimelot?: number
}

export type RoomTimetableProps = BaseRoomTimetableProps & BaseComponentProps & IEvent & ICustomRender;

export default class RoomTimetable extends Component<RoomTimetableProps, any> {
  static propTypes = {
    roomWeekLectures: PropTypes.array,
    now: PropTypes.object,
    maxDayOfWeek: PropTypes.number,
    maxTimelot: PropTypes.number,

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
    maxDayOfWeek: 6,
    maxTimelot: 8
  };

  render() {
    const {
      roomWeekLectures, now, maxDayOfWeek = 6, maxTimelot = 8,
      prefixCls, className, style, children,
      ...lectureProps
    } = this.props;

    const props = {
      style,
      className: classnames(prefixCls, className)
    };
    const headerClassName = `${prefixCls}-header`;


    const WeekOfDatesProps = {
      weekClassName: `${prefixCls}-header-week`,
      timeslotListClassName: `${prefixCls}-header-timeslot-list`,
      now,
      prefixCls,
      maxDayOfWeek,
      maxTimelot,
    };

    return (
      <div {...props}>
        <div className={headerClassName}>
          <div>星期 \ 教室</div>
          <WeekOfDates {...WeekOfDatesProps}  />
        </div>
        <RoomWeekLecture roomWeekLectures={roomWeekLectures} {...lectureProps} />
        {children}
      </div>
    )
  }
}

function WeekOfDates({maxDayOfWeek = 6, maxTimelot = 8, now, prefixCls}): JSX.Element {
  console.log('maxDayOfWeek=', maxDayOfWeek, 'maxTimelot=', maxTimelot);
  const components: Array<JSX.Element> = [];
  const weekClassName = `${prefixCls}-header-week`;
  const timeslotListClassName = `${prefixCls}-header-timeslot-list`;
  for (let dayOfWeek = 0; dayOfWeek <= maxDayOfWeek; dayOfWeek++) {
    const week = WEEK[dayOfWeek];
    components.push(
      <div key={week} className={weekClassName}>
        <WeekOfDate index={dayOfWeek} now={now}/>
        <div className={timeslotListClassName}>
          <Timeslot count={maxTimelot + 1}/>
        </div>
      </div>
    )
  }
  return (<Fragment>{components}</Fragment>)
}


