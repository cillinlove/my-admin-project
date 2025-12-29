<template>
  <div class="app-wrapper" :class="{ hideSidebar: !sidebarOpened }">
    <!-- 只在非登录页面显示管理界面 -->
    <template v-if="isLoggedIn && $route.name !== 'login'">
      <!-- 侧边栏 -->
      <el-aside class="sidebar-container">
        <div class="sidebar-logo">
          <el-icon class="sidebar-logo-icon"><Management /></el-icon>
          <span v-if="sidebarOpened">管理系统</span>
        </div>

        <!-- 侧边栏内部切换按钮 -->
        <div class="sidebar-toggle" @click="toggleSidebar">
          <el-icon class="sidebar-toggle-icon">
            <Fold v-if="sidebarOpened" />
            <Expand v-else />
          </el-icon>
          <span v-if="sidebarOpened" class="sidebar-toggle-text">收起菜单</span>
        </div>

        <el-menu
          :default-active="$route.path"
          :collapse="!sidebarOpened"
          :unique-opened="true"
          collapse-transition
          router
          class="el-menu--collapse"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Monitor /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>

          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <template #title>产品清单</template>
          </el-menu-item>
          <el-menu-item index="/warehouses">
            <el-icon><House /></el-icon>
            <template #title>仓库清单</template>
          </el-menu-item>
          <el-menu-item index="/suppliers">
            <el-icon><OfficeBuilding /></el-icon>
            <template #title>供应商清单</template>
          </el-menu-item>

          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <template #title>订单管理</template>
          </el-menu-item>
          <el-menu-item index="/marketing">
            <el-icon><Promotion /></el-icon>
            <template #title>营销管理</template>
          </el-menu-item>
          <el-menu-item index="/content">
            <el-icon><Reading /></el-icon>
            <template #title>内容管理</template>
          </el-menu-item>

          <el-menu-item index="/permissions" v-if="userRole === 'admin'">
            <el-icon><Setting /></el-icon>
            <template #title>权限管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主体区域 -->
      <el-container>
        <!-- 头部导航 -->
        <el-header class="navbar">
          <div class="navbar-left">
            <el-icon class="menu-toggle" @click="toggleSidebar">
              <Expand v-if="!sidebarOpened" />
              <Fold v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div class="navbar-right">
            <!-- 用户头像和下拉菜单 -->
            <el-dropdown trigger="click" @command="handleCommand">
              <span class="user-info">
                <el-avatar
                  :size="32"
                  :src="userAvatar || undefined"
                  :icon="userAvatar ? undefined : 'UserFilled'"
                  class="user-avatar"
                />
                <div v-if="sidebarOpened" class="user-details">
                  <div class="user-name">{{ userName }}</div>
                  <div class="user-role">{{ userRole === 'admin' ? '管理员' : '普通用户' }}</div>
                </div>
                <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile" divided>
                    <el-icon><User /></el-icon>
                    个人资料
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    个人设置
                  </el-dropdown-item>
                  <el-dropdown-item command="help">
                    <el-icon><QuestionFilled /></el-icon>
                    帮助中心
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout" class="logout-item">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区域 -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </template>

    <!-- 登录页面或其他页面 -->
    <router-view v-if="!isLoggedIn || $route.name === 'login'" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  Expand,
  Fold,
  Setting,
  Goods,
  House,
  OfficeBuilding,
  List,
  Monitor,
  Promotion,
  Reading,
  ArrowDown,
  QuestionFilled,
  SwitchButton,
  Management,
} from '@element-plus/icons-vue'
import { getUserInfo } from '@/services/authService'
import { ElMessage } from 'element-plus'

// 用户信息接口
interface UserInfo {
  username: string
  role: string
  avatar?: string
  email?: string
}

// 获取路由器
const router = useRouter()

// 判断是否已登录
const isLoggedIn = computed(() => {
  const token = localStorage.getItem('admin-token')
  console.log('检查登录状态，token存在:', !!token)
  return token !== null && token !== ''
})

