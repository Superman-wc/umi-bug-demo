import Model from 'dva-model';
import {listSubject, doorPlate, distributionStudent, getTeacher} from '../../services/exam/exam';
import {ExamCreate as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname}) => {
          if (pathname === namespace) {
            dispatch({
              type: 'doorPlate',
              payload: {type: 1},
            });
          }
        });
      },
    },
    reducers: {
      doorPlateSuccess(state, action) {
        const {list} = action.payload;
        return {...state, doorPlateList: list, loading: false};
      },
      listSubjectSuccess(state, action) {
        const {list} = action.payload;
        return {...state, subjectList: list, loading: false};
      },
      getTeacherSuccess(state, action) {
        const {list} = action.payload;
        return {...state, teacherList: list, loading: false};
      },
      distributionStudentSuccess(state, action) {
        const {list} = action.payload;
        return {...state, studentList: list, loading: false};
      },
    }
  },
  {
    listSubject,
    doorPlate,
    distributionStudent,
    getTeacher
  }
);
