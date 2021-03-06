import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Passive Event Listeners
import 'default-passive-events'

import '@/plugins'
import '@/styles/index.scss'

import '@/layout/export'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
