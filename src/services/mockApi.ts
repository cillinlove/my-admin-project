// 模拟API延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 模拟API错误
interface ApiError extends Error {
  status?: number
}

const throwError = (message: string, status: number = 500) => {
  const error: ApiError = new Error(message)
  error.status = status
  throw error
}

// 模拟分页处理
interface PaginatedResult<T> {
  data: T[]
  total: number
}

const paginate = <T>(data: T[], page: number, pageSize: number): PaginatedResult<T> => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    data: data.slice(start, end),
    total: data.length,
  }
}

// 默认导出

// 数据过滤接口
interface FilterOptions {
  keyword?: string
  address?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// 基础数据项接口
interface BaseDataItem {
  id: number
  username?: string
  email?: string
  name?: string
  contact?: string
  address?: string
  status?: string
  createTime: string
}

// 用户数据接口
interface User extends BaseDataItem {
  username: string
  email: string
  status: string
}

// 产品数据接口
interface Product extends BaseDataItem {
  name: string
  category: string
  brand: string
  price: number
  stock: number
  status: 'enabled' | 'disabled'
  onSale: boolean
  createTime: string
  updateTime: string
  images: string[]
  description: string
  specifications: Record<string, unknown>
  supplierId?: number
  supplierName?: string
}

// 仓库数据接口
interface Warehouse extends BaseDataItem {
  name: string
  address: string
  totalStock: number
  manager: string
  phone: string
  lastInbound: string
  status: string
}

// 供应商数据接口
interface Supplier extends BaseDataItem {
  name: string
  contact: string
  contactPerson: string
  phone: string
  email: string
  address: string
  status: string
  category: string
  cooperationLevel: number
}

// 订单数据接口
interface Order extends BaseDataItem {
  orderNo: string
  userId: number
  productId: number
  quantity: number
  amount: number
  status:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'pending_payment'
    | 'pending_shipment'
    | 'pending_receipt'
    | 'after_sales'
}

// 营销活动数据接口
interface MarketingActivity extends BaseDataItem {
  title: string
  type: 'discount' | 'promotion' | 'membership'
  startTime: string
  endTime: string
  status: 'active' | 'upcoming' | 'inactive'
  description: string
}

// 内容文章数据接口
interface ContentArticle extends BaseDataItem {
  title: string
  category: 'news' | 'product' | 'guide'
  content: string
  author: string
  status: 'draft' | 'published'
  publishTime?: string
  description?: string
}

// 角色数据接口
interface Role extends BaseDataItem {
  name: string
  description: string
  status: string
}

// 供应商产品数据接口
interface SupplierProduct extends BaseDataItem {
  supplierId: number
  productId: number
  supplierProductCode: string
  purchasePrice: number
  supplyTime: number
  moq: number
  remark: string
}

// 分页响应接口
interface PaginationResponse<T> {
  data: T[]
  total: number
}

// 通用响应接口
interface ApiResponse<T> {
  data: T
  message?: string
}

// 模拟搜索过滤
const filterData = <T extends BaseDataItem>(data: T[], filters: FilterOptions): T[] => {
  return data.filter((item) => {
    // 关键字搜索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      const matchesKeyword =
        (item.username && item.username.toLowerCase().includes(keyword)) ||
        (item.email && item.email.toLowerCase().includes(keyword)) ||
        (item.name && item.name.toLowerCase().includes(keyword)) ||
        (item.id && item.id.toString().includes(keyword)) ||
        (item.contact && item.contact.toLowerCase().includes(keyword))
      if (!matchesKeyword) return false
    }

    // 地址搜索
    if (filters.address) {
      const address = filters.address.toLowerCase()
      if (item.address && !item.address.toLowerCase().includes(address)) {
        return false
      }
    }

    // 状态筛选
    if (filters.status && item.status !== filters.status) {
      return false
    }

    // 日期范围筛选
    if (filters.startDate || filters.endDate) {
      const itemDate = new Date(item.createTime)

      if (filters.startDate && itemDate < new Date(filters.startDate)) {
        return false
      }

      if (filters.endDate && itemDate > new Date(filters.endDate + 'T23:59:59')) {
        return false
      }
    }

    return true
  })
}

