export type UserRole = 'admin'

export interface AdminUser {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: number
  lastLoginAt: number | null
}
