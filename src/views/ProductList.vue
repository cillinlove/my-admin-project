<template>
  <div class="product-list">
    <el-card class="product-card">
      <template #header>
        <div class="card-header">
          <span>商品清单</span>
          <div>
            <el-button type="primary" @click="addProduct">添加商品</el-button>
            <el-button @click="toggleCategoryManagement">分类管理</el-button>
            <el-button @click="toggleBrandManagement">品牌管理</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索条件 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-input v-model="searchForm.keyword" placeholder="请输入商品ID或名称" clearable />
          </el-col>
          <el-col :span="3">
            <el-select
              v-model="searchForm.category"
              placeholder="分类"
              clearable
              style="width: 100%"
            >
              <el-option label="电子产品" value="electronics" />
              <el-option label="服装" value="clothing" />
              <el-option label="食品" value="food" />
              <el-option label="家居" value="home" />
              <el-option label="图书" value="books" />
              <el-option label="运动" value="sports" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select v-model="searchForm.brand" placeholder="品牌" clearable style="width: 100%">
              <el-option label="苹果" value="apple" />
              <el-option label="三星" value="samsung" />
              <el-option label="小米" value="xiaomi" />
              <el-option label="华为" value="huawei" />
              <el-option label="耐克" value="nike" />
              <el-option label="阿迪达斯" value="adidas" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
              v-model="searchForm.status"
              placeholder="商品状态"
              clearable
              style="width: 100%"
            >
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
              v-model="searchForm.onSale"
              placeholder="上下架"
              clearable
              style="width: 100%"
            >
              <el-option label="在售" value="onsale" />
              <el-option label="下架" value="offshelf" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 商品表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="商品ID" width="100" />
        <el-table-column prop="name" label="商品名称" width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag type="info">{{ getCategoryName(scope.row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="brand" label="品牌" width="120">
          <template #default="scope">
            <el-tag type="warning">{{ getBrandName(scope.row.brand) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope"> ¥{{ scope.row.price.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="onSale" label="销售状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.onSale"
              @change="handleSaleStatusChange(scope.row)"
              :active-value="true"
              :inactive-value="false"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
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
            <el-button size="small" type="success" link @click="handleViewReviews(scope.row)"
              >评价</el-button
            >
            <el-button size="small" type="warning" link @click="handleToggleSale(scope.row)">
              {{ scope.row.onSale ? '下架' : '上架' }}
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

    <!-- 添加/编辑商品对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form
        ref="productFormRef"
        :model="currentProduct"
        :rules="productFormRules"
        label-width="100px"
        v-loading="formLoading"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="currentProduct.name" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="currentProduct.category" style="width: 100%">
            <el-option label="电子产品" value="electronics" />
            <el-option label="服装" value="clothing" />
            <el-option label="食品" value="food" />
            <el-option label="家居" value="home" />
            <el-option label="图书" value="books" />
            <el-option label="运动" value="sports" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-select v-model="currentProduct.brand" style="width: 100%">
            <el-option label="苹果" value="apple" />
            <el-option label="三星" value="samsung" />
            <el-option label="小米" value="xiaomi" />
            <el-option label="华为" value="huawei" />
            <el-option label="耐克" value="nike" />
            <el-option label="阿迪达斯" value="adidas" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="currentProduct.price"
            :precision="2"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="currentProduct.stock"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="上下架" prop="onSale">
          <el-switch v-model="currentProduct.onSale" :active-value="true" :inactive-value="false" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="currentProduct.status" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" :loading="formLoading">取消</el-button>
          <el-button type="primary" @click="saveProduct" :loading="formLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 评价管理对话框 -->
    <el-dialog v-model="reviewsDialogVisible" title="商品评价管理" width="800px">
      <div v-if="currentProductForReviews">
        <h3>商品：{{ currentProductForReviews.name }}</h3>

        <el-table
          :data="reviewsList"
          style="width: 100%; margin-top: 20px"
          v-loading="reviewsLoading"
        >
          <el-table-column prop="id" label="评价ID" width="100" />
          <el-table-column prop="user" label="用户" width="150" />
          <el-table-column prop="rating" label="评分" width="100">
            <template #default="scope">
              <el-rate v-model="scope.row.rating" disabled show-score text-color="#ff9900" />
            </template>
          </el-table-column>
          <el-table-column prop="content" label="评价内容" />
          <el-table-column prop="createTime" label="评价时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.status === 'approved'
                    ? 'success'
                    : scope.row.status === 'pending'
                      ? 'warning'
                      : 'danger'
                "
              >
                {{ getReviewStatusName(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" type="primary" link @click="handleReviewAction(scope.row)">
                {{ scope.row.status === 'pending' ? '审核' : '详情' }}
              </el-button>
              <el-button size="small" type="danger" link @click="handleDeleteReview(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" style="margin-top: 20px">
          <el-pagination
            v-model:current-page="reviewsPagination.currentPage"
            v-model:page-size="reviewsPagination.pageSize"
            :page-sizes="[5, 10, 20]"
            :total="reviewsPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleReviewsSizeChange"
            @current-change="handleReviewsCurrentChange"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 评价处理对话框 -->
    <el-dialog v-model="reviewActionDialogVisible" :title="reviewDialogTitle" width="600px">
      <div v-if="currentReview">
        <p><strong>用户：</strong>{{ currentReview.userName }}</p>
        <p>
          <strong>评分：</strong>
          <el-rate v-model="currentReview.rating" disabled show-score text-color="#ff9900" />
        </p>
        <p><strong>评价内容：</strong>{{ currentReview.content }}</p>
        <p><strong>评价时间：</strong>{{ formatDate(currentReview.createTime) }}</p>

        <el-form :model="reviewActionForm" style="margin-top: 20px" label-width="80px">
          <el-form-item label="处理结果">
            <el-select v-model="reviewActionForm.status" style="width: 100%">
              <el-option label="通过" value="approved" />
              <el-option label="拒绝" value="rejected" />
              <el-option label="待审核" value="pending" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核意见">
            <el-input
              v-model="reviewActionForm.comment"
              type="textarea"
              placeholder="请输入审核意见"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewActionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReviewAction">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分类管理对话框 -->
    <el-dialog v-model="categoryDialogVisible" title="分类管理" width="600px">
      <div>
        <div style="margin-bottom: 20px">
          <el-input
            v-model="newCategory.name"
            placeholder="输入新分类名称"
            style="width: 200px; margin-right: 10px"
          />
          <el-button type="primary" @click="addCategory">添加分类</el-button>
        </div>

        <el-table :data="categories" style="width: 100%">
          <el-table-column prop="id" label="ID" width="100" />
          <el-table-column prop="name" label="分类名称" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" type="primary" link @click="editCategory(scope.row)"
                >编辑</el-button
              >
              <el-button size="small" type="danger" link @click="deleteCategory(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 品牌管理对话框 -->
    <el-dialog v-model="brandDialogVisible" title="品牌管理" width="600px">
      <div>
        <div style="margin-bottom: 20px">
          <el-input
            v-model="newBrand.name"
            placeholder="输入新品牌名称"
            style="width: 200px; margin-right: 10px"
          />
          <el-button type="primary" @click="addBrand">添加品牌</el-button>
        </div>

        <el-table :data="brands" style="width: 100%">
          <el-table-column prop="id" label="ID" width="100" />
          <el-table-column prop="name" label="品牌名称" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" type="primary" link @click="editBrand(scope.row)"
                >编辑</el-button
              >
              <el-button size="small" type="danger" link @click="deleteBrand(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 下载进度条对话框 -->
    <el-dialog v-model="progressDialogVisible" title="文件下载中" width="400px">
      <el-progress :percentage="downloadProgress" :indeterminate="downloadProgress === 0" />
      <p style="margin-top: 20px; text-align: center">正在下载文件，请稍候...</p>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateReviewStatus,
  deleteReview,
} from '@/services/productService'
import { useRoute } from 'vue-router'

// 商品数据类型定义
interface Product {
  id: number
  name: string
  category: string
  brand: string
  price: number
  stock: number
  status: 'enabled' | 'disabled'
  onSale: boolean
  createTime: string
  updateTime: string
  images: string[]
  description: string
  specifications: Record<string, unknown>
  supplierId?: number
  supplierName?: string
}

interface SearchForm {
  keyword: string
  category: string
  brand: string
  status: string
  onSale: string
  dateRange: string[]
}

interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

interface ProductForm {
  id: number
  name: string
  category: string
  brand: string
  price: number
  stock: number
  status: 'enabled' | 'disabled'
  onSale: boolean
  images: string[]
  description: string
  specifications: Record<string, string>
  supplierId?: number
}

interface Review {
  id: number
  productId: number
  productName: string
  userId: number
  userName: string
  rating: number
  content: string
  status: 'pending' | 'approved' | 'rejected'
  createTime: string
  adminReply?: string
}

interface ReviewActionForm {
  status: string
  comment: string
}

interface Category {
  id: number
  name: string
}

interface ReviewResponse {
  data: Review[]
  total: number
}

interface Brand {
  id: number
  name: string
}

// 获取当前路由
const route = useRoute()

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  keyword: '',
  category: '',
  brand: '',
  status: '',
  onSale: '',
  dateRange: [],
})

// 表格加载状态
const loading = ref(false)

// 表格数据
const tableData = ref<Product[]>([])

// 分页配置
const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 对话框相关
const dialogVisible = ref(false)
const reviewsDialogVisible = ref(false)
const reviewActionDialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const brandDialogVisible = ref(false)
const progressDialogVisible = ref(false)
const dialogTitle = ref('')
const isEditing = ref(false)
const formLoading = ref(false)

// 下载进度
const downloadProgress = ref(0)

// 当前编辑的商品
const currentProduct = reactive<ProductForm>({
  id: 0,
  name: '',
  category: '',
  brand: '',
  price: 0,
  stock: 0,
  onSale: true,
  status: 'enabled',
  images: [],
  description: '',
  specifications: {},
})

// 商品表单引用
const productFormRef = ref()

// 评价管理相关
const currentProductForReviews = ref<Product | null>(null)
const reviewsList = ref<Review[]>([])
const reviewsLoading = ref(false)
const currentReview = ref<Review | null>(null)
const reviewActionForm = reactive<ReviewActionForm>({
  status: '',
  comment: '',
})
const reviewDialogTitle = ref('')

// 评价分页配置
const reviewsPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 分类管理相关
const categories = ref<Category[]>([
  { id: 1, name: '电子产品' },
  { id: 2, name: '服装' },
  { id: 3, name: '食品' },
  { id: 4, name: '家居' },
  { id: 5, name: '图书' },
  { id: 6, name: '运动' },
])
const newCategory = reactive({
  name: '',
})

// 品牌管理相关
const brands = ref<Brand[]>([
  { id: 1, name: '苹果' },
  { id: 2, name: '三星' },
  { id: 3, name: '小米' },
  { id: 4, name: '华为' },
  { id: 5, name: '耐克' },
  { id: 6, name: '阿迪达斯' },
])
const newBrand = reactive({
  name: '',
})

// 商品表单验证规则
const productFormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' },
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 分类名称映射
const categoryMap: Record<string, string> = {
  electronics: '电子产品',
  clothing: '服装',
  food: '食品',
  home: '家居',
  books: '图书',
  sports: '运动',
}

// 品牌名称映射
const brandMap: Record<string, string> = {
  apple: '苹果',
  samsung: '三星',
  xiaomi: '小米',
  huawei: '华为',
  nike: '耐克',
  adidas: '阿迪达斯',
}

// 获取分类名称
const getCategoryName = (category: string) => {
  return categoryMap[category] || category
}

// 获取品牌名称
const getBrandName = (brand: string) => {
  return brandMap[brand] || brand
}

// 获取评价状态名称
const getReviewStatusName = (status: string) => {
  switch (status) {
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已拒绝'
    case 'pending':
      return '待审核'
    default:
      return status
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取商品列表
const fetchProducts = async () => {
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
      brand: searchForm.brand || undefined,
      onSale: searchForm.onSale || undefined,
    }

    const res = await getProducts(params)
    // 正确处理 API 响应，区分 PaginationResponse 和 AxiosResponse
    if ('total' in res && 'data' in res) {
      tableData.value = res.data
      pagination.total = res.total
    } else if (res.data) {
      // 如果是 AxiosResponse，提取 data
      tableData.value = res.data.data
      pagination.total = res.data.total
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取商品评价
const fetchProductReviews = async (productId: number) => {
  reviewsLoading.value = true
  try {
    // 模拟API调用
    const response = await new Promise<ReviewResponse>((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              productId: productId,
              productName: '示例商品',
              userId: 1,
              userName: '张三',
              rating: 5,
              content: '商品质量很好，非常满意！',
              createTime: '2023-12-01T10:30:00Z',
              status: 'approved',
            },
            {
              id: 2,
              productId: productId,
              productName: '示例商品',
              userId: 2,
              userName: '李四',
              rating: 4,
              content: '商品不错，物流也很快',
              createTime: '2023-12-02T14:20:00Z',
              status: 'pending',
            },
            {
              id: 3,
              productId: productId,
              productName: '示例商品',
              userId: 3,
              userName: '王五',
              rating: 3,
              content: '一般般，还有改进空间',
              createTime: '2023-12-03T09:15:00Z',
              status: 'rejected',
            },
            {
              id: 4,
              productId: productId,
              productName: '示例商品',
              userId: 4,
              userName: '赵六',
              rating: 5,
              content: '超赞的商品，下次还会购买',
              createTime: '2023-12-04T16:45:00Z',
              status: 'approved',
            },
          ],
          total: 4,
        })
      }, 500)
    })

    reviewsList.value = response.data
    reviewsPagination.total = response.total
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取商品评价失败')
  } finally {
    reviewsLoading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchProducts()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.dateRange = []
  searchForm.status = ''
  searchForm.category = ''
  searchForm.brand = ''
  searchForm.onSale = ''
  pagination.currentPage = 1
  fetchProducts()
}

// 添加商品
const addProduct = () => {
  isEditing.value = false
  dialogTitle.value = '添加商品'

  // 清空表单数据
  Object.assign(currentProduct, {
    id: 0,
    name: '',
    category: '',
    brand: '',
    price: 0,
    stock: 0,
    onSale: true,
    status: 'enabled',
  })

  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row: Product) => {
  isEditing.value = true
  dialogTitle.value = '编辑商品'

  // 填充表单数据
  Object.assign(currentProduct, row)

  dialogVisible.value = true
}

// 保存商品
const saveProduct = async () => {
  if (!productFormRef.value) return

  await productFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      formLoading.value = true
      try {
        if (isEditing.value) {
          // 编辑商品
          await updateProduct(currentProduct.id, currentProduct)
          ElMessage.success('商品更新成功')
        } else {
          // 添加商品
          await createProduct(currentProduct)
          ElMessage.success('商品添加成功')
        }

        dialogVisible.value = false
        fetchProducts()
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '操作失败')
      } finally {
        formLoading.value = false
      }
    }
  })
}

