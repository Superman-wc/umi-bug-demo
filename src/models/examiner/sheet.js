import Model from 'dva-model';
import {list, create, modify, remove, analyze} from '../../services/examiner/sheet';
import {ExaminerSheet as namespace} from '../../utils/namespace';

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
    reducers: {
      analyzeSuccess(state, action) {
        const {result} = action;
        const index = state.list.findIndex(it => it.id === result.id);
        if (index >= 0) {
          state.list[index] = result;
        }
        return {...state, list: [...state.list], loading: false};
      }
    }
  },
  {
    list,
    create,
    modify,
    remove,
    analyze,
  }
);
