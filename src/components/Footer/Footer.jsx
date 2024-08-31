// src/components/Footer.js
import React from 'react';
import './Footer.css'; // Ensure this CSS file is present and properly configured

const Footer = () => {
  return (
    <footer className="bg-dark text-center text-white w-100">
      <div className="container-fluid p-4">
        <section className="mb-4">
          <a className="btn btn-outline-light btn-floating m-1" href="#kou" role="button">
            <i className="fa-brands fa-facebook"></i>
          </a>

          <a className="btn btn-outline-light btn-floating m-1" href="#lets" role="button">
            <i className="fab fa-twitter"></i>
          </a>

          <a className="btn btn-outline-light btn-floating m-1" href="#go" role="button">
            <i className="fab fa-google"></i>
          </a>

          <a className="btn btn-outline-light btn-floating m-1" href="#house" role="button">
            <i className="fab fa-instagram"></i>
          </a>

          <a className="btn btn-outline-light btn-floating m-1" href="#ground" role="button">
            <i className="fab fa-linkedin-in"></i>
          </a>

          <a className="btn btn-outline-light btn-floating m-1" href="#home" role="button">
            <i className="fab fa-github"></i>
          </a>
        </section>
      </div>

      <div className="footer text-center p-3">
        © 2024 Copyright:
        <a href="#jyo" className="text-white"> JYO Fashion Fiesta</a>
      </div>
    </footer>
  );
}

export default Footer;
