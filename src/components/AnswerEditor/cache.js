import {localCache as Storage} from '../../caches/index';

const KEY = 'examiner-editor-cache-';

export default function cache(key, data, expire) {
  const _key = KEY + key;
  return data ? Storage.setItem(_key, data, expire) : Storage.getItem(_key);
}
cache.clear = function () {
  Storage.removeItems(KEY);
};
