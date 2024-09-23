import React, { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig'; // Adjust the path according to your project structure
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, Container, Row, Col } from 'react-bootstrap';
import logo1  from '../../../img/logo1.png';
import './Reviews.css'

const ReviewCard = ({ name, review, rating, productid, time }) => {
  const generateStars = (rating) => {
    const stars = [];
    const fullStar = <i className="fas fa-star"></i>;
    const halfStar = <i className="fas fa-star-half-alt"></i>;
    const emptyStar = <i className="far fa-star"></i>;

    for (let i = 0; i < 5; i++) {
      if (rating >= i + 1) {
        stars.push(fullStar);
      } else if (rating > i && rating < i + 1) {
        stars.push(halfStar);
      } else {
        stars.push(emptyStar);
      }
    }
    return stars;
  };

  const stars = generateStars(rating);
  const formattedDate = time.split(',')[0];

  return (
    <Card className="text-center d-flex flex-column justify-content-between border-light position-relative" style={{ overflow: 'visible' }}>
      {/* Image at the top, partially outside the card */}
      <Card.Img 
        variant="top" 
        src={logo1} 
        alt={`Image of ${name}`} 
        style={{ 
          position: 'absolute', 
          top: '-30px', // Adjust based on how much you want it to overlap
          left: '50%', 
          transform: 'translateX(-50%)', 
          height: '64px', // Adjust the size as needed
          width: '64px', 
          borderRadius: '50%', // Optional: makes it circular
          border: '2px solid white', // Optional: adds a white border
        }} 
      />

      <Card.Body style={{ paddingTop: '40px' }}> {/* Add padding to prevent text overlap */}
        <Card.Title className="fw-bold">{name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Product ID: <span>{productid}</span>
        </Card.Subtitle>
        <Card.Text className="text-center">{review}</Card.Text>
        <Card.Text className="text-muted"><small>Submitted on: {formattedDate}</small></Card.Text>
        
        <div className="d-flex justify-content-center mt-2">
          {stars.map((star, index) => (
            <span key={index} className="text-warning fs-5">{star}</span>
          ))}
        </div>
      </Card.Body>
    </Card>

  );
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // To store user information

  useEffect(() => {
    const fetchReviews = async () => {
      const reviewsCollection = collection(db, 'reviews');
      const q = query(reviewsCollection, where('isVisible', '==', true)); // Only fetch visible reviews
      const reviewsSnapshot = await getDocs(q);
      const reviewsList = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch users to map userId to names
      const usersCollection = collection(db, 'users'); // Adjust according to your Firestore structure
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

      // Create a map of userId to user names
      const tempUsersMap = {};
      usersList.forEach(user => {
        tempUsersMap[user.uid] = `${user.firstName} ${user.lastName}`; // Adjust based on your user data structure
      });

      setUsersMap(tempUsersMap); // Store the user mapping

      // Map reviews to include user names
      const updatedReviews = reviewsList.map(review => ({
        ...review,
        name: tempUsersMap[review.userId] || 'Unknown User', // Set name based on userId
      }));

      setReviews(updatedReviews); // Update the reviews state
    };

    fetchReviews();
  }, []);

  return (
    <Container>
      <h2 className="my-5 text-center mb-5">User Reviews</h2>
      <Row className="pt-4">
        {reviews.map((review) => (
          <Col md={6} lg={4} key={review.id} className="d-flex align-items-stretch mb-5">
            <ReviewCard
              name={review.name}
              productid={review.productId}
              review={review.comment}
              rating={review.rating}
              time={review.timestamp}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Reviews;
