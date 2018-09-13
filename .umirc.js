// ref: https://umijs.org/config/
export default {
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: true,
      title: 'timetabling',
      polyfills: ['ie9'],
      dll: true,
      pwa: true,
      routes: {
        exclude: [],
      },
      hardSource: true,
    }],
  ],
  "browserslist": [
    "> 1%",
    "last 2 versions"
  ],
  "proxy": {
    "/admin/1.0/*": {
      "target": "http://admin.hzdoworth.com/",
      "changeOrigin": true,
      // "pathRewrite": { "^/api" : "" }
    },
    "/api/8queen/*": {
      "target": "http://116.62.207.178:9901/",
      "changeOrigin": true,
      // "pathRewrite": { "^/api" : "" }
    }
  },
  "theme": {
    "@primary-color": "#1DA57A",
    "@font-size-base": "12px",
  }
}
