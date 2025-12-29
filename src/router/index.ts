import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: (_to) => {
      // 如果有token，重定向到用户管理页；否则重定向到登录页
      const token = localStorage.getItem('admin-token')
      if (token && token.trim() !== '') {
        return '/users'
      }
      return '/login'
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '工作台',
    },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UserManagement.vue'),
    meta: {
      title: '用户管理',
    },
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/ProductList.vue'),
    meta: {
      title: '产品清单',
    },
  },
  {
    path: '/warehouses',
    name: 'warehouses',
    component: () => import('@/views/WarehouseList.vue'),
    meta: {
      title: '仓库清单',
    },
  },
  {
    path: '/suppliers',
    name: 'suppliers',
    component: () => import('@/views/SupplierList.vue'),
    meta: {
      title: '供应商清单',
    },
  },
  {
    path: '/permissions',
    name: 'permissions',
    component: () => import('@/views/PermissionManagement.vue'),
    meta: {
      title: '权限管理',
    },
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrderManagement.vue'),
    meta: {
      title: '订单管理',
    },
  },
  {
    path: '/content',
    name: 'ContentManagement',
    component: () => import('@/views/ContentManagement.vue'),
    meta: {
      title: '内容管理',
    },
  },
  {
    path: '/marketing',
    name: 'MarketingManagement',
    component: () => import('@/views/MarketingManagement.vue'),
    meta: {
      title: '营销管理',
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      title: '个人资料',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      title: '个人设置',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否有token
  const token = localStorage.getItem('admin-token')

  // 如果没有token且不是去登录页，则跳转到登录页
  if (!token && to.name !== 'login') {
    next({ name: 'login' })
  }
  // 如果有token且要去登录页，则跳转到首页
  else if (token && to.name === 'login') {
    next({ name: 'users' })
  }
  // 其他情况放行
  else {
    next()
  }
})

export default router
