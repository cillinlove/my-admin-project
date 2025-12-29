<template>
  <div class="permission-management">
    <el-card class="permission-card">
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <div>
            <el-button type="primary" @click="addRole">新增角色</el-button>
            <el-button type="success" @click="showPaymentConfig">支付配置</el-button>
            <el-button type="warning" @click="showLogisticsConfig">物流配置</el-button>
            <el-button type="info" @click="showSystemConfig">系统参数</el-button>
          </div>
        </div>
      </template>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 角色管理标签 -->
        <el-tab-pane label="角色管理" name="roles">
          <el-table :data="roles" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="角色ID" width="100" />
            <el-table-column prop="name" label="角色名称" width="200" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="280">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="editRole(scope.row)"
                  >编辑</el-button
                >
                <el-button size="small" type="success" link @click="assignPermissions(scope.row)"
                  >分配权限</el-button
                >
                <el-button size="small" type="warning" link @click="manageAdmins(scope.row)"
                  >管理管理员</el-button
                >
                <el-button size="small" type="danger" link @click="deleteRoleHandler(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 管理员管理标签 -->
        <el-tab-pane label="管理员管理" name="admins">
          <div class="search-bar">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-input
                  v-model="adminSearchForm.keyword"
                  placeholder="请输入管理员姓名或邮箱"
                  clearable
                />
              </el-col>
              <el-col :span="6">
                <el-select
                  v-model="adminSearchForm.roleId"
                  placeholder="选择角色"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="role in roles"
                    :key="role.id"
                    :label="role.name"
                    :value="role.id"
                  />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="handleAdminSearch">搜索</el-button>
                <el-button @click="handleAdminReset">重置</el-button>
              </el-col>
            </el-row>
          </div>

          <el-table :data="admins" style="width: 100%" v-loading="adminLoading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="email" label="邮箱" width="200" />
            <el-table-column prop="roleName" label="角色" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                  {{ scope.row.status === 'active' ? '启用' : '禁用' }}
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
                <el-button size="small" type="primary" link @click="editAdmin(scope.row)"
                  >编辑</el-button
                >
                <el-button size="small" type="success" link @click="changeAdminStatus(scope.row)">
                  {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" link @click="handleDeleteAdmin(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="adminPagination.currentPage"
              v-model:page-size="adminPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="adminPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleAdminSizeChange"
              @current-change="handleAdminCurrentChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 角色编辑对话框 -->
    <el-dialog v-model="roleDialogVisible" :title="roleDialogTitle" width="500px">
      <el-form ref="roleFormRef" :model="currentRole" :rules="roleFormRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="currentRole.name" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="currentRole.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限分配对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="分配权限" width="600px">
      <el-tree
        ref="permissionTreeRef"
        :data="permissions"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedPermissions"
        :props="{ label: 'name', children: 'children' }"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 管理员编辑对话框 -->
    <el-dialog v-model="adminDialogVisible" :title="adminDialogTitle" width="500px">
      <el-form ref="adminFormRef" :model="currentAdmin" :rules="adminFormRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="currentAdmin.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentAdmin.email" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="currentAdmin.roleId" style="width: 100%">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEditingAdmin">
          <el-input v-model="currentAdmin.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adminDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAdmin">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 支付配置对话框 -->
    <el-dialog v-model="paymentConfigVisible" title="支付配置" width="800px">
      <el-form :model="paymentConfig" label-width="150px">
        <el-form-item label="支付宝支付">
          <el-switch v-model="paymentConfig.alipayEnabled" />
        </el-form-item>
        <el-form-item label="微信支付">
          <el-switch v-model="paymentConfig.wxpayEnabled" />
        </el-form-item>
        <el-form-item label="银行卡支付">
          <el-switch v-model="paymentConfig.bankpayEnabled" />
        </el-form-item>
        <el-form-item label="货到付款">
          <el-switch v-model="paymentConfig.codEnabled" />
        </el-form-item>
        <el-form-item label="支付超时时间(分钟)">
          <el-input-number v-model="paymentConfig.paymentTimeout" :min="1" :max="1440" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPaymentConfig">重置</el-button>
          <el-button type="primary" @click="savePaymentConfig">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 物流配置对话框 -->
    <el-dialog v-model="logisticsConfigVisible" title="物流配置" width="800px">
      <el-form :model="logisticsConfig" label-width="150px">
        <el-form-item label="默认物流公司">
          <el-select v-model="logisticsConfig.defaultLogistics" style="width: 100%">
            <el-option label="顺丰速运" value="sf" />
            <el-option label="圆通速递" value="yt" />
            <el-option label="中通快递" value="zt" />
            <el-option label="申通快递" value="st" />
            <el-option label="韵达速递" value="yd" />
          </el-select>
        </el-form-item>
        <el-form-item label="发货时间">
          <el-time-select
            v-model="logisticsConfig.shippingTime"
            start="08:00"
            step="00:30"
            end="22:00"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="发货地址">
          <el-cascader
            v-model="logisticsConfig.shippingAddress"
            :options="addressOptions"
            :props="{ checkStrictly: true }"
            placeholder="请选择发货地址"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="是否支持自提">
          <el-switch v-model="logisticsConfig.selfPickupEnabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetLogisticsConfig">重置</el-button>
          <el-button type="primary" @click="saveLogisticsConfig">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 系统参数设置对话框 -->
    <el-dialog v-model="systemConfigVisible" title="系统参数设置" width="800px">
      <el-form :model="systemParams" label-width="150px">
        <el-form-item label="系统名称">
          <el-input v-model="systemParams.systemName" />
        </el-form-item>
        <el-form-item label="系统描述">
          <el-input v-model="systemParams.systemDescription" type="textarea" />
        </el-form-item>
        <el-form-item label="最大上传文件大小(MB)">
          <el-input-number v-model="systemParams.maxUploadSize" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="会话超时时间(分钟)">
          <el-input-number v-model="systemParams.sessionTimeout" :min="10" :max="1440" />
        </el-form-item>
        <el-form-item label="订单自动取消时间(小时)">
          <el-input-number v-model="systemParams.orderAutoCancelTime" :min="1" :max="168" />
        </el-form-item>
        <el-form-item label="订单自动确认收货时间(天)">
          <el-input-number v-model="systemParams.orderAutoConfirmTime" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="是否启用注册">
          <el-switch v-model="systemParams.enableRegister" />
        </el-form-item>
        <el-form-item label="是否启用邮件服务">
          <el-switch v-model="systemParams.enableEmailService" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetSystemParams">重置</el-button>
          <el-button type="primary" @click="saveSystemParams">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 角色类型定义
interface Role {
  id: number
  name: string
  description: string
}

// 管理员类型定义
interface Admin {
  id: number
  username: string
  email: string
  roleId: number
  roleName: string
  status: 'active' | 'inactive'
  createTime: string
}

// 管理员类型
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  deleteAdmin as deleteAdminFromService,
  getPermissions,
} from '@/services/permissionService'
import { useRoute } from 'vue-router'

// 获取当前路由
const route = useRoute()

// 当前激活的标签页
const activeTab = ref('roles')

// 加载状态
const loading = ref(false)

// 类型定义
interface Role {
  id: number
  name: string
  description: string
}

// 角色数据
const roles = ref<Role[]>([])

// 权限数据
const permissions = ref<PermissionNode[]>([
  {
    id: 1,
    name: '用户管理',
    children: [
      { id: 101, name: '查看用户列表' },
      { id: 102, name: '新增用户' },
      { id: 103, name: '编辑用户' },
      { id: 104, name: '删除用户' },
    ],
  },
  {
    id: 2,
    name: '权限管理',
    children: [
      { id: 201, name: '查看角色列表' },
      { id: 202, name: '新增角色' },
      { id: 203, name: '编辑角色' },
      { id: 204, name: '删除角色' },
      { id: 205, name: '分配权限' },
    ],
  },
  {
    id: 3,
    name: '商品管理',
    children: [
      { id: 301, name: '查看商品列表' },
      { id: 302, name: '新增商品' },
      { id: 303, name: '编辑商品' },
      { id: 304, name: '删除商品' },
    ],
  },
  {
    id: 4,
    name: '订单管理',
    children: [
      { id: 401, name: '查看订单列表' },
      { id: 402, name: '处理订单' },
      { id: 403, name: '发货' },
      { id: 404, name: '取消订单' },
    ],
  },
])

// 对话框相关
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const adminDialogVisible = ref(false)
const paymentConfigVisible = ref(false)
const logisticsConfigVisible = ref(false)
const systemConfigVisible = ref(false)

const roleDialogTitle = ref('')
const adminDialogTitle = ref('')
const isEditingRole = ref(false)
const isEditingAdmin = ref(false)

// 当前编辑的角色
const currentRole = reactive<Role>({
  id: 0,
  name: '',
  description: '',
})

// 当前分配权限的角色
const currentRoleId = ref(0)

// 已选中的权限
const checkedPermissions = ref<number[]>([101, 102, 103, 104, 201, 202, 203, 204, 205])

// 表单引用
const roleFormRef = ref()
const permissionTreeRef = ref()
const adminFormRef = ref()

// 角色表单验证规则
const roleFormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
}

