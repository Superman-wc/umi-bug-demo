import { sessionCache } from '../index';

const KEY = 'subject';

export default function cache(data) {
  return data ? sessionCache.setItem(KEY, data) : sessionCache.getItem(KEY);
}
cache.clear = function() {
  sessionCache.removeItem(KEY);
};
