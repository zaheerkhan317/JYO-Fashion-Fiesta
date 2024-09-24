import { useState, useEffect } from 'react';
import { Nav, Badge, Dropdown } from 'react-bootstrap';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import './Notification.css';

const Notification = () => {
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });

  const [orderStatus, setOrderStatus] = useState(() => {
    const savedOrderStatus = localStorage.getItem('orderStatus');
    return savedOrderStatus ? JSON.parse(savedOrderStatus) : {};
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications
      ? JSON.parse(savedNotifications).filter(n => !n.read).length
      : 0;
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState([]);

  // Fetch notifications from Firebase
  const fetchNotifications = async () => {
    const uid = localStorage.getItem('uid');
    if (!uid) return;

    const db = firebase.firestore();
    const ordersRef = db.collection('orders').where('userId', '==', uid);

    try {
      const snapshot = await ordersRef.get();
      const newNotifications = [];
      const updatedOrderStatus = { ...orderStatus };
      let count = unreadCount;

      snapshot.forEach(doc => {
        const order = doc.data();
        const orderId = doc.id;
        const currentStatus = order.status;

        if (!orderStatus[orderId] || orderStatus[orderId] !== currentStatus) {
          newNotifications.push({
            id: orderId,
            message: `Order #${order.orderId} status changed to ${currentStatus} (Updated)`,
            status: currentStatus,
            read: dropdownOpen ? false : true,
            updated: true,
          });
          count++;
        } else {
          newNotifications.push({
            id: orderId,
            message: `Order #${order.orderId} is currently ${currentStatus}`,
            status: currentStatus,
            read: dropdownOpen ? false : true,
            updated: false,
          });
        }

        updatedOrderStatus[orderId] = currentStatus;
      });

      setNotifications(newNotifications);
      localStorage.setItem('notifications', JSON.stringify(newNotifications));
      setOrderStatus(updatedOrderStatus);
      localStorage.setItem('orderStatus', JSON.stringify(updatedOrderStatus));
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (isOpen) => {
    setDropdownOpen(isOpen);
    if (!isOpen) {
      markAllAsRead(); // Mark all as read when dropdown is closed
    }
  };

  // Mark all notifications as read and reset unread count
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
      updated: false,
    }));

    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    setUnreadCount(0); // Reset unread count
  };

    // Handle notification click
    const handleNotificationClick = (id) => {
      if (activeNotifications.includes(id)) {
        setActiveNotifications(activeNotifications.filter(activeId => activeId !== id)); // Remove if already active
      } else {
        setActiveNotifications([...activeNotifications, id]); // Add to active
      }
    };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Nav.Item className="d-flex justify-content-center align-items-center nav-dropdown m-2">
      <Dropdown onToggle={handleDropdownToggle}>
        <Dropdown.Toggle id="notification-dropdown" className="custom-notification-toggle border-dark bg-black text-white">
        <i className={`fa-solid fa-bell ${dropdownOpen ? 'text-gold' : ''}`}></i>
          {unreadCount > 0 && <Badge bg="danger" className="ms-1 custom-badge">{unreadCount}</Badge>}
        </Dropdown.Toggle>


        <Dropdown.Menu align="end" className="notification-dropdown">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <Dropdown.Item
                key={index}
                className={`notification-item ${activeNotifications.includes(notification.id) ? 'active-notification' : ''}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                {notification.message}
              </Dropdown.Item>
            ))
          ) : (
            <Dropdown.Item>No new notifications</Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </Nav.Item>
  );
};

export default Notification;







// import { useState, useEffect } from 'react';
// import { Nav, Badge, Dropdown } from 'react-bootstrap';
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/firestore'; // Make sure to import this
// import './Notification.css'; // Make sure to create this CSS file

// const Notification = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [orderStatus, setOrderStatus] = useState({});
//   const [unreadCount, setUnreadCount] = useState(0);

//   // Function to fetch notifications
//   const fetchNotifications = async () => {
//     const uid = localStorage.getItem('uid'); // Get the user's UID from localStorage
//     if (!uid) return;

//     const db = firebase.firestore();
//     const ordersRef = db.collection('orders').where('userId', '==', uid);

//     try {
//       const snapshot = await ordersRef.get(); // Fetch all orders
//       const newNotifications = [];
//       const updatedOrderStatus = { ...orderStatus };
//       let count = 0;

//       snapshot.forEach(doc => {
//         const order = doc.data();
//         const orderId = doc.id;
//         const currentStatus = order.status;

//         // Check if the order's status has changed
//         if (orderStatus[orderId] && orderStatus[orderId] !== currentStatus) {
//           newNotifications.push({
//             id: orderId,
//             message: `Order ${order.orderId} status changed to ${currentStatus}`,
//             status: currentStatus,
//             read: false,
//           });
//           count++; // Increase unread count
//         }

//         // Update the known status for this order
//         updatedOrderStatus[orderId] = currentStatus;
//       });

//       // Update state and localStorage with new notifications
//       if (newNotifications.length > 0) {
//         const updatedNotifications = [...notifications, ...newNotifications];
//         setNotifications(updatedNotifications);
//         localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
//       }

//       setOrderStatus(updatedOrderStatus);
//       localStorage.setItem('orderStatus', JSON.stringify(updatedOrderStatus));
//       setUnreadCount(count); // Update unread count
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//     }
//   };

//   useEffect(() => {
//     // Set up real-time listener for order status changes
//     const uid = localStorage.getItem('uid'); // Get the user's UID from localStorage
//     if (!uid) return;

//     const db = firebase.firestore();
//     const ordersRef = db.collection('orders').where('userId', '==', uid);

//     const unsubscribe = ordersRef.onSnapshot(snapshot => {
//       const newNotifications = [];
//       const updatedOrderStatus = { ...orderStatus };
//       let count = unreadCount;

//       snapshot.forEach(doc => {
//         const order = doc.data();
//         const orderId = doc.id;
//         const currentStatus = order.status;

//         // Check if the order's status has changed
//         if (orderStatus[orderId] && orderStatus[orderId] !== currentStatus) {
//           newNotifications.push({
//             id: orderId,
//             message: `Order ${order.orderId} status changed to ${currentStatus}`,
//             status: currentStatus,
//             read: false,
//           });
//           count++; // Increase unread count
//         }

//         // Update the known status for this order
//         updatedOrderStatus[orderId] = currentStatus;
//       });

//       // Update state and localStorage with new notifications
//       if (newNotifications.length > 0) {
//         const updatedNotifications = [...notifications, ...newNotifications];
//         setNotifications(updatedNotifications);
//         localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
//       }

//       setOrderStatus(updatedOrderStatus);
//       localStorage.setItem('orderStatus', JSON.stringify(updatedOrderStatus));
//       setUnreadCount(count); // Update unread count
//     });

//     // Cleanup function to unsubscribe from listener on unmount
//     return () => unsubscribe();
//   }, [orderStatus, unreadCount, notifications]);

//   // Handle dropdown toggle
//   const handleDropdownToggle = (isOpen) => {
//     if (isOpen) {
//       fetchNotifications(); // Fetch notifications when dropdown is opened

//       // Mark all notifications as read when dropdown is opened
//       markAllAsRead();
//     }
//   };

//   // Mark all notifications as read and update unread count
//   const markAllAsRead = () => {
//     const updatedNotifications = notifications.map(notification => ({
//       ...notification,
//       read: true,
//     }));

//     setNotifications(updatedNotifications);
//     localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
//     setUnreadCount(0); // Reset unread count
//   };

//   return (
//     <Nav.Item className="d-flex justify-content-center align-items-center m-2">
//       <Dropdown onToggle={handleDropdownToggle}> {/* Fetch notifications on dropdown toggle */}
//         <Dropdown.Toggle variant="outline-primary" id="notification-dropdown">
//           <i className="fa-solid fa-bell"></i>
//           {unreadCount > 0 && <Badge bg="danger" className="ms-1">{unreadCount}</Badge>}
//         </Dropdown.Toggle>

//         <Dropdown.Menu align="end">
//           {notifications.length > 0 ? (
//             notifications.map((notification, index) => (
//               <Dropdown.Item
//                 key={index}
//                 className={notification.read ? '' : 'notification-blink'}
//               >
//                 {notification.message}
//               </Dropdown.Item>
//             ))
//           ) : (
//             <Dropdown.Item>No new notifications</Dropdown.Item>
//           )}
//         </Dropdown.Menu>
//       </Dropdown>
//     </Nav.Item>
//   );
// };

// export default Notification;
