import {notification} from 'antd';


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
    },
    initialState: {  // 初始化
    },
  };
}

