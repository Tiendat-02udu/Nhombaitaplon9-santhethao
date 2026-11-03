import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role })
const issueToken = (user) => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'player' } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Vui lòng nhập tên, email và mật khẩu.' })
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự.' })
    if (!['player', 'owner'].includes(role)) return res.status(400).json({ error: 'Vai trò không hợp lệ.' })
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, role })
    res.status(201).json({ user: publicUser(user), token: issueToken(user) })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' })
    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash')
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' })
    }
    res.status(200).json({ user: publicUser(user), token: issueToken(user) })
  } catch (error) {
    next(error)
  }
})

export default router
