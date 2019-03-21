import moment from 'moment';
import 'moment/locale/zh-cn';
import fundebug from 'fundebug-javascript';

fundebug.apikey = "aa2a176085f01d533cd0f33405ce82aab047312502a6a1868e4d5c9431d0b30a";

window.TDAPP && window.TDAPP.onEvent ('app', 'start', {ua: navigator.userAgent});

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
