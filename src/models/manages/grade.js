import Model from 'dva-model';
import {list, create, modify, remove} from '../../services/manages/grade';
import {ManagesGrade as namespace} from '../../utils/namespace';
import gradeCache from '../../caches/manages/grade';

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
  }, {
    list: gradeCache
  }
);
