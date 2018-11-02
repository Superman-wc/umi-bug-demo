import Model, {RestfulReducers} from 'dva-model';
import {list, create, modify, remove, available, swap, cancel} from '../../services/timetable/lecture';
import {TimetableGrade as namespace} from '../../utils/namespace';


export default Model(
  {
    namespace,
    reducers: {
      listSuccess(state, action) {
        const {result: {list, next, now, previous}} = action;
        return {...state, list, next, now, previous, loading: false};
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
