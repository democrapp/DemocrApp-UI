import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

Sentry.init({
  dsn: 'https://d6e4c11f6e97429da425d286c4670cd3@sentry.io/1297356',
  integrations: [new Integrations.Vue({Vue, attachProps: true})],
});

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
