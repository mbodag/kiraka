import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="flex justify-center item-top h-screen" style={{ marginTop: '100px' }}>
      <div className="text-center">
        <h1 className="text-white text-7xl font-bold mb-12 typewriter" style={{ color: 'rgb(0, 139, 139)' }}>About Our Platform</h1>
        <p className="text-white text-lg max-w-xl mx-auto animate-gradientFadeIn landing-font">
        Welcome to Kiraka.ai! Our name, &apos;Kiraka&apos;, is inspired by the Arabic word 
        for reading (qirā&apos;ah) and reflects our commitment to enhancing the way people engage with written content. <br /><br />
        Initiated as a university project at <span style={{fontStyle: 'italic'}}>Imperial College London</span>, our platform explores the potential 
        of speed reading and its impact on comprehension. We&apos;ve developed tools that dynamically adjust to your reading pace and style, continually challenging your limits. <br /><br />
        Join us in pushing the boundaries of how we absorb information!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
