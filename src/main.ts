import { createApp } from 'vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .use(Toast, {
    timeout: 3000,
    position: 'bottom-right'
  })
  .mount('#app')
