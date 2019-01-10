import Model from 'dva-model';
import {
  building, electionExamination, semester, student, teacher, timetable
} from '../../services/manages/dashboard';
import {ManagesDashboard as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname, query}) => {
          if (pathname === namespace) {

            // dispatch({
            //   type: 'building',
            //   payload: {...query},
            // });

          }
        });
      },
    },
    reducers: {
      semesterSuccess(state, action) {
        const {semester, school} = action.result;
        return {...state, semester, school, loading: false};
      },
      studentSuccess(state, action) {
        const {list, total} = action.result;
        return {...state, student: list, studentTotal: total, loading: false};
      },
      teacherSuccess(state, action) {
        const {teacherStatistic, teacherCount} = action.result;
        return {...state, teacher: teacherStatistic, teacherCount, loading: false};
      },
      buildingSuccess(state, action){
        const {list, total} = action.result;
        return {...state, building: list, buildingTotal: total, loading:false};
      },
      timetableSuccess(state, action){
        const {list, total} = action.result;
        return {...state, timetable: list, timetableTotal: total, loading:false};
      }

    }
  },
  {
    building, electionExamination, semester, student, teacher, timetable
  }
);
