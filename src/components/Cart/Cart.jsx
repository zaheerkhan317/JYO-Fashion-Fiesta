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
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [couponCode, setCouponCode] = useState({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState(''); // State for country code
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
          localStorage.removeItem('discounts');
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
    setShowPhoneModal(true);
  };


  const handlePhoneSubmit = () => {
    // Validate phone number (add any validation if necessary)
    if (!phoneNumber || !countryCode) {
        alert("Please enter a valid phone number.");
        return;
    }
    setShowPhoneModal(false); // Close phone modal
    setShowPlaceOrderModal(true); // Show confirmation modal
};
  

  const confirmPlaceAllOrders = async () => {
    console.log("phone number:",`${countryCode}${phoneNumber}`);
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
          items: cartItems.map(item => ({
              ...item, 
              discountApplied: item.discountApplied || false, // Include discountApplied
              couponDiscount: item.couponDiscount || 0, // Include couponDiscount (default to 0 if not present)
          })),
          contactPhoneNumber: `${countryCode}${phoneNumber}`,
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
      localStorage.setItem('activeLink', 'myorders');
      setTimeout(() => {
        window.location.href = '/myorders'; // Navigate to /myorders
      }, 2000);
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

        // Update the cart item with the coupon discount
        const updatedCartItems = [...cartItems];
        updatedCartItems[index].total = discountedPrice;
        updatedCartItems[index].couponDiscount = discountPercentage; // Store the coupon discount
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

  const handleRemoveDiscount = (index) => {
    const updatedCartItems = [...cartItems];
    
    // Reset the coupon discount
    updatedCartItems[index].couponDiscount = 0;
    updatedCartItems[index].discountApplied = false;

    // Recalculate the total price with the product discount
    const productDiscount = updatedCartItems[index].discountvalue; // Assuming you have a productDiscount property
    console.log("discount:",productDiscount);
    const originalPrice = updatedCartItems[index].price * updatedCartItems[index].quantity;
    console.log("original price:",originalPrice);
    const discountedPrice = (originalPrice * (1 - productDiscount / 100)).toFixed(2);
    console.log("discount price:",discountedPrice);
    updatedCartItems[index].total = discountedPrice; // Update the total price with product discount

    setCartItems(updatedCartItems);
    updateLocalStorage(updatedCartItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
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
                <div className="info-group d-flex flex-row align-items-center">
  <strong>Quantity:</strong>
  <div className="d-flex flex-row align-items-center mt-2 mt-sm-0 ms-2">
    <Button
      variant="outline-secondary"
      className="quantity-btn"
      onClick={() => handleQuantityChange(index, -1)}
      
    >
      <FaMinus />
    </Button>
    <span className="quantity-span mx-2" >
      {item.quantity}
    </span>
    <Button
      variant="outline-secondary"
      className="quantity-btn"
      onClick={() => handleQuantityChange(index, 1)}
      
    >
      <FaPlus />
    </Button>
  </div>
</div>

                <div className="info-group">
                  <strong>Original Price:</strong> <span className="original-price">₹{item.price} per one</span>
                </div>
                <div className="info-group">
    <strong>Discount:</strong> 
    {item.discountApplied ? (
        <div className="d-flex align-items-center">
            <span className="discount-price">
                {item.couponDiscount}% - Coupon Code Discount
            </span>
            <Button
                variant="link"
                className="remove-discount-btn ms-2"
                onClick={() => handleRemoveDiscount(index)}
            >
                X
            </Button>
        </div>
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

       {/* Phone Number Modal */}
       <Modal show={showPhoneModal} onHide={() => setShowPhoneModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter Phone Number to Contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form>
                        <Form.Group controlId="formCountryCode">
                            <Form.Label>Country Code</Form.Label>
                            <Form.Control 
                                as="select" 
                                value={countryCode} 
                                onChange={(e) => setCountryCode(e.target.value)}
                            >
                                <option value="">Select Country Code</option>
                                <option value="+91">+91 (India)</option>
                                <option value="+1">+1 (USA)</option>
                                <option value="+44">+44 (UK)</option>
                                <option value="+61">+61 (Australia)</option>
                                <option value="+81">+81 (Japan)</option>
                                <option value="+33">+33 (France)</option>
                                <option value="+49">+49 (Germany)</option>
                                <option value="+39">+39 (Italy)</option>
                                <option value="+55">+55 (Brazil)</option>
                                <option value="+86">+86 (China)</option>
                                <option value="+7">+7 (Russia)</option>
                                <option value="+27">+27 (South Africa)</option>
                                <option value="+82">+82 (South Korea)</option>
                                <option value="+20">+20 (Egypt)</option>
                                <option value="+34">+34 (Spain)</option>
                                <option value="+31">+31 (Netherlands)</option>
                                <option value="+52">+52 (Mexico)</option>
                                <option value="+60">+60 (Malaysia)</option>
                                <option value="+63">+63 (Philippines)</option>
                                <option value="+62">+62 (Indonesia)</option>
                                <option value="+90">+90 (Turkey)</option>
                                <option value="+41">+41 (Switzerland)</option>
                                <option value="+48">+48 (Poland)</option>
                                <option value="+30">+30 (Greece)</option>
                                <option value="+94">+94 (Sri Lanka)</option>
                                <option value="+91">+91 (India)</option>
                                <option value="+977">+977 (Nepal)</option>
                                {/* Add more country codes as needed */}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formPhoneNumber">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter your phone number" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)} 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPhoneModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handlePhoneSubmit}>
                        Next
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Place Order Confirmation Modal */}
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
