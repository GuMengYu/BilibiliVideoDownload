<template>
  <div>
    <app-title path="message.reset_app" />
    <v-list-item
      v-for="(item, index) in formConfig"
      :key="index"
      v-bind="validateInfos[item.name]">
      <v-list-item-title class="text-caption mr-4">  {{ item.label }}  </v-list-item-title>
      <template #append>
        <template v-if="item.type === 'status'">
          <span :class="['dot', loginStatus === 0 ? 'offline' : 'online']"></span>
          {{ loginStatusText[loginStatus] }}
          <v-btn v-if="loginStatus === 0"  @click="showLogin = true">
            <v-icon >{{ mdiLogout }}</v-icon>
          </v-btn>
<!--          <a-popconfirm-->
<!--            v-else-->
<!--            title="你确定要退出登录吗?"-->
<!--            ok-text="是"-->
<!--            cancel-text="否"-->
<!--            @confirm="quitLogin"-->
<!--          >-->
<!--            <LogoutOutlined />-->
<!--          </a-popconfirm>-->
        </template>
        <v-text-field
          v-if="item.type === 'downloadPath'"
          readonly
          class="custom-input"
          v-model:value="modelRef[item.name]"
          @click="openDirDialog">
          <template #suffix>
            <FolderOutlined style="color: rgba(0,0,0,.45)" />
          </template>
        </v-text-field>
        <v-slider v-if="item.type === 'slider'" :max="5" :min="1" v-model:value="modelRef[item.name]" />
        <v-switch v-if="item.type === 'switch'" v-model:checked="modelRef[item.name]" />
      </template>
    </v-list-item>
  </div>
</template>

<script lang="ts" setup>
import AppTitle from '@/components/Title.vue'

import { ref, reactive, toRaw } from 'vue'
import { formConfig, formItemLayout, settingData, settingRules, loginStatusText } from '../../../assets/data/setting'
import { Form } from 'ant-design-vue'
import { FolderOutlined, LoginOutlined, LogoutOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { store } from '../../../store'
import { useAppStore } from '@/store/app'
import { storeToRefs } from 'pinia'
import {mdiLogout} from "@mdi/js";

const { loginStatus } = storeToRefs(store.baseStore())
const { showLogin } = storeToRefs(useAppStore())
const { downloadPath, isDanmaku, isDelete, isFolder, isMerge, isSubtitle, downloadingMaxSize } = storeToRefs(store.settingStore())

const loginModal = ref<any>(null)
const visible = ref<boolean>(false)
const useForm = Form.useForm
const modelRef = reactive(settingData)
const rulesRef = reactive(settingRules)
const { validate, validateInfos } = useForm(modelRef, rulesRef)

const open = () => {
  modelRef.downloadPath = downloadPath.value
  modelRef.isMerge = isMerge.value
  modelRef.isDelete = isDelete.value
  modelRef.isSubtitle = isSubtitle.value
  modelRef.isDanmaku = isDanmaku.value
  modelRef.isFolder = isFolder.value
  modelRef.downloadingMaxSize = downloadingMaxSize.value
  toogleVisible()
}

const toogleVisible = () => {
  visible.value = !visible.value
}

const hide = () => {
  validate()
    .then(() => {
      store.settingStore().setSetting(toRaw(modelRef))
      toogleVisible()
    })
    .catch(err => {
      console.log('error', err)
    })
}

const openDirDialog = () => {
  window.electron.openDirDialog()
    .then((res: string) => {
      console.log(res)
      modelRef.downloadPath = res
      store.settingStore().setDownloadPath(res)
    })
}

const quitLogin = () => {
  store.baseStore().setLoginStatus(0)
  store.settingStore().setSESSDATA('')
}

defineExpose({
  open
})
</script>

<style scoped lang="scss">
.custom-input{
  cursor: pointer;
  :deep(.ant-input){
    cursor: pointer;
  }
}
</style>
