import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Form, Container } from 'react-bootstrap';
import { db } from '../../../../firebaseConfig';
import { collection, getDocs, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import './Offers.css';

const Offers = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [festivalName, setFestivalName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [festivalOffers, setFestivalOffers] = useState(null);

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

    fetchProducts();
    fetchFestivalOffers();
  }, []);

  const handleOfferSelection = (productId) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        product.isOffer = !product.isOffer;
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const handleSaveOffers = async () => {
    await Promise.all(
      products.map(async (product) => {
        if (product.isOffer !== undefined) {
          const productRef = doc(db, 'products', product.id);
          await updateDoc(productRef, { isOffer: product.isOffer });
        }
      })
    );
    alert('Offers Updated!');
  };

  const handleSaveFestivalOffers = async () => {
    const festivalOffersRef = doc(db, 'FestivalOffers', 'current');
    await setDoc(festivalOffersRef, {
      festivalName,
      couponCode,
      discountPercentage: parseFloat(discountPercentage),
    });
    alert('Festival Offers Updated!');
  };

  const handleRemoveFestivalOffer = async () => {
    const festivalOffersRef = doc(db, 'FestivalOffers', 'current');
    await setDoc(festivalOffersRef, {
      festivalName: '',
      couponCode: '',
      discountPercentage: 0,
    });
    setFestivalOffers(null);
    alert('Festival Offer Removed!');
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
          {festivalOffers && (
            <div className="festival-banner text-white text-center">
              <p><strong>{festivalOffers.festivalName} Special</strong> Use this coupon code <strong>{festivalOffers.couponCode}</strong> to get a discount of <strong>{festivalOffers.discountPercentage}%</strong> on your item!</p>
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
              className="me-2"
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
          <Form>
            <Form.Group controlId="festivalName">
              <Form.Label>Festival Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter festival name"
                value={festivalName}
                onChange={(e) => setFestivalName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Col>

        <Col xs={12} md={4}>
          <Form>
            <Form.Group controlId="couponCode">
              <Form.Label>Coupon Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Col>

        <Col xs={12} md={4}>
          <Form>
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
          </Form>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12} md={4}>
          <Button variant="primary" onClick={handleSaveFestivalOffers}>
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
                  <strong>Colors:</strong> {product.colours.length === 1 ? <span>{product.colours[0]}</span> : 'Multi Color'}
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

                <Button
                  variant={product.isOffer ? 'danger' : 'primary'}
                  onClick={() => handleOfferSelection(product.id)}
                >
                  {product.isOffer ? 'Remove Offer' : 'Add Offer'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Offers;
