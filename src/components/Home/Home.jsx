import React from 'react'
import img1 from '../../img/1.png'
import img2 from '../../img/2.png'
import img3 from '../../img/3.png'
import { Carousel } from 'react-bootstrap'
const Home = () => {
  return (
    <Carousel id="carouselExampleIndicators" interval={2000}>
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
    </Carousel>
  )
}

export default Home
