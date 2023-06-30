import { useIpcRenderer } from '@vueuse/electron'
import { once } from 'lodash-es'
import { useToast } from 'vue-toastification'

import { useAppStore } from '@/store/app'

const toast = useToast()
import type { Router } from 'vue-router'

import is from '@/util/is'
import {ipcRenderer} from "electron";

export function useElectron(router: Router) {
  if (is.electron()) {
    registerIpcRenderer(router)
  }
}

function registerIpcRenderer(router: Router) {
  const appStore = useAppStore()
  const ipcRenderer = useIpcRenderer()
  ipcRenderer.on('open-settings', () => {
    console.log(router)
    router.push({ name: 'setting' })
    // appStore.$state.showControlCenter = !appStore.$state.showControlCenter
  })
  ipcRenderer.on('downloadCompleted', (e, file, fileName) => {
    const { path } = file
    toast.success(`${fileName} 已下载到:${path}`, {
      timeout: 1000,
    })
  })
  ipcRenderer.on('windowState', (e, state) => {
    appStore.$state.windowState = state
  })
}

export function got(url: string, option: any) {
  return ipcRenderer.invoke('got', url, option)
}

export function setStore(path: string, data: any) {
  ipcRenderer.send('set-store', path, data)
}

export function deleteStore(path: string) {
  ipcRenderer.send('delete-store', path)
}

export function openBrowser(url: string) {
  ipcRenderer.send('open-browser', url)
}
