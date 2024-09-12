import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import './MyOrders.css'; // Custom CSS for styling

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchOrders = async () => {
      const uid = localStorage.getItem('uid');
      if (uid) {
        try {
          const ordersRef = collection(db, 'orders');
          const q = query(ordersRef, where('userId', '==', uid));
          const querySnapshot = await getDocs(q);

          const fetchedOrders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setOrders(fetchedOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setError('Failed to fetch orders.');
        }
      } else {
        setError('User not logged in');
      }
    };

    fetchOrders();
  }, [db]);

  if (error) {
    return <div className="text-center mt-5">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center mt-5">No orders found</div>;
  }

  const DeleteOrder = async (orderId) => {
    try {
        // Reference to the order document
        const orderRef = doc(db, 'orders', orderId);
        
        // Delete the document
        await deleteDoc(orderRef);
        
        // Update the orders state to reflect the removal
        setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
        console.error('Error deleting order:', error);
        setError('Failed to delete the order.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
        // Update order status to 'cancelRequested' and add a field for admin approval
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status: 'cancelRequested',
          cancelRequestSent: true, // Field to track request status
          cancelRequestDate: new Date().toISOString(), // Optional field for tracking request date
        });
        // Update the orders state to reflect the change
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'cancelRequested', cancelRequestSent: true } : order
        ));
      } catch (error) {
        console.error('Error sending cancellation request:', error);
        setError('Failed to send cancellation request.');
      }
  };

  const handleViewInvoice = (orderId) => {
    // Navigate to invoice page or display invoice modal
    console.log(`Viewing invoice for order ${orderId}`);
  };

  return (
    <Container className="my-orders-section mt-5">
      <h1 className="text-center mb-4">My Orders</h1>
      <Row className="d-flex flex-nowrap overflow-auto">
        {orders.map((order) => (
          <Col key={order.id} className="d-flex mb-4">
            <Card className="horizontal-card w-100">
              <Card.Body className="d-flex">
                <div className="order-items d-flex flex-column">
                  {order.items.map((item, index) => (
                    <div key={index} className="product-item d-flex align-items-center mb-3">
                      <img src={item.image} alt={item.name} className="product-img" />
                      <div className="product-info ms-3">
                        <div className="info-group">
                          <strong>Product ID:</strong> {item.id}
                        </div>
                        <div className="info-group">
                          <strong>Product Name:</strong> {item.name}
                        </div>
                        <div className="info-group">
                          <strong>Quantity:</strong> {item.quantity}
                        </div>
                        <div className="info-group">
                          <strong>Original Price:</strong> ₹{item.price}/- per piece
                        </div>
                        <div className="info-group">
                          <strong>Discount Price:</strong> ₹{item.total}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-details ms-3 flex-shrink-1">
                  <Card.Title>Order #{order.orderId}</Card.Title>
                  <Card.Text>
                    <strong>Date:</strong> {order.orderDate}
                  </Card.Text>
                  <Card.Text>
                    <strong>Total Amount:</strong> ₹{order.totalPrice}
                  </Card.Text>
                  <Card.Text>
  <strong>Status:</strong> {order.status === 'approved' ? 'Approved. Items are ready to collect' : 
    order.status === 'cancelRequested' ? 'Cancellation Request Sent, Waiting for Admin Approval' : 
    order.status === 'cancelled' ? 'Cancelled' :
    order.status === 'denied' ? 'Denied' : 'Pending'}
</Card.Text>
{order.status === 'pending' && !order.cancelRequestSent ? (
  <Button variant="danger" onClick={() => DeleteOrder(order.id)}>
    Cancel Order
  </Button>
) : order.status === 'approved' ? (
  <Button variant="secondary" onClick={() => handleViewInvoice(order.id)}>
    View Invoice
  </Button>
) : order.status === 'denied' ? (
  <Button variant="danger" onClick={() => DeleteOrder(order.id)}>
    Delete My Order
  </Button>
) : null}

                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MyOrders;