// 模拟用户数据
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    createTime: '2023-01-01T08:00:00Z',
    status: 'enabled',
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@example.com',
    createTime: '2023-01-02T10:30:00Z',
    status: 'enabled',
  },
  {
    id: 3,
    username: 'jane_smith',
    email: 'jane@example.com',
    createTime: '2023-01-03T14:15:00Z',
    status: 'disabled',
  },
  {
    id: 4,
    username: 'alice_wonder',
    email: 'alice@example.com',
    createTime: '2023-01-04T09:45:00Z',
    status: 'enabled',
  },
  {
    id: 5,
    username: 'bob_builder',
    email: 'bob@example.com',
    createTime: '2023-01-05T16:20:00Z',
    status: 'enabled',
  },
]

// 模拟产品数据
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'iPhone 15',
    category: '电子产品',
    brand: 'Apple',
    price: 5999.0,
    stock: 100,
    status: 'enabled' as Product['status'],
    onSale: true,
    createTime: '2023-01-01T08:00:00Z',
    updateTime: '2023-01-01T08:00:00Z',
    images: ['https://example.com/iphone15.jpg'],
    description: '最新款iPhone智能手机',
    specifications: {
      color: '蓝色',
      storage: '128GB',
    } as Record<string, unknown>,
    supplierId: 1,
    supplierName: '苹果官方供应商',
  },
  {
    id: 2,
    name: 'Nike运动鞋',
    category: '服装',
    brand: 'Nike',
    price: 899.0,
    stock: 50,
    status: 'enabled' as Product['status'],
    onSale: false,
    createTime: '2023-01-02T10:30:00Z',
    updateTime: '2023-01-02T10:30:00Z',
    images: ['https://example.com/nike-shoes.jpg'],
    description: 'Nike专业运动鞋',
    specifications: {
      size: '42',
      color: '黑色',
    } as Record<string, unknown>,
    supplierId: 2,
    supplierName: 'Nike官方供应商',
  },
  {
    id: 3,
    name: '巧克力礼盒',
    category: '食品',
    brand: '德芙',
    price: 128.0,
    stock: 200,
    status: 'disabled' as Product['status'],
    onSale: true,
    createTime: '2023-01-03T14:15:00Z',
    updateTime: '2023-01-03T14:15:00Z',
    images: ['https://example.com/chocolate.jpg'],
    description: '精美巧克力礼盒装',
    specifications: {
      weight: '500g',
      flavor: '牛奶巧克力',
    } as Record<string, unknown>,
    supplierId: 3,
    supplierName: '德芙官方供应商',
  },
]

// 模拟仓库数据
const mockWarehouses = [
  {
    id: 1,
    name: '北京一号仓',
    address: '北京市朝阳区建国路123号',
    totalStock: 15000,
    manager: '张三',
    phone: '13800138001',
    createTime: '2023-01-01T08:00:00Z',
    lastInbound: '2023-10-15T14:30:00Z',
    status: 'enabled',
  },
  {
    id: 2,
    name: '上海二号仓',
    address: '上海市浦东新区陆家嘴金融街456号',
    totalStock: 22000,
    manager: '李四',
    phone: '13800138002',
    createTime: '2023-02-01T09:00:00Z',
    lastInbound: '2023-10-18T10:15:00Z',
    status: 'enabled',
  },
  {
    id: 3,
    name: '广州三号仓',
    address: '广州市天河区珠江新城789号',
    totalStock: 18000,
    manager: '王五',
    phone: '13800138003',
    createTime: '2023-03-01T10:00:00Z',
    lastInbound: '2023-10-10T16:45:00Z',
    status: 'disabled',
  },
]

