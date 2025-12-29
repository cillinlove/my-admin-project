import { apiClient, useMock } from './apiClient'
import mockApi from './mockApi'

// 登录接口
export const login = async (username: string, password: string) => {
  if (useMock) {
    return await mockApi.auth.login(username, password)
  }
  return apiClient.post('/auth/login', {
    username,
    password
  })
}

// 获取用户信息接口
export const getUserInfo = async () => {
  if (useMock) {
    return await mockApi.auth.getInfo()
  }
  return apiClient.get('/auth/info')
}

// 退出登录接口
export const logout = async () => {
  if (useMock) {
    return await mockApi.auth.logout()
  }
  return apiClient.post('/auth/logout')
}