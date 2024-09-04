import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import NavbarHome from './components/Navbar/NavbarHome';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';
import OffersZone from './components/OffersZone/OffersZone';
import AboutUs from './components/About_Us/AboutUs';
import ContactUs from './components/Contact/ContactUs';
import SignupForm from './components/Navbar/SignupForm/SignupForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { auth } from './firebaseConfig';

import AdminLogin from './components/Admin/AdminLogin/AdminLogin';
import Dashboard from './components/Admin/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoutes/ProtectedRoute';
import { UserProvider } from './components/Context/UserProvider';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/Navbar/LoginForm/LoginForm';


function AppContent() {
  const navigate = useNavigate(); 
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin' || location.pathname === '/dashboard';
  const [user, setUser] = useState();
    useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
        navigate('/home', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const firstName = localStorage.getItem('firstName');
  

  

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
        {/* <Route path="/signup" element={user ? <Home /> : <SignupForm onSuccess={handleSignupSuccess} />} /> */}
        <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <SignupForm />} />
        <Route path="/login" element={firstName || user ? <Navigate to="/home" replace /> : <LoginForm />} /> 


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
