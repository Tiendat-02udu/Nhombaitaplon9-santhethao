import type { Booking } from './store'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function apiRequest<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.token) headers.Authorization = `Bearer ${options.token}`
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const responseBody = await response.text()
  let payload: unknown = {}
  if (responseBody) {
    try {
      payload = JSON.parse(responseBody) as unknown
    } catch {
      if (response.ok) throw new Error('Máy chủ trả về dữ liệu không đúng định dạng JSON.')
    }
  }
  if (!response.ok) {
    const apiError = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : `Yêu cầu thất bại (${response.status}).`
    throw new Error(apiError)
  }
  return payload as T
}

export type ApiVenue = {
  _id: string
  name: string
  sport: string
  area: string
  address: string
  pricePerHour: number
  imageUrl?: string
  courtCount?: number
  description?: string
}

export type VenueView = {
  id: string
  name: string
  type: string
  area: string
  address: string
  price: number
  rating: number
  reviews: number
  image: string
  tag: string
  openSlots: number
  courts: number
  description: string
}

export function toVenueView(venue: ApiVenue): VenueView {
  return {
    id: venue._id,
    name: venue.name,
    type: venue.sport,
    area: venue.area,
    address: venue.address,
    price: venue.pricePerHour,
    rating: 4.8,
    reviews: 0,
    image: venue.imageUrl || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=85',
    tag: 'Sân chất lượng',
    openSlots: 0,
    courts: venue.courtCount ?? 1,
    description: venue.description ?? '',
  }
}

type ApiBooking = {
  _id: string
  date: string
  time: string
  durationHours?: number
  price: number
  status: Booking['status']
  venue: ApiVenue | null
  customer?: { name?: string } | null
}

export function toBookingView(booking: ApiBooking): Booking {
  const venue = booking.venue
  return {
    id: booking._id,
    venueId: venue?._id ?? '',
    venueName: venue?.name ?? 'Sân đã ngừng hoạt động',
    venueImage: venue?.imageUrl ?? '',
    area: venue?.area ?? '',
    date: booking.date,
    time: booking.time,
    durationHours: booking.durationHours ?? 1,
    price: booking.price,
    status: booking.status,
    sport: venue?.sport ?? '',
    customerName: booking.customer?.name,
  }
}
