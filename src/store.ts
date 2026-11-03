import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Booking = {
  id: string
  venueId: string
  venueName: string
  venueImage: string
  area: string
  date: string
  time: string
  durationHours?: number
  price: number
  status: 'confirmed' | 'cancelled'
  sport: string
}

type BookingStore = {
  bookings: Booking[]
  favorites: string[]
  addBooking: (booking: Booking) => void
  replaceBookings: (bookings: Booking[]) => void
  cancelBooking: (id: string) => void
  toggleFavorite: (venueId: string) => void
}

const dateInDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const useBookingStore = create<BookingStore>()(persist((set) => ({
  bookings: [
    { id: 'demo-1', venueId: '1', venueName: 'Sân bóng Thành Công', venueImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=85', area: 'Đống Đa', date: dateInDays(2), time: '18:00', price: 350000, status: 'confirmed', sport: 'Bóng đá' },
    { id: 'demo-2', venueId: '2', venueName: 'Pickleball The Yard', venueImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85', area: 'Cầu Giấy', date: dateInDays(4), time: '19:30', price: 180000, status: 'confirmed', sport: 'Pickleball' },
  ],
  favorites: ['1', '3'],
  addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
  replaceBookings: (bookings) => set({ bookings }),
  cancelBooking: (id) => set((state) => ({ bookings: state.bookings.map((booking) => booking.id === id ? { ...booking, status: 'cancelled' } : booking) })),
  toggleFavorite: (venueId) => set((state) => ({ favorites: state.favorites.includes(venueId) ? state.favorites.filter((id) => id !== venueId) : [...state.favorites, venueId] })),
}), { name: 'sango-booking-state' }))
