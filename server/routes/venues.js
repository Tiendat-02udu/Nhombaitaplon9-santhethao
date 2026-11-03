import { Router } from 'express'
import mongoose from 'mongoose'
import Booking from '../models/Booking.js'
import Venue from '../models/Venue.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { isValidDateKey } from '../utils/date.js'

const router = Router()
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

router.get('/', async (req, res, next) => {
  try {
    const { sport, area, search } = req.query
    const filter = { isActive: true }
    if (sport) filter.sport = sport
    if (area) filter.area = area
    const query = typeof search === 'string' ? escapeRegex(search) : ''
    if (query) filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { address: { $regex: query, $options: 'i' } },
      { area: { $regex: query, $options: 'i' } },
    ]
    const venues = await Venue.find(filter).sort({ createdAt: -1 }).limit(100)
    res.status(200).json({ data: venues })
  } catch (error) {
    next(error)
  }
})

router.get('/:id/availability', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Không tìm thấy sân.' })
    const { date } = req.query
    if (!isValidDateKey(date)) {
      return res.status(400).json({ error: 'Ngày phải theo định dạng YYYY-MM-DD.' })
    }
    const venue = await Venue.findOne({ _id: req.params.id, isActive: true })
    if (!venue) return res.status(404).json({ error: 'Không tìm thấy sân.' })
    const bookings = await Booking.find({ venue: venue.id, date, status: 'confirmed' }).select('time durationHours')
    res.status(200).json({ date, booked: bookings.map((booking) => ({ time: booking.time, durationHours: booking.durationHours })) })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Không tìm thấy sân.' })
    const venue = await Venue.findOne({ _id: req.params.id, isActive: true })
    if (!venue) return res.status(404).json({ error: 'Không tìm thấy sân.' })
    res.status(200).json({ data: venue })
  } catch (error) {
    next(error)
  }
})

router.post('/', authenticate, requireRole('owner'), async (req, res, next) => {
  try {
    const venue = await Venue.create({ ...req.body, owner: req.user.id })
    res.status(201).json({ data: venue })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', authenticate, requireRole('owner'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Không tìm thấy sân.' })
    const allowedFields = ['name', 'sport', 'address', 'area', 'description', 'pricePerHour', 'imageUrl', 'courtCount', 'openingTime', 'closingTime', 'isActive']
    const updates = Object.fromEntries(Object.entries(req.body ?? {}).filter(([key]) => allowedFields.includes(key)))
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'Không có trường hợp lệ để cập nhật.' })
    const venue = await Venue.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true },
    )
    if (!venue) return res.status(404).json({ error: 'Không tìm thấy sân thuộc tài khoản của bạn.' })
    res.status(200).json({ data: venue })
  } catch (error) {
    next(error)
  }
})

export default router
