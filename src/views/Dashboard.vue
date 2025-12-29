<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>工作台</h2>
      <div class="greeting">欢迎回来，{{ userName }}！</div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card" :body-style="{ padding: '20px' }">
            <div class="card-icon user-icon">
              <User />
            </div>
            <div class="card-content">
              <p class="card-title">用户总数</p>
              <p class="card-number">{{ overviewData.userCount }}</p>
              <p class="card-trend">
                <CaretTop v-if="overviewData.userGrowth >= 0" class="trend-up" />
                <CaretBottom v-else class="trend-down" />
                {{ overviewData.userGrowth >= 0 ? '+' : '' }}{{ overviewData.userGrowth }}%
              </p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" :body-style="{ padding: '20px' }">
            <div class="card-icon product-icon">
              <Goods />
            </div>
            <div class="card-content">
              <p class="card-title">商品总数</p>
              <p class="card-number">{{ overviewData.productCount }}</p>
              <p class="card-trend">
                <CaretTop v-if="overviewData.productGrowth >= 0" class="trend-up" />
                <CaretBottom v-else class="trend-down" />
                {{ overviewData.productGrowth >= 0 ? '+' : '' }}{{ overviewData.productGrowth }}%
              </p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" :body-style="{ padding: '20px' }">
            <div class="card-icon order-icon">
              <List />
            </div>
            <div class="card-content">
              <p class="card-title">订单总数</p>
              <p class="card-number">{{ overviewData.orderCount }}</p>
              <p class="card-trend">
                <CaretTop v-if="overviewData.orderGrowth >= 0" class="trend-up" />
                <CaretBottom v-else class="trend-down" />
                {{ overviewData.orderGrowth >= 0 ? '+' : '' }}{{ overviewData.orderGrowth }}%
              </p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card" :body-style="{ padding: '20px' }">
            <div class="card-icon inventory-icon">
              <House />
            </div>
            <div class="card-content">
              <p class="card-title">库存总量</p>
              <p class="card-number">{{ overviewData.inventoryCount }}</p>
              <p class="card-trend">
                <CaretTop v-if="overviewData.inventoryGrowth >= 0" class="trend-up" />
                <CaretBottom v-else class="trend-down" />
                {{ overviewData.inventoryGrowth >= 0 ? '+' : ''
                }}{{ overviewData.inventoryGrowth }}%
              </p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷操作和消息提醒 -->
    <el-row :gutter="20" class="dashboard-content">
      <!-- 快捷操作 -->
      <el-col :span="16">
        <el-card class="quick-actions-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="goToPage('/users')">
              <div class="action-icon user-action">
                <User />
              </div>
              <div class="action-text">用户管理</div>
            </div>
            <div class="action-item" @click="goToPage('/products')">
              <div class="action-icon product-action">
                <Goods />
              </div>
              <div class="action-text">商品管理</div>
            </div>
            <div class="action-item" @click="goToPage('/orders')">
              <div class="action-icon order-action">
                <List />
              </div>
              <div class="action-text">订单管理</div>
            </div>
            <div class="action-item" @click="goToPage('/warehouses')">
              <div class="action-icon warehouse-action">
                <House />
              </div>
              <div class="action-text">仓库管理</div>
            </div>
            <div class="action-item" @click="goToPage('/suppliers')">
              <div class="action-icon supplier-action">
                <OfficeBuilding />
              </div>
              <div class="action-text">供应商管理</div>
            </div>
            <div class="action-item" @click="goToPage('/permissions')">
              <div class="action-icon permission-action">
                <Setting />
              </div>
              <div class="action-text">权限管理</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 实时消息提醒 -->
      <el-col :span="8">
        <el-card class="messages-card">
          <template #header>
            <div class="card-header">
              <span>实时消息提醒</span>
            </div>
          </template>
          <div class="messages-list">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-item"
              :class="{ unread: message.unread }"
            >
              <div class="message-icon" :class="getMessageIconClass(message.type)">
                <component :is="getMessageIcon(message.type)" />
              </div>
              <div class="message-content">
                <h4>{{ message.title }}</h4>
                <p>{{ message.content }}</p>
                <div class="message-time">{{ message.time }}</div>
              </div>
              <div class="message-actions">
                <el-button
                  v-if="message.unread"
                  type="primary"
                  size="small"
                  @click="markAsRead(message.id)"
                >
                  标记已读
                </el-button>
              </div>
            </div>

            <div v-if="messages.length === 0" class="no-messages">暂无消息</div>
          </div>
          <div class="message-footer">
            <el-button type="primary" link @click="viewAllMessages">查看全部</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  Goods,
  List,
  House,
  OfficeBuilding,
  Setting,
  CaretTop,
  CaretBottom,
} from '@element-plus/icons-vue'
import { getUserInfo } from '@/services/authService'

defineOptions({
  name: 'ManagementDashboard',
})

// 路由
const router = useRouter()

// 用户信息
const userName = ref('管理员')

// 数据概览
const overviewData = reactive({
  userCount: 0,
  productCount: 0,
  orderCount: 0,
  inventoryCount: 0,
  userGrowth: 0,
  productGrowth: 0,
  orderGrowth: 0,
  inventoryGrowth: 0,
})

