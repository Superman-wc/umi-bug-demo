// import Point from "./point";
// import Selection from "./selection";
// import {IRoom, IPeriod} from '../Lecture/interface';
// import Rect, {IRect} from './rect';
//
// export class Size {
//   width: number = 0;
//   height: number = 0;
//
//   constructor(width: number, height: number) {
//     this.width = width;
//     this.height = height;
//   }
//
//   static add(s1: Size, s2: Size): Size {
//     return new Size(s1.width + s2.width, s1.height + s2.height);
//   }
//
//   static diff(s1: Size, s2: Size): Size {
//     return new Size(s1.width - s2.width, s1.height - s2.height);
//   }
//
//
// }
//
// export default class Core {
//
//   readonly weekWidth: number = 30;
//
//   readonly periodWidth: number = 40;
//
//   readonly headerSize: Size = new Size(this.weekWidth + this.periodWidth, 45);
//
//   readonly size: Size = new Size(600, 585);
//
//   get viewportSize(): Size {
//     return Size.diff(this.size, this.headerSize);
//   }
//
//   readonly stdSize: Size = new Size(90, 90);
//
//   get cellSize(): Size {
//     const {width, height} = this.viewportSize;
//     return new Size(
//       Math.max(this.stdSize.width, width / Math.floor(width / this.stdSize.width)),
//       Math.max(this.stdSize.height, height / Math.floor(height / this.stdSize.height))
//     );
//   }
//
//   get viewRowCount(): number {
//     return Math.floor(this.viewportSize.height / this.cellSize.height);
//   };
//
//   get viewColCount(): number {
//     return Math.floor(this.viewportSize.width / this.cellSize.width);
//   };
//
//   get viewStartRow(): number {
//     return Math.floor(this.scrollOffset.y / this.cellSize.height);
//   };
//
//   get viewStartCol(): number {
//     return Math.floor(this.scrollOffset.x / this.cellSize.width);
//   };
//
//   readonly scrollOffset: Point = new Point(0, 0);
//
//   readonly selection: Selection = new Selection();
//
//   get maxScrollSize(): Size {
//     const {width, height} = this.cellSize;
//     const {width: vw, height: vh} = this.viewportSize;
//     return new Size(
//       width * this.roomList.length - vw,
//       height * this.periodList.length - vh
//     );
//   }
//
//   roomList: IRoom[] = [];
//
//   roomIndexMap: { [key: number]: number } = {};
//   roomMap: { [key: number]: IRoom } = {};
//   roomStyleMap: {[key:number]: IRect} = {};
//
//   setRoomList(list: IRoom[] = []): void {
//     this.roomList = list;
//     const {width} = this.cellSize;
//     const {height} = this.headerSize;
//     list.map((room: IRoom, index: number) => {
//       this.roomIndexMap[room.id] = index;
//       this.roomMap[index] = room;
//       this.roomStyleMap[index] = {left: index * width, width, height, top: 0};
//     });
//   }
//
//   periodList: IPeriod[] = [];
//   periodIndexMap: { [key: number]: number } = {};
//   periodMap: { [key: number]: IPeriod } = {};
//
//   setPeriodList(list: IPeriod[] = []): void {
//     const weekPeriod: { [key: number]: IPeriod[] } = list.sort(
//       (a: IPeriod, b: IPeriod) => a.dayOfWeek - b.dayOfWeek || a.timeslot - b.timeslot
//     ).reduce((map: { [key: number]: IPeriod[] }, it: IPeriod) => {
//       const week: IPeriod[] = map[it.dayOfWeek] || [];
//       week.push(it);
//       map[it.dayOfWeek] = week;
//       return map;
//     }, {});
//
//     const weekComponents = [];
//     const WEEK = ['一', '二', '三', '四', '五', '六', '日'];
//     let weekTop = 0;
//     let periodTop = 0;
//     const periodComponents = [];
//     let periodIndex = 0;
//
//     const {height} = this.cellSize;
//
//     Object.keys(weekPeriod).forEach(key => {
//       const periods = weekPeriod[key];
//       const week = WEEK[key];
//       const weekHeight = periods.length * height;
//       const weekStyle = {
//         height: weekHeight,
//         top: weekTop,
//         width: this.weekWidth,
//         left: 0
//       };
//       weekTop += weekHeight;
//       weekComponents.push(
//         <span className={styles['week']} key={key} style={weekStyle}>{`星期${week}`}</span>
//     );
//
//       periods.forEach(period => {
//         const periodStyle = {
//           top: periodTop,
//           left: 0,
//           width: periodWidth,
//           height: stdHeight,
//         };
//         periodComponents.push(
//           <span className={styles['period']} key={period.id}
//         style={periodStyle}>{`第${period.timeslot + 1}节`}</span>
//       );
//         periodTop += stdHeight;
//         periodIndexMap[period.id] = periodIndex;
//         periodMap[periodIndex] = period;
//         periodIndex++;
//       });
//     });
//   }
//
// }
