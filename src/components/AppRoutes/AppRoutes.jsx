import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home from "../Home/Home";
import About from "../About_Us/AboutUs";
import Contact from "../Contact/ContactUs";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

     
    </Routes>
  )
}

export default AppRoutes
