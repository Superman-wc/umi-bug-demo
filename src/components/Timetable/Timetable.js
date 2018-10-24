import React, {Fragment, Component} from 'react';
import Flex from '../Flex';
import WeekOfDate from './WeekOfDate';
import TimetableCol from './TimetableCol';

import styles from './index.less';

export default class Timetable extends Component {

  state = {};

  render() {

    const {
      data = [], timeslot, now, renderTeacher, renderCourse, swapStart, swap, swapEnd,
    } = this.props;

    return (
      <Fragment>
        <Flex className={styles['timetable']}>
          <TimetableCol data={timeslot} isHeader/>
          {
            data.map((it, index) =>
              <TimetableCol
                key={it.id} data={it}
                week={<WeekOfDate {...{now, index}} />}
                renderTeacher={renderTeacher}
                renderCourse={renderCourse}
                swapStart={swapStart}
                swap={swap}
                swapEnd={swapEnd}
              />
            )
          }
        </Flex>
        {this.props.children}
      </Fragment>
    )
  }
}
