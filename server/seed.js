import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from './models/User.js'
import Venue from './models/Venue.js'

if (!process.env.MONGODB_URI) throw new Error('Thiếu MONGODB_URI trong file .env.')

await mongoose.connect(process.env.MONGODB_URI)
try {
  const playerHash = await bcrypt.hash('demo12345', 12)
  const ownerHash = await bcrypt.hash('demo12345', 12)
  const player = await User.findOneAndUpdate(
    { email: 'player@sango.vn' },
    { $set: { name: 'Nguyễn Minh Anh', passwordHash: playerHash, role: 'player' } },
    { new: true, upsert: true, runValidators: true },
  )
  const owner = await User.findOneAndUpdate(
    { email: 'owner@sango.vn' },
    { $set: { name: 'Lê Hoàng Nam', passwordHash: ownerHash, role: 'owner' } },
    { new: true, upsert: true, runValidators: true },
  )
  const samples = [
    { name: 'Sân bóng Thành Công', sport: 'Bóng đá', area: 'Đống Đa', address: '12 Nguyễn Lương Bằng, Đống Đa, Hà Nội', pricePerHour: 350000, courtCount: 5, imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=85', description: 'Cụm sân cỏ nhân tạo tiêu chuẩn, mặt sân êm và hệ thống chiếu sáng hiện đại.' },
    { name: 'Pickleball The Yard', sport: 'Pickleball', area: 'Cầu Giấy', address: '86 Trần Thái Tông, Cầu Giấy, Hà Nội', pricePerHour: 180000, courtCount: 4, imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85', description: 'Không gian pickleball trong nhà thoáng mát, trang bị đầy đủ vợt và bóng.' },
    { name: 'Tennis Green Park', sport: 'Tennis', area: 'Tây Hồ', address: 'Khu đô thị Ciputra, Tây Hồ, Hà Nội', pricePerHour: 260000, courtCount: 3, imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=85', description: 'Sân tennis ngoài trời giữa khuôn viên xanh, mặt sân chuẩn thi đấu.' },
    { name: 'Cầu lông Smash Zone', sport: 'Cầu lông', area: 'Hai Bà Trưng', address: '25 Minh Khai, Hai Bà Trưng, Hà Nội', pricePerHour: 90000, courtCount: 8, imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85', description: 'Nhà thi đấu cầu lông có điều hòa, sàn gỗ chống trượt và không gian thân thiện.' },
  ]
  for (const sample of samples) {
    await Venue.findOneAndUpdate(
      { owner: owner.id, name: sample.name },
      { $set: { ...sample, owner: owner.id, isActive: true } },
      { upsert: true, runValidators: true },
    )
  }
  console.log(`Đã tạo dữ liệu mẫu: ${player.email} (người chơi), ${owner.email} (chủ sân). Mật khẩu: demo12345`)
} finally {
  await mongoose.disconnect()
}
