import Model from 'dva-model';
import {list, item, modify, create, remove} from '../../services/admin/staff';
import {AdminStaff as namespace} from '../../utils/namespace';
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
}, {
  list, item, modify, create, remove
});
