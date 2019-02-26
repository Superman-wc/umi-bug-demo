import Model from 'dva-model';
import {AnswerEditor as namespace} from '../../../utils/namespace';
import {reducers} from "../../../components/AnswerEditor/model";


export default Model(
  {
    namespace,

    state: {},

    effects: {},
    reducers: {
      ...reducers,
    }
  },
  {}
);
