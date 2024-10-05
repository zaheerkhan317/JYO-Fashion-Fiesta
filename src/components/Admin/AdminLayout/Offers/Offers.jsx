import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Button, Container, Alert } from 'react-bootstrap';
import { db } from '../../../../firebaseConfig';
import { collection, getDocs, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import './Offers.css';

const Offers = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [festivalName, setFestivalName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [festivalOffers, setFestivalOffers] = useState(null);
  const [multiOffers, setMultiOffers] = useState(null);

  const [numItems, setNumItems] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [multiItemOffers, setMultiItemOffers] = useState(null);

    // State for temporary success/error messages
    const [festivalMessage, setFestivalMessage] = useState(null);
    const [multiItemMessage, setMultiItemMessage] = useState(null);

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

    const fetchFestivalOffers = async () => {
      const festivalOffersRef = doc(db, 'FestivalOffers', 'current');
      const festivalOffersDoc = await getDoc(festivalOffersRef);
      if (festivalOffersDoc.exists()) {
        setFestivalOffers(festivalOffersDoc.data());
      } else {
        setFestivalOffers(null);
      }
    };

    const fetchMultiOffers = async () => {
      const multiOffersRef = doc(db, 'FestivalOffers', 'multioffers');
      const multiOffersDoc = await getDoc(multiOffersRef);
      if (multiOffersDoc.exists()) {
        setMultiOffers(multiOffersDoc.data());
      } else {
        setMultiOffers(null);
      }
    };

    fetchProducts();
    fetchFestivalOffers();
    fetchMultiOffers();
  }, []);

    // Function to display a temporary message
    const displayMessage = (setter, message) => {
      setter(message);
      setTimeout(() => {
        setter(null);
      }, 2000); // Show message for 2 seconds
    };

  const handleOfferToggle = async (productId, currentIsOffer) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { isOffer: !currentIsOffer });

      // Update local state for the toggled product
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, isOffer: !currentIsOffer } : product
        )
      );
    } catch (error) {
      console.error('Error updating offer status:', error);
    }
  };

  const handleSaveFestivalOffers = async () => {
    const festivalOffersRef = doc(db, 'FestivalOffers', 'current');
    await setDoc(festivalOffersRef, {
      festivalName,
      couponCode,
      discountPercentage: parseFloat(discountPercentage),
    });
    displayMessage(setFestivalMessage, 'Festival offers saved successfully!');
      // Clear the input fields
    setFestivalName('');
    setCouponCode('');
    setDiscountPercentage('');

  };

  const handleSaveMultiItemOffers = async () => {
    const multiOffersRef = doc(db, 'FestivalOffers', 'multioffers');
    await setDoc(multiOffersRef, {
      numItems,
      totalValue,
      offerPrice,
    });
    displayMessage(setMultiItemMessage, 'Multi-item offers saved successfully!');
    // Clear the input fields
    setNumItems('');
    setTotalValue('');
    setOfferPrice('');
  };

  const handleRemoveFestivalOffer = async () => {
    const festivalOffersRef = doc(db, 'FestivalOffers', 'current');
    await setDoc(festivalOffersRef, {
      numItems: '',
      totalValue: '',
      offerPrice: 0,
    });
    setFestivalOffers(null);
    displayMessage(setFestivalMessage, 'Festival offer removed successfully!');
  };


  const handleRemoveMultiOffer = async () => {
    const multiOffersRef = doc(db, 'FestivalOffers', 'multioffers');
    await setDoc(multiOffersRef, {
      festivalName: '',
      couponCode: '',
      discountPercentage: 0,
    });
    setFestivalOffers(null);
    displayMessage(setMultiItemMessage, 'Multi-item offer removed successfully!');
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearchTerm =
      product.id.includes(searchTerm) ||
      product.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? product.type === selectedType : true;
    return matchesSearchTerm && matchesType;
  });

  return (
    <Container fluid className="py-4">
      {/* Festival Offer Banner */}
      <Row className="mb-4">
        <Col xs={12}>
          {festivalOffers && Object.keys(festivalOffers).length > 0 && (
            <div className="festival-banner text-white text-center">
              <p>
                <strong>{festivalOffers.festivalName} Special</strong> Use this coupon code{' '}
                <strong>{festivalOffers.couponCode}</strong> to get a discount of{' '}
                <strong>{festivalOffers.discountPercentage}%</strong> on your item!
              </p>
            </div>
          )}

        </Col>
      </Row>

      {/* Display multi-offers if needed */}
      <Row className="mb-4">
        <Col xs={12}>
          {multiOffers && Object.keys(multiOffers).length > 0 && (
            <div className="multi-offer-banner text-black text-center">
              <p>
                <strong>Multi-item Offer</strong>: Buy <strong>{multiOffers.numItems}</strong> items for just <strong>₹{multiOffers.offerPrice}/-</strong>{' '} 
                Total value: <strong>₹{multiOffers.totalValue}/-</strong>
              </p>
            </div>
          )}
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <Row className="mb-4">
        <Col xs={12} md={8} lg={6} className="mx-auto">
          <Form className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Search by ID, Name, or Brand"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="me-2"
            />
            <Form.Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="me-2 "
            >
              <option value="">All Types</option>
              <option value="Kurtas">Kurtas</option>
              <option value="Sarees">Sarees</option>
              <option value="Lounge wear">Lounge wear</option>
            </Form.Select>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
              }}
            >
              Clear
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Festival Offers Section */}
      <Row className="mb-4">
        <Col xs={12} md={4}>
          <Form.Group controlId="festivalName">
            <Form.Label>Festival Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter festival name"
              value={festivalName}
              onChange={(e) => setFestivalName(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={4}>
          <Form.Group controlId="couponCode">
            <Form.Label>Coupon Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={4}>
          <Form.Group controlId="discountPercentage">
            <Form.Label>Discount Percentage</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Enter discount percentage"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Success/Error Message for Festival Offers */}
      {festivalMessage && (
        <Row className="mb-4">
          <Col xs={12}>
            <Alert variant="info">{festivalMessage}</Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col xs={12} md={4}>
          <Button variant="warning" onClick={handleSaveFestivalOffers}>
            Save Festival Offers
          </Button>
        </Col>
        {festivalOffers && (
          <Col xs={12} md={4}>
            <Button variant="danger" onClick={handleRemoveFestivalOffer}>
              Remove Festival Offer
            </Button>
          </Col>
        )}
      </Row>


      {/* Multi-Item Offers Section */}
      <Row className="mb-4">
        <Col xs={12}>
          <h3>Multi-Item Offers</h3>
        </Col>
        <Col xs={12} md={4}>
          <Form.Group controlId="numItems">
            <Form.Label>Number of Items for Offer</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter the number of items (e.g., 3)"
              value={numItems}
              onChange={(e) => setNumItems(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={4}>
          <Form.Group controlId="totalValue">
            <Form.Label>Total Value of Items</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter total value (e.g., 1597)"
              value={totalValue}
              onChange={(e) => setTotalValue(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={4}>
          <Form.Group controlId="offerPrice">
            <Form.Label>Offer Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter special offer price (e.g., 999)"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Success/Error Message for Multi-Item Offers */}
      {multiItemMessage && (
        <Row className="mb-4">
          <Col xs={12}>
            <Alert variant="info">{multiItemMessage}</Alert>
          </Col>
        </Row>
      )}

      {/* Save and Remove Multi-Item Offers */}
      <Row className="mb-4">
        <Col xs={12} md={4}>
          <Button variant="warning" onClick={handleSaveMultiItemOffers}>
            Save Multi-Item Offers
          </Button>
        </Col>
        {multiItemOffers && (
          <Col xs={12} md={4}>
            <Button variant="danger" onClick={handleRemoveMultiOffer}>
              Remove Multi-Item Offer
            </Button>
          </Col>
        )}
      </Row>

      {/* Product Cards */}
      <Row>
        {filteredProducts.map((product) => (
          <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className="offer-card d-flex flex-column align-items-center">
              <Card.Img
                variant="top"
                src={product.photos[Object.keys(product.photos)[0]] || 'default-image-url.jpg'}
                alt={product.itemName}
                className="product-img"
              />
              <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title className="text-center">{product.itemName}</Card.Title>
                <Card.Text className="text-center text-muted">#{product.id}</Card.Text>
                <Card.Text className="text-center text-muted description">
                  {product.description.length > 50
                    ? product.description.slice(0, 50) + '...'
                    : product.description}
                </Card.Text>
                <Card.Text className="text-center text-muted">
                  <strong>Brand:</strong> {product.brand}
                </Card.Text>
                <Card.Text className="text-center text-muted">
                  <strong>Colors:</strong>{' '}
                  {product.colours.length === 1 ? <span>{product.colours[0]}</span> : 'Multi Color'}
                </Card.Text>
                <Card.Text className="text-center text-muted">
                  <strong>Sizes:</strong>
                  <div className="size-list">
                    {product.sizes && typeof product.sizes === 'object' ? (
                      ['S', 'M', 'L', 'XL', 'XXL'].map((size) =>
                        product.sizes[size] ? (
                          <div key={size} className="size-item">
                            {size}
                          </div>
                        ) : null
                      )
                    ) : (
                      <div className="size-item">None</div>
                    )}
                  </div>
                </Card.Text>
                <Form.Check
                  type="switch"
                  id={`offer-switch-${product.id}`}
                  label="Festival Offer"
                  checked={product.isOffer || false}
                  onChange={() => handleOfferToggle(product.id, product.isOffer)}
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Offers;
