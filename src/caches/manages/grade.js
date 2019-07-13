import { sessionCache } from '../index';

const KEY = 'grade';

export default function cache(data) {
  console.log(data?'设置年级缓存':'获取年级缓存');
  return data ? sessionCache.setItem(KEY, data) : sessionCache.getItem(KEY);
}
cache.clear = function() {
  sessionCache.removeItem(KEY);
};
