import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {IEvent, IRoomWeekLectures, BaseComponentProps, ICustomRender} from "./interface";
import WeekLecture from "./WeekLecture";

export interface BaseRoomWeekLectureProps {
  roomWeekLectures?: Array<IRoomWeekLectures>;
}

export type RoomWeekLectureProps = BaseRoomWeekLectureProps & BaseComponentProps & IEvent & ICustomRender;

export default class RoomWeekLecture extends Component<RoomWeekLectureProps, any> {

  static propTypes = {
    roomWeekLectures: PropTypes.array,

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
    prefixCls: 'room-week-date-lectures-wrapper',
  };

  render() {
    const {
      roomWeekLectures,
      prefixCls, className, style, children,
      ...lectureProps
    } = this.props;
    const props = {
      style,
      className: classnames(prefixCls, className)
    };
    const roomClassName = `${prefixCls}-room`;
    return (
      <div {...props}>
        {children}
        {
          roomWeekLectures && roomWeekLectures.length ?
            roomWeekLectures.map(roomWeekLecture =>
              <WeekLecture key={roomWeekLecture.room.id} weekLectures={roomWeekLecture.weekLectures} {...lectureProps}>
                <div className={roomClassName}>{roomWeekLecture.room.name}</div>
              </WeekLecture>
            )
            :
            null
        }
      </div>
    )
  }
}
