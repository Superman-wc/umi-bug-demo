import Model from 'dva-model';
import {list, create, modify, remove} from '../../services/admin/menu';
import {AdminMenu as namespace} from '../../utils/namespace';

export default Model({
  namespace,
}, {
  list, create, modify, remove
});
