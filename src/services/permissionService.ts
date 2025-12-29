import { apiClient, useMock } from './apiClient'
import mockApi from './mockApi'

// 权限查询参数接口
interface PermissionParams {
  page?: number
  pageSize?: number
  keyword?: string
  role?: string
}

// 管理员创建/更新数据接口
interface AdminData {
  username: string
  email: string
  roleId: number
  status: string
  description?: string
}

// 角色创建/更新数据接口
interface RoleData {
  name: string
  description: string
  permissions: number[]
  status?: string
}

// 导出参数接口
interface ExportParams {
  keyword?: string
  status?: string
  startDate?: string
  endDate?: string
}

// 获取权限列表接口
export const getPermissions = async (params?: PermissionParams) => {
  if (useMock) {
    return await mockApi.permissions.getRoles(params)
  }
  return apiClient.get('/permissions', { params })
}

// 分配权限接口
export const assignPermissions = async (roleId: number, permissionIds: number[]) => {
  if (useMock) {
    return await mockApi.permissions.assignPermissions(roleId, permissionIds)
  }
  return apiClient.post('/roles/permissions', {
    roleId,
    permissionIds,
  })
}

// 获取管理员列表接口
export const getAdmins = async (params?: PermissionParams) => {
  if (useMock) {
    return await mockApi.permissions.getAdmins(params)
  }
  return apiClient.get('/admins', { params })
}

// 获取单个管理员接口
export const getAdminById = async (id: number) => {
  if (useMock) {
    return await mockApi.permissions.getAdminById(id)
  }
  return apiClient.get(`/admins/${id}`)
}

// 创建管理员接口
export const createAdmin = async (data: AdminData) => {
  if (useMock) {
    return await mockApi.permissions.createAdmin(data)
  }
  return apiClient.post('/admins', data)
}

// 更新管理员接口
export const updateAdmin = async (id: number, data: AdminData) => {
  if (useMock) {
    return await mockApi.permissions.updateAdmin(id, data)
  }
  return apiClient.put(`/admins/${id}`, data)
}

// 删除管理员接口
export const deleteAdmin = async (id: number) => {
  if (useMock) {
    return await mockApi.permissions.deleteAdmin(id)
  }
  return apiClient.delete(`/admins/${id}`)
}

// 获取角色列表接口
export const getRoles = async (params?: PermissionParams) => {
  if (useMock) {
    return await mockApi.permissions.getRoles(params)
  }
  return apiClient.get('/roles', { params })
}

// 创建角色接口
export const createRole = async (data: RoleData) => {
  if (useMock) {
    return await mockApi.permissions.createRole({
      name: data.name,
      description: data.description,
      status: data.status || 'enabled',
    })
  }
  return apiClient.post('/roles', data)
}

// 更新角色接口
export const updateRole = async (id: number, data: RoleData) => {
  if (useMock) {
    return await mockApi.permissions.updateRole(id, data)
  }
  return apiClient.put(`/roles/${id}`, data)
}

// 删除角色接口
export const deleteRole = async (id: number) => {
  if (useMock) {
    return await mockApi.permissions.deleteRole(id)
  }
  return apiClient.delete(`/roles/${id}`)
}

// 导出角色数据接口
export const exportRoles = async (params?: ExportParams) => {
  if (useMock) {
    return await mockApi.permissions.exportRoles(params)
  }
  return apiClient.get('/roles/export', { params, responseType: 'blob' })
}

// 导出管理员数据接口
export const exportAdmins = async (params?: ExportParams) => {
  if (useMock) {
    return await mockApi.permissions.exportAdmins(params)
  }
  return apiClient.get('/admins/export', { params, responseType: 'blob' })
}
