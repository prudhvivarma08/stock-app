const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fetchStockData } = require('./src/api');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'renderer', 'favicon.ico')
  });

  mainWindow.loadFile('renderer/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('fetch-stock-data', async (event, symbol, timeRange) => {
  try {
    return await fetchStockData(symbol, timeRange);
  } catch (error) {
    console.error('Error in IPC handler:', error);
    throw new Error(error.message);
  }
});