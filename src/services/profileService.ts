import { apiClient, useMock } from './apiClient'

// Personal profile interface
interface UserProfile {
  id: number
  username: string
  email: string
  phone?: string
  nickname?: string
  gender?: string
  birthday?: string
  bio?: string
  location?: string[]
  website?: string
  avatar?: string
  role: string
  status: string
  createTime: string
}

// Password change interface
interface PasswordChange {
  currentPassword: string
  newPassword: string
}

// User settings interface
interface UserSettings {
  theme: string
  autoCollapseSidebar: boolean
  sidebarColor: string
  fontSize: number
  fontFamily: string
  desktopNotifications: boolean
  soundNotifications: boolean
  emailSystemUpdates: boolean
  emailSecurityAlerts: boolean
  emailMarketing: boolean
  doNotDisturbStart?: string
  doNotDisturbEnd?: string
  showOnlineStatus: boolean
  showLastActive: boolean
  allowSearch: boolean
  usageStatistics: boolean
  errorReporting: boolean
  googleAnalytics: boolean
  twoFactorAuth: boolean
  loginNotifications: boolean
  sessionTimeout: number
  language: string
  timezone: string
  dateFormat: string
  pageSize: number
  autoSave: boolean
}

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  if (useMock) {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          phone: '13800138000',
          nickname: 'Administrator',
          gender: 'male',
          birthday: '1990-01-01',
          bio: 'This is a system administrator account.',
          location: ['beijing', 'chaoyang'],
          website: 'https://example.com',
          avatar: '',
          role: 'admin',
          status: 'enabled',
          createTime: '2023-01-01T08:00:00Z',
        })
      }, 300)
    })
  }
  return apiClient.get('/profile')
}

// Update user profile
export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile> => {
  if (useMock) {
    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (profile.email && !profile.email.includes('@')) {
          reject(new Error('Invalid email format'))
          return
        }
        resolve({
          id: 1,
          username: profile.username || 'admin',
          email: profile.email || 'admin@example.com',
          phone: profile.phone,
          nickname: profile.nickname,
          gender: profile.gender,
          birthday: profile.birthday,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          avatar: profile.avatar,
          role: 'admin',
          status: 'enabled',
          createTime: '2023-01-01T08:00:00Z',
        })
      }, 500)
    })
  }
  return apiClient.put('/profile', profile)
}

// Change user password
export const changeUserPassword = async (
  passwordData: PasswordChange,
): Promise<{ message: string }> => {
  if (useMock) {
    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (passwordData.currentPassword !== '123456') {
          reject(new Error('Current password is incorrect'))
          return
        }
        if (passwordData.newPassword.length < 6) {
          reject(new Error('New password must be at least 6 characters'))
          return
        }
        resolve({ message: 'Password changed successfully' })
      }, 500)
    })
  }
  return apiClient.post('/profile/password', passwordData)
}

// Get user settings
export const getUserSettings = async (): Promise<UserSettings> => {
  if (useMock) {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          theme: 'light',
          autoCollapseSidebar: false,
          sidebarColor: '#304156',
          fontSize: 14,
          fontFamily: 'system',
          desktopNotifications: true,
          soundNotifications: true,
          emailSystemUpdates: true,
          emailSecurityAlerts: true,
          emailMarketing: false,
          showOnlineStatus: true,
          showLastActive: false,
          allowSearch: true,
          usageStatistics: true,
          errorReporting: true,
          googleAnalytics: false,
          twoFactorAuth: false,
          loginNotifications: true,
          sessionTimeout: 120,
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          dateFormat: 'YYYY-MM-DD',
          pageSize: 20,
          autoSave: true,
        })
      }, 300)
    })
  }
  return apiClient.get('/profile/settings')
}

