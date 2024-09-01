import React from 'react'
import img1 from '../../img/1.png'
import img2 from '../../img/2.png'
import img3 from '../../img/3.png'
import img4 from '../../img/4.png'
import { Carousel } from 'react-bootstrap'
import Reviews from './Reviews/Reviews'
const Home = () => {
  return (
    <div>
    <Carousel id="carouselExampleIndicators" interval={2000} controls={false}>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={img1} // Replace with your image source
          alt="First slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={img2} // Replace with your image source
          alt="Second slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={img3} // Replace with your image source
          alt="Third slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={img4} // Replace with your image source
          alt="Third slide"
        />
      </Carousel.Item>
    </Carousel>

    <Reviews />

    </div>
  )
}

export default Home
