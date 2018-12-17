import Model from 'dva-model';
import {list, create, modify, remove,} from '../../services/manages/timetable';
import {ManagesTimetable as namespace} from '../../utils/namespace';
import {GradeIndexEnum, SemesterTypeEnum, WEEK} from "../../utils/Enum";

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
                // gradeIndex: GradeIndexEnum.高一,
                // semesterType: SemesterTypeEnum.上学期,
                // dayOfWeek: WEEK.星期一 - 1,
                // s:70,
                ...query
              },
            });
          }
        });
      },
    },
  },
  {
    list,
    create,
    modify,
    remove,
  }
);
