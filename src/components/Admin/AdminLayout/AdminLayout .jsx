import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Orders from './Orders/Orders';
import Products from './Products/Products';
import Users from './Users/Users';
import Dashboard from './Dashboard/Dashboard';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="d-flex">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <div className="content flex-grow" 
       style={{
        marginLeft: isSidebarOpen ? '250px' : '80px',
        transition: 'margin-left 0.3s', // Smooth transition for margin
        padding: '20px',
      }}>
        <Container fluid>
          <Row>
            <Col>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="products" element={<Products />} />
                <Route path="users" element={<Users />} />
              </Routes>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default AdminLayout;
