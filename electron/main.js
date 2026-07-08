const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow = null
let serverProcess = null

// 启动后端服务
function startServer() {
  const serverPath = path.join(__dirname, '..', 'server')
  serverProcess = spawn('node', ['dist/index.js'], {
    cwd: serverPath,
    stdio: 'pipe',
    env: { ...process.env, PORT: '3000' },
  })

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Server] ${data.toString().trim()}`)
  })

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`)
  })

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err.message)
  })

  return new Promise((resolve) => {
    // 等待服务启动
    const check = () => {
      const http = require('http')
      http.get('http://localhost:3000/api/health', (res) => {
        if (res.statusCode === 200) resolve()
      }).on('error', () => {
        setTimeout(check, 300)
      })
    }
    setTimeout(check, 500)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 780,
    minWidth: 360,
    minHeight: 600,
    title: '嘉庆记账',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 加载 H5 构建产物（需要先执行 npm run build:h5）
  const h5Path = path.join(__dirname, '..', 'dist', 'build', 'h5', 'index.html')
  const fs = require('fs')

  if (fs.existsSync(h5Path)) {
    // 使用本地文件
    mainWindow.loadFile(h5Path)
  } else {
    // 开发模式：连接 Vite 开发服务器
    mainWindow.loadURL('http://localhost:8080')
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  // 尝试启动后端（如果已构建）
  const serverDistPath = path.join(__dirname, '..', 'server', 'dist', 'index.js')
  const fs = require('fs')
  if (fs.existsSync(serverDistPath)) {
    await startServer()
  }

  createWindow()
})

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
