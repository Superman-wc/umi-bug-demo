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
      pwa: {},
      routes: {
        exclude: [],
      },
      hardSource: true,
    }],
  ],
  hash: true,
  targets: {
    ie: 9,
  },
  browserslist: [
    "> 1%",
    "last 2 versions"
  ],
  proxy: {
    "/api/1.0/*": {
      "target": "http://auth-admin.yunzhiyuan100.com.cn/",
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
  }
}
