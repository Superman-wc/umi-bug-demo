export default function transformTimetableList(list) {
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
