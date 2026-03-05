import React from 'react';
import Hero from '../components/Hero';
import AIHighlight from '../components/AIHighlight';
import Destinations from '../components/Destinations';
import HowItWorks from '../components/HowItWorks';

const Home = () => {
  return (
    <>
      <Hero />
      <AIHighlight />
      <Destinations />
      <HowItWorks />
    </>
  );
};

export default Home;
