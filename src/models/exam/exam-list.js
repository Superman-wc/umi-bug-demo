import Model from 'dva-model';
import { listExam, examRemove, examPublishOffline } from '../../services/exam/exam';
import { ExamList as namespace } from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({ dispatch, history }) {
        history.listen(({ pathname, query }) => {
          if (pathname === namespace) {
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
    examPublishOffline
  }
);
