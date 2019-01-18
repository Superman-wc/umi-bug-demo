import Model from 'dva-model';
import {list, create, modify, remove} from '../../services/manages/pew';
import {ManagesPew as namespace} from '../../utils/namespace';

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
      modifySuccess(state, action) {
        let {list = []} = state;
        if (Array.isArray(action.result)) {
          for (let i = 0, len = action.result.length; i < len; i++) {
            const index = list.findIndex(it => it.id === action.result.id);
            if (index >= 0) {
              list[index] = action.result;
              state.item = action.result[0];
            }
          }
        } else {
          const index = list.findIndex(it => it.id === action.result.id);
          if (index >= 0) {
            list[index] = action.result;
            state.item = action.result;
          }
        }
        return {...state, list: [...list], loading: false};
      }
    }
  },
  {
    list,
    create,
    modify,
    remove,
  }
);
