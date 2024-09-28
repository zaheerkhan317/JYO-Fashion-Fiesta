import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { query, where, getFirestore, collection, getDocs, limit, startAfter } from 'firebase/firestore';
import './NewArrivals.css'; // Add or adjust the CSS file accordingly

const NewArrivals = () => {
  const [newArrivals, setNewArrivals] = useState([]);
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
      await fetchNewArrivals();
      setLoading(false);
    };

    fetchInitialCollections();
  }, []);

  // Trigger auto-scroll after newArrivals are loaded
  useEffect(() => {
    if (newArrivals.length > 0) {
      startAutoScroll();
    }
    return () => clearAutoScroll(); // Clean up on unmount
  }, [newArrivals]); // Re-run when newArrivals are updated

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

  const fetchNewArrivals = async (startAfterDoc = null) => {
    setLoading(true);
    const db = getFirestore();
    const productsRef = collection(db, 'products');
    let q = query(productsRef, where('newArrivals', '==', true),
    where('isOffer', '==', false), limit(5));

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    try {
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      setHasMore(docs.length === 5); // Adjust limit and hasMore logic as needed
      setLastVisible(docs[docs.length - 1] || null);

      const fetchedNewArrivals = docs.map(doc => ({
        id: doc.id,
        brand: doc.data().brand,
        type: doc.data().type,
        colours: doc.data().colours,
        sizes: doc.data().sizes,
        photos: doc.data().photos,
      }));

      setNewArrivals(prevArrivals => (
        startAfterDoc === null
          ? fetchedNewArrivals
          : [...prevArrivals, ...fetchedNewArrivals]
      ));
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const handleLoadMore = () => {
    if (lastVisible) {
      fetchNewArrivals(lastVisible);
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

  const SIZE_ORDER = {
    S: 1,
    M: 2,
    L: 3,
    XL: 4,
    XXL: 5,
  };

  const formatSizes = sizes => {
    if (!sizes || typeof sizes !== 'object') return 'No sizes available';
    const sortedSizes = Object.keys(sizes).sort((a, b) => SIZE_ORDER[a] - SIZE_ORDER[b]);
    return sortedSizes.map(size => `${size}`).join(', ');
  };

  const formatColours = colours => colours && colours.length === 1 ? colours[0] : 'Multicolour';

  if (loading && newArrivals.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-5 new-arrivals-container">
      <h2 className="new-arrivals-heading text-center mb-5">New Arrivals</h2>
      <div className="scroll-container pt-5" ref={scrollRef}>
        {newArrivals.map(arrival => (
          <Card key={arrival.id} className="new-arrival-card">
            <Card.Img variant="top" className="card-img" src={getFirstImageUrl(arrival.photos)} alt={arrival.itemName} />
            <Card.Body className="d-flex flex-column p-3">
              <Card.Title className="text-center mb-2">{arrival.brand}</Card.Title>
              <Card.Text className="text-center mb-1"><strong>Product ID:</strong> {arrival.id}</Card.Text>
              <Card.Text className="text-center mb-1"><strong>Categories:</strong> {arrival.type}</Card.Text>
              <Card.Text className="text-center mb-1"><strong>Size:</strong> {formatSizes(arrival.sizes)}</Card.Text>
              <Card.Text className="text-center mb-2"><strong>Colors:</strong> {formatColours(arrival.colours)}</Card.Text>
              {/* Call to Action Button */}
              <Button
  variant="primary"
  className="mt-3"
  style={{
    backgroundColor: '#ffd700', // Gold color
    color: 'black', // Text color
    border: 'none', // No border
    transition: 'background-color 0.3s ease', // Smooth transition
  }}
  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e6c200')} // Darker shade on hover
  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffd700')} // Reset to gold color
  onClick={() => handleAddToCart(arrival.id)}
>
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

export default NewArrivals;
