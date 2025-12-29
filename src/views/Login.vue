<template>
  <div class="login-container">
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="login-wrapper">
      <div class="login-brand">
        <div class="brand-logo-container">
          <div class="brand-logo-bg"></div>
          <div class="brand-logo">
            <el-icon class="brand-icon"><Management /></el-icon>
          </div>
          <div class="brand-logo-glow"></div>
        </div>
        <h1 class="brand-title">管理系统</h1>
        <p class="brand-subtitle">智能管理 · 高效办公</p>
      </div>

      <el-card class="login-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">欢迎登录</span>
          </div>
        </template>

        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
          <el-form-item prop="username" class="form-item-custom">
            <div class="input-wrapper">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                class="custom-input"
                clearable
              />
            </div>
          </el-form-item>

          <el-form-item prop="password" class="form-item-custom">
            <div class="input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                class="custom-input"
                show-password
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>

          <el-form-item class="form-item-button">
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              class="login-button"
              size="large"
            >
              <el-icon v-if="!loading"><Lock /></el-icon>
              {{ loading ? '登录中...' : '立即登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div class="login-footer">
        <p class="footer-text">© 2024 管理系统. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Management } from '@element-plus/icons-vue'
import { login } from '@/services/authService'

defineOptions({
  name: 'LoginPage',
})

// 登录表单类型定义
interface LoginForm {
  username: string
  password: string
}

// 登录表单数据
const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
})

// 登录表单验证规则
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm.username, loginForm.password)
        // 处理响应数据
        const responseData = res && ('data' in res ? res.data : res)
        if (!responseData) {
          throw new Error('登录响应格式错误')
        }
        const token = responseData.token
        if (!token) {
          throw new Error('登录响应中缺少token')
        }

        // 登录成功，保存token
        localStorage.setItem('admin-token', token)

        // 清除可能存在的旧用户信息
        localStorage.removeItem('admin-user-info')

        // 设置默认用户信息到localStorage，确保立即可用
        const defaultUserInfo = {
          username: loginForm.username,
          role: 'admin', // 默认设置为admin，确保菜单正常显示
        }
        localStorage.setItem('admin-user-info', JSON.stringify(defaultUserInfo))

        ElMessage.success('登录成功')

        // 强制刷新页面以确保状态正确更新
        await new Promise((resolve) => setTimeout(resolve, 200))
        window.location.reload()
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '登录失败'
        ElMessage.error(message)
      } finally {
        loading.value = false
      }
    } else {
      ElMessage.error('请填写正确的登录信息')
    }
  })
}
</script>

<style scoped>
/* 全局容器 */
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景动画形状 */
.background-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* 主要登录包装器 */
.login-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 450px;
  padding: 2rem;
}

/* 品牌区域 */
.login-brand {
  text-align: center;
  margin-bottom: 1rem;
}

.brand-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 85px;
  height: 85px;
  margin: 0 auto 1rem;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.brand-logo-container:hover {
  transform: translateY(-3px);
}

.brand-logo-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
  transition: all 0.3s ease;
}

.brand-logo-container:hover .brand-logo-bg {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.12);
}

.brand-logo {
  width: 60%;
  height: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
}

.brand-icon {
  font-size: 42px;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  transition: all 0.4s ease;
}

.brand-logo-container:hover .brand-icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
}

@keyframes glow {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 300;
  letter-spacing: 2px;
}

/* 登录卡片 */
.login-card {
  width: 100%;
  border-radius: 16px !important;
  border: none !important;
  backdrop-filter: blur(20px) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15) !important;
}

:deep(.el-card__header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
  padding: 2rem 2rem 1rem 2rem !important;
}

:deep(.el-card__body) {
  padding: 1rem 2rem 2rem 2rem !important;
}

.card-header {
  text-align: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

/* 表单样式 */
.login-form {
  margin-top: 0;
}

.form-item-custom {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.9);
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.input-icon {
  position: absolute;
  left: 1rem;
  z-index: 2;
  color: #909399;
  transition: color 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #667eea;
}

:deep(.custom-input .el-input__wrapper) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 1rem 1rem 1rem 3rem !important;
  border-radius: 0 !important;
  font-size: 0.95rem;
}

:deep(.custom-input .el-input__inner) {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  font-size: 0.95rem;
  color: #2c3e50;
}

:deep(.custom-input .el-input__inner::placeholder) {
  color: #909399;
}

/* 按钮样式 */
.form-item-button {
  margin-top: 2rem;
  margin-bottom: 0;
}

.login-button {
  width: 100% !important;
  height: 48px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
}

.login-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
}

.login-button:active {
  transform: translateY(0) !important;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
}

.login-button:disabled {
  opacity: 0.7;
  transform: none !important;
}

/* 页脚 */
.login-footer {
  text-align: center;
  margin-top: 1rem;
}

.footer-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 300;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-wrapper {
    padding: 1rem;
    max-width: 350px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .brand-subtitle {
    font-size: 0.9rem;
  }

  :deep(.el-card__body) {
    padding: 1rem 1.5rem 1.5rem 1.5rem !important;
  }

  :deep(.el-card__header) {
    padding: 1.5rem 1.5rem 1rem 1.5rem !important;
  }
}

@media (max-width: 480px) {
  .login-wrapper {
    padding: 0.5rem;
    max-width: 320px;
  }

  .brand-logo-container {
    width: 70px;
    height: 70px;
  }

  .brand-title {
    font-size: 1.75rem;
  }

  :deep(.el-button) {
    height: 44px !important;
    font-size: 0.9rem !important;
  }
}
</style>
