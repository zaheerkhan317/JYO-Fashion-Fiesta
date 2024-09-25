import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { FaTachometerAlt, FaUsers, FaCartPlus, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaBoxOpen, FaImage, FaTags, FaStar } from 'react-icons/fa';
import './Sidebar.css'; // Import custom styles

const Sidebar = ({ isSidebarOpen, setSidebarOpen }) => {
 
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/home'); // Redirect to login page
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2 className={`text-light ${isSidebarOpen ? '' : 'd-none'}`}>Admin Panel</h2>
        </div>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/admin/dashboard" className="text-light d-flex align-items-center">
            <FaTachometerAlt />
            <span className={`d-sm-inline ${isSidebarOpen ? '' : 'text-collapse'}`}>Dashboard</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/orders" className="text-light d-flex align-items-center">
            <FaCartPlus />
            <span className={`d-sm-inline ${isSidebarOpen ? '' : 'text-collapse'}`}>Orders</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/products" className="text-light d-flex align-items-center">
            <FaBoxOpen />
            <span className={`d-sm-inline ${isSidebarOpen ? '' : 'text-collapse'}`}>Products</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/users" className="text-light d-flex align-items-center">
            <FaUsers />
            <span className={`d-sm-inline ${isSidebarOpen ? '' : 'text-collapse'}`}>Users</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/banners" className="text-light d-flex align-items-center">
            <FaImage />
            <span className={`d-sm-inline ${isSidebarOpen ? '' : 'text-collapse'}`}>Banners</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/offers" className="text-light d-flex align-items-center">
            <FaTags />
            <span className={`d-sm-inline ${isSidebarOpen ? '' : 'text-collapse'}`}>Offers</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/reviews" className="text-light d-flex align-items-center">
            <FaStar />
            <span className={`d-sm-inline ${isSidebarOpen ? '' : 'text-collapse'}`}>Reviews</span>
          </Nav.Link>
          <Nav.Link className="text-light d-flex align-items-center" onClick={handleLogout}>
            <FaSignOutAlt />
            <span className={`d-sm-inline ${isSidebarOpen ? '' : 'text-collapse'}`}>Logout</span>
          </Nav.Link>
        </Nav>
      </div>
      <Button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </Button>
    </div>
  );
};

export default Sidebar;
