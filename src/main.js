// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Стили
//import './assets/css/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')

// Глобальные обработчики ошибок
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue ошибка:', err, info)
}