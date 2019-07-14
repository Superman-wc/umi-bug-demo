import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

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
