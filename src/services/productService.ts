import { apiClient, useMock } from './apiClient'
import mockApi from './mockApi'

// 产品查询参数接口
interface ProductParams {
  page?: number
  pageSize?: number
  keyword?: string
  categoryId?: number
  brandId?: number
  status?: string
}

// 产品创建/更新数据接口
interface ProductData {
  name: string
  category: string
  brand: string
  price: number
  stock: number
  description?: string
  status?: 'enabled' | 'disabled'
  images?: string[]
  specifications?: Record<string, unknown>
  supplierId?: number
  onSale?: boolean
  updateTime?: string
}

// 评价查询参数接口
interface ReviewParams {
  page?: number
  pageSize?: number
  status?: string
}

// 评价数据接口
interface Review {
  id: number
  userId: number
  userName: string
  productId: number
  productName: string
  rating: number
  content: string
  status: 'pending' | 'approved' | 'rejected'
  createTime: string
  adminReply?: string
}

// 分类数据接口
interface Category {
  id: number
  name: string
  description?: string
}

// 品牌数据接口
interface Brand {
  id: number
  name: string
  description?: string
}

// 获取产品列表接口
export const getProducts = async (params?: ProductParams) => {
  if (useMock) {
    return await mockApi.products.getProducts(params)
  }
  return apiClient.get('/products', { params })
}

// 获取单个产品接口
export const getProductById = async (id: number) => {
  if (useMock) {
    return await mockApi.products.getProductById(id)
  }
  return apiClient.get(`/products/${id}`)
}
// 创建产品接口
export const createProduct = async (data: ProductData) => {
  if (useMock) {
    // 确保所有必需属性都有值
    const productData = {
      ...data,
      status: data.status || 'enabled',
      description: data.description || '暂无描述',
      onSale: data.onSale !== undefined ? data.onSale : true,
      updateTime: data.updateTime || new Date().toISOString(),
      images: data.images || [],
      specifications: data.specifications || {},
    }
    const response = await mockApi.products.createProduct(productData)
    return response
  }
  return apiClient.post('/products', data)
}

// 更新产品接口
export const updateProduct = async (id: number, data: ProductData) => {
  if (useMock) {
    return await mockApi.products.updateProduct(id, data)
  }
  return apiClient.put(`/products/${id}`, data)
}

// 删除产品接口
export const deleteProduct = async (id: number) => {
  if (useMock) {
    return await mockApi.products.deleteProduct(id)
  }
  return apiClient.delete(`/products/${id}`)
}

// 导出产品数据接口
export const exportProducts = async (params?: ProductParams) => {
  if (useMock) {
    return await mockApi.products.exportProducts(params)
  }
  return apiClient.get('/products/export', { params, responseType: 'blob' })
}

// 导出产品数据接口（大文件流式下载）
export const exportProductsAsLargeFile = async (
  params: ProductParams,
  filename: string,
  onProgress?: (progress: number) => void,
) => {
  if (useMock) {
    // Mock模式下仍使用传统方式
    const data = await mockApi.products.exportProducts(params)
    return data
  }

  // 构造带参数的URL
  const urlParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      urlParams.append(key, String(value))
    }
  })

  const url = `/products/export?${urlParams.toString()}`
  return downloadLargeFile(url, filename, onProgress)
}

// 获取产品评价接口
export const getProductReviews = async (productId: number, params?: ReviewParams) => {
  if (useMock) {
    // 模拟获取产品评价
    return await new Promise<{ data: Review[]; total: number }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              userId: 1,
              userName: '张三',
              productId,
              productName: '示例产品',
              rating: 5,
              content: '产品质量很好，非常满意！',
              createTime: '2023-12-01T10:30:00Z',
              status: 'approved',
            },
            {
              id: 2,
              userId: 2,
              userName: '李四',
              productId,
              productName: '示例产品',
              rating: 4,
              content: '商品不错，物流也很快',
              createTime: '2023-12-02T14:20:00Z',
              status: 'pending',
            },
            {
              id: 3,
              userId: 3,
              userName: '王五',
              productId,
              productName: '示例产品',
              rating: 3,
              content: '一般般，还有改进空间',
              createTime: '2023-12-03T09:15:00Z',
              status: 'rejected',
            },
            {
              id: 4,
              userId: 4,
              userName: '赵六',
              productId,
              productName: '示例产品',
              rating: 5,
              content: '超赞的商品，下次还会购买',
              createTime: '2023-12-04T16:45:00Z',
              status: 'approved',
            },
          ],
          total: 4,
        })
      }, 500)
    })
  }
  return apiClient.get(`/products/${productId}/reviews`, { params })
}

// 更新评价状态接口
export const updateReviewStatus = async (reviewId: number, status: string, comment?: string) => {
  if (useMock) {
    // 模拟更新评价状态
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '评价状态更新成功' })
      }, 500)
    })
  }
  return apiClient.put(`/reviews/${reviewId}/status`, { status, comment })
}

// 删除评价接口
export const deleteReview = async (reviewId: number) => {
  if (useMock) {
    // 模拟删除评价
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '评价删除成功' })
      }, 500)
    })
  }
  return apiClient.delete(`/reviews/${reviewId}`)
}

// 获取产品分类接口
export const getProductCategories = async () => {
  if (useMock) {
    // 模拟获取产品分类
    return await new Promise<{ data: Category[] }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              name: '电子产品',
              description: '各类电子设备产品',
            },
            {
              id: 2,
              name: '服装',
              description: '各类服装产品',
            },
            {
              id: 3,
              name: '食品',
              description: '各类食品产品',
            },
          ],
        })
      }, 300)
    })
  }
  return apiClient.get('/products/categories')
}

// 获取产品品牌接口
export const getProductBrands = async () => {
  if (useMock) {
    // 模拟获取产品品牌
    return await new Promise<{ data: Brand[] }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              name: '苹果',
              description: '苹果公司品牌',
            },
            {
              id: 2,
              name: '耐克',
              description: '耐克运动品牌',
            },
            {
              id: 3,
              name: '德芙',
              description: '德芙巧克力品牌',
            },
          ],
        })
      }, 300)
    })
  }
  return apiClient.get('/products/brands')
}

// 供应商产品数据接口
interface SupplierProduct {
  id: number
  supplierId: number
  productId: number
  supplierProductCode: string
  purchasePrice: number
  supplyTime: number
  moq: number
  remark: string
  createTime: string
  status: string
}

// 获取供应商产品接口
export const getSupplierProducts = async (supplierId: number, params?: ProductParams) => {
  if (useMock) {
    // 模拟获取供应商产品
    return await new Promise<{ data: SupplierProduct[]; total: number }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              supplierId,
              productId: 1,
              supplierProductCode: 'APL-IPH15-001',
              purchasePrice: 4500.0,
              supplyTime: 3,
              moq: 10,
              remark: '苹果官方授权供货',
              createTime: '2023-01-01T08:00:00Z',
              status: 'enabled',
            },
          ],
          total: 1,
        })
      }, 500)
    })
  }
  return apiClient.get(`/suppliers/${supplierId}/products`, { params })
}

// 下载大文件工具函数
const downloadLargeFile = (
  url: string,
  filename: string,
  onProgress?: (progress: number) => void,
) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'

    xhr.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100
        onProgress(progress)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response])
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
        resolve({ success: true })
      } else {
        reject(new Error('下载失败'))
      }
    }

    xhr.onerror = () => {
      reject(new Error('网络错误'))
    }

    xhr.send()
  })
}
