import Model from 'dva-model';
import {list, item, create, modify, remove} from '../../services/admin/authority';
import {AdminAuthority as namespace} from '../../utils/namespace';
import pathToRegexp from 'path-to-regexp';

export default Model({
  namespace,
  // subscriptions: {
  //   setup({dispatch, history}) {
  //     history.listen(location => {
  //       const match = pathToRegexp(namespace).exec(location.pathname);
  //       if (match) {
  //         dispatch({
  //           type: 'list',
  //           payload: {
  //             ...location.query,
  //             appId: match[1]
  //           }
  //         })
  //       }
  //     });
  //   },
  // },
  reducers: {
    allSuccess(state, action) {
      return {...state, all: action.result.list};
    }
  }

}, {
  list, item, create, modify, remove, all: list
});
