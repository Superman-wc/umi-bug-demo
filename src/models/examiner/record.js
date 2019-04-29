import Model from 'dva-model';
import {list, englishCompositionAnalyze} from '../../services/examiner/record';
import {ExaminerRecord as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname, query}) => {
          if (pathname === '/examiner/record') {
            dispatch({
              type: 'list',
              payload: {...query},
            });
          }
        });
      },
    },

  },
  {
    list, englishCompositionAnalyze
  }
);
