import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Hotel } from '../services/api';

interface SelectedRoom {
  roomType: string;
  price: number;
  quantity: number;
  roomTypeId: string;
  maxGuests: number;
}

interface SearchState {
  searchValue: string;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  guestInfo: {
    adults: number;
    children: number;
    rooms: number;
  };
  searchResults: Hotel[];
  selectedRooms: SelectedRoom[];
  currentHotelId: string | null;
  hasSearched: boolean;
  pagination: {
    totalRecords: number;
    pageNo: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface SearchContextType {
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
}

const initialState: SearchState = {
  searchValue: '',
  dateRange: {
    startDate: null,
    endDate: null
  },
  guestInfo: {
    adults: 2,
    children: 0,
    rooms: 1
  },
  searchResults: [],
  selectedRooms: [],
  currentHotelId: null,
  hasSearched: false,
  pagination: {
    totalRecords: 0,
    pageNo: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false
  }
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>(initialState);

  return (
    <SearchContext.Provider value={{ searchState, setSearchState }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};