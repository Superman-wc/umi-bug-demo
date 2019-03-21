import { ManagesSteps as namespace } from '../utils/namespace'
import Model from 'dva-model';

export default {
  namespace,
  state: {
    current: 0,
    updateOne: 0,
    updateTwo: 0,
    subjectSelectList: [],
    roomSelectList: [],
    dateSelectList: [],
    oneItem: {},
    twoItem: {},
    threeItem: {},
    loading: false,
  },
  reducers: {
    setLoading(state, { payload: { loading } }) {
      return { ...state, loading };
    },
    saveOneItem(state, { payload: { oneItem } }) {
      return { ...state, oneItem }
    },
    saveTwoItem(state, { payload: { twoItem } }) {
      return { ...state, twoItem }
    },
    saveThreeItem(state, { payload: { threeItem } }) {
      return { ...state, threeItem }
    },
    saveSubjectSelectList(state, { payload: { subjectSelectList } }) {
      return { ...state, subjectSelectList }
    },
    saveRoomSelectList(state, { payload: { roomSelectList } }) {
      return { ...state, roomSelectList }
    },
    saveDateSelectList(state, { payload: { dateSelectList } }) {
      return { ...state, dateSelectList }
    },
    updateOne(state, { payload: { updateOne } }) {
      return { ...state, updateOne };
    },
    updateTwo(state, { payload: { updateTwo } }) {
      return { ...state, updateTwo };
    }
  }
}