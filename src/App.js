import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import NavbarHome from './components/Navbar/NavbarHome';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';
import OffersZone from './components/OffersZone/OffersZone';
import AboutUs from './components/About_Us/AboutUs';
import ContactUs from './components/Contact/ContactUs';


import AdminLogin from './components/Admin/AdminLogin/AdminLogin';
import Dashboard from './components/Admin/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoutes/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin' || location.pathname === '/dashboard';

  return (
    <div className='App'>
      {!isAdminRoute && <NavbarHome />}
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/offers" element={<OffersZone />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />


        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
