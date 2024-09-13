import React, { useState, useEffect }from 'react'
import { Navbar, Nav, NavDropdown, Container, Button, Spinner } from "react-bootstrap";
import { Link } from 'react-router-dom';
import "./Navbar.css";
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { useUser } from '../Context/UserProvider';

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
  

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await firebase.auth().signOut();
      setUser(null);
      setFirstName(''); 
      localStorage.removeItem('firstName');
      navigate('/home');
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // Handle any errors if necessary
    }finally{
      setIsLoading(false);
    }
  };
  

  return (
    <Navbar className="sticky-top navbar-glossy" expand="lg">
    <Container>
      {/* Logo */}
      <Navbar.Brand as={Link} to="/home">Logo</Navbar.Brand>
      
      {/* Toggler for mobile view */}
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      
      {/* Navbar Links and Dropdown */}
      <Navbar.Collapse id="basic-navbar-nav" className='text-center'>
        <Nav className="mx-auto">
          <Nav.Link as={Link} to="/home" className="mx-3">Home</Nav.Link>
          <NavDropdown title="Categories" id="basic-nav-dropdown" className="text-center mx-3">
            <NavDropdown.Item as={Link} to="/categories/kurtas" className="navbar-glossy-glass">Kurtas</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/categories/sarees" className="navbar-glossy-glass">Sarees</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/categories/loungewear" className="navbar-glossy-glass">Lounge wear</NavDropdown.Item>
          </NavDropdown>
          <Nav.Link as={Link} to="/offers" className="mx-3">Offers Zone</Nav.Link>
          <Nav.Link as={Link} to="/about" className="mx-3">About Us</Nav.Link>
          <Nav.Link as={Link} to="/contact" className="mx-3">Contact Us</Nav.Link>
        </Nav>

        {/* Buttons with responsive sizing */}
        <Nav className="d-flex justify-content-center align-items-center">
          {(user|| firstName  ) ? (
            <>
            <Nav.Item className="d-flex flex-column flex-sm-row align-items-center">
                  <div className="d-flex align-items-center me-0">
                    <span className="me-3">Hi, {firstName||displayName}</span>
                    <div className="dropdown">
                      <Button variant="outline-primary" id="profileDropdown" className="d-flex align-items-center" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="fa-solid fa-user"></i> {/* Profile icon */}
                      </Button>
                      <ul className="dropdown-menu" aria-labelledby="profileDropdown">
                        <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                        <li><Link className="dropdown-item" as={Link} to="/myorders">My Orders</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item" type="button" onClick={handleLogout}> 
                          {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Logout'}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Nav.Item>
                {/* Notification icon */}
          <Nav.Item className="d-flex justify-content-center align-items-center m-2">
            <Button variant="outline-primary">
              <i className="fa-solid fa-bell"></i> {/* Notification icon */}
              {/* Optional: add a badge for notifications */}
              {/* <span className="notification-badge">3</span> */}
            </Button>
          </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/cart" className="cart-icon d-flex justify-content-center align-items-center">
                <Button variant="outline-primary">
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
              <Link to="/signup">
                <Button variant="primary">Login / Signup</Button>
              </Link>
            </Nav.Item>
          )}
        </Nav>

      </Navbar.Collapse>
    </Container>
  </Navbar>
  )
}

export default NavbarHome
