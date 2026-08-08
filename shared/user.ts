export type UserRole = 'superadmin' | 'admin'

export interface AdminUser {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: number
  lastLoginAt: number | null
}

export function isSuperAdminRole(role: UserRole | string | undefined | null) {
  return role === 'superadmin'
}