// Update user settings
export const updateUserSettings = async (
  settings: Partial<UserSettings>,
): Promise<UserSettings> => {
  if (useMock) {
    return await new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful update, return merged settings
        const currentSettings = {
          theme: 'light',
          autoCollapseSidebar: false,
          sidebarColor: '#304156',
          fontSize: 14,
          fontFamily: 'system',
          desktopNotifications: true,
          soundNotifications: true,
          emailSystemUpdates: true,
          emailSecurityAlerts: true,
          emailMarketing: false,
          showOnlineStatus: true,
          showLastActive: false,
          allowSearch: true,
          usageStatistics: true,
          errorReporting: true,
          googleAnalytics: false,
          twoFactorAuth: false,
          loginNotifications: true,
          sessionTimeout: 120,
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          dateFormat: 'YYYY-MM-DD',
          pageSize: 20,
          autoSave: true,
        }
        resolve({ ...currentSettings, ...settings })
      }, 300)
    })
  }
  return apiClient.put('/profile/settings', settings)
}

// Upload avatar
export const uploadAvatar = async (file: File): Promise<{ url: string }> => {
  if (useMock) {
    return await new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful upload, return avatar URL
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            url: e.target?.result as string,
          })
        }
        reader.readAsDataURL(file)
      }, 1000)
    })
  }

  const formData = new FormData()
  formData.append('avatar', file)
  return apiClient.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// Export user data
export const exportUserData = async (): Promise<Blob> => {
  if (useMock) {
    return await new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          profile: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            phone: '13800138000',
            nickname: 'Administrator',
            gender: 'male',
            birthday: '1990-01-01',
            bio: 'This is a system administrator account',
            location: ['beijing', 'chaoyang'],
            website: 'https://example.com',
            role: 'admin',
            status: 'enabled',
            createTime: '2023-01-01T08:00:00Z',
          },
          settings: {
            theme: 'light',
            language: 'zh-CN',
            timezone: 'Asia/Shanghai',
            dateFormat: 'YYYY-MM-DD',
            pageSize: 20,
            autoSave: true,
          },
          exportTime: new Date().toISOString(),
          exportVersion: '1.0',
        }
        const content = JSON.stringify(userData, null, 2)
        resolve(new Blob([content], { type: 'application/json' }))
      }, 1500)
    })
  }
  return apiClient.get('/profile/export', { responseType: 'blob' })
}

// Delete user account
export const deleteUserAccount = async (data: {
  password: string
}): Promise<{ message: string }> => {
  if (useMock) {
    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.password !== '123456') {
          reject(new Error('Password is incorrect'))
          return
        }
        resolve({ message: 'Account deleted successfully' })
      }, 1000)
    })
  }
  return apiClient.delete('/profile/account', { data })
}

// Get recent activity records
export const getUserActivity = async () => {
  if (useMock) {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            type: 'login',
            description: 'Login to system',
            time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            ip: '192.168.1.100',
            location: 'Beijing, China',
          },
          {
            id: 2,
            type: 'edit',
            description: 'Edit profile',
            time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            ip: '192.168.1.100',
            location: 'Beijing, China',
          },
          {
            id: 3,
            type: 'password',
            description: 'Change password',
            time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            ip: '192.168.1.100',
            location: 'Beijing, China',
          },
          {
            id: 4,
            type: 'settings',
            description: 'Update system settings',
            time: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
            ip: '192.168.1.100',
            location: 'Beijing, China',
          },
        ])
      }, 300)
    })
  }
  return apiClient.get('/profile/activity')
}

// Validate password strength
export const validatePasswordStrength = (
  password: string,
): {
  score: number
  level: 'weak' | 'medium' | 'strong'
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  // Check length
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password should be at least 8 characters long')
  }

  // Check lowercase letters
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Should contain lowercase letters')
  }

  // Check uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Should contain uppercase letters')
  }

  // Check numbers
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Should contain numbers')
  }

  // Check special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push('Should contain special characters')
  }

  // Determine strength level
  let level: 'weak' | 'medium' | 'strong'
  if (score < 3) {
    level = 'weak'
  } else if (score < 5) {
    level = 'medium'
  } else {
    level = 'strong'
  }

  return { score, level, feedback }
}

// Export user info function (reuse existing getUserInfo)
export { getUserInfo } from './authService'