<template>
  <div class="user-profile-container" data-testid="user-profile-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><User /></el-icon>
        个人资料
      </h2>
      <p class="page-description">管理您的个人信息和账户设置</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 主要内容 -->
    <div v-else class="profile-content">
      <el-row :gutter="20">
        <!-- 左侧：头像和基本信息 -->
        <el-col :xs="24" :md="8">
          <el-card class="profile-card avatar-card">
            <div class="avatar-section">
              <div class="avatar-container">
                <el-avatar
                  :size="120"
                  :src="userForm.avatar"
                  :icon="userForm.avatar ? undefined : 'UserFilled'"
                  class="user-avatar"
                />
                <div class="avatar-upload-overlay">
                  <el-button
                    type="primary"
                    size="small"
                    @click="triggerAvatarUpload"
                    :loading="uploading"
                  >
                    <el-icon><Camera /></el-icon>
                    更换头像
                  </el-button>
                </div>
              </div>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
              <h3 class="user-name">{{ userForm.username }}</h3>
              <p class="user-role">{{ userForm.role === 'admin' ? '系统管理员' : '普通用户' }}</p>
              <el-tag :type="userForm.status === 'enabled' ? 'success' : 'danger'">
                {{ userForm.status === 'enabled' ? '正常' : '禁用' }}
              </el-tag>
            </div>
          </el-card>

          <!-- 账户安全 -->
          <el-card class="profile-card security-card">
            <template #header>
              <span class="card-title">
                <el-icon><Lock /></el-icon>
                账户安全
              </span>
            </template>
            <div class="security-info">
              <div class="security-item">
                <span class="security-label">登录密码</span>
                <el-button type="primary" size="small" @click="showPasswordDialog = true">
                  修改密码
                </el-button>
              </div>
              <div class="security-item">
                <span class="security-label">登录时间</span>
                <span class="security-value">{{ lastLoginTime }}</span>
              </div>
              <div class="security-item">
                <span class="security-label">注册时间</span>
                <span class="security-value">{{ formatDate(userForm.createTime) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：详细信息编辑 -->
        <el-col :xs="24" :md="16">
          <el-card class="profile-card">
            <template #header>
              <span class="card-title">
                <el-icon><EditPen /></el-icon>
                个人信息
              </span>
            </template>

            <el-form
              ref="profileFormRef"
              :model="userForm"
              :rules="profileRules"
              label-width="100px"
              :label-position="'top'"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input
                      v-model="userForm.username"
                      placeholder="请输入用户名"
                      :disabled="!editing"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮箱" prop="email">
                    <el-input
                      v-model="userForm.email"
                      placeholder="请输入邮箱"
                      :disabled="!editing"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="手机号" prop="phone">
                    <el-input
                      v-model="userForm.phone"
                      placeholder="请输入手机号"
                      :disabled="!editing"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="昵称" prop="nickname">
                    <el-input
                      v-model="userForm.nickname"
                      placeholder="请输入昵称"
                      :disabled="!editing"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="性别" prop="gender">
                    <el-select
                      v-model="userForm.gender"
                      placeholder="请选择性别"
                      :disabled="!editing"
                      style="width: 100%"
                    >
                      <el-option label="男" value="male" />
                      <el-option label="女" value="female" />
                      <el-option label="保密" value="secret" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="生日" prop="birthday">
                    <el-date-picker
                      v-model="userForm.birthday"
                      type="date"
                      placeholder="请选择生日"
                      :disabled="!editing"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="个人简介" prop="bio">
                <el-input
                  v-model="userForm.bio"
                  type="textarea"
                  :rows="3"
                  placeholder="介绍一下自己..."
                  :disabled="!editing"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="所在地区" prop="location">
                <el-cascader
                  v-model="userForm.location"
                  :options="locationOptions"
                  placeholder="请选择所在地区"
                  :disabled="!editing"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="个人网站" prop="website">
                <el-input
                  v-model="userForm.website"
                  placeholder="请输入个人网站"
                  :disabled="!editing"
                />
              </el-form-item>

              <el-form-item v-if="editing" class="form-actions">
                <el-button @click="cancelEdit">取消</el-button>
                <el-button type="primary" @click="saveProfile" :loading="saving">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>

            <div v-if="!editing" class="edit-actions">
              <el-button type="primary" @click="startEdit">
                <el-icon><EditPen /></el-icon>
                编辑资料
              </el-button>
            </div>
          </el-card>

          <!-- 操作记录 -->
          <el-card class="profile-card activity-card">
            <template #header>
              <span class="card-title">
                <el-icon><Clock /></el-icon>
                最近活动
              </span>
            </template>
            <div class="activity-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-icon">
                  <el-icon :color="getActivityColor(activity.type)">
                    <component :is="getActivityIcon(activity.type)" />
                  </el-icon>
                </div>
                <div class="activity-content">
                  <p class="activity-description">{{ activity.description }}</p>
                  <p class="activity-time">{{ formatDateTime(activity.time) }}</p>
                </div>
              </div>
              <div v-if="recentActivities.length === 0" class="no-activity">暂无活动记录</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="500px"
      @close="resetPasswordForm"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="changingPassword">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  User,
  Camera,
  Lock,
  EditPen,
  Clock,
  Check,
  Setting,
  Bell,
  Warning,
} from '@element-plus/icons-vue'
import { getUserProfile, updateUserProfile, changeUserPassword } from '@/services/profileService'

// 定义组件名称
defineOptions({
  name: 'UserProfile',
})

// 组件状态
const loading = ref(false)
const editing = ref(false)
const saving = ref(false)
const uploading = ref(false)
const showPasswordDialog = ref(false)
const changingPassword = ref(false)

// 表单引用
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const avatarInput = ref<HTMLInputElement>()

// 用户信息表单
const userForm = reactive({
  id: 0,
  username: '',
  email: '',
  phone: '',
  nickname: '',
  gender: '',
  birthday: '',
  bio: '',
  location: [],
  website: '',
  avatar: '',
  role: 'user',
  status: 'enabled',
  createTime: '',
})

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 账户相关变量已移除 - 暂时不需要删除账户功能

// 地区选项
const locationOptions = [
  {
    value: 'beijing',
    label: '北京市',
    children: [
      { value: 'chaoyang', label: '朝阳区' },
      { value: 'haidian', label: '海淀区' },
      { value: 'dongcheng', label: '东城区' },
    ],
  },
  {
    value: 'shanghai',
    label: '上海市',
    children: [
      { value: 'pudong', label: '浦东新区' },
      { value: 'huangpu', label: '黄浦区' },
      { value: 'xuhui', label: '徐汇区' },
    ],
  },
  {
    value: 'guangzhou',
    label: '广州市',
    children: [
      { value: 'tianhe', label: '天河区' },
      { value: 'baiyun', label: '白云区' },
      { value: 'yuexiu', label: '越秀区' },
    ],
  },
]

// 最近活动记录
const recentActivities = ref([
  {
    id: 1,
    type: 'login',
    description: '登录系统',
    time: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
  },
  {
    id: 2,
    type: 'edit',
    description: '修改个人资料',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
  },
  {
    id: 3,
    type: 'password',
    description: '修改登录密码',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
  },
])

// 表单验证规则
const profileRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  website: [{ type: 'url', message: '请输入正确的网址格式', trigger: 'blur' }],
}

