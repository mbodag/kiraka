import React from 'react';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="flex justify-center item-top h-screen" style={{ marginTop: '100px' }}>
      <div className="text-center">
        <h1 className="text-white text-7xl font-bold mb-12 typewriter" style={{ color: 'rgb(127, 230, 212)' }}>Contact Us</h1>
        <div className="text-white text-lg max-w-xl mx-auto animate-gradientFadeIn landing-font">
          <p>For more information or if you have any questions, please contact us at:</p>
          <p><strong>Email:</strong> <a href="mailto:srp.doc.ic.ac.uk@gmail.com" style={{fontStyle: 'italic', fontWeight: 'bold'}} className='text-orange-300'>srp.doc.ic.ac.uk@gmail.com</a></p>
          <div className="space-between"></div> {/* This creates the space */}
          <p>Your inquiries will be addressed by our team members:</p>
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
