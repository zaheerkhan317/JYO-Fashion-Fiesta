import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { getFirestore, collection, query, updateDoc, getDocs, getDoc, doc, deleteDoc } from 'firebase/firestore';
import logo from '../../../img/logo.jpg'
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './MyOrders.css'; // Custom CSS for styling

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const uid = localStorage.getItem('uid');
        if (!uid) {
          console.error('No user ID found in localStorage.');
          return;
        }

        // Reference to the orders collection
        const ordersCollectionRef = collection(db, 'orders');
        // Fetch all documents in the collection
        const querySnapshot = await getDocs(ordersCollectionRef);
        // Map the documents to an array of order data
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter orders based on the user ID
        const userOrders = ordersData.filter(order => order.userId === uid);

        // Update state with the filtered orders
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  if (orders.length === 0) {
    return <div className="text-center mt-5">No orders found</div>;
  }

  const handleDeleteOrder = async () => {
    if (selectedOrder) {
      try {
        const orderRef = doc(db, 'orders', selectedOrder.id);
        await deleteDoc(orderRef);
        setOrders(orders.filter(order => order.id !== selectedOrder.id));
        setConfirmationModal(null); // Close the confirmation modal
      } catch (error) {
        console.error('Error deleting order:', error);
        setError('Failed to delete the order.');
      }
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data(); // Return the user details
      } else {
        console.log("No such user!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details: ", error);
      return null;
    }
  };

  const handleCancelRequest = async () => {
    if (selectedOrder) {
      try {
        const orderRef = doc(db, 'orders', selectedOrder.id);
        await updateDoc(orderRef, { status: 'cancelRequested' });
        setOrders(orders.map(order => order.id === selectedOrder.id ? { ...order, status: 'cancelRequested' } : order));
        alert("Cancel request sent successfully!");
        setConfirmationModal(null); // Close the confirmation modal
      } catch (error) {
        console.error("Error sending cancel request: ", error);
        setError("Failed to send cancel request. Please try again later.");
      }
    }
  };

  const openConfirmationModal = (action, order) => {
    setSelectedOrder(order);
    setConfirmationModal(action);
  };

  const closeConfirmationModal = () => {
    setConfirmationModal(null);
    setSelectedOrder(null);
  };
  

// Replace with your base64 encoded logo

