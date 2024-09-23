import React, { useEffect, useState } from 'react';
import { db } from '../../../../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { FaStar } from 'react-icons/fa';
import { Card, Col, Container, Row, Form } from 'react-bootstrap';
import './Reviews.css'; // Optional: Create a separate CSS file for custom styles

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [userMap, setUserMap] = useState({}); // Store users in a mapping

  // Fetch reviews and corresponding users from Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      const reviewsCollection = collection(db, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsCollection);
      const reviewsList = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsList);

      // Fetch users only for those userIds present in reviews
      const usersCollection = collection(db, 'users'); // Assuming your users collection is named 'users'
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

      // Create a map of userId to firstName for those matching userIds
      const usersMap = {};
      usersList.forEach(user => {
        reviewsList.forEach(review => {
          if (review.userId === user.uid) { // Check if userId matches uid
            usersMap[review.userId] = user.firstName +" "+ user.lastName; // Map userId to firstName
          }
        });
      });

      setUserMap(usersMap); // Store the mapping
    };

    fetchReviews();
  }, []);

  // Handle toggle for changing the visibility of the review on the user page
  const handleToggleVisibility = async (reviewId, isVisible) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, { isVisible });
      setReviews(prevReviews =>
        prevReviews.map(review => (review.id === reviewId ? { ...review, isVisible } : review))
      );
    } catch (error) {
      console.error('Error updating review visibility:', error);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">User Reviews</h1>
      <Row className="justify-content-center align-items-center text-center g-4">
        {reviews.map((review) => (
          <Col key={review.id} md={6} lg={4}>
            <Card className="shadow-sm border-light">
              <Card.Body>
                <Card.Title className="fw-bold">Order ID: {review.orderId}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Product ID: {review.productId}</Card.Subtitle>
                <Card.Text>{review.comment}</Card.Text>
                <div className="d-flex justify-content-center align-items-center mb-3">
                  {/* Display star rating */}
                  {[1, 2, 3, 4, 5].map(star => (
                    <FaStar
                      key={star}
                      color={star <= review.rating ? '#FFD700' : '#ccc'}
                      size={20}
                    />
                  ))}
                </div>
                <Card.Text className="text-muted mb-2">
                  <small>Submitted by: {userMap[review.userId] || 'Unknown User'}</small>
                </Card.Text>
                <Card.Text className="text-muted mb-2">
                  <small>Submitted on: {review.timestamp}</small>
                </Card.Text>
                
                {/* Toggle switch for 'isVisible' */}
                <Form.Check 
                    type="switch"
                    id={`switch-${review.id}`}
                    label={
                        <span style={{ marginLeft: '1rem' }}>
                        {review.isVisible ? 'Visible on User Page' : 'Hidden from User Page'}
                        </span>
                    }
                    checked={review.isVisible}
                    onChange={() => handleToggleVisibility(review.id, !review.isVisible)}
                    className="d-flex justify-content-center align-items-center mt-3"
                    style={{ marginRight: '1rem' }} // Optional right margin for toggle switch
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Reviews;
