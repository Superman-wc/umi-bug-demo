import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {IEvent, ILecture, BaseComponentProps, ICustomRender, StatusEnum} from "./interface";
import LectureStatus from './LectureStatus';
import './style/Lecture.less';


export interface BaseLectureProps {
  lecture: ILecture;
}

export type LectureProps = BaseLectureProps & BaseComponentProps & IEvent & ICustomRender;

export default class Lecture extends Component<LectureProps, any> {

  static propTypes = {
    lecture: PropTypes.object,

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
    onSelect: PropTypes.func,

  };

  static defaultProps = {
    prefixCls: 'lecture-wrapper',
  };

  render(): JSX.Element {

    const {
      prefixCls, className, style, children,
      lecture,
      draggable, onDragStart, onDragOver, onDragEnd, onDrop, onSelect,
    } = this.props;

    const {
      id, type, course, room, teacher,
      klass, available, status, memo, selected
    } = lecture;

    const teacherClassName = `${prefixCls}-teacher`;
    const courseClassName = `${prefixCls}-course`;
    const roomClassName = `${prefixCls}-room`;
    const klassClassName = `${prefixCls}-klass`;

    const {
      renderTeacher = teacher => <Fragment>教师：{teacher.name}</Fragment>,
      renderCourse = course => <Fragment>{course.name}</Fragment>,
      renderRoom = room => <Fragment>教室：{room.name}</Fragment>,
      renderKlass = klass => <Fragment>班级：{klass.name}</Fragment>,
    } = this.props;

    const props = {
      id: id.toString(),
      style,
      className: classnames(prefixCls, className, {
        [`${prefixCls}-klass-type-${klass && klass.type}`]: klass && klass.type && course && course.id !== 'reserve',
        [`${prefixCls}-course-${course && course.code}`]: course,
        [`${prefixCls}-available`]: available,
        [`${prefixCls}-selected`]: selected
      }),
      draggable: draggable && type === 1,
      onDragStart, onDragOver, onDragEnd, onDrop,
      onClick: () => {
        onSelect && onSelect(lecture)
      }
    };

    return (
      <div {...props}>
        <div className="lecture">
          {course ? <div className={courseClassName}>{renderCourse(course, lecture)}</div> : null}
          {status === StatusEnum.正常 ? null : <LectureStatus status={status} memo={memo} prefixCls={prefixCls}/>}
          {klass ? <div className={klassClassName}>{renderKlass(klass, lecture)}</div> : null}
          {room ? <div className={roomClassName}>{renderRoom(room, lecture)}</div> : null}
          {teacher ? <div className={teacherClassName}>{renderTeacher(teacher, lecture)}</div> : null}
          {children}
        </div>
      </div>
    )
  }
}
