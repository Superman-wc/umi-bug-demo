  import Model from 'dva-model';
import {list, create, all} from '../../services/manages/subject';
import {ManagesSubject as namespace} from '../../utils/namespace';
import subjectAllCache from '../../caches/manages/subject-all';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname, query}) => {
          if (pathname === namespace) {
            dispatch({
              type: 'list',
              payload: {...query, s: 10000, p: 1},
            });
            dispatch({
              type: 'all'
            });
          }
        });
      },
    },
    reducers: {
      createSuccess(state, action) {
        return {...state, list: action.payload, loading: false};
      },
      allSuccess(state, action) {
        return {...state, all: action.payload.list || [], loading: false};
      }
    }
  },
  {
    list,
    create,
    all
  }, {
    all: subjectAllCache
  }
);
