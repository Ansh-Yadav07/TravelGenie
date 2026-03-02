const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// serve static front-end files
app.use(express.static(path.join(__dirname)));

// simple in-memory sample data
const samplePlaces = [
  'Amsterdam','Athens','Bangkok','Barcelona','Cape Town','Dubai','Dublin','Edinburgh','Estepona','Florence','Geneva','Havana'
];

const sampleStays = [
  { name: 'Hilton Hotel', type: 'hotel', pricePerNight: 120, location: 'Amsterdam', rating: 4.5 },
  { name: 'Cozy Cottage', type: 'cottage', pricePerNight: 80, location: 'Athens', rating: 4.0 },
  { name: 'Villa Paradise', type: 'villa', pricePerNight: 200, location: 'Bangkok', rating: 4.7 },
  // ... more entries
];

const sampleVisits = [
  { name: 'Eiffel Tower', location: 'Paris', price: 25, rating: 4.8 },
  { name: 'Louvre Museum', location: 'Paris', price: 15, rating: 4.6 },
  // ... more entries
];

const sampleTransports = [
  { mode: 'bike', detail: 'City bike rental', pricePerHour: 5 },
  { mode: 'car', detail: 'Car rental', pricePerDay: 40 },
  { mode: 'public', detail: 'Metro pass', pricePerDay: 7 },
];

const moodSuggestions = {
  relaxed: ['Spa day', 'Beach stroll'],
  busy: ['City tour', 'Market hopping'],
  foodie: ['Local cooking class', 'Street food crawl'],
  adventure: ['Hiking trail', 'Kayaking'],
  cultural: ['Museum visit', 'Architectural walk'],
  aesthetic: ['Sunset viewpoint', 'Photography tour'],
};

// endpoints
app.get('/api/places', (req, res) => {
  const term = (req.query.term || '').toLowerCase();
  const matches = samplePlaces.filter(p => p.toLowerCase().startsWith(term));
  res.json(matches);
});

app.post('/api/recommendations', (req, res) => {
  const data = req.body;
  console.log('received recommendation request', data);
  // very naive filtering based on budget, duration, companions
  let stays = sampleStays.filter(s => {
    if (data.places && s.location.toLowerCase() !== data.places.toLowerCase()) return false;
    if (data.budget && data.duration) {
      const maxNight = data.budget / data.duration;
      return s.pricePerNight <= maxNight;
    }
    return true;
  });
  let visits = sampleVisits.filter(v => {
    if (data.places && v.location.toLowerCase() !== data.places.toLowerCase()) return false;
    if (data.budget && v.price) return v.price <= data.budget * 0.1; // arbitrary
    return true;
  });
  let transports = sampleTransports;
  let moods = moodSuggestions[data.mood] || [];

  // if interests provided, attach them to reply
  res.json({ stays, visits, transports, moods, interests: data.interests || [] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
