import Model,{RestfulReducers} from 'dva-model';
import {list, create, modify, remove, available, swap, cancel} from '../../services/lecture';
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
    reducers: {
      listSuccess(state, action) {
        const {result: {list, next, now, previous}} = action;
        return {...state, list, next, now, previous, loading: false};
      },
      availableSuccess(state, action) {
        const {result: {list = []}} = action;
        state.list.forEach(it => {
          it.available = list.indexOf(it.id * 1) !== -1;
        });
        return {...state, list: [...state.list], loading: false, disabledLoading: false};
      },
      swapSuccess(state, action) {
        const {result: {list}} = action;
        list.forEach(it => {
          const index = state.list.findIndex(im => im.id === it.id);
          if (index !== -1) {
            state.list[index] = it;
          }
        });
        state.list.forEach(it => {
          delete it.available
        });
        return {...state, loading: false, list: [...state.list]};
      },
      cancelSuccess: RestfulReducers.modifySuccess
    }
  },
  {
    list,
    create,
    modify,
    remove,
    available,
    swap,
    cancel
  }
);
