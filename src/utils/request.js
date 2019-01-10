import fetch from 'dva/fetch';
import QueryString from 'qs';
import router from 'umi/router';

const config = {};

export function set(key, value){
  config[key] = value;
}

export function get(key){
  return config[key];
}

function checkHttpStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  if (response.status === 401) {
    set('token', null);
    router.replace('/login');
  }

  if (response.status === 403) {
    router.replace('/403');
  }

  const error = new Error(response.statusText);
  error.response = response;
  error.code = response.status;
  throw error;
}

function getResult(json) {
  if (json.status === 1) {
    return { result: json.result };
  }
  const error = new Error(json.message || json.msg || '数据加载错误！');
  error.code = json.code;
  error.data = json;
  throw error;
}

export default function request(url = '', options = {}, cache) {
  // if (/^#?\/403/g.test(location.hash)) {
  //   return Promise.reject({ message: 'Forbidden' });
  // }
  console.info('request ' + url);
  let data;
  if (typeof cache === 'function') {
    data = cache();
    if (data) {
      return Promise.resolve(data);
    }
  }
  data = options.data;
  delete options.data;
  const opts = {
    method: 'POST',
    ...options,
  };
  opts.headers = {
    ...opts.headers,
  };

  const token = get('token');

  if(token){
    opts.headers.authorization = token;
  }

  if (opts.method === 'GET' || opts.method === 'DELETE' && data) {
    url += (url.match(/\?/g) ? '&' : '?') + QueryString.stringify(data);
  } else {
    opts.headers['content-type'] = 'application/x-www-form-urlencoded'; //
    opts.body = QueryString.stringify(data);
    // opts.headers['content-type'] = 'application/json; charset=UTF-8';
    // opts.body = JSON.stringify(data); //QueryString.stringify(data); //JSON.stringify(data);
  }

  // 支持处理缓存
  const handleCache = data => {
    typeof cache === 'function' && cache(data.result);
    return data;
  };

  return fetch(url, opts)
    .then(checkHttpStatus)
    .then(res => {
      const contentType = res.headers.get('content-type');
      if (
        /^text\/x\-markdown;/g.test(contentType) ||
        /^application\/octet\-stream$/g.test(contentType)
      ) {
        return res.text().then(text => {
          return { status: 1, result: text };
        });
      } else {
        return res.json();
      }
    })
    .then(getResult)
    .then(handleCache)
    // .catch(err => ({ err }));
}



