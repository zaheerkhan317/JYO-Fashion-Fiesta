import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { query, where, getFirestore, collection, getDocs, limit, startAfter } from 'firebase/firestore';
import './NewArrivals.css'; // Add or adjust the CSS file accordingly

const NewArrivals = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchNewArrivals();
    startAutoScroll();
    return () => {
      // Cleanup interval on component unmount
      if (scrollRef.current && scrollRef.current.intervalId) {
        clearInterval(scrollRef.current.intervalId);
      }
    };
  }, []);

  const startAutoScroll = () => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth;
      const clientWidth = scrollRef.current.clientWidth;

      const intervalId = setInterval(() => {
        if (scrollRef.current.scrollLeft + clientWidth >= scrollWidth-1) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }, 2000); // Adjust the speed of scrolling here

      scrollRef.current.intervalId = intervalId;
    }
  };

  const fetchNewArrivals = async (startAfterDoc = null) => {
    setLoading(true);
    const db = getFirestore();
    const productsRef = collection(db, 'products');
    let q = query(productsRef, where('newArrivals', '==', true), limit(2));

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    try {
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      setHasMore(docs.length === 2); // Adjust limit and hasMore logic as needed
      setLastVisible(docs[docs.length - 1] || null);

      const fetchedNewArrivals = docs.map(doc => ({
        id: doc.id,
        itemName: doc.data().itemName,
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

  const formatSizes = sizes => {
    if (!Array.isArray(sizes) || sizes.length === 0) return 'No sizes available';
    return sizes.join(', ');
  };

  const formatColours = colours => {
    if (!Array.isArray(colours) || colours.length === 0) return 'No colors available';
    if (colours.length === 1) return colours[0];
    return 'Multicolour';
  };

  if (loading && newArrivals.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-5 new-arrivals-container">
      <h2 className="text-center mb-4">New Arrivals</h2>
      <div className="scroll-container" ref={scrollRef}>
        {newArrivals.map(arrival => (
          <Card key={arrival.id} className="new-arrival-card">
            <Card.Img variant="top" className="card-img" src={getFirstImageUrl(arrival.photos)} alt={arrival.itemName} />
            <Card.Body className="d-flex flex-column p-3">
              <Card.Title className="text-center mb-2">{arrival.itemName}</Card.Title>
              <Card.Text className="text-center mb-1"><strong>Product ID:</strong> {arrival.id}</Card.Text>
              <Card.Text className="text-center mb-1"><strong>Categories:</strong> {arrival.type}</Card.Text>
              <Card.Text className="text-center mb-1"><strong>Size:</strong> {formatSizes(arrival.sizes)}</Card.Text>
              <Card.Text className="text-center mb-2"><strong>Colors:</strong> {formatColours(arrival.colours)}</Card.Text>
              <Button variant="primary" className="w-100">View Collection</Button>
            </Card.Body>
          </Card>
        ))}
      </div>
      {hasMore && !loading && (
        <div className="load-more-container">
          <Button className="load-more-button" variant="secondary" onClick={handleLoadMore}>Load More</Button>
        </div>
      )}
    </div>
  );
};

export default NewArrivals;
