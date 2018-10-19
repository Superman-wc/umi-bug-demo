import React, {Fragment, Component} from 'react';
import classnames from "classnames";
import {Menu, Dropdown, Tooltip} from 'antd';
import Flex from '../Flex';
import styles from './index.less';

const StatusEnum = {
  1: '正常',
  2: '已换课',
  3: '已代课',
  4: '已取消'
};

export default class TimetableCell extends Component {
  render() {
    const {
      id, type, reserveName, course, room, teacher,
      klass, children, isHeader, available,
      renderTeacher = teacher => teacher.name,
      renderCourse = course => course.name,
      swapStart, swap, swapEnd,
      status, memo
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
      draggable: swap && type === 1,
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
                  <div className={styles['timetable-cell-course']}>
                    {renderCourse(course, this.props, id)}
                    {
                      status !== 1 ?
                        <span
                          className={
                            classnames(
                              styles['lecture-status'],
                              styles['lecture-status-' + status]
                            )}
                        >
                          {
                            status === 4 && memo ?
                              <Tooltip title={memo}>
                                <span>{StatusEnum[status]}</span>
                              </Tooltip>
                              :
                              StatusEnum[status]
                          }
                          </span>
                        :
                        ''
                    }
                  </div>
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
