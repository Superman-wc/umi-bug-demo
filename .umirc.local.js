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
      // hardSource: true,
    }],
  ],
  externals:{
    'fundebug-javascript': 'window.fundebug'
  },
  proxy: {

  },
}
