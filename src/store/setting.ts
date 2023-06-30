import { defineStore } from 'pinia'
import { isUndefined } from 'lodash'
import { SettingData, SettingDataEasy } from '../type/index'
import {setStore} from "@/plugins/electron";
export const settingStore = defineStore('setting', {
  state: () => {
    const setting: SettingData = {
      downloadPath: '',
      SESSDATA: '',
      isMerge: true,
      isDelete: true,
      bfeId: '',
      isSubtitle: true,
      isDanmaku: true,
      isFolder: true,
      isCover: true,
      downloadingMaxSize: 5
    }
    return setting
  },
  getters: {
    getSetting: (state) => ({
      downloadPath: state.downloadPath,
      SESSDATA: state.SESSDATA,
      isMerge: state.isMerge,
      isDelete: state.isDelete,
      bfeId: state.bfeId,
      isSubtitle: state.isSubtitle,
      isDanmaku: state.isDanmaku,
      isFolder: state.isFolder,
      isCover: state.isCover,
      downloadingMaxSize: state.downloadingMaxSize
    })
  },
  actions: {
    setDownloadPath (path: string) {
      this.downloadPath = path
      setStore('setting.downloadPath', path)
    },
    setSESSDATA (SESSDATA: string) {
      this.SESSDATA = SESSDATA
      setStore('setting.SESSDATA', SESSDATA)
    },
    setIsMerge (data: boolean) {
      this.isMerge = data
      setStore('setting.isMerge', data)
    },
    setIsDelete (data: boolean) {
      this.isDelete = data
      setStore('setting.isDelete', data)
    },
    setBfeId (bfeId: string) {
      this.bfeId = bfeId
      setStore('setting.bfeId', bfeId)
    },
    setIsSubtitle (data: boolean) {
      this.isSubtitle = data
      setStore('setting.isSubtitle', data)
    },
    setIsDanmaku (data: boolean) {
      this.isDanmaku = data
      setStore('setting.isDanmaku', data)
    },
    setIsFolder (data: boolean) {
      this.isFolder = data
      setStore('setting.isFolder', data)
    },
    setIsCover (data: boolean) {
      this.isCover = data
      setStore('setting.isCover', data)
    },
    setDownloadingMaxSize (size: number) {
      this.downloadingMaxSize = size
      setStore('setting.downloadingMaxSize', size)
    },
    setSetting (setting: SettingDataEasy) {
      const allSetting = this.getSetting
      for (const key in allSetting) {
        if (!isUndefined(setting[key])) {
          allSetting[key] = setting[key]
          this[key] = setting[key]
        }
      }
      setStore('setting', allSetting)
    }
  }
})
