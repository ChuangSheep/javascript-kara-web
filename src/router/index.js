import Vue from 'vue'
import VueRouter from 'vue-router'
import Playground from '@/views/Playground.vue';
import Coding from '@/views/Coding.vue';
import Help from '@/views/Help.vue';



Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/playground'
  },
  {
    path: '/playground',
    name: 'Playground',
    component: Playground
  },
  {
    path: '/coding',
    name: 'Coding',
    component: Coding
  },
  {
    path: '/help',
    name: 'Help',
    component: Help
  }
]

const router = new VueRouter({
  routes
})

export default router
