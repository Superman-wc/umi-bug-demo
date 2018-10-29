import {ILecture, IRoomWeekLectures, IRoom} from "./interface";


export function transformLectureListToWeekTimetable(
  list: Array<ILecture>,
  maxDayOfWeek: number = 6,
  maxTimeslot: number = 8,
  room?: IRoom
): Array<Array<ILecture>> {
  list.sort((a, b) => a.period.dayOfWeek - b.period.dayOfWeek || a.period.timeslot - b.period.timeslot);
  const timetable: Array<Array<ILecture>> = list.reduce((table: Array<Array<ILecture>>, it: ILecture) => {
    const {dayOfWeek, timeslot} = it.period;
    const week: Array<ILecture> = table[dayOfWeek] || [];
    if (!it.course && it.reserveName) {
      it.course = {
        id: 'reserve',
        name: it.reserveName,
        code: 'reserve'
      }
    }
    week[timeslot] = it;
    table[dayOfWeek] = week;
    return table;
  }, []);

  for (let dayOfWeek = 0; dayOfWeek <= maxDayOfWeek; dayOfWeek++) {
    if (!timetable[dayOfWeek]) {
      timetable[dayOfWeek] = [];
    }
    for (let timeslot = 0; timeslot <= maxTimeslot; timeslot++) {
      if (!timetable[dayOfWeek][timeslot]) {
        timetable[dayOfWeek][timeslot] = {
          period: {dayOfWeek, timeslot},
          id: `${dayOfWeek}-${timeslot}`,
          status: 0,
          room
        };
      }
    }
  }
  return timetable;
}

export function transformLectureListToRoomWeekTimetable(
  list: Array<ILecture>,
  maxDayOfWeek: number = 6,
  maxTimeslot: number = 8,
  roomList?: Array<IRoom>
): Array<IRoomWeekLectures> {

  let roomMap = {};
  if (roomList && roomList.length) {
    roomMap = roomList.reduce((map, it) => {
      map[it.id] = {weekLectures: [], room: it};
      return map;
    }, {});
  }

  const timetableMapOfRoom = list.reduce((map, it) => {
    if (it.room) {
      const roomWeekLectures = map[it.room.id] || {weekLectures: [], room: it.room};
      roomWeekLectures.weekLectures.push(it);
      map[it.room.id] = roomWeekLectures;
    } else {
      console.info(it);
    }
    return map;
  }, roomMap);

  return Object.keys(timetableMapOfRoom).reduce((arr: Array<IRoomWeekLectures>, key) => {
    const value = timetableMapOfRoom[key];
    value.weekLectures = transformLectureListToWeekTimetable(
      value.weekLectures,
      maxDayOfWeek,
      maxTimeslot,
      value.room
    );
    arr.push(value);
    return arr;
  }, []);
}
