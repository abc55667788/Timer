
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 320, // Reduced to allow mini mode on Linux
    minHeight: 80,  // Reduced to allow mini mode on Linux
    title: "Emerald Timer",
    icon: path.join(__dirname, 'public/logo.png'),
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

  // In production, load the built index.html from the dist folder
  const isDev = !app.isPackaged;
  
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

let originalSize = { width: 1440, height: 900 };

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
  if (mainWindow) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    if (isMini) {
      const size = mainWindow.getSize();
      originalSize = { width: size[0], height: size[1] };
      
      const miniWidth = 360; // 调宽一点
      const miniHeight = 110; 
      
      // Order of operations for better Linux/ARM compatibility
      mainWindow.setResizable(true);
      
      if (process.platform === 'linux') {
        mainWindow.setMinimumSize(miniWidth, miniHeight);
        mainWindow.setMaximumSize(miniWidth, miniHeight); 
        mainWindow.setSize(miniWidth, miniHeight);
      } else {
        mainWindow.setMinimumSize(miniWidth, miniHeight);
        mainWindow.setSize(miniWidth, miniHeight);
      }
      
      // Use screen bottom-right
      mainWindow.setPosition(screenWidth - miniWidth - 32, screenHeight - miniHeight - 32);
      
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.setResizable(false);
    } else {
      mainWindow.setResizable(true);
      if (process.platform === 'linux') {
         mainWindow.setMaximumSize(9999, 9999); // Unset limit
      }
      mainWindow.setMinimumSize(1000, 700);
      mainWindow.setSize(originalSize.width, originalSize.height);
      
      // Center the window
      mainWindow.center();
      
      mainWindow.setAlwaysOnTop(false);
    }
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
