import Vue from 'vue'
import App from './App.vue'
const Sentry = window.require('@sentry/electron')

Sentry.init({ dsn: "https://44ff7db8ac8d44108835af6330bcb86d@o513378.ingest.sentry.io/5615143" });

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
