import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { query, where, getFirestore, collection, getDocs, limit, startAfter } from 'firebase/firestore';
import './TopCollections.css';

const TopCollections = () => {
  const [collections, setCollections] = useState([]);
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
      await fetchTopCollections();
      setLoading(false);
    };

    fetchInitialCollections();
  }, []);

  // Trigger auto-scroll after collections are loaded
  useEffect(() => {
    if (collections.length > 0) {
      startAutoScroll();
    }
    return () => clearAutoScroll(); // Clean up on unmount
  }, [collections]); // Re-run when collections are updated

  const clearAutoScroll = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
  };

  const handleAddToCart = (productId) => {
    navigate(`/product/${productId}`); // Navigate to the product detail page
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

  // Fetch collections from Firestore
  const fetchTopCollections = async (startAfterDoc = null) => {
    setIsFetching(true);
    const db = getFirestore();
    const productsRef = collection(db, 'products');
    let q = query(productsRef, where('topCollections', '==', true), limit(5));  // Fetch 5 items initially

    if (startAfterDoc) {
      q = query(productsRef, where('topCollections', '==', true), startAfter(startAfterDoc), limit(5));
    }

    try {
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      setHasMore(docs.length === 5);  // Check if there are more items to load
      setLastVisible(docs[docs.length - 1] || null);  // Keep track of the last document

      const fetchedCollections = docs.map(doc => ({
        id: doc.id,
        itemName: doc.data().itemName,
        type: doc.data().type,
        colours: doc.data().colours,
        sizes: doc.data().sizes,
        photos: doc.data().photos,
      }));

      setCollections(prevCollections => (
        startAfterDoc === null
          ? fetchedCollections  // Initial load
          : [...prevCollections, ...fetchedCollections]  // Load more
      ));
    } catch (error) {
      console.error('Error fetching top collections:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleLoadMore = () => {
    if (lastVisible && hasMore) {
      fetchTopCollections(lastVisible);  // Load more data when "Load More" is clicked
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

  if (loading && collections.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-5 top-collections-container">
      <h2 className="text-center mb-4">Top Collections</h2>
      <div className="scroll-container" ref={scrollRef}>
        {collections.map(collection => (
          <Card key={collection.id} className="top-collection-card">
            <Card.Img variant="top" className="card-img" src={getFirstImageUrl(collection.photos)} alt={collection.itemName} />
            <Card.Body className="d-flex flex-column p-3">
              <Card.Title className="text-center mb-2">{collection.itemName}</Card.Title>
              <Card.Text className="text-center mb-1"><strong>Product ID:</strong> {collection.id}</Card.Text>
              <Card.Text className="text-center mb-1"><strong>Categories:</strong> {collection.type}</Card.Text>
              <Card.Text className="text-center mb-1"><strong>Size:</strong> {formatSizes(collection.sizes)}</Card.Text>
              <Card.Text className="text-center mb-2"><strong>Colors:</strong> {formatColours(collection.colours)}</Card.Text>
              {/* Call to Action Button */}
              <Button variant="primary" className="mt-3" onClick={() => handleAddToCart(collection.id)}>
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
            ) : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopCollections;
