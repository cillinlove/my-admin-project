<template>
  <div class="order-management">
    <el-card class="order-card">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary" @click="refreshOrders">刷新</el-button>
        </div>
      </template>

      <!-- 搜索条件 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="searchForm.keyword" placeholder="请输入订单号或客户名称" clearable />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.status"
              placeholder="订单状态"
              clearable
              style="width: 100%"
            >
              <el-option label="待付款" value="pending_payment" />
              <el-option label="待发货" value="pending_shipment" />
              <el-option label="待收货" value="pending_receipt" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
              <el-option label="售后中" value="after_sales" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 订单表格 -->
      <el-table
        :data="tableData"
        style="width: 100%; margin-top: 20px"
        v-loading="loading"
        :default-sort="{ prop: 'createTime', order: 'descending' }"
      >
        <el-table-column prop="id" label="订单号" width="150" sortable />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column prop="products" label="商品信息" width="200">
          <template #default="scope">
            <div v-for="item in scope.row.products" :key="item.id">
              {{ item.name }} x{{ item.quantity }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="scope"> ¥{{ scope.row.totalAmount.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="viewOrderDetail(scope.row)"
              >查看</el-button
            >
            <el-button
              size="small"
              type="warning"
              link
              @click="handleStatusChange(scope.row)"
              v-if="canChangeStatus(scope.row)"
            >
              {{ getStatusButtonText(scope.row.status) }}
            </el-button>
            <el-button
              size="small"
              type="success"
              link
              @click="handleAfterSales(scope.row)"
              v-if="scope.row.status !== 'cancelled' && scope.row.status !== 'after_sales'"
            >
              售后处理
            </el-button>
            <el-button
              size="small"
              type="info"
              link
              @click="handleLogisticsTrack(scope.row)"
              v-if="
                scope.row.status === 'pending_shipment' || scope.row.status === 'pending_receipt'
              "
            >
              物流跟踪
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="showOrderDetail" title="订单详情" width="60%">
      <div v-if="selectedOrder">
        <h3>订单基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{
            selectedOrder.customerName
          }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{
            selectedOrder.customerPhone
          }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{
            selectedOrder.deliveryAddress
          }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span style="color: #e74c3c; font-weight: bold"
              >¥{{ selectedOrder.totalAmount.toFixed(2) }}</span
            >
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(selectedOrder.status)">{{
              getStatusText(selectedOrder.status)
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            formatDate(selectedOrder.createTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{
            formatDate(selectedOrder.updateTime)
          }}</el-descriptions-item>
        </el-descriptions>

        <h3 style="margin-top: 20px">商品列表</h3>
        <el-table :data="selectedOrder.products" style="width: 100%" border>
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="price" label="单价">
            <template #default="scope">¥{{ scope.row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" />
          <el-table-column prop="total" label="小计">
            <template #default="scope"
              >¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</template
            >
          </el-table-column>
        </el-table>

        <h3 style="margin-top: 20px">物流信息</h3>
        <div
          v-if="selectedOrder.logisticsInfo?.steps && selectedOrder.logisticsInfo.steps.length > 0"
        >
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in selectedOrder.logisticsInfo.steps"
              :key="index"
              :timestamp="item.time"
              :color="index === 0 ? '#409EFF' : '#909399'"
              :type="index === 0 ? 'primary' : 'default'"
            >
              {{ item.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
        <div v-else>
          <p>暂无物流信息</p>
        </div>

        <h3 style="margin-top: 20px">售后信息</h3>
        <div v-if="selectedOrder.afterSalesInfo">
          <p><strong>售后类型：</strong>{{ selectedOrder.afterSalesInfo.type }}</p>
          <p><strong>售后原因：</strong>{{ selectedOrder.afterSalesInfo.reason }}</p>
          <p><strong>申请时间：</strong>{{ formatDate(selectedOrder.afterSalesInfo.applyTime) }}</p>
          <p>
            <strong>状态：</strong>
            <el-tag :type="getAfterSalesStatusType(selectedOrder.afterSalesInfo.status)">
              {{ getAfterSalesStatusText(selectedOrder.afterSalesInfo.status) }}
            </el-tag>
          </p>
        </div>
        <div v-else>
          <p>暂无售后信息</p>
        </div>
      </div>
    </el-dialog>

    <!-- 物流跟踪弹窗 -->
    <el-dialog v-model="showLogisticsTrack" title="物流跟踪" width="50%">
      <div v-if="logisticsTrackingOrder">
        <p>
          <strong>快递公司：</strong
          >{{ logisticsTrackingOrder.logisticsInfo?.company || '暂未发货' }}
        </p>
        <p>
          <strong>快递单号：</strong
          >{{ logisticsTrackingOrder.logisticsInfo?.trackingNumber || '暂未发货' }}
        </p>

        <h4>物流详情：</h4>
        <el-timeline
          v-if="
            logisticsTrackingOrder.logisticsInfo?.steps &&
            logisticsTrackingOrder.logisticsInfo.steps.length > 0
          "
        >
          <el-timeline-item
            v-for="(item, index) in logisticsTrackingOrder.logisticsInfo.steps"
            :key="index"
            :timestamp="item.time"
            :color="
              index === logisticsTrackingOrder.logisticsInfo.steps.length - 1
                ? '#409EFF'
                : '#909399'
            "
            :type="
              index === logisticsTrackingOrder.logisticsInfo.steps.length - 1
                ? 'primary'
                : 'default'
            "
          >
            {{ item.content }}
          </el-timeline-item>
        </el-timeline>
        <p v-else>暂无物流信息</p>
      </div>
    </el-dialog>

    <!-- 售后处理弹窗 -->
    <el-dialog v-model="showAfterSales" title="售后处理" width="40%">
      <el-form :model="afterSalesForm" label-width="100px">
        <el-form-item label="订单号">
          <span>{{ afterSalesForm.orderId }}</span>
        </el-form-item>
        <el-form-item label="售后类型">
          <el-select v-model="afterSalesForm.type" placeholder="请选择售后类型">
            <el-option label="退货" value="refund" />
            <el-option label="换货" value="exchange" />
            <el-option label="仅退款" value="partial_refund" />
          </el-select>
        </el-form-item>
        <el-form-item label="售后原因">
          <el-input v-model="afterSalesForm.reason" type="textarea" placeholder="请输入售后原因" />
        </el-form-item>
        <el-form-item label="处理结果">
          <el-select v-model="afterSalesForm.result" placeholder="请选择处理结果">
            <el-option label="同意" value="approved" />
            <el-option label="拒绝" value="rejected" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAfterSales = false">取消</el-button>
        <el-button type="primary" @click="submitAfterSales">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {} from '@/services/orderService'
import { useRoute } from 'vue-router'

// 订单产品类型
interface OrderProduct {
  id: number
  name: string
  price: number
  quantity: number
}

// 物流跟踪步骤类型
interface LogisticsStep {
  time: string
  content: string
}

// 物流信息类型
interface LogisticsInfo {
  company: string
  trackingNumber: string
  steps: LogisticsStep[]
}

// 售后信息类型
interface AfterSalesInfo {
  type: string
  reason: string
  applyTime: string
  status: string
}

// 订单类型
interface Order {
  id: string
  customerName: string
  customerPhone: string
  deliveryAddress: string
  totalAmount: number
  status:
    | 'pending_payment'
    | 'pending_shipment'
    | 'pending_receipt'
    | 'completed'
    | 'cancelled'
    | 'after_sales'
  createTime: string
  updateTime: string
  products: OrderProduct[]
  logisticsInfo?: LogisticsInfo
  afterSalesInfo?: AfterSalesInfo | null
}

// 搜索表单类型
interface SearchForm {
  keyword: string
  status: string
  dateRange: string[]
}

// 分页类型
interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

// 售后表单类型
interface AfterSalesForm {
  orderId: string
  type: string
  reason: string
  result: string
}

// 获取当前路由
const route = useRoute()

// 订单列表数据
const tableData = ref<Order[]>([])
const loading = ref(false)

// 搜索表单
const searchForm = reactive<SearchForm>({
  keyword: '',
  status: '',
  dateRange: [],
})

// 分页信息
const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 选中订单详情
const showOrderDetail = ref(false)
const selectedOrder = ref<Order | null>(null)

// 物流跟踪
const showLogisticsTrack = ref(false)
const logisticsTrackingOrder = ref<Order | null>(null)

// 售后处理
const showAfterSales = ref(false)
const afterSalesForm = reactive<AfterSalesForm>({
  orderId: '',
  type: '',
  reason: '',
  result: '',
})

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true

  try {
    // 模拟API调用
    const response: { data: Order[]; total: number } = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 'ORD202312230001',
              customerName: '张三',
              customerPhone: '13800138000',
              deliveryAddress: '北京市朝阳区xxx街道xxx号',
              totalAmount: 299.5,
              status: 'pending_payment',
              createTime: '2023-12-23T10:30:00',
              updateTime: '2023-12-23T10:30:00',
              products: [
                { id: 1, name: 'iPhone 15', price: 5999.0, quantity: 1 },
                { id: 2, name: '无线充电器', price: 199.0, quantity: 1 },
                { id: 3, name: '手机壳', price: 29.5, quantity: 1 },
              ],
              logisticsInfo: {
                company: '顺丰速运',
                trackingNumber: 'SF1234567890',
                steps: [
                  { time: '2023-12-23 15:30:00', content: '订单已提交' },
                  { time: '2023-12-23 15:35:00', content: '等待付款' },
                ],
              },
              afterSalesInfo: null,
            },
            {
              id: 'ORD202312230002',
              customerName: '李四',
              customerPhone: '13900139000',
              deliveryAddress: '上海市浦东新区xxx路xxx号',
              totalAmount: 1299.0,
              status: 'pending_shipment',
              createTime: '2023-12-22T09:15:00',
              updateTime: '2023-12-23T08:20:00',
              products: [{ id: 4, name: 'MacBook Pro', price: 12999.0, quantity: 1 }],
              logisticsInfo: {
                company: '圆通速递',
                trackingNumber: 'YT0987654321',
                steps: [
                  { time: '2023-12-22 09:15:00', content: '订单已提交' },
                  { time: '2023-12-22 09:20:00', content: '已付款' },
                  { time: '2023-12-23 08:15:00', content: '仓库拣货' },
                  { time: '2023-12-23 08:20:00', content: '已发货，等待揽收' },
                ],
              },
              afterSalesInfo: null,
            },
            {
              id: 'ORD202312230003',
              customerName: '王五',
              customerPhone: '13700137000',
              deliveryAddress: '广州市天河区xxx大道xxx号',
              totalAmount: 599.0,
              status: 'pending_receipt',
              createTime: '2023-12-20T14:20:00',
              updateTime: '2023-12-21T10:00:00',
              products: [{ id: 5, name: 'iPad Air', price: 5999.0, quantity: 1 }],
              logisticsInfo: {
                company: '中通快递',
                trackingNumber: 'ZT1122334455',
                steps: [
                  { time: '2023-12-20 14:20:00', content: '订单已提交' },
                  { time: '2023-12-20 14:25:00', content: '已付款' },
                  { time: '2023-12-21 09:30:00', content: '已发货' },
                  { time: '2023-12-21 10:00:00', content: '运输中' },
                  { time: '2023-12-22 15:45:00', content: '派送中，请保持电话畅通' },
                ],
              },
              afterSalesInfo: null,
            },
            {
              id: 'ORD202312230004',
              customerName: '赵六',
              customerPhone: '13600136000',
              deliveryAddress: '深圳市南山区xxx科技园区xxx栋',
              totalAmount: 399.9,
              status: 'completed',
              createTime: '2023-12-15T16:45:00',
              updateTime: '2023-12-18T11:30:00',
              products: [
                { id: 6, name: 'AirPods Pro', price: 1999.0, quantity: 1 },
                { id: 7, name: '数据线', price: 29.9, quantity: 2 },
              ],
              logisticsInfo: {
                company: '京东快递',
                trackingNumber: 'JD5566778899',
                steps: [
                  { time: '2023-12-15 16:45:00', content: '订单已提交' },
                  { time: '2023-12-15 16:50:00', content: '已付款' },
                  { time: '2023-12-16 09:00:00', content: '已发货' },
                  { time: '2023-12-17 14:20:00', content: '运输中' },
                  { time: '2023-12-18 10:30:00', content: '已签收，感谢使用京东快递' },
                ],
              },
              afterSalesInfo: null,
            },
          ],
          total: 4,
        })
      }, 500)
    })

    tableData.value = response.data
    pagination.total = response.total
  } catch (error: unknown) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending_payment':
      return 'warning'
    case 'pending_shipment':
      return 'primary'
    case 'pending_receipt':
      return 'info'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'danger'
    case 'after_sales':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending_payment':
      return '待付款'
    case 'pending_shipment':
      return '待发货'
    case 'pending_receipt':
      return '待收货'
    case 'completed':
      return '已完成'
    case 'cancelled':
      return '已取消'
    case 'after_sales':
      return '售后中'
    default:
      return status
  }
}

