import React, { useState, useEffect, useRef }from 'react'
import { Navbar, Nav, NavDropdown, Container, Button, Spinner, Row, Col } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Notification from './Notification/Notification';
import "./Navbar.css";
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { FiUser } from 'react-icons/fi';
import { useUser } from '../Context/UserProvider';
import logo from '../../img/logo.png';

const NavbarHome = () => {
  const { user, setUser, firstName, setFirstName, displayName, uid, setUid } = useUser();
  console.log("firstName in NavbarHome : ",firstName);
  console.log("user : ",user);
  console.log("user id : ",uid);
  console.log("User firstName", firstName);
  // console.log("user.firstname",user.firstName);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [festivalOffer, setFestivalOffer] = useState(null);
  const [activeLink, setActiveLink] = useState(localStorage.getItem('activeLink') || 'home');
  const [isCategoriesActive, setIsCategoriesActive] = useState(
    localStorage.getItem('isCategoriesActive') === 'true' // Convert string to boolean
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  console.log("cart count",cartCount);
  // useEffect(() => {
  //   // Simulate fetching user data from an API or local storage
  //   const fetchUserData = () => {
  //     // Simulating an API call or local storage retrieval with setTimeout
  //     setTimeout(() => {
  //       // Example user data, replace with actual data retrieval logic
  //       const userData = { firstname: " " };
  //       setUser(userData); // Set the user state with fetched data
  //     }, 1000); // Simulate a 1-second delay for fetching data
  //   };

  //   fetchUserData();
  // }, []); // Empty dependency array means this effect runs once after initial render


  // useEffect(() => {
  //   const storedFirstName = localStorage.getItem('firstName');
  //   console.log("stored firstName",storedFirstName);
  //   if (storedFirstName) {
  //     setFirstName(storedFirstName);
  //   } else {
  //     // Handle the case where first name is not found in session storage
  //     console.error('First name not found in local storage');
  //   }
  // }, [setFirstName]);

  useEffect(() => {
    // Retrieve the cart count from localStorage when the Navbar is mounted
    const storedCartCount = localStorage.getItem('cartCount') || 0;
    setCartCount(Number(storedCartCount));
  }, []);
  
  useEffect(() => {
    const fetchFestivalOffer = async () => {
      try {
        const festivalOffersRef = firebase.firestore().collection('FestivalOffers').doc('current');
        const festivalOfferDoc = await festivalOffersRef.get();
        if (festivalOfferDoc.exists) {
          setFestivalOffer(festivalOfferDoc.data());
        }
      } catch (error) {
        console.error("Error fetching festival offers:", error);
      }
    };

    fetchFestivalOffer();
  }, []);
  

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await firebase.auth().signOut();
      setUser(null);
      setFirstName(''); 
      localStorage.removeItem('firstName');
      localStorage.removeItem('displayName');
      localStorage.removeItem('adminUser'); // Remove admin user data
      localStorage.removeItem('cartCount'); // Remove cart count
      localStorage.removeItem('cartItems'); // Remove cart items
      localStorage.removeItem('notifications'); // Remove notifications
      localStorage.removeItem('orderStatus'); // Remove order status
      localStorage.removeItem('uid'); // Remove order status
      // Add any other items that need to be cleared from local storage
      localStorage.setItem('activeLink','home');
      window.location.href = '/home';
    } catch (error) {
      console.error("Logout error:", error);
      // Handle any errors if necessary
    } finally {
      setIsLoading(false);
    }
  };
  

  // Save activeLink to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeLink', activeLink);
  }, [activeLink]);
  

  // Save isCategoriesActive to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isCategoriesActive', isCategoriesActive);
  }, [isCategoriesActive]);


  // Function to handle category selection
  const handleCategoryClick = (category) => {
    setIsCategoriesActive(true); // Keep categories active
    setActiveLink(category); // Set active link to the selected category
  };
 

  const handleLinkClick = (link) => {
    setActiveLink(link);
    // If a category link is clicked, set isCategoriesActive to true
    if (link.startsWith('categories/')) {
      setIsCategoriesActive(true);
    } else {
      setIsCategoriesActive(false);
    }
  };

  const dropdownRef = useRef(null);

  const handleMyOrdersClick = () => {
    handleLinkClick('myorders');

    // Close the dropdown programmatically
    if (dropdownRef.current) {
      dropdownRef.current.classList.remove('show'); // Hide the dropdown menu
      const parent = dropdownRef.current.parentElement;
      parent.querySelector('[data-bs-toggle="dropdown"]').setAttribute('aria-expanded', 'false');
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
     {/* Festival Offer Banner */}
      <div className="festival-banner-container">
        {festivalOffer && festivalOffer.festivalName && festivalOffer.couponCode && festivalOffer.discountPercentage && (
          <div className="festival-banner text-white text-center">
            <p>
              <strong>{festivalOffer.festivalName} Special:</strong> Use this coupon code <strong>{festivalOffer.couponCode}</strong> to get a discount of <strong>{festivalOffer.discountPercentage}%</strong> on your item!
            </p>
          </div>
        )}
      </div>

      {/* Navbar */}
      <Navbar className="sticky-top navbar-glossy" expand="lg">
        <Container>
          {/* Logo */}
          <Navbar.Brand as={Link} to="/home" className={`navbar-link ${activeLink === '' ? 'active' : ''}`} onClick={() => handleLinkClick('')}>
  <div className="navbar-brand-container">
    {/* Logo Image */}
    <img 
      src={logo} 
      alt="Logo" 
      className="navbar-logo" 
    /> 

    {/* Title and Tagline */}
    <div className="navbar-title-container">
      {/* Main Title */}
      <span className="navbar-brand-title">JYO</span>

      {/* Tagline */}
      <span className="navbar-brand-tagline">
        Fashion Fiesta
      </span>
    </div>
  </div>
</Navbar.Brand>


          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={toggleDropdown}>
            {/* Custom toggle button */}
            <span className="navbar-toggler-icon">
              {isDropdownOpen ? (
                <i className="fa-solid fa-xmark text-white"></i> // Font Awesome X icon
              ) : (
                <i className="fa-solid fa-bars text-white"></i> // Font Awesome Hamburger icon
              )}
            </span>
          </Navbar.Toggle>


          {/* Navbar Links and Dropdown */}
          <Navbar.Collapse id="basic-navbar-nav" className='text-center'>
            <Nav className="mx-auto">
              <Nav.Link as={Link} to="/home" className={`mx-3 navbar-link ${activeLink === 'home' ? 'active' : ''}`} onClick={() => handleLinkClick('home')}>Home</Nav.Link>


              <NavDropdown  title={<span className={`text-center mx-3 nav-dropdown ${isCategoriesActive  ? 'active-title' : ''}`}>Categories</span>}
               id="basic-nav-dropdown" className="text-center mx-3 nav-dropdown">
              <NavDropdown.Item 
                as={Link} 
                to="/categories/kurtas" 
                className={`navbar-glossy-glass navbar-link ${activeLink === 'categories/kurtas' ? 'active' : ''} text-center`} 
                onClick={() => handleCategoryClick('categories/kurtas')}
              >
                Kurtas
              </NavDropdown.Item>
              <NavDropdown.Item 
                as={Link} 
                to="/categories/sarees" 
                className={`navbar-glossy-glass navbar-link ${activeLink === 'categories/sarees' ? 'active' : ''} text-center`} 
                onClick={() => handleCategoryClick('categories/sarees')}
              >
                Sarees
              </NavDropdown.Item>
              <NavDropdown.Item 
                as={Link} 
                to="/categories/loungewear" 
                className={`navbar-glossy-glass navbar-link ${activeLink === 'categories/loungewear' ? 'active' : ''} text-center`} 
                onClick={() => handleCategoryClick('categories/loungewear')}
              >
                Lounge wear
              </NavDropdown.Item>
            </NavDropdown>


              <Nav.Link as={Link} to="/offers" className={`mx-3 navbar-glossy-glass navbar-link ${activeLink === 'offers' ? 'active' : ''}`} onClick={() => handleLinkClick('offers')}>Offers Zone</Nav.Link>
              <Nav.Link as={Link} to="/about" className={`mx-3 navbar-glossy-glass navbar-link ${activeLink === 'aboutus' ? 'active' : ''}`} onClick={() => handleLinkClick('aboutus')}>About Us</Nav.Link>
              <Nav.Link as={Link} to="/contact" className={`mx-3 navbar-glossy-glass navbar-link ${activeLink === 'contactus' ? 'active' : ''}`} onClick={() => handleLinkClick('contactus')}>Contact Us</Nav.Link>
            </Nav>

            {/* Buttons with responsive sizing */}
            <Nav className="d-flex justify-content-center align-items-center">
              {(user || firstName) ? (
                <>
                  <Nav.Item className="d-flex flex-column flex-sm-row align-items-center nav-item">
                    <div className="d-flex flex-column flex-sm-row align-items-center me-0">
                      <span className="me-3">Hi, {firstName || displayName}</span>
                      <div className="dropdown">
                        <Button variant="outline-primary" id="profileDropdown" 
                        className={`d-flex justify-content-center align-items-center ${activeLink === 'myorders' ? 'active-profile' : ''}`} // Add a class if My Orders is active
                        data-bs-toggle="dropdown" aria-expanded="false">
                          <i className="fa-solid fa-user"></i> {/* Profile icon */}
                        </Button>
                        <ul className="dropdown-menu text-center dropdown-menu-end" ref={dropdownRef} aria-labelledby="profileDropdown">
                          <li><Link as={Link} to="/myorders" 
                          className={`navbar-glossy-glass navbar-link ${activeLink === 'myorders' ? 'active' : ''}`} 
                          onClick={handleMyOrdersClick}
                          >My Orders</Link></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button 
                                className="dropdown-item" 
                                type="button" 
                                onClick={handleLogout} 
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    color: 'white', // Default text color
                                    transition: 'background-color 0.3s ease, color 0.3s ease' 
                                }} 
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'gold';
                                    e.currentTarget.style.color = 'black'; // Change text color on hover
                                }} 
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'white'; // Reset text color on leave
                                }}
                            >
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Logout'}
                            </button>
                        </li>

                        </ul>
                      </div>
                    </div>
                  </Nav.Item>
                  {/* Notification icon */}
                  <Notification />
                  <Nav.Item>
  <Nav.Link
    as={Link}
    to="/cart"
    className={`cart-icon d-flex justify-content-center align-items-center ${activeLink === 'cart' ? 'active' : ''}`}
    onClick={() => handleLinkClick('cart')} // Set active link when clicked
  >
<Button id="cartButton" className="custom-cart-button border-dark bg-black text-white">
  <i className="fa-solid fa-cart-shopping"></i> {/* Cart icon */}
  {cartCount > 0 && (
    <span className="cart-count-badge">{cartCount}</span>
  )}
</Button>



  </Nav.Link>
</Nav.Item>

                </>
              ) : (
                <Nav.Item>
                  
                <Link to="/signup" 
                className={`nav-link ${activeLink === 'signup' ? 'active' : ''}`}
                onClick={() => handleLinkClick('signup')}>

                  <FiUser size={30} style={{
                    color: activeLink === 'signup' ? 'gold' : 'white', // Change color dynamically
                  }} /> {/* Feather User Icon */}
                  <span className="me-3">SignUp</span>
                </Link>
              </Nav.Item>
              )}
            </Nav>

          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default NavbarHome
