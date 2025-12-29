import { apiClient, useMock } from './apiClient'
import mockApi from './mockApi'

// 内容查询参数接口
interface ContentParams {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
  status?: string
  startDate?: string
  endDate?: string
}

// 内容创建/更新数据接口
interface ContentData {
  title: string
  category: 'news' | 'product' | 'guide'
  content: string
  author?: string
  status?: 'draft' | 'published'
  description?: string
  publishTime?: string
}

// 获取内容列表接口
export const getArticles = async (params: ContentParams = {}) => {
  if (useMock) {
    // 使用模拟数据
    const response = await mockApi.content.getArticles(params)
    return response
  }

  const response = await apiClient.get('/content/articles', { params })
  return response.data
}

// 获取单个内容接口
export const getArticleById = async (id: number) => {
  if (useMock) {
    const response = await mockApi.content.getArticleById(id)
    return response
  }

  const response = await apiClient.get(`/content/articles/${id}`)
  return response.data
}

// 创建内容接口
export const createArticle = async (data: ContentData) => {
  if (useMock) {
    // 确保 status 和 author 有值
    const articleData = {
      ...data,
      status: data.status || 'draft',
      author: data.author || '管理员',
    }
    const response = await mockApi.content.createArticle(articleData)
    return response
  }

  const response = await apiClient.post('/content/articles', data)
  return response.data
}

// 更新内容接口
export const updateArticle = async (id: number, data: ContentData) => {
  if (useMock) {
    const response = await mockApi.content.updateArticle(id, data)
    return response
  }

  const response = await apiClient.put(`/content/articles/${id}`, data)
  return response.data
}

// 删除内容接口
export const deleteArticle = async (id: number) => {
  if (useMock) {
    const response = await mockApi.content.deleteArticle(id)
    return response
  }

  const response = await apiClient.delete(`/content/articles/${id}`)
  return response.data
}

// 更新内容状态接口
export const updateArticleStatus = async (id: number, status: 'draft' | 'published') => {
  if (useMock) {
    const response = await mockApi.content.updateArticleStatus(id, status)
    return response
  }

  const response = await apiClient.put(`/content/articles/${id}/status`, { status })
  return response.data
}