// 模拟供应商数据
const mockSuppliers = [
  {
    id: 1,
    name: '苹果供应商',
    contact: '张经理',
    contactPerson: '张经理',
    phone: '13800138001',
    email: 'apple@supplier.com',
    address: '深圳市南山区科技园',
    category: 'electronics',
    cooperationLevel: 5,
    createTime: '2023-01-01T08:00:00Z',
    status: 'enabled',
  },
  {
    id: 2,
    name: '耐克供应商',
    contact: '李经理',
    contactPerson: '李经理',
    phone: '13800138002',
    email: 'nike@supplier.com',
    address: '上海市浦东新区',
    category: 'clothing',
    cooperationLevel: 4,
    createTime: '2023-02-01T09:00:00Z',
    status: 'enabled',
  },
  {
    id: 3,
    name: '巧克力供应商',
    contact: '王经理',
    contactPerson: '王经理',
    phone: '13800138003',
    email: 'chocolate@supplier.com',
    address: '广州市白云区',
    category: 'food',
    cooperationLevel: 3,
    createTime: '2023-03-01T10:00:00Z',
    status: 'disabled',
  },
]

// 模拟订单数据
const mockOrders = [
  {
    id: 1,
    orderNo: 'ORD202301010001',
    userId: 1,
    productId: 1,
    quantity: 2,
    amount: 11998.0,
    status: 'completed' as Order['status'],
    createTime: '2023-01-01T10:00:00Z',
  },
  {
    id: 2,
    orderNo: 'ORD202301020002',
    userId: 2,
    productId: 2,
    quantity: 1,
    amount: 899.0,
    status: 'pending' as Order['status'],
    createTime: '2023-01-02T11:30:00Z',
  },
  {
    id: 3,
    orderNo: 'ORD202301030003',
    userId: 3,
    productId: 3,
    quantity: 5,
    amount: 640.0,
    status: 'cancelled' as Order['status'],
    createTime: '2023-01-03T14:20:00Z',
  },
  {
    id: 4,
    orderNo: 'ORD202301040004',
    userId: 4,
    productId: 1,
    quantity: 1,
    amount: 5999.0,
    status: 'pending_payment' as Order['status'],
    createTime: '2023-01-04T16:45:00Z',
  },
  {
    id: 5,
    orderNo: 'ORD202301050005',
    userId: 5,
    productId: 2,
    quantity: 3,
    amount: 2697.0,
    status: 'pending_shipment' as Order['status'],
    createTime: '2023-01-05T09:15:00Z',
  },
]

// 模拟营销活动数据
const mockMarketingActivities = [
  {
    id: 1,
    title: '春节大促销',
    type: 'discount' as MarketingActivity['type'],
    startTime: '2023-01-20T00:00:00Z',
    endTime: '2023-02-20T23:59:59Z',
    status: 'active' as MarketingActivity['status'],
    description: '春节期间全场商品打折促销活动',
    createTime: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: '新品上市推广',
    type: 'promotion' as MarketingActivity['type'],
    startTime: '2023-02-15T00:00:00Z',
    endTime: '2023-03-15T23:59:59Z',
    status: 'upcoming' as MarketingActivity['status'],
    description: '新品上市推广活动，吸引新用户',
    createTime: '2023-02-01T00:00:00Z',
  },
  {
    id: 3,
    title: '会员专享活动',
    type: 'membership' as MarketingActivity['type'],
    startTime: '2023-03-01T00:00:00Z',
    endTime: '2023-03-31T23:59:59Z',
    status: 'inactive' as MarketingActivity['status'],
    description: '针对会员用户的专享优惠活动',
    createTime: '2023-02-15T00:00:00Z',
  },
]

// 模拟内容管理数据
const mockContentArticles = [
  {
    id: 1,
    title: '公司新闻',
    category: 'news' as ContentArticle['category'],
    content: '这里是公司新闻的内容',
    author: 'admin',
    status: 'published' as ContentArticle['status'],
    createTime: '2023-01-01T08:00:00Z',
    publishTime: '2023-01-02T08:00:00Z',
  },
  {
    id: 2,
    title: '产品介绍',
    category: 'product' as ContentArticle['category'],
    content: '这里是产品介绍的内容',
    author: 'editor',
    status: 'draft' as ContentArticle['status'],
    createTime: '2023-01-03T09:00:00Z',
  },
  {
    id: 3,
    title: '使用指南',
    category: 'guide' as ContentArticle['category'],
    content: '这里是使用指南的内容',
    author: 'support',
    status: 'published' as ContentArticle['status'],
    createTime: '2023-01-04T10:00:00Z',
    publishTime: '2023-01-04T14:00:00Z',
  },
]

