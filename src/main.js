import { createApp, reactive } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import "./styles/index.scss"

const app = createApp(App)

app.use(router)
app.use(ElementPlus)

app.provide('$globalState', reactive({
    vip: false,
    settingVisible: false
}))

app.mount('#app')
