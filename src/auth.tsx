import { useState, type ReactNode } from 'react'
import { AuthContext, type AuthUser, type UserRole } from './auth-context'
import { apiRequest } from './api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem('sango-user')
      return saved ? JSON.parse(saved) as AuthUser : { name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', role: 'player' }
    } catch (error) {
      console.error('Không thể đọc thông tin người dùng đã lưu.', error)
      return { name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', role: 'player' }
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sango-token'))
  const login = async (email: string, password: string) => {
    const result = await apiRequest<{ user: AuthUser; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setUser(result.user)
    setToken(result.token)
    localStorage.setItem('sango-user', JSON.stringify(result.user))
    localStorage.setItem('sango-token', result.token)
    return result.user
  }
  const loginDemo = (email: string, role: UserRole) => {
    const nextUser = { name: role === 'owner' ? 'Lê Hoàng Nam' : 'Nguyễn Minh Anh', email, role }
    setUser(nextUser)
    setToken(null)
    localStorage.setItem('sango-user', JSON.stringify(nextUser))
    localStorage.removeItem('sango-token')
  }
  const logout = () => {
    const guest = { name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', role: 'player' as const }
    setUser(guest)
    setToken(null)
    localStorage.removeItem('sango-user')
    localStorage.removeItem('sango-token')
  }
  return <AuthContext.Provider value={{ user, token, login, loginDemo, logout }}>{children}</AuthContext.Provider>
}
