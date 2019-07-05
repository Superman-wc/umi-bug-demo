import Model from 'dva-model';
import {list, create, modify, remove, analyze, statistic} from '../../services/examiner/sheet';
import {ExaminerSheet as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname, query}) => {
          if (pathname === '/examiner/upload') {
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
        const {payload} = action;
        const index = state.list.findIndex(it => it.id === payload.id);
        if (index >= 0) {
          state.list[index] = payload;
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
    statistic,
  }
);
