import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './index.css'
import App from './App.vue'


const app = createApp(App)

app.use(createPinia())

createApp(App).use(router).mount('#app')