// 管理员相关
const adminLoading = ref(false)
const admins = ref<Admin[]>([])
const adminSearchForm = reactive({
  keyword: '',
  roleId: 0,
})
const adminPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 当前编辑的管理员
const currentAdmin = reactive({
  id: 0,
  username: '',
  email: '',
  roleId: 0,
  password: '',
})

// 管理员表单验证规则
const adminFormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

// 物流配置
const logisticsConfig = reactive({
  defaultLogistics: '顺丰速运',
  shippingTime: '24小时内',
  shippingAddress: '默认地址',
  selfPickupEnabled: false,
})

// 地址选项
const addressOptions = ref([
  { label: '默认地址', value: '默认地址' },
  { label: '北京朝阳区', value: '北京朝阳区' },
  { label: '上海浦东新区', value: '上海浦东新区' },
  { label: '广州天河区', value: '广州天河区' },
])

// 支付配置
const paymentConfig = reactive({
  alipayEnabled: true,
  wxpayEnabled: true,
  bankpayEnabled: false,
  codEnabled: false,
  paymentTimeout: 30,
})

// 系统参数
const systemParams = reactive({
  systemName: '电商管理系统',
  systemDescription: '高效便捷的电商管理平台',
  maxUploadSize: 10,
  sessionTimeout: 120,
  orderAutoCancelTime: 24,
  orderAutoConfirmTime: 7,
  enableRegister: true,
  enableEmailService: true,
})

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true
  try {
    const res: { data: Role[] } = await getRoles()
    roles.value = res.data
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 获取管理员列表
const fetchAdmins = async () => {
  adminLoading.value = true
  try {
    // 模拟获取管理员数据
    await new Promise((resolve) => setTimeout(resolve, 500))

    admins.value = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        roleId: 1,
        roleName: '超级管理员',
        status: 'active',
        createTime: '2023-01-01T10:00:00Z',
      },
      {
        id: 2,
        username: 'manager',
        email: 'manager@example.com',
        roleId: 2,
        roleName: '运营管理员',
        status: 'active',
        createTime: '2023-02-15T14:30:00Z',
      },
      {
        id: 3,
        username: 'staff',
        email: 'staff@example.com',
        roleId: 3,
        roleName: '普通管理员',
        status: 'inactive',
        createTime: '2023-03-10T09:15:00Z',
      },
    ]

    adminPagination.total = admins.value.length
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取管理员列表失败'
    ElMessage.error(message)
  } finally {
    adminLoading.value = false
  }
}

