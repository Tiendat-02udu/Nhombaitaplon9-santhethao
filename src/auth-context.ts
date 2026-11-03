import { createContext, useContext } from 'react'

export type UserRole = 'player' | 'owner'
export type AuthUser = { name: string; email: string; role: UserRole }
export type AuthContextValue = {
  user: AuthUser
  token: string | null
  login: (email: string, password: string) => Promise<AuthUser>
  loginDemo: (email: string, role: UserRole) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được sử dụng bên trong AuthProvider.')
  return context
}