// 侧边栏展开状态
const sidebarOpened = ref(true)

// 用户信息（从API获取）
const userName = ref('用户')
const userRole = ref('user') // admin 或 user
const userAvatar = ref<string | null>(null)

// 从API获取用户信息
const fetchUserInfo = async () => {
  // 首先检查是否有token
  const token = localStorage.getItem('admin-token')
  if (!token) {
    console.log('没有token，清除用户信息状态')
    userName.value = '用户'
    userRole.value = 'user'
    userAvatar.value = null
    return
  }

  // 先从localStorage检查是否有缓存的用户信息
  const cachedUserInfo = localStorage.getItem('admin-user-info')
  if (cachedUserInfo) {
    try {
      const userInfo = JSON.parse(cachedUserInfo)
      userName.value = userInfo.username || '用户'
      userRole.value = userInfo.role || 'user'
      userAvatar.value = userInfo.avatar || null
      console.log('使用缓存的用户信息:', userInfo)
      return
    } catch {
      console.log('解析缓存用户信息失败，继续获取')
    }
  }

  try {
    console.log('开始获取用户信息...')
    const res = await getUserInfo()
    console.log('用户信息响应:', res)

    // 检查返回的数据是否是对象，而不是Axios响应
    if (typeof res === 'object' && res !== null && !('data' in res)) {
      const userInfo = res as UserInfo
      userName.value = userInfo.username || '用户'
      userRole.value = userInfo.role || 'user'
      userAvatar.value = userInfo.avatar || null

      // 保存用户信息到localStorage
      localStorage.setItem('admin-user-info', JSON.stringify(userInfo))

      console.log('用户信息获取成功:', userInfo)
    } else {
      // 如果获取失败，使用默认信息
      console.log('使用默认用户信息')
      userName.value = '用户'
      userRole.value = 'admin'
      userAvatar.value = null
      localStorage.setItem(
        'admin-user-info',
        JSON.stringify({
          username: '用户',
          role: 'admin',
          avatar: null,
        }),
      )
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 如果获取失败，使用默认信息
    userName.value = '用户'
    userRole.value = 'admin'
    userAvatar.value = null
    localStorage.setItem(
      'admin-user-info',
      JSON.stringify({
        username: '用户',
        role: 'admin',
        avatar: null,
      }),
    )
  }
}

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      // 跳转到个人资料页面
      await router.push('/profile')
      break
    case 'settings':
      // 跳转到个人设置页面
      await router.push('/settings')
      break
    case 'help':
      // 显示帮助信息
      ElMessage.info('帮助中心功能正在开发中...')
      break
    case 'logout':
      // 退出登录
      await logout()
      break
    default:
      console.log('未知命令:', command)
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpened.value = !sidebarOpened.value
}

// 退出登录
const logout = async () => {
  try {
    // 1. 清除所有本地存储的用户信息
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-user-info')

    // 2. 清除用户信息状态
    userName.value = '用户'
    userRole.value = 'user'

    // 3. 跳转到登录页
    await router.push('/login')

    // 4. 延迟检查是否跳转成功，如果失败则强制刷新
    setTimeout(() => {
      if (localStorage.getItem('admin-token')) {
        console.log('检测到token未清除，强制刷新页面')
        window.location.href = '/login'
      }
    }, 500)
  } catch (error) {
    console.error('退出登录失败:', error)
    // 即使出错也要强制跳转到登录页
    window.location.href = '/login'
  }
}

// 处理登录成功事件
const handleLoginSuccess = () => {
  console.log('收到登录成功事件，刷新用户信息')
  // 立即重新获取用户信息
  setTimeout(() => {
    fetchUserInfo()
  }, 100)
}

