import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import NavbarHome from './components/Navbar/NavbarHome';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';
import OffersZone from './components/OffersZone/OffersZone';
import AboutUs from './components/About_Us/AboutUs';
import ContactUs from './components/Contact/ContactUs';
import SignupForm from './components/Navbar/SignupForm/SignupForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';


import AdminLogin from './components/Admin/AdminLogin/AdminLogin';
import Dashboard from './components/Admin/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoutes/ProtectedRoute';
import { UserProvider } from './components/Context/UserProvider';
import { useNavigate } from 'react-router-dom';


function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin' || location.pathname === '/dashboard';

  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    navigate('/home', { replace: true }); // Replace the current history entry with /home
  };

  return (
    <UserProvider>
    <div className='App'>
      {!isAdminRoute && <NavbarHome />}
      
      <Routes>
        

        <Route path="/home" element= {<Home />} />
        <Route path="/offers" element={<OffersZone />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* <Route path="/signup" element={user ? <Home /> : <SignupForm onSuccess={handleSignupSuccess} />} /> */}
        <Route path="/signup" element={user ? <Home /> : <SignupForm onSuccess={handleSignupSuccess} />} />
        


        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
       
      </Routes>
      
      {!isAdminRoute && <Footer />}
      
    </div>
    </UserProvider>
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


















// function AppContent() {
//   const location = useLocation();
//   const isAdminRoute = location.pathname === '/admin' || location.pathname === '/dashboard';

  

//   return (
//     <UserProvider>
//     <div className='App'>
//       {!isAdminRoute && <NavbarHome />}
      
//       <Routes>
        

//         <Route path="/home" element= {<Home />} />
//         <Route path="/offers" element={<OffersZone />} />
//         <Route path="/about" element={<AboutUs />} />
//         <Route path="/contact" element={<ContactUs />} />
//         {/* <Route path="/signup" element={user ? <Home /> : <SignupForm onSuccess={handleSignupSuccess} />} /> */}
//         <Route path="/signup" element={<SignupForm/>} />
        


//         <Route path="/admin" element={<AdminLogin />} />
//         <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
       
//       </Routes>
      
//       {!isAdminRoute && <Footer />}
      
//     </div>
//     </UserProvider>
//   );
// }

// function App() {
//   return (
//     <div className="App">
//       <Router>
//         <AppContent />
//       </Router>
//     </div>
//   );
// }

// export default App;
