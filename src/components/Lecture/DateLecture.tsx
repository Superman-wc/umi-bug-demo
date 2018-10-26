import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {IEvent, ILecture, BaseComponentProps, ICustomRender} from "./interface";
import Lecture from './Lecture';
import './style/DateLecture.less';

export interface BaseDateLectureProps {
  dateLectures?: Array<ILecture>;
  weekIndex: number;
}

export type DateLectureProps = BaseDateLectureProps & BaseComponentProps & IEvent & ICustomRender;

export default class DateLecture extends Component<DateLectureProps, any> {

  static propTypes = {
    dateLectures: PropTypes.array,
    weekIndex: PropTypes.number,

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
    prefixCls: 'date-lectures-wrapper',
  };

  render() {
    const {
      dateLectures, weekIndex,
      prefixCls, className, style, children,
      ...lectureProps
    } = this.props;
    const props = {
      style,
      className: classnames(prefixCls, className, `${prefixCls}-week-${weekIndex}`)
    };

    return (
      <div {...props}>
        {children}
        {
          dateLectures && dateLectures.length ?
            dateLectures.map(lecture =>
              <Lecture key={lecture.id} lecture={lecture} {...lectureProps} />
            )
            :
            null
        }
      </div>
    );
  }
}
