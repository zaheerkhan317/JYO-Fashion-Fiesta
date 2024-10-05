import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, Badge, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { db } from '../../firebaseConfig'; // Adjust the import according to your file structure
import './OffersZone.css'; // Import custom CSS for additional styling

const OffersZone = () => {
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Stop loading after 2 seconds
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  useEffect(() => {
    const fetchOfferProducts = async () => {
      try {
        // Query Firestore to get products where isOffer is true
        const q = query(collection(db, 'products'), where('isOffer', '==', true));
        const querySnapshot = await getDocs(q);
        
        // Map the documents to the format you need
        const offers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Update state with the filtered products
        setOfferProducts(offers);
      } catch (error) {
        console.error("Error fetching offer products:", error);
      }
    };

    fetchOfferProducts();
  }, []);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`); // Navigate to the product detail page
  };

  return (
    <Container className="offers-zone-container mt-5 mb-5">
      <h2 className="text-center mb-5 category-title">Offers Zone</h2>
      {loading ? ( // Show spinner if loading
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
      <Row className="grid-container">
        {offerProducts.map(product => {
          // Determine badge text and variant based on product attributes
          let badgeText = '';
          let badgeVariant = '';
          if (product.topCollections) {
            badgeText = 'Top Collection';
            badgeVariant = 'info';
          } else if (product.bestSelling) {
            badgeText = 'Best Seller';
            badgeVariant = 'warning';
          } else if (product.newArrivals) {
            badgeText = 'New Arrivals';
            badgeVariant = 'success';
          }

          return (
            <Col key={product.id} md={4} sm={6} xs={12} className="mb-4">
              <Card className="product-card h-100 shadow position-relative" onClick={() => handleViewProduct(product.id)} style={{ cursor: 'pointer' }}>
                {/* Ribbons */}
                <div className="ribbon-wrapper">
                  {product.topCollections && (
                    <div className="ribbon top-collection">Top Collection</div>
                  )}
                  {product.bestSelling && (
                    <div className="ribbon best-seller">Best Seller</div>
                  )}
                  {product.newArrivals && (
                    <div className="ribbon new-arrivals">New Arrivals</div>
                  )}
                </div>

                {/* Product Image */}
                <div className="product-image-container">
                  <Card.Img
                    variant="top"
                    src={product.photos[Object.keys(product.photos)[0]] || 'default-image-url.jpg'}
                    alt={product.itemName}
                    className="product-img"
                    loading="lazy"
                  />
                </div>

                {/* Discount Badge */}
                {product.discountValue >0 && (
                  <Badge bg="success" className="discount-badge">
                    {product.discountValue}% Off
                  </Badge>
                )}

                <Card.Body className="d-flex flex-column">
                  {/* Product Title */}
                  <Card.Title>{product.itemName}</Card.Title>

                  {/* Product ID */}
                  <Card.Text className="text-muted description">
                    #{product.id}
                  </Card.Text>

                  {/* Product Description
                  <Card.Text className="text-muted description">
                    {product.description}
                  </Card.Text> */}

                  {/* Brand */}
                  <Card.Text className="text-muted">
                    <strong>Brand:</strong> {product.brand || 'N/A'}
                  </Card.Text>

                  {/* Colors */}
                  <Card.Text className="text-muted">
                    <strong>Colors:</strong> {product.colours.length ? product.colours.join(', ') : 'N/A'}
                  </Card.Text>

                  {/* Sizes Display */}
                  <Card.Text className="text-muted">
                    <strong>Sizes:</strong>
                    <div className="size-list">
                    {product.sizes && typeof product.sizes === 'object' ? (
                      // Define the correct size order
                      
                      ['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                        const isAvailable = product.sizes[size] > 0;
                        // For each size in the predefined order, get its quantity from the product.sizes object
                        return product.sizes.hasOwnProperty(size) ? (
                          <div key={size} className={`size-item ${!isAvailable ? 'disabled-size' : ''}`}>
                            <span>{size}</span>
                          </div>
                        ) : null
                        })
                    ) : (
                      <span>No sizes available</span> // Fallback message if sizes are not available
                    )}
                  </div>
                  </Card.Text>

                  {/* Quantity Left */}
                  {/* <Card.Text className="text-muted">
                    <strong>Quantity Left:</strong> {product.quantityLeft}
                  </Card.Text> */}

                  {/* Pricing Section */}
                  <Card.Text className="price-section mt-auto">
                    {product.discountedPrice ? (
                      <>
                        <span className="text-danger price">
                          ₹{product.discountedPrice}
                        </span>
                        <span className="text-muted ms-2 original-price">
                          <del>₹{product.cost}</del>
                        </span>
                      </>
                    ) : (
                      <strong>₹{product.cost}</strong>
                    )}
                  </Card.Text>

                  {/* Call to Action Button */}
                  {/* <Button variant="primary" className="mt-3" onClick={() => handleViewProduct(product.id)}>
                    View Product
                  </Button> */}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      )}
    </Container>
  );
};

export default OffersZone;