const passwordRules: FormRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 计算最后登录时间
const lastLoginTime = computed(() => {
  const loginActivity = recentActivities.value.find((a) => a.type === 'login')
  return loginActivity ? formatDateTime(loginActivity.time) : '未知'
})

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (date: Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 获取活动图标
const getActivityIcon = (type: string) => {
  const iconMap = {
    login: Check,
    edit: EditPen,
    password: Lock,
    setting: Setting,
    warning: Warning,
    bell: Bell,
  }
  return iconMap[type as keyof typeof iconMap] || Clock
}

// 获取活动颜色
const getActivityColor = (type: string) => {
  const colorMap = {
    login: '#67c23a',
    edit: '#409eff',
    password: '#e6a23c',
    setting: '#909399',
    warning: '#f56c6c',
    bell: '#909399',
  }
  return colorMap[type as keyof typeof colorMap] || '#909399'
}

// 加载用户信息
const loadUserProfile = async () => {
  loading.value = true
  try {
    const profile = await getUserProfile()
    Object.assign(userForm, profile)
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 开始编辑
const startEdit = () => {
  editing.value = true
}

// 取消编辑
const cancelEdit = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的修改将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      editing.value = false
      loadUserProfile() // 重新加载数据
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 保存个人资料
const saveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
    saving.value = true

    await updateUserProfile(userForm)
    editing.value = false

    ElMessage.success('保存成功')
    await loadUserProfile()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 处理头像选择
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 验证文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB')
    return
  }

  uploading.value = true

  try {
    // 这里应该调用头像上传API
    // 暂时模拟上传成功
    const reader = new FileReader()
    reader.onload = (e) => {
      userForm.avatar = e.target?.result as string
      uploading.value = false
      ElMessage.success('头像上传成功')
    }
    reader.readAsDataURL(file)

    // 实际项目中应该使用：
    // const formData = new FormData()
    // formData.append('avatar', file)
    // const result = await uploadAvatar(formData)
    // userForm.avatar = result.url
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败')
    uploading.value = false
  }

  // 清空输入
  target.value = ''
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true

    await changeUserPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })

    showPasswordDialog.value = false
    resetPasswordForm()
    ElMessage.success('密码修改成功')
  } catch (error) {
    console.error('密码修改失败:', error)
    ElMessage.error('密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

// 组件挂载
onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.profile-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.page-description {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

.loading-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.profile-content {
  max-width: 1200px;
}

.profile-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.card-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

/* 头像卡片样式 */
.avatar-card {
  text-align: center;
}

.avatar-section {
  padding: 20px 0;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.user-avatar {
  border: 4px solid #f5f7fa;
  transition: all 0.3s;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
}

.avatar-container:hover .avatar-upload-overlay {
  opacity: 1;
}

.avatar-upload-overlay .el-button {
  color: white;
  border-color: white;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.user-role {
  color: #606266;
  font-size: 14px;
  margin: 0 0 12px 0;
}

/* 安全设置样式 */
.security-info {
  padding: 8px 0;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.security-item:last-child {
  border-bottom: none;
}

.security-label {
  font-weight: 500;
  color: #303133;
}

.security-value {
  color: #606266;
  font-size: 14px;
}

/* 活动记录样式 */
.activity-card {
  margin-top: 20px;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  margin-right: 12px;
  margin-top: 2px;
}

.activity-content {
  flex: 1;
}

.activity-description {
  color: #303133;
  font-size: 14px;
  margin: 0 0 4px 0;
}

.activity-time {
  color: #909399;
  font-size: 12px;
  margin: 0;
}

.no-activity {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 20px 0;
}

/* 表单操作按钮 */
.form-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.edit-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }

  .avatar-container {
    margin-bottom: 12px;
  }

  .user-name {
    font-size: 18px;
  }

  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .security-value {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .avatar-section {
    padding: 16px 0;
  }
}
</style>
