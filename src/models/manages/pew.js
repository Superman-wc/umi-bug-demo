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
        const {payload} = action;
        if (Array.isArray(payload)) {
          for (let i = 0, len = payload.length; i < len; i++) {
            const index = list.findIndex(it => it.id === payload.id);
            if (index >= 0) {
              list[index] = payload;
              state.item = payload[0];
            }
          }
        } else {
          const index = list.findIndex(it => it.id === payload.id);
          if (index >= 0) {
            list[index] = payload;
            state.item = payload;
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
