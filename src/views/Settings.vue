<template>
  <div class="user-settings-container" data-testid="user-settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Setting /></el-icon>
        个人设置
      </h2>
      <p class="page-description">自定义您的个性化设置和偏好选项</p>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <el-row :gutter="20">
        <!-- 左侧设置分类 -->
        <el-col :xs="24" :md="6">
          <el-card class="settings-sidebar">
            <el-menu :default-active="activeTab" @select="handleTabChange" class="settings-menu">
              <el-menu-item index="appearance">
                <el-icon><Monitor /></el-icon>
                <span>外观设置</span>
              </el-menu-item>
              <el-menu-item index="notification">
                <el-icon><Bell /></el-icon>
                <span>通知设置</span>
              </el-menu-item>
              <el-menu-item index="privacy">
                <el-icon><Lock /></el-icon>
                <span>隐私设置</span>
              </el-menu-item>
              <el-menu-item index="security">
                <el-icon><Shield /></el-icon>
                <span>安全设置</span>
              </el-menu-item>
              <el-menu-item index="preference">
                <el-icon><Tools /></el-icon>
                <span>偏好设置</span>
              </el-menu-item>
              <el-menu-item index="backup">
                <el-icon><Download /></el-icon>
                <span>数据管理</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <!-- 右侧设置详情 -->
        <el-col :xs="24" :md="18">
          <!-- 外观设置 -->
          <el-card v-show="activeTab === 'appearance'" class="settings-card">
            <template #header>
              <span class="card-title">
                <el-icon><Monitor /></el-icon>
                外观设置
              </span>
            </template>

            <div class="setting-group">
              <h3 class="setting-title">主题模式</h3>
              <div class="theme-options">
                <div
                  v-for="theme in themeOptions"
                  :key="theme.value"
                  class="theme-option"
                  :class="{ active: settings.theme === theme.value }"
                  @click="updateSetting('theme', theme.value)"
                >
                  <div class="theme-preview">
                    <div class="theme-header" :class="theme.value"></div>
                    <div class="theme-content" :class="theme.value"></div>
                  </div>
                  <div class="theme-label">{{ theme.label }}</div>
                  <el-icon v-if="settings.theme === theme.value" class="theme-check">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">侧边栏</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">自动折叠侧边栏</span>
                  <p class="setting-description">鼠标移开后自动折叠侧边栏</p>
                </div>
                <el-switch
                  v-model="settings.autoCollapseSidebar"
                  @change="updateSetting('autoCollapseSidebar', settings.autoCollapseSidebar)"
                />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">侧边栏主题色</span>
                  <p class="setting-description">自定义侧边栏的主题颜色</p>
                </div>
                <el-color-picker
                  v-model="settings.sidebarColor"
                  @change="updateSetting('sidebarColor', settings.sidebarColor)"
                />
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">字体设置</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">字体大小</span>
                  <p class="setting-description">调整界面字体大小</p>
                </div>
                <el-slider
                  v-model="settings.fontSize"
                  :min="12"
                  :max="18"
                  :step="1"
                  show-stops
                  style="width: 200px"
                  @change="updateSetting('fontSize', settings.fontSize)"
                />
                <span class="font-size-value">{{ settings.fontSize }}px</span>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">字体类型</span>
                  <p class="setting-description">选择界面字体</p>
                </div>
                <el-select
                  v-model="settings.fontFamily"
                  style="width: 150px"
                  @change="updateSetting('fontFamily', settings.fontFamily)"
                >
                  <el-option
                    v-for="font in fontOptions"
                    :key="font.value"
                    :label="font.label"
                    :value="font.value"
                  />
                </el-select>
              </div>
            </div>
          </el-card>

          <!-- 通知设置 -->
          <el-card v-show="activeTab === 'notification'" class="settings-card">
            <template #header>
              <span class="card-title">
                <el-icon><Bell /></el-icon>
                通知设置
              </span>
            </template>

            <div class="setting-group">
              <h3 class="setting-title">消息通知</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">桌面通知</span>
                  <p class="setting-description">允许在桌面显示通知消息</p>
                </div>
                <el-switch
                  v-model="settings.desktopNotifications"
                  @change="updateSetting('desktopNotifications', settings.desktopNotifications)"
                />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">声音提醒</span>
                  <p class="setting-description">接收消息时播放提示音</p>
                </div>
                <el-switch
                  v-model="settings.soundNotifications"
                  @change="updateSetting('soundNotifications', settings.soundNotifications)"
                />
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">邮件通知</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">系统更新通知</span>
                  <p class="setting-description">接收系统更新和重要通知</p>
                </div>
                <el-switch
                  v-model="settings.emailSystemUpdates"
                  @change="updateSetting('emailSystemUpdates', settings.emailSystemUpdates)"
                />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">安全提醒</span>
                  <p class="setting-description">接收账户安全相关提醒</p>
                </div>
                <el-switch
                  v-model="settings.emailSecurityAlerts"
                  @change="updateSetting('emailSecurityAlerts', settings.emailSecurityAlerts)"
                />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">营销邮件</span>
                  <p class="setting-description">接收产品更新和营销信息</p>
                </div>
                <el-switch
                  v-model="settings.emailMarketing"
                  @change="updateSetting('emailMarketing', settings.emailMarketing)"
                />
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">推送时间</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">免打扰时段</span>
                  <p class="setting-description">设置免打扰时间段</p>
                </div>
                <div class="time-range">
                  <el-time-picker
                    v-model="settings.doNotDisturbStart"
                    format="HH:mm"
                    placeholder="开始时间"
                    @change="updateSetting('doNotDisturbStart', settings.doNotDisturbStart)"
                  />
                  <span class="time-separator">至</span>
                  <el-time-picker
                    v-model="settings.doNotDisturbEnd"
                    format="HH:mm"
                    placeholder="结束时间"
                    @change="updateSetting('doNotDisturbEnd', settings.doNotDisturbEnd)"
                  />
                </div>
              </div>
            </div>
          </el-card>

          <!-- 隐私设置 -->
          <el-card v-show="activeTab === 'privacy'" class="settings-card">
            <template #header>
              <span class="card-title">
                <el-icon><Lock /></el-icon>
                隐私设置
              </span>
            </template>

            <div class="setting-group">
              <h3 class="setting-title">个人信息可见性</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">显示在线状态</span>
                  <p class="setting-description">让其他人看到您的在线状态</p>
                </div>
                <el-switch
                  v-model="settings.showOnlineStatus"
                  @change="updateSetting('showOnlineStatus', settings.showOnlineStatus)"
                />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">显示最后活动时间</span>
                  <p class="setting-description">显示您的最后活动时间</p>
                </div>
                <el-switch
                  v-model="settings.showLastActive"
                  @change="updateSetting('showLastActive', settings.showLastActive)"
                />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">允许搜索</span>
                  <p class="setting-description">允许其他用户通过搜索找到您</p>
                </div>
                <el-switch
                  v-model="settings.allowSearch"
                  @change="updateSetting('allowSearch', settings.allowSearch)"
                />
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">数据收集</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">使用统计</span>
                  <p class="setting-description">允许收集使用统计以改善服务</p>
                </div>
                <el-switch
                  v-model="settings.usageStatistics"
                  @change="updateSetting('usageStatistics', settings.usageStatistics)"
                />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">错误报告</span>
                  <p class="setting-description">自动发送错误报告帮助我们改进</p>
                </div>
                <el-switch
                  v-model="settings.errorReporting"
                  @change="updateSetting('errorReporting', settings.errorReporting)"
                />
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">第三方服务</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Google Analytics</span>
                  <p class="setting-description">使用 Google Analytics 追踪使用情况</p>
                </div>
                <el-switch
                  v-model="settings.googleAnalytics"
                  @change="updateSetting('googleAnalytics', settings.googleAnalytics)"
                />
              </div>
            </div>
          </el-card>

          <!-- 安全设置 -->
          <el-card v-show="activeTab === 'security'" class="settings-card">
            <template #header>
              <span class="card-title">
                <el-icon><Shield /></el-icon>
                安全设置
              </span>
            </template>

            <div class="setting-group">
              <h3 class="setting-title">登录安全</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">两步验证</span>
                  <p class="setting-description">启用两步验证提高账户安全性</p>
                </div>
                <el-switch
                  v-model="settings.twoFactorAuth"
                  @change="updateSetting('twoFactorAuth', settings.twoFactorAuth)"
                />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">登录通知</span>
                  <p class="setting-description">新设备登录时发送邮件通知</p>
                </div>
                <el-switch
                  v-model="settings.loginNotifications"
                  @change="updateSetting('loginNotifications', settings.loginNotifications)"
                />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">会话超时</span>
                  <p class="setting-description">设置会话超时时间（分钟）</p>
                </div>
                <el-input-number
                  v-model="settings.sessionTimeout"
                  :min="15"
                  :max="480"
                  :step="15"
                  @change="updateSetting('sessionTimeout', settings.sessionTimeout)"
                />
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">设备管理</h3>
              <div class="device-list">
                <div v-for="device in trustedDevices" :key="device.id" class="device-item">
                  <div class="device-info">
                    <el-icon class="device-icon">
                      <Monitor v-if="device.type === 'desktop'" />
                      <Ipad v-else-if="device.type === 'tablet'" />
                      <Phone v-else />
                    </el-icon>
                    <div class="device-details">
                      <span class="device-name">{{ device.name }}</span>
                      <span class="device-location">{{ device.location }}</span>
                      <span class="device-time">{{ formatDateTime(device.lastActive) }}</span>
                    </div>
                  </div>
                  <el-button type="danger" size="small" @click="revokeDevice(device.id)">
                    撤销
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 偏好设置 -->
          <el-card v-show="activeTab === 'preference'" class="settings-card">
            <template #header>
              <span class="card-title">
                <el-icon><Tools /></el-icon>
                偏好设置
              </span>
            </template>

            <div class="setting-group">
              <h3 class="setting-title">界面偏好</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">语言</span>
                  <p class="setting-description">选择界面语言</p>
                </div>
                <el-select
                  v-model="settings.language"
                  style="width: 150px"
                  @change="updateSetting('language', settings.language)"
                >
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                  <el-option label="繁體中文" value="zh-TW" />
                </el-select>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">时区</span>
                  <p class="setting-description">选择您的时区</p>
                </div>
                <el-select
                  v-model="settings.timezone"
                  style="width: 200px"
                  @change="updateSetting('timezone', settings.timezone)"
                >
                  <el-option label="中国标准时间 (UTC+8)" value="Asia/Shanghai" />
                  <el-option label="协调世界时 (UTC+0)" value="UTC" />
                  <el-option label="美国东部时间 (UTC-5)" value="America/New_York" />
                  <el-option label="太平洋时间 (UTC-8)" value="America/Los_Angeles" />
                </el-select>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">日期格式</span>
                  <p class="setting-description">选择日期显示格式</p>
                </div>
                <el-select
                  v-model="settings.dateFormat"
                  style="width: 150px"
                  @change="updateSetting('dateFormat', settings.dateFormat)"
                >
                  <el-option label="2024-12-29" value="YYYY-MM-DD" />
                  <el-option label="12/29/2024" value="MM/DD/YYYY" />
                  <el-option label="29/12/2024" value="DD/MM/YYYY" />
                </el-select>
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">工作偏好</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">每页显示条数</span>
                  <p class="setting-description">设置表格和列表的默认显示条数</p>
                </div>
                <el-select
                  v-model="settings.pageSize"
                  style="width: 100px"
                  @change="updateSetting('pageSize', settings.pageSize)"
                >
                  <el-option label="10" :value="10" />
                  <el-option label="20" :value="20" />
                  <el-option label="50" :value="50" />
                  <el-option label="100" :value="100" />
                </el-select>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">数据自动保存</span>
                  <p class="setting-description">表单数据自动保存到本地</p>
                </div>
                <el-switch
                  v-model="settings.autoSave"
                  @change="updateSetting('autoSave', settings.autoSave)"
                />
              </div>
            </div>
          </el-card>

          <!-- 数据管理 -->
          <el-card v-show="activeTab === 'backup'" class="settings-card">
            <template #header>
              <span class="card-title">
                <el-icon><Download /></el-icon>
                数据管理
              </span>
            </template>

            <div class="setting-group">
              <h3 class="setting-title">数据导出</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">导出用户数据</span>
                  <p class="setting-description">下载您的所有账户数据</p>
                </div>
                <el-button type="primary" @click="handleExportUserData">
                  <el-icon><Download /></el-icon>
                  导出数据
                </el-button>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">导出设置</span>
                  <p class="setting-description">备份您的个性化设置</p>
                </div>
                <el-button @click="exportSettings">
                  <el-icon><Document /></el-icon>
                  导出设置
                </el-button>
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">数据清理</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">清理缓存</span>
                  <p class="setting-description">清理应用缓存和临时文件</p>
                </div>
                <el-button @click="clearCache">
                  <el-icon><Delete /></el-icon>
                  清理缓存
                </el-button>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">重置所有设置</span>
                  <p class="setting-description">将所有设置恢复为默认值</p>
                </div>
                <el-button type="warning" @click="resetAllSettings">
                  <el-icon><RefreshLeft /></el-icon>
                  重置设置
                </el-button>
              </div>
            </div>

            <el-divider />

            <div class="setting-group">
              <h3 class="setting-title">危险操作</h3>
              <div class="danger-zone">
                <div class="danger-item">
                  <div class="danger-info">
                    <h4>删除账户</h4>
                    <p>永久删除您的账户和所有相关数据。此操作不可撤销！</p>
                  </div>
                  <el-button type="danger" @click="showDeleteAccountDialog = true">
                    <el-icon><DeleteFilled /></el-icon>
                    删除账户
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 删除账户确认对话框 -->
    <el-dialog
      v-model="showDeleteAccountDialog"
      title="删除账户"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="delete-account-warning">
        <el-alert title="危险操作" type="error" :closable="false" show-icon>
          <template #default>
            <p>删除账户将永久删除您的所有数据，包括：</p>
            <ul>
              <li>个人资料和设置</li>
              <li>账户历史记录</li>
              <li>相关业务数据</li>
            </ul>
            <p><strong>此操作不可撤销！</strong></p>
          </template>
        </el-alert>

        <el-form
          ref="deleteFormRef"
          :model="deleteForm"
          :rules="deleteRules"
          style="margin-top: 16px"
        >
          <el-form-item label="请输入您的密码以确认" prop="password">
            <el-input
              v-model="deleteForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="请输入 DELETE 以确认" prop="confirmation">
            <el-input v-model="deleteForm.confirmation" placeholder="请输入 DELETE" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteAccountDialog = false">取消</el-button>
          <el-button type="danger" @click="deleteAccount" :loading="deleting"> 确认删除 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Setting,
  Monitor,
  Bell,
  Lock,
  Tools,
  Download,
  Check,
  Phone,
  Document,
  Delete,
  RefreshLeft,
  DeleteFilled,
  Monitor as Shield,
  Monitor as Ipad,
} from '@element-plus/icons-vue'
import { getUserSettings, exportUserData, deleteUserAccount } from '@/services/profileService'

