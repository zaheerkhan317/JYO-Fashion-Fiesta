import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { query, where, getFirestore, collection, getDocs, limit } from 'firebase/firestore';
import './BestSellingProducts.css'; // Import the CSS file for styling

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      setLoading(true);
      const db = getFirestore();
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('bestSelling', '==', true), limit(3));

      try {
        const querySnapshot = await getDocs(q);
        const bestSellingData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          itemName: doc.data().itemName,
          description: doc.data().description,
          photos: doc.data().photos,
          sizes: doc.data().sizes || [],
          colours: doc.data().colours || [],
        }));
        setProducts(bestSellingData);
      } catch (error) {
        console.error('Error fetching best-selling products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellingProducts();
  }, []); // Empty dependency array means this will run once on mount

  const getFirstImageUrl = photos => {
    if (!photos || typeof photos !== 'object') return 'placeholder.jpg';
    const colorKeys = Object.keys(photos);
    if (colorKeys.length > 0 && photos[colorKeys[0]].length > 0) {
      return photos[colorKeys[0]][0];
    }
    return 'placeholder.jpg';
  };

  const formatSizes = sizes => {
    if (!Array.isArray(sizes) || sizes.length === 0) return 'No sizes available';
    return sizes.join(', ');
  };

  const formatColours = colours => {
    if (!Array.isArray(colours) || colours.length === 0) return 'No colors available';
    if (colours.length === 1) return colours[0];
    return 'Multicolour';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-5 best-selling-container">
      <h2 className="text-center mb-4">Best Selling Products</h2>
      <Row className="g-3 justify-content-center">
        {products.length > 0 ? (
          products.map(product => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4 d-flex justify-content-center">
              <Card className="best-selling-card">
                <Card.Img variant="top" src={getFirstImageUrl(product.photos)} alt={product.itemName} />
                <Card.Body>
                  <Card.Title className="text-center mb-2">{product.itemName}</Card.Title>
                  <Card.Text className="text-center mb-1"><strong>Size:</strong> {formatSizes(product.sizes)}</Card.Text>
                  <Card.Text className="text-center mb-2"><strong>Colors:</strong> {formatColours(product.colours)}</Card.Text>
                  <Card.Footer className="text-center">
                    <Button variant="primary" className="w-100 button">View Product</Button>
                  </Card.Footer>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12} className="text-center">
            <p>No best-selling products found.</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default BestSellingProducts;
