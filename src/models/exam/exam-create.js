import Model from 'dva-model';
import { listSubject, doorPlate, teachersByGradeIndex, distributionStudent } from '../../services/exam/exam';
import { ExamCreate as namespace } from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({ dispatch, history }) {
        history.listen(({ pathname, query }) => {
          if (pathname === namespace) {
            dispatch({
              type: 'doorPlate',
              payload: { type: 1 },
            });
          }
        });
      },
    },
    reducers: {
      doorPlateSuccess(state, action) {
        const { list } = action.result;
        return { ...state, doorPlateList: list, loading: false };
      },
      listSubjectSuccess(state, action) {
        const { list } = action.result;
        return { ...state, subjectList: list, loading: false };
      },
      teachersByGradeIndexSuccess(state, action) {
        const { list } = action.result;
        return { ...state, teacherList: list, loading: false };
      },
      distributionStudentSuccess(state, action) {
        const { list } = action.result;
        return { ...state, studentList: list, loading: false };
      },
    }
  },
  {
    listSubject,
    doorPlate,
    teachersByGradeIndex,
    distributionStudent,
  }
);
