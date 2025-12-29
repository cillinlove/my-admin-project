<template>
  <div class="marketing-management">
    <el-card class="marketing-card">
      <template #header>
        <div class="card-header">
          <span>营销管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="createPromotion">创建活动</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索条件 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="searchForm.keyword" placeholder="请输入活动名称或类型" clearable />
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.type"
              placeholder="活动类型"
              clearable
              style="width: 100%"
            >
              <el-option label="优惠券" value="coupon" />
              <el-option label="限时秒杀" value="seckill" />
              <el-option label="拼团" value="groupon" />
              <el-option label="积分体系" value="points" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.status"
              placeholder="活动状态"
              clearable
              style="width: 100%"
            >
              <el-option label="进行中" value="active" />
              <el-option label="未开始" value="upcoming" />
              <el-option label="已结束" value="ended" />
              <el-option label="已暂停" value="paused" />
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
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 活动表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="活动ID" width="100" />
        <el-table-column prop="name" label="活动名称" width="200" />
        <el-table-column prop="type" label="活动类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="discountValue" label="优惠值" width="100">
          <template #default="scope">
            <span v-if="scope.row.type === 'coupon' || scope.row.type === 'seckill'">
              ¥{{ scope.row.discountValue }}
            </span>
            <span v-else-if="scope.row.type === 'groupon'">
              {{ scope.row.discountValue }}人团
            </span>
            <span v-else-if="scope.row.type === 'points'"> {{ scope.row.discountValue }}倍 </span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button size="small" type="success" link @click="handlePreview(scope.row)"
              >预览</el-button
            >
            <el-button size="small" type="warning" link @click="handleToggleStatus(scope.row)">
              {{
                scope.row.status === 'active' || scope.row.status === 'upcoming' ? '暂停' : '启用'
              }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)"
              >删除</el-button
            >
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

    <!-- 活动创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="promotionFormRef"
        :model="currentPromotion"
        :rules="promotionFormRules"
        label-width="120px"
        v-loading="formLoading"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="currentPromotion.name" placeholder="请输入活动名称" />
        </el-form-item>

        <el-form-item label="活动类型" prop="type">
          <el-select
            v-model="currentPromotion.type"
            placeholder="请选择活动类型"
            @change="handleTypeChange"
            style="width: 100%"
          >
            <el-option label="优惠券" value="coupon" />
            <el-option label="限时秒杀" value="seckill" />
            <el-option label="拼团" value="groupon" />
            <el-option label="积分体系" value="points" />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="currentPromotion.type === 'coupon' || currentPromotion.type === 'seckill'"
          :label="currentPromotion.type === 'coupon' ? '优惠金额' : '秒杀价格'"
          prop="discountValue"
        >
          <el-input-number
            v-model="currentPromotion.discountValue"
            :precision="2"
            :step="1"
            controls-position="right"
            style="width: 100%"
            :min="0"
          />
          <span class="input-suffix">
            {{ currentPromotion.type === 'coupon' ? '元' : '元' }}
          </span>
        </el-form-item>

        <el-form-item
          v-if="currentPromotion.type === 'groupon'"
          label="拼团人数"
          prop="discountValue"
        >
          <el-input-number
            v-model="currentPromotion.discountValue"
            :min="2"
            :max="99"
            controls-position="right"
            style="width: 100%"
          />
          <span class="input-suffix">人团</span>
        </el-form-item>

        <el-form-item
          v-if="currentPromotion.type === 'points'"
          label="积分倍数"
          prop="discountValue"
        >
          <el-input-number
            v-model="currentPromotion.discountValue"
            :precision="1"
            :step="0.5"
            :min="0.1"
            :max="10"
            controls-position="right"
            style="width: 100%"
          />
          <span class="input-suffix">倍</span>
        </el-form-item>

        <el-form-item label="适用商品">
          <el-select
            v-model="currentPromotion.productIds"
            multiple
            filterable
            placeholder="请选择适用商品"
            style="width: 100%"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            >
              {{ product.name }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="活动时间" required>
          <el-date-picker
            v-model="promotionTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="currentPromotion.description"
            type="textarea"
            :rows="4"
            placeholder="请输入活动描述"
          />
        </el-form-item>

        <el-form-item label="活动状态" prop="status">
          <el-select v-model="currentPromotion.status" style="width: 100%">
            <el-option label="未开始" value="upcoming" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" :loading="formLoading">取消</el-button>
          <el-button type="primary" @click="savePromotion" :loading="formLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivities, createActivity, updateActivity } from '@/services/marketingService'
import { useRoute } from 'vue-router'

// 营销活动类型定义
interface Promotion {
  id: number
  name: string
  type: 'coupon' | 'seckill' | 'groupon' | 'points'
  discountValue: number
  productIds: number[]
  startTime: string
  endTime: string
  description: string
  status: 'upcoming' | 'active' | 'ended' | 'paused'
  createTime: string
  updateTime: string
  minAmount?: number
}

// 营销活动表单数据类型定义
interface PromotionData {
  title: string
  description: string
  type: 'discount' | 'promotion' | 'membership'
  startTime: string
  endTime: string
  discount: number
  minAmount: number
}

// 产品类型定义
interface Product {
  id: number
  name: string
  price: number
  category: string
}

// 搜索表单类型定义
interface SearchForm {
  keyword: string
  type: string
  status: string
  dateRange: string[]
}

// 分页类型定义
interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

// 获取当前路由
const route = useRoute()

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  keyword: '',
  type: '',
  status: '',
  dateRange: [],
})

