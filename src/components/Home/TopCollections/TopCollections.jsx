import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { query, where, getFirestore, collection, getDocs, limit } from 'firebase/firestore';

const TopCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTopCollections = async () => {
      setLoading(true);
      const db = getFirestore();
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('topCollections', '==', true),limit(10));
      console.log(collection.photos);
      try {
        const querySnapshot = await getDocs(q);
        const topCollectionsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            itemName: doc.data().itemName,
            description: doc.data().description,
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


    

  if (loading) {
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Top Collections</h2>
      <Row>
      {collections.length > 0 ? (
          collections.map((collection) => (
            <Col key={collection.id} xs={12} md={4} className="mb-4">
              <Card className="h-100">
                <Card.Img variant="top" src={getFirstImageUrl(collection.photos)} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{collection.itemName}</Card.Title>
                  <Card.Text>{collection.description}</Card.Text>
                  <Button variant="primary" className="mt-auto">View Collection</Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center">No top collections found.</p>
        )}
      </Row>
    </div>
  );
};

export default TopCollections;
