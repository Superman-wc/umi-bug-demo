import React, {Component} from 'react';
import classnames from 'classnames';
import styles from './CourseTable.less';
import Selection from './selection';
import Point from "./point";
import Scrollbar from './Scrollbar';
import {ILecture, IPeriod, IRoom, StatusEnum} from "./interface";
import LectureStatus from './LectureStatus';


const WHEEL = Symbol('wheel');
const START_MOVE = Symbol('start-move');
const MOUNTED = Symbol('mounted');
const ELEMENT = Symbol('element');

export type CourseTableProps = {
  periodList: IPeriod[];
  roomList: IRoom[];
  lectureList: ILecture[];
  gradeId: number;
  onSelect?: (lecture: ILecture) => void;
  onEdit?: (lecture: ILecture) => void;
  selectedLecture: ILecture;
  now?: { startTime: number };
  className?: string
}

export default class CourseTable extends Component<CourseTableProps, any> {

  state = {
    showScrollbar: false,
    scrollX: 0,
    scrollY: 0,
    width: 600,
    height: 585,
    selection: new Selection(),
    scrollOffset: new Point()
  };

  width = 600;
  height = 585;

  lectureWidth = 0;
  lectureHeight = 0;

  [ELEMENT] = React.createRef<HTMLDivElement>();


  componentDidMount() {
    this[MOUNTED] = true;
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    delete this[MOUNTED];
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    if (this[MOUNTED] && this[ELEMENT].current) {
      const element: HTMLElement = this[ELEMENT].current as HTMLElement;
      const {width, height} = element.getBoundingClientRect();
      if (this.state.width !== width || this.state.height !== height) {
        this.setState({width, height});
      }
    }
  };

  componentDidUpdate() {
    // console.timeEnd('render');
    this.onResize();
  }

  onWheel = e => {
    const {deltaX, deltaY} = e;
    const {scrollOffset} = this.state;
    const {lectureWidth, lectureHeight} = this;
    this.setState({
      showScrollbar: true,
      scrollOffset: new Point(
        Math.min(lectureWidth, Math.max(scrollOffset.x + deltaX, 0)),
        Math.min(lectureHeight, Math.max(scrollOffset.y + deltaY, 0)))
    }, () => {
      clearTimeout(this[WHEEL]);
      this[WHEEL] = setTimeout(() => {
        this[MOUNTED] && this.setState({showScrollbar: false});
      }, 2000);
    });
    e.preventDefault();
    e.stopPropagation();
  };
  onMouseDown = e => {
    const {clientX, clientY} = e;
    const {scrollOffset} = this.state;
    this[START_MOVE] = {clientOffset: new Point(clientX, clientY), scrollOffset};
  };
  onMouseMove = e => {
    if (this[START_MOVE]) {
      const {clientOffset, scrollOffset} = this[START_MOVE];
      const x = e.clientX - clientOffset.x;
      const y = e.clientY - clientOffset.y;
      const {lectureWidth, lectureHeight} = this;
      this.setState({
        showScrollbar: true,
        scrollOffset: new Point(
          Math.min(lectureWidth, Math.max(scrollOffset.x - x, 0)),
          Math.min(lectureHeight, Math.max(scrollOffset.y - y, 0))
        )
      });
    }
  };
  onMouseUp = e => {
    if (this[START_MOVE]) {
      const {clientOffset, scrollOffset} = this[START_MOVE];
      const x = e.clientX - clientOffset.x;
      const y = e.clientY - clientOffset.y;
      const {lectureWidth, lectureHeight} = this;
      this.setState({
        showScrollbar: false,
        scrollOffset: new Point(
          Math.min(lectureWidth, Math.max(scrollOffset.x - x, 0)),
          Math.min(lectureHeight, Math.max(scrollOffset.y - y, 0))
        )
      });
      delete this[START_MOVE];
    }
  };

