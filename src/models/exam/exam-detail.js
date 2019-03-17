import Model from 'dva-model';
import {
  examDetail, listStudent, listTeacher, updateTeacherInDetail,
  removeTeacherInDetail, examDetailExport
} from '../../services/exam/exam';
import { ExamDetail as namespace } from '../../utils/namespace';

export default Model(
  {
    namespace,
    state: {
      examName: null,
    },
    reducers: {
      updateTitle(state, { payload: { examName } }) {
        return { ...state, examName };
      },
      examDetailExportSuccess(state, action) {
        const exportUrl = action.result;
        return { ...state, exportUrl, loading: false };
      },
    },
    subscriptions: {
      setup({ dispatch, history }) {
        history.listen(({ pathname, query }) => {
          if (pathname === namespace) {
            dispatch({
              type: 'examDetail',
              payload: { id: query.id },
            });
            dispatch({
              type: 'updateTitle',
              payload: {
                examName: query.name || '-'
              }
            })
          }
        });
      },
    },
  },
  {
    examDetail,
    listStudent,
    listTeacher,
    updateTeacherInDetail,
    removeTeacherInDetail,
    examDetailExport
  }
);
