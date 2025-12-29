import { apiClient, useMock } from './apiClient'
import mockApi from './mockApi'

// 订单查询参数接口
interface OrderParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  startDate?: string
  endDate?: string
}

// 售后申请数据接口
interface AfterSalesData {
  orderId: string
  type: string
  reason: string
  description?: string
}

// 订单更新数据接口
interface OrderUpdateData {
  status?: string
  shippingAddress?: string
  notes?: string
}

// 获取订单列表接口
export const getOrderList = async (params: OrderParams = {}) => {
  if (useMock) {
    // 使用模拟数据
    const response = await mockApi.orders.getOrders(params)
    return response
  }

  const response = await apiClient.get('/orders', { params })
  return response.data
}

// 获取订单详情接口
export const getOrderDetail = async (id: number) => {
  if (useMock) {
    const response = await mockApi.orders.getOrderById(id)
    return response
  }

  const response = await apiClient.get(`/orders/${id}`)
  return response.data
}

// 更新订单状态接口
export const updateOrderStatus = async (id: number, status: string) => {
  if (useMock) {
    // 模拟更新订单状态
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, status, updateTime: new Date().toISOString() })
      }, 500)
    })
  }

  const response = await apiClient.put(`/orders/${id}/status`, { status })
  return response.data
}

// 处理售后申请接口
export const processAfterSales = async (data: AfterSalesData) => {
  if (useMock) {
    // 模拟处理售后
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '售后处理成功' })
      }, 500)
    })
  }

  const response = await apiClient.post('/orders/after-sales', data)
  return response.data
}

// 获取物流信息接口
export const getLogisticsInfo = async (orderId: string) => {
  if (useMock) {
    // 模拟返回物流信息
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId,
          company: '模拟快递公司',
          trackingNumber: 'SF1234567890',
          steps: [
            { time: '2023-12-23 15:30:00', content: '订单已提交' },
            { time: '2023-12-23 15:35:00', content: '仓库正在拣货' },
            { time: '2023-12-23 16:00:00', content: '已打包，等待发货' },
          ],
        })
      }, 500)
    })
  }

  const response = await apiClient.get(`/orders/${orderId}/logistics`)
  return response.data
}

// 更新订单接口
export const updateOrder = async (id: string, data: OrderUpdateData) => {
  if (useMock) {
    // 模拟更新订单
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '订单更新成功', data })
      }, 500)
    })
  }

  const response = await apiClient.put(`/orders/${id}`, data)
  return response.data
}

// 删除订单接口
export const deleteOrder = async (id: string) => {
  if (useMock) {
    // 模拟删除订单
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '订单删除成功' })
      }, 500)
    })
  }

  const response = await apiClient.delete(`/orders/${id}`)
  return response.data
}

// 导出订单数据接口
export const exportOrders = async (params?: OrderParams) => {
  if (useMock) {
    // 模拟导出订单
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '订单数据导出成功' })
      }, 1000)
    })
  }

  const response = await apiClient.get('/orders/export', { params, responseType: 'blob' })
  return response.data
}
