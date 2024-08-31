
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavbarHome from './components/Navbar/NavbarHome';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';
import OffersZone from './components/OffersZone/OffersZone';
import AboutUs from './components/About_Us/AboutUs';
import ContactUs from './components/Contact/ContactUs';

function App() {
  return (
  <div className="App">
    <Router>
      <NavbarHome />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/offers" element={<OffersZone />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
      <Footer />
    </Router>
  </div>
      
  );
}

export default App;
