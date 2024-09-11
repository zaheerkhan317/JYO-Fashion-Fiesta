import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { query, where, getFirestore, collection, getDocs, limit, startAfter } from 'firebase/firestore';
import './BestSellingProducts.css'; // Add or adjust the CSS file accordingly

const BestSellingProducts = () => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const scrollRef = useRef(null);
  const intervalId = useRef(null);

  const navigate = useNavigate();
  // Fetch data once on component mount
  useEffect(() => {
    const fetchInitialCollections = async () => {
      await fetchBestSellingProducts();
      setLoading(false);
    };

    fetchInitialCollections();
  }, []);

  // Trigger auto-scroll after bestSellingProducts are loaded
  useEffect(() => {
    if (bestSellingProducts.length > 0) {
      startAutoScroll();
    }
    return () => clearAutoScroll(); // Clean up on unmount
  }, [bestSellingProducts]); // Re-run when bestSellingProducts are updated


  const handleAddToCart = (productId) => {
    navigate(`/product/${productId}`); // Navigate to the product detail page
  };

  const clearAutoScroll = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
  };

  const startAutoScroll = () => {
    clearAutoScroll(); // Clear previous interval if it exists
    const scrollContainer = scrollRef.current;

    if (scrollContainer) {
      const scroll = () => {
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;

        if (scrollContainer.scrollLeft >= maxScrollLeft) {
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainer.scrollBy({ left: 150, behavior: 'smooth' }); // Adjust scroll distance
        }
      };

      intervalId.current = setInterval(scroll, 2000); // Adjust the interval duration here
    }
  };

  const fetchBestSellingProducts = async (startAfterDoc = null) => {
    setLoading(true);
    const db = getFirestore();
    const productsRef = collection(db, 'products');
    let q = query(productsRef, where('bestSelling', '==', true), limit(5));

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    try {
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      setHasMore(docs.length === 5); // Adjust limit and hasMore logic as needed
      setLastVisible(docs[docs.length - 1] || null);

      const fetchedBestSellingProducts = docs.map(doc => ({
        id: doc.id,
        itemName: doc.data().itemName,
        type: doc.data().type,
        colours: doc.data().colours,
        sizes: doc.data().sizes,
        photos: doc.data().photos,
      }));

      setBestSellingProducts(prevProducts => (
        startAfterDoc === null
          ? fetchedBestSellingProducts
          : [...prevProducts, ...fetchedBestSellingProducts]
      ));
    } catch (error) {
      console.error('Error fetching best selling products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (lastVisible) {
      fetchBestSellingProducts(lastVisible);
    }
  };

  const getFirstImageUrl = (photos) => {
    if (!photos || typeof photos !== 'object') return 'placeholder.jpg';
    const colorKeys = Object.keys(photos);
    if (colorKeys.length > 0 && photos[colorKeys[0]].length > 0) {
      return photos[colorKeys[0]][0];
    }
    return 'placeholder.jpg';
  };

  const formatSizes = sizes => sizes && sizes.length ? sizes.join(', ') : 'No sizes available';
  const formatColours = colours => colours && colours.length === 1 ? colours[0] : 'Multicolour';

  if (loading && bestSellingProducts.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-5 best-selling-products-container">
      <h2 className="text-center mb-4">Best Selling Products</h2>
      <div className="scroll-container" ref={scrollRef}>
        {bestSellingProducts.map(product => (
          <Card key={product.id} className="best-selling-product-card">
            <Card.Img variant="top" className="card-img" src={getFirstImageUrl(product.photos)} alt={product.itemName} />
            <Card.Body className="d-flex flex-column p-3">
              <Card.Title className="text-center mb-2">{product.itemName}</Card.Title>
              <Card.Text className="text-center mb-1"><strong>Product ID:</strong> {product.id}</Card.Text>
              <Card.Text className="text-center mb-1"><strong>Categories:</strong> {product.type}</Card.Text>
              <Card.Text className="text-center mb-1"><strong>Size:</strong> {formatSizes(product.sizes)}</Card.Text>
              <Card.Text className="text-center mb-2"><strong>Colors:</strong> {formatColours(product.colours)}</Card.Text>
              {/* Call to Action Button */}
              <Button variant="primary" className="mt-3" onClick={() => handleAddToCart(product.id)}>
                View Product
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
      {hasMore && (
         <div className="load-more-container">
         <Button className="load-more-button" variant="link" onClick={handleLoadMore} disabled={isFetching}>
           {isFetching ? (
             <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
           ) : (
             'Load More'
           )}
         </Button>
       </div>
      )}
    </div>
  );
};

export default BestSellingProducts;
