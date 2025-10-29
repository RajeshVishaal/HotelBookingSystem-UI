import type { BookingDetails } from '../types/checkout';

export const dummyBookingDetails: BookingDetails = {
  hotelInfo: {
    hotelId: 'hotel123',
    hotelName: 'Smart Stays Suites in Sloane Square',
    location: 'Sloane Square 31, London SW3 3BS, United Kingdom',
    rating: 4.5,
    totalReviews: 39,
    image: 'https://via.placeholder.com/400x300?text=Hotel+Image'
  },
  bookingDates: {
    checkIn: {
      date: 'Sun 26 Oct 2025',
      time: '15:00'
    },
    checkOut: {
      date: 'Tue 28 Oct 2025',
      time: '11:00'
    }
  },
  roomInfo: {
    roomType: 'Deluxe Double Room',
    guests: '2 adults',
    price: 199.99
  }
};