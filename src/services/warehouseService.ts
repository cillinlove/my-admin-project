import { apiClient, useMock } from './apiClient'
import mockApi from './mockApi'

// 仓库查询参数接口
interface WarehouseParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
}

// 仓库创建/更新数据接口
interface WarehouseData {
  name: string
  address: string
  manager: string
  phone: string
  capacity: number
  description?: string
  status: string
}

// 获取仓库列表接口
export const getWarehouses = async (params?: WarehouseParams) => {
  if (useMock) {
    return await mockApi.warehouses.getWarehouses(params)
  }
  return apiClient.get('/warehouses', { params })
}

// 获取单个仓库接口
export const getWarehouseById = async (id: number) => {
  if (useMock) {
    return await mockApi.warehouses.getWarehouseById(id)
  }
  return apiClient.get(`/warehouses/${id}`)
}

// 创建仓库接口
export const createWarehouse = async (data: WarehouseData) => {
  if (useMock) {
    return await mockApi.warehouses.createWarehouse(data)
  }
  return apiClient.post('/warehouses', data)
}

// 更新仓库接口
export const updateWarehouse = async (id: number, data: WarehouseData) => {
  if (useMock) {
    return await mockApi.warehouses.updateWarehouse(id, data)
  }
  return apiClient.put(`/warehouses/${id}`, data)
}

// 删除仓库接口
export const deleteWarehouse = async (id: number) => {
  if (useMock) {
    return await mockApi.warehouses.deleteWarehouse(id)
  }
  return apiClient.delete(`/warehouses/${id}`)
}

// 导出仓库数据接口
export const exportWarehouses = async (params?: WarehouseParams) => {
  if (useMock) {
    return await mockApi.warehouses.exportWarehouses(params)
  }
  return apiClient.get('/warehouses/export', { params, responseType: 'blob' })
}
