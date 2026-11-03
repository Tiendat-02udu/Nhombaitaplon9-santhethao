import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function authenticate(req, _res, next) {
  try {
    const header = req.get('authorization')
    if (!header?.startsWith('Bearer ')) {
      const error = new Error('Vui lòng đăng nhập để tiếp tục.')
      error.status = 401
      throw error
    }
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) {
      const error = new Error('Tài khoản không còn tồn tại.')
      error.status = 401
      throw error
    }
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') error.status = 401
    next(error)
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error('Bạn không có quyền thực hiện thao tác này.')
      error.status = 403
      return next(error)
    }
    next()
  }
}
