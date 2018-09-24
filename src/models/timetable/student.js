import Model from 'dva-model';
import {list, create, modify, remove} from '../../services/timetable/student';
import {TimetableStudent as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname, query}) => {
          if (pathname === namespace) {
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
