import Model from 'dva-model';
import {list, item, create, modify, remove} from '../../services/admin/authority';
import {AdminAuthority as namespace} from '../../utils/namespace';

export default Model({
  namespace,
  reducers: {
    allSuccess(state, action) {
      return {...state, all: action.payload.list};
    }
  }

}, {
  list, item, create, modify, remove, all: list
});
