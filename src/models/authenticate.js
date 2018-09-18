import {routerRedux} from 'dva/router';
import Model from 'dva-model';
import effect from 'dva-model/effect';
import {login, create, modify} from '../services/authenticate';
import authenticateCache from '../caches/authenticate';
import {set as setToken} from '../utils/request';
import {Authenticate as namespace} from '../utils/namespace';

const auth = authenticateCache();

if (auth && auth.token) {
  setToken('token', auth.token);
}

export default Model({
  namespace,
  state: {
    authenticate: auth
  },

  subscriptions: {
    setup({dispatch, history}) {
      history.listen(({pathname}) => {
        if (pathname === '/login') {
          authenticateCache.clear();
        } else {
          // dispatch({
          //   type: 'checkAuthenticate',
          // });
        }
      });
    },
  },
  effects: {
    * checkAuthenticate(action, saga) {
      const authenticate = yield saga.select(state => state[namespace].authenticate);
      if (!authenticate || !authenticate.token) {
        yield saga.put(routerRedux.push('/login'));
      }
    },
    * login(action, saga) {
      const data = yield saga.call(
        effect(login, 'loginSuccess', authenticateCache),
        action,
        saga
      );
      if (data && data.token) {
        yield saga.put(routerRedux.replace('/'));
      }
    },
    * logout(action, saga) {
      const state = yield saga.select(state => state);
      const nss = Object.keys(state);
      for (let i = 0, len = nss.length; i < len; i++) {
        if (nss[i] !== namespace) {
          yield saga.put({type: nss[i] + '/clean'});
        }
      }
      yield saga.put({type: 'logoutSuccess'});
      yield saga.put(routerRedux.replace('/login'));
    },

    // *create(action, saga) {
    //   const data = yield saga.call(effect(create, 'createSuccess'), action, saga);
    //   if (data) {
    //     yield saga.put(routerRedux.push('/login'));
    //   }
    // },
    // *modifyPassword(action, saga) {
    //   const result = yield saga.call(effect(modify, 'modifyPasswordSuccess'), action, saga);
    //   if (result) {
    //     alert('修改密码成功, 系统要求重新登录');
    //     yield saga.put(routerRedux.push('/login'));
    //   }
    // },


  },
  reducers: {
    loginSuccess(state, action) {
      setToken('token', action.result.token);
      return {...state, authenticate: action.result, loading: false};
    },
    // logoutSuccess() {
    //   authenticateCache.clear();
    //   sessionCache.clear();
    //   return {};
    // },
    // createSuccess(state) {
    //   return { ...state, loading: false, authenticate: null };
    // },
    // modifyPasswordSuccess(state) {
    //   authenticateCache.clear();
    //   sessionCache.clear();
    //   return { ...state, authenticate: null, loading: false };
    // },
  },
}, {});
