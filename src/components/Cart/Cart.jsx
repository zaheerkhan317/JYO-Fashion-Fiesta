import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import './Cart.css'; // Import custom CSS

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCartItems = () => {
      const uid = localStorage.getItem('uid');

      if (uid) {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const items = cart[uid] || [];
        console.log('Cart Items:', items); // Debugging line
        console.log("discount price",items.discountValue);
        items.forEach(item => {
          item.quantity = item.quantity || 1; // Ensure each item has an initial quantity of 1
        });
        setCartItems(items);
      } else {
        setError('User not logged in');
      }

    };

    fetchCartItems();
  }, []);

  const handleRemoveFromCart = (index) => {
    const uid = localStorage.getItem('uid');

    if (uid) {
      const cart = JSON.parse(localStorage.getItem('cart')) || {};
      
      if (cart[uid]) {
        cart[uid].splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        setCartItems(cart[uid]);
      }
    }
  };

  const handleQuantityChange = (index, change) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity += change;

    // Ensure quantity doesn't go below 1
    if (updatedCartItems[index].quantity < 1) {
      updatedCartItems[index].quantity = 1;
    }

    setCartItems(updatedCartItems);

    // Update the cart in localStorage
    const uid = localStorage.getItem('uid');
    if (uid) {
      const cart = JSON.parse(localStorage.getItem('cart')) || {};
      cart[uid] = updatedCartItems;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  };

  if (error) {
    return <div className="text-center mt-5">{error}</div>;
  }

  if (cartItems.length === 0) {
    return <div className="text-center mt-5">Your cart is empty</div>;
  }

  const handlePlaceOrder = () => {
    alert('Order placed successfully!');
    // Logic for placing the order can be added here
  };

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
                  <strong>Original Price:</strong> <span className="original-price">₹{item.price}</span>
                </div>
                <div className="info-group">
                  <strong>Discount:</strong> <span className="discount-price">{item.discountvalue}%</span>
                </div>
                <div className="info-group">
                  <strong>Total:</strong> <span className="total-price">₹{item.total}</span>
                </div>
                <div className="cart-item-actions">
                  <Button variant="success" onClick={handlePlaceOrder} >
                    Place Order
                  </Button>
                  <Button variant="danger" onClick={() => handleRemoveFromCart(index)}>
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Cart;
