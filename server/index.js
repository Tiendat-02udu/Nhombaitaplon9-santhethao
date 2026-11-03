import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import bookingRoutes from './routes/bookings.js'
import venueRoutes from './routes/venues.js'
import { errorHandler, notFound } from './middleware/errors.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/bookings', bookingRoutes)
app.use(notFound)
app.use(errorHandler)

const port = Number(process.env.PORT ?? 5000)
if (!process.env.MONGODB_URI) throw new Error('Thiếu MONGODB_URI trong file .env.')
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET phải có ít nhất 32 ký tự trong file .env.')
}

await mongoose.connect(process.env.MONGODB_URI)
app.listen(port, () => console.log(`Sango API đang chạy tại http://localhost:${port}`))
