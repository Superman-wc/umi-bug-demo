export function pipe(...fns) {
  return (...args) =>
    fns.reduce(
      (promise, fn) => promise.then(a => (Array.isArray(a) ? fn(...a) : fn(a))),
      Promise.resolve(args)
    );
}

export function pipes(...fns) {
  return (...arr) => {
    const ret = [];
    const push = ret.push.bind(ret);
    let i = 0;
    const len = arr.length;

    function run() {
      return pipe(...fns, push, () => {
        i++;
        return i < len ? run(arr[i], i) : Promise.resolve(ret);
      })(arr[i], i);
    }

    return len ? run() : Promise.resolve(ret);
  };
}
