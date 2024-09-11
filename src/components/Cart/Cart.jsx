import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import './Cart.css'; // Import custom CSS if needed

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCartItems = () => {
      // Retrieve the user's first name
      const uid = localStorage.getItem('uid');

      if (uid) {
        // Retrieve cart items from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const items = cart[uid] || [];
        setCartItems(items);
      } else {
        setError('User not logged in');
      }
    };

    fetchCartItems();
  }, []);

  if (error) {
    return <div className="text-center mt-5">{error}</div>;
  }

  if (cartItems.length === 0) {
    return <div className="text-center mt-5">Your cart is empty</div>;
  }

  return (
    <Container className="cart-section mt-5">
      <Row className="justify-content-center">
        {cartItems.map((item, index) => (
          <Col key={index} md={4} className="mb-4">
            <div className="cart-item">
              <Image src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-info">
                <h4 className="cart-item-name">{item.name}</h4>
                <p><strong>Size:</strong> {item.size}</p>
                <p><strong>Color:</strong> {item.color}</p>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Price:</strong> ₹{item.price}</p>
              </div>
              <Button variant="danger" onClick={() => handleRemoveFromCart(index)}>Remove</Button>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

// Optional: Function to handle removing items from the cart
const handleRemoveFromCart = (index) => {
  // Logic to remove item from cart
};

export default Cart;
