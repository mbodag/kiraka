import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center" style={{ marginTop: '-400px' }}>
        <h1 className="text-white text-7xl font-bold mb-8 typewriter" style={{ color: '#008B8B' }}>About Our Platform</h1>
        <p className="text-white text-xl max-w-2xl mx-auto animate-gradientFadeIn">
          Welcome to Kiraka, the premier platform for enhancing your reading and learning efficiency. 
          Our cutting-edge technology empowers you to absorb information faster, 
          retain more knowledge, and save precious time. Embrace the joy of learning 
          with our intuitive speed reading tools designed for the avid learner in you!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
