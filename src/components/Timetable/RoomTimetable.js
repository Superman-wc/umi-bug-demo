import React, {Fragment, Component} from 'react';
import classnames from 'classnames';
import WeekOfDate from './WeekOfDate';
import styles from './index.less';


export default class RoomTimetable extends Component {

  render() {
    const {data, now} = this.props;
    return (
      <div className={styles['room-timetable']}>
        <div className={styles['room-timetable-header']}>
          <div className={styles['week']}>星期 \ 教室</div>
          {
            ['一', '二', '三', '四', '五', '六', '日'].map((it, index) =>
              <div className={styles['week-item']} key={index}>
                <WeekOfDate {...{now, index}} />
                <div className={styles['timesolt']}>
                  {
                    [1, 2, 3, 4, 5, 6, 7, 8, 9].map(it =>
                      <div key={'timesolt-' + it}>第{it}节</div>
                    )
                  }
                </div>
              </div>
            )
          }
        </div>
        {
          data.map(room =>
            <div key={room.id} className={styles['room-column']}>
              <div className={styles['room']}>{room.name}</div>
              {
                room.timetable && room.timetable.data && room.timetable.data.map((lectures, index) =>
                  <div key={[room.id, index].join('-')} className={styles['room-week']}>
                    {
                      lectures.map(lecture =>
                        <div key={lecture.id} className={styles['lecture']}>
                          {
                            lecture.klass ?
                              <div>{lecture.klass.name}</div>
                              :
                              null
                          }
                          {
                            lecture.teacher ?
                              <div>{lecture.teacher.name}</div>
                              :
                              null
                          }
                        </div>
                      )
                    }
                  </div>
                )
              }

            </div>
          )
        }
      </div>
    )
  }
}