// 处理localStorage变化事件
const handleStorageChange = (e: StorageEvent) => {
  console.log('检测到localStorage变化:', e.key, e.newValue)
  if (e.key === 'admin-token') {
    console.log('检测到token变化，刷新用户信息')
    setTimeout(() => {
      fetchUserInfo()
    }, 100)
  }
  if (e.key === 'admin-user-info' && e.newValue) {
    console.log('检测到用户信息变化，更新状态')
    try {
      const userInfo = JSON.parse(e.newValue)
      userName.value = userInfo.username || '用户'
      userRole.value = userInfo.role || 'user'
      userAvatar.value = userInfo.avatar || null
    } catch (error) {
      console.error('解析用户信息失败:', error)
    }
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  // 首先检查是否已登录，如果是则获取用户信息
  if (isLoggedIn.value) {
    console.log('组件挂载时已检测到登录状态，立即获取用户信息')
    fetchUserInfo()
  } else {
    console.log('组件挂载时未检测到登录状态')
  }

  // 监听登录成功事件
  window.addEventListener('login-success', handleLoginSuccess)

  // 额外监听localStorage变化，确保及时更新登录状态
  window.addEventListener('storage', handleStorageChange)
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  window.removeEventListener('login-success', handleLoginSuccess)
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  transition: all 0.3s;
}

.sidebar-container {
  background-color: #304156;
  transition: width 0.28s;
  width: 200px !important;
  height: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
}

.sidebar-container .el-menu {
  border: none;
  height: 100%;
  width: 100% !important;
}

.hideSidebar .sidebar-container {
  width: 64px !important;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4d;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  transition: all 0.3s;
}

.hideSidebar .sidebar-logo {
  justify-content: center;
}

.sidebar-logo-icon {
  font-size: 28px;
  color: #fff;
  margin-right: 8px;
  transition: all 0.3s;
}

.hideSidebar .sidebar-logo-icon {
  margin-right: 0;
}

/* 侧边栏内部切换按钮 */
.sidebar-toggle {
  display: flex;
  align-items: center;
  height: 40px;
  background-color: #2b3a4d;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0 16px;
  color: #fff;
  border-bottom: 1px solid #435266;
}

.sidebar-toggle:hover {
  background-color: #3a4a5f;
}

.sidebar-toggle-icon {
  font-size: 16px;
  color: #fff;
  transition: all 0.3s;
}

.sidebar-toggle-text {
  margin-left: 12px;
  font-size: 14px;
  color: #fff;
  transition: all 0.3s;
  white-space: nowrap;
}

.hideSidebar .sidebar-toggle {
  justify-content: center;
  padding: 0;
}

.hideSidebar .sidebar-toggle-text {
  display: none;
}

.hideSidebar .sidebar-toggle-icon {
  margin: 0;
}

.navbar {
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
  transition: all 0.3s;
}

.menu-toggle {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  position: relative;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  border: 2px solid #e4e7ed;
  transition: all 0.3s;
}

.user-info:hover .user-avatar {
  border-color: #409eff;
}

.user-details {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  margin-top: 2px;
}

.dropdown-arrow {
  margin-left: 8px;
  color: #909399;
  transition: transform 0.3s;
  font-size: 12px;
}

.el-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
  color: #409eff;
}

.hideSidebar .user-details {
  display: none;
}

.hideSidebar .dropdown-arrow {
  display: none;
}

/* 下拉菜单项样式优化 */
.logout-item {
  color: #f56c6c;
}

.logout-item:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

.logout-item .el-icon {
  margin-right: 8px;
}

/* 自定义下拉菜单项间距 */
.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  padding: 8px 20px;
}

.el-dropdown-menu__item .el-icon {
  margin-right: 8px;
  width: 16px;
}

.el-dropdown-menu__item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.el-main {
  background-color: #f5f5f5;
  margin-top: 60px;
  margin-left: 200px;
  transition: margin-left 0.28s;
  min-height: calc(100vh - 60px);
}

.hideSidebar .el-main {
  margin-left: 64px;
}
</style>
