import Model, {RestfulReducers} from 'dva-model';
import {list} from '../../services/timetable/student';
import {TimetableStudent as namespace} from '../../utils/namespace';


export default Model(
  {
    namespace,

    reducers: {
      listSuccess(state, action) {
        const {result: {list, next, now, previous}} = action;
        return {...state, list, next, now, previous, loading: false};
      },
    }
  },
  {
    list,
  }
);
