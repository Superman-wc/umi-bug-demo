import Model from 'dva-model';
import {list, item, modify, all} from '../../services/admin/url-resource';
import {AdminUrlResource as namespace} from '../../utils/namespace';
import {Actions} from '../../utils/ResourceActions';

export default Model({
  namespace,

  reducers: {
    allSuccess(state, action) {
      const {list, total} = action.payload;
      const map = {};
      list.forEach(it => {
        const arr = map[it.category || '0'] || [];
        it.actions = Actions.reduce((arr, a) => {
          if ((it.actionMask & a.mask) === a.mask) {
            arr.push(a);
          }
          return arr;
        }, []);
        arr.push(it);
        map[it.category || '0'] = arr;

      });
      window.map = map;
      return {...state, loading: false, all: list, total, map};
    },
  }
}, {
  list, item, modify, all
});
