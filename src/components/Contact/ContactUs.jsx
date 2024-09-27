import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './ContactUs.css'; // Ensure this CSS file is created for styles

const ContactUs = () => {
  return (
    <div className="contact-us-container">
      <Container>
        <Row className="text-center mb-5">
          <Col>
            <h1 className="display-4 mb-3 contact-us-title">Contact Us</h1>
            <p className="contact-us-lead">We'd love to hear from you!</p>
          </Col>
        </Row>

        {/* Contact Information */}
        <Row className="contact-info-section mb-5">
          <Col md={6} className="contact-info mb-4">
            <h2 className="contact-info-title">Get in Touch</h2>
            <p>If you have any questions or feedback, please reach out to us:</p>
            <ul className="contact-info-list list-unstyled">
              <li>
                <FaEnvelope className="contact-icon" /> <strong>Email:</strong> support@fashionfiesta.com
              </li>
              <li>
                <FaPhone className="contact-icon" /> <strong>Phone:</strong> (+91) 9989660937
              </li>
              <li>
  <div className="d-flex align-items-start">
    <FaMapMarkerAlt className="contact-icon me-2" /> {/* Added margin end for spacing */}
    <div>
      <strong>Address: </strong>
      12-6-1, Plot No:42, Lakshmi Ganapati Colony Line 3, Phool Bagh, Vizianagaram, 535002.
    </div>
  </div>
</li>



            </ul>
          </Col>

          <Col md={6} className="contact-form-section">
            <h2 className="contact-form-title">Send Us a Message</h2>
            <Form>
              <Form.Group controlId="formName" className="form-group mb-4">
                <Form.Label className="contact-form-label">Name</Form.Label>
                <Form.Control type="text" placeholder="Enter your name" required className="contact-input-field" />
              </Form.Group>

              <Form.Group controlId="formEmail" className="form-group mb-4">
                <Form.Label className="contact-form-label">Email</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" required className="contact-input-field" />
              </Form.Group>

              <Form.Group controlId="formMessage" className="form-group mb-4">
                <Form.Label className="contact-form-label">Message</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Your message" required className="contact-input-field" />
              </Form.Group>

              <Button variant="gold" type="submit" className="contact-submit-button mt-3">
                Send Message
              </Button>
            </Form>
          </Col>
        </Row>

        {/* Google Maps Integration */}
        <Row className="map-section mb-5">
          <Col>
            <h2 className="map-title">Find Us Here</h2>
            <div className="map-container">
              {/* Replace with your actual Google Maps Embed link */}
             
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3791.795574940821!2d83.41915697518219!3d18.12722908289165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTjCsDA3JzM4LjAiTiA4M8KwMjUnMTguMiJF!5e0!3m2!1sen!2sin!4v1727461020066!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactUs;
