import { apiClient, useMock } from './apiClient'
import mockApi from './mockApi'

// 用户查询参数接口
interface UserParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  roleId?: number
}

// 用户创建/更新数据接口
interface UserData {
  username: string
  email: string
  phone: string
  roleId: number
  status: string
  description?: string
}

// 反馈更新数据接口
interface FeedbackData {
  status: string
  response?: string
}

// 获取用户列表接口
export const getUsers = async (params?: UserParams) => {
  if (useMock) {
    return await mockApi.users.getUsers(params)
  }
  return apiClient.get('/users', { params })
}

// 获取单个用户接口
export const getUserById = async (id: number) => {
  if (useMock) {
    return await mockApi.users.getUserById(id)
  }
  return apiClient.get(`/users/${id}`)
}

// 创建用户接口
export const createUser = async (data: UserData) => {
  if (useMock) {
    return await mockApi.users.createUser(data)
  }
  return apiClient.post('/users', data)
}

// 更新用户接口
export const updateUser = async (id: number, data: UserData) => {
  if (useMock) {
    return await mockApi.users.updateUser(id, data)
  }
  return apiClient.put(`/users/${id}`, data)
}

// 删除用户接口
export const deleteUser = async (id: number) => {
  if (useMock) {
    return await mockApi.users.deleteUser(id)
  }
  return apiClient.delete(`/users/${id}`)
}

// 导出用户数据接口
export const exportUsers = async (params?: UserParams) => {
  if (useMock) {
    return await mockApi.users.exportUsers(params)
  }
  return apiClient.get('/users/export', { params, responseType: 'blob' })
}

// 获取用户反馈接口
export const getUserFeedback = async (userId: number, params?: UserParams) => {
  if (useMock) {
    // 模拟获取用户反馈
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              type: 'suggestion',
              content: '建议增加夜间模式',
              status: 'pending',
              createTime: '2023-12-01T10:30:00Z',
            },
            {
              id: 2,
              type: 'bug',
              content: '订单页面偶尔出现空白',
              status: 'processed',
              createTime: '2023-12-05T14:20:00Z',
              response: '已修复该问题',
            },
            {
              id: 3,
              type: 'complaint',
              content: '客服响应太慢',
              status: 'pending',
              createTime: '2023-12-10T09:15:00Z',
            },
            {
              id: 4,
              type: 'praise',
              content: '界面设计很棒，用户体验好',
              status: 'closed',
              createTime: '2023-12-12T16:45:00Z',
            },
          ],
          total: 4,
        })
      }, 500)
    })
  }
  return apiClient.get(`/users/${userId}/feedback`, { params })
}

// 更新反馈状态接口
export const updateFeedbackStatus = async (feedbackId: number, data: FeedbackData) => {
  if (useMock) {
    // 模拟更新反馈状态
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '反馈状态更新成功' })
      }, 500)
    })
  }
  return apiClient.put(`/feedback/${feedbackId}`, data)
}
