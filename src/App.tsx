import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { StoreProvider, useStore } from './lib/store'
import Apply from './pages/Apply'
import Book from './pages/Book'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Login from './pages/Login'
import MyHair from './pages/MyHair'
import MyStylist from './pages/MyStylist'
import Profile from './pages/Profile'
import Rewards from './pages/Rewards'

function RequireMember({ children }: { children: ReactNode }) {
  const { member } = useStore()
  return member ? <>{children}</> : <Navigate to="/login" replace />
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/app" element={<RequireMember><AppShell /></RequireMember>}>
            <Route index element={<Home />} />
            <Route path="book" element={<Book />} />
            <Route path="stylist" element={<MyStylist />} />
            <Route path="hair" element={<MyHair />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
