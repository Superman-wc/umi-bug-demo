import Model from 'dva-model';
import {list, create, modify, remove, excelImport, position} from '../../services/manages/student';
import {ManagesStudent as namespace} from '../../utils/namespace';

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
    reducers: {
      excelImportSuccess(state, action) {
        const {list = [], total = 0} = action.result;
        return {...state, list, total, loading: false};
      }
    }
  },
  {
    list,
    create,
    modify,
    remove,
    excelImport,
    position,
  }
);
