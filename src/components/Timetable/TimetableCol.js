import React from 'react';
import classnames from "classnames";
import Flex from '../Flex';
import TimetableCell from './TimetableCell';
import styles from './index.less';

export default function TimetableCol({data = [], week, isHeader, renderTeacher, renderCourse, swapAvailable, swap}) {
  const cellProps = {
    renderTeacher,
    renderCourse,
    swapAvailable,
    swap
  };
  return (
    <Flex isItem direction="column"
          className={classnames(styles['timetable-col'], {[styles['timetable-col-header']]: isHeader})}>
      <TimetableCell isHeader>{week}</TimetableCell>
      {
        data.map(it =>
          <TimetableCell key={it.id} {...it} {...cellProps}/>
        )
      }
    </Flex>
  )
}
