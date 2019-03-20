export const QiniuUpToken = '/api/hii/1.0/qiniu/token';
export const QiniuDomain = 'https://res.yunzhiyuan100.com/';

export function buildQiniuConfig(token, bucket = 'bugu') {
  return {
    getTokenUrl: QiniuUpToken + '?bucket=' + bucket,
    getTokenHeaders: {
      authorization: token
    },
    domain: QiniuDomain
  };
}