// 模拟角色数据
const mockRoles = [
  {
    id: 1,
    name: 'admin',
    description: '系统管理员',
    createTime: '2023-01-01T08:00:00Z',
    status: 'enabled',
  },
  {
    id: 2,
    name: 'user',
    description: '普通用户',
    createTime: '2023-01-02T09:00:00Z',
    status: 'enabled',
  },
]

// 模拟供应商商品数据
const mockSupplierProducts = [
  {
    id: 1,
    supplierId: 1,
    productId: 1,
    supplierProductCode: 'APL-IPH15-001',
    purchasePrice: 4500.0,
    supplyTime: 3,
    moq: 10,
    remark: '苹果官方授权供货',
    createTime: '2023-01-01T08:00:00Z',
    status: 'enabled',
  },
  {
    id: 2,
    supplierId: 2,
    productId: 2,
    supplierProductCode: 'NIKE-SHOE-001',
    purchasePrice: 600.0,
    supplyTime: 5,
    moq: 20,
    remark: '耐克区域代理供货',
    createTime: '2023-02-01T09:00:00Z',
    status: 'enabled',
  },
  {
    id: 3,
    supplierId: 3,
    productId: 3,
    supplierProductCode: 'CHOCO-GIFT-001',
    purchasePrice: 80.0,
    supplyTime: 2,
    moq: 50,
    remark: '巧克力礼盒专供',
    createTime: '2023-03-01T10:00:00Z',
    status: 'disabled',
  },
]

// 模拟认证令牌
const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE2MTYyMzkwMjJ9.EU1C4zp0zMt0xKct6Csyfg_8z8G0A6Cf6QxfC5nQd7M'

