<template>
  <div class="warehouse-list">
    <el-card class="warehouse-card">
      <template #header>
        <div class="card-header">
          <span>仓库清单</span>
          <el-button type="primary" @click="addWarehouse">添加仓库</el-button>
        </div>
      </template>

      <!-- 搜索条件 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="searchForm.address" placeholder="请输入仓库地址" clearable />
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="创建开始日期"
              end-placeholder="创建结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.status"
              placeholder="仓库状态"
              clearable
              style="width: 100%"
            >
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 仓库表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="仓库ID" width="100" />
        <el-table-column prop="name" label="仓库名称" width="150" />
        <el-table-column prop="address" label="仓库地址" width="250" />
        <el-table-column prop="manager" label="负责人" width="120" />
        <el-table-column prop="contact" label="联系电话" width="150" />
        <el-table-column prop="capacity" label="容量(m²)" width="120" />
        <el-table-column prop="usedSpace" label="已用空间(m²)" width="150" />
        <el-table-column prop="utilization" label="利用率" width="100">
          <template #default="scope">
            <el-progress
              :percentage="Math.round((scope.row.usedSpace / scope.row.capacity) * 100)"
              :color="
                getUtilizationColor(Math.round((scope.row.usedSpace / scope.row.capacity) * 100))
              "
              :format="() => `${Math.round((scope.row.usedSpace / scope.row.capacity) * 100)}%`"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button size="small" type="warning" link @click="viewInventory(scope.row)"
              >库存</el-button
            >
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

        <div class="export-buttons" style="margin-left: 20px">
          <el-button type="success" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑仓库对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form
        ref="warehouseFormRef"
        :model="currentWarehouse"
        :rules="warehouseFormRules"
        label-width="100px"
      >
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="currentWarehouse.name" />
        </el-form-item>
        <el-form-item label="仓库地址" prop="address">
          <el-input v-model="currentWarehouse.address" type="textarea" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="currentWarehouse.manager" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contact">
          <el-input v-model="currentWarehouse.contact" />
        </el-form-item>
        <el-form-item label="仓库容量(m²)" prop="capacity">
          <el-input-number v-model="currentWarehouse.capacity" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="currentWarehouse.status" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveWarehouse">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  exportWarehouses,
} from '@/services/warehouseService'
import { useRoute } from 'vue-router'

// 仓库数据类型定义
interface Warehouse {
  id: number
  name: string
  address: string
  manager: string
  contact: string
  capacity: number
  usedSpace: number
  status: 'enabled' | 'disabled'
  createTime: string
}

interface SearchForm {
  address: string
  dateRange: string[]
  status: string
}

interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

interface WarehouseForm {
  id: number
  name: string
  address: string
  manager: string
  contact: string
  phone: string
  capacity: number
  usedSpace: number
  status: 'enabled' | 'disabled'
  createTime: string
}

// 获取当前路由
const route = useRoute()

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  address: '',
  dateRange: [],
  status: '', // 新增状态字段
})

// 表格加载状态
const loading = ref(false)

// 表格数据
const tableData = ref<Warehouse[]>([])

// 分页配置
const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEditing = ref(false)

// 当前编辑的仓库
const currentWarehouse = reactive<WarehouseForm>({
  id: 0,
  name: '',
  address: '',
  manager: '',
  contact: '',
  phone: '',
  capacity: 0,
  usedSpace: 0,
  status: 'enabled',
  createTime: '',
})

// 仓库表单引用
const warehouseFormRef = ref()

// 仓库表单验证规则
const warehouseFormRules = {
  name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入仓库地址', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  capacity: [
    { required: true, message: '请输入仓库容量', trigger: 'blur' },
    { type: 'number', min: 0, message: '容量必须大于等于0', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取利用率颜色
const getUtilizationColor = (utilization: number) => {
  if (utilization < 50) return '#67C23A' // 绿色
  if (utilization < 80) return '#E6A23C' // 黄色
  return '#F56C6C' // 红色
}

// 获取仓库列表
const fetchWarehouses = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      address: searchForm.address || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
      status: searchForm.status || undefined,
    }

    const res = await getWarehouses(params)
    // 处理不同的响应类型
    if ('data' in res && Array.isArray(res.data)) {
      tableData.value = res.data as Warehouse[]
      pagination.total = ('total' in res ? res.total : res.data.length) || 0
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取仓库列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchWarehouses()
}

// 重置搜索
const handleReset = () => {
  searchForm.address = ''
  searchForm.dateRange = []
  searchForm.status = ''
  pagination.currentPage = 1
  fetchWarehouses()
}

// 导出数据
const handleExport = async () => {
  try {
    ElMessage.success('正在导出数据...')
    const params = {
      address: searchForm.address || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
      status: searchForm.status || undefined,
    }

    const res = await exportWarehouses(params)
    // 创建下载链接
    const blob =
      res instanceof Blob
        ? res
        : new Blob([res.data || res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `仓库数据_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '导出失败')
  }
}

// 编辑仓库
const handleEdit = (row: Warehouse) => {
  isEditing.value = true
  dialogTitle.value = '编辑仓库'

  // 填充表单数据
  Object.assign(currentWarehouse, row)

  dialogVisible.value = true
}

// 删除仓库
const handleDelete = async (row: Warehouse) => {
  ElMessageBox.confirm(`确定要删除仓库 "${row.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteWarehouse(row.id)
        ElMessage.success('删除成功')
        fetchWarehouses()
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '保存失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 添加仓库
const addWarehouse = () => {
  isEditing.value = false
  dialogTitle.value = '添加仓库'

  // 清空表单数据
  Object.assign(currentWarehouse, {
    id: 0,
    name: '',
    address: '',
    manager: '',
    contact: '',
    phone: '',
    capacity: 0,
    usedSpace: 0,
    status: 'enabled',
    createTime: '',
  })

  dialogVisible.value = true
}

// 保存仓库
const saveWarehouse = () => {
  if (!warehouseFormRef.value) return

  warehouseFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEditing.value) {
          // 编辑仓库
          await updateWarehouse(currentWarehouse.id, currentWarehouse)
          ElMessage.success('仓库更新成功')
        } else {
          // 添加仓库
          await createWarehouse(currentWarehouse)
          ElMessage.success('仓库添加成功')
        }

        dialogVisible.value = false
        fetchWarehouses()
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '保存失败')
      }
    }
  })
}

// 查看库存
const viewInventory = (row: Warehouse) => {
  ElMessage.info(`查看仓库 "${row.name}" 的库存`)
  console.log('查看库存:', row)
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchWarehouses()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchWarehouses()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchWarehouses()
})

// 组件激活时获取数据（用于处理路由切换）
onActivated(() => {
  if (route.path === '/warehouses') {
    fetchWarehouses()
  }
})
</script>

<style scoped>
.warehouse-list {
  padding: 20px;
}

.warehouse-card {
  min-height: calc(100vh - 100px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
