import Model from 'dva-model';
import {list, create, modify, remove} from '../../services/timetable/class';
import {TimetableClass as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname, query}) => {
          if (pathname === namespace && query.gradeId && query.klassId) {
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
    list,
    create,
    modify,
    remove,
  }
);
