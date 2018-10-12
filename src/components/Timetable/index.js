import React, {Fragment} from 'react';
import {routerRedux} from 'dva/router';
import classnames from "classnames";
import {Radio, Icon} from 'antd';
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


export function Timetable({data = [], timeslot, now}) {
  return (
    <Flex className={styles['timetable']}>
      <TimetableCol data={timeslot} isHeader/>
      {
        data.map((it, index) =>
          <TimetableCol key={it.id} data={it} week={<WeekOfDate {...{now, index}} />}/>
        )
      }
    </Flex>
  )
}

function WeekOfDate({now, index}) {
  const week = WEEK[index];
  const {startTime} = now || {};
  const date = new Date(startTime + 3600 * 1000 * 24 * index);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return (
    <div style={{lineHeight: 1.5}}>
      <div>{week}</div>
      <div>{`${m}月${d}日`}</div>
    </div>
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

export function WeekIndex({value}) {
  const [, year, week] = value.toString().match(/(^\d{4})(\d{1,2}$)/);
  return (
    <span><span>{year}年</span><span>第{week}周</span></span>
  )
}

export function Calendar({next, now, previous, dispatch, pathname, query}) {
  return (
    <Flex className={styles['calendar']}>
      <div className={styles['previous']} title="查看上一周" onClick={() => {
        dispatch(routerRedux.replace({pathname, query: {...query, weekIndex: previous.weekIndex}}));
      }}><Icon type="left" theme="outlined" /><WeekIndex value={previous && previous.weekIndex}/></div>
      <Flex.Item className={styles['now']}><WeekIndex value={now && now.weekIndex}/></Flex.Item>
      <div className={styles['next']} title="查看下一周" onClick={() => {
        dispatch(routerRedux.replace({pathname, query: {...query, weekIndex: next.weekIndex}}));
      }}><WeekIndex value={next && next.weekIndex}/><Icon type="right" theme="outlined" /></div>
    </Flex>
  )
}
