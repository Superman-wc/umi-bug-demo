import router from 'umi/router';
import Model from 'dva-model';
import effect from 'dva-model/effect';
import {Authenticate as namespace} from "../utils/namespace";

async function login() {
  return new Promise(resolve => setTimeout(() => resolve({result: 'ok'}), Math.random() * 1000));
}

export default Model({
  namespace,
  state: {
    token: sessionStorage.getItem('token'),
  },
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(({pathname}) => {
        (pathname !== '/login') && dispatch({type: 'checkAuthenticate'});
      });
    },
  },
  effects: {
    * checkAuthenticate(action, saga) {
      const token = yield saga.select(state => state[namespace].token);
      !token && router.replace('/login');
    },
    * login(action, saga) {
      const data = yield saga.call(effect(login, 'loginSuccess'), action, saga);
      data && router.replace('/');
    },
    * logout(action, saga) {
      sessionStorage.clear();
      yield saga.put({type: 'logoutSuccess'});
      router.replace('/login');
    }
  },
  reducers: {
    loginSuccess(state, action) {
      sessionStorage.setItem('token', action.payload);
      return {...state, token: action.payload};
    },
    logoutSuccess(state) {
      return {...state, token: undefined};
    }
  },
});
