import Model from 'dva-model';
import {list, create, modify, remove, notice} from '../../services/examiner/print';
import {ExaminerPrint as namespace} from '../../utils/namespace';

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
      noticeSuccess(state, action) {
        const {result} = action;
        const {list = []} = state;
        const index = list.findIndex(it => it.id === result.id);
        if (index >= 0) {
          list[index] = result;
        }
        return {...state, list: [...list], item: result, loading: false};

      }
    }
  },
  {
    list,
    create,
    modify,
    remove,
    notice
  }
);
