import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Button } from 'react-bootstrap';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FaTrash } from 'react-icons/fa';
import { db } from '../../../../firebaseConfig.js'; // Adjust the import path as needed

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Reference to the orders collection
        const ordersCollectionRef = collection(db, 'orders');
        // Fetch all documents in the collection
        const querySnapshot = await getDocs(ordersCollectionRef);
        // Map the documents to an array of order data
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Update state with the fetched orders
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders: ", error);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleApprove = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'approved' });
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'approved' } : order));
    } catch (error) {
      console.error("Error approving order: ", error);
      setError("Failed to approve the order. Please try again later.");
    }
  };

  const handleDeny = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'denied' });
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'denied' } : order));
    } catch (error) {
      console.error("Error denying order: ", error);
      setError("Failed to deny the order. Please try again later.");
    }
  };

  const handleDelete = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error("Error deleting order: ", error);
      setError("Failed to delete the order. Please try again later.");
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
        <p>Loading orders...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1>Orders</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User ID</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Order Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            // Calculate total quantity
            const totalQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

            return (
              <tr key={order.id}>
                <td>{order.orderId}</td>
                <td>{order.userId}</td>
                <td>{totalQuantity}</td>
                <td>₹{order.totalPrice}</td>
                <td>{order.orderDate}</td>
                <td>{order.status}</td>
                <td>
                  {(order.status === 'pending' || order.status === 'denied' || order.status === 'approved' || order.status === 'cancelRequested') && (
                    <>
                      <Button
                        variant="success"
                        className="me-2"
                        onClick={() => handleApprove(order.id)}
                        
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeny(order.id)}
                        
                      >
                        Deny
                      </Button>
                    </>
                  )}
                  <Button
                    variant="light"
                    onClick={() => handleDelete(order.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default Orders;
