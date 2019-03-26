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
