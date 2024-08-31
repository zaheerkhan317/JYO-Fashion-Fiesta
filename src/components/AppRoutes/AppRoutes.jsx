import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home from "../Home/Home";
import About from "../About_Us/AboutUs";
import Contact from "../Contact/ContactUs";


import AdminLogin from '../Admin/AdminLogin/AdminLogin';
import Dashboard from '../Admin/Dashboard/Dashboard';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />


      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default AppRoutes
