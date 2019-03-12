import { ManagesSteps as namespace } from '../utils/namespace'

export default {
  namespace,
  state: {
    current: 0
  },
  reducers: {
    changeStep(state, { payload: { current } }) {
      return { ...state, current };
    }
  }
}