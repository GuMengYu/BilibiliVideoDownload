import {app, dialog, ipcMain, Menu, shell} from 'electron'
import fs from 'fs-extra'

import { WindowState } from '../../../src/util/enum'
import log from './util/log'
import type WindowManager from './windowManager'
import { WindowDefaultSize } from './windowManager'
import got from "got";
import {SettingData, TaskData} from "../../../src/type";
import downloadVideo from "../../../src/core/download";
import store from './util/store'
import {handleCloseApp} from "../index";
export const registerIpcMain = (windowManager: WindowManager) => {
  const window = windowManager.getWindow('index')
  // ipcMain.handle('minimalWindow', () => {
  //   windowManager.openWindow('minimal')
  // })
  ipcMain.handle('zoom-window', () => {
    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  })
  ipcMain.handle(WindowState.MINIMIZED, () => {
    window.minimize()
  })
  ipcMain.handle(WindowState.MAXIMIZED, () => {
    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  })
  ipcMain.handle(WindowState.NORMAL, () => {
    window.unmaximize()
  })
  ipcMain.handle(WindowState.CLOSED, () => {
    app.quit()
  })
  ipcMain.handle(WindowState.MINIMIZEDTRAY, () => {
    window.close()
  })
  ipcMain.handle('open-url', (e, url) => {
    try {
      shell.openExternal(url)
    } catch (e) {
      log.error('open external url failed', e)
    }
  })
  ipcMain.handle('capturePage', async () => {
    const nativeImage = await window.capturePage()
    const buffer = nativeImage.toBitmap()
    const { width, height } = nativeImage.getSize()
    const result = {
      buffer,
      width,
      height,
    }
    return result
  })
  let cacheSize: number[] = []
  ipcMain.handle('adjustWidth', async () => {
    const aspectRatio = 2
    const [width, height] = window.getSize()
    console.log('adjustWidth: current', width, height)
    cacheSize = [width, height]
    const resizedWidth = height * aspectRatio
    if (resizedWidth !== width) {
      window.setSize(resizedWidth, height, true)
    }
    console.log('adjustWidth: resized', resizedWidth)

    return resizedWidth
  })
  ipcMain.handle('restoreSize', () => {
    const [width, height] = cacheSize
    if (width && height) {
      window.setSize(width, height, true)
    } else {
      window.setSize(WindowDefaultSize.width, WindowDefaultSize.height, true)
    }
  })
  ipcMain.handle('setProgress', (e, progress) => {
    window.setProgressBar(progress)
  })
  ipcMain.handle('relaunch', () => {
    log.info('[main]: app relaunch')
    app.relaunch()
    app.quit()
  })



// 打开浏览器
  ipcMain.on('open-browser', (event, url) => {
    shell.openExternal(url)
  })

// 打开本地文件
  ipcMain.on('open-path', (event, path) => {
    shell.openPath(path)
  })

// 打开选择文件夹dialog
  ipcMain.handle('open-dir-dialog', () => {
    const filePaths = dialog.showOpenDialogSync({
      title: '选择下载地址',
      defaultPath: app.getPath('downloads'),
      properties: ['openDirectory']
    })
    if (filePaths) {
      return Promise.resolve(filePaths[0])
    } else {
      return Promise.reject('not select')
    }
  })

// 打开文件夹
  ipcMain.on('open-dir', (event, list) => {
    const fileDirs: string[] = []
    list.forEach((id: string) => {
      const task = store.get(`taskList.${id}`)
      if (task && task.fileDir) fileDirs.push(task.fileDir)
    })
    fileDirs.forEach(dir => {
      shell.openPath(dir)
    })
  })

// 发送http请求
  ipcMain.handle('got', (event, url, option) => {
    return new Promise((resolve, reject) => {
      got(url, option)
        .then((res: any) => {
          return resolve({ body: res.body, redirectUrls: res.redirectUrls, headers: res.headers })
        })
        .catch((error: any) => {
          log.error(`http error: ${error.message}`)
          return reject(error.message)
        })
    })
  })

// 发送http请求，得到buffer
  ipcMain.handle('got-buffer', (event, url, option) => {
    return new Promise((resolve, reject) => {
      got(url, option)
        .buffer()
        .then((res: any) => {
          return resolve(res)
        })
        .catch((error: any) => {
          log.error(`http error: ${error.message}`)
          return reject(error.message)
        })
    })
  })

// electron-store 操作
  ipcMain.handle('get-store', (event, path) => {
    return Promise.resolve(store.get(path))
  })

  ipcMain.on('set-store', (event, path, data) => {
    store.set(path, data)
  })

  ipcMain.on('delete-store', (event, path) => {
    store.delete(path)
  })

// 创建右键菜单
  ipcMain.handle('show-context-menu', (event, type: string) => {
    return new Promise((resolve, reject) => {
      const menuMap = {
        download: [
          {
            label: '删除任务',
            type: 'normal',
            click: () => resolve('delete')
          },
          {
            label: '重新下载',
            type: 'normal',
            click: () => resolve('reload')
          },
          {
            label: '打开文件夹',
            type: 'normal',
            click: () => resolve('open')
          },
          {
            label: '全选',
            type: 'normal',
            click: () => resolve('selectAll')
          },
          {
            label: '播放视频',
            type: 'normal',
            click: () => resolve('play')
          }
        ],
        home: [
          { label: '全选', role: 'selectAll' },
          { label: '复制', role: 'copy' },
          { label: '粘贴', role: 'paste' }
        ]
      }
      const template: any = menuMap[type]
      const contextMenu = Menu.buildFromTemplate(template)
      contextMenu.popup({ window: window })
    })
  })

// 打开删除任务dialog
  ipcMain.handle('open-delete-video-dialog', (event, taskCount) => {
    return new Promise((resolve, reject) => {
      dialog.showMessageBox(window, {
        type: 'info',
        title: '提示',
        message: `当前选中${taskCount}个任务，你确定要删除吗？`,
        checkboxLabel: '同时删除文件',
        buttons: ['取消', '删除']
      })
        .then(res => {
          return resolve(res)
        })
        .catch(error => {
          return reject(error)
        })
    })
  })

// 删除任务文件
  ipcMain.handle('delete-videos', (event, filePaths) => {
    for (const key in filePaths) {
      fs.removeSync(filePaths[key])
    }
    return Promise.resolve('success')
  })

// 下载任务
  ipcMain.on('download-video', (event, task: TaskData) => {
    const setting: SettingData = store.get('setting')
    downloadVideo(task, event, setting)
  })

// 获取视频大小
  ipcMain.handle('get-video-size', (event, id: string) => {
    const task = store.get(`taskList.${id}`)
    if (task && task.filePathList) {
      try {
        const stat = fs.statSync(task.filePathList[0])
        return Promise.resolve(stat.size)
      } catch (error: any) {
        log.error(`get-video-size error: ${error.message}`)
      }
      try {
        const stat1 = fs.statSync(task.filePathList[2])
        const stat2 = fs.statSync(task.filePathList[3])
        return Promise.resolve(stat1.size + stat2.size)
      } catch (error) {
        return Promise.resolve(0)
      }
    }
  })

// 关闭app
  ipcMain.on('close-app', () => {
    handleCloseApp()
  })

// 最小化app
  ipcMain.on('minimize-app', () => {
    if (!window.isMinimized()) window.minimize()
  })

// 打开删除任务dialog
  ipcMain.handle('open-reload-video-dialog', (event, taskCount) => {
    return new Promise((resolve, reject) => {
      dialog.showMessageBox(window, {
        type: 'info',
        title: '提示',
        message: `当前选中${taskCount}个任务，你确定要重新下载吗？`,
        buttons: ['取消', '下载']
      })
        .then(res => {
          return resolve(res)
        })
        .catch(error => {
          return reject(error)
        })
    })
  })

// 保存弹幕文件
  ipcMain.on('save-danmuku-file', (event, content, path) => {
    fs.writeFile(path, content, { encoding: 'utf8' })
  })
}

