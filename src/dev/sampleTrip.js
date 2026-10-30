/**
 * DEV-ONLY fixtures that follow the Trip API contract exactly.
 * Never import this from production code paths. Useful for seeding:
 *   localStorage.setItem('tg:trips:v1', JSON.stringify([sampleTrip, sampleHoursTrip]))
 */

const sum = (list, pick) => list.reduce((n, x) => n + (Number(pick(x)) || 0), 0);

function withEstimate(trip) {
  const stay = trip.stays.find((s) => s.recommended)?.total_cost ?? 0;
  const transport = trip.transport.find((t) => t.recommended)?.total_cost ?? 0;
  const activities = sum(trip.days.flatMap((d) => d.activities), (a) => a.cost);
  const total = stay + transport + activities;
  return {
    ...trip,
    days: trip.days.map((d) => ({ ...d, total_cost: sum(d.activities, (a) => a.cost) })),
    budget: {
      ...trip.budget,
      estimate: { stay, transport, activities, total },
      status: total > trip.budget.total ? 'over' : 'within',
      delta: trip.budget.total - total,
    },
  };
}

/* ── 4-day Goa trip from Delhi, 2 travelers, moderate ─────────────── */
// Budget model: nights 3, rooms 1 → stay 15,000; activities 2×4×3,000 = 24,000;
// transport 2×8,000 = 16,000; total 55,000.
export const sampleTrip = withEstimate({
  id: 'a1b2c3d4e5f6',
  created_at: '2026-10-30T09:12:00Z',
  request: {
    destination: 'Goa',
    origin: 'Delhi',
    start_date: '2026-12-19',
    plan_mode: 'days',
    duration: 4,
    travelers: 2,
    companions: 'couple',
    budget: 'moderate',
    mood: 'relaxing',
    pace: 'balanced',
    transport: 'flight',
    interests: ['beaches', 'food', 'history'],
  },
  meta: { model: 'gemini-2.5-flash', demo: false, currency: 'INR', generation_ms: 18234 },
  overview: {
    title: '4 sunny days in Goa',
    summary:
      'A slow-paced coastal escape that balances North Goa’s lively beaches and sunset forts with the Portuguese lanes of Fontainhas and the quiet sands of the south. Expect long breakfasts, seafood thalis and golden-hour views every evening.',
    highlights: ['Sunset at Chapora Fort', 'Fontainhas heritage walk', 'Dolphin cruise from Sinquerim', 'Palolem beach day'],
    vibe: 'chill',
  },
  budget: {
    tier: 'moderate',
    travelers: 2,
    nights: 3,
    rooms: 1,
    total: 55000,
    allocation: { stay: 15000, transport: 16000, activities: 24000 },
  },
  stays: [
    {
      name: 'Whispering Palms Beach Resort',
      type: 'Boutique hotel',
      area: 'Candolim',
      highlight: 'Rooftop pool, a 5 minute walk to Candolim beach',
      price_per_night: 4600,
      total_cost: 13800,
      rating: 4.4,
      recommended: true,
      over_budget: false,
    },
    {
      name: 'Casa Anjuna',
      type: 'Heritage villa',
      area: 'Anjuna',
      highlight: 'Restored 19th-century Portuguese mansion with a garden pool',
      price_per_night: 6200,
      total_cost: 18600,
      rating: 4.6,
      recommended: false,
      over_budget: true,
    },
    {
      name: 'Ciarans Beach Resort',
      type: 'Beach huts',
      area: 'Palolem',
      highlight: 'Sea-facing cottages right on Palolem’s crescent beach',
      price_per_night: 3900,
      total_cost: 11700,
      rating: 4.2,
      recommended: false,
      over_budget: false,
    },
  ],
  transport_scope: 'intercity',
  transport: [
    {
      mode: 'flight',
      title: 'IndiGo / Air India, DEL → GOX',
      details: 'Daily non-stop flights to Manohar International (Mopa). Book 3–4 weeks ahead for the best fares.',
      duration: '2h 35m',
      total_cost: 14200,
      recommended: true,
      over_budget: false,
    },
    {
      mode: 'train',
      title: 'Goa Rajdhani Express (22413)',
      details: 'Hazrat Nizamuddin → Madgaon in 3AC. Overnight, scenic Konkan stretch on day two.',
      duration: '25h 40m',
      total_cost: 8600,
      recommended: false,
      over_budget: false,
    },
    {
      mode: 'bus',
      title: 'Volvo sleeper via Mumbai',
      details: 'Two legs with a change in Mumbai. Cheapest, but long — only if you enjoy road trips.',
      duration: '34h',
      total_cost: 7200,
      recommended: false,
      over_budget: false,
    },
    {
      mode: 'car',
      title: 'Self-drive via NH48',
      details: 'About 1,900 km via Jaipur and Pune. Plan two overnight halts; tolls and fuel included.',
      duration: '32h driving',
      total_cost: 26000,
      recommended: false,
      over_budget: true,
    },
  ],
  days: [
    {
      day: 1,
      title: 'Arrival, Candolim & a Sinquerim sunset',
      total_cost: 0,
      activities: [
        { time: '11:30', title: 'Land at Mopa and transfer to Candolim', description: 'Prepaid taxi from the airport counter; about 75 minutes along the new expressway.', area: 'Mopa', category: 'transit', cost: 2600, duration_minutes: 80, maps_query: 'Manohar International Airport, Mopa, Goa' },
        { time: '13:15', title: 'Lunch at Gunpowder', description: 'South Indian and Goan plates in an old Assagao house — try the pork vindaloo.', area: 'Assagao', category: 'food', cost: 1800, duration_minutes: 75, maps_query: 'Gunpowder, Assagao, Goa' },
        { time: '15:30', title: 'Check in and unwind by the pool', description: 'Settle in and nap off the travel day.', area: 'Candolim', category: 'stay', cost: 0, duration_minutes: 90, maps_query: '' },
        { time: '17:15', title: 'Fort Aguada and the lighthouse', description: 'A 17th-century Portuguese fort with sweeping views over the Mandovi estuary.', area: 'Sinquerim', category: 'sight', cost: 100, duration_minutes: 60, maps_query: 'Fort Aguada, Candolim, Goa' },
        { time: '18:30', title: 'Sunset at Sinquerim beach', description: 'Walk down to the sand as the sun drops behind the fort walls.', area: 'Sinquerim', category: 'nature', cost: 0, duration_minutes: 45, maps_query: 'Sinquerim Beach, Goa' },
        { time: '20:00', title: 'Dinner at Bomra’s', description: 'Modern Burmese in a fairy-lit garden; reserve a table in season.', area: 'Candolim', category: 'food', cost: 3200, duration_minutes: 90, maps_query: "Bomra's, Candolim, Goa" },
      ],
    },
    {
      day: 2,
      title: 'North Goa beaches & sunset forts',
      total_cost: 0,
      activities: [
        { time: '09:00', title: 'Breakfast at Artjuna Cafe', description: 'Garden café with shakshuka, smoothie bowls and a small design store.', area: 'Anjuna', category: 'food', cost: 900, duration_minutes: 60, maps_query: 'Artjuna Cafe, Anjuna, Goa' },
        { time: '10:30', title: 'Rent a scooter for the day', description: 'Easiest way to hop between beaches; carry your licence.', area: 'Anjuna', category: 'transit', cost: 500, duration_minutes: 20, maps_query: '' },
        { time: '11:00', title: 'Vagator & Ozran beach', description: 'Red laterite cliffs and a quieter cove below — swim at low tide.', area: 'Vagator', category: 'nature', cost: 0, duration_minutes: 120, maps_query: 'Ozran Beach, Vagator, Goa' },
        { time: '13:30', title: 'Lunch at Thalassa', description: 'Greek taverna on the cliff with sea views; go early to avoid the wait.', area: 'Vagator', category: 'food', cost: 2400, duration_minutes: 90, maps_query: 'Thalassa, Vagator, Goa' },
        { time: '16:00', title: 'Anjuna flea market', description: 'Wednesday market for textiles, silver and souvenirs — bargain politely.', area: 'Anjuna', category: 'shopping', cost: 1500, duration_minutes: 90, maps_query: 'Anjuna Flea Market, Goa' },
        { time: '18:00', title: 'Sunset at Chapora Fort', description: 'Short climb to the ramparts for one of Goa’s best sunsets.', area: 'Chapora', category: 'sight', cost: 0, duration_minutes: 60, maps_query: 'Chapora Fort, Goa' },
        { time: '20:30', title: 'Dinner and live music at Hilltop', description: 'Relaxed open-air venue; check the gig calendar for the night.', area: 'Vagator', category: 'nightlife', cost: 2200, duration_minutes: 120, maps_query: 'Hilltop Goa, Vagator' },
      ],
    },
    {
      day: 3,
      title: 'Old Goa & the Latin Quarter',
      total_cost: 0,
      activities: [
        { time: '09:30', title: 'Basilica of Bom Jesus', description: 'UNESCO-listed baroque church holding the relics of St Francis Xavier.', area: 'Old Goa', category: 'culture', cost: 0, duration_minutes: 60, maps_query: 'Basilica of Bom Jesus, Old Goa' },
        { time: '10:45', title: 'Se Cathedral & Church of St Francis of Assisi', description: 'Two more landmarks across the lawn; the museum next door is worth 20 minutes.', area: 'Old Goa', category: 'culture', cost: 100, duration_minutes: 75, maps_query: 'Se Cathedral, Old Goa' },
        { time: '12:30', title: 'Lunch at Viva Panjim', description: 'Family-run Goan kitchen tucked in a heritage lane — try the xacuti.', area: 'Panjim', category: 'food', cost: 1400, duration_minutes: 75, maps_query: 'Viva Panjim, Panaji, Goa' },
        { time: '14:15', title: 'Fontainhas heritage walk', description: 'Wander the colourful Latin Quarter, its azulejo tiles and tiny chapels.', area: 'Fontainhas', category: 'culture', cost: 0, duration_minutes: 90, maps_query: 'Fontainhas, Panaji, Goa' },
        { time: '16:30', title: 'Coffee at Cafe Bodega', description: 'Courtyard café inside Sunaparanta, with a small contemporary art gallery.', area: 'Altinho', category: 'food', cost: 700, duration_minutes: 60, maps_query: 'Cafe Bodega, Sunaparanta, Panaji' },
        { time: '18:00', title: 'Mandovi river sunset cruise', description: 'One-hour cruise with Goan folk dances on deck. Book the upper deck.', area: 'Panjim', category: 'sight', cost: 1200, duration_minutes: 60, maps_query: 'Santa Monica Jetty, Panaji' },
        { time: '20:00', title: 'Dinner at Black Sheep Bistro', description: 'Farm-to-table plates and inventive cocktails in a restored villa.', area: 'Panjim', category: 'food', cost: 3000, duration_minutes: 90, maps_query: 'Black Sheep Bistro, Panaji, Goa' },
      ],
    },
    {
      day: 4,
      title: 'Dolphins, a lazy lunch and departure',
      total_cost: 0,
      activities: [
        { time: '08:00', title: 'Dolphin-spotting boat trip', description: 'Early boats from Sinquerim jetty have the calmest water and the best sightings.', area: 'Sinquerim', category: 'adventure', cost: 1200, duration_minutes: 90, maps_query: 'Sinquerim Jetty, Goa' },
        { time: '10:00', title: 'Breakfast at Infantaria', description: 'Classic Calangute bakery — croissants, chorizo pao and filter coffee.', area: 'Calangute', category: 'food', cost: 800, duration_minutes: 60, maps_query: 'Infantaria, Calangute, Goa' },
        { time: '11:30', title: 'Spa hour at the hotel', description: 'A traditional Ayurvedic massage before the flight home.', area: 'Candolim', category: 'wellness', cost: 3000, duration_minutes: 60, maps_query: '' },
        { time: '13:00', title: 'Cashew & feni shopping at Kalangutkar', description: 'Pick up roasted cashews, bebinca and a bottle of feni.', area: 'Calangute', category: 'shopping', cost: 1200, duration_minutes: 45, maps_query: 'Kalangutkar Cashews, Calangute' },
        { time: '14:00', title: 'Seafood lunch at Souza Lobo', description: 'Beachfront institution since 1932 — the stuffed crab is a must.', area: 'Calangute', category: 'food', cost: 2000, duration_minutes: 75, maps_query: 'Souza Lobo, Calangute, Goa' },
        { time: '16:00', title: 'Transfer to Mopa airport', description: 'Leave at least two and a half hours before departure.', area: 'Mopa', category: 'transit', cost: 2600, duration_minutes: 80, maps_query: 'Manohar International Airport, Mopa, Goa' },
      ],
    },
  ],
  tips: [
    'Rent a scooter (₹400–500/day) for North Goa — carry your licence and always wear a helmet.',
    'Use the GoaMiles app for metered taxis; tourist taxis are pricier and fares are negotiated upfront.',
    'Wednesday is Anjuna flea market day; Saturday night markets run in Arpora.',
    'Carry cash for beach shacks and markets — many smaller places don’t take cards.',
    'Swim only where lifeguards have flagged safe zones; currents are strong in the afternoon.',
  ],
});

