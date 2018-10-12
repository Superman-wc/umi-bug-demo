import React, {Fragment} from 'react';
import classnames from "classnames";
import {Radio} from 'antd';
import Flex from '../Flex';
import styles from './index.less';

export function transformTimetableList(list) {
  list.sort((a, b) => a.period.dayOfWeek - b.period.dayOfWeek || a.period.timeslot - b.period.timesolt);

  let maxDayOfWeek = -1;
  let maxTimeslot = -1;

  const timetable = list.reduce((table, it) => {

    const {dayOfWeek, timeslot} = it.period;
    const week = table[dayOfWeek] || [];
    week[timeslot] = it;
    table[dayOfWeek] = week;

    maxDayOfWeek = Math.max(dayOfWeek, maxDayOfWeek);
    maxTimeslot = Math.max(timeslot, maxTimeslot);

    return table;

  }, []);

  const timeslot = [];

  maxDayOfWeek = 6;
  maxTimeslot = 8;

  for (let i = 0; i <= maxDayOfWeek; i++) {
    if (!timetable[i]) {
      timetable[i] = [];
    }
    timetable[i].id = i;
    for (let j = 0; j <= maxTimeslot; j++) {
      if (!timetable[i][j]) {
        timetable[i][j] = {period: {dayOfWeek: i, timeslot: j}, id: `${i}-${j}`};

      }
      if (i === 0) {
        timeslot.push({children: `第${j + 1}节`, id: `第${j + 1}节`});
      }

    }
  }
  return {data: timetable, timeslot};
}

export function RadioSelector({style, className, title, options = [], defaultValue, onChange}) {
  return (
    <LabelBox className={className} style={style} title={title}>
      <Radio.Group defaultValue={defaultValue}
                   buttonStyle="solid"
                   className={classnames(styles['radio-group-buttons'], className)}
                   onChange={onChange}
      >
        {
          options.map(({name, id}) =>
            <Radio.Button key={id} value={id}>{name}#{id}</Radio.Button>
          )
        }
      </Radio.Group>
    </LabelBox>
  );
}

export function LabelBox({style, className, title, children}) {
  return (
    <Flex className={styles['label-box']} style={style}>
      {
        title ?
          <h3><span>{title}:</span></h3>
          :
          null
      }
      {children}
    </Flex>
  );
}


const WEEK = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];


export function Timetable({data = [], timeslot}) {
  return (
    <Flex className={styles['timetable']}>
      <TimetableCol data={timeslot} isHeader/>
      {
        data.map((it, index) =>
          <TimetableCol key={it.id} data={it} week={WEEK[index]}/>
        )
      }
    </Flex>
  )
}


export function TimetableCol({data = [], week, isHeader}) {
  return (
    <Flex isItem direction="column"
          className={classnames(styles['timetable-col'], {[styles['timetable-col-header']]: isHeader})}>
      <TimetableCell isHeader>{week}</TimetableCell>
      {
        data.map(it =>
          <TimetableCell key={it.id} {...it}/>
        )
      }
    </Flex>
  )
}


export function TimetableCell({id, type, reserveName, course, room, teacher, klass, children, isHeader}) {
  const className = classnames(
    styles['timetable-cell'],
    course ? 'timetable-cell-course-' + course.id : null,
    {
      [styles['timetable-cell-header']]: isHeader,
    }
  );
  return (
    <Flex isItem direction="column"
          className={className}>
      {
        type === 1 ?
          <Fragment>
            {
              course ?
                <div className={styles['timetable-cell-course']}>{course.name}#{course.id}</div>
                :
                null
            }
            {
              room ?
                <div>教室：{room.name}#{room.id}</div>
                :
                null
            }
            {
              teacher ?
                <div>教师：{teacher.name}#{teacher.id}</div>
                :
                null
            }
            {
              klass ?
                <div>班级：{klass.name}#{klass.id}</div>
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
