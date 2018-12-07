import Model from 'dva-model';
import {list, remove, create, modify} from '../../services/manages/device';
import {ManagesDevice as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    state: {
      deviceMap: {},
      map: {},
      list: [],
    },
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
      listSuccess(state, action) {
        const {list = [], total} = action.result;
        list.forEach(it => {
          state.map[it.id] = it;
          state.deviceMap[it.device] = it;
        });
        return {...state, list, total, loading: false};
      },
      createSuccess(state, action) {
        let {list = [], total = 0} = state;
        if (action.result && action.result.id) {
          list.unshift(action.result);
          state.item = action.result;
          state.map[action.result.id] = action.result;
          state.deviceMap[action.result.device] = action.result;
        }
        return {...state, list: [...list], total: total + 1, loading: false};
      },
      removeSuccess(state, action) {
        const id = action.result.id;
        let {list = [], total = 0} = state;
        const index = list.findIndex(it => it.id === id);
        if (index > -1) {
          list.splice(index, 1);
          const it = state.map[id];
          delete state.map[id];
          if (it) {
            delete state.deviceMap[it.device];
          }
        }
        if (state.item && state.item.id === id) {
          delete state.item;
        }
        return {...state, list: [...list], total: Math.max(0, total - 1), loading: false};
      },
      modifySuccess(state, action) {
        let {list = []} = state;
        const index = list.findIndex(it => it.id === action.result.id);
        if (index > -1) {
          list[index] = action.result.id;
          state.map[action.result.id] = action.result;
          state.deviceMap[action.result.device] = action.result;
        }
        state.item = action.result;
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
