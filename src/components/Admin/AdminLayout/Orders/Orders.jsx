import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Dropdown, Button, Form, Modal } from 'react-bootstrap';
import { collection, getDocs, getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FaTrash } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../../../../img/logo.jpg'
import { db } from '../../../../firebaseConfig.js'; // Adjust the import path as needed
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [search, setSearch] = useState(''); // State for search input
  const [filterStatus, setFilterStatus] = useState(''); // State for status filter
  const [paidStatus, setPaidStatus] = useState(''); // State for status filter
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(''); // For holding the PDF blob URL

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

        // Fetch user details
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        const usersData = usersSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data(); // Use user ID as key
          return acc;
        }, {});
        setUsers(usersData);
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

  const handleDelivered = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'delivered' });
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'delivered' } : order));
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

  const handleInvoice = (orderId) => {
    // Find the order by ID
    const order = orders.find(order => order.id === orderId);
  
    if (order) {
      // Get user details from usersData using userId from the order
      const user = users[order.userId];
  
      if (user) {
        const doc = new jsPDF();
  
        // Add Logo (Optimized for size and quality)
        if (logo) {
          doc.addImage(logo, 'PNG', 10, 10, 40, 15); // Adjust size for space
        }
  
        // Centered Header with Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
  
        // User Information and Order Summary
        const userInfo = [
          ['First Name', user.firstName || 'N/A'],
          ['Last Name', user.lastName || 'N/A'],
          ['Phone', user.phoneNumber || 'N/A'],
          ['Email', user.email || 'N/A'],
          ['Order ID', `#${order.orderId || 'N/A'}`],
          ['Order Date', order.orderDate || 'N/A'],
          ['Payment Status', order.paid ? 'Paid' : 'Not Paid']
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
        const itemTable = (Array.isArray(order.items) ? order.items : []).map((item, index) => [
          index + 1,
          `#${item.id || 'N/A'}`,
          item.name || 'N/A',
          item.quantity || 1,
          item.size || 'N/A',
          `Rs. ${item.price || 0}`,
          item.discountApplied ? `${item.couponDiscount || 0}%` : `${item.discountvalue || 0}%`, // Display coupon discount if applied
          `Rs. ${item.total || 0}`,
        ]);

  
        // Add product details in a table format
        doc.autoTable({
          head: [['S.No', 'Product ID', 'Item Name', 'Qty', 'Size', 'Price', 'Disc.', 'Total']],
          body: itemTable,
          startY: doc.autoTable.previous.finalY + 10,
          margin: { left: 13, right: 10 },
          theme: 'striped',
          styles: {
            fontSize: 8,
            cellPadding: 5,
            lineColor: [44, 62, 80],
            lineWidth: 0.5,
          },
          headStyles: {
            fillColor: [52, 73, 94],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
          },
          columnStyles: {
            0: { cellWidth: 19 }, // Narrow width for S.No
            1: { cellWidth: 30 }, // Narrow width for Product ID
            2: { cellWidth: 27 }, // Narrow width for Item Name
            3: { cellWidth: 17 }, // Narrow width for Qty
            4: { cellWidth: 17 }, // Narrow width for Size
            5: { cellWidth: 25 }, // Narrow width for Price
            6: { cellWidth: 20 }, // Narrow width for Disc.
            7: { cellWidth: 25 }, // Narrow width for Total
          },
          pageBreak: 'avoid', // Avoid page breaks within tables
        });

        // Calculate the total saved amount
        // Calculate the total saved amount
        const totalSaved = (order.items || []).reduce((sum, item) => {
          return sum + (item.price - item.total);
      }, 0);

      // Add Saved Amount
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(
          `Saved Amount: Rs. ${totalSaved.toFixed(2)}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.autoTable.previous.finalY + 20,
          { align: 'center' }
      );
  
        // Add Total Amount to Pay
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `Total Amount to be Paid: Rs. ${order.totalPrice || 0}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.autoTable.previous.finalY + 30,
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
  
        // Add Watermark on Top of the Table
        doc.setTextColor(200, 200, 200); // Light Grey color for watermark
        doc.setFontSize(60); // Adjust font size as needed
        doc.setFont('helvetica', 'bold');
        doc.text(
          order.paid ? 'PAID' : 'NOT PAID',
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() / 2,
          {
            angle: 35, // Rotate text
            align: 'center',
            baseline: 'middle',
            transform: true
          }
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
  
  

  const handleModalClose = () => {
    setShowModal(false);
    setPdfUrl('');
  };
  

  const filteredOrders = orders.filter(order => {
    const isSearchMatch = 
      order.orderId.includes(search) ||
      order.userId.includes(search) ||
      (users[order.userId]?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
      (users[order.userId]?.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
      (users[order.userId]?.email || '').toLowerCase().includes(search.toLowerCase());

    // Check if filter status is set to 'All' or if the order's status matches the filter
    const isStatusMatch = (filterStatus === '' || filterStatus === 'All') ? true : order.status === filterStatus;

    // Check if paid status is set to 'All' or if the order's paid status matches the filter
    const isPaidMatch = (paidStatus === '' || paidStatus === 'All') ? true : (paidStatus === 'paid' ? order.paid : !order.paid);

    // Return true if all conditions match
    return isSearchMatch && isStatusMatch && isPaidMatch;
  });

  // Combined filter dropdown
  const handleFilterChange = (status, payment) => {
    setFilterStatus(status);
    setPaidStatus(payment);
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

  const aggregateSizes = (items) => {
    const sizeQuantities = {};
  
    items.forEach(item => {
      if (item.size) {
        if (!sizeQuantities[item.size]) {
          sizeQuantities[item.size] = 0;
        }
        sizeQuantities[item.size] += item.quantity || 0;
      }
    });
  
    return sizeQuantities;
  };
  

  const handleToggle = async (orderId) => {
    try {
      // Optimistically update the local state first
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, paid: !order.paid } : order
      ));
  
      // Get the document reference
      const orderRef = doc(db, 'orders', orderId);
  
      // Update the 'paid' status directly
      await updateDoc(orderRef, {
        paid: !orders.find(order => order.id === orderId).paid
      });
    } catch (error) {
      console.error('Error updating document:', error);
  
      // Revert the local state if there's an error
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, paid: !order.paid } : order
      ));
    }
  };
  

  return (
    <Container className="mt-5">
      <h1>Orders</h1>
      {/* Search and Filter Bar */}
      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-50"
        />
        <Dropdown className="ms-2">
          <Dropdown.Toggle variant="secondary" id="dropdown-filter">
            {(filterStatus || paidStatus) ? 
              `${filterStatus || 'All Status'} - ${paidStatus || 'All Payment Status'}` :
              'Filter Options'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleFilterChange('', '')}>All</Dropdown.Item>

            <Dropdown.Header>Status</Dropdown.Header>
            <Dropdown.Item onClick={() => handleFilterChange('pending', paidStatus)}>Pending</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange('approved', paidStatus)}>Approved</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange('delivered', paidStatus)}>Delivered</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange('denied', paidStatus)}>Denied</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange('cancelRequested', paidStatus)}>Cancel Requested</Dropdown.Item>

            <Dropdown.Header>Payment Status</Dropdown.Header>
            <Dropdown.Item onClick={() => handleFilterChange(filterStatus, 'paid')}>Paid</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange(filterStatus, 'not paid')}>Not Paid</Dropdown.Item>
          </Dropdown.Menu>
      </Dropdown>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User Details</th>
            <th>Product IDs, <br />sizes & Quantity</th>
            <th>Total Price</th>
            <th>Order Date</th>
            <th>Status</th>
            <th>Paid Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          
          {filteredOrders.map(order => {
            // Aggregate sizes and quantities for the current order
            const sizeQuantities = aggregateSizes(order.items);
            // Sort sizes
            const sortedSizes = Object.entries(sizeQuantities).sort(([sizeA], [sizeB]) => {
              const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
              return sizeOrder.indexOf(sizeA) - sizeOrder.indexOf(sizeB);
            });
             // Get user details from users state
             const userDetails = users[order.userId] || {};
            return (
              
              <tr key={order.id}>
                <td>{order.orderId}</td>
                <td>
                  {userDetails.firstName} {userDetails.lastName}<br/>
                  {userDetails.phoneNumber || 'N/A'}<br />
                  {userDetails.email || 'N/A'}
                </td>
                <td>
                  {order.items.map((item, index) => (
                    <div key={index}>
                      {item.id} : {item.size} : {item.quantity}
                    </div>
                  ))}
                </td>
                <td>₹{order.totalPrice}</td>
                <td>{order.orderDate}</td>
                <td>{order.status}</td>
                <td>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`toggle-paid-${order.id}`}
                      checked={order.paid}
                      onChange={() => handleToggle(order.id)}
                    />
                    <label className="form-check-label" htmlFor={`toggle-paid-${order.id}`}>
                      {order.paid ? 'Paid' : 'Not Paid'}
                    </label>
                  </div>
                </td>

                <td>
                  <div className="d-flex align-items-center">
                    <Dropdown>
                      <Dropdown.Toggle variant="primary" id={`dropdown-${order.id}`}>
                        Actions
                      </Dropdown.Toggle>
              
                      <Dropdown.Menu>
                        {order.status === 'pending' && (
                          <>
                            <Dropdown.Item onClick={() => handleApprove(order.id)}>Approve</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDeny(order.id)}>Deny</Dropdown.Item>
                          </>
                        )}
                        {order.status === 'approved' && (
                          <>
                            <Dropdown.Item onClick={() => handleInvoice(order.id)}>Invoice</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDeny(order.id)}>Deny</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelivered(order.id)}>Delivered</Dropdown.Item>
                          </>
                        )}
                        {order.status === 'denied' && (
                          <Dropdown.Item onClick={() => handleApprove(order.id)}>Approve</Dropdown.Item>
                        )}
                        {order.status === 'delivered' && (
                          <Dropdown.Item onClick={() => handleInvoice(order.id)}>Invoice</Dropdown.Item>
                        )}
                        {order.status === 'cancelRequested' && (
                          <>
                            <Dropdown.Item onClick={() => handleApprove(order.id)}>Approve</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDeny(order.id)}>Deny</Dropdown.Item>
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                    <Button
                      variant="light"
                      className="ms-2"
                      onClick={() => handleDelete(order.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
              

            );
          })}
        </tbody>
      </Table>

      {/* Modal for PDF display */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfUrl && <iframe src={pdfUrl} title="Invoice" width="100%" height="500px" />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>


    </Container>
  );
};

export default Orders;
