import moment from 'moment';
import 'moment/locale/zh-cn';
import 'fundebug-javascript';
import {inElectron, inMac} from './utils/helper';

if (window.fundebug) {
  window.fundebug.apikey = "aa2a176085f01d533cd0f33405ce82aab047312502a6a1868e4d5c9431d0b30a";
}


window.TDAPP && window.TDAPP.onEvent('app', 'start', {ua: navigator.userAgent});

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

if(inElectron()){
  document.documentElement.classList.add('in-electron');
}
if(inMac()){
  document.documentElement.classList.add('in-mac');
}

window.onerror = function(msg, scriptURL, line, col, error) {
  // return true; 可屏蔽 console 报错显示，此处依旧选择显示
  // 跨域脚本的错误，捕获的结果是 Script error.
  // 可通过使用 crossorigin 信任
  if (msg === "Script error.") {
    return false;
  }

  // 采用异步的方式
  // 参考的使用异步的方式，避免阻塞，没遇见过也不想遇到
  setTimeout(function() {
    var data = {};
    data.scriptURL = scriptURL;
    data.line = line;
    // 不一定所有浏览器都支持col参数
    data.col = col || (window.event && window.event.errorCharacter) || 0;
    if (!!error && !!error.stack) {
      // 如果浏览器有堆栈信息
      // 直接使用
      data.msg = error.stack.toString();
    } else {
      // 参考资料中有通过 arguments.callee.caller 获取错误信息
      // 但是严格模式下不允许访问 arguments.callee
      // 故此处无法获取错误信息
      data.msg = "无法获取详细信息";
    }
    // 把 data 错误信息上报到后台
  }, 0);

  return false;
};
