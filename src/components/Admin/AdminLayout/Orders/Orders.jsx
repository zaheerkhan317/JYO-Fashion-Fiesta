import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Container, Table, Spinner, Alert, Dropdown, Button, Form, Modal } from 'react-bootstrap';
import { collection, getDocs, getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FaTrash } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../../../../img/logo.png';
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
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('');

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
    // Find the order by orderId
    const order = orders.find(order => order.id === orderId);
    console.log("Order object:", order); // Log the order object
  
    // Check if order and items exist
    if (!order || !Array.isArray(order.items)) {
      setNotification("Order or items array not found");
      setNotificationType('error');
      console.error("Order or items array not found");
      // Set timeout to automatically clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      return;
    }
  
    // Get items to update
    const itemsToUpdate = order.items; // This should work correctly
    console.log("Items to update:", itemsToUpdate); // Correct logging
  
    // Create a flag to determine if the update should be applied
    let updateSuccessful = true;
  
    // Update order status
    const orderRef = doc(db, 'orders', orderId);
    try {
      await updateDoc(orderRef, { status: 'approved' });
    } catch (error) {
      console.error("Failed to update order status: ", error);
      setNotification("Failed to update order status. Please try again later.");
      setNotificationType('error');
            // Set timeout to automatically clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      updateSuccessful = false; // Set flag to false
    }
  
    // Update product quantities based on order items
    for (const item of itemsToUpdate) {
      const productRef = doc(db, 'products', item.id);
      const productSnapshot = await getDoc(productRef);
  
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        const size = item.size; // Get the size from the order item
        const currentQuantity = parseInt(productData.sizes[size]) || 0; // Get the current quantity for the size
        const newQuantity = currentQuantity - (parseInt(item.quantity) || 0); // Deduct the ordered quantity
  
        if (newQuantity >= 0) {
          try {
            await updateDoc(productRef, { [`sizes.${size}`]: newQuantity }); // Update the specific size in the sizes map
            console.log(`Updated product ${item.id} size ${size} quantity to ${newQuantity}`);
          } catch (error) {
            setNotification(`Failed to update stock for product ${item.id} size ${size}`);
            setNotificationType('error');
            console.error(`Failed to update stock for product ${item.id} size ${size}`, error);
            updateSuccessful = false; // Set flag to false
            break; // Stop processing if stock update fails
          }
        } else {
          setNotification(`Not enough stock for product ${item.id} size ${size}`);
          setNotificationType('error');
          console.error(`Not enough stock for product ${item.id} size ${size}`);
              // Set timeout to automatically clear notification after 3 seconds
          setTimeout(() => {
            setNotification(null);
          }, 3000);
          updateSuccessful = false; // Set flag to false
          break; // Stop processing if stock is insufficient
        }
      } else {
        setNotification(`Product ${item.id} does not exist`);
        setNotificationType('error');
        console.error(`Product ${item.id} does not exist`);
            // Set timeout to automatically clear notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
        updateSuccessful = false; // Set flag to false
        break; // Stop processing if product does not exist
      }
    }
  
    // If all updates were successful, update the local orders state
    if (updateSuccessful) {
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'approved' } : order));
      // Show success notification
      setNotification("Order approved successfully!");
      setNotificationType('success');

      // Set timeout to automatically clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } else {
      // Revert order status if any errors occurred
      await updateDoc(orderRef, { status: 'pending' }); // Assuming 'pending' is the previous status
    }
  };
  


  const handleDelivered = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'delivered' });
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'delivered' } : order));
  
      // Show success notification for delivery update
      setNotification("Order marked as delivered.");
      setNotificationType('success');
  
      // Automatically dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating order to delivered: ", error);
  
      // Show error notification
      setNotification("Failed to mark the order as delivered. Please try again later.");
      setNotificationType('error');
      
      // Automatically dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };
  

  const handleDeny = async (orderId) => {
    // Find the order by orderId
    const orderRef = doc(db, 'orders', orderId);
    const orderSnapshot = await getDoc(orderRef);
  
    if (!orderSnapshot.exists()) {
      console.error("Order not found");
      setNotification("Order not found");
      setNotificationType('error');
          // Set timeout to automatically clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      return;
    }
  
    const order = orderSnapshot.data();
    const itemsToUpdate = order.items || [];
    let updateSuccessful = true; // Flag to track success
  
    // Update order status to denied
    try {
      await updateDoc(orderRef, { status: 'denied' });
    } catch (error) {
      console.error("Failed to update order status: ", error);
      setNotification("Failed to update order status. Please try again later.");
      setNotificationType('error');
          // Set timeout to automatically clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      updateSuccessful = false; // Set flag to false
    }
  
    // Restore product quantities based on order items
    for (const item of itemsToUpdate) {
      const productRef = doc(db, 'products', item.id);
      const productSnapshot = await getDoc(productRef);
  
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        const size = item.size; // Get the size from the order item
        const currentQuantity = parseInt(productData.sizes[size]) || 0; // Get current quantity for the size
        const restoredQuantity = currentQuantity + (parseInt(item.quantity) || 0); // Restore the ordered quantity
  
        try {
          await updateDoc(productRef, { [`sizes.${size}`]: restoredQuantity }); // Update the specific size in the sizes map
          console.log(`Restored product ${item.id} size ${size} quantity to ${restoredQuantity}`);
        } catch (error) {
          setNotification(`Failed to restore stock for product ${item.id} size ${size}`);
          setNotificationType('error');
          console.error(`Failed to restore stock for product ${item.id} size ${size}`, error);
              // Set timeout to automatically clear notification after 3 seconds
          setTimeout(() => {
            setNotification(null);
          }, 3000);
          updateSuccessful = false; // Set flag to false
          break; // Stop processing if stock update fails
        }
      } else {
        setNotification(`Product ${item.id} does not exist`);
        setNotificationType('error');
        console.error(`Product ${item.id} does not exist`);
            // Set timeout to automatically clear notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
        updateSuccessful = false; // Set flag to false
        break; // Stop processing if product does not exist
      }
    }
  
    // If all updates were successful, update the local orders state
    if (updateSuccessful) {
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'denied' } : order));
      // Show success notification
      setNotification("Order denied successfully!");
      setNotificationType('success');
          // Set timeout to automatically clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } else {
      // Optionally, revert order status if any errors occurred (if applicable)
      await updateDoc(orderRef, { status: 'pending' }); // Assuming 'pending' is the previous status
    }
  };
  
  

  const handleDelete = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      setOrders(orders.filter(order => order.id !== orderId));
  
      // Show success notification for deletion
      setNotification("Order deleted successfully.");
      setNotificationType('success');
      
      // Automatically dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting order: ", error);
  
      // Show error notification
      setNotification("Failed to delete the order. Please try again later.");
      setNotificationType('error');
      
      // Automatically dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
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
          const logoWidth = 25; // Desired width of the logo in the PDF
          const logoHeight = 25; // Desired height of the logo in the PDF
          const logoX = 20; // X position in the PDF
          const logoY = 10; // Y position in the PDF
  
          doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight); // Add logo
        }
  
        // Set font size for the phone number and address
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
  
        // Define the right-aligned phone number and address
        const phoneNumber = '+91 9989660937';
        const streetAddress = '12-6-1, plot no:42,';
        const locality1 = 'Lakshmi Ganapati Colony Line 3,';
        const locality = 'Phool Bagh,'; // Locality/Area
        const city = 'Vizianagaram, 535002.';   // City
  
        // Right-aligned phone number and address positioning
        const rightX = doc.internal.pageSize.getWidth() - 55; // 20 units from the right edge
        const titleY = 0; // Y position for the title
        const spacing = 7;  // Spacing between lines
  
        // Add phone number and address to the right side
        doc.text(phoneNumber, rightX, titleY + spacing); // Phone number
        doc.text(streetAddress, rightX, titleY + spacing * 2); // Street Address
        doc.text(locality1, rightX, titleY + spacing * 3); // Locality/Area
        doc.text(locality, rightX, titleY + spacing * 4); // Locality/Area
        doc.text(city, rightX, titleY + spacing * 5); // City  

        // Centered Header with Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('JYO Fashion Fiesta', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });


        // User Information and Order Summary
        const userInfo = [
          ['First Name', user.firstName || 'N/A'],
          ['Last Name', user.lastName || 'N/A'],
          ['Phone', user.phoneNumber || order.contactPhoneNumber],
          ['Email', user.email || 'N/A'],
          ['Order ID', `#${order.orderId || 'N/A'}`],
          ['Order Date', order.orderDate || 'N/A'],
        ];
  
        // Use autoTable to create the user info table
        doc.autoTable({
          head: [['Field', 'Details']],
          body: userInfo,
          startY: 40, // Adjusted for proper spacing
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
          'Thank you for shopping with us! For any queries, contact us at support@jyofashionfiesta.com',
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
          doc.internal.pageSize.getWidth() / 2 +30,
          doc.internal.pageSize.getHeight() / 2 -10,
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
    {notification && (
      <div className={`notification ${notificationType}`}>
      <span className="notification-message">{notification}</span>
      <button className="notification-close" onClick={() => setNotification(null)}>
        &times;
      </button>
    </div>
    )}

      <h2 className='mb-4'>Orders</h2>
      {/* Search and Filter Bar */}
      <div className="d-flex justify-content-center mb-3">
        <Form.Control
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-50"
        />
        <Dropdown className="custom-dropdown ms-2">
          <Dropdown.Toggle variant="secondary" id="dropdown-filter">
            {(filterStatus || paidStatus) ? 
              `${filterStatus || 'All Status'} - ${paidStatus || 'All Payment Status'}` :
              'Filter Options'}
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-custom">
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
            <th>Contact Number</th>
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
                  {userDetails.phoneNumber || 'Google SignIn User'}<br />
                  {userDetails.email || 'N/A'}
                </td>
                <td>{order.contactPhoneNumber}</td>
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
  <Dropdown className="custom-dropdown me-2"> {/* Added unique class */}
    <Dropdown.Toggle variant="primary" id={`dropdown-${order.id}`} className="dropdown-toggle">
      Actions
    </Dropdown.Toggle>

    <Dropdown.Menu className="dropdown-menu-custom"> {/* Added custom class for dropdown menu */}
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
    variant="danger" // Red delete button
    className="ms-2"
    onClick={() => handleDelete(order.id)}
    title="Delete Order" // Tooltip for better UX
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