// 删除商品
const handleDelete = async (row: Product) => {
  ElMessageBox.confirm(`确定要删除商品 "${row.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteProduct(row.id)
        ElMessage.success('商品删除成功')
        fetchProducts()
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 查看评价
const handleViewReviews = async (row: Product) => {
  currentProductForReviews.value = row
  if (currentProductForReviews.value) {
    await fetchProductReviews(currentProductForReviews.value.id)
  }
  reviewsDialogVisible.value = true
}

// 处理评价操作
const handleReviewAction = (review: Review) => {
  currentReview.value = review
  reviewDialogTitle.value = review.status === 'pending' ? '审核评价' : '评价详情'
  reviewActionDialogVisible.value = true
}

// 提交评价处理结果
const submitReviewAction = async () => {
  if (!currentReview.value) return

  try {
    // 模拟更新评价状态
    await updateReviewStatus(
      currentReview.value.id,
      reviewActionForm.status,
      reviewActionForm.comment,
    )
    ElMessage.success('评价处理成功')
    reviewActionDialogVisible.value = false
    // 刷新评价列表
    if (currentProductForReviews.value) {
      await fetchProductReviews(currentProductForReviews.value.id)
    }
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '处理失败')
  }
}

// 删除评价
const handleDeleteReview = async (review: Review) => {
  ElMessageBox.confirm(`确定要删除评价 "${review.content}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteReview(review.id)
        ElMessage.success('评价删除成功')
        // 刷新评价列表
        if (currentProductForReviews.value) {
          await fetchProductReviews(currentProductForReviews.value.id)
        }
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 切换分类管理
const toggleCategoryManagement = () => {
  categoryDialogVisible.value = true
}

// 添加分类
const addCategory = () => {
  if (!newCategory.name.trim()) {
    ElMessage.error('分类名称不能为空')
    return
  }

  const newCat = {
    id: categories.value.length + 1,
    name: newCategory.name,
  }

  categories.value.push(newCat)
  newCategory.name = ''
  ElMessage.success('分类添加成功')
}

// 编辑分类
const editCategory = (category: Category) => {
  ElMessageBox.prompt('请输入新的分类名称', '编辑分类', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: category.name,
  })
    .then(({ value }) => {
      if (!value.trim()) {
        ElMessage.error('分类名称不能为空')
        return
      }

      category.name = value
      ElMessage.success('分类更新成功')
    })
    .catch(() => {
      ElMessage.info('已取消编辑')
    })
}

// 删除分类
const deleteCategory = (category: Category) => {
  ElMessageBox.confirm(`确定要删除分类 "${category.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = categories.value.findIndex((cat) => cat.id === category.id)
      if (index !== -1) {
        categories.value.splice(index, 1)
        ElMessage.success('分类删除成功')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 切换品牌管理
const toggleBrandManagement = () => {
  brandDialogVisible.value = true
}

// 添加品牌
const addBrand = () => {
  if (!newBrand.name.trim()) {
    ElMessage.error('品牌名称不能为空')
    return
  }

  const newBr = {
    id: brands.value.length + 1,
    name: newBrand.name,
  }

  brands.value.push(newBr)
  newBrand.name = ''
  ElMessage.success('品牌添加成功')
}

// 编辑品牌
const editBrand = (brand: Brand) => {
  ElMessageBox.prompt('请输入新的品牌名称', '编辑品牌', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: brand.name,
  })
    .then(({ value }) => {
      if (!value.trim()) {
        ElMessage.error('品牌名称不能为空')
        return
      }

      brand.name = value
      ElMessage.success('品牌更新成功')
    })
    .catch(() => {
      ElMessage.info('已取消编辑')
    })
}

// 删除品牌
const deleteBrand = (brand: Brand) => {
  ElMessageBox.confirm(`确定要删除品牌 "${brand.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = brands.value.findIndex((br) => br.id === brand.id)
      if (index !== -1) {
        brands.value.splice(index, 1)
        ElMessage.success('品牌删除成功')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 处理销售状态变化
const handleSaleStatusChange = async (row: Product) => {
  try {
    // 模拟更新商品上下架状态
    await new Promise((resolve) => setTimeout(resolve, 300))
    ElMessage.success(`${row.onSale ? '上架' : '下架'}成功`)
  } catch (error: unknown) {
    // 如果失败，回滚状态
    row.onSale = !row.onSale
    ElMessage.error(error instanceof Error ? error.message : '更新失败')
  }
}

// 切换商品上下架状态
const handleToggleSale = async (row: Product) => {
  try {
    const newStatus = !row.onSale
    await ElMessageBox.confirm(
      `确定要将商品 "${row.name}" ${newStatus ? '上架' : '下架'} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: newStatus ? 'success' : 'warning',
      },
    )

    // 模拟更新商品上下架状态
    await new Promise((resolve) => setTimeout(resolve, 300))

    row.onSale = newStatus
    ElMessage.success(`${newStatus ? '上架' : '下架'}成功`)
  } catch (error: unknown) {
    if (error instanceof Error && error.message !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchProducts()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchProducts()
}

// 评价分页大小改变
const handleReviewsSizeChange = (val: number) => {
  reviewsPagination.pageSize = val
  if (currentProductForReviews.value) {
    fetchProductReviews(currentProductForReviews.value.id)
  }
}

// 评价当前页改变
const handleReviewsCurrentChange = (val: number) => {
  reviewsPagination.currentPage = val
  if (currentProductForReviews.value) {
    fetchProductReviews(currentProductForReviews.value.id)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchProducts()
})

// 组件激活时获取数据（用于处理路由切换）
onActivated(() => {
  if (route.path === '/products') {
    fetchProducts()
  }
})
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.product-card {
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

.export-buttons {
  display: flex;
  align-items: center;
}
</style>
