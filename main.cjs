
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;
const MINI_PEEK_SIZE = 24;
const MINI_DOCK_EDGE = 8;

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

  mainWindow.on('move', () => {
    if (!isCurrentlyMini || !mainWindow || isDockingInProgress) return;

    const bounds = mainWindow.getBounds();
    const display = screen.getDisplayMatching(bounds);
    const workArea = display.workArea;

    if (miniDockMode === 'expanded') {
      // Check if the window is actually being dragged (position changed significantly)
      const dockX = miniDockSide === 'left' ? workArea.x : workArea.x + workArea.width - bounds.width;
      const expectedX = dockX;
      const deltaX = Math.abs(bounds.x - expectedX);
      
      // If dragged away from dock position, undock
      if (deltaX > 10) {
        undockMini();
        return;
      }
      
      miniExpandedBounds = bounds;
      return;
    }

    if (miniDockMode === 'peek') {
      return;
    }

    miniExpandedBounds = bounds;

    const nearLeft = bounds.x <= workArea.x + MINI_DOCK_EDGE;
    const nearRight = bounds.x + bounds.width >= workArea.x + workArea.width - MINI_DOCK_EDGE;

    if (dockCheckTimer) {
      clearTimeout(dockCheckTimer);
      dockCheckTimer = null;
    }

    if (nearLeft || nearRight) {
      dockCheckTimer = setTimeout(() => {
        if (!isCurrentlyMini || miniDockMode !== 'none') return;
        const latest = mainWindow.getBounds();
        const latestDisplay = screen.getDisplayMatching(latest);
        const latestWorkArea = latestDisplay.workArea;
        const stillNearLeft = latest.x <= latestWorkArea.x + MINI_DOCK_EDGE;
        const stillNearRight = latest.x + latest.width >= latestWorkArea.x + latestWorkArea.width - MINI_DOCK_EDGE;
        if (stillNearLeft || stillNearRight) {
          dockMiniToSide(stillNearLeft ? 'left' : 'right');
        }
      }, 160);
    }
  });
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
let miniDockMode = 'none'; // 'none' | 'peek' | 'expanded'
let miniDockSide = null; // 'left' | 'right'
let miniExpandedBounds = null;
let dockCheckTimer = null;
let isDockingInProgress = false;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const sendMiniDockState = () => {
  if (mainWindow) {
    mainWindow.webContents.send('mini-dock-state', {
      mode: miniDockMode,
      side: miniDockSide,
      peekSize: MINI_PEEK_SIZE,
    });
  }
};

const setMiniDockMode = (mode, side = null) => {
  miniDockMode = mode;
  if (side) miniDockSide = side;
  if (mode === 'none') {
    miniDockSide = null;
  }
  sendMiniDockState();
};

const dockMiniToSide = (side) => {
  if (!mainWindow) return;

  if (dockCheckTimer) {
    clearTimeout(dockCheckTimer);
    dockCheckTimer = null;
  }

  const bounds = mainWindow.getBounds();
  miniExpandedBounds = bounds;
  miniDockSide = side;
  miniDockMode = 'peek';

  const display = screen.getDisplayMatching(bounds);
  const workArea = display.workArea;
  const x = side === 'left'
    ? workArea.x
    : workArea.x + workArea.width - MINI_PEEK_SIZE;
  const y = clamp(bounds.y, workArea.y, workArea.y + workArea.height - bounds.height);

  isDockingInProgress = true;
  mainWindow.setBounds({ x, y, width: MINI_PEEK_SIZE, height: bounds.height }, false);
  setTimeout(() => {
    isDockingInProgress = false;
  }, 100);
  sendMiniDockState();
};

const expandMiniDock = () => {
  if (!mainWindow || miniDockMode !== 'peek') return;

  const current = mainWindow.getBounds();
  const display = screen.getDisplayMatching(current);
  const workArea = display.workArea;
  const fallbackBounds = {
    width: 360,
    height: 110,
    x: current.x,
    y: current.y,
  };
  const target = miniExpandedBounds || fallbackBounds;
  let x = target.x;
  if (miniDockSide === 'left') {
    x = workArea.x;
  } else if (miniDockSide === 'right') {
    x = workArea.x + workArea.width - target.width;
  }
  const y = clamp(target.y, workArea.y, workArea.y + workArea.height - target.height);

  miniDockMode = 'expanded';
  mainWindow.setBounds({ x, y, width: target.width, height: target.height }, false);
  sendMiniDockState();
};

const collapseMiniDock = () => {
  if (!mainWindow || miniDockMode !== 'expanded' || !miniDockSide) return;

  const bounds = mainWindow.getBounds();
  miniExpandedBounds = bounds;

  const display = screen.getDisplayMatching(bounds);
  const workArea = display.workArea;
  const x = miniDockSide === 'left'
    ? workArea.x
    : workArea.x + workArea.width - MINI_PEEK_SIZE;
  const y = clamp(bounds.y, workArea.y, workArea.y + workArea.height - bounds.height);

  miniDockMode = 'peek';
  isDockingInProgress = true;
  mainWindow.setBounds({ x, y, width: MINI_PEEK_SIZE, height: bounds.height }, false);
  setTimeout(() => {
    isDockingInProgress = false;
  }, 100);
  sendMiniDockState();
};

const undockMini = () => {
  if (!mainWindow) return;

  const current = mainWindow.getBounds();
  const display = screen.getDisplayMatching(current);
  const workArea = display.workArea;
  const fallbackBounds = {
    width: 360,
    height: 110,
    x: current.x,
    y: current.y,
  };
  const target = miniExpandedBounds || fallbackBounds;
  const x = clamp(target.x, workArea.x, workArea.x + workArea.width - target.width);
  const y = clamp(target.y, workArea.y, workArea.y + workArea.height - target.height);

  isDockingInProgress = true;
  mainWindow.setBounds({ x, y, width: target.width, height: target.height }, false);
  setTimeout(() => {
    isDockingInProgress = false;
  }, 100);
  setMiniDockMode('none');
};

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
    setMiniDockMode('none');
  } else {
    if (dockCheckTimer) {
      clearTimeout(dockCheckTimer);
      dockCheckTimer = null;
    }
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
    setMiniDockMode('none');
    miniExpandedBounds = null;
  }
});

ipcMain.on('mini-dock-expand', () => {
  expandMiniDock();
});

ipcMain.on('mini-dock-collapse', () => {
  collapseMiniDock();
});

ipcMain.on('mini-dock-undock', () => {
  undockMini();
});

ipcMain.on('mini-dock-restore', (_event, payload) => {
  if (!mainWindow || !isCurrentlyMini || !payload || !payload.side) return;
  const side = payload.side === 'right' ? 'right' : 'left';
  const mode = payload.mode === 'expanded' ? 'expanded' : 'peek';
  dockMiniToSide(side);
  if (mode === 'expanded') {
    setTimeout(() => {
      expandMiniDock();
    }, 140);
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
