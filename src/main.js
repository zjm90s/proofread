import { createApp, reactive } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import "./styles/index.scss"

const app = createApp(App)

app.use(router)
app.use(ElementPlus)

// 全局状态
app.provide('$globalState', reactive({
    vip: false,
    settingVisible: false
}))

// 异常处理器
app.config.errorHandler = (err, vm, info) => {
    ElMessage.error(err.message)
}

app.mount('#app')
