import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.config.productionTip = false
Vue.use(require('vue-cookies'))
Vue.use(VueAxios, axios)


Vue.directive('bubble', (el, binding, vnode) => {
  Object.keys(binding.modifiers).forEach(event => {
    // Bubble events of Vue components
    if (vnode.componentInstance) {
      vnode.componentInstance.$on(event, (...args) => {
        vnode.context.$emit(event, ...args)
      })

    // Bubble events of native DOM elements
    } else {
      el.addEventListener(event, payload => {
        vnode.context.$emit(event, payload)
      })
    }
  })
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