// 表格加载状态
const loading = ref(false)

// 表格数据
const tableData = ref<Promotion[]>([])

// 分页配置
const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)

// 当前编辑的活动
const currentPromotion = reactive<Partial<Promotion>>({
  id: 0,
  name: '',
  type: undefined,
  discountValue: 0,
  productIds: [],
  startTime: '',
  endTime: '',
  description: '',
  status: 'upcoming',
  minAmount: 0,
})

// 活动时间范围（用于表单绑定）
const promotionTimeRange = ref<[string, string]>(['', ''])

// 产品列表（用于适用商品选择）
const products = ref<Product[]>([])

// 活动表单引用
const promotionFormRef = ref()

// 活动表单验证规则
const promotionFormRules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  discountValue: [{ required: true, message: '请输入优惠值', trigger: 'blur' }],
  status: [{ required: true, message: '请选择活动状态', trigger: 'change' }],
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '暂无'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取类型标签类型
const getTypeTagType = (type: string) => {
  switch (type) {
    case 'coupon':
      return 'warning'
    case 'seckill':
      return 'danger'
    case 'groupon':
      return 'success'
    case 'points':
      return 'primary'
    default:
      return 'info'
  }
}

// 获取类型名称
const getTypeName = (type: string) => {
  switch (type) {
    case 'coupon':
      return '优惠券'
    case 'seckill':
      return '限时秒杀'
    case 'groupon':
      return '拼团'
    case 'points':
      return '积分体系'
    default:
      return type
  }
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'upcoming':
      return 'warning'
    case 'ended':
      return 'info'
    case 'paused':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态名称
const getStatusName = (status: string) => {
  switch (status) {
    case 'active':
      return '进行中'
    case 'upcoming':
      return '未开始'
    case 'ended':
      return '已结束'
    case 'paused':
      return '已暂停'
    default:
      return status
  }
}

// 获取活动列表
const fetchPromotions = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
    }

    const res: { data: Promotion[]; total: number } = await getActivities(params)
    tableData.value = res.data
    pagination.total = res.total
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取活动列表失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchPromotions()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.currentPage = 1
  fetchPromotions()
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchPromotions()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchPromotions()
}

// 创建活动
const createPromotion = () => {
  dialogTitle.value = '创建活动'
  resetForm()
  dialogVisible.value = true
}

// 编辑活动
const handleEdit = (row: Promotion) => {
  dialogTitle.value = '编辑活动'
  resetForm()

  // 填充表单数据
  Object.assign(currentPromotion, row)
  promotionTimeRange.value = [row.startTime, row.endTime]

  dialogVisible.value = true
}

// 预览活动
const handlePreview = (row: Promotion) => {
  ElMessage.info(`预览活动: ${row.name}`)
  console.log('预览活动:', row)
}

