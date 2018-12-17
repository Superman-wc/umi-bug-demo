import Model from 'dva-model';
import pathToRegexp from 'path-to-regexp';
import {list, create, modify, remove} from '../../services/admin/menu';
import {AdminMenu as namespace} from '../../utils/namespace';

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
  list, create, modify, remove
});
