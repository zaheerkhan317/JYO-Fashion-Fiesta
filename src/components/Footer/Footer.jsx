// src/components/Footer.js
import React from 'react';
import './Footer.css'; // Ensure this CSS file is present and properly configured

const Footer = () => {
  const phoneNumber = "+919989660937";
  return (
    <footer className="bg-dark text-center text-white w-100">
      <div className="container-fluid p-4">
        <section className="mb-4">
          {/* <a className="btn btn-outline-light btn-floating m-1" href="#kou" role="button">
            <i className="fa-brands fa-facebook"></i>
          </a>

          <a className="btn btn-outline-light btn-floating m-1" href="#lets" role="button">
            <i className="fab fa-twitter"></i>
          </a>

          <a className="btn btn-outline-light btn-floating m-1" href="#go" role="button">
            <i className="fab fa-google"></i>
          </a> */}

          <a className="btn btn-outline-light btn-floating m-1" target='_blank' href={`https://www.instagram.com/jyo_fashionfiesta?igsh=MTNoaTVwZnVwZm9jdg%3D%3D&utm_source=qr`} role="button">
            <i className="fab fa-instagram"></i>
          </a>

          <a className="btn btn-outline-light btn-floating m-1" target='_blank' href={`https://wa.me/${phoneNumber}`} rel="noopener noreferrer" role="button" >
            <i className="fab fa-whatsapp"></i>
          </a>

          <a className="btn btn-outline-light btn-floating m-1" target='_blank' href={`https://github.com/zaheerkhan317`} role="button">
            <i className="fab fa-github"></i>
          </a>

          {/* <a className="btn btn-outline-light btn-floating m-1" href="#ground" role="button">
            <i className="fab fa-linkedin-in"></i>
          </a> */}

        </section>
      </div>

      <div className="footer text-center p-3">
        © 2024 Created by 
        <a href="https://zaheerkhan317.github.io/zaheer-portfolio/" target='_blank' style={{ color: 'gold', textDecoration: 'none' }}> Gouse Jaheer</a>. All rights reserved.
      </div>



    </footer>
  );
}

export default Footer;
