const MaxDayOfWeek = 6;
const MaxTimeslot = 8;

export default function transformTimetableList(list) {
  list.sort((a, b) => a.period.dayOfWeek - b.period.dayOfWeek || a.period.timeslot - b.period.timesolt);

  // let maxDayOfWeek = -1;
  // let maxTimeslot = -1;

  const timetable = list.reduce((table, it) => {

    const {dayOfWeek, timeslot} = it.period;
    const week = table[dayOfWeek] || [];
    week[timeslot] = it;
    table[dayOfWeek] = week;

    // maxDayOfWeek = Math.max(dayOfWeek, maxDayOfWeek);
    // maxTimeslot = Math.max(timeslot, maxTimeslot);

    return table;

  }, []);

  const timeslot = [];



  for (let i = 0; i <= MaxDayOfWeek; i++) {
    if (!timetable[i]) {
      timetable[i] = [];
    }
    timetable[i].id = i;
    for (let j = 0; j <= MaxTimeslot; j++) {
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

export function transformListToTimeTableOfRoomWeekSlot(list){
  const roomMap = {};
  const timetableMapOfRoom = list.reduce((map, it)=>{
    if(it.room) {
      const arr = map[it.room.id] || [];
      arr.push(it);
      map[it.room.id] = arr;
      roomMap[it.room.id] = it.room;
      delete it.room;
    }else{
      console.info(it);
    }
    return map;
  }, {});


  Object.entries(timetableMapOfRoom).map(([key, value])=>{
    roomMap[key].timetable = transformTimetableList(value);
  });

  return Object.values(roomMap);
}
