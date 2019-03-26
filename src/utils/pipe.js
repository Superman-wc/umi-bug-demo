export function pipe(...fns) {
  return (...args) =>
    fns.reduce(
      (promise, fn) => promise.then(a => Array.isArray(a) ? fn(...a) : fn(a)),
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
        return i < len ? run() : Promise.resolve(ret);
      })(arr[i], i);
    }

    return len ? run() : Promise.resolve(ret);
  };
}



// export function finallyPipes(...fns) {
//   return (...arr) => {
//     const ret = [];
//     let i = 0;
//     const len = arr.length;
//     const next = () => {
//       i++;
//       return i < len ? run() : Promise.resolve(ret);
//     };
//     const success = result => {
//       ret[i] = {payload: arr[i], result};
//       return next();
//     };
//     const fail = error => {
//       ret[i] = {payload: arr[i], error};
//       return next();
//     };
//
//     const run = () => {
//       return pipe(...fns, success)(arr[i], i).catch(fail);
//     };
//
//     return len ? run() : Promise.resolve(ret);
//   }
// }
