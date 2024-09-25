import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      <Container>
        {/* Header Section */}
        <Row className="header-section text-center">
          <Col>
            <h1 className="display-4 mb-3">About Us</h1>
            <p className="lead">Driven by passion. Built with purpose.</p>
          </Col>
        </Row>

        {/* Introduction Section */}
        <Row className="introduction-section mb-5">
          <Col md={6}>
            <h2 className="text-gold mb-4">Who We Are</h2>
            <p>
              At <strong>[Your Company Name]</strong>, we are dedicated to
              creating high-quality, stylish products for our customers.
              With a focus on innovation and excellence, our goal is to provide
              you with the best shopping experience.
            </p>
            <p>
              From fashion trends to timeless designs, we believe in combining quality
              and aesthetics, ensuring every customer feels confident in our offerings.
            </p>
            <Button variant="outline-gold" className="learn-more-btn mb-4">Learn More</Button>
          </Col>
          <Col md={6}>
            <img
              src="https://via.placeholder.com/600x400" // Replace with actual image
              alt="About Us"
              className="img-fluid rounded"
            />
          </Col>
        </Row>

        {/* Mission Statement */}
        <Row className="mission-section py-5">
          <Col md={6}>
            <img
              src="https://via.placeholder.com/500x350" // Replace with actual image
              alt="Our Mission"
              className="img-fluid rounded mb-4"
            />
          </Col>
          <Col md={6} className="d-flex align-items-center">
            <div>
              <h2 className="text-gold mb-4">Our Mission</h2>
              <p>
                We aim to inspire and delight our customers by offering top-quality products
                that are ethically sourced, sustainable, and affordable. At <strong>[Your Company Name]</strong>,
                customer satisfaction is at the heart of everything we do.
              </p>
              <p>
                Our mission is to lead the market by embracing new trends, fostering innovation,
                and delivering excellence with every product.
              </p>
            </div>
          </Col>
        </Row>

        {/* Our Team Section */}
        <Row className="team-section text-center py-5">
          <Row>
            <h2 className="text-gold mb-4">Meet Our Team</h2>
          </Row>
          {['John Doe', 'Jane Smith', 'Michael Johnson'].map((name, idx) => (
            <Col md={4} key={idx} className="mb-4">
              <Card className="team-card text-light">
                <Card.Img
                  variant="top"
                  src={`https://via.placeholder.com/300x300`} // Replace with actual image URLs
                  alt={name}
                  className="rounded-circle team-img"
                />
                <Card.Body>
                  <Card.Title>{name}</Card.Title>
                  <Card.Text>{idx === 0 ? 'CEO & Founder' : idx === 1 ? 'Head of Development' : 'Marketing Manager'}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* What We Do Section */}
        <Row className="what-we-do-section py-5 text-center">
          <Col>
            <h2 className="text-gold mb-4">What We Do</h2>
            <p className="lead mb-5">
              At <strong>[Your Company Name]</strong>, we specialize in providing high-quality fashion products,
               including Kurtas, Sarees, Lounge Wear, and much more. Our dedicated team works tirelessly to ensure 
               that every product meets our rigorous standards of quality and style.
            </p>
            <Button variant="outline-gold" className='learn-more-btn' size="lg">Explore Our Products</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutUs;
