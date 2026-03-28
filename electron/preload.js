'use strict'

const { contextBridge } = require('electron')

// Expose the OS platform so the renderer can detect it runs inside Electron if needed.
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
})
