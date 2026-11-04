import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  date: { type: String, required: true },
  startMinute: { type: Number, required: true },
  endMinute: { type: Number, required: true },
}, { _id: false })

const venueSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  sport: { type: String, required: true, enum: ['Bóng đá', 'Pickleball', 'Tennis', 'Cầu lông'] },
  address: { type: String, required: true, trim: true, maxlength: 240 },
  area: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  pricePerHour: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, trim: true, default: '' },
  courtCount: { type: Number, min: 1, default: 1 },
  openingTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/, default: '06:00' },
  closingTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/, default: '23:00' },
  isActive: { type: Boolean, default: true },
  reservations: { type: [reservationSchema], default: [] },
}, { timestamps: true })

export default mongoose.model('Venue', venueSchema)
