import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Carousel, Spinner } from 'react-bootstrap';
import Reviews from './Reviews/Reviews';
import TopCollections from './TopCollections/TopCollections';
import { FaStar, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import BestSellingProducts from './BestSellingProducts/BestSellingProducts';
import NewArrivals from './NewArrivals/NewArrivals';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      const db = getFirestore();
      const bannersRef = collection(db, 'banners');

      try {
        const querySnapshot = await getDocs(bannersRef);
        const fetchedBanners = querySnapshot.docs.map(doc => ({
          imageUrl: doc.data().imageUrl,
          redirectUrl: doc.data().redirectUrl // Assuming banners in Firestore have a targetUrl field
        }));
        setBanners(fetchedBanners);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setError('Error fetching banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <Carousel id="carouselExampleIndicators" interval={2000} controls={false}>
        {banners.map((banner, index) => (
          <Carousel.Item key={index}>
            <div
              onClick={() => navigate(banner.redirectUrl)}
              style={{ cursor: 'pointer' }}
            >
              <img className="d-block w-100" src={banner.imageUrl} alt={`Slide ${index + 1}`} />
            </div>
          </Carousel.Item>
        ))}
      </Carousel>


      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          {/* Good Quality Section */}
          <div className="col-12 col-md-4 mb-4 d-flex align-items-center justify-content-center">
            <div className="p-4 d-flex flex-column align-items-center justify-content-center" style={{ height: '250px', maxWidth: '350px' }}>
              <div className="mb-3" style={{ fontSize: '3rem' }}>
                <FaStar />
              </div>
              <h4 className="mb-2 text-center">Good Quality</h4>
              <p className="text-center mb-0">Top-notch quality services that meet your expectations.</p>
            </div>
          </div>

          {/* Cost Saving Section */}
          <div className="col-12 col-md-4 mb-4 d-flex align-items-center justify-content-center">
            <div className="p-4 d-flex flex-column align-items-center justify-content-center" style={{ height: '250px', maxWidth: '350px' }}>
              <div className="mb-3" style={{ fontSize: '3rem' }}>
                <FaMoneyBillWave />
              </div>
              <h4 className="mb-2 text-center">Cost Saving</h4>
              <p className="text-center mb-0">Affordable solutions that save you money.</p>
            </div>
          </div>

          {/* Time Saving Section */}
          <div className="col-12 col-md-4 mb-4 d-flex align-items-center justify-content-center">
            <div className="p-4 d-flex flex-column align-items-center justify-content-center" style={{ height: '250px', maxWidth: '350px' }}>
              <div className="mb-3" style={{ fontSize: '3rem' }}>
                <FaClock />
              </div>
              <h4 className="mb-2 text-center">Time Saving</h4>
              <p className="text-center mb-0">Efficient services to save you valuable time.</p>
            </div>
          </div>
        </div>
      </div>

      <NewArrivals />
      <TopCollections />
      <BestSellingProducts />
      <Reviews />
    </div>
  );
};

export default Home;
