<template>
  <div class="user-management">
    <el-card class="user-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="addUser">新增用户</el-button>
        </div>
      </template>

      <!-- 搜索框 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="searchForm.keyword" placeholder="请输入用户名或邮箱" clearable />
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
            <el-select
              v-model="searchForm.status"
              placeholder="用户状态"
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

      <!-- 用户表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="email" label="邮箱" width="250" />
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
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)"
              >编辑</el-button
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

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="userFormRef" :model="currentUser" :rules="userFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="currentUser.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentUser.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="currentUser.status" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser, exportUsers } from '@/services/userService'

// 用户数据类型定义
interface User {
  id: number
  username: string
  email: string
  status: 'enabled' | 'disabled'
  createTime: string
}

interface SearchForm {
  keyword: string
  dateRange: string[]
  status: string
}

interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

interface UserForm {
  id: number
  username: string
  email: string
  phone: string
  roleId: number
  status: 'enabled' | 'disabled'
}

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  keyword: '',
  dateRange: [],
  status: '',
})

// 表格加载状态
const loading = ref(false)

// 表格数据
const tableData = ref<User[]>([])

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

// 当前编辑的用户
const currentUser = reactive<UserForm>({
  id: 0,
  username: '',
  email: '',
  phone: '',
  roleId: 1,
  status: 'enabled',
})

// 用户表单引用
const userFormRef = ref()

// 用户表单验证规则
const userFormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
      status: searchForm.status || undefined,
    }

    const res = await getUsers(params)
    // 处理不同的响应类型
    if ('data' in res && Array.isArray(res.data)) {
      tableData.value = res.data as User[]
      pagination.total = ('total' in res ? res.total : res.data.length) || 0
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchUsers()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.dateRange = []
  searchForm.status = ''
  pagination.currentPage = 1
  fetchUsers()
}

// 导出数据
const handleExport = async () => {
  try {
    ElMessage.success('正在导出数据...')
    const params = {
      keyword: searchForm.keyword || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
      status: searchForm.status || undefined,
    }

    const res = await exportUsers(params)
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
    link.download = `用户数据_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '导出失败')
  }
}

// 编辑用户
const handleEdit = (row: User) => {
  isEditing.value = true
  dialogTitle.value = '编辑用户'

  // 填充表单数据
  Object.assign(currentUser, row)

  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: User) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteUser(row.id)
        ElMessage.success('删除成功')
        fetchUsers()
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 新增用户
const addUser = () => {
  isEditing.value = false
  dialogTitle.value = '新增用户'

  // 清空表单数据
  Object.assign(currentUser, {
    id: 0,
    username: '',
    email: '',
    phone: '',
    roleId: 1,
    status: 'enabled',
  })

  dialogVisible.value = true
}

// 保存用户
const saveUser = () => {
  if (!userFormRef.value) return

  userFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEditing.value) {
          // 编辑用户
          await updateUser(currentUser.id, currentUser)
          ElMessage.success('用户更新成功')
        } else {
          // 新增用户
          await createUser(currentUser)
          ElMessage.success('用户添加成功')
        }

        dialogVisible.value = false
        fetchUsers()
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '保存失败')
      }
    }
  })
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchUsers()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchUsers()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.user-card {
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
</style>
