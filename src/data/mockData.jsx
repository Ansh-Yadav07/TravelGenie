
export const destinations = [
  {
    id: 1,
    name: 'Goa',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: '₹12,000',
    rating: 4.8,
    description: 'Famous for its beaches, nightlife, and Portuguese heritage.',
    booking: {
      flight: '₹5,000',
      hotel: '₹3,500/night',
      package: '₹12,000 (3D/2N)'
    },
    activities: [
      { name: "Scuba Diving", description: "Explore the vibrant underwater world at Grand Island." },
      { name: "Beach Hopping", description: "Visit Calangute, Baga, and Anjuna beaches for sun and sand." },
      { name: "Dudhsagar Falls", description: "Trek to one of India's tallest waterfalls." }
    ]
  },
  {
    id: 2,
    name: 'Manali',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: '₹15,500',
    rating: 4.7,
    description: 'A high-altitude Himalayan resort town known for its cool climate and snow-capped mountains.',
    booking: {
      flight: '₹7,000 (to Kullu)',
      hotel: '₹4,000/night',
      package: '₹15,500 (4D/3N)'
    },
    activities: [
      { name: "Solang Valley", description: "Paragliding and skiing in winter." },
      { name: "Rohtang Pass", description: "Experience snow points and breathtaking views." },
      { name: "Old Manali", description: "Explore cafes and local culture." }
    ]
  },
  {
    id: 3,
    name: 'Jaipur',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: '₹9,000',
    rating: 4.6,
    description: 'The Pink City, known for its historic forts, palaces, and vibrant culture.',
    booking: {
      flight: '₹4,500',
      hotel: '₹2,500/night',
      package: '₹9,000 (3D/2N)'
    },
    activities: [
      { name: "Amber Fort", description: "Elephant ride and fort exploration." },
      { name: "Hawa Mahal", description: "Visit the iconic Palace of Winds." },
      { name: "City Palace", description: "Royal architecture and museums." }
    ]
  },
  {
    id: 4,
    name: 'Chennai',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa6xitYMqObiol3jIcZQCHRSZ6uwNZFYi8fw&s',
    price: '₹10,500',
    rating: 4.5,
    description: 'A major cultural hub in South India, famous for its temples and Marina Beach.',
    booking: {
      flight: '₹5,200',
      hotel: '₹3,000/night',
      package: '₹10,500 (3D/2N)'
    },
    activities: [
      { name: "Marina Beach", description: "Sunrise walk on the longest beach in India." },
      { name: "Kapaleeshwarar Temple", description: "Dravidian style temple architecture." },
      { name: "DakshinaChitra", description: "Cultural village showcasing South Indian heritage." }
    ]
  },
  {
    id: 5,
    name: 'Pondicherry',
    image: 'https://s7ap1.scene7.com/is/image/incredibleindia/paradise%20beach-puducherry?qlt=82&ts=1726656290701',
    price: '₹11,000',
    rating: 4.7,
    description: 'A French colonial settlement in India with tree-lined streets and mustard-colored villas.',
    booking: {
      flight: '₹6,000 (to Chennai)',
      hotel: '₹3,200/night',
      package: '₹11,000 (3D/2N)'
    },
    activities: [
      { name: "Auroville", description: "Visit the experimental township dedicated to human unity." },
      { name: "Promenade Beach", description: "Evening stroll along the rocky beach." },
      { name: "French Quarter", description: "Cycling tour through colonial streets." }
    ]
  },
  {
    id: 6,
    name: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: '₹14,000',
    rating: 4.9,
    description: 'The city of dreams, home to Bollywood and colonial-era architecture.',
    booking: {
      flight: '₹5,500',
      hotel: '₹5,000/night',
      package: '₹14,000 (3D/2N)'
    },
    activities: [
      { name: "Marine Drive", description: "Relax by the Queen's Necklace at sunset." },
      { name: "Gateway of India", description: "Boat ride to Elephanta Caves." },
      { name: "Colaba Causeway", description: "Street shopping and vintage cafes." }
    ]
  },
  {
    id: 7,
    name: 'Kerala',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: '₹18,000',
    rating: 4.9,
    description: "God's Own Country, famous for its backwaters, beaches, and hill stations.",
    booking: {
      flight: '₹6,500',
      hotel: '₹4,000/night',
      package: '₹18,000 (5D/4N)'
    },
    activities: [
      { name: "Alleppey Houseboat", description: "Cruise through the tranquil backwaters." },
      { name: "Munnar Tea Gardens", description: "Visit tea plantations and rolling hills." },
      { name: "Kathakali Performance", description: "Witness traditional dance drama." }
    ]
  },
    {
    id: 8,
    name: 'Ladakh',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: '₹25,000',
    rating: 4.9,
    description: 'A high-altitude desert known for its stunning landscapes and Buddhist monasteries.',
    booking: {
      flight: '₹10,500',
      hotel: '₹5,000/night',
      package: '₹25,000 (6D/5N)'
    },
    activities: [
      { name: "Pangong Lake", description: "Camping by the color-changing lake." },
      { name: "Nubra Valley", description: "Double-humped camel safari." },
      { name: "Magnetic Hill", description: "Experience the anti-gravity phenomenon." }
    ]
  },
    {
    id: 9,
    name: 'Udaipur',
    image: 'https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/blt4cf134d7dc5ff2c0/68906f5f7adc79b45ae98a6f/iStock-2197451116-2-HEADER_MOBILE.jpg?format=webp&auto=avif&quality=60&crop=4%3A3&width=1440',
    price: '₹12,500',
    rating: 4.7,
    description: 'The City of Lakes, filled with lavish royal residences.',
    booking: {
      flight: '₹5,500',
      hotel: '₹3,500/night',
      package: '₹12,500 (3D/2N)'
    },
    activities: [
      { name: "Lake Pichola", description: "Sunset boat ride with views of City Palace." },
      { name: "City Palace", description: "Explore the massive palace complex." },
      { name: "Bagore Ki Haveli", description: "Evening cultural show and museum." }
    ]
  }
];