// 定义组件名称
defineOptions({
  name: 'UserSettings',
})

// 组件状态
const activeTab = ref('appearance')
const showDeleteAccountDialog = ref(false)
const deleting = ref(false)

// 表单引用
const deleteFormRef = ref<FormInstance>()

// 删除账户表单
const deleteForm = reactive({
  password: '',
  confirmation: '',
})

// 主题选项
const themeOptions = [
  { value: 'light', label: '浅色主题' },
  { value: 'dark', label: '深色主题' },
  { value: 'auto', label: '跟随系统' },
]

// 字体选项
const fontOptions = [
  { value: 'system', label: '系统默认' },
  { value: 'serif', label: '宋体' },
  { value: 'sans-serif', label: '黑体' },
  { value: 'monospace', label: '等宽字体' },
]

// 用户设置
const settings = reactive({
  theme: 'light',
  autoCollapseSidebar: false,
  sidebarColor: '#304156',
  fontSize: 14,
  fontFamily: 'system',
  desktopNotifications: true,
  soundNotifications: true,
  emailSystemUpdates: true,
  emailSecurityAlerts: true,
  emailMarketing: false,
  doNotDisturbStart: null as string | null,
  doNotDisturbEnd: null as string | null,
  showOnlineStatus: true,
  showLastActive: false,
  allowSearch: true,
  usageStatistics: true,
  errorReporting: true,
  googleAnalytics: false,
  twoFactorAuth: false,
  loginNotifications: true,
  sessionTimeout: 120,
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  pageSize: 20,
  autoSave: true,
})

