import Model from 'dva-model';
import {list, modify} from '../../services/manages/dormcard';
import {ManagesDormCard as namespace} from '../../utils/namespace';

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
    modify,
  }
);
