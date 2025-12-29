import apiClient, { useMock } from './apiClient'
import mockApi from './mockApi'

// 供应商查询参数接口
interface SupplierParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  categoryId?: number
}

// 供应商创建/更新数据接口
interface SupplierData {
  name: string
  contact: string
  contactPerson: string
  phone: string
  email: string
  address: string
  category: string
  status: string
  cooperationLevel: number
  description?: string
}

// 获取供应商列表
export const getSuppliers = async (params: SupplierParams) => {
  if (useMock) {
    return await mockApi.suppliers.getSuppliers(params)
  }
  return apiClient.get('/suppliers', { params })
}

// 获取单个供应商
export const getSupplierById = async (id: number) => {
  if (useMock) {
    return await mockApi.suppliers.getSupplierById(id)
  }
  return apiClient.get(`/suppliers/${id}`)
}

// 创建供应商
export const createSupplier = async (data: SupplierData) => {
  if (useMock) {
    return await mockApi.suppliers.createSupplier(data)
  }
  return apiClient.post('/suppliers', data)
}

// 更新供应商
export const updateSupplier = async (id: number, data: SupplierData) => {
  if (useMock) {
    return await mockApi.suppliers.updateSupplier(id, data)
  }
  return apiClient.put(`/suppliers/${id}`, data)
}

// 删除供应商
export const deleteSupplier = async (id: number) => {
  if (useMock) {
    return await mockApi.suppliers.deleteSupplier(id)
  }
  return apiClient.delete(`/suppliers/${id}`)
}

// 导出供应商
export const exportSuppliers = async (params: SupplierParams): Promise<Blob> => {
  if (useMock) {
    return await mockApi.suppliers.exportSuppliers(params)
  }
  const response = await apiClient.get('/suppliers/export', { params, responseType: 'blob' })
  return response.data
}

// 获取供应商商品
export const getSupplierProducts = async (supplierId: number, params: SupplierParams) => {
  if (useMock) {
    return await mockApi.suppliers.getSupplierProducts(supplierId, params)
  }
  return apiClient.get(`/suppliers/${supplierId}/products`, { params })
}
