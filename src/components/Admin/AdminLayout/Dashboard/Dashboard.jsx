import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { getFirestore, collection, getDocs } from 'firebase/firestore';


const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  //   const [productCount, setProductCount] = useState(0);
  //   const [orderCount, setOrderCount] = useState(0);
  const db = getFirestore();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user count
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const totalUsers = usersSnapshot.size;
        setUserCount(totalUsers);

        // Fetch product count
        // const productsSnapshot = await database.ref('products').once('value');
        // const products = productsSnapshot.val();
        // setProductCount(products ? Object.keys(products).length : 0);

        // // Fetch order count
        // const ordersSnapshot = await database.ref('orders').once('value');
        // const orders = ordersSnapshot.val();
        // setOrderCount(orders ? Object.keys(orders).length : 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [db]);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Users</Card.Title>
              <Card.Text>
                <h3><FaUsers /> {userCount}</h3>
                Total users registered
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Products</Card.Title>
              <Card.Text>
                {/* <h3><FaBox /> {productCount}</h3> */}
                Products available
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Orders</Card.Title>
              <Card.Text>
                {/* <h3><FaCartPlus /> {orderCount}</h3> */}
                Orders placed this month
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Activities */}
        <Col md={8} className="mb-4">
          <Card>
            <Card.Header>Recent Activities</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <FaCalendarAlt /> User John Doe registered
              </ListGroup.Item>
              <ListGroup.Item>
                <FaCalendarAlt /> Product XYZ added
              </ListGroup.Item>
              <ListGroup.Item>
                <FaCalendarAlt /> Order #1234 shipped
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* Quick Summary */}
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header>Quick Summary</Card.Header>
            <Card.Body>
              <div> {/* Changed from <p> to <div> */}
                <ul>
                  <li><strong>Total Users:</strong> {userCount}</li>
                  {/* <li><strong>Total Products:</strong> {productCount}</li>
                  <li><strong>Orders This Month:</strong> {orderCount}</li> */}
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
