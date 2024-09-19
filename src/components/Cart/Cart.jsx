import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Button, ListGroup, Card, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from 'react-router-dom';
import './Cart.css'; // Import custom CSS

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [couponCode, setCouponCode] = useState({});
  const [discount, setDiscount] = useState({}); // New state for discount
  const [couponError, setCouponError] = useState({}); // New state for coupon error
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = () => {
      const uid = localStorage.getItem('uid');

      if (uid) {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const items = cart[uid] || [];
        if (Array.isArray(items) && items.length === 0) {
          localStorage.setItem('cartCount', 0);
        } else {
          items.forEach(item => {
            item.quantity = item.quantity || 1; // Ensure each item has an initial quantity of 1
            item.total = (item.price * item.quantity * (1 - (item.discountvalue / 100))).toFixed(2);
          });
          setCartItems(items);
          // Update cart count in localStorage
          localStorage.setItem('cartCount', items.length);
        }
      } else {
        setError('User not logged in');
      }
    };

    fetchCartItems();
  }, []);

  const generateOrderId = async () => {
    const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();
  
    const checkIdExists = async (id) => {
      const orderRef = doc(db, 'orders', id);
      const docSnap = await getDoc(orderRef);
      return docSnap.exists();
    };
  
    const generateUniqueId = async () => {
      let id = generateId();
      while (await checkIdExists(id)) {
        id = generateId(); // Generate a new ID if the current one already exists
      }
      return id;
    };
  
    return generateUniqueId();
  };

  const handleRemoveFromCart = (index) => {
    setItemToRemove(index);
    setShowRemoveModal(true);
  };

  const confirmRemoveFromCart = () => {
    const uid = localStorage.getItem('uid');

    if (uid && itemToRemove !== null) {
      const cart = JSON.parse(localStorage.getItem('cart')) || {};
      
      if (cart[uid]) {
        cart[uid].splice(itemToRemove, 1);
        if (cart[uid].length === 0) {
          delete cart[uid];
          localStorage.removeItem('cart');
          localStorage.setItem('cartCount', 0); 
          setCartItems([]);// Set cart count to 0 if empty
        } else {
          localStorage.setItem('cart', JSON.stringify(cart));
          localStorage.setItem('cartCount', cart[uid].length);
          setCartItems(cart[uid]);
        }
      }
    
    }
    setShowRemoveModal(false);
  };

  const handleQuantityChange = (index, change) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity += change;
  
    // Ensure quantity doesn't go below 1
    if (updatedCartItems[index].quantity < 1) {
      updatedCartItems[index].quantity = 1;
    }
  
    // Calculate original price (price * quantity)
    const originalPrice = updatedCartItems[index].price * updatedCartItems[index].quantity;
    
    // Calculate discounted total price
    const discountedPrice = (originalPrice * (1 - updatedCartItems[index].discountvalue / 100)).toFixed(2);
    
    // Update the item with both original price and total discounted price
    updatedCartItems[index].originalPrice = originalPrice.toFixed(2);
    updatedCartItems[index].total = discountedPrice;
  
    setCartItems(updatedCartItems);
  
    // Update the cart in localStorage
    const uid = localStorage.getItem('uid');
    if (uid) {
      const cart = JSON.parse(localStorage.getItem('cart')) || {};
      cart[uid] = updatedCartItems;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  };


  const getISTDate = (date) => {
    const options = {
      timeZone: 'Asia/Kolkata', // IST timezone
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  };

  const handlePlaceAllOrders = () => {
    setShowPlaceOrderModal(true);
  };
  

  const confirmPlaceAllOrders = async () => {
    try {
      const orderId = await generateOrderId(); // Ensure the order ID is awaited
      const uid = localStorage.getItem('uid');
  
      if (!uid) {
        setError("User not logged in");
        return;
      }
  
      // Create order object
      const orderData = {
        orderId: orderId,
        userId: uid,
        items: cartItems,
        paid: false,
        status: 'pending', // Optional field for tracking request date
        totalPrice: cartItems.reduce((total, item) => total + parseFloat(item.total), 0).toFixed(2),
        orderDate: getISTDate(new Date()).toString(), // Store the current date
      };
  
      // Add the order to Firestore
      const ordersRef = collection(db, 'orders');
      await addDoc(ordersRef, orderData);
  
      // Clear cart after placing order
      localStorage.removeItem('cart');
      localStorage.setItem('cartCount', 0);
      setCartItems([]);
  
      alert(`Order placed successfully! Order ID: ${orderId}`);
      navigate('/myorders', { replace: true }); // Navigate to /cart
      window.location.reload();
    } catch (error) {
      console.error("Error placing order: ", error);
      setError("Error placing order. Please try again.");
    }
    setShowPlaceOrderModal(false);
  };
  

  if (error) {
    return <div className="text-center mt-5">{error}</div>;
  }

  if (cartItems.length === 0) {
    return <div className="text-center mt-5">Your cart is empty</div>;
  }

  const updateLocalStorage = (updatedCartItems) => {
    const uid = localStorage.getItem('uid');
    if (uid) {
      const cart = JSON.parse(localStorage.getItem('cart')) || {};
      cart[uid] = updatedCartItems;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  };

  const handleApplyCoupon = async (index, code) => {
    try {
        const couponRef = collection(db, 'FestivalOffers');
        const q = query(couponRef, where('couponCode', '==', code));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setCouponError(prevErrors => ({ ...prevErrors, [index]: 'Invalid coupon code' }));
            return;
        }

        const couponData = querySnapshot.docs[0].data();
        const discountPercentage = couponData.discountPercentage;

        const product = cartItems[index];
        if (!product.isOffer) {
            setCouponError(prevErrors => ({ ...prevErrors, [index]: 'Product is not eligible for discount' }));
            return;
        }

        const originalPrice = product.price * product.quantity;
        const discountedPrice = (originalPrice * (1 - discountPercentage / 100)).toFixed(2);

        // Update the cart item with the new discount value and total price
        const updatedCartItems = [...cartItems];
        updatedCartItems[index].total = discountedPrice;
        updatedCartItems[index].discountvalue = discountPercentage; // Update the discount value of the item
        updatedCartItems[index].discountApplied = true; // Mark as discount applied

        setCartItems(updatedCartItems);

        // Update localStorage
        updateLocalStorage(updatedCartItems);

        // Save the discount info in localStorage
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));

        // Clear any previous coupon error
        setCouponError(prevErrors => ({ ...prevErrors, [index]: '' }));
    } catch (error) {
        console.error("Error applying coupon: ", error);
        setCouponError(prevErrors => ({ ...prevErrors, [index]: 'Error applying coupon. Please try again.' }));
    }
};

  

  const handleCouponCodeChange = (index, e) => {
    const code = e.target.value;
    setCouponCode(prevCodes => ({ ...prevCodes, [index]: code }));
    if (code.trim() === '') {
      setCouponError(prevErrors => ({ ...prevErrors, [index]: '' }));
      setDiscount(prevDiscounts => ({ ...prevDiscounts, [index]: 0 }));
      return;
    }
  };

  // Calculate total price for all items
  const totalPrice = cartItems.reduce((total, item) => total + parseFloat(item.total), 0).toFixed(2);
  
  // Calculate total discount
  const totalOriginalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  const totalDiscount = (totalOriginalPrice - totalPrice).toFixed(2);

  return (
    <Container className="cart-section mt-5">
      <Row className="justify-content-center">
        {cartItems.map((item, index) => (
          <Col key={index} md={12} className="mb-4">
            <div className="cart-item d-flex align-items-center">
              <Image src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-info">
                <div className="info-group">
                  <strong>Name:</strong> <span>{item.name}</span>
                </div>
                <div className="info-group">
                  <strong>Product Id:</strong> <span>#{item.id}</span>
                </div>
                <div className="info-group">
                  <strong>Description:</strong> <span>{item.description}</span>
                </div>
                <div className="info-group">
                  <strong>Brand:</strong> <span>{item.brand}</span>
                </div>
                <div className="info-group">
                  <strong>Size:</strong> <span>{item.size}</span>
                </div>
                <div className="info-group">
                  <strong>Color:</strong> <span>{item.color}</span>
                </div>
                <div className="info-group d-flex align-items-center">
                  <strong>Quantity:</strong>
                  <Button
                    variant="outline-secondary"
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(index, -1)}
                  >
                    <FaMinus />
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outline-secondary"
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(index, 1)}
                  >
                    <FaPlus />
                  </Button>
                </div>
                <div className="info-group">
                  <strong>Original Price:</strong> <span className="original-price">₹{item.price} per one</span>
                </div>
                <div className="info-group">
                  <strong>Discount:</strong> 
                  {item.discountApplied ? (
                    <span className="discount-price">
                      {item.discountvalue}% - Discount Applied
                    </span>
                  ) : (
                    <span className="discount-price">{item.discountvalue}%</span>
                  )}
                </div>

                <div className="info-group">
                  <strong>Total:</strong> <span className="total-price">₹{item.total}</span>
                </div>
                <div className="cart-item-actions mt-3 mb-3">
                  <Form.Group controlId={`formCouponCode${index}`}>
                    <Row className="align-items-center">
                      <Col xs={12} md={6} className="mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode[index] || ''}
                          onChange={(e) => handleCouponCodeChange(index, e)}
                        />
                      </Col>
                      <Col xs={12} md={4} className="mb-2">
                        <Button
                          variant="primary"
                          className="w-100"
                          onClick={() => handleApplyCoupon(index, couponCode[index])}
                        >
                          Apply Code
                        </Button>
                      </Col>
                      <Col xs={12} md={2} className="d-flex align-items-center justify-content-start">
                        <Button variant="danger" onClick={() => handleRemoveFromCart(index)}>
                          <FaTrash />
                        </Button>
                      </Col>
                    </Row>
                    {couponError[index] && <p className="error-message">{couponError[index]}</p>}
                    {discount[index] > 0 && cartItems[index].isOffer && (
                      <p>Discount Applied: {discount[index]}%</p>
                    )}
                  </Form.Group>
                </div>
              </div>
            </div>
          </Col>
        ))}
        <Col md={12} className="text-center mt-4">
          <Card>
            <Card.Body>
              <Card.Title>Total Pricing Details</Card.Title>
              <ListGroup>
                <ListGroup.Item>
                  <strong>Total Original Price:</strong> ₹{totalOriginalPrice}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Total Discount:</strong> ₹{totalDiscount}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Total Price (After Discount):</strong> ₹{totalPrice}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          <Button className="btn-gold mt-4 mb-5" onClick={handlePlaceAllOrders} disabled={cartItems.length === 0}>
            Place Order
          </Button>
        </Col>
      </Row>
      {/* Remove Item Modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to remove this item from your cart?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmRemoveFromCart}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Place Order Modal */}
      <Modal show={showPlaceOrderModal} onHide={() => setShowPlaceOrderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to place the order for all items in your cart?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPlaceOrderModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmPlaceAllOrders}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

       
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </Container>
  );
};

export default Cart;
