import React from 'react';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center" style={{ marginTop: '-300px' }}>
        <h1 className="text-white text-7xl font-bold mb-8 typewriter" style={{ color: '#7FFFD4' }}>Contact Us</h1>
        <div className="text-white text-xl max-w-2xl mx-auto animate-gradientFadeIn landing-font">
          <p>For further information, our team is here to help:</p>
          <div className="space-between"></div> {/* This creates the space */}
          <p>Konstantinos Mitsides (km2120@ic.ac.uk)</p>
          <p>Fadi Zahar (fz221@ic.ac.uk)</p>
          <p>Kyoya Higashino (kh123@ic.ac.uk)</p>
          <p>Evangelos Georgiadis (eg923@ic.ac.uk)</p>
          <p>Matis Bodaghi (mrb23@ic.ac.uk)</p>
          <p>Jack Hau (jhh23@ic.ac.uk)</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
