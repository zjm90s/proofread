import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/Layout.vue'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/textDiff'
    },
    {
      path: '/welcome',
      component: Layout,
      children: [{
        path: '',
        component: () => import('@/views/Welcome.vue'),
        name: 'welcome',
        meta: { title: 'welcome', keepAlive: false }
      }]
    },
    {
      path: '/textDiff',
      component: Layout,
      children: [{
        path: '',
        component: () => import('@/views/TextDiff.vue'),
        name: 'textDiff',
        meta: { title: 'textDiff', keepAlive: true }
      }]
    },
    {
      path: '/pdfDiff',
      component: Layout,
      children: [{
        path: '',
        component: () => import('@/views/PDFDiff.vue'),
        name: 'pdfDiff',
        meta: { title: 'pdfDiff', keepAlive: true }
      }]
    },
    {
      path: '/refDupCheck',
      component: Layout,
      children: [{
        path: '',
        component: () => import('@/views/RefDupCheck.vue'),
        name: 'refDupCheck',
        meta: { title: 'refDupCheck', keepAlive: true }
      }]
    }
  ]
})

export default router
