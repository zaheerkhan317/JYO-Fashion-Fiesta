import React from 'react'
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import "./Navbar.css"
const NavbarHome = () => {
  return (
    <Navbar bg="bg-transparent" expand="lg">
    <Container>
      {/* Logo */}
      <Navbar.Brand href="#home">Logo</Navbar.Brand>
      
      {/* Toggler for mobile view */}
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      
      {/* Navbar Links and Dropdown */}
      <Navbar.Collapse id="basic-navbar-nav" className='text-center'>
        <Nav className="mx-auto">
          <Nav.Link href="#home" className="mx-3">Home</Nav.Link>
          <NavDropdown title="Categories" id="basic-nav-dropdown" className="text-center mx-3">
            <NavDropdown.Item href="#action/3.1">Kurtas</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">Sarees</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Lounge wear</NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href="#offers" className="mx-3">Offers Zone</Nav.Link>
          <Nav.Link href="#about" className="mx-3">About Us</Nav.Link>
          <Nav.Link href="#contact" className="mx-3">Contact Us</Nav.Link>
        </Nav>

        {/* Buttons with responsive sizing */}
          <Nav className="d-flex align-items-center">
            <Button variant="outline-primary" className="me-2 custom-button">Login</Button>
            <Button variant="primary" className="custom-button">Sign Up</Button>
          </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  )
}

export default NavbarHome