  render() {
    // console.time('render');
    const {
      periodList = [],
      roomList = [],
      lectureList = [],
      gradeId,
      onSelect,
      onEdit,
      selectedLecture,
      now,
      className,
    } = this.props;
    const {width, height, scrollOffset} = this.state;

    const weekWidth = 30;
    const periodWidth = 40;
    const headerWidth = weekWidth + periodWidth;
    const headerHeight = 45;
    const viewPortWidth = width - headerWidth;
    const viewPortHeight = height - headerHeight;

    const stdWidth = Math.max(90, viewPortWidth / Math.floor(viewPortWidth / 90));
    const stdHeight = Math.max(90, viewPortHeight / Math.floor(viewPortHeight / 90));

    const viewRowCount = Math.floor(viewPortHeight / stdHeight);
    const viewColCount = Math.floor(viewPortWidth / stdWidth);
    const viewStartRow = Math.floor(scrollOffset.y / stdHeight);
    const viewStartCol = Math.floor(scrollOffset.x / stdWidth);

    // 这里要保证大于0
    this.lectureWidth = Math.max(stdWidth * roomList.length - viewPortWidth, 0);
    this.lectureHeight = Math.max(stdHeight * periodList.length - viewPortHeight, 0);

    const roomIndexMap = {};
    const roomMap = {};

    const renderRoomList = ((list = []) => {
      return list.map((room, index) => {
        const style = {left: index * stdWidth, width: stdWidth, height: headerHeight, top: 0};
        roomIndexMap[room.id] = index;
        roomMap[index] = room;
        return (
          <span data-id={room.id} className={styles['room']} key={room.id} style={style}>{room.name}</span>);
      });
    })(roomList);
    const roomListStyle = {
      top: 0, left: headerWidth, width: roomList.length * stdWidth, height: headerHeight,
      transform: `translateX(${-scrollOffset.x}px)`,
    };

    const periodIndexMap = {};
    const periodMap = {};

    const renderPeriodList = ((list = [], now) => {
      const weekPeriod = list.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.timeslot - b.timeslot).reduce((map, it) => {
        const week = map[it.dayOfWeek] || [];
        week.push(it);
        map[it.dayOfWeek] = week;
        return map;
      }, {});
      const weekComponents: JSX.Element[] = [];
      const WEEK = ['一', '二', '三', '四', '五', '六', '日'];
      let weekTop = 0;
      let periodTop = 0;
      const periodComponents: JSX.Element[] = [];
      let periodIndex = 0;
      Object.keys(weekPeriod).forEach(key => {
        const periods = weekPeriod[key];
        const week = WEEK[key];
        const weekHeight = periods.length * stdHeight;
        const weekStyle = {
          height: weekHeight,
          top: weekTop,
          width: weekWidth,
          left: 0
        };
        weekTop += weekHeight;
        let dateStr = '';
        if (now && now.startTime) {
          const date = new Date(now.startTime + 3600000 * 24 * parseInt(key, 10));
          const m = date.getMonth() + 1;
          const d = date.getDate();
          dateStr = `${m}月${d}日`;
        }
        weekComponents.push(
          <span className={styles['week']} key={key} style={weekStyle}>
            <span>{`星期${week}`}</span>
            {
              dateStr ?
                <span>{dateStr}</span>
                :
                null
            }
          </span>
        );

        periods.forEach(period => {
          const periodStyle = {
            top: periodTop,
            left: 0,
            width: periodWidth,
            height: stdHeight,
          };
          periodComponents.push(
            <span className={styles['period']} key={period.id}
                  style={periodStyle}>{`第${period.timeslot + 1}节`}</span>
          );
          periodTop += stdHeight;
          periodIndexMap[period.id] = periodIndex;
          periodMap[periodIndex] = period;
          periodIndex++;
        });
      });

      return {weekComponents, periodComponents};
    })(periodList, now);
    const periodListStyle = {
      width: periodWidth,
      height: periodList.length * stdHeight,
      top: headerHeight,
      left: weekWidth,
      transform: `translateY(${-scrollOffset.y}px)`,
    };
    const weekListStyle = {
      width: weekWidth, top: headerHeight, left: 0, height: periodList.length * stdHeight,
      transform: `translateY(${-scrollOffset.y}px)`,
    };

    // const contains = (range, rect2) => {
    //   const {start, end} = range;
    //   const x = Math.min(start.x, end.x);
    //   const y = Math.min(start.y, end.y);
    //   const w = Math.abs(start.x - end.x);
    //   const h = Math.abs(start.y - end.y);
    //   return new Rect(x, y, w, h).isOverlap(rect2);
    // };

    const renderLectureList = ((list: ILecture[]) => {
      const table = {};
      const viewEndCol = Math.min(viewStartCol + viewColCount, roomList.length - 1);
      const viewEndRow = Math.min(viewStartRow + viewRowCount, periodList.length - 1);

      // const range = selection.getRange();
      //
      // console.log(JSON.stringify(range), scrollOffset.x, scrollOffset.y);

      list.forEach((it: ILecture) => {
        if (it.room) {
          const col = roomIndexMap[it.room.id];
          if (col >= viewStartCol && col <= viewEndCol) {
            const row = periodIndexMap[it.period.id];

            if (row >= viewStartRow && row <= viewEndRow) {
              const style = {
                left: col * stdWidth,
                top: row * stdHeight,
                width: stdWidth,
                height: stdHeight,
              };
              const key = `${row}-${col}`;
              table[key] = (
                <Lecture key={key} style={style} lecture={it}
                         selected={selectedLecture && selectedLecture.id === it.id}
                  // selected={contains(range, style)}
                         onClick={(lecture) => {
                           gradeId && onSelect && onSelect(lecture);
                         }}
                         onEdit={(lecture) => {
                           gradeId && onEdit && onEdit(lecture);
                         }}
                />
              )
            }
          }
        } else {
          console.error('没有教室的课表单元', it);
        }
      });
      for (let col = viewStartCol; col <= viewEndCol; col++) {
        for (let row = viewStartRow; row <= viewEndRow; row++) {
          const key = `${row}-${col}`;
          if (!table[key]) {
            const style = {
              left: col * stdWidth,
              top: row * stdHeight,
              width: stdWidth,
              height: stdHeight,
            };
            table[key] = (
              <Lecture key={key} style={style}
                       lecture={{period: periodMap[row], room: roomMap[col], id: key}}
                // selected={contains(range, style)}
                       selected={selectedLecture && selectedLecture.id === key}
                       onClick={(lecture) => {
                         gradeId && onSelect && onSelect(lecture);
                       }}
                       onEdit={(lecture) => {
                         gradeId && onEdit && onEdit(lecture);
                       }}
              />
            )
          }
        }
      }
      return Object.keys(table).map(key => table[key]);
    })(lectureList);


