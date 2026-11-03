import Hero from '../components/home/Hero';
import RecentTrips from '../components/home/RecentTrips';
import TripIdeas from '../components/home/TripIdeas';
import FeaturedDestinations from '../components/home/FeaturedDestinations';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import CallToAction from '../components/home/CallToAction';

export default function Home() {
  return (
    <>
      <Hero />
      <RecentTrips />
      <TripIdeas />
      <FeaturedDestinations />
      <Features />
      <HowItWorks />
      <CallToAction />
    </>
  );
}
