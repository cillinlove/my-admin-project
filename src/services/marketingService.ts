import { apiClient, useMock } from './apiClient'
import mockApi from './mockApi'

// 营销活动查询参数接口
interface PromotionParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}

// 营销活动创建/更新数据接口
interface PromotionData {
  title: string
  description: string
  type: 'discount' | 'promotion' | 'membership'
  status?: 'active' | 'upcoming' | 'inactive'
  startTime: string
  endTime: string
  discount?: number
  minAmount?: number
}

// 获取营销活动列表接口
export const getActivities = async (params: PromotionParams = {}) => {
  if (useMock) {
    // 使用模拟数据
    const response = await mockApi.marketing.getActivities(params)
    return response
  }

  const response = await apiClient.get('/marketing/activities', { params })
  return response.data
}

// 获取单个营销活动接口
export const getActivityById = async (id: number) => {
  if (useMock) {
    const response = await mockApi.marketing.getActivityById(id)
    return response
  }

  const response = await apiClient.get(`/marketing/activities/${id}`)
  return response.data
}

// 创建营销活动接口
export const createActivity = async (data: PromotionData) => {
  if (useMock) {
    // 确保 status 有值
    const activityData = { ...data, status: data.status || 'inactive' }
    const response = await mockApi.marketing.createActivity(activityData)
    return response
  }

  const response = await apiClient.post('/marketing/activities', data)
  return response.data
}

// 更新营销活动接口
export const updateActivity = async (id: number, data: PromotionData) => {
  if (useMock) {
    const response = await mockApi.marketing.updateActivity(id, data)
    return response
  }

  const response = await apiClient.put(`/marketing/activities/${id}`, data)
  return response.data
}

// 删除营销活动接口
export const deleteActivity = async (id: number) => {
  if (useMock) {
    const response = await mockApi.marketing.deleteActivity(id)
    return response
  }

  const response = await apiClient.delete(`/marketing/activities/${id}`)
  return response.data
}

// 更新营销活动状态接口
export const updateActivityStatus = async (
  id: number,
  status: 'active' | 'upcoming' | 'inactive',
) => {
  if (useMock) {
    const response = await mockApi.marketing.updateActivityStatus(id, status)
    return response
  }

  const response = await apiClient.put(`/marketing/activities/${id}/status`, { status })
  return response.data
}
