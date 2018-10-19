import Model from 'dva-model';
import {list, create, modify, remove} from '../../services/lecture';
import {TimetableTeacher as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      // setup({dispatch, history}) {
      //   history.listen(({pathname, query}) => {
      //     if (pathname === namespace && query.gradeId && query.courseId &&  query.teacherId) {
      //       dispatch({
      //         type: 'list',
      //         payload: {...query},
      //       });
      //     }
      //   });
      // },
    },
    reducers: {
      listSuccess(state, action) {
        const {result: {list, next, now, previous}} = action;
        return {...state, list, next, now, previous, loading: false};
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
