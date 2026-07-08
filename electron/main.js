const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const http = require('http')

let mainWindow = null
let serverProcess = null

// ========== IPC 处理 ==========

ipcMain.handle('save-file', async (_event, { fileName, content }) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: fileName,
    filters: [{ name: 'CSV 文件', extensions: ['csv'] }],
  })
  if (filePath) {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true, filePath }
  }
  return { success: false }
})

ipcMain.handle('select-save-path', async (_event, defaultName) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName,
  })
  return filePath ?? null
})

// ========== 后端服务 ==========

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

  const STARTUP_TIMEOUT = 15000 // 15 秒超时

  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    const check = () => {
      // 超时拒绝，不再阻塞窗口启动
      if (Date.now() - startTime > STARTUP_TIMEOUT) {
        console.error('后端启动超时，跳过等待')
        resolve() // 不 reject，让窗口仍能打开
        return
      }

      http.get('http://localhost:3000/api/health', (res) => {
        if (res.statusCode === 200) {
          resolve()
        } else {
          setTimeout(check, 300)
        }
      }).on('error', () => {
        setTimeout(check, 300)
      })
    }

    // 子进程异常退出时快速失败
    serverProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        console.error(`后端进程异常退出，代码: ${code}`)
        resolve() // 不阻塞窗口
      }
    })

    setTimeout(check, 500)
  })
}

// ========== 窗口 ==========

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

  if (fs.existsSync(h5Path)) {
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

// ========== 生命周期 ==========

app.whenReady().then(async () => {
  // 尝试启动后端（如果已构建）
  const serverDistPath = path.join(__dirname, '..', 'server', 'dist', 'index.js')
  if (fs.existsSync(serverDistPath)) {
    await startServer()
  }

  createWindow()
})

app.on('window-all-closed', async () => {
  if (serverProcess) {
    // 先请求优雅关闭，再等进程退出
    serverProcess.kill('SIGTERM')
    await new Promise((resolve) => {
      const forceKill = setTimeout(() => {
        if (serverProcess) serverProcess.kill('SIGKILL')
        resolve()
      }, 5000)

      serverProcess.on('close', () => {
        clearTimeout(forceKill)
        serverProcess = null
        resolve()
      })
    })
  }
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
