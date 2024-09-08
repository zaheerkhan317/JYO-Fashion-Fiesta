import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { query, where, getFirestore, collection, getDocs, limit } from 'firebase/firestore';
import './TopCollections.css';

const TopCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTopCollections = async () => {
      setLoading(true);
      const db = getFirestore();
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('topCollections', '==', true),limit(3));
      
      try {
        const querySnapshot = await getDocs(q);
        const topCollectionsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            itemName: doc.data().itemName,
            description: doc.data().description,
            brand: doc.data().brand,
            colours: doc.data().colours,
            sizes: doc.data().sizes,
            photos: doc.data().photos,
        }));
        setCollections(topCollectionsData);
      } catch (error) {
        console.error('Error fetching top collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCollections();
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


     // Function to format sizes array into a string
  const formatSizes = sizes => {
    if (!Array.isArray(sizes) || sizes.length === 0) return 'No sizes available';
    return sizes.join(', ');
  };

  // Function to format colours array into a string
  const formatColours = colours => {
    if (!Array.isArray(colours) || colours.length === 0) return 'No colors available';
    if (colours.length === 1) return colours[0];
    return 'Multicolour';
  };

  if (loading) {
    return  (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" />
    </div>
    );
  }

  return (
    <div className="container mt-5 top-collections-container">
      <h2 className="text-center mb-4">Top Collections</h2>
      <Row className="g-3 justify-content-center">
        {collections.length > 0 ? (
          collections.map(collection => (
            <Col key={collection.id} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
              <Card className="top-collection-card">
                <Card.Img variant="top" src={getFirstImageUrl(collection.photos)} alt={collection.itemName} />
                <Card.Body className="d-flex flex-column p-3">
                  <Card.Title className="text-center mb-2">{collection.itemName}</Card.Title>
                  <Card.Text className="text-center mb-1"><strong>Size:</strong> {formatSizes(collection.sizes)}</Card.Text>
                  <Card.Text className="text-center mb-2"><strong>Colors:</strong> {formatColours(collection.colours)}</Card.Text>
                  <Button variant="primary" className="w-100 button">View Collection</Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12} className="text-center">
            <p>No top collections found.</p>
          </Col>
        )}
      </Row>
    </div>


    

    

  );
};

export default TopCollections;
