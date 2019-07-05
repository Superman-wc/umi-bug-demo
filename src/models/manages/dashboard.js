import Model from 'dva-model';
import {
  building, electionExamination, semester, student, teacher, timetable, activatedPlan,
} from '../../services/manages/dashboard';
import {ManagesDashboard as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    reducers: {
      semesterSuccess(state, action) {
        const {semester, school} = action.payload;
        return {...state, semester, school, loading: false};
      },
      studentSuccess(state, action) {
        const {list, total} = action.payload;
        return {...state, student: list, studentTotal: total, loading: false};
      },
      teacherSuccess(state, action) {
        const {teacherStatistic, teacherCount} = action.payload;
        return {...state, teacher: teacherStatistic, teacherCount, loading: false};
      },
      buildingSuccess(state, action){
        const {list, total} = action.payload;
        return {...state, building: list, buildingTotal: total, loading:false};
      },
      timetableSuccess(state, action){
        const {list, total} = action.payload;
        return {...state, timetable: list, timetableTotal: total, loading:false};
      },

    }
  },
  {
    building, electionExamination, semester, student, teacher, timetable, activatedPlan,
  }
);
