const { app, BrowserWindow } = require('electron');

let mainWindow;

const createWindow = ()=> {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1010,
    height: 720,
    frame: false, // 无边框窗口
    // Mac中无边框，但保留最大化最小化关闭的操作按钮
    titleBarStyle: 'hidden', //hiddenInset, customButtonsOnHover
    // transparent: true,
    webPreferences: {
      // nodeIntegration: true,
      // nativeWindowOpen: true
    }
  });

  // 加载index.html文件
  // win.loadFile('index.html')
  mainWindow.loadURL('http://localhost:8080'); //'https://smart-campus.yunzhiyuan100.com'

  // 打开开发者工具
  mainWindow.webContents.openDevTools();

  // mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
  //   if (frameName === 'modal') {
  //     // open window as modal
  //     event.preventDefault();
  //     event.newGuest = new BrowserWindow({
  //       modal: true,
  //       parent: mainWindow,
  //       width: 100,
  //       height: 100,
  //       ...options,
  //     });
  //   }else if(frameName==='loginWindow'){
  //     console.log('frameName=', frameName);
  //     event.newGuest = new BrowserWindow({
  //       width: 550,
  //       height: 270,
  //       ...options,
  //     });
  //   }
  //
  // });

  // 当 window 被关闭，这个事件会被触发。
  mainWindow.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    mainWindow = null
  });
};

app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (mainWindow === null) {
    createWindow()
  }
});

if(app.makeSingleInstance) {
// 保证应用程序只存在一个实例
  const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus();
      //TODO 这里处理一下命令行参数
    }
  });
  if (shouldQuit) {
    app.quit()
  }
}
