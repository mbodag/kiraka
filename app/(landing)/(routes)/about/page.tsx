import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="flex justify-center item-top h-screen" style={{ marginTop: '100px' }}>
      <div className="text-center">
        <h1 className="text-white text-7xl font-bold mb-12 typewriter" style={{ color: 'rgb(0, 139, 139)' }}>About Our Platform</h1>
        <p className="text-white text-lg max-w-xl mx-auto animate-gradientFadeIn landing-font">
        Welcome to Kiraka.ai! This platform is part of our university project at <span style={{fontStyle: 'italic'}}>Imperial College London </span> 
        aimed at exploring the potentials of speed reading and its effects on comprehension. 
        We&apos;ve developed tools that dynamically adjust to your reading speed and style, continually challenging your limits.<br></br> <br></br> 
        Join us in pushing the boundaries of how we absorb information!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
