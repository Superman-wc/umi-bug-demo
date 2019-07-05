import Model from 'dva-model';
import {list, item, modify, create, remove} from '../../services/admin/staff';
import {AdminStaff as namespace} from '../../utils/namespace';

export default Model({
  namespace,
}, {
  list, item, modify, create, remove
});
