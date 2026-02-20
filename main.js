
const { app, BrowserWindow, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');

let mainWindow;

// Set AppUserModelId for Windows taskbar icon
if (process.platform === 'win32') {
  app.setAppUserModelId("com.emerald.timer");
}

function createWindow() {
  const iconPath = path.join(__dirname, 'public/logo.png');
  const appIcon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: "Emerald Timer",
    icon: appIcon,
    frame: false, // Hide native title bar
    transparent: true, // Allow transparent background for rounded corners
    backgroundColor: "#00000000",
    hasShadow: false, // Disable native OS shadow for transparent window to prevent artifacts
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true
    // backgroundColor: '#f0f9f0' removed to allow transparency
  });

  // Explicitly set the taskbar icon for Windows
  if (process.platform === 'win32') {
    mainWindow.setIcon(appIcon);
  }

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
      
      const miniWidth = 320;
      const miniHeight = 80;
      
      mainWindow.setResizable(true); // Temporarily allow resize to set size
      mainWindow.setMinimumSize(miniWidth, miniHeight);
      mainWindow.setSize(miniWidth, miniHeight);
      
      // Position at bottom-left
      mainWindow.setPosition(20, screenHeight - miniHeight - 20);
      
      mainWindow.setAlwaysOnTop(true);
      mainWindow.setResizable(false);
    } else {
      mainWindow.setResizable(true);
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
