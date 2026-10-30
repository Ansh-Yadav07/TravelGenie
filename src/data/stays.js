/**
 * Handpicked stays for the Stays page.
 * Shape: { id, name, location, destinationSlug|null, type, image, rating, pricePerNight (INR), amenities[] }
 *
 * `pricePerNight` is an indicative starting rate for a standard room in
 * season — real rates vary by date, so the UI labels them as indicative.
 * Images show the property where a verified photo exists, otherwise the
 * setting it sits in (alt text in the UI says which).
 */
const img = (id, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const stays = [
  {
    id: 'taj-lake-palace',
    name: 'Taj Lake Palace',
    location: 'Udaipur',
    destinationSlug: 'udaipur',
    type: 'Palace hotel',
    image: img('photo-1633702738734-443da2c18f3c'),
    rating: 4.8,
    pricePerNight: 55000,
    amenities: ['Lake views', 'Boat transfers', 'Spa', 'Heritage suites'],
  },
  {
    id: 'rambagh-palace',
    name: 'Rambagh Palace',
    location: 'Jaipur',
    destinationSlug: 'jaipur',
    type: 'Palace hotel',
    image: img('photo-1573363059771-8b2b53b492ff'),
    rating: 4.8,
    pricePerNight: 50000,
    amenities: ['Mughal gardens', 'Polo Bar', 'Indoor pool', 'Spa'],
  },
  {
    id: 'oberoi-amarvilas',
    name: 'The Oberoi Amarvilas',
    location: 'Agra',
    destinationSlug: 'agra',
    type: 'Luxury hotel',
    image: img('photo-1587135941948-670b381f08ce'),
    rating: 4.9,
    pricePerNight: 50000,
    amenities: ['Taj Mahal views', 'Pool', 'Spa', 'Fine dining'],
  },
  {
    id: 'brijrama-palace',
    name: 'BrijRama Palace',
    location: 'Varanasi',
    destinationSlug: 'varanasi',
    type: 'Heritage hotel',
    image: img('photo-1561359313-0639aad49ca6'),
    rating: 4.6,
    pricePerNight: 20000,
    amenities: ['On Darbhanga Ghat', 'River views', 'Vegetarian dining', 'Boat rides'],
  },
  {
    id: 'leela-goa',
    name: 'The Leela Goa',
    location: 'Cavelossim, Goa',
    destinationSlug: 'goa',
    type: 'Beach resort',
    image: img('photo-1664812624929-68f9129e39e4'),
    rating: 4.6,
    pricePerNight: 20000,
    amenities: ['Beach access', 'Lagoon pool', 'Golf course', 'Spa'],
  },
  {
    id: 'kumarakom-lake-resort',
    name: 'Kumarakom Lake Resort',
    location: 'Kumarakom, Kerala',
    destinationSlug: 'kerala',
    type: 'Backwater resort',
    image: img('photo-1654530050931-3b02b28570c1'),
    rating: 4.7,
    pricePerNight: 22000,
    amenities: ['Meandering pool', 'Houseboat cruises', 'Ayurveda', 'Lakefront villas'],
  },
  {
    id: 'ananda-himalayas',
    name: 'Ananda in the Himalayas',
    location: 'Narendra Nagar, Rishikesh',
    destinationSlug: 'rishikesh',
    type: 'Wellness retreat',
    image: img('photo-1720819029162-8500607ae232'),
    rating: 4.8,
    pricePerNight: 45000,
    amenities: ['Ayurveda', 'Daily yoga', 'Valley views', 'Wellness cuisine'],
  },
  {
    id: 'wildflower-hall',
    name: 'Wildflower Hall',
    location: 'Mashobra, Shimla',
    destinationSlug: null,
    type: 'Mountain resort',
    image: img('photo-1593183981460-e9276b5a5587'),
    rating: 4.8,
    pricePerNight: 30000,
    amenities: ['Heated pool', 'Cedar forest walks', 'Spa', 'Himalayan views'],
  },
];