// 获取售后状态类型
const getAfterSalesStatusType = (status: string) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'processing':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取售后状态文本
const getAfterSalesStatusText = (status: string) => {
  switch (status) {
    case 'approved':
      return '已同意'
    case 'rejected':
      return '已拒绝'
    case 'processing':
      return '处理中'
    default:
      return status
  }
}

// 判断是否可以更改状态
const canChangeStatus = (order: Order) => {
  return (
    order.status === 'pending_payment' ||
    order.status === 'pending_shipment' ||
    order.status === 'pending_receipt'
  )
}

// 获取状态按钮文本
const getStatusButtonText = (status: Order['status']) => {
  switch (status) {
    case 'pending_payment':
      return '标记为已付款'
    case 'pending_shipment':
      return '标记为已发货'
    case 'pending_receipt':
      return '标记为已收货'
    default:
      return '更新状态'
  }
}

// 处理状态变更
const handleStatusChange = async (order: Order) => {
  let newStatus: Order['status'] | '' = ''
  let actionText = ''

  switch (order.status) {
    case 'pending_payment':
      newStatus = 'pending_shipment'
      actionText = '标记为已付款并进入待发货状态'
      break
    case 'pending_shipment':
      newStatus = 'pending_receipt'
      actionText = '标记为已发货并进入待收货状态'
      break
    case 'pending_receipt':
      newStatus = 'completed'
      actionText = '标记为已收货并完成订单'
      break
    default:
      return
  }

  try {
    await ElMessageBox.confirm(`确定要将订单 ${order.id} ${actionText} 吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 这里应该调用API更新订单状态
    // await updateOrderStatus(order.id, newStatus);

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))

    ElMessage.success('订单状态更新成功')
    order.status = newStatus
    order.updateTime = new Date().toISOString()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      console.error('更新订单状态失败:', error)
      ElMessage.error('更新订单状态失败')
    }
  }
}

// 查看订单详情
const viewOrderDetail = (order: Order) => {
  selectedOrder.value = order
  showOrderDetail.value = true
}

// 物流跟踪
const handleLogisticsTrack = (order: Order) => {
  logisticsTrackingOrder.value = order
  showLogisticsTrack.value = true
}

// 售后处理
const handleAfterSales = (order: Order) => {
  afterSalesForm.orderId = order.id
  afterSalesForm.type = ''
  afterSalesForm.reason = ''
  afterSalesForm.result = ''
  showAfterSales.value = true
}

// 提交售后处理
const submitAfterSales = async () => {
  try {
    // 这里应该调用API处理售后
    // await processAfterSales(afterSalesForm);

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))

    ElMessage.success('售后处理提交成功')
    showAfterSales.value = false

    // 更新订单状态为售后中
    const order = tableData.value.find((item) => item.id === afterSalesForm.orderId)
    if (order) {
      order.status = 'after_sales'
      order.afterSalesInfo = {
        type: afterSalesForm.type,
        reason: afterSalesForm.reason,
        applyTime: new Date().toISOString(),
        status: afterSalesForm.result,
      }
    }
  } catch (error: unknown) {
    console.error('提交售后处理失败:', error)
    ElMessage.error('提交售后处理失败')
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchOrders()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.currentPage = 1
  fetchOrders()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchOrders()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchOrders()
}

// 刷新订单
const refreshOrders = () => {
  fetchOrders()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOrders()
})

// 组件激活时获取数据（用于处理路由切换）
onActivated(() => {
  if (route.path === '/orders') {
    fetchOrders()
  }
})
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.order-card {
  min-height: calc(100vh - 100px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.order-detail-item {
  margin-bottom: 10px;
}

.order-products {
  margin-top: 10px;
}

.order-product-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}
</style>
