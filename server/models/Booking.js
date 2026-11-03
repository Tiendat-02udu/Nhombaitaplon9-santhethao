import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  durationHours: { type: Number, min: 1, max: 4, default: 1 },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed', required: true },
  cancelledAt: { type: Date, default: null },
}, { timestamps: true })

bookingSchema.index(
  { venue: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } },
)

export default mongoose.model('Booking', bookingSchema)
