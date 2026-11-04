import { Router } from 'express'
import mongoose from 'mongoose'
import Booking from '../models/Booking.js'
import Venue from '../models/Venue.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { currentDateKey, isValidDateKey } from '../utils/date.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'owner'
      ? { venue: { $in: (await Venue.find({ owner: req.user.id }).distinct('_id')) } }
      : { customer: req.user.id }
    if (req.query.status && ['confirmed', 'cancelled'].includes(req.query.status)) filter.status = req.query.status
    const bookings = await Booking.find(filter).populate('venue').populate('customer', 'name email').sort({ date: 1, time: 1 })
    res.status(200).json({ data: bookings })
  } catch (error) {
    next(error)
  }
})

router.post('/', requireRole('player'), async (req, res, next) => {
  try {
    const { venueId, date, time, durationHours = 1 } = req.body
    if (!mongoose.isValidObjectId(venueId)) return res.status(400).json({ error: 'Mã sân không hợp lệ.' })
    if (!isValidDateKey(date)) return res.status(400).json({ error: 'Ngày đặt không hợp lệ.' })
    if (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return res.status(400).json({ error: 'Khung giờ không hợp lệ.' })
    if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 4) return res.status(400).json({ error: 'Thời lượng phải từ 1 đến 4 giờ.' })
    if (date < currentDateKey()) return res.status(400).json({ error: 'Không thể đặt sân vào ngày đã qua.' })
    const venue = await Venue.findOne({ _id: venueId, isActive: true })
    if (!venue) return res.status(404).json({ error: 'Sân không tồn tại hoặc đã ngừng hoạt động.' })
    const requestedStart = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
    const requestedEnd = requestedStart + durationHours * 60
    const opening = Number(venue.openingTime.slice(0, 2)) * 60 + Number(venue.openingTime.slice(3, 5))
    const closing = Number(venue.closingTime.slice(0, 2)) * 60 + Number(venue.closingTime.slice(3, 5))
    if (requestedStart < opening || requestedEnd > closing) {
      return res.status(400).json({ error: 'Khung giờ nằm ngoài giờ hoạt động của sân.' })
    }

    // Also check old booking records, which may predate the atomic reservation guard.
    const dayBookings = await Booking.find({ venue: venue.id, date, status: 'confirmed' }).select('time durationHours')
    const hasOverlap = dayBookings.some((existing) => {
      const existingStart = Number(existing.time.slice(0, 2)) * 60 + Number(existing.time.slice(3, 5))
      return requestedStart < existingStart + existing.durationHours * 60
        && requestedEnd > existingStart
    })
    if (hasOverlap) return res.status(409).json({ error: 'Khung giờ này vừa được đặt. Vui lòng chọn giờ khác.' })

    // Updating the venue document atomically prevents simultaneous requests from
    // reserving overlapping intervals, including intervals with different start times.
    const booking = new Booking({
      venue: venue.id,
      customer: req.user.id,
      date,
      time,
      durationHours,
      price: venue.pricePerHour * durationHours,
    })
    const reservation = await Venue.findOneAndUpdate(
      {
        _id: venue.id,
        isActive: true,
        reservations: {
          $not: {
            $elemMatch: {
              date,
              startMinute: { $lt: requestedEnd },
              endMinute: { $gt: requestedStart },
            },
          },
        },
      },
      {
        $push: {
          reservations: {
            booking: booking._id,
            date,
            startMinute: requestedStart,
            endMinute: requestedEnd,
          },
        },
      },
      { new: true, projection: { _id: 1 } },
    )
    if (!reservation) return res.status(409).json({ error: 'Khung giờ này vừa được đặt. Vui lòng chọn giờ khác.' })

    try {
      await booking.save()
    } catch (error) {
      await Venue.updateOne({ _id: venue.id }, { $pull: { reservations: { booking: booking._id } } })
      throw error
    }

    await booking.populate('venue')
    res.status(201).json({ data: booking })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/cancel', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Không tìm thấy lịch đặt.' })
    const booking = await Booking.findById(req.params.id).populate('venue')
    if (!booking) return res.status(404).json({ error: 'Không tìm thấy lịch đặt.' })
    const isCustomer = booking.customer.toString() === req.user.id
    const isVenueOwner = booking.venue.owner.toString() === req.user.id && req.user.role === 'owner'
    if (!isCustomer && !isVenueOwner) return res.status(403).json({ error: 'Bạn không có quyền hủy lịch này.' })
    if (booking.status === 'cancelled') return res.status(409).json({ error: 'Lịch đặt này đã được hủy.' })
    booking.status = 'cancelled'
    booking.cancelledAt = new Date()
    await booking.save()
    await Venue.updateOne({ _id: booking.venue._id }, { $pull: { reservations: { booking: booking._id } } })
    res.status(200).json({ data: booking })
  } catch (error) {
    next(error)
  }
})

export default router
