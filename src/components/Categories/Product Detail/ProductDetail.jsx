import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Modal } from 'react-bootstrap';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ProductDetail.css'; // Import the custom CSS

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(''); // New state for selected color
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const db = getFirestore();
      const productRef = doc(db, 'products', productId);
      
      try {
        const productDoc = await getDoc(productRef);
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProduct({ id: productDoc.id, ...productData });
          
          // Set the default color and its photos
          const defaultColor = Object.keys(productData.photos)[0];
          setSelectedColor(defaultColor);
          setSelectedImage(productData.photos[defaultColor][0]); // Set initial image
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Error fetching product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setSelectedImage(product.photos[color][0]); // Set the first image of the selected color
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    // Retrieve the user's first name from localStorage
    const uid = localStorage.getItem('uid');
    console.log(uid);
    if (uid) {
      // Get the existing cart from localStorage or initialize it
      const cart = JSON.parse(localStorage.getItem('cart')) || {};
      
      // Ensure there's a cart for this user
      if (!cart[uid]) {
        cart[uid] = [];
      }

      
      // Add the selected product to the user's cart
      cart[uid].push({
        id: product.id,
        name: product.itemName,
        description: product.description,
        brand: product.brand,
        size: selectedSize,
        color: selectedColor,
        image: selectedImage,
        isOffer: product.isOffer,
        discountvalue: product.discountValue,
        price: product.cost,
        total: (product.cost - (product.cost * (product.discountValue / 100))).toFixed(2),
        quantity: 1 // Set initial quantity
      });

      // Save the updated cart back to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
       // Update cart count in localStorage
      const totalItems = cart[uid].length;
      localStorage.setItem('cartCount', totalItems.length > 0 ? totalItems.length : 0);

      setShowModal(true);

      setTimeout(() => {
        navigate('/cart', { replace: true }); // Navigate to /cart
        window.location.reload(); // Force the page to refresh
      }, 1000); // Delay navigation slightly to show the modal briefly
    } else {
      alert('User not logged in');
    }
  };

  const handleCloseModal = () => setShowModal(false);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-5">{error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-5">Product not found</div>;
  }

  return (
    <Container className="product-detail-section mt-5">
      <Row className="justify-content-center">
        {/* Image Column */}
        <Col md={2}>
          <div className="image-column">
            {product.photos[selectedColor].map((photo, index) => (
              <Image
                key={index}
                src={photo}
                thumbnail
                className={`product-thumbnail ${photo === selectedImage ? 'selected-thumbnail' : ''}`}
                onClick={() => handleImageClick(photo)}
              />
            ))}
          </div>
        </Col>

        {/* Selected Image */}
        <Col md={5}>
          <div className="product-main-image-container">
            <Image src={selectedImage} alt={product.itemName} className="product-main-image" />
          </div>
        </Col>

        {/* Product Details */}
        <Col md={5}>
          <div className="product-detail-info">
            <h2 className="product-title">{product.itemName}</h2>
            <p className="product-description">{product.description}</p>
            <p className="product-brand"><strong>Brand : </strong> {product.brand}</p>
            <p className="product-id"><strong>Product ID : </strong> {product.id}</p>
            <p className="product-price">
              {product.discountValue ? (
                <>
                  <span className="discounted-price">₹{(product.cost - (product.cost * (product.discountValue / 100))).toFixed(2)}</span>
                  <span className="original-price">₹{product.cost}</span>
                </>
              ) : (
                <span>₹{product.cost}</span>
              )}
            </p>
            <p><strong>Discount : </strong> {product.discountValue ? `${product.discountValue}%` : 'No discount available'}</p>

            <div className="product-attributes">
              {/* Size Selection */}
                <div className="size-selection">
                  <strong>Sizes:</strong>
                  <div className="size-options">
                    {Array.isArray(product.sizes) ? (
                      product.sizes
                        .sort((a, b) => ["S", "M", "L", "XL", "XXL"].indexOf(a) - ["S", "M", "L", "XL", "XXL"].indexOf(b))
                        .map((size, index) => (
                          <div
                            key={index}
                            className={`size-box ${size === selectedSize ? 'selected-size' : ''}`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </div>
                        ))
                    ) : (
                      Object.keys(product.sizes)
                        .sort((a, b) => ["S", "M", "L", "XL", "XXL"].indexOf(a) - ["S", "M", "L", "XL", "XXL"].indexOf(b))
                        .map((size, index) => (
                          <div
                            key={index}
                            className={`size-box ${size === selectedSize ? 'selected-size' : ''}`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </div>
                        ))
                    )}
                  </div>
                </div>



              {/* Color Selection */}
              <div className="color-selection mb-3">
                <strong>Available Colors : </strong>
                <div className="color-options">
                  {product.colours.map((color, index) => (
                    <div
                      key={index}
                      className={`color-box ${color === selectedColor ? 'selected-color' : ''}`}
                      style={{ backgroundColor: color }} // Dynamically set the background color
                      title={color} // Tooltip to show color name on hover
                      onClick={() => handleColorClick(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p><strong>Quantity Left : </strong> {product.quantityLeft}</p>
            <Button variant="primary" onClick={handleAddToCart}>Add to Cart</Button>
          </div>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Item Added to Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>Your item has been added to the cart successfully!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductDetail;
