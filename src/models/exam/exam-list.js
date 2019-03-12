import Model from 'dva-model';
import { listExam, examRemove } from '../../services/exam/exam';
import { ExamList as namespace } from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({ dispatch, history }) {
        history.listen(({ pathname, query }) => {
          if (pathname === namespace) {
            console.log(JSON.stringify(query))
            dispatch({
              type: 'listExam',
              payload: { ...query },
            });
          }
        });
      },
    },
  },
  {
    listExam,
    examRemove,
  }
);