    const lectureListStyle = {
      top: headerHeight,
      left: headerWidth,
      width: roomList.length * stdWidth,
      height: periodList.length * stdHeight,
      transform: `translateX(${-scrollOffset.x}px) translateY(${-scrollOffset.y}px)`,
    };


    return (


      <div ref={this[ELEMENT]} className={classnames(styles['timetable'], className)}
           onWheel={this.onWheel}
           onMouseMove={this.onMouseMove}
           onMouseUp={this.onMouseUp}>
        <div className={classnames(styles['header'])}
             onMouseEnter={() => {
               clearTimeout(this[WHEEL]);
               if (!this.state.showScrollbar) {
                 this[MOUNTED] && this.setState({showScrollbar: true});
               }
             }}
             onMouseLeave={() => {
               clearTimeout(this[WHEEL]);
               this[WHEEL] = setTimeout(() => {
                 if (this.state.showScrollbar) {
                   this[MOUNTED] && this.setState({showScrollbar: false});
                 }
               }, 3000);
             }}
        >
          <div className={styles['header-box']}>
                 <span className={styles['header-period']} onClick={() => {
                   this.setState({scrollOffset: new Point(scrollOffset.x, 0)})
                 }}>星期</span>
            <span className={styles['header-room']} onClick={() => {
              this.setState({scrollOffset: new Point(0, scrollOffset.y)})
            }}>教室</span>
          </div>

          {
            roomListStyle.width > viewPortWidth ?
              <Scrollbar direction="horizontal"
                         visible={this.state.showScrollbar}
                         style={{width: viewPortWidth, left: headerWidth, height: 12, top: height - 12}}
                         size={viewPortWidth}
                         maxValue={roomListStyle.width - viewPortWidth}
                         value={scrollOffset.x}
                         onChange={value => {
                           this.setState({
                             scrollOffset: new Point(
                               Math.min(this.lectureWidth, Math.max(value, 0)),
                               scrollOffset.y
                             )
                           })
                         }}
              />
              :
              null

          }
          {
            periodListStyle.height > viewPortHeight ?
              <Scrollbar direction="vertical"
                         visible={this.state.showScrollbar}
                         size={viewPortHeight}
                         maxValue={periodListStyle.height - viewPortHeight}
                         value={scrollOffset.y}
                         style={{width: 12, left: width - 12, height: viewPortHeight, top: headerHeight}}
                         onChange={value => {
                           this.setState({
                             scrollOffset: new Point(
                               scrollOffset.x,
                               Math.min(this.lectureHeight, Math.max(value, 0)),
                             )
                           })
                         }}
              />
              :
              null
          }
          <div className={styles['room-list']} style={roomListStyle} onMouseDown={this.onMouseDown}>
            {renderRoomList}
          </div>
          <div className={styles['week-list']} style={weekListStyle} onMouseDown={this.onMouseDown}>
            {renderPeriodList.weekComponents}
          </div>
          <div className={styles['period-list']} style={periodListStyle} onMouseDown={this.onMouseDown}>
            {renderPeriodList.periodComponents}
          </div>
        </div>


        <div className={styles['lecture-list']} style={lectureListStyle}>
          {renderLectureList}
        </div>

      </div>

    );
  }


}


function Lecture(props) {
  const {
    className, children, style,
    onEdit, onClick, lecture, selected
  } = props;
  const {
    id, type, course, room, teacher, reserveName,
    klass, available, status, memo,
  } = lecture;
  const _props = {
    style,
    className: classnames(styles['lecture'], className, {
      [styles[`lecture-klass-type-${klass && klass.type}`]]: klass && klass.type && course && course.id !== 'reserve',
      [styles[`lecture-course-${course && course.code}`]]: course,
      [styles[`lecture-available`]]: available,
      [styles[`lecture-selected`]]: selected
    })
  };
  return (
    <span data-id={id} {..._props} onClick={() => onClick(lecture)} onContextMenu={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onEdit(lecture)
    }}>
      <div className={styles['lecture-border']}>
        {
          course && klass && klass.type === 1 ?
            <div className={styles['lecture-course']}>{course.name}</div>
            :
            null
        }
        {status === StatusEnum.正常 ? null : <LectureStatus status={status} memo={memo}/>}
        {reserveName ? <div className={styles['lecture-course']}>{reserveName}</div> : null}
        {
          klass ?
            <div
              className={
                classnames(styles['lecture-klass'], {
                    [styles['lecture-course']]: klass.type !== 1
                  }
                )
              }>
              {klass.name}
            </div>
            :
            null
        }
        {teacher ? <div className={styles['lecture-teacher']}>{teacher.name}</div> : null}
        {children}
      </div>
    </span>
  )
}

