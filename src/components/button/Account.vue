<template>
  <v-btn v-if="logged" icon class="account-avatar" @click="showControlCenter = !showControlCenter">
    <v-avatar size="36">
      <v-icon>{{ loginStatus === 1 ? mdiMathNorm: mdiAccountEdit }}</v-icon>
    </v-avatar>
  </v-btn>
  <v-btn v-else icon flat @click="showLogin = !showLogin">
    <v-icon>
      {{ mdiAccountCircle }}
    </v-icon>
  </v-btn>
</template>
<script setup lang="ts">
import {mdiAccountCircle, mdiAccountEdit, mdiMathNorm} from '@mdi/js'
import { storeToRefs } from 'pinia'

import { useAppStore } from '@/store/app'
import { baseStore } from '@/store/base'

const appStore = useAppStore()
const userStore = baseStore()
const { showLogin, showControlCenter } = storeToRefs(appStore)
const {  loginStatus, logged } = storeToRefs(userStore)

</script>