// 可信设备列表
const trustedDevices = ref([
  {
    id: 1,
    name: 'MacBook Pro',
    type: 'desktop',
    location: '北京, 中国',
    lastActive: new Date(),
  },
  {
    id: 2,
    name: 'iPhone 15',
    type: 'phone',
    location: '北京, 中国',
    lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
  },
])

// 删除账户表单验证规则
const deleteRules: FormRules = {
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmation: [
    { required: true, message: '请输入 DELETE', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== 'DELETE') {
          callback(new Error('请输入正确的确认文字'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 格式化日期时间
const formatDateTime = (date: Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 处理标签切换
const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

// 更新设置
const updateSetting = (key: string, value: unknown) => {
  ;(settings as Record<string, unknown>)[key] = value
  // 这里应该调用API保存设置
  saveSettings()
}

// 保存设置
const saveSettings = async () => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))
    ElMessage.success('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

// 加载设置
const loadSettings = async () => {
  try {
    const userSettings = await getUserSettings()
    Object.assign(settings, userSettings)
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 撤销设备
const revokeDevice = async (deviceId: number) => {
  try {
    await ElMessageBox.confirm('确定要撤销此设备的访问权限吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 从列表中移除设备
    const index = trustedDevices.value.findIndex((device) => device.id === deviceId)
    if (index > -1) {
      trustedDevices.value.splice(index, 1)
    }

    ElMessage.success('设备访问权限已撤销')
  } catch {
    // 用户取消操作
  }
}

// 导出用户数据
const handleExportUserData = async () => {
  try {
    ElMessage.info('正在准备导出数据...')
    await exportUserData()
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 导出设置
const exportSettings = () => {
  const dataStr = JSON.stringify(settings, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `settings-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  ElMessage.success('设置导出成功')
}

// 清理缓存
const clearCache = async () => {
  try {
    ElMessage.info('正在清理缓存...')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    ElMessage.success('缓存清理完成')
  } catch (error) {
    console.error('清理缓存失败:', error)
    ElMessage.error('清理缓存失败')
  }
}

// 重置所有设置
const resetAllSettings = async () => {
  try {
    await ElMessageBox.confirm('确定要重置所有设置吗？此操作不可撤销！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 重置为默认设置
    Object.assign(settings, {
      theme: 'light',
      autoCollapseSidebar: false,
      sidebarColor: '#304156',
      fontSize: 14,
      fontFamily: 'system',
      desktopNotifications: true,
      soundNotifications: true,
      emailSystemUpdates: true,
      emailSecurityAlerts: true,
      emailMarketing: false,
      showOnlineStatus: true,
      showLastActive: false,
      allowSearch: true,
      usageStatistics: true,
      errorReporting: true,
      googleAnalytics: false,
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 120,
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      pageSize: 20,
      autoSave: true,
    })

    ElMessage.success('设置已重置')
  } catch {
    // 用户取消操作
  }
}

// 删除账户
const deleteAccount = async () => {
  if (!deleteFormRef.value) return

  try {
    await deleteFormRef.value.validate()
    deleting.value = true

    await deleteUserAccount({
      password: deleteForm.password,
    })

    ElMessage.success('账户已删除')

    // 跳转到登录页
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  } catch (error) {
    console.error('删除账户失败:', error)
    ElMessage.error('删除账户失败')
  } finally {
    deleting.value = false
  }
}

// 组件挂载
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-container {
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

.settings-content {
  max-width: 1200px;
}

.settings-sidebar {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.settings-menu {
  border: none;
}

.settings-card {
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

.setting-group {
  margin-bottom: 32px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

/* 主题设置 */
.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.theme-option {
  position: relative;
  cursor: pointer;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
  text-align: center;
}

.theme-option:hover {
  border-color: #409eff;
}

.theme-option.active {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.theme-preview {
  height: 60px;
  border-radius: 4px;
  margin-bottom: 8px;
  overflow: hidden;
}

.theme-header {
  height: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.theme-content {
  height: 40px;
  background-color: #f5f7fa;
}

.theme-preview.light .theme-header {
  background-color: #ffffff;
}

.theme-preview.light .theme-content {
  background-color: #f5f7fa;
}

.theme-preview.dark .theme-header {
  background-color: #1f2937;
}

.theme-preview.dark .theme-content {
  background-color: #374151;
}

.theme-label {
  font-size: 14px;
  color: #303133;
}

.theme-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #409eff;
  font-size: 16px;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
  margin-right: 16px;
}

.setting-label {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  display: block;
}

.setting-description {
  color: #606266;
  font-size: 12px;
  margin: 0;
}

/* 设备管理 */
.device-list {
  max-height: 300px;
  overflow-y: auto;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.device-item:hover {
  border-color: #409eff;
}

.device-item:last-child {
  margin-bottom: 0;
}

.device-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.device-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.device-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-name {
  font-weight: 500;
  color: #303133;
}

.device-location,
.device-time {
  font-size: 12px;
  color: #909399;
}

/* 时间范围选择 */
.time-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-separator {
  color: #606266;
  font-size: 14px;
}

/* 字体大小显示 */
.font-size-value {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
  min-width: 30px;
}

/* 危险操作区域 */
.danger-zone {
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 8px;
  padding: 16px;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.danger-info h4 {
  color: #f56c6c;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.danger-info p {
  color: #606266;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

/* 删除账户警告 */
.delete-account-warning ul {
  margin: 8px 0;
  padding-left: 20px;
}

.delete-account-warning li {
  margin-bottom: 4px;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }

  .theme-options {
    grid-template-columns: 1fr;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .setting-info {
    margin-right: 0;
  }

  .device-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .danger-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-range {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .settings-container {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>
