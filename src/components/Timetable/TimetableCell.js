import React, {Fragment, Component} from 'react';
import classnames from "classnames";
import {Menu, Dropdown} from 'antd';
import Flex from '../Flex';
import styles from './index.less';

export default class TimetableCell extends Component {
  render() {
    const {
      id, type, reserveName, course, room, teacher,
      klass, children, isHeader, available,
      renderTeacher = teacher => teacher.name,
      renderCourse = course => course.name,
      swapStart, swap, swapEnd,
    } = this.props;
    const className = classnames(
      styles['timetable-cell'],
      course ? 'timetable-cell-course-' + course.id : null,
      {
        [styles['timetable-cell-header']]: isHeader,
        [styles['timetable-cell-available']]: available
      }
    );
    const draggable = {
      draggable: type === 1,
      onDragStart: e => {
        swapStart && swapStart(id);
        e.dataTransfer.setData("sourceId", id);

      },
      onDragOver: e => {
        if (available) {
          e.preventDefault();
        }
      },
      onDragEnd: (e) => {
        console.log(e);
        swapEnd && swapEnd();
      },
      onDrop: (e) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData("sourceId");
        console.log(sourceId, id);
        swap(sourceId, id);
      }
    };
    return (
      <Flex isItem direction="column" {...draggable} className={className}>
        {
          type === 1 ?
            <Fragment>
              {
                course ?
                  <div className={styles['timetable-cell-course']}>{renderCourse(course, this.props, id)}</div>
                  :
                  null
              }
              {
                room ?
                  <div>教室：{room.name}</div>
                  :
                  null
              }
              {
                teacher ?
                  <div>教师：{renderTeacher(teacher, this.props, id)}</div>
                  :
                  null
              }
              {
                klass ?
                  <div>班级：{klass.name}</div>
                  :
                  null
              }
              {children}
            </Fragment>
            :
            <Fragment>
              <div className={styles['timetable-cell-course']}>
                {reserveName}
              </div>
              {children}
            </Fragment>
        }
      </Flex>
    )
  }
}
