import {notification} from 'antd';
import DingTalk from './utils/DingTalk';
import {inElectron, inMac} from "./utils/helper";

notification.config({
  placement: 'topRight',
  top: 66,
  duration: 3,
});

export function config() {
  return {
    onError(err) {
      err.preventDefault();
      console.error(err.message);
      notification.error({
        message: err.message || '系统错误，请联系管理员',
        // description: err.stack
      });
      if (window.fundebug) {
        window.fundebug.notifyError(err, {
          metaData: {
            info: 'dva捕获的错误'
          }
        });
      }
      window.TDAPP && window.TDAPP.onEvent('error', 'dva', {...err});
      // DingTalk.Send()
    },
    initialState: {  // 初始化
      '/env':{
        inElectron: inElectron(),
        inMac: inMac()
      },
      '/manages/class': {
        text: 'hi umi + dva',
      },
    },
  };
}

