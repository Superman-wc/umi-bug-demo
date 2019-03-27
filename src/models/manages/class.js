import Model from 'dva-model';
import {list, create, modify, remove, excelImport, item} from '../../services/manages/class';
import {ManagesClass as namespace} from '../../utils/namespace';

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
    item,
    create,
    modify,
    remove,
    excelImport,
  }
);
