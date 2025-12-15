
const { app, BrowserWindow, systemPreferences } = require('electron');
const path = require('path');

// 处理 macOS 上的摄像头权限
async function checkCameraPermission() {
  if (process.platform === 'darwin') {
    const status = await systemPreferences.getMediaAccessStatus('camera');
    if (status !== 'granted') {
      // 这里的 askForMediaAccess 在某些 Electron 版本可能不直接弹窗，
      // 通常依赖 Info.plist 的配置，系统会在首次调用 getUserMedia 时自动询问。
    }
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 简化示例，允许渲染进程直接访问某些能力
      webSecurity: true 
    },
    titleBarStyle: 'hiddenInset', // 类似 macOS 原生应用的标题栏
    backgroundColor: '#0f172a'
  });

  // 开发环境加载 localhost，生产环境加载打包后的 index.html
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools(); // 开发时可以打开调试控制台
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  await checkCameraPermission();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
