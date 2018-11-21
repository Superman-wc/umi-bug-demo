export interface IIdName {
  id: number | string;
  name: string;
}

export interface ITeacher extends IIdName {
}

export interface IKlass extends IIdName {
  type?: number;
}

export interface IRoom extends IIdName {
}

export interface ICourse extends IIdName {
  code: string;
  teacherList?: ITeacher[];
}

export interface IEvent {
  draggable?: boolean;
  onDragStart?: React.DragEventHandler<HTMLElement>;
  onDragOver?: React.DragEventHandler<HTMLElement>;
  onDragEnd?: React.DragEventHandler<HTMLElement>;
  onDrop?: React.DragEventHandler<HTMLElement>;

  onSelect?: (ILecture) => void;
}

export interface IPeriod {
  id: number,
  timeslot: number;
  dayOfWeek: number;
}

export interface ILecture {
  id: string | number;           // ID
  type?: number;
  course?: ICourse;     // 科目信息
  reserveName?: string; // 不是教学班、行政班的课时科目名称
  room?: IRoom;         // 教室信息
  teacher?: ITeacher;   // 教师信息
  klass?: IKlass;       // 班级信息
  available?: boolean;  // 是否可替换
  status: number;       // 代课，换课，
  memo?: string;        // 备注信息
  period: IPeriod;

  selected?: boolean;   // 是否选中
}

export interface IRoomWeekLectures {
  weekLectures?: Array<Array<ILecture>>;
  room: IRoom
}

export interface BaseComponentProps {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ICustomRender {
  renderCourse?: (course: ICourse, lecture: ILecture) => JSX.Element;
  renderTeacher?: (teacher: ITeacher, lecture: ILecture) => JSX.Element;
  renderKlass?: (klass: IKlass, lecture: ILecture) => JSX.Element;
  renderRoom?: (room: IRoom, lecture: ILecture) => JSX.Element;
}

export interface INow {
  duration: number;
  endTime: number;
  startTime: number;
  weekIndex: number;
}

export const MaxDayOfWeek = 7;   // 一周课表显示7天
export const MaxTimeslot = 9;    // 每天最多9节课
export const WEEK = ['一', '二', '三', '四', '五', '六', '日']; // 从周一到周日

export enum StatusEnum {
  正常 = 1,
  已换课 = 2,
  已代课 = 3,
  已取消 = 4,
};
