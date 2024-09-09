import React from 'react'
import img1 from '../../img/1.png'
import img2 from '../../img/2.png'
import img3 from '../../img/3.png'
import img4 from '../../img/4.png'
import { Carousel } from 'react-bootstrap'
import Reviews from './Reviews/Reviews'
import TopCollections from './TopCollections/TopCollections'
import { FaStar, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import BestSellingProducts from './BestSellingProducts/BestSellingProducts'
import NewArrivals from './NewArrivals/NewArrivals'
const Home = () => {
  return (
    <div>
    <Carousel id="carouselExampleIndicators" interval={2000} controls={false}>
      <Carousel.Item>
        <img className="d-block w-100" src={img1} alt="First slide"/>
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100" src={img2} alt="Second slide" />
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100" src={img3} alt="Third slide" />
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100" src={img4} alt="Third slide" />
      </Carousel.Item>
    </Carousel>

    
    

    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        {/* Good Quality Section */}
        <div className="col-12 col-md-4 mb-4 d-flex align-items-stretch justify-content-center">
          <div className=" p-4 d-flex flex-column align-items-center justify-content-center" style={{ height: '250px', maxWidth: '350px' }}>
            <div className="mb-3" style={{ fontSize: '3rem' }}>
              <FaStar />
            </div>
            <h4 className="mb-2 text-center">Good Quality</h4>
            <p className="text-center mb-0">Top-notch quality services that meet your expectations.</p>
          </div>
        </div>

        {/* Cost Saving Section */}
        <div className="col-12 col-md-4 mb-4 d-flex align-items-stretch justify-content-center">
          <div className=" p-4 d-flex flex-column align-items-center justify-content-center" style={{ height: '250px', maxWidth: '350px' }}>
            <div className="mb-3" style={{ fontSize: '3rem' }}>
              <FaMoneyBillWave />
            </div>
            <h4 className="mb-2 text-center">Cost Saving</h4>
            <p className="text-center mb-0">Affordable solutions that save you money.</p>
          </div>
        </div>

        {/* Time Saving Section */}
        <div className="col-12 col-md-4 mb-4 d-flex align-items-stretch justify-content-center">
          <div className=" p-4 d-flex flex-column align-items-center justify-content-center" style={{ height: '250px', maxWidth: '350px' }}>
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
  )
}

export default Home
