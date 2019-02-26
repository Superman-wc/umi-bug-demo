import Model from 'dva-model';
import {AnswerEditor as namespace} from '../../utils/namespace';


export default Model(
  {
    namespace,

    state: {
      file: {
        version: 1,
        id: 1893,
        name: "答题卡名称",
        print: {
          dpi: 96,
          type: "A4",
          width: 210,
          height: 297,
          padding: [60, 45, 60, 45],
          colCount: 1,
          colSpan: 30,
        },
        pages: {}
      }
    },

    effects: {},
    reducers: {
      createFile(state, action) {
        return {
          ...state, file: {}
        }
      }
    }
  },
  {}
);
