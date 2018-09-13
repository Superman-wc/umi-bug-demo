import { sessionCache } from './index';

const KEY = 'authenticate';

export default function cache(authenticate) {
  return authenticate ? sessionCache.setItem(KEY, authenticate) : sessionCache.getItem(KEY);
}
cache.clear = function() {
  sessionCache.removeItem(KEY);
};