/* ── 6-hour Mumbai outing, no origin (local) ─────────────────────── */
// Budget model: share 0.75 → activities 2×3,000×0.75 = 4,500; transport
// 2×3,000×0.25×0.75 = 1,125 → 1,100; total 5,600.
export const sampleHoursTrip = withEstimate({
  id: 'f6e5d4c3b2a1',
  created_at: '2026-10-29T16:40:00Z',
  request: {
    destination: 'Mumbai',
    origin: '',
    start_date: '',
    plan_mode: 'hours',
    duration: 6,
    travelers: 2,
    companions: 'friends',
    budget: 'moderate',
    mood: 'cultural',
    pace: 'balanced',
    transport: 'train',
    interests: ['history', 'food', 'art'],
  },
  meta: { model: 'gemini-2.5-flash', demo: true, currency: 'INR', generation_ms: 9120 },
  overview: {
    title: 'Six hours in South Mumbai',
    summary:
      'A walkable loop through Colaba and Kala Ghoda — colonial landmarks, small galleries and Irani café classics — finishing with sunset on Marine Drive.',
    highlights: ['Gateway of India', 'Kala Ghoda art lanes', 'Marine Drive at dusk'],
    vibe: 'heritage',
  },
  budget: {
    tier: 'moderate',
    travelers: 2,
    nights: 0,
    rooms: 0,
    total: 5600,
    allocation: { stay: 0, transport: 1100, activities: 4500 },
  },
  stays: [],
  transport_scope: 'local',
  transport: [
    { mode: 'walk', title: 'Walk the Colaba–Fort loop', details: 'Most stops are within 15 minutes of each other on foot.', duration: '~4 km total', total_cost: 0, recommended: true, over_budget: false },
    { mode: 'cab', title: 'Uber / Ola for longer hops', details: 'Handy for Kala Ghoda → Marine Drive if it’s hot or raining.', duration: '10–20 min per ride', total_cost: 600, recommended: false, over_budget: false },
    { mode: 'other', title: 'BEST double-decker (open deck)', details: 'Heritage tour bus from the Gateway; runs evenings on weekends.', duration: '1h loop', total_cost: 300, recommended: false, over_budget: false },
    { mode: 'train', title: 'Local train to Churchgate', details: 'If you are coming from the suburbs, take the Western line to Churchgate.', duration: 'Varies', total_cost: 40, recommended: false, over_budget: false },
  ],
  days: [
    {
      day: 1,
      title: 'Colaba, Kala Ghoda & Marine Drive',
      total_cost: 0,
      activities: [
        { time: '12:00', title: 'Gateway of India & Taj Mahal Palace', description: 'Start at the waterfront arch and admire the Taj’s façade across the road.', area: 'Colaba', category: 'sight', cost: 0, duration_minutes: 40, maps_query: 'Gateway of India, Mumbai' },
        { time: '12:45', title: 'Lunch at Leopold Cafe', description: 'Iconic since 1871 — keema pav, chicken tikka and a cold drink.', area: 'Colaba', category: 'food', cost: 1400, duration_minutes: 60, maps_query: 'Leopold Cafe, Colaba, Mumbai' },
        { time: '14:00', title: 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya', description: 'Indo-Saracenic museum with superb miniature paintings and sculpture.', area: 'Fort', category: 'culture', cost: 1000, duration_minutes: 90, maps_query: 'CSMVS Museum, Mumbai' },
        { time: '15:45', title: 'Kala Ghoda art lanes', description: 'Browse Jehangir Art Gallery and the street murals around Rampart Row.', area: 'Kala Ghoda', category: 'culture', cost: 0, duration_minutes: 45, maps_query: 'Jehangir Art Gallery, Mumbai' },
        { time: '16:45', title: 'Chai and bun maska at Kyani & Co.', description: 'One of the last Irani cafés, open since 1904.', area: 'Dhobi Talao', category: 'food', cost: 400, duration_minutes: 30, maps_query: 'Kyani & Co, Mumbai' },
        { time: '17:30', title: 'Sunset walk on Marine Drive', description: 'Stroll the Queen’s Necklace toward Girgaum Chowpatty as the lights come on.', area: 'Marine Drive', category: 'nature', cost: 0, duration_minutes: 30, maps_query: 'Marine Drive, Mumbai' },
      ],
    },
  ],
  tips: [
    'Carry small change for cabs and street snacks; UPI works almost everywhere.',
    'Museums close on Mondays — check before you go.',
    'Avoid the 5–7 PM local train rush if you are heading back north.',
  ],
});

export default [sampleTrip, sampleHoursTrip];
