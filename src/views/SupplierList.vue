<template>
  <div class="supplier-list">
    <el-card class="supplier-card">
      <template #header>
        <div class="card-header">
          <span>供应商清单</span>
          <div>
            <el-button type="primary" @click="addSupplier">添加供应商</el-button>
            <el-button type="success" @click="showInventoryQuery">库存查询</el-button>
            <el-button type="warning" @click="showPurchaseManagement">采购管理</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索条件 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入供应商名称或联系人"
              clearable
            />
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.status"
              placeholder="供应商状态"
              clearable
              style="width: 100%"
            >
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.category"
              placeholder="供应商品类"
              clearable
              style="width: 100%"
            >
              <el-option label="电子产品" value="electronics" />
              <el-option label="服装" value="clothing" />
              <el-option label="食品" value="food" />
              <el-option label="家居" value="home" />
              <el-option label="图书" value="books" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="合作开始日期"
              end-placeholder="合作结束日期"
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

      <!-- 供应商表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="供应商ID" width="100" />
        <el-table-column prop="name" label="供应商名称" width="150" show-overflow-tooltip />
        <el-table-column prop="contact" label="联系人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" width="250" show-overflow-tooltip />
        <el-table-column prop="category" label="供应品类" width="120">
          <template #default="scope">
            <el-tag type="info">{{ getCategoryName(scope.row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cooperationLevel" label="合作等级" width="120">
          <template #default="scope">
            <el-rate
              v-model="scope.row.cooperationLevel"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value} 星"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="合作开始时间" width="180">
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
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button size="small" type="success" link @click="viewSupplierProducts(scope.row)"
              >商品</el-button
            >
            <el-button size="small" type="warning" link @click="viewInventoryStatus(scope.row)"
              >库存</el-button
            >
            <el-button size="small" type="info" link @click="initiatePurchase(scope.row)"
              >采购</el-button
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

    <!-- 添加/编辑供应商对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form
        ref="supplierFormRef"
        :model="currentSupplier"
        :rules="supplierFormRules"
        label-width="100px"
      >
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="currentSupplier.name" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="currentSupplier.contact" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="currentSupplier.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentSupplier.email" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="currentSupplier.address" type="textarea" />
        </el-form-item>
        <el-form-item label="供应品类" prop="category">
          <el-select v-model="currentSupplier.category" style="width: 100%">
            <el-option label="电子产品" value="electronics" />
            <el-option label="服装" value="clothing" />
            <el-option label="食品" value="food" />
            <el-option label="家居" value="home" />
            <el-option label="图书" value="books" />
            <el-option label="运动用品" value="sports" />
          </el-select>
        </el-form-item>
        <el-form-item label="合作等级" prop="cooperationLevel">
          <el-rate v-model="currentSupplier.cooperationLevel" :max="5" show-text />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="currentSupplier.status" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSupplier">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 库存查询对话框 -->
    <el-dialog v-model="inventoryDialogVisible" title="库存查询" width="800px">
      <div class="inventory-search">
        <el-form :inline="true" :model="inventorySearchForm">
          <el-form-item label="商品名称">
            <el-input v-model="inventorySearchForm.productName" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="库存状态">
            <el-select v-model="inventorySearchForm.status" placeholder="库存状态">
              <el-option label="正常" value="normal" />
              <el-option label="预警" value="warning" />
              <el-option label="缺货" value="shortage" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchInventory">查询</el-button>
            <el-button @click="resetInventorySearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="inventoryData" style="width: 100%" v-loading="inventoryLoading">
        <el-table-column prop="productName" label="商品名称" width="200" />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="currentStock" label="当前库存" width="100" />
        <el-table-column prop="minStock" label="最低库存" width="100" />
        <el-table-column prop="maxStock" label="最高库存" width="100" />
        <el-table-column prop="status" label="库存状态" width="100">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === 'normal'
                  ? 'success'
                  : scope.row.status === 'warning'
                    ? 'warning'
                    : 'danger'
              "
            >
              {{ getInventoryStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.lastUpdate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleReplenishment(scope.row)"
              >补货</el-button
            >
            <el-button
              size="small"
              type="warning"
              link
              @click="viewSupplierDetails(scope.row.supplierId)"
              >供应商详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" style="margin-top: 20px">
        <el-pagination
          v-model:current-page="inventoryPagination.currentPage"
          v-model:page-size="inventoryPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="inventoryPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleInventorySizeChange"
          @current-change="handleInventoryCurrentChange"
        />
      </div>
    </el-dialog>

    <!-- 采购管理对话框 -->
    <el-dialog v-model="purchaseDialogVisible" title="采购管理" width="900px">
      <el-tabs v-model="purchaseTab">
        <el-tab-pane label="采购计划" name="plan">
          <div style="margin-bottom: 20px">
            <el-button type="primary" @click="createPurchasePlan">新建采购计划</el-button>
          </div>
          <el-table :data="purchasePlans" style="width: 100%" v-loading="purchaseLoading">
            <el-table-column prop="id" label="计划ID" width="100" />
            <el-table-column prop="name" label="计划名称" width="200" />
            <el-table-column prop="supplier" label="供应商" width="150" />
            <el-table-column prop="totalAmount" label="总金额" width="120">
              <template #default="scope"> ¥{{ scope.row.totalAmount.toFixed(2) }} </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getPurchaseStatusType(scope.row.status)">
                  {{ getPurchaseStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="editPurchasePlan(scope.row)"
                  >编辑</el-button
                >
                <el-button size="small" type="success" link @click="viewPurchasePlan(scope.row)"
                  >查看</el-button
                >
                <el-button size="small" type="warning" link @click="submitPurchasePlan(scope.row)"
                  >提交</el-button
                >
                <el-button size="small" type="danger" link @click="deletePurchasePlan(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="采购订单" name="order">
          <el-table :data="purchaseOrders" style="width: 100%" v-loading="purchaseLoading">
            <el-table-column prop="id" label="订单号" width="120" />
            <el-table-column prop="supplier" label="供应商" width="150" />
            <el-table-column prop="products" label="采购商品" width="200">
              <template #default="scope">
                <div v-for="product in scope.row.products" :key="product.id">
                  {{ product.name }} x{{ product.quantity }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="总金额" width="120">
              <template #default="scope"> ¥{{ scope.row.totalAmount.toFixed(2) }} </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getPurchaseOrderStatusType(scope.row.status)">
                  {{ getPurchaseOrderStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="editPurchaseOrder(scope.row)"
                  >编辑</el-button
                >
                <el-button size="small" type="success" link @click="viewPurchaseOrder(scope.row)"
                  >查看</el-button
                >
                <el-button size="small" type="info" link @click="trackPurchaseOrder(scope.row)"
                  >跟踪</el-button
                >
                <el-button size="small" type="danger" link @click="cancelPurchaseOrder(scope.row)"
                  >取消</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 供应商商品详情对话框 -->
    <el-dialog
      v-model="productsDialogVisible"
      :title="`供应商「${currentSupplierName}」的商品列表`"
      width="800px"
    >
      <el-table :data="supplierProducts" style="width: 100%" v-loading="productsLoading">
        <el-table-column prop="id" label="商品ID" width="100" />
        <el-table-column prop="name" label="商品名称" width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag type="info">{{ getCategoryName(scope.row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="scope"> ¥{{ scope.row.price.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  exportSuppliers,
} from '@/services/supplierService'
import { useRoute } from 'vue-router'

// TypeScript接口定义
interface Supplier {
  id: number
  name: string
  contact: string
  contactPerson?: string
  phone: string
  email: string
  address: string
  category: 'electronics' | 'clothing' | 'food' | 'home' | 'books' | 'sports'
  cooperationLevel: number
  status: 'enabled' | 'disabled'
  createTime: string
}

interface SupplierForm {
  id: number
  name: string
  contact: string
  contactPerson: string
  phone: string
  email: string
  address: string
  category: 'electronics' | 'clothing' | 'food' | 'home' | 'books' | 'sports'
  cooperationLevel: number
  status: 'enabled' | 'disabled'
}

interface SearchForm {
  keyword: string
  dateRange: string[]
  status: 'enabled' | 'disabled' | ''
  category: 'electronics' | 'clothing' | 'food' | 'home' | 'books' | 'sports' | ''
}

interface InventoryItem {
  id: number
  productName: string
  supplierName: string
  currentStock: number
  minStock: number
  maxStock: number
  status: 'normal' | 'warning' | 'shortage'
  lastUpdateTime: string
}

interface PurchasePlan {
  id: number
  name: string
  supplier: string
  totalAmount: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  createTime: string
}

interface PurchaseOrder {
  id: string
  supplier: string
  products: Array<{
    id: number
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createTime: string
}

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: 'enabled' | 'disabled'
}

// 获取当前路由
const route = useRoute()

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  keyword: '',
  dateRange: [],
  status: '',
  category: '',
})

// 表格加载状态
const loading = ref(false)

// 表格数据
const tableData = ref<Supplier[]>([])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEditing = ref(false)

// 当前编辑的供应商
const currentSupplier = reactive<SupplierForm>({
  id: 0,
  name: '',
  contact: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  category: 'electronics',
  cooperationLevel: 3,
  status: 'enabled',
})

// 供应商表单引用
const supplierFormRef = ref()

// 供应商表单验证规则
const supplierFormRules = {
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 库存相关变量
const inventoryDialogVisible = ref(false)
const inventorySearchForm = reactive({
  productName: '',
  status: '',
})
const inventoryData = ref<InventoryItem[]>([])

// 分类名称映射
const categoryMap: Record<string, string> = {
  electronics: '电子产品',
  clothing: '服装',
  food: '食品',
  home: '家居',
  books: '图书',
  sports: '运动用品',
}

// 获取分类名称
const getCategoryName = (category: string) => {
  return categoryMap[category] || category
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取供应商列表
const fetchSuppliers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
      status: searchForm.status || undefined,
      category: searchForm.category || undefined,
    }

    const res = await getSuppliers(params)
    // 正确处理 API 响应，区分 PaginationResponse 和 AxiosResponse
    if ('total' in res && 'data' in res) {
      tableData.value = res.data as Supplier[]
      pagination.total = res.total
    } else if (res.data && 'data' in res.data) {
      // 如果是 AxiosResponse，提取 data
      tableData.value = res.data.data as Supplier[]
      pagination.total = res.data.total
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      ElMessage.error(error.message || '获取供应商列表失败')
    } else {
      ElMessage.error('获取供应商列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchSuppliers()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.dateRange = []
  searchForm.status = ''
  searchForm.category = ''
  pagination.currentPage = 1
  fetchSuppliers()
}

// 编辑供应商
const handleEdit = (row: Supplier) => {
  isEditing.value = true
  dialogTitle.value = '编辑供应商'
  Object.assign(currentSupplier, row)
  dialogVisible.value = true
}

// 删除供应商
const handleDelete = async (row: Supplier) => {
  try {
    await ElMessageBox.confirm(`确认删除供应商「${row.name}」吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteSupplier(row.id)
    ElMessage.success('删除成功')
    fetchSuppliers()
  } catch (error: unknown) {
    if (error instanceof Error && error.message !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 添加供应商
const addSupplier = () => {
  isEditing.value = false
  dialogTitle.value = '添加供应商'

  // 清空表单数据
  Object.assign(currentSupplier, {
    id: 0,
    name: '',
    contact: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: 'electronics',
    cooperationLevel: 3,
    status: 'enabled',
  })

  dialogVisible.value = true
}

// 保存供应商
const saveSupplier = () => {
  if (!supplierFormRef.value) return

  supplierFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEditing.value) {
          // 编辑供应商
          await updateSupplier(currentSupplier.id, currentSupplier)
          ElMessage.success('供应商更新成功')
        } else {
          // 添加供应商
          await createSupplier(currentSupplier)
          ElMessage.success('供应商添加成功')
        }

        dialogVisible.value = false
        fetchSuppliers()
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '操作失败')
      }
    }
  })
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchSuppliers()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchSuppliers()
}

// 显示库存查询对话框
const inventoryLoading = ref(false)

const inventoryPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

const showInventoryQuery = () => {
  inventoryDialogVisible.value = true
  fetchInventoryData()
}

// 获取库存数据
const fetchInventoryData = async () => {
  inventoryLoading.value = true
  try {
    // 模拟获取库存数据
    await new Promise((resolve) => setTimeout(resolve, 500))

    inventoryData.value = [
      {
        id: 1,
        productName: 'iPhone 15',
        supplierName: '华强北供应商',
        currentStock: 50,
        minStock: 100,
        maxStock: 500,
        status: 'warning',
        lastUpdateTime: '2023-12-20T10:30:00Z',
      },
      {
        id: 2,
        productName: 'MacBook Pro',
        supplierName: '苹果授权供应商',
        currentStock: 20,
        minStock: 30,
        maxStock: 200,
        status: 'warning',
        lastUpdateTime: '2023-12-21T14:20:00Z',
      },
      {
        id: 3,
        productName: 'AirPods Pro',
        supplierName: '苹果授权供应商',
        currentStock: 5,
        minStock: 20,
        maxStock: 300,
        status: 'shortage',
        lastUpdateTime: '2023-12-22T09:15:00Z',
      },
      {
        id: 4,
        productName: '小米13',
        supplierName: '小米官方供应商',
        currentStock: 120,
        minStock: 50,
        maxStock: 500,
        status: 'normal',
        lastUpdateTime: '2023-12-22T16:45:00Z',
      },
    ]

    inventoryPagination.total = inventoryData.value.length
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取库存数据失败')
  } finally {
    inventoryLoading.value = false
  }
}

// 获取库存状态文本
const getInventoryStatusText = (status: string) => {
  switch (status) {
    case 'normal':
      return '正常'
    case 'warning':
      return '预警'
    case 'shortage':
      return '缺货'
    default:
      return status
  }
}

// 搜索库存
const searchInventory = () => {
  // 模拟搜索库存
  fetchInventoryData()
}

// 重置库存搜索
const resetInventorySearch = () => {
  inventorySearchForm.productName = ''
  inventorySearchForm.status = ''
  fetchInventoryData()
}

// 补货操作
const handleReplenishment = (row: InventoryItem) => {
  ElMessage.info(`为商品 ${row.productName} 进行补货操作`)
  console.log('补货操作:', row)
}

// 查看供应商详情
const viewSupplierDetails = (supplierId: number) => {
  ElMessage.info(`查看供应商详情，ID: ${supplierId}`)
}

// 采购管理相关
const purchaseDialogVisible = ref(false)
const purchaseTab = ref('plan')
const purchaseLoading = ref(false)
const purchasePlans = ref<PurchasePlan[]>([])
const purchaseOrders = ref<PurchaseOrder[]>([])

const showPurchaseManagement = () => {
  purchaseDialogVisible.value = true
  fetchPurchasePlans()
  fetchPurchaseOrders()
}

// 获取采购计划
const fetchPurchasePlans = async () => {
  purchaseLoading.value = true
  try {
    // 模拟获取采购计划
    await new Promise((resolve) => setTimeout(resolve, 500))

    purchasePlans.value = [
      {
        id: 1,
        name: 'Q1季度采购计划',
        supplier: '苹果授权供应商',
        totalAmount: 5000000,
        status: 'draft',
        createTime: '2023-12-01T10:30:00Z',
      },
      {
        id: 2,
        name: '双11促销采购计划',
        supplier: '小米官方供应商',
        totalAmount: 3000000,
        status: 'approved',
        createTime: '2023-11-01T14:20:00Z',
      },
    ]
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取采购计划失败')
  } finally {
    purchaseLoading.value = false
  }
}

// 获取采购订单
const fetchPurchaseOrders = async () => {
  purchaseLoading.value = true
  try {
    // 模拟获取采购订单
    await new Promise((resolve) => setTimeout(resolve, 500))

    purchaseOrders.value = [
      {
        id: '1001',
        supplier: '苹果授权供应商',
        products: [
          { id: 1, name: 'iPhone 15', quantity: 1000, price: 5000 },
          { id: 2, name: 'MacBook Pro', quantity: 500, price: 10000 },
        ],
        totalAmount: 2000000,
        status: 'processing',
        createTime: '2023-12-01T10:30:00Z',
      },
      {
        id: '1002',
        supplier: '小米官方供应商',
        products: [
          { id: 3, name: '小米13', quantity: 800, price: 2000 },
          { id: 4, name: '小米手环', quantity: 2000, price: 200 },
        ],
        totalAmount: 1500000,
        status: 'processing',
        createTime: '2023-12-05T14:20:00Z',
      },
    ]
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取采购订单失败')
  } finally {
    purchaseLoading.value = false
  }
}

// 供应商商品相关
const productsDialogVisible = ref(false)
const productsLoading = ref(false)
const supplierProducts = ref<Product[]>([])
const currentSupplierName = ref('')

// 导出数据
const handleExport = async () => {
  try {
    ElMessage.success('正在导出数据...')
    const params = {
      keyword: searchForm.keyword || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
      status: searchForm.status || undefined,
      category: searchForm.category || undefined,
    }

    const res = await exportSuppliers(params)
    // 创建下载链接
    const blob =
      res instanceof Blob
        ? res
        : new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `供应商数据_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error: unknown) {
    if (error instanceof Error) {
      ElMessage.error(error.message || '导出失败')
    } else {
      ElMessage.error('导出失败')
    }
  }
}

const viewSupplierProducts = async (supplier: Supplier) => {
  currentSupplierName.value = supplier.name
  productsLoading.value = true

  try {
    // 模拟获取供应商商品
    await new Promise((resolve) => setTimeout(resolve, 500))

    supplierProducts.value = [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        category: 'electronics',
        price: 7999,
        stock: 100,
        status: 'enabled',
      },
      {
        id: 2,
        name: 'iPhone 15',
        category: 'electronics',
        price: 5999,
        stock: 200,
        status: 'enabled',
      },
    ]

    productsDialogVisible.value = true
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取供应商商品失败')
  } finally {
    productsLoading.value = false
  }
}

// 库存状态查看
const viewInventoryStatus = (supplier: Supplier) => {
  ElMessage.info(`查看供应商「${supplier.name}」的库存状态`)
}

// 发起采购
const initiatePurchase = (supplier: Supplier) => {
  ElMessage.info(`为供应商「${supplier.name}」发起采购`)
}

// 采购计划相关方法
const createPurchasePlan = () => {
  ElMessage.info('创建采购计划')
}

const editPurchasePlan = (plan: PurchasePlan) => {
  ElMessage.info(`编辑采购计划: ${plan.name}`)
}

const viewPurchasePlan = (plan: PurchasePlan) => {
  ElMessage.info(`查看采购计划: ${plan.name}`)
}

const submitPurchasePlan = (plan: PurchasePlan) => {
  ElMessage.info(`提交采购计划: ${plan.name}`)
}

const deletePurchasePlan = (plan: PurchasePlan) => {
  ElMessageBox.confirm(`确定要删除采购计划 "${plan.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('采购计划删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 采购订单相关方法
const editPurchaseOrder = (order: PurchaseOrder) => {
  ElMessage.info(`编辑采购订单: ${order.id}`)
}

const viewPurchaseOrder = (order: PurchaseOrder) => {
  ElMessage.info(`查看采购订单: ${order.id}`)
}

const trackPurchaseOrder = (order: PurchaseOrder) => {
  ElMessage.info(`跟踪采购订单: ${order.id}`)
}

const cancelPurchaseOrder = (order: PurchaseOrder) => {
  ElMessageBox.confirm(`确定要取消采购订单 "${order.id}" 吗？`, '确认取消', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('采购订单已取消')
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 采购状态类型映射
const getPurchaseStatusType = (status: string) => {
  switch (status) {
    case 'draft':
      return 'info'
    case 'submitted':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

const getPurchaseStatusText = (status: string) => {
  switch (status) {
    case 'draft':
      return '草稿'
    case 'submitted':
      return '已提交'
    case 'approved':
      return '已批准'
    case 'rejected':
      return '已拒绝'
    default:
      return status
  }
}

// 采购订单状态类型映射
const getPurchaseOrderStatusType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'info'
    case 'processing':
      return 'warning'
    case 'shipped':
      return 'primary'
    case 'delivered':
      return 'success'
    case 'cancelled':
      return 'danger'
    default:
      return 'info'
  }
}

const getPurchaseOrderStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待处理'
    case 'processing':
      return '处理中'
    case 'shipped':
      return '已发货'
    case 'delivered':
      return '已送达'
    case 'cancelled':
      return '已取消'
    default:
      return status
  }
}

// 库存分页方法
const handleInventorySizeChange = (val: number) => {
  inventoryPagination.pageSize = val
  fetchInventoryData()
}

const handleInventoryCurrentChange = (val: number) => {
  inventoryPagination.currentPage = val
  fetchInventoryData()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSuppliers()
})

// 组件激活时获取数据（用于处理路由切换）
onActivated(() => {
  if (route.path === '/suppliers') {
    fetchSuppliers()
  }
})
</script>

<style scoped>
.supplier-list {
  padding: 20px;
}

.supplier-card {
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