// 标签页切换处理
const handleTabChange = (tabName: string) => {
  if (tabName === 'admins' && admins.value.length === 0) {
    fetchAdmins()
  }
}

// 新增角色
const addRole = () => {
  isEditingRole.value = false
  roleDialogTitle.value = '新增角色'

  // 清空表单数据
  Object.assign(currentRole, {
    id: 0,
    name: '',
    description: '',
  })

  roleDialogVisible.value = true
}

// 编辑角色
const editRole = (row: Role) => {
  isEditingRole.value = true
  roleDialogTitle.value = '编辑角色'

  // 填充表单数据
  Object.assign(currentRole, row)

  roleDialogVisible.value = true
}

// 删除角色
const deleteRoleHandler = async (row: Role) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteRole(row.id)
        ElMessage.success('角色删除成功')
        fetchRoles()
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '删除失败'
        ElMessage.error(message)
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 保存角色
const saveRole = () => {
  if (!roleFormRef.value) return

  roleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEditingRole.value) {
          // 编辑角色
          await updateRole(currentRole.id, {
            ...currentRole,
            permissions: checkedPermissions.value,
          })
          ElMessage.success('角色更新成功')
        } else {
          // 新增角色
          await createRole({
            ...currentRole,
            permissions: checkedPermissions.value,
          })
          ElMessage.success('角色添加成功')
        }

        roleDialogVisible.value = false
        fetchRoles()
      } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '操作失败')
      }
    }
  })
}

// 权限树节点类型
interface PermissionNode {
  id: number
  name: string
  children?: PermissionNode[]
}

