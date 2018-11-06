import React, {Fragment, Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {BaseComponentProps, ICustomRender, IEvent, ILecture, INow,} from "./interface";
import Timeslot from "./Timeslot";
import DateLecture from "./DateLecture";
import WeekOfDate from "./WeekOfDate";
import './style/Timetable.less';

export type TimetableType = 'teacher' | 'student' | 'klass';

export interface BaseTimetableProps {
  weekLectures?: Array<Array<ILecture>>;
  now?: INow;
  type: TimetableType;
}

export type TimetableProps = BaseTimetableProps & BaseComponentProps & IEvent & ICustomRender;

export default class Timetable extends Component<TimetableProps, any> {
  static propTypes = {
    weekLectures: PropTypes.array,
    now: PropTypes.object,
    type: PropTypes.oneOf(['teacher', 'student', 'klass']),
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
    prefixCls: 'timetable-wrapper',
  };

  render() {
    const {
      weekLectures, now, type,
      prefixCls, className, style, children,
      ...lectureProps
    } = this.props;
    const props = {
      style,
      className: classnames(prefixCls, className, `${prefixCls}-type-${type}`)
    };
    const headerClassName = `${prefixCls}-header`;

    return (
      <div {...props}>
        <div className={headerClassName}>
          <div>节次 \ 星期</div>
          <Timeslot count={9}/>
        </div>
        {
          weekLectures && weekLectures.length ?
            weekLectures.map((dateLectures, index) =>
              <DateLecture key={index} dateLectures={dateLectures} weekIndex={index} {...lectureProps}>
                <WeekOfDate index={index} now={now}/>
              </DateLecture>
            )
            :
            null
        }
        {children}
      </div>
    )
  }
}
