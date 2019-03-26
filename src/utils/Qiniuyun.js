// export default class Qiniuyun {
//   constructor(options = {}) {
//     this._options = {...options};
//   }
//
//   ajax(url = '', opt = {}) {
//     const options = {method: 'GET', async: true, dataType: 'JSON', ...opt};
//     return new Promise((resolve, reject) => {
//       const ajax = this.createAjax();
//       if (ajax) {
//         const _async = typeof options.async === 'boolean' ? options.async : true;
//         ajax.open(options.method || 'GET', url, _async);
//         if (options.headers) {
//           Object.keys(options.headers).forEach(key => {
//             ajax.setRequestHeader(key, options.headers[key]);
//           });
//         }
//         ajax.onreadystatechange = () => {
//           if (ajax.readyState === 4) {
//             if (ajax.status >= 200 && ajax.status <= 400) {
//               let res = ajax.responseText;
//               if (options.dataType && options.dataType.toUpperCase() === 'JSON') {
//                 res = JSON.parse(res);
//               }
//               resolve(res, ajax.response);
//             } else {
//               reject(new Error('请求失败:' + ajax.status), ajax.status);
//             }
//           }
//         };
//         ajax.send(options.data);
//       } else {
//         reject(new Error('创建Ajax请求失败！'));
//       }
//     });
//   }
//
//   createAjax() {
//     let xmlhttp;
//     if (window.XMLHttpRequest) {
//       xmlhttp = new XMLHttpRequest();
//     } else {
//       xmlhttp = new window.ActiveXObject("Microsoft.XMLHTTP");
//     }
//     return xmlhttp;
//   }
//
//   getToken() {
//     if (this._options.token) {
//       return Promise.resolve(this._options.token);
//     }
//     return this.ajax(this._options.getTokenUrl, {
//       headers: {
//         ...this._options.getTokenHeaders,
//       }
//     }).then(res => {
//       this._options.token = res.uptoken;
//       setTimeout(() => {
//         delete this._options.token;
//       }, 5 * 60000);
//       return this._options.token;
//     }).catch(ex => {
//       throw new Error('获取uptoken失败:' + ex.message);
//     });
//   }
//
//   upload(file, filename, key) {
//     return this.getToken().then(token => {
//       const formData = new FormData();
//       formData.append('key', key || filename);
//       formData.append('token', token);
//       formData.append('file', file, filename);
//       return formData;
//     }).then(data => {
//       return this.ajax('http://upload.qiniu.com/', {
//         method: 'POST',
//         data
//       }).then(res => {
//         res.url = this._options.domain + res.key;
//         return {file, ...res};
//       });
//     });
//   }
// }
//


export default class Qiniuyun {
  constructor(options = {}) {
    this._options = {...options};
  }

  ajax(url = '', opt = {}, onProgress, ...args) {
    const options = {method: 'GET', async: true, dataType: 'JSON', ...opt};
    return new Promise((resolve, reject) => {
      const ajax = this.createAjax();
      if (ajax) {
        const _async = typeof options.async === 'boolean' ? options.async : true;
        ajax.open(options.method || 'GET', url, _async);
        if (options.headers) {
          Object.keys(options.headers).forEach(key => {
            ajax.setRequestHeader(key, options.headers[key]);
          });
        }
        ajax.onreadystatechange = () => {
          if (ajax.readyState === 4) {
            if (ajax.status >= 200 && ajax.status <= 400) {
              let res = ajax.responseText;
              if (options.dataType && options.dataType.toUpperCase() === 'JSON') {
                res = JSON.parse(res);
              }
              resolve(res, ajax.response);
            } else {
              reject(new Error('请求失败:' + ajax.status), ajax.status);
            }
          }
        };
        if (ajax.upload && onProgress) {
          ajax.upload.onprogress = e => {
            //侦查附件上传情况
            //通过事件对象侦查
            //该匿名函数表达式大概0.05-0.1秒执行一次
            //console.log(evt);
            //console.log(evt.loaded);  //已经上传大小情况
            //evt.total; 附件总大小
            onProgress(Math.floor(100 * e.loaded / e.total), ...args); //已经上传的百分比
          };
        }
        ajax.send(options.data);
      } else {
        reject(new Error('创建Ajax请求失败！'));
      }
    });
  }

  createAjax() {
    let xmlhttp;
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else {
      xmlhttp = new window.ActiveXObject('Microsoft.XMLHTTP');
    }
    return xmlhttp;
  }

  getToken() {
    if (!this.__token) {
      this.__token = this.ajax(this._options.getTokenUrl, {
        headers: {
          ...this._options.getTokenHeaders,
        },
      })
        .then(res => {
          this._options.token = res.uptoken;
          setTimeout(() => {
            delete this.__token;
          }, 5 * 60000);
          return this._options.token;
        })
        .catch(ex => {
          delete this.__token;
          throw new Error('获取uptoken失败:' + ex.message);
        });
    }
    return this.__token;
  }

  upload(options, {onStart, onProgress, onEnd, onError}) {
    const {file, filename, key} = options;
    return this.getToken()
      .then(token => {
        const formData = new FormData();
        formData.append('key', key || filename);
        formData.append('token', token);
        formData.append('file', file, filename);
        return formData;
      })
      .then(data => {
        onStart && onStart(options);
        let url = window.location.protocol === 'https:' ? 'https://up.qbox.me' : 'http://upload.qiniu.com/';
        const promise = this.ajax(
          url,
          {method: 'POST', data},
          (progress)=>onProgress && onProgress(progress, options),
          options
        ).then(res => {
          res.url = this._options.domain + res.key;
          onEnd && onEnd(res, options);
          return {...options, ...res};
        });
        if (onError) {
          promise.catch(ex => {
            onError(ex, options);
            throw ex;
          });
        }
        return promise;
      });
  }
}
