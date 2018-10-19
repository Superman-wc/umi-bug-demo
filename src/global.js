/**
 * ES7 才会引入的 entries， values 的方法
 */
if (!Object.entries) {
  Object.entries = function (obj) {
    return Object.keys(obj).map(key => ([key, obj[key]]));
  }
}
if (!Object.values) {
  Object.values = function (obj) {
    return Object.keys(obj).map(key => (obj[key]));
  }
}
