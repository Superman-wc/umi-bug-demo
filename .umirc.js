// ref: https://umijs.org/config/
export default {
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: true,
      title: '布谷智慧校园系统',
      // polyfills: ['ie9'],
      dll: true,
      pwa: null,
      routes: {
        exclude: [],
      },
      hardSource: true,
    }],
  ],
  hash: true,
  targets: {
    ie: 9,
    ios: '8.4',
  },
  proxy: {
    "/api/hii/*": {
      "target": "http://smart-campus-mp.yunzhiyuan100.com.cn/",
      "changeOrigin": true,
      // "pathRewrite": { "^/api" : "" }
    },
    "/api/1.0/*": {
      "target": "http://auth-admin.yunzhiyuan100.com.cn",
      "changeOrigin": true,
      // "pathRewrite": { "^/api" : "" }
    },
    "/api/8queen/*": {
      // "target": "http://192.168.1.253:9901/",
      "target": "http://116.62.207.178:9901/",
      // "target": "https://timetabling.yunzhiyuan100.com/",
      "changeOrigin": true,
      // "pathRewrite": { "^/api" : "" }
    }
  },
  theme: {
    "@primary-color": "#1DA57A",
    "@font-size-base": "12px",
  },
  // externals: {
  //   react: 'window.React',
  //   'react-dom': 'window.ReactDOM'
  // }
  treeShaking: true,
}
