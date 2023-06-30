import Store from 'electron-store'
import {app, BrowserWindow} from 'electron'
import log from './log'
import {settingData} from "../../../../src/assets/data/default";

log.info('[main] init store')

export interface StoreType {
  windowSize: {
    width: number
    height: number
  }
}

const store = new Store<StoreType>({
  defaults: {
    windowSize: {
      height: 600,
      width: 800,
    },
  },
  name: 'database'
})

export function initStore (win: BrowserWindow) {
  const setting = store.get('setting')
  const taskList = store.get('taskList')
  if (!setting) {
    store.set('setting', {
      ...settingData,
      downloadPath: app.getPath('downloads')
    })
  } else {
    store.set('setting', {
      ...settingData,
      ...store.get('setting')
    })
  }
  if (!taskList) {
    store.set('taskList', {})
  }
  // 存储store
  win.webContents.on('did-finish-load', () => {
    console.log(store.get('setting'))
    win.webContents.send('init-store', {
      setting: store.get('setting'),
      taskList: store.get('taskList')
    })
  })
}

export default store

