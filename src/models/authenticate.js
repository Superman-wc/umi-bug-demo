import {routerRedux} from 'dva/router';
import Model from 'dva-model';
import effect from 'dva-model/effect';
import {login, create, modify, menu} from '../services/authenticate';
import authenticateCache from '../caches/authenticate';
import {sessionCache, localCache} from "../caches";
import {set as setToken} from '../utils/request';
import {Authenticate as namespace} from '../utils/namespace';
import staffMenuCache from '../caches/staffMenu';
import resourceActions from '../utils/ResourceActions';
import {MenuCategoryEnum, URLResourceCategoryEnum} from "../utils/Enum";


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
          dispatch({
            type: 'checkAuthenticate',
            payload: {pathname}
          });
        }
      });
    },
  },
  effects: {
    * checkAuthenticate(action, saga) {
      const authenticate = yield saga.select(state => state[namespace].authenticate);
      if (!authenticate || !authenticate.token) {
        yield saga.put(routerRedux.push('/login'));
      } else {
        yield saga.put({type: 'menu', payload: action.payload});
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

    * menu(action, saga) {
      const authenticate = yield saga.select(state => state[namespace].authenticate);
      if (authenticate && authenticate.token && authenticate.appId) {
        if (!action.payload) {
          action.payload = {};
        }
        action.payload.appId = authenticate.appId;
        yield saga.call(effect(menu, 'menuSuccess', staffMenuCache), action, saga);
      }
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
    logoutSuccess() {
      console.log('登出');
      setToken('token', null);
      authenticateCache.clear();
      sessionCache.clear();
      localCache.clear();
      return {};
    },
    menuSuccess(state, action) {
      const {menus = [], resources = []} = action.result;

      const resourceMap = resources.reduce((map, it) => {
        it.actions = resourceActions(it.userMask).reduce((map, {value, label}) => {
          map[value] = label;
          return map;
        }, {});
        map[it.controllerName] = it;
        return map;
      }, {});

      const menuLinkMap = {};
      const menuMap = menus.reduce((map, it, index) => {
        const menuCategory = map[it.category] || {
          key: MenuCategoryEnum[it.category] || MenuCategoryEnum[URLResourceCategoryEnum[it.category]] || index,
          title: it.category,
          items: {}
        };
        const group = menuCategory.items[it.menuGroup] || {
          title: it.menuGroup || '--',
          items: []
        };
        it.resource = resourceMap[it.controllerName];
        group.items.push(it);
        menuCategory.items[it.menuGroup] = group;
        map[it.category] = menuCategory;
        menuLinkMap[it.link] = it;
        return map;
      }, {}) || {};

      const menuTree = Object.keys(menuMap).reduce((arr, category) => {
        const menuCategory = menuMap[category];

        menuCategory.items = Object.keys(menuCategory.items).reduce((items, g) => {
          items.push(menuCategory.items[g]);
          return items;
        }, []);

        arr.push(menuCategory);
        return arr;
      }, []);

      menuTree.push({
        key: 'examiner',
        title: '电子阅卷',
        items: [
          {
            title: '',
            items: [
              {
                id: 'examiner-list',
                title: '答题卡制做',
                link: '/examiner',
              }, {
                id: 'examiner-upload',
                title: '答题卡上传',
                link: '/examiner/workspace'
              },{
                id: 'examiner-marking',
                title: '在线批阅',
                link: '/examiner/marking'
              },
            ]
          }
        ]
      });

      // console.log(action);

      const {pathname} = action.payload;
      const currentMenu = menuLinkMap[pathname];

      return {...state, menus, menuTree, menuMap, menuLinkMap, currentMenu, resourceMap, resources, loading: false};
    },
  },
}, {});
