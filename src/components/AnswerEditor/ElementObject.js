// import uuid from 'uuid/v4';

const MAP = {};

function uuid() {
  return [Date.now(), uuid.cid++].join('-');
}

uuid.cid = 0;

export function create(opt) {
  if (opt.key) {
    remove(opt.key);
  }
  const obj = {
    ...opt,
    key: uuid(),
  };
  MAP[obj.key] = obj;
  return obj;
}

export function find(key) {
  return MAP[key];
}

export function assign(key, opt) {
  const obj = find(key);
  if (obj) {
    return Object.assign(obj, opt);
  }
  return null;
}

export function remove(key) {
  const obj = MAP[key];
  delete MAP[key];
  return obj;
}

export function clear() {
  Object.keys(MAP).forEach(key => {
    delete MAP[key];
  });
}
