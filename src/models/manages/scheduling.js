import Model from 'dva-model';
import {create,} from '../../services/manages/scheduling';
import {ManagesScheduling as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
  },
  {create}
);
