export default {
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: false,
      title: '布谷智慧校园系统',
      // polyfills: ['ie9'],
      dll: true,
      pwa: null,
      routes: {
        exclude: [],
      },
      // hardSource: true,
    }],
  ],
  externals:{
    'fundebug-javascript': 'window.fundebug'
  },
  proxy: {
    "/api/hii/1.0/qiniu/*": {
      "target": "https://smart-campus-mp.yunzhiyuan100.com/",
      "changeOrigin": true,
      // "pathRewrite": { "^/api" : "" }
    },
    "/api/hii/*": {
      // "target": "https://smart-campus-mp.yunzhiyuan100.com/",
      "target": "http://smart-campus-mp.yunzhiyuan100.com.cn/",
      "changeOrigin": true,
      // "pathRewrite": { "^/api" : "" }
    },
    "/api/1.0/*": {
      // "target": "https://auth-admin.yunzhiyuan100.com",
      "target": "http://auth-admin.yunzhiyuan100.com.cn",
      "changeOrigin": true,
      // "pathRewrite": { "^/api" : "" }
    },
    "/api/8queen/*": {
      // "target": "http://192.168.1.253:9901/",
      // "target": "http://116.62.207.178:9901/",
      // "target": "https://timetabling.yunzhiyuan100.com/",
      "target": "http://timetabling.yunzhiyuan100.com.cn/",
      "changeOrigin": true,
      // "pathRewrite": { "^/api" : "" }
    },
    "/api/examiner/*": {
      // "target": "http://172.18.12.227:8000/",
      "target": "https://smart-campus.yunzhiyuan100.com/",
      // "target": "http://smart-campus.yunzhiyuan100.com.cn/",
      // "target": "http://192.168.1.253:8000/",
      "changeOrigin": true
    }
  },
}
