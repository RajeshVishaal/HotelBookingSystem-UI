
export interface Bed {
  bedTypeName: string;
  bedCount: number;
}

export interface Availability {
  date: string;
  availableCount: number;
}

export interface RoomCategory {
  roomCategoryId: string;
  roomTypeName: string;
  maximumGuests: number;
  baseRate: number;
  info: string;
}

export interface Room extends RoomCategory {
  images: string[];
  facilities: string[];
  beds: Bed[];
  availability: Availability[];
}

export interface Review {
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
}

export interface Hotel {
  hotelId: string;
  name: string;
  hotelName?: string;
  city: string;
  country: string;
  addressLine: string;
  summary: string | null;
  imageUrl: string;
  averageRating: number;
  totalReviews: number;
  comment: string;
  roomCategories: RoomCategory[];
}

export interface HotelDetails extends Omit<Hotel, 'roomCategories'> {
  facilities: string[];
  rooms: Room[];
  reviews: Review[];
}

export interface ApiResponse {
  data: Hotel[];
}

export interface HotelDetailsResponse {
  success: boolean;
  message: string;
  data: HotelDetails;
}

export interface SearchParams {
  query: string;
  from: string;
  to: string;
  adults: number;
  children: number;
}

export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://a4f0-2a09-bac5-d45a-1838-00-1b4-1af.ngrok-free.app/api/v1'
  : '/api/v1';

export const generateIdempotencyKey = (): string => {
  return `booking-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export interface LoginCredentials {
  emailAddress: string;
  password: string;
}


export interface SignupCredentials {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message?: string;
  userId?: string;
}

export interface RoomReservation {
  roomCategoryId: string;
  quantity: number;
}

export interface BookingReservationRequest {
  hotelId: string;
  userId: string;
  rooms: RoomReservation[];
  guests: number;
  checkIn: string;
  checkOut: string;
}

export interface BookingReservationResponse {
  success: boolean;
  message?: string;
  bookingId?: string;
  data?: any;
}

export const signup = async (credentials: SignupCredentials): Promise<SignupResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log('Signup response:', data);
    
    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Registration successful!',
        userId: data.data?.userId || data.userId || data.id,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Registration failed. Please try again.',
      };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'An error occurred during registration. Please try again.',
    };
  }
};

export const reserveBooking = async (
  bookingData: BookingReservationRequest, 
  idempotencyKey: string
): Promise<BookingReservationResponse> => {
  console.log('Calling reserveBooking API with:', {
    bookingData,
    idempotencyKey,
    url: `${API_BASE_URL}/bookings/reserve`
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(bookingData),
      mode: 'cors',
      credentials: 'omit'
    });

    const data = await response.json();
    console.log('Booking API response:', data);
    
    if (response.ok) {
      return {
        success: true,
        message: 'Booking successful!',
        bookingId: data.data?.bookingReference || data.bookingId || data.id,
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Booking failed. Please try again.',
      };
    }
  } catch (error) {
    console.error('Booking error:', error);
    return {
      success: false,
      message: 'An error occurred during booking. Please try again.',
    };
  }
};

export const getHotelById = async (
  hotelId: string,
  checkIn: string,
  checkOut: string,
  guests: string
): Promise<HotelDetailsResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/hotels/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        credentials: 'omit'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as HotelDetailsResponse;
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    throw error;
  }
};

export interface SearchResponse {
  success: boolean;
  message: string;
  data: {
    items: Hotel[];
    totalRecords: number;
    pageNo: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const searchHotels = async (params: SearchParams, pageNo: number = 1, pageSize: number = 10): Promise<SearchResponse> => {
  console.log('Searching hotels with params:', params, 'page:', pageNo, 'pageSize:', pageSize);
  
  try {
    const queryParams = new URLSearchParams({
      name: params.query,
      checkIn: params.from,
      checkOut: params.to,
      guests: (params.adults + params.children).toString(),
      page: pageNo.toString(),
      pageSize: pageSize.toString()
    });

    const response = await fetch(`${API_BASE_URL}/hotels/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);
    
    return data as SearchResponse;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
};

export interface CheckAvailabilityRequest {
  hotelId: string;
  roomCategoryIds: string[];
  guests: number;
  checkIn: string;
  checkOut: string;
}

export interface CheckAvailabilityResponse {
  success: boolean;
  message: string;
  data: {
    available: boolean;
  };
}

export const checkRoomAvailability = async (
  hotelId: string,
  request: CheckAvailabilityRequest
): Promise<CheckAvailabilityResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/hotels/${hotelId}/rooms/check-availability`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as CheckAvailabilityResponse;
  } catch (error) {
    console.error('Error checking room availability:', error);
    throw error;
  }
};

export interface LoginCredentials {
  emailAddress: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    userId?: string;
    email: string;
    emailAddress?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  console.log('Logging in with:', credentials.emailAddress);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      body: JSON.stringify(credentials),
      mode: 'cors',
      credentials: 'omit'
    });

    const data = await response.json();
    console.log('Login response:', data);
    
    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Login failed. Please check your credentials.'
      };
    }
    
    return {
      success: true,
      message: data.message || 'Login successful',
      token: `session-${Date.now()}`,
      user: {
        id: data.data.userId,
        userId: data.data.userId,
        email: data.data.emailAddress,
        emailAddress: data.data.emailAddress,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        name: `${data.data.firstName} ${data.data.lastName}`
      }
    };
  } catch (error) {
    console.error('Error during login:', error);
    return {
      success: false,
      message: 'An error occurred during login. Please try again.'
    };
  }
};

export const getUserByEmail = async (email: string): Promise<{
  success: boolean;
  user?: {
    userId: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  message?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/by-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit'
    });

    const data = await response.json();
    console.log('Get user by email response:', data);
    
    if (response.ok && data.success && data.data) {
      return {
        success: true,
        user: data.data
      };
    } else {
      return {
        success: false,
        message: data.message || 'User not found'
      };
    }
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return {
      success: false,
      message: 'An error occurred while checking user.'
    };
  }
};

export const getUserBookings = async (userId: string): Promise<{
  success: boolean;
  bookings?: any[];
  message?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit'
    });

    const data = await response.json();
    console.log('Get user bookings response:', data);
    
    if (response.ok && data.success) {
      return {
        success: true,
        bookings: data.data || []
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch bookings',
        bookings: []
      };
    }
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return {
      success: false,
      message: 'An error occurred while fetching bookings.',
      bookings: []
    };
  }
};