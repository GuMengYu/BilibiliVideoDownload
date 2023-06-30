// import { createApp } from 'vue'
// import { pinia } from './store'
// import App from './App.vue'
// import router from './router'
// import Antd from 'ant-design-vue'
// import 'ant-design-vue/dist/antd.less'
// import './assets/style/main.less'
//
// const app = createApp(App)
// app.use(router)
// app.use(Antd)
// app.use(pinia)
// app.mount('#app')

import { createApp } from 'vue'

import App from './App.vue'
// plugins
import { useDayjs } from './plugins/dayjs'
import { useElectron } from './plugins/electron'
import { useI18n } from './plugins/i18n'
import { usePinia } from './plugins/pinia'
import { useToast } from './plugins/toast'
import { useVuetify } from './plugins/vuetify'
import { useFonts } from './plugins/webfontloader'
import { useRouter } from './router'
import './styles/animate.scss'
import './styles/global.scss'
import './styles/utility.scss'

import is from '@/util/is'

// 加载css fonts等资源
useFonts()
const app = createApp(App)
const router = useRouter(app)

usePinia(app)
useVuetify(app)
useI18n(app)
useToast(app)
useDayjs(app)
useElectron(router)
app
  .mount('#app')
  .$nextTick()
  .then(() => {
    if (is.electron()) {
      postMessage({ payload: 'removeLoading' }, '*')
    }
  })
