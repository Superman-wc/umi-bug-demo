import Model, {RestfulReducers} from 'dva-model';
import {list, create, modify, remove, importToSemester} from '../../services/timetable/build';
import {TimetableBuild as namespace} from '../../utils/namespace';


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

    effects: {},

    reducers: {
      listSuccess(state, action) {
        const {result: {list, next, now, previous}} = action;
        return {...state, list, next, now, previous, loading: false};
      },
      createSuccess(state, action) {
        let {list, total = 0} = state;
        const {result} = action;
        return {...state, list: [result, ...list], item: result, total: total + 1, loading: false}
      }
    }
  },
  {
    list,
    create,
    modify,
    remove,
    importToSemester,
  }
);