// 切换活动状态
const handleToggleStatus = async (row: Promotion) => {
  try {
    const newStatus = row.status === 'active' || row.status === 'upcoming' ? 'paused' : 'active'
    await ElMessageBox.confirm(
      `确定要${newStatus === 'active' ? '启用' : '暂停'}此活动吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: newStatus === 'active' ? 'success' : 'warning',
      },
    )

    // 模拟更新活动状态
    await new Promise((resolve) => setTimeout(resolve, 300))
    row.status = newStatus
    ElMessage.success(`${newStatus === 'active' ? '启用' : '暂停'}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 删除活动
const handleDelete = async (row: Promotion) => {
  try {
    await ElMessageBox.confirm(`确定要删除活动 "${row.name}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 模拟删除活动
    await new Promise((resolve) => setTimeout(resolve, 300))
    ElMessage.success('删除成功')
    fetchPromotions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(currentPromotion, {
    id: 0,
    name: '',
    type: '',
    discountValue: 0,
    productIds: [],
    startTime: '',
    endTime: '',
    description: '',
    status: 'upcoming',
  })
  promotionTimeRange.value = ['', '']
}

// 保存活动
const savePromotion = () => {
  if (!promotionFormRef.value) return

  promotionFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      formLoading.value = true
      try {
        // 更新时间范围
        if (promotionTimeRange.value && promotionTimeRange.value.length === 2) {
          currentPromotion.startTime = promotionTimeRange.value[0]
          currentPromotion.endTime = promotionTimeRange.value[1]
        }

        if (currentPromotion.id && currentPromotion.id > 0) {
          // 编辑活动
          const formData: PromotionData = {
            title: currentPromotion.name || '',
            description: currentPromotion.description || '',
            type: (currentPromotion.type as 'discount' | 'promotion' | 'membership') || 'promotion',
            startTime: currentPromotion.startTime || '',
            endTime: currentPromotion.endTime || '',
            discount: currentPromotion.discountValue || 0,
            minAmount: currentPromotion.minAmount || 0,
          }
          await updateActivity(currentPromotion.id, formData)
          ElMessage.success('活动更新成功')
        } else {
          // 创建活动
          const formData: PromotionData = {
            title: currentPromotion.name || '',
            description: currentPromotion.description || '',
            type: (currentPromotion.type as 'discount' | 'promotion' | 'membership') || 'promotion',
            startTime: currentPromotion.startTime || '',
            endTime: currentPromotion.endTime || '',
            discount: currentPromotion.discountValue || 0,
            minAmount: currentPromotion.minAmount || 0,
          }
          await createActivity(formData)
          ElMessage.success('活动创建成功')
        }

        dialogVisible.value = false
        fetchPromotions()
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '操作失败'
        ElMessage.error(message)
      } finally {
        formLoading.value = false
      }
    }
  })
}

// 活动类型改变处理
const handleTypeChange = (val: string) => {
  // 根据活动类型初始化优惠值
  if (val === 'groupon') {
    currentPromotion.discountValue = 2
  } else if (val === 'points') {
    currentPromotion.discountValue = 1.0
  } else {
    currentPromotion.discountValue = 0
  }
}

// 对话框关闭处理
const handleDialogClose = (done: () => void) => {
  if (promotionFormRef.value) {
    promotionFormRef.value.resetFields()
  }
  done()
}

// 获取产品列表
const fetchProducts = async () => {
  // 模拟获取产品列表
  products.value = [
    { id: 1, name: 'iPhone 15', price: 5999, category: '手机' },
    { id: 2, name: 'MacBook Pro', price: 12999, category: '笔记本' },
    { id: 3, name: 'iPad Air', price: 3999, category: '平板' },
    { id: 4, name: 'AirPods Pro', price: 1999, category: '耳机' },
    { id: 5, name: 'Apple Watch', price: 2999, category: '手表' },
    { id: 6, name: '华为P50', price: 4999, category: '手机' },
    { id: 7, name: '小米13', price: 3999, category: '手机' },
    { id: 8, name: '三星S23', price: 5999, category: '手机' },
  ]
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPromotions()
  fetchProducts()
})

// 组件激活时获取数据（用于处理路由切换）
onActivated(() => {
  if (route.path === '/marketing') {
    fetchPromotions()
  }
})
</script>

<style scoped>
.marketing-management {
  padding: 20px;
}

.marketing-card {
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

.content-tabs {
  margin-top: 20px;
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

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
