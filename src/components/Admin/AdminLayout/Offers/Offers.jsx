import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import { db } from '../../../../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import './Offers.css'; // Import a CSS file for custom styling

const Offers = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(''); // Filter by type of product

  // Fetch all products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      const productCollection = collection(db, 'products');
      const productSnapshot = await getDocs(productCollection);
      const productList = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  // Handle the selection of offers
  const handleOfferSelection = (productId) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        product.isOffer = !product.isOffer; // Toggle the offer status
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  // Save changes to Firestore
  const handleSaveOffers = async () => {
    await Promise.all(products.map(async (product) => {
      if (product.isOffer !== undefined) {
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, {
          isOffer: product.isOffer,
        });
      }
    }));
    alert('Offers Updated!');
  };

  // Filter products based on search term and selected type
  const filteredProducts = products.filter((product) => {
    const matchesSearchTerm =
      product.id.includes(searchTerm) ||
      product.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType ? product.type === selectedType : true;

    return matchesSearchTerm && matchesType;
  });

  return (
    <div className="offers-container">
      <h1 className="mb-4 text-center">Manage Offers</h1>

      <div className="d-flex justify-content-center mb-4">
        <Form className="mb-3 d-flex align-items-center justify-content-between compact-form" style={{ maxWidth: '600px', width: '100%' }}>
          <Form.Control
            type="text"
            placeholder="Search by ID, Name, or Brand"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="me-2 form-control form-control-sm"
            style={{ width: '250px' }} // Set the width to be smaller
          />

          <Form.Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="me-2 form-select form-select-sm"
            style={{ width: '250px' }} // Set the width to be smaller
          >
            <option value="">All Types</option>
            <option value="Kurtas">Kurtas</option>
            <option value="Sarees">Sarees</option>
            <option value="Lounge wear">Lounge wear</option>
          </Form.Select>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
            }}
            className="clear-filters-btn"
            style={{ width: '80px' }} // Set the button width smaller
          >
            Clear
          </Button>
        </Form>
      </div>

      <Row>
        {filteredProducts.map((product) => (
          <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className="product-card shadow-sm">
              <Card.Img
                variant="top"
                src={product.photos[Object.keys(product.photos)[0]] || 'default-image-url.jpg'}
                alt={product.itemName}
                className="product-img"
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="product-title">{product.itemName}</Card.Title>

                {/* Product ID */}
                <Card.Text className="text-muted description">#{product.id}</Card.Text>

                {/* Product Description */}
                <Card.Text className="text-muted description">{product.description}</Card.Text>

                {/* Brand */}
                <Card.Text className="text-muted">
                  <strong>Brand:</strong> {product.brand}
                </Card.Text>

                {/* Colors */}
                <Card.Text className="text-muted">
                  <strong>Colors:</strong>{' '}
                  {product.colours.length === 1 ? <span>{product.colours[0]}</span> : 'Multi Color'}
                </Card.Text>

                {/* Sizes Display */}
                <Card.Text className="text-muted">
                  <strong>Sizes:</strong>
                  <div className="size-list">
                    {product.sizes && typeof product.sizes === 'object' ? (
                      ['S', 'M', 'L', 'XL', 'XXL'].map((size) =>
                        product.sizes.hasOwnProperty(size) ? (
                          <div key={size} className="size-item">{size}</div>
                        ) : null
                      )
                    ) : (
                      <span>No sizes available</span>
                    )}
                  </div>
                </Card.Text>

                {/* Quantity Left */}
                <Card.Text className="text-muted">
                  <strong>Quantity Left:</strong> {product.quantityLeft}
                </Card.Text>

                {/* Pricing Section */}
                <Card.Text className="price-section mt-auto d-flex justify-content-center">
                  {product.discountedPrice ? (
                    <>
                      <span className="text-danger price">₹{product.discountedPrice}</span>
                      <span className="text-muted ms-2 original-price">
                        <del>₹{product.cost}</del>
                      </span>
                    </>
                  ) : (
                    <strong>₹{product.cost}</strong>
                  )}
                </Card.Text>

                {/* Offer Checkbox */}
                <Form.Check
                  type="checkbox"
                  label="Add to Offer"
                  checked={product.isOffer || false}
                  onChange={() => handleOfferSelection(product.id)}
                  className="mt-3"
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Save Button */}
      <div className="text-center">
        <Button variant="primary" className="mt-4" onClick={handleSaveOffers}>
          Save Offers
        </Button>
      </div>
    </div>
  );
};

export default Offers;
