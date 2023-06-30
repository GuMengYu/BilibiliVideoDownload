import {app, BrowserWindow, dialog, protocol, globalShortcut} from 'electron'
import is from 'electron-is'
import log from 'electron-log'
import type * as http from 'http'
import { release } from 'os'

import { useStaticServer } from './core/appStataicServer'
import { registerIpcMain } from './core/ipcMain'
import { createElectronMenu } from './core/menu'
import { createTray } from './core/tray'
import { installExtensions } from './core/util/extensions'
import WindowManager from './core/windowManager'
import store, {initStore} from "./core/util/store";

let appStaticServer: http.Server
let wm: WindowManager

preCheck()
bootstrap()

function bootstrap() {
  log.info('[main] bootstrap')
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    return app.quit()
  } else {
    app.on('second-instance', () => {
      // 当运行第二个实例时,将会聚焦到前一个实例的窗口
      const window = wm.getWindow('index')
      if (window) {
        window.show()
        if (window.isMinimized()) window.restore()
        window.focus()
      }
    })
  }
  handleAppEvent()
}

function handleAppEvent() {
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS, it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) wm.openWindow('index')
    else wm.getWindow('index')?.show()
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    // install extensions
    await installExtensions()
    // Exit cleanly on request from parent process in development mode.
    if (is.dev()) {
      if (process.platform === 'win32') {
        process.on('message', (data) => {
          if (data === 'graceful-exit') {
            app.quit()
          }
        })
      } else {
        process.on('SIGTERM', () => {
          app.quit()
        })
      }
    }
    if (is.production()) {
      // web静态资源express托管
      useStaticServer()
    }
    wm = new WindowManager()
    const window = await wm.openWindow('index')
    if (window) {
      initStore(window)
      createElectronMenu(window)
      is.windows() && createTray(window)
      registerIpcMain(wm)
      registerGlobalShortcut()
    }
  })
  app.on('quit', () => {
    appStaticServer && appStaticServer.close()
  })
  app.on('before-quit', () => {
    wm.willQuit = true
  })
}

function registerGlobalShortcut() {
  // 添加快捷键
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    const focusWin = BrowserWindow.getFocusedWindow()
    if (focusWin && focusWin.webContents.isDevToolsOpened()) {
      focusWin.webContents.closeDevTools()
    } else if (focusWin && !focusWin.webContents.isDevToolsOpened()) {
      focusWin.webContents.openDevTools({ mode: 'detach' })
    }
  })
}

function preCheck() {
  // Scheme must be registered before the app is ready
  protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
  // Disable GPU Acceleration for Windows 7
  if (release().startsWith('6.1')) app.disableHardwareAcceleration()

  // Set application name for Windows 10+ notifications
  if (process.platform === 'win32') app.setAppUserModelId(app.getName())
}
export const getWin = () => wm.getWindow('index')


export function handleCloseApp () {
  const window = getWin()
  // 检查当前是否有下载中任务
  const taskList = store.get('taskList') as Record<string, any>
  let count = 0
  for (const key in taskList) {
    const task = taskList[key]
    if (task.status !== 0 && task.status !== 5) {
      count += 1
      task.status = 5
      task.progress = 100
    }
  }
  dialog.showMessageBox(window, {
    type: 'info',
    title: '提示',
    message: count ? `当前有${count}个任务正在下载中，关闭软件会导致任务下载失败，是否继续关闭软件？` : '是否关闭应用程序？',
    buttons: ['取消', '关闭']
  })
    .then(res => {
      console.log(res);
      if (count) store.set('taskList', taskList)
      if (res.response === 1) window.destroy()
    })
    .catch(error => {
      console.log(error)
    })
}
