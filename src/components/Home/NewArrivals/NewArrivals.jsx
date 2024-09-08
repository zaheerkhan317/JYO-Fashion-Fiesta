import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { query, where, getFirestore, collection, getDocs, limit } from 'firebase/firestore';
import './NewArrivals.css';

const NewArrivals = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNewArrivals = async () => {
      setLoading(true);
      const db = getFirestore();
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('newArrivals', '==', true), limit(3));
      
      try {
        const querySnapshot = await getDocs(q);
        const newArrivalsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            itemName: doc.data().itemName,
            description: doc.data().description,
            photos: doc.data().photos,
            sizes: doc.data().sizes,
            colours: doc.data().colours,
        }));
        setNewArrivals(newArrivalsData);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Function to get the first image URL from the photos map
  const getFirstImageUrl = (photos) => {
    if (!photos || typeof photos !== 'object') return 'placeholder.jpg';
    const colorKeys = Object.keys(photos);
    if (colorKeys.length > 0 && photos[colorKeys[0]].length > 0) {
      return photos[colorKeys[0]][0]; // First image of the first color
    }
    return 'placeholder.jpg';
  };

  // Function to format sizes array
  const formatSizes = (sizes) => {
    if (!sizes || sizes.length === 0) return 'No sizes available';
    return sizes.join(', ');
  };

  // Function to format colours array
  const formatColours = (colours) => {
    if (!colours || colours.length === 0) return 'No colours available';
    return colours.length === 1 ? colours[0] : 'Multicolour';
  };

  if (loading) {
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  }

  return (
    <div className="new-arrivals-container">
      <h2 className="text-center mb-4">New Arrivals</h2>
      <Row className="g-3 justify-content-center">
        {newArrivals.length > 0 ? (
          newArrivals.map((item) => (
            <Col key={item.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="new-arrival-card">
                <Card.Img variant="top" src={getFirstImageUrl(item.photos)} alt={item.itemName} />
                <Card.Body>
                  <Card.Title>{item.itemName}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  <Card.Text>Sizes: {formatSizes(item.sizes)}</Card.Text>
                  <Card.Text>Colours: {formatColours(item.colours)}</Card.Text>
                  <Button variant="primary">View Details</Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <p className="text-center">No new arrivals found.</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default NewArrivals;
