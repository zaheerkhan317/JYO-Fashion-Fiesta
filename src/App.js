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
import AdminLayout from './components/Admin/AdminLayout/AdminLayout ';
import ProtectedRoute from './components/ProtectedRoutes/ProtectedRoute';
import { UserProvider } from './components/Context/UserProvider';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/Navbar/LoginForm/LoginForm';
import Dashboard from './components/Admin/AdminLayout/Dashboard/Dashboard';
import Orders from './components/Admin/AdminLayout/Orders/Orders';
import Products from './components/Admin/AdminLayout/Products/Products';
import Users from './components/Admin/AdminLayout/Products/Products';
import Kurtas from './components/Categories/Kurtas/Kurtas';
import Loungewear from './components/Categories/LoungeWear/Loungewear';
import Sarees from './components/Categories/Sarees/Sarees';
import ProductDetail from './components/Categories/Product Detail/ProductDetail';
import Categories from './components/Categories/Categories';

function AppContent() {
  const navigate = useNavigate(); 
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin' || 
                       location.pathname === '/admin/dashboard' ||
                       location.pathname === '/admin/orders' ||
                       location.pathname === '/admin/products' ||
                       location.pathname === '/admin/users' ||
                       location.pathname === '/adminlogin';
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
        
      <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element= {<Home />} />
        <Route path="/offers" element={<OffersZone />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* <Route path="/signup" element={user ? <Home /> : <SignupForm onSuccess={handleSignupSuccess} />} /> */}
        {/* <Route path="/signup" element={user ? <Home /> : <SignupForm onSuccess={handleSignupSuccess} />} /> */}
        <Route path="/signup" element={user || firstName ? <Navigate to="/home" replace /> : <SignupForm />} />
        <Route path="/login" element={firstName || user ? <Navigate to="/home" replace /> : <LoginForm />} /> 

       
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/categories/kurtas" element={<Categories />} />
        <Route path="/categories/sarees" element={<Categories />} />
        <Route path="/categories/loungewear" element={<Categories />} />
        
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} /> {/* Default to dashboard */}
            <Route path="dashboard" element={<Dashboard />} /> {/* Handles /admin/dashboard */}
            <Route path="orders" element={<Orders />} /> {/* Handles /admin/orders */}
            <Route path="products" element={<Products />} /> {/* Handles /admin/products */}
            <Route path="users" element={<Users />} /> {/* Handles /admin/users */}
          </Route>



        {/* <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} /> */}
       
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
