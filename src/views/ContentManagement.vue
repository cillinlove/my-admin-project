<template>
  <div class="content-management">
    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <span>内容管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="createNewContent">创建内容</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索条件 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="searchForm.keyword" placeholder="请输入标题或内容" clearable />
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.type"
              placeholder="内容类型"
              clearable
              style="width: 100%"
            >
              <el-option label="文案管理" value="copywriting" />
              <el-option label="活动页面" value="activity" />
              <el-option label="广告位" value="ad" />
              <el-option label="首页装修" value="decoration" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 100%">
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="创建日期"
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

      <!-- 内容类型切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="content-tabs">
        <el-tab-pane label="文案管理" name="copywriting">
          <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" width="200" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag type="info">{{ scope.row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容摘要" width="300">
              <template #default="scope">
                {{ scope.row.content ? String(scope.row.content).substring(0, 30) : '' }}...
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
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="handleEdit(scope.row)"
                  >编辑</el-button
                >
                <el-button size="small" type="success" link @click="handlePreview(scope.row)"
                  >预览</el-button
                >
                <el-button size="small" type="warning" link @click="handleToggleStatus(scope.row)">
                  {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" link @click="handleDelete(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="活动页面" name="activity">
          <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
            <el-table-column prop="id" label="页面ID" width="100" />
            <el-table-column prop="title" label="页面标题" width="200" />
            <el-table-column prop="activityType" label="活动类型" width="120">
              <template #default="scope">
                <el-tag type="warning">{{ scope.row.activityType }}</el-tag>
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
                <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'">
                  {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="handleEditActivity(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  size="small"
                  type="success"
                  link
                  @click="handlePreviewActivity(scope.row)"
                  >预览</el-button
                >
                <el-button size="small" type="info" link @click="handleDesignActivity(scope.row)"
                  >设计</el-button
                >
                <el-button size="small" type="warning" link @click="handleToggleStatus(scope.row)">
                  {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" link @click="handleDelete(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="广告位管理" name="ad">
          <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
            <el-table-column prop="id" label="广告位ID" width="100" />
            <el-table-column prop="name" label="广告位名称" width="200" />
            <el-table-column prop="position" label="位置" width="150">
              <template #default="scope">
                <el-tag type="primary">{{ scope.row.position }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="尺寸" width="120">
              <template #default="scope">
                {{ scope.row.size }}
              </template>
            </el-table-column>
            <el-table-column prop="content" label="广告内容" width="200">
              <template #default="scope">
                <el-image
                  :src="scope.row.content"
                  :preview-src-list="[scope.row.content]"
                  fit="cover"
                  style="width: 50px; height: 50px"
                />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'">
                  {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="handleEditAd(scope.row)"
                  >编辑</el-button
                >
                <el-button size="small" type="success" link @click="handlePreviewAd(scope.row)"
                  >预览</el-button
                >
                <el-button size="small" type="info" link @click="handleUploadAd(scope.row)"
                  >上传</el-button
                >
                <el-button size="small" type="warning" link @click="handleToggleStatus(scope.row)">
                  {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" link @click="handleDelete(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="首页装修" name="decoration">
          <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
            <el-table-column prop="id" label="装修ID" width="100" />
            <el-table-column prop="name" label="装修名称" width="200" />
            <el-table-column prop="type" label="装修类型" width="120">
              <template #default="scope">
                <el-tag type="warning">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="preview" label="预览图" width="150">
              <template #default="scope">
                <el-image
                  :src="scope.row.preview"
                  :preview-src-list="[scope.row.preview]"
                  fit="cover"
                  style="width: 80px; height: 60px"
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
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="handleEditDecoration(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  size="small"
                  type="success"
                  link
                  @click="handlePreviewDecoration(scope.row)"
                  >预览</el-button
                >
                <el-button size="small" type="info" link @click="handleDesignDecoration(scope.row)"
                  >设计</el-button
                >
                <el-button size="small" type="warning" link @click="handleToggleStatus(scope.row)">
                  {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" link @click="handleDelete(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

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

    <!-- 文案编辑对话框 -->
    <el-dialog
      v-model="copywritingDialogVisible"
      :title="dialogTitle"
      width="800px"
      :before-close="handleDialogClose"
      v-show="activeTab === 'copywriting'"
    >
      <el-form
        ref="contentFormRef"
        :model="currentContent"
        :rules="contentFormRules"
        label-width="100px"
        v-loading="formLoading"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="currentContent.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="currentContent.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="商品描述" value="product-desc" />
            <el-option label="活动文案" value="activity" />
            <el-option label="品牌介绍" value="brand" />
            <el-option label="帮助中心" value="help" />
          </el-select>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="currentContent.content"
            type="textarea"
            :rows="6"
            placeholder="请输入内容"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="currentContent.status" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogCloseClick" :loading="formLoading">取消</el-button>
          <el-button type="primary" @click="saveContent" :loading="formLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 活动页面编辑对话框 -->
    <el-dialog
      v-model="activityDialogVisible"
      :title="dialogTitle"
      width="800px"
      :before-close="handleDialogClose"
      v-show="activeTab === 'activity'"
    >
      <el-form
        ref="contentFormRef"
        :model="currentContent"
        :rules="contentFormRules"
        label-width="120px"
        v-loading="formLoading"
      >
        <el-form-item label="页面标题" prop="title">
          <el-input v-model="currentContent.title" placeholder="请输入页面标题" />
        </el-form-item>

        <el-form-item label="活动类型" prop="activityType">
          <el-select
            v-model="currentContent.activityType"
            placeholder="请选择活动类型"
            style="width: 100%"
          >
            <el-option label="首页活动" value="home" />
            <el-option label="促销活动" value="promotion" />
            <el-option label="品牌活动" value="brand" />
            <el-option label="节日活动" value="festival" />
          </el-select>
        </el-form-item>

        <el-form-item label="活动时间" required>
          <el-date-picker
            v-model="activityTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="页面描述" prop="description">
          <el-input
            v-model="currentContent.description"
            type="textarea"
            :rows="4"
            placeholder="请输入页面描述"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="currentContent.status" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogCloseClick" :loading="formLoading">取消</el-button>
          <el-button type="primary" @click="saveContent" :loading="formLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 广告位编辑对话框 -->
    <el-dialog
      v-model="adDialogVisible"
      :title="dialogTitle"
      width="800px"
      :before-close="handleDialogClose"
      v-show="activeTab === 'ad'"
    >
      <el-form
        ref="contentFormRef"
        :model="currentContent"
        :rules="contentFormRules"
        label-width="120px"
        v-loading="formLoading"
      >
        <el-form-item label="广告位名称" prop="name">
          <el-input v-model="currentContent.name" placeholder="请输入广告位名称" />
        </el-form-item>

        <el-form-item label="位置" prop="position">
          <el-select
            v-model="currentContent.position"
            placeholder="请选择广告位位置"
            style="width: 100%"
          >
            <el-option label="首页顶部" value="home-top" />
            <el-option label="首页中部" value="home-center" />
            <el-option label="首页底部" value="home-bottom" />
            <el-option label="侧边栏" value="sidebar" />
            <el-option label="商品详情页" value="product-detail" />
            <el-option label="购物车页面" value="cart" />
          </el-select>
        </el-form-item>

        <el-form-item label="尺寸" prop="size">
          <el-input v-model="currentContent.size" placeholder="请输入广告位尺寸，如：300x250" />
        </el-form-item>

        <el-form-item label="广告内容" prop="content">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleAdUploadSuccess"
            :before-upload="beforeAdUpload"
          >
            <img v-if="currentContent.content" :src="currentContent.content" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="currentContent.status" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogCloseClick" :loading="formLoading">取消</el-button>
          <el-button type="primary" @click="saveContent" :loading="formLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 首页装修编辑对话框 -->
    <el-dialog
      v-model="decorationDialogVisible"
      :title="dialogTitle"
      width="800px"
      :before-close="handleDialogClose"
      v-show="activeTab === 'decoration'"
    >
      <el-form
        ref="contentFormRef"
        :model="currentContent"
        :rules="contentFormRules"
        label-width="120px"
        v-loading="formLoading"
      >
        <el-form-item label="装修名称" prop="name">
          <el-input v-model="currentContent.name" placeholder="请输入装修名称" />
        </el-form-item>

        <el-form-item label="装修类型" prop="type">
          <el-select v-model="currentContent.type" placeholder="请选择装修类型" style="width: 100%">
            <el-option label="首页" value="home" />
            <el-option label="分类页" value="category" />
            <el-option label="活动页" value="activity" />
            <el-option label="专题页" value="topic" />
          </el-select>
        </el-form-item>

        <el-form-item label="预览图" prop="preview">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handlePreviewUploadSuccess"
            :before-upload="beforePreviewUpload"
          >
            <img v-if="currentContent.preview" :src="currentContent.preview" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="装修描述" prop="description">
          <el-input
            v-model="currentContent.description"
            type="textarea"
            :rows="4"
            placeholder="请输入装修描述"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="currentContent.status" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogCloseClick" :loading="formLoading">取消</el-button>
          <el-button type="primary" @click="saveContent" :loading="formLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getArticles, createArticle, updateArticle } from '@/services/contentService'
import { useRoute } from 'vue-router'

// 内容项接口
interface ContentItem {
  id: number
  title: string
  category: string
  content: string
  activityType?: string
  position?: string
  size?: string
  preview?: string
  description?: string
  startTime?: string
  endTime?: string
  status: 'enabled' | 'disabled'
  type?: string
  name?: string
  createTime: string
}

// 内容查询参数接口
interface ContentParams {
  page: number
  pageSize: number
  keyword?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}

// 内容响应接口
interface ContentResponse {
  data: ContentItem[]
  total: number
}

// 文件上传响应接口
interface UploadResponse {
  data: {
    url: string
    name: string
  }
}

// 搜索表单数据
const searchForm = reactive({
  keyword: '',
  type: '',
  status: '',
  dateRange: [],
})

// 当前激活的标签页
const activeTab = ref('copywriting')

// 表格加载状态
const loading = ref(false)

// 表格数据
const tableData = ref<ContentItem[]>([])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 对话框相关 - 使用独立的状态变量避免冲突
const copywritingDialogVisible = ref(false)
const activityDialogVisible = ref(false)
const adDialogVisible = ref(false)
const decorationDialogVisible = ref(false)

// 通用对话框可见性计算属性
const dialogVisible = computed({
  get() {
    switch (activeTab.value) {
      case 'copywriting':
        return copywritingDialogVisible.value
      case 'activity':
        return activityDialogVisible.value
      case 'ad':
        return adDialogVisible.value
      case 'decoration':
        return decorationDialogVisible.value
      default:
        return false
    }
  },
  set(value) {
    switch (activeTab.value) {
      case 'copywriting':
        copywritingDialogVisible.value = value
        break
      case 'activity':
        activityDialogVisible.value = value
        break
      case 'ad':
        adDialogVisible.value = value
        break
      case 'decoration':
        decorationDialogVisible.value = value
        break
    }
  },
})

const dialogTitle = ref('')
const formLoading = ref(false)

// 当前编辑的内容
const currentContent = reactive({
  id: 0,
  title: '',
  category: 'news' as 'news' | 'product' | 'guide',
  content: '',
  activityType: '',
  position: '',
  size: '',
  preview: '',
  description: '',
  startTime: '',
  endTime: '',
  status: 'published' as 'draft' | 'published',
  type: '', // 添加type属性用于首页装修类型
  name: '', // 添加name属性用于广告位名称
})

// 活动时间范围（用于表单绑定）
const activityTimeRange = ref<[string, string]>(['', ''])

// 内容表单引用
const contentFormRef = ref()

// 内容表单验证规则
const contentFormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  position: [{ required: true, message: '请选择位置', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '暂无'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 新增处理对话框关闭点击的函数
const handleDialogCloseClick = () => {
  if (contentFormRef.value) {
    contentFormRef.value.resetFields()
  }
  dialogVisible.value = false
}

// 获取内容列表
const fetchContents = async () => {
  loading.value = true
  try {
    const params: ContentParams = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      type: activeTab.value || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
    }

    const res: ContentResponse = await getArticles(params)
    tableData.value = res.data
    pagination.total = res.total
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取内容列表失败')
  } finally {
    loading.value = false
  }
}

// 标签切换处理
const handleTabChange = (tabName: string) => {
  searchForm.type = tabName
  pagination.currentPage = 1
  fetchContents()
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchContents()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.currentPage = 1
  fetchContents()
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchContents()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchContents()
}

// 创建内容
const createNewContent = () => {
  dialogTitle.value = `创建${getTabLabel(activeTab.value)}`
  resetForm()
  dialogVisible.value = true
}

// 获取标签页标签
const getTabLabel = (tabName: string) => {
  switch (tabName) {
    case 'copywriting':
      return '文案'
    case 'activity':
      return '活动页面'
    case 'ad':
      return '广告位'
    case 'decoration':
      return '首页装修'
    default:
      return '内容'
  }
}

// 编辑内容
const handleEdit = (row: ContentItem) => {
  dialogTitle.value = '编辑文案'
  resetForm()
  Object.assign(currentContent, row)
  dialogVisible.value = true
}

// 编辑活动页面
const handleEditActivity = (row: ContentItem) => {
  dialogTitle.value = '编辑活动页面'
  resetForm()
  Object.assign(currentContent, row)
  activityTimeRange.value = [row.startTime || '', row.endTime || '']
  dialogVisible.value = true
}

// 编辑广告位
const handleEditAd = (row: ContentItem) => {
  dialogTitle.value = '编辑广告位'
  resetForm()
  Object.assign(currentContent, row)
  dialogVisible.value = true
}

// 编辑首页装修
const handleEditDecoration = (row: ContentItem) => {
  dialogTitle.value = '编辑首页装修'
  resetForm()
  Object.assign(currentContent, row)
  dialogVisible.value = true
}

// 预览内容
const handlePreview = (row: ContentItem) => {
  ElMessage.info(`预览文案: ${row.title}`)
  console.log('预览文案:', row)
}

// 预览活动页面
const handlePreviewActivity = (row: ContentItem) => {
  ElMessage.info(`预览活动页面: ${row.title}`)
  console.log('预览活动页面:', row)
}

// 预览广告位
const handlePreviewAd = (row: ContentItem) => {
  ElMessage.info(`预览广告位: ${row.name}`)
  console.log('预览广告位:', row)
}

// 预览首页装修
const handlePreviewDecoration = (row: ContentItem) => {
  ElMessage.info(`预览首页装修: ${row.name}`)
  console.log('预览首页装修:', row)
}

// 设计活动页面
const handleDesignActivity = (row: ContentItem) => {
  ElMessage.info(`设计活动页面: ${row.title}`)
  console.log('设计活动页面:', row)
}

// 设计首页装修
const handleDesignDecoration = (row: ContentItem) => {
  ElMessage.info(`设计首页装修: ${row.name}`)
  console.log('设计首页装修:', row)
}

// 上传广告位图片
const handleUploadAd = (row: ContentItem) => {
  ElMessage.info(`上传广告: ${row.name}`)
  console.log('上传广告:', row)
}

// 广告上传成功回调
const handleAdUploadSuccess = (_response: UploadResponse, file: File) => {
  currentContent.content = URL.createObjectURL(file)
}

// 预览图上传成功回调
const handlePreviewUploadSuccess = (_response: UploadResponse, file: File) => {
  currentContent.preview = URL.createObjectURL(file)
}

// 上传前检查
const beforeAdUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 预览图上传前检查
const beforePreviewUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传预览图只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传预览图大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 切换内容状态
const handleToggleStatus = async (row: ContentItem) => {
  try {
    const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
    await ElMessageBox.confirm(
      `确定要${newStatus === 'enabled' ? '启用' : '禁用'}此内容吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: newStatus === 'enabled' ? 'success' : 'warning',
      },
    )

    // 模拟更新内容状态
    await new Promise((resolve) => setTimeout(resolve, 300))
    row.status = newStatus
    ElMessage.success(`${newStatus === 'enabled' ? '启用' : '禁用'}成功`)
  } catch (error: unknown) {
    if (error instanceof Error && error.message !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 删除内容
const handleDelete = async (row: ContentItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除内容 "${row.title || row.name}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 模拟删除内容
    await new Promise((resolve) => setTimeout(resolve, 300))
    ElMessage.success('删除成功')
    fetchContents()
  } catch (error: unknown) {
    if (error instanceof Error && error.message !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(currentContent, {
    id: 0,
    title: '',
    category: '',
    content: '',
    activityType: '',
    position: '',
    size: '',
    preview: '',
    description: '',
    startTime: '',
    endTime: '',
    status: 'enabled',
  })
  activityTimeRange.value = ['', '']
}

// 保存内容
const saveContent = () => {
  if (!contentFormRef.value) return

  contentFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      formLoading.value = true
      try {
        // 更新时间范围
        if (
          activeTab.value === 'activity' &&
          activityTimeRange.value &&
          activityTimeRange.value.length === 2
        ) {
          currentContent.startTime = activityTimeRange.value[0]
          currentContent.endTime = activityTimeRange.value[1]
        }

        if (currentContent.id > 0) {
          // 编辑内容
          await updateArticle(currentContent.id, currentContent)
          ElMessage.success(`${getTabLabel(activeTab.value)}更新成功`)
        } else {
          // 创建内容
          await createArticle(currentContent)
          ElMessage.success(`${getTabLabel(activeTab.value)}创建成功`)
        }

        dialogVisible.value = false
        fetchContents()
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '操作失败')
      } finally {
        formLoading.value = false
      }
    }
  })
}

// 对话框关闭处理
const handleDialogClose = (done: () => void) => {
  if (contentFormRef.value) {
    contentFormRef.value.resetFields()
  }
  // 根据当前标签页关闭对应的对话框
  switch (activeTab.value) {
    case 'copywriting':
      copywritingDialogVisible.value = false
      break
    case 'activity':
      activityDialogVisible.value = false
      break
    case 'ad':
      adDialogVisible.value = false
      break
    case 'decoration':
      decorationDialogVisible.value = false
      break
  }
  done()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchContents()
})

// 组件激活时获取数据（用于处理路由切换）
onActivated(() => {
  // 使用 router 获取当前路由信息
  const route = useRoute()

  // 确保只在当前路由是内容管理页面时才执行相关操作
  if (route.path === '/content') {
    // 重置到默认标签页，确保每次进入内容管理页面都显示文案管理
    activeTab.value = 'copywriting'
    searchForm.type = 'copywriting'
    pagination.currentPage = 1
    fetchContents()
  }
})
</script>

<style scoped>
.content-management {
  padding: 20px;
}

.content-card {
  min-height: calc(100vh - 100px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
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
