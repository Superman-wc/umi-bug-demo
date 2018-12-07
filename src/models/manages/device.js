import Model from 'dva-model';
import {list, remove, create, modify} from '../../services/manages/device';
import {ManagesDevice as namespace} from '../../utils/namespace';

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
    list,
    create,
    modify,
    remove,
  }
);
