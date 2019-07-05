import Model from 'dva-model';
import {list, item, release} from '../../services/manages/lecture-arrange-plan';
import {ManagesLectureArrangePlan as namespace} from '../../utils/namespace';

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
      fetchDetailSuccess(state, action) {
        const {list = []} = state;
        const item = action.payload;
        const index = list.findIndex(it => it.id === item.id);
        if (index >= 0) {
          list[index] = item;
        }
        return {...state, list: [...list], loading: false};
      }
    }

  },
  {
    list, item, fetchDetail: item, release,
  }
);
