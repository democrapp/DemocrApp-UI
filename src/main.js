import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.config.productionTip = false
Vue.use(require('vue-cookies'))
Vue.use(VueAxios, axios)


Vue.directive('bubble', {
  bind: (el, { arg, value = null }, vnode) => {
    vnode.componentInstance.$on(arg, (...args) => {
      vnode.context.$emit(value === null ? arg : value, ...args);
    });},
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
