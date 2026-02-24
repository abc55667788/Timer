
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const isDev = !app.isPackaged;
  const iconPath = isDev 
    ? path.join(__dirname, 'public/logo.png') 
    : path.join(__dirname, 'dist/logo.png');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 320, // Reduced to allow mini mode on Linux
    minHeight: 80,  // Reduced to allow mini mode on Linux
    title: "Emerald Timer",
    icon: iconPath,
    frame: false, 
    transparent: true, 
    // Do not set backgroundColor here as it can sometimes conflict with transparency on Windows
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    autoHideMenuBar: true,
  });

  // Explicitly set transparency
  mainWindow.setBackgroundColor('#00000000');

  // Enforce normal mode minimum size initially
  mainWindow.setMinimumSize(1000, 700);
  // Fix: On some Linux environments, the window might start maximized.
  // We ensure it starts in a normal state.
  if (process.platform === 'linux') {
    mainWindow.unmaximize();
    mainWindow.setSize(1440, 900);
    mainWindow.center();
  }
  // In production, load the built index.html from the dist folder
  if (isDev) {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html')).catch(() => {
      mainWindow.loadFile('index.html');
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  if (isDev || process.env.DEBUG === 'true') {
    mainWindow.webContents.openDevTools();
  }
}

// Global shortcut for opening devtools in production for debugging
ipcMain.on('open-devtools', () => {
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
  }
});

// 记录普通窗口尺寸和位置，以及 mini 模式的位置
let originalSize = { width: 1440, height: 900 };
let originalPosition = null;
let originalWasMaximized = false; // Add this to remember if it was maximized
let lastMiniPos = null; // mini 模式记忆位置（仅当前进程内生效）
let isCurrentlyMini = false;

ipcMain.on('window-control', (event, action) => {
  if (!mainWindow) return;
  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      mainWindow.close();
      break;
  }
});

ipcMain.on('toggle-mini-mode', (event, isMini) => {
  if (!mainWindow) return;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  const miniWidth = 360; // 调宽一点
  const miniHeight = 110;

  if (isMini) {
    // 进入 mini 模式
    if (!isCurrentlyMini) {
      // 只在从普通模式切到 mini 时记录一次原始尺寸和位置
      originalWasMaximized = mainWindow.isMaximized();
      if (originalWasMaximized) {
        mainWindow.unmaximize();
      }
      const size = mainWindow.getSize();
      const pos = mainWindow.getPosition();
      originalSize = { width: size[0], height: size[1] };
      originalPosition = { x: pos[0], y: pos[1] };
    }

    mainWindow.setBackgroundColor('#00000000');
    mainWindow.setResizable(true);

    // 如果还没有记忆位置，则默认右下角
    if (!lastMiniPos) {
      lastMiniPos = {
        x: screenWidth - miniWidth - 32,
        y: screenHeight - miniHeight - 32,
      };
    }

    if (process.platform === 'linux') {
      mainWindow.setMinimumSize(miniWidth, miniHeight);
      mainWindow.setMaximumSize(miniWidth, miniHeight);
      mainWindow.setSize(miniWidth, miniHeight);
    } else {
      mainWindow.setMinimumSize(miniWidth, miniHeight);
      mainWindow.setSize(miniWidth, miniHeight);
    }

    // 使用记忆位置（或第一次的右下角）
    mainWindow.setPosition(lastMiniPos.x, lastMiniPos.y);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setResizable(false);
    isCurrentlyMini = true;
  } else {
    // 退出 mini 模式
    if (isCurrentlyMini) {
      // 在离开 mini 前记录当前位置，作为下次 mini 的记忆值
      const bounds = mainWindow.getBounds();
      lastMiniPos = { x: bounds.x, y: bounds.y };
    }
    isCurrentlyMini = false;

    mainWindow.setResizable(true);
    if (process.platform === 'linux') {
      mainWindow.setMaximumSize(9999, 9999); // 解除 Linux 的最大尺寸限制
    }
    mainWindow.setMinimumSize(1000, 700);

    // If it was maximized before mini mode, restore that state
    if (originalWasMaximized) {
      mainWindow.maximize();
    } else {
      mainWindow.setSize(originalSize.width, originalSize.height);

      // 尽量回到原来的普通窗口位置
      if (originalPosition) {
        mainWindow.setPosition(originalPosition.x, originalPosition.y);
      } else {
        mainWindow.center();
      }
    }

    mainWindow.setAlwaysOnTop(false);
  }
});

app.whenReady().then(() => {
  createWindow();

  // Register shortcut to toggle DevTools in production
  const { globalShortcut } = require('electron');
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });
});

app.on('will-quit', () => {
  const { globalShortcut } = require('electron');
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
