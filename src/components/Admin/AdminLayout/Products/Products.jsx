import React, { useState } from 'react';
import { Form, Button, Col, Row, Container } from 'react-bootstrap';

const Products = () => {
  const [formData, setFormData] = useState({
    brand: '',
    itemName: '',
    type: '',
    description: '',
    discount: '',
    remove: '',
    cost: '',
    size: '',
    colours: '',
    photos: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhotoChange = (e) => {
    setFormData({
      ...formData,
      photos: Array.from(e.target.files)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <Container>
      <h1 className="mb-4">Add Product</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} controlId="formBrand">
          <Form.Label column sm={2}>Brand</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              placeholder="Enter brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="formItemName">
          <Form.Label column sm={2}>Item Name</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              placeholder="Enter item name"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="formType">
          <Form.Label column sm={2}>Type</Form.Label>
          <Col sm={10}>
            <Form.Control
              as="select"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="">Select type</option>
              <option value="Kurtas">Kurtas</option>
              <option value="Sarees">Sarees</option>
              <option value="Lounge wear">Lounge wear</option>
            </Form.Control>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="formDescription">
          <Form.Label column sm={2}>Description</Form.Label>
          <Col sm={10}>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="formDiscountRemove">
          <Form.Label column sm={2}>Discount/Remove</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              placeholder="Enter discount or removal info"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="formCost">
          <Form.Label column sm={2}>Cost</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="number"
              placeholder="Enter cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="formSize">
          <Form.Label column sm={2}>Size</Form.Label>
          <Col sm={10}>
            <Form.Control
              as="select"
              name="size"
              value={formData.size}
              onChange={handleChange}
            >
              <option value="">Select size</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </Form.Control>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="formColours">
          <Form.Label column sm={2}>Colours</Form.Label>
          <Col sm={10}>
            <Form.Control
              as="select"
              name="colours"
              value={formData.colours}
              onChange={handleChange}
            >
              <option value="">Select colour</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Black">Black</option>
            </Form.Control>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="formPhotos">
          <Form.Label column sm={2}>Photos</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="file"
              multiple
              name="photos"
              onChange={handlePhotoChange}
            />
          </Col>
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default Products;
