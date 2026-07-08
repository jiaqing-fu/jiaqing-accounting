const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息
  platform: process.platform,

  // 应用版本
  version: '1.0.0',

  // 文件系统操作（用于 CSV 导出）
  saveFile: async (fileName, content) => {
    return ipcRenderer.invoke('save-file', { fileName, content })
  },

  // 选择文件路径
  selectSavePath: async (defaultName) => {
    return ipcRenderer.invoke('select-save-path', defaultName)
  },
})
