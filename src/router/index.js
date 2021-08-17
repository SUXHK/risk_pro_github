import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
const originalPush = VueRouter.prototype.push

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export const constantRoutes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/dashboard',
    component: () =>
      import(/* webpackChunkName: "Risk-Home" */ '@/layout/index.vue'),
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        redirect: '/dashboard',
        component: () =>
          import(
            /* webpackChunkName: "Risk-User" */ '@/layout/EmptyLayout.vue'
          ),
        // meta: { title: '首页' },
        children: [
          {
            path: '',
            meta: { title: '仪表盘' },
            component: () =>
              import(
                /* webpackChunkName: "Risk-User" */ '@/views/dashboard/dashboard.vue'
              )
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    meta: { title: '登录' },
    component: () =>
      import(/* webpackChunkName: "Risk-Login" */ '@/views/login/index.vue')
  }
]

const createRouter = () =>
  new VueRouter({
    routes: constantRoutes
  })

const router = createRouter()
// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}
export default router
