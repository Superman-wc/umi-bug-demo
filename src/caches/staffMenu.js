import {sessionCache} from './index';

const KEY = 'staff-menu';

export default function cache(menu) {
  return menu ? sessionCache.setItem(KEY, menu) : sessionCache.getItem(KEY);
}
cache.clear = function(){
  sessionCache.removeItem(KEY);
};
