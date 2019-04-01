import Model from 'dva-model';
import {list, modify, create} from '../../services/manages/semester-detail';
import {ManagesSemesterDetail as namespace} from '../../utils/namespace';

export default Model(
  {
    namespace,
    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname, query}) => {
          if (pathname === namespace) {
            dispatch({
              type: 'list',
              payload: {
                semesterId: query.id,
                gradeId: 1,
                year: query.year,
                month: null
              },
            });
          }
        });
      },
    },
  },
  {
    list,
    modify,
    create,
  }
);