export const features = [
  {
    id: 1,
    title: 'Personalized Itinerary',
    description: 'AI-curated travel plans tailored to your unique preferences and interests.',
    icon: 'Map'
  },
  {
    id: 2,
    title: 'Smart Stay Recommendations',
    description: 'Find the perfect accommodation that matches your budget and style.',
    icon: 'Hotel'
  },
  {
    id: 3,
    title: 'Hidden Gems Discovery',
    description: 'Explore off-the-beaten-path locations recommended by our AI.',
    icon: 'Compass'
  }
];

export const stays = [
  {
    id: 1,
    name: "The Oberoi Amarvilas",
    location: "Agra",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    price: "₹25,000/night",
    type: "Luxury Resort",
    amenities: ["Pool", "Spa", "Taj Mahal View", "Fine Dining"]
  },
  {
    id: 2,
    name: "Taj Lake Palace",
    location: "Udaipur",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    price: "₹35,000/night",
    type: "Heritage Hotel",
    amenities: ["Lake View", "Boat Ride", "Heritage Walk", "Royal Butler"]
  },
  {
    id: 3,
    name: "Wildflower Hall",
    location: "Shimla",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    price: "₹22,000/night",
    type: "Mountain Resort",
    amenities: ["Heated Pool", "Nature Walks", "Spa", "Mountain View"]
  },
  {
    id: 4,
    name: "The Leela Goa",
    location: "Goa",
    image: "https://images.unsplash.com/photo-1571896349842-deb2c5e7d422?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    price: "₹18,000/night",
    type: "Beach Resort",
    amenities: ["Private Beach", "Golf Course", "Ayurveda Spa", "Casino"]
  },
  {
    id: 5,
    name: "Rambagh Palace",
    location: "Jaipur",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    price: "₹40,000/night",
    type: "Royal Palace",
    amenities: ["Lush Gardens", "Polo Bar", "Historical Suites", "Peacocks"]
  },
  {
    id: 6,
    name: "Kumarakom Lake Resort",
    location: "Kerala",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    price: "₹20,000/night",
    type: "Backwater Resort",
    amenities: ["Infinity Pool", "Houseboat Cruise", "Fishing", "Yoga"]
  }
];