// 分配权限
const assignPermissions = async (row: Role) => {
  currentRoleId.value = row.id
  try {
    // 获取当前角色的权限
    const res = await getPermissions()
    permissions.value = res.data || res

    // 获取当前角色已分配的权限
    checkedPermissions.value = [101, 102, 201, 202] // 模拟获取角色权限

    permissionDialogVisible.value = true
  } catch {
    ElMessage.error('获取权限列表失败')
  }
}

// 保存权限分配
const savePermissions = () => {
  // 获取选中的节点
  const checkedNodes = permissionTreeRef.value.getCheckedNodes(false, true)
  console.log('选中的权限:', checkedNodes)

  // 实际项目中这里会调用API保存权限分配
  ElMessage.success('权限分配保存成功')
  permissionDialogVisible.value = false
}

// 管理管理员
const manageAdmins = (role: Role) => {
  activeTab.value = 'admins'
  adminSearchForm.roleId = role.id
  fetchAdmins()
}

// 管理员相关方法
const editAdmin = (admin: Admin) => {
  isEditingAdmin.value = true
  adminDialogTitle.value = '编辑管理员'

  Object.assign(currentAdmin, admin)
  currentAdmin.password = '' // 重置密码字段

  adminDialogVisible.value = true
}

const handleDeleteAdmin = async (admin: Admin) => {
  try {
    await ElMessageBox.confirm(`确定要删除管理员 "${admin.username}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteAdminFromService(admin.id)
    ElMessage.success('管理员删除成功')
    fetchAdmins()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : '删除失败')
    } else {
      ElMessage.info('已取消删除')
    }
  }
}

const changeAdminStatus = (admin: Admin) => {
  const newStatus = admin.status === 'active' ? 'inactive' : 'active'
  admin.status = newStatus
  ElMessage.success(`管理员${newStatus === 'active' ? '启用' : '禁用'}成功`)
}

const saveAdmin = () => {
  if (!adminFormRef.value) return

  adminFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEditingAdmin.value) {
          // 编辑管理员
          ElMessage.success('管理员更新成功')
        } else {
          // 新增管理员
          ElMessage.success('管理员添加成功')
        }

        adminDialogVisible.value = false
        fetchAdmins()
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '操作失败'
        ElMessage.error(message)
      }
    }
  })
}

const handleAdminSearch = () => {
  fetchAdmins()
}

const handleAdminReset = () => {
  adminSearchForm.keyword = ''
  adminSearchForm.roleId = 0
  fetchAdmins()
}

const handleAdminSizeChange = (val: number) => {
  adminPagination.pageSize = val
  fetchAdmins()
}

const handleAdminCurrentChange = (val: number) => {
  adminPagination.currentPage = val
  fetchAdmins()
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 支付与物流配置相关方法
const showPaymentConfig = () => {
  paymentConfigVisible.value = true
}

const showLogisticsConfig = () => {
  logisticsConfigVisible.value = true
}

const showSystemConfig = () => {
  systemConfigVisible.value = true
}

const resetLogisticsConfig = () => {
  Object.assign(logisticsConfig, {
    defaultLogistics: '顺丰速运',
    shippingTime: '24小时内',
    shippingAddress: '默认地址',
    selfPickupEnabled: false,
  })
}

const saveLogisticsConfig = () => {
  ElMessage.success('物流配置保存成功')
  logisticsConfigVisible.value = false
}

const resetSystemParams = () => {
  Object.assign(systemParams, {
    systemName: '电商管理系统',
    systemDescription: '高效便捷的电商管理平台',
    maxUploadSize: 10,
    sessionTimeout: 120,
    orderAutoCancelTime: 24,
    orderAutoConfirmTime: 7,
    enableRegister: true,
    enableEmailService: true,
  })
}

const saveSystemParams = () => {
  ElMessage.success('系统参数保存成功')
  systemConfigVisible.value = false
}

const resetPaymentConfig = () => {
  Object.assign(paymentConfig, {
    alipayEnabled: true,
    wxpayEnabled: true,
    bankpayEnabled: false,
    codEnabled: false,
    paymentTimeout: 30,
  })
}

const savePaymentConfig = () => {
  ElMessage.success('支付配置保存成功')
  paymentConfigVisible.value = false
}

// 组件激活时重新获取数据
onActivated(() => {
  if (route.path === '/permissions') {
    if (activeTab.value === 'roles') {
      fetchRoles()
    } else if (activeTab.value === 'admins') {
      fetchAdmins()
    }
  }
})

// 组件挂载时获取数据
onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.permission-management {
  padding: 20px;
}

.permission-card {
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

.permission-tree {
  margin-top: 20px;
}
</style>
