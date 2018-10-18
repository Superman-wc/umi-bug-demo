import React, {Fragment, Component} from 'react';
import {routerRedux} from 'dva/router';
import classnames from "classnames";
import {Radio, Icon, Menu, Dropdown, Modal, notification} from 'antd';
import Flex from '../Flex';
import WeekOfDate from './WeekOfDate';
import TimetableCol from './TimetableCol';
import SubstituteModal from './SubstituteModal';
import styles from './index.less';

export default class Timetable extends Component {

  state = {};

  render() {
    const {
      data = [], timeslot, now, renderTeacher, renderCourse, swapAvailable, swap,
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
                swapAvailable={swapAvailable}
                swap={swap}
              />
            )
          }
        </Flex>
        {this.props.children}
      </Fragment>
    )
  }
}