// 消息列表
const messages = ref([
  {
    id: 1,
    title: '新订单提醒',
    content: '您有3个新订单待处理',
    time: '2分钟前',
    type: 'order',
    unread: true,
  },
  {
    id: 2,
    title: '库存不足',
    content: '以下商品库存低于预警值：iPhone 15, MacBook Pro',
    time: '15分钟前',
    type: 'inventory',
    unread: true,
  },
  {
    id: 3,
    title: '系统通知',
    content: '系统将在今晚22:00进行维护',
    time: '1小时前',
    type: 'system',
    unread: false,
  },
  {
    id: 4,
    title: '用户反馈',
    content: '收到新的用户反馈，关于支付流程问题',
    time: '2小时前',
    type: 'feedback',
    unread: true,
  },
])

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo()
    // 检查返回的数据是否是对象，而不是Axios响应
    if (typeof res === 'object' && res !== null && !('data' in res)) {
      userName.value = (res as { username: string }).username || '管理员'
    } else {
      userName.value = '管理员'
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    userName.value = '管理员'
  }
}

// 获取概览数据
const fetchOverviewData = async () => {
  // 模拟获取概览数据
  overviewData.userCount = 1284
  overviewData.productCount = 256
  overviewData.orderCount = 1240
  overviewData.inventoryCount = 8920
  overviewData.userGrowth = 12.5
  overviewData.productGrowth = 5.2
  overviewData.orderGrowth = 8.7
  overviewData.inventoryGrowth = -2.1
}

// 获取消息图标
const getMessageIcon = (type: string) => {
  switch (type) {
    case 'order':
      return List
    case 'inventory':
      return House
    case 'system':
      return Setting
    case 'feedback':
      return User
    default:
      return List
  }
}

// 获取消息图标样式类
const getMessageIconClass = (type: string) => {
  switch (type) {
    case 'order':
      return 'order-icon'
    case 'inventory':
      return 'inventory-icon'
    case 'system':
      return 'system-icon'
    case 'feedback':
      return 'feedback-icon'
    default:
      return 'default-icon'
  }
}

// 标记消息为已读
const markAsRead = (id: number) => {
  const message = messages.value.find((msg) => msg.id === id)
  if (message) {
    message.unread = false
  }
}

// 查看全部消息
const viewAllMessages = () => {
  // 跳转到消息中心页面（如果存在）
  console.log('查看全部消息')
}

// 跳转到指定页面
const goToPage = (path: string) => {
  router.push(path)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserInfo()
  fetchOverviewData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.greeting {
  font-size: 16px;
  color: #606266;
}

.overview-cards {
  margin-bottom: 20px;
}

.overview-card {
  position: relative;
  overflow: hidden;
  height: 120px;
  cursor: pointer;
  transition: all 0.3s;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 40px;
  opacity: 0.2;
}

.user-icon {
  color: #409eff;
}

.product-icon {
  color: #67c23a;
}

.order-icon {
  color: #e6a23c;
}

.inventory-icon {
  color: #f56c6c;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin: 0 0 5px 0;
}

.card-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 5px 0;
}

.card-trend {
  font-size: 12px;
  margin: 0;
  display: flex;
  align-items: center;
}

.trend-up {
  color: #67c23a;
  margin-right: 4px;
}

.trend-down {
  color: #f56c6c;
  margin-right: 4px;
}

.dashboard-content {
  margin-top: 20px;
}

.quick-actions-card,
.messages-card {
  height: 400px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 10px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.action-item:hover {
  background-color: #f5f7fa;
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 10px;
}

.user-action {
  background-color: #ecf5ff;
  color: #409eff;
}

.product-action {
  background-color: #f0f9eb;
  color: #67c23a;
}

.order-action {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.warehouse-action {
  background-color: #fef0f0;
  color: #f56c6c;
}

.supplier-action {
  background-color: #f4f4f5;
  color: #909399;
}

.permission-action {
  background-color: #eef5fe;
  color: #3a71f6;
}

.action-text {
  font-size: 14px;
  color: #606266;
}

.messages-list {
  max-height: 280px;
  overflow-y: auto;
  padding-right: 10px;
}

.message-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  align-items: flex-start;
}

.message-item:last-child {
  border-bottom: none;
}

.message-item.unread {
  background-color: #f8f9ff;
  border-radius: 4px;
  padding-left: 8px;
  margin-left: -8px;
  margin-right: -8px;
  padding-right: 8px;
}

.message-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 12px;
  flex-shrink: 0;
}

.message-icon.order-icon {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.message-icon.inventory-icon {
  background-color: #fef0f0;
  color: #f56c6c;
}

.message-icon.system-icon {
  background-color: #ecf5ff;
  color: #409eff;
}

.message-icon.feedback-icon {
  background-color: #f0f9eb;
  color: #67c23a;
}

.message-content {
  flex: 1;
}

.message-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
}

.message-content p {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

.message-time {
  font-size: 12px;
  color: #c0c4cc;
}

.message-actions {
  margin-left: 10px;
  flex-shrink: 0;
}

.no-messages {
  text-align: center;
  color: #c0c4cc;
  padding: 20px 0;
}

.message-footer {
  border-top: 1px solid #eee;
  padding-top: 15px;
  margin-top: 10px;
  text-align: center;
}
</style>
