import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {IEvent, ILecture, BaseComponentProps, ICustomRender} from "./interface";
import DateLecture from "./DateLecture";

export interface BaseWeekLectureProps {
  weekLectures?: Array<Array<ILecture>>;
}

export type WeekLectureProps = BaseWeekLectureProps & BaseComponentProps & IEvent & ICustomRender;

export default class WeekLecture extends Component<WeekLectureProps, any> {

  static propTypes = {
    weekLectures: PropTypes.array,

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
    prefixCls: 'week-date-lectures-wrapper',
  };

  render() {
    const {
      weekLectures,
      prefixCls, className, style, children,
      ...lectureProps
    } = this.props;
    const props = {
      style,
      className: classnames(prefixCls, className)
    };
    return (
      <div {...props}>
        {children}
        {
          weekLectures && weekLectures.length ?
            weekLectures.map((dateLectures, index) =>
              <DateLecture key={index} weekIndex={index} dateLectures={dateLectures} {...lectureProps}/>
            )
            :
            null
        }
      </div>
    )
  }
}