export default {
  // 认证相关
  auth: {
    login: async (username: string, password: string) => {
      await delay(500)

      if (username === 'admin' && password === '123456') {
        return { token: mockToken }
      }

      throwError('用户名或密码错误', 401)
    },

    getInfo: async () => {
      await delay(300)
      return {
        id: 1,
        username: 'admin',
        role: 'admin',
      }
    },

    logout: async () => {
      await delay(200)
      return { message: '退出成功' }
    },
  },

  // 用户相关
  users: {
    getUsers: async (params: FilterOptions = {}): Promise<PaginationResponse<User>> => {
      await delay(500)

      const filteredUsers = filterData(mockUsers, params)
      const paginated = paginate(filteredUsers, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },

    getUserById: async (id: number): Promise<User | undefined> => {
      await delay(300)

      const user = mockUsers.find((u) => u.id === id)
      if (!user) throwError('用户不存在', 404)

      return user
    },

    createUser: async (data: Omit<User, 'id' | 'createTime'>): Promise<User> => {
      await delay(500)

      const newUser: User = {
        id: Math.max(...mockUsers.map((u) => u.id), 0) + 1,
        ...data,
        status: data.status || 'enabled',
        createTime: new Date().toISOString(),
      }

      mockUsers.push(newUser)
      return newUser
    },

    updateUser: async (id: number, data: Partial<User>): Promise<User> => {
      await delay(500)

      const index = mockUsers.findIndex((u) => u.id === id)
      if (index === -1) throwError('用户不存在', 404)

      const existingUser = mockUsers[index]!
      mockUsers[index] = {
        ...existingUser,
        ...data,
        status: data.status || existingUser.status || 'enabled',
      }
      return mockUsers[index]
    },

    deleteUser: async (id: number): Promise<ApiResponse<string>> => {
      await delay(500)

      const index = mockUsers.findIndex((u) => u.id === id)
      if (index === -1) throwError('用户不存在', 404)

      mockUsers.splice(index, 1)
      return { data: '删除成功' }
    },

    exportUsers: async (params: FilterOptions = {}): Promise<Blob> => {
      await delay(800)

      const filteredUsers = filterData(mockUsers, params)
      const content = JSON.stringify(filteredUsers)
      return new Blob([content], { type: 'application/json' })
    },
  },

  // 产品相关
  products: {
    getProducts: async (params: FilterOptions = {}): Promise<PaginationResponse<Product>> => {
      await delay(500)

      const filteredProducts = filterData(mockProducts, params)
      const paginated = paginate(filteredProducts, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },

    getProductById: async (id: number): Promise<Product | undefined> => {
      await delay(300)

      const product = mockProducts.find((p) => p.id === id)
      if (!product) throwError('产品不存在', 404)

      return product
    },

    createProduct: async (data: Omit<Product, 'id' | 'createTime'>): Promise<Product> => {
      await delay(500)

      const newProduct: Product = {
        id: Math.max(...mockProducts.map((p) => p.id), 0) + 1,
        ...data,
        status: data.status || 'enabled',
        createTime: new Date().toISOString(),
      }

      mockProducts.push(newProduct)
      return newProduct
    },

    updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
      await delay(500)

      const index = mockProducts.findIndex((p) => p.id === id)
      if (index === -1) throwError('产品不存在', 404)

      const existingProduct = mockProducts[index]!
      mockProducts[index] = {
        ...existingProduct,
        ...data,
        status: data.status || existingProduct.status || 'enabled',
      }
      return mockProducts[index]
    },

    deleteProduct: async (id: number): Promise<ApiResponse<string>> => {
      await delay(500)

      const index = mockProducts.findIndex((p) => p.id === id)
      if (index === -1) throwError('产品不存在', 404)

      mockProducts.splice(index, 1)
      return { data: '删除成功' }
    },

    exportProducts: async (params: FilterOptions = {}): Promise<Blob> => {
      await delay(800)

      const filteredProducts = filterData(mockProducts, params)
      const content = JSON.stringify(filteredProducts)
      return new Blob([content], { type: 'application/json' })
    },
  },

  // 仓库相关
  warehouses: {
    getWarehouses: async (params: FilterOptions = {}): Promise<PaginationResponse<Warehouse>> => {
      await delay(500)

      const filteredWarehouses = filterData(mockWarehouses, params)
      const paginated = paginate(filteredWarehouses, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },

    getWarehouseById: async (id: number): Promise<Warehouse | undefined> => {
      await delay(300)

      const warehouse = mockWarehouses.find((w) => w.id === id)
      if (!warehouse) throwError('仓库不存在', 404)

      return warehouse
    },

    createWarehouse: async (
      data: Omit<Warehouse, 'id' | 'createTime' | 'lastInbound' | 'totalStock'>,
    ): Promise<Warehouse> => {
      await delay(500)

      const newWarehouse: Warehouse = {
        id: Math.max(...mockWarehouses.map((w) => w.id), 0) + 1,
        ...data,
        status: data.status || 'enabled',
        createTime: new Date().toISOString(),
        lastInbound: new Date().toISOString(),
        totalStock: 0,
      }

      mockWarehouses.push(newWarehouse)
      return newWarehouse
    },

    updateWarehouse: async (id: number, data: Partial<Warehouse>): Promise<Warehouse> => {
      await delay(500)

      const index = mockWarehouses.findIndex((w) => w.id === id)
      if (index === -1) throwError('仓库不存在', 404)

      const existingWarehouse = mockWarehouses[index]!
      mockWarehouses[index] = {
        ...existingWarehouse,
        ...data,
        status: data.status || existingWarehouse.status || 'enabled',
      }
      return mockWarehouses[index]
    },

    deleteWarehouse: async (id: number): Promise<ApiResponse<string>> => {
      await delay(500)

      const index = mockWarehouses.findIndex((w) => w.id === id)
      if (index === -1) throwError('仓库不存在', 404)

      mockWarehouses.splice(index, 1)
      return { data: '删除成功' }
    },

    exportWarehouses: async (params: FilterOptions = {}): Promise<Blob> => {
      await delay(800)

      const filteredWarehouses = filterData(mockWarehouses, params)
      // 模拟导出文件的Blob数据
      const content = JSON.stringify(filteredWarehouses)
      return new Blob([content], { type: 'application/json' })
    },
  },

  // 供应商相关
  suppliers: {
    getSuppliers: async (params: FilterOptions = {}): Promise<PaginationResponse<Supplier>> => {
      await delay(500)

      const filteredSuppliers = filterData(mockSuppliers, params)
      const paginated = paginate(filteredSuppliers, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },

    getSupplierById: async (id: number): Promise<Supplier | undefined> => {
      await delay(300)

      const supplier = mockSuppliers.find((s) => s.id === id)
      if (!supplier) throwError('供应商不存在', 404)

      return supplier
    },

    createSupplier: async (data: Omit<Supplier, 'id' | 'createTime'>): Promise<Supplier> => {
      await delay(500)

      const newSupplier: Supplier = {
        id: Math.max(...mockSuppliers.map((s) => s.id), 0) + 1,
        ...data,
        address: data.address || '',
        status: data.status || 'enabled',
        createTime: new Date().toISOString(),
      }

      mockSuppliers.push(newSupplier)
      return newSupplier
    },

    updateSupplier: async (id: number, data: Partial<Supplier>): Promise<Supplier> => {
      await delay(500)

      const index = mockSuppliers.findIndex((s) => s.id === id)
      if (index === -1) throwError('供应商不存在', 404)

      const existingSupplier = mockSuppliers[index]!
      mockSuppliers[index] = {
        ...existingSupplier,
        ...data,
        address: data.address || existingSupplier.address || '',
        status: data.status || existingSupplier.status || 'enabled',
      }
      return mockSuppliers[index]
    },

    deleteSupplier: async (id: number): Promise<ApiResponse<string>> => {
      await delay(500)

      const index = mockSuppliers.findIndex((s) => s.id === id)
      if (index === -1) throwError('供应商不存在', 404)

      mockSuppliers.splice(index, 1)
      return { data: '删除成功' }
    },

    exportSuppliers: async (params: FilterOptions = {}): Promise<Blob> => {
      await delay(800)

      const filteredSuppliers = filterData(mockSuppliers, params)
      const content = JSON.stringify(filteredSuppliers)
      return new Blob([content], { type: 'application/json' })
    },

    getSupplierProducts: async (
      supplierId: number,
      params: FilterOptions = {},
    ): Promise<PaginationResponse<SupplierProduct>> => {
      await delay(500)

      let filteredSupplierProducts = mockSupplierProducts.filter(
        (item) => item.supplierId === supplierId,
      )
      filteredSupplierProducts = filterData(filteredSupplierProducts, params)
      const paginated = paginate(filteredSupplierProducts, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },
  },

  // 订单相关
  orders: {
    getOrders: async (params: FilterOptions = {}): Promise<PaginationResponse<Order>> => {
      await delay(500)

      const filteredOrders = filterData(mockOrders, params)
      const paginated = paginate(filteredOrders, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },

    getOrderById: async (id: number): Promise<Order | undefined> => {
      await delay(300)

      const order = mockOrders.find((o) => o.id === id)
      if (!order) throwError('订单不存在', 404)

      return order
    },

    createOrder: async (data: Omit<Order, 'id' | 'createTime'>): Promise<Order> => {
      await delay(500)

      const newOrder: Order = {
        id: Math.max(...mockOrders.map((o) => o.id), 0) + 1,
        ...data,
        createTime: new Date().toISOString(),
      }

      mockOrders.push(newOrder)
      return newOrder
    },

    updateOrder: async (id: number, data: Partial<Order>): Promise<Order> => {
      await delay(500)

      const index = mockOrders.findIndex((o) => o.id === id)
      if (index === -1) throwError('订单不存在', 404)

      const existingOrder = mockOrders[index]!
      mockOrders[index] = {
        ...existingOrder,
        ...data,
        status: (data.status || existingOrder.status) as Order['status'],
      }
      return mockOrders[index]!
    },

    deleteOrder: async (id: number): Promise<ApiResponse<string>> => {
      await delay(500)

      const index = mockOrders.findIndex((o) => o.id === id)
      if (index === -1) throwError('订单不存在', 404)

      mockOrders.splice(index, 1)
      return { data: '删除成功' }
    },
  },

  // 营销相关
  marketing: {
    getActivities: async (
      params: FilterOptions = {},
    ): Promise<PaginationResponse<MarketingActivity>> => {
      await delay(500)

      const filteredActivities = filterData(mockMarketingActivities, params)
      const paginated = paginate(filteredActivities, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },

    getActivityById: async (id: number): Promise<MarketingActivity | undefined> => {
      await delay(300)

      const activity = mockMarketingActivities.find((a) => a.id === id)
      if (!activity) throwError('营销活动不存在', 404)

      return activity
    },

    createActivity: async (
      data: Omit<MarketingActivity, 'id' | 'createTime'>,
    ): Promise<MarketingActivity> => {
      await delay(500)

      const newActivity: MarketingActivity = {
        id: Math.max(...mockMarketingActivities.map((a) => a.id), 0) + 1,
        ...data,
        createTime: new Date().toISOString(),
      }

      mockMarketingActivities.push(newActivity)
      return newActivity
    },

    updateActivity: async (
      id: number,
      data: Partial<MarketingActivity>,
    ): Promise<MarketingActivity> => {
      await delay(500)

      const index = mockMarketingActivities.findIndex((a) => a.id === id)
      if (index === -1) throwError('营销活动不存在', 404)

      const existingActivity = mockMarketingActivities[index]!
      const updatedActivity: MarketingActivity = {
        ...existingActivity,
        ...data,
        type: (data.type || existingActivity.type) as MarketingActivity['type'],
        status: (data.status || existingActivity.status) as MarketingActivity['status'],
      }
      mockMarketingActivities[index] = updatedActivity
      return updatedActivity
    },

    deleteActivity: async (id: number): Promise<ApiResponse<string>> => {
      await delay(500)

      const index = mockMarketingActivities.findIndex((a) => a.id === id)
      if (index === -1) throwError('营销活动不存在', 404)

      mockMarketingActivities.splice(index, 1)
      return { data: '删除成功' }
    },

    updateActivityStatus: async (
      id: number,
      status: MarketingActivity['status'],
    ): Promise<MarketingActivity> => {
      await delay(300)

      const index = mockMarketingActivities.findIndex((a) => a.id === id)
      if (index === -1) throwError('营销活动不存在', 404)

      mockMarketingActivities[index]!.status = status
      return mockMarketingActivities[index]!
    },
  },

  // 内容管理相关
  content: {
    getArticles: async (
      params: FilterOptions = {},
    ): Promise<PaginationResponse<ContentArticle>> => {
      await delay(500)

      const filteredArticles = filterData(mockContentArticles, params)
      const paginated = paginate(filteredArticles, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },

    getArticleById: async (id: number): Promise<ContentArticle | undefined> => {
      await delay(300)

      const article = mockContentArticles.find((a) => a.id === id)
      if (!article) throwError('文章不存在', 404)

      return article
    },

    createArticle: async (
      data: Omit<ContentArticle, 'id' | 'createTime'>,
    ): Promise<ContentArticle> => {
      await delay(500)

      const newArticle: ContentArticle = {
        id: Math.max(...mockContentArticles.map((a) => a.id), 0) + 1,
        ...data,
        createTime: new Date().toISOString(),
      }

      mockContentArticles.push(newArticle)
      return newArticle
    },

    updateArticle: async (id: number, data: Partial<ContentArticle>): Promise<ContentArticle> => {
      await delay(500)

      const index = mockContentArticles.findIndex((a) => a.id === id)
      if (index === -1) throwError('文章不存在', 404)

      const existingArticle = mockContentArticles[index]!
      const updatedArticle: ContentArticle = {
        ...existingArticle,
        ...data,
        category: (data.category || existingArticle.category) as ContentArticle['category'],
        status: (data.status || existingArticle.status) as ContentArticle['status'],
      }
      mockContentArticles[index] = updatedArticle
      return updatedArticle
    },

    deleteArticle: async (id: number): Promise<ApiResponse<string>> => {
      await delay(500)

      const index = mockContentArticles.findIndex((a) => a.id === id)
      if (index === -1) throwError('文章不存在', 404)

      mockContentArticles.splice(index, 1)
      return { data: '删除成功' }
    },

    updateArticleStatus: async (
      id: number,
      status: ContentArticle['status'],
    ): Promise<ContentArticle> => {
      await delay(300)

      const index = mockContentArticles.findIndex((a) => a.id === id)
      if (index === -1) throwError('文章不存在', 404)

      mockContentArticles[index]!.status = status
      return mockContentArticles[index]!
    },
  },

  // 权限管理相关
  permissions: {
    getRoles: async (params: FilterOptions = {}): Promise<PaginationResponse<Role>> => {
      await delay(500)

      const filteredRoles = filterData(mockRoles, params)
      const paginated = paginate(filteredRoles, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },

    getRoleById: async (id: number): Promise<Role | undefined> => {
      await delay(300)

      const role = mockRoles.find((r) => r.id === id)
      if (!role) throwError('角色不存在', 404)

      return role
    },

    createRole: async (data: Omit<Role, 'id' | 'createTime'>): Promise<Role> => {
      await delay(500)

      const newRole: Role = {
        id: Math.max(...mockRoles.map((r) => r.id), 0) + 1,
        ...data,
        status: data.status || 'enabled',
        createTime: new Date().toISOString(),
      }

      mockRoles.push(newRole)
      return newRole
    },

    updateRole: async (id: number, data: Partial<Role>): Promise<Role> => {
      await delay(500)

      const index = mockRoles.findIndex((r) => r.id === id)
      if (index === -1) throwError('角色不存在', 404)

      const existingRole = mockRoles[index]!
      mockRoles[index] = {
        ...existingRole,
        ...data,
        status: data.status || existingRole.status || 'enabled',
      }
      return mockRoles[index]!
    },

    deleteRole: async (id: number): Promise<ApiResponse<string>> => {
      await delay(500)

      const index = mockRoles.findIndex((r) => r.id === id)
      if (index === -1) throwError('角色不存在', 404)

      mockRoles.splice(index, 1)
      return { data: '删除成功' }
    },

    exportRoles: async (params: FilterOptions = {}): Promise<Blob> => {
      await delay(800)

      const filteredRoles = filterData(mockRoles, params)
      const content = JSON.stringify(filteredRoles)
      return new Blob([content], { type: 'application/json' })
    },

    assignPermissions: async (
      _roleId: number,
      _permissionIds: number[],
    ): Promise<ApiResponse<string>> => {
      await delay(500)

      // 模拟分配权限的操作
      return { data: '权限分配成功' }
    },

    // 管理员相关
    getAdmins: async (params: FilterOptions = {}): Promise<PaginationResponse<User>> => {
      await delay(500)

      const filteredUsers = filterData(mockUsers, params)
      const paginated = paginate(filteredUsers, params.page || 1, params.pageSize || 10)

      return {
        data: paginated.data,
        total: paginated.total,
      }
    },

    getAdminById: async (id: number): Promise<User | undefined> => {
      await delay(300)

      const user = mockUsers.find((u) => u.id === id)
      if (!user) throwError('管理员不存在', 404)

      return user
    },

    createAdmin: async (data: Omit<User, 'id' | 'createTime'>): Promise<User> => {
      await delay(500)

      const newAdmin: User = {
        id: Math.max(...mockUsers.map((u) => u.id), 0) + 1,
        username: data.username,
        email: data.email,
        status: data.status || 'enabled',
        createTime: new Date().toISOString(),
      }

      mockUsers.push(newAdmin)
      return newAdmin
    },

    updateAdmin: async (id: number, data: Partial<User>): Promise<User> => {
      await delay(500)

      const index = mockUsers.findIndex((u) => u.id === id)
      if (index === -1) throwError('管理员不存在', 404)

      const existingUser = mockUsers[index]!
      mockUsers[index] = {
        ...existingUser,
        ...data,
        id: data.id !== undefined ? data.id : existingUser.id,
      }
      return mockUsers[index]!
    },

    deleteAdmin: async (id: number): Promise<ApiResponse<string>> => {
      await delay(500)

      const index = mockUsers.findIndex((u) => u.id === id)
      if (index === -1) throwError('管理员不存在', 404)

      mockUsers.splice(index, 1)
      return { data: '删除成功' }
    },

    exportAdmins: async (params: FilterOptions = {}): Promise<Blob> => {
      await delay(800)

      const filteredUsers = filterData(mockUsers, params)
      const content = JSON.stringify(filteredUsers)
      return new Blob([content], { type: 'application/json' })
    },
  },
}
