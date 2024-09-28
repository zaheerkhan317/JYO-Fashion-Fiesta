import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import '../Categories.css'; // Ensure the custom CSS is applied here

const Sarees = ({ products }) => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleAddToCart = (productId) => {
    navigate(`/product/${productId}`); // Navigate to the product detail page
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Stop loading after 2 seconds
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  const filteredProducts = products.filter(product => product.isOffer === false);
  
  return (
    <Container className="category-section mt-5">
      <h2 className="text-center mb-5 category-title">Sarees Collection</h2>
      {loading ? ( // Show spinner if loading
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
      <Row className="grid-container">
        {filteredProducts.map(product => (
          <Col key={product.id} md={4} sm={6} xs={12} className="mb-4">
            <Card className="product-card h-100 shadow position-relative">
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
                  src={product.photos[Object.keys(product.photos)[0]][0]}
                  alt={product.itemName}
                  className="product-img"
                />
                
              </div>

              {/* Discount Badge */}
              {product.discountValue && (
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
                  <strong>Brand: </strong>
                  {product.brand}
                </Card.Text>

                {/* Colors */}
                <Card.Text className="text-muted">
                  <strong>Colors: </strong>
                  {product.colours.length === 1 ? (
                    <span>{product.colours[0]}</span>
                  ) : (
                    'Multi Color'
                  )}
                </Card.Text>

        
                <Card.Text className="text-muted">
                  <strong>Sizes:</strong>
                  <div className="size-list">
                    {product.sizes && typeof product.sizes === 'object' ? (
                      // Define the correct size order
                      ['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        // For each size in the predefined order, get its quantity from the product.sizes object
                        product.sizes.hasOwnProperty(size) ? (
                          <div key={size} className="size-item">
                            <span>{size}</span>
                          </div>
                        ) : null
                      ))
                    ) : (
                      <span>No sizes available</span> // Fallback message if sizes are not available
                    )}
                  </div>
                </Card.Text>




                {/* Quantity Left */}
                <Card.Text className="text-muted">
                  <strong>Quantity Left: </strong>
                  {product.quantityLeft}
                </Card.Text>

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
                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={() => handleAddToCart(product.id)}
                >
                  View Product
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      )}
    </Container>
  );
};

export default Sarees;
