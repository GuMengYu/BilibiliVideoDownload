<template>
  <v-card
    width="100%"
    variant="tonal"
    height="78"
    class="rounded-xl d-flex justify-start align-center px-4"
    v-bind="$attrs"
  >
    <v-avatar size="52">
      <v-icon>{{ logged ? (loginStatus === 1 ? mdiAccountEdit : mdiArrowDown) : mdiAbacus }}</v-icon>
    </v-avatar>
    <div class="d-flex flex-column text-start ml-3">
      <div class="d-flex gap-1 w-full">
        <span class="font-weight-medium line-clamp-1">大会员 </span>
      </div>
    </div>
  </v-card>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAppStore } from '@/store/app'
import { baseStore as useBaseStore } from '@/store/base'
import { toHttps } from '@/util/fn'
import {mdiAbacus, mdiAccountEdit, mdiArrowDown} from "@mdi/js";

const { t } = useI18n()
const appStore = useAppStore()
const baseStore = useBaseStore()
const { showLogin, showControlCenter } = storeToRefs(appStore)
const { logged, loginStatus } = storeToRefs(baseStore)

function formatDate(datetime: string | number, format = 'YYYY.MM.DD') {
  return dayjs(datetime).format(format)
}
</script>
