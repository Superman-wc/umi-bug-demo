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
        message: err.message,
        // description: err.stack
      });
    },
    initialState: {  // 初始化
      '/manages/class': {
        text: 'hi umi + dva',
      },
    },
  };
}

