import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

const reviews = [
  {
    id: 1,
    name: 'Alice Johnson',
    review: 'Great experience! The product quality is amazing and the customer service is top-notch.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Bob Smith',
    review: 'I am very satisfied with my purchase. The delivery was on time, and the product met all my expectations.',
    rating: 4,
  },
  {
    id: 3,
    name: 'Charlie Davis',
    review: 'The product is good, but the packaging could be improved. Overall, I am happy with the purchase.',
    rating: 2.5,
  },
  {
    id: 4,
    name: 'Diana Clark',
    review: 'Excellent quality and fast shipping! Will definitely buy again.',
    rating: 5,
  },
];

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

const ReviewCard = ({ name, review, rating }) => {
  
    // Create the star rating display
    const stars = generateStars(rating);
  
    return (
      <Card className="mb-4 text-center">
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Text>{review}</Card.Text>
          <Card.Footer>
            {stars.map((star, index) => (
              <span key={index} className="text-warning">{star}</span>
            ))}
          </Card.Footer>
        </Card.Body>
      </Card>
    );
  };

const Reviews = () => (
  <Container>
    <h2 className="my-4 text-center">User Reviews</h2>
    <Row>
      {reviews.map((review) => (
        <Col md={6} lg={4} key={review.id} className="d-flex align-items-stretch">
          <ReviewCard
            className="card h-100"
            name={review.name}
            review={review.review}
            rating={review.rating}
          />
        </Col>
      ))}
    </Row>
  </Container>
);

export default Reviews;
