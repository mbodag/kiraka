import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center" style={{ marginTop: '-400px' }}>
        <h1 className="text-white text-7xl font-bold mb-12 typewriter" style={{ color: '#008B8B' }}>About Our Platform</h1>
        <p className="text-white text-lg max-w-xl mx-auto animate-gradientFadeIn landing-font">
        Welcome to Kiraka.ai! This platform is part of our university project at Imperial College London 
        aimed at exploring the potentials of speed reading and its effects on comprehension. 
        We've developed tools that dynamically adjust to your reading speed, continually challenging your limits.<br></br> <br></br> 
        Join us in pushing the boundaries of how we absorb and retain information!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