const handleViewInvoice = async (orderId) => {
  const order = orders.find((order) => order.id === orderId);

  if (order) {
    // Fetch user details using userId from the order
    const user = await fetchUserDetails(order.userId);
    console.log(user);
    if (user) {
      const doc = new jsPDF();
      
      // Add Logo (Optimized for size and quality)
      if (logo) {
        doc.addImage(logo, 'PNG', 10, 10, 40, 15); // Adjust size for space
      }

      // Centered Header with Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('JYO Fashion Fiesta', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

      // User Information and Order Summary
      const userInfo = [
        ['Field', 'Details'],
        ['First Name', user.firstName],
        ['Last Name', user.lastName],
        ['Phone', user.phoneNumber],
        ['Email', user.email],
        ['Order ID', `#${order.orderId}`],
        ['Order Date', order.orderDate],
      ];

      // Use autoTable to create the user info table
      doc.autoTable({
        head: [['Field', 'Details']],
        body: userInfo,
        startY: 40,
        margin: { left: 10, right: 10 },
        theme: 'striped',
        styles: {
          fontSize: 10,
          cellPadding: 5,
          lineColor: [44, 62, 80],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 50 }, // Narrower width for 'Field'
          1: { cellWidth: 'auto' }, // Auto width for 'Details'
        },
        pageBreak: 'avoid', // Avoid page breaks within tables
      });

      // Prepare data for the items table
      const itemTable = order.items.map((item, index) => [
        index + 1,
        `#${item.id}`,
        item.name,
        item.quantity,
        `Rs. ${item.price}`,
        `${item.discountvalue}%`,
        `Rs. ${item.total}`,
      ]);

      // Add product details in a table format
      doc.autoTable({
        head: [['S.No', 'Product ID', 'Item Name', 'Qty', 'Price', 'Discount', 'Total']],
        body: itemTable,
        startY: doc.autoTable.previous.finalY + 10,
        margin: { left: 10, right: 10 },
        theme: 'striped',
        styles: {
          fontSize: 10,
          cellPadding: 5,
          lineColor: [44, 62, 80],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Narrow width for S.No
          1: { cellWidth: 35 }, // Narrow width for Product ID
          2: { cellWidth: 30 }, // Narrow width for Item Name
          3: { cellWidth: 20 }, // Narrow width for Brand
          4: { cellWidth: 25 }, // Narrow width for Qty
          5: { cellWidth: 20 }, // Narrow width for Price
          6: { cellWidth: 30 }, // Narrow width for Total
        },
        pageBreak: 'avoid', // Avoid page breaks within tables
      });

      // Add Total Amount to Pay
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Total Amount: Rs. ${order.totalPrice}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.autoTable.previous.finalY + 20,
        { align: 'center' }
      );

      // Add Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'Thank you for shopping with us! For any queries, contact us at support@jyofashion.com',
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 15,
        { align: 'center' }
      );

      // Generate and display the PDF
      try {
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
        setShowModal(true);
      } catch (error) {
        console.error('Error generating PDF:', error);
        setError('Failed to generate PDF. Please try again later.');
      }
    } else {
      console.error("User not found!!!");
    }
  }
};

  return (
    <Container className="my-orders-section mt-5 mb-5">
      <h1 className="text-center mb-4">My Orders</h1>
      <Row>
        {orders.length > 0 ? (
          orders.map((order) => (
            <Col key={order.id} xs={12} className="horizontal-card-container">
              <Card className="horizontal-card">
                <Card.Body className="d-flex">
                  <div className="order-items d-flex flex-column">
                    {order.items.map((item, index) => (
                      <div key={index} className="product-item d-flex align-items-center mb-3">
                        <img src={item.image} alt={item.name} className="product-img" />
                        <div className="product-info ms-3">
                          <div className="info-group">
                            <strong>Product ID:</strong> #{item.id}
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
                  <div className="order-details ms-3">
                    <Card.Title>Order #{order.orderId}</Card.Title>
                    <Card.Text>
                      <strong>Date:</strong> {order.orderDate}
                    </Card.Text>
                    <Card.Text>
                      <strong>Total Amount:</strong> ₹{order.totalPrice}
                    </Card.Text>
                    <Card.Text>
                      <strong>Status: </strong>
                      <span className={`status-indicator ${
                        order.status === 'approved' ? 'status-approved' :
                        order.status === 'cancelRequested' ? 'status-cancelRequested' :
                        order.status === 'cancelled' ? 'status-cancelled' :
                        order.status === 'denied' ? 'status-denied' :
                        order.status === 'delivered' ? 'status-delivered' : 'status-pending'
                      }`}>
                        {order.status === 'approved' ? 'Approved. Items are ready to collect' :
                        order.status === 'cancelRequested' ? 'Cancellation Request Sent, Awaiting Admin Approval for Deletion' :
                        order.status === 'cancelled' ? 'Cancelled' :
                        order.status === 'denied' ? 'Denied' :
                        order.status === 'delivered' ? 'Delivered Successfully' : 'Pending'}
                      </span>
                    </Card.Text>


                    {order.status === 'pending' && !order.cancelRequestSent ? (
                      <Button variant="danger" onClick={() => openConfirmationModal('delete', order)}>
                        Cancel Order
                      </Button>
                    ) : order.status === 'approved' ? (
                      <div className="d-flex flex-column flex-sm-row">
                        <Button variant="secondary" onClick={() => handleViewInvoice(order.id)} className="me-2">
                          View Invoice
                        </Button>
                        <Button variant="warning" onClick={() => openConfirmationModal('cancel', order)}>
                          Send Cancel Request
                        </Button>
                      </div>
                    ) : order.status === 'denied' ? (
                      <Button variant="danger" onClick={() => openConfirmationModal('delete', order)}>
                        Delete My Order
                      </Button>
                    ) : order.status === 'cancelRequested' ? (
                      <Button variant="secondary" onClick={() => handleViewInvoice(order.id)} className="me-2">
                        View Invoice
                      </Button>
                    ) : order.status === 'delivered' ? (
                      <Button variant="secondary" onClick={() => handleViewInvoice(order.id)} className="me-2">
                        View Invoice
                      </Button>
                    ) : null}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center">
            <p>No orders found.</p>
          </Col>
        )}
      </Row>

      {/* Confirmation Modals */}
      <Modal show={confirmationModal === 'delete'} onHide={closeConfirmationModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this order?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmationModal}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteOrder}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={confirmationModal === 'cancel'} onHide={closeConfirmationModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this order?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmationModal}>Cancel</Button>
          <Button variant="warning" onClick={handleCancelRequest}>Cancel Order</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={confirmationModal === 'sendCancelRequest'} onHide={closeConfirmationModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Send Cancel Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to send a cancel request for this order?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmationModal}>Cancel</Button>
          <Button variant="info" onClick={handleCancelRequest}>Send Request</Button>
        </Modal.Footer>
      </Modal>

      {/* PDF Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="responsive-modal">
        <Modal.Header closeButton>
          <Modal.Title>Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Invoice PDF"
              className="responsive-iframe"
            ></iframe>
          ) : (
            <p>Loading invoice...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>

  );
};

export default MyOrders;
