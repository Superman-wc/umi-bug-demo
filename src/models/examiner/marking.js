import Model from 'dva-model';
import {item, marking, student} from '../../services/examiner/marking';
import {ExaminerMarking as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname, query}) => {

        });
      },
    },
    reducers: {}
  },
  {
    item, marking, student
  }
);
