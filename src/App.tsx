import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import AvailabilityPage from './components/AvailabilityPage'
import CheckoutPage from './components/CheckoutPage'
import ConfirmationPage from './components/ConfirmationPage'
import MyBookingsPage from './components/MyBookingsPage'
import Footer from './components/Footer'
import { Routes, Route } from 'react-router-dom'
import { SearchProvider } from './context/SearchContext'
import { AuthProvider } from './context/AuthContext'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SearchProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/availability" element={<AvailabilityPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </SearchProvider>
    </AuthProvider>
  )
}

export default App
