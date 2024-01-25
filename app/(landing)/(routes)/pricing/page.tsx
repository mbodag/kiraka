import React from 'react';
import './PricingPage.css';

const PricingPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center" style={{ marginTop: '-450px' }}>
        <h1 className="text-white text-7xl font-bold mb-8 typewriter" style={{ color: '#8FBC8F', lineHeight: '1.2'}}>Our Pricing Plans</h1>
        <p className="text-white text-xl max-w-2xl mx-auto animate-gradientFadeIn">
          Our platform is completely free! Our team wants you to get the most 
          out of your reading experience without breaking the bank. 
          Start your journey to faster reading & learning today!
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
