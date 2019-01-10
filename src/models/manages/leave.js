import Model from 'dva-model';
import {list, item} from '../../services/manages/leave';
import {ManagesLeave as namespace} from '../../utils/namespace';

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

  },
  {
    list, item,
  }
);
