/**
 * Curated destinations shown on Home / Explore and used for planner
 * suggestions. `startingPrice` is an indicative per-person cost (INR) for
 * `idealDays` at a moderate budget — twin-share stay, food, local transport
 * and entry fees, excluding travel to the destination. `tags` use planner
 * INTERESTS ids.
 *
 * Shape (keep stable — Home, Explore, Plan and DestinationDetails rely on it):
 * { slug, name, region, tagline, description, image, tags[], bestTime,
 *   idealDays, startingPrice, rating, highlights: [{ name, description }] }
 *
 * Every image is a verified Unsplash photo of the place itself. Leave
 * `image: ''` rather than use a photo of somewhere else — SmartImage renders
 * a gradient fallback.
 */
const img = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const destinations = [
  {
    slug: 'goa',
    name: 'Goa',
    region: 'Goa',
    tagline: 'Sun, sand and Portuguese soul.',
    description:
      'India’s smallest state packs in palm-fringed beaches, whitewashed baroque churches and a food culture all its own. Spend lazy days in the quieter south, sunsets at a clifftop fort in the north, and evenings over xacuti and feni in Panjim’s Latin Quarter.',
    image: img('photo-1512343879784-a960bf40e7f2'),
    tags: ['beaches', 'nightlife', 'food', 'history', 'adventure-sports'],
    bestTime: 'Nov – Feb',
    idealDays: 4,
    startingPrice: 16000,
    rating: 4.7,
    highlights: [
      { name: 'Fontainhas', description: 'Wander Panjim’s Latin Quarter of ochre and indigo Portuguese-era houses.' },
      { name: 'Old Goa churches', description: 'The Basilica of Bom Jesus and Sé Cathedral, a UNESCO World Heritage site.' },
      { name: 'Palolem and Agonda', description: 'Calm, crescent-shaped beaches in the south, made for swimming and kayaking.' },
    ],
  },
  {
    slug: 'manali',
    name: 'Manali',
    region: 'Himachal Pradesh',
    tagline: 'Snow peaks and pine-scented valleys.',
    description:
      'A Himalayan town at the head of the Kullu valley, ringed by deodar forest and snow-capped peaks. Base yourself in Old Manali’s cafés, then head out for paragliding in Solang, hot springs at Vashisht, or the drive over Atal Tunnel into Lahaul.',
    image: img('photo-1626621341517-bbf3d9990a23'),
    tags: ['mountains', 'adventure-sports', 'nature'],
    bestTime: 'Oct – Jun',
    idealDays: 5,
    startingPrice: 17000,
    rating: 4.6,
    highlights: [
      { name: 'Solang Valley', description: 'Paragliding and zorbing in summer, skiing and snow play in winter.' },
      { name: 'Hadimba Temple', description: 'A 16th-century wooden temple in a cedar forest above town.' },
      { name: 'Atal Tunnel & Sissu', description: 'Cross under the Rohtang ridge to waterfalls and high-altitude Lahaul.' },
    ],
  },
  {
    slug: 'jaipur',
    name: 'Jaipur',
    region: 'Rajasthan',
    tagline: 'The Pink City of forts and palaces.',
    description:
      'Rajasthan’s capital is a planned 18th-century city of terracotta-pink bazaars, hilltop forts and royal palaces. It rewards early starts — Amber Fort before the crowds, Hawa Mahal at sunrise — and long afternoons hunting block prints and blue pottery.',
    image: img('photo-1477587458883-47145ed94245'),
    tags: ['history', 'shopping', 'food', 'art'],
    bestTime: 'Oct – Mar',
    idealDays: 3,
    startingPrice: 11000,
    rating: 4.6,
    highlights: [
      { name: 'Amber Fort', description: 'A hilltop fort of mirrored halls and courtyards overlooking Maota Lake.' },
      { name: 'Hawa Mahal', description: 'The honeycombed Palace of Winds, best seen in early morning light.' },
      { name: 'Johari & Bapu Bazaar', description: 'Gemstones, block-printed textiles and mojris in the old city.' },
    ],
  },
  {
    slug: 'udaipur',
    name: 'Udaipur',
    region: 'Rajasthan',
    tagline: 'Lakes, palaces and golden sunsets.',
    description:
      'The City of Lakes rises in white marble from the banks of Lake Pichola, with the Aravalli hills behind. Slow down here: a boat at sunset, rooftop dinners facing the City Palace, and miniature-painting studios in the lanes of the old city.',
    image: img('photo-1615836245337-f5b9b2303f10'),
    tags: ['history', 'art', 'wellness', 'food'],
    bestTime: 'Sep – Mar',
    idealDays: 3,
    startingPrice: 12000,
    rating: 4.7,
    highlights: [
      { name: 'Lake Pichola', description: 'A sunset boat ride past the Lake Palace and Jag Mandir.' },
      { name: 'City Palace', description: 'A sprawling complex of courtyards, balconies and museums above the lake.' },
      { name: 'Bagore Ki Haveli', description: 'An 18th-century mansion with an evening show of Rajasthani folk dance.' },
    ],
  },
  {
    slug: 'kerala',
    name: 'Kerala',
    region: 'Kerala',
    tagline: 'Backwaters, tea hills and spice-scented coast.',
    description:
      'A green ribbon along India’s southwest coast: palm-lined backwaters around Alleppey, tea estates in the hills of Munnar, and the old spice port of Fort Kochi. Add Ayurveda, Kathakali and a seafood thali and you have one of India’s easiest, most restful trips.',
    image: img('photo-1602216056096-3b40cc0c9944'),
    tags: ['nature', 'wellness', 'beaches', 'food'],
    bestTime: 'Sep – Mar',
    idealDays: 5,
    startingPrice: 20000,
    rating: 4.8,
    highlights: [
      { name: 'Alleppey houseboat', description: 'An overnight cruise through the Kuttanad backwaters.' },
      { name: 'Munnar tea estates', description: 'Rolling tea gardens, misty viewpoints and Eravikulam National Park.' },
      { name: 'Fort Kochi', description: 'Chinese fishing nets, Jew Town and a Kathakali performance.' },
    ],
  },
  {
    slug: 'ladakh',
    name: 'Ladakh',
    region: 'Ladakh',
    tagline: 'High passes, blue lakes, quiet monasteries.',
    description:
      'A high-altitude desert on the roof of India, where whitewashed gompas cling to ochre cliffs and the lakes turn impossible shades of blue. Plan two slow days in Leh to acclimatise before heading to Nubra and Pangong.',
    image: img('photo-1581793745862-99fde7fa73d2'),
    tags: ['mountains', 'adventure-sports', 'nature'],
    bestTime: 'May – Sep',
    idealDays: 7,
    startingPrice: 28000,
    rating: 4.9,
    highlights: [
      { name: 'Pangong Tso', description: 'A 134 km-long lake that shifts from turquoise to deep blue.' },
      { name: 'Nubra Valley', description: 'Sand dunes, Bactrian camels and Diskit Monastery, reached via Khardung La.' },
      { name: 'Thiksey Monastery', description: 'Join the monks’ morning prayers in this hilltop gompa near Leh.' },
    ],
  },
  {
    slug: 'varanasi',
    name: 'Varanasi',
    region: 'Uttar Pradesh',
    tagline: 'The ancient city on the Ganges.',
    description:
      'One of the world’s oldest living cities, Varanasi unfolds along 80-odd ghats on the western bank of the Ganges. Come for the dawn boat ride and the evening aarti, and stay for the labyrinthine lanes, silk weavers and some of the best street food in North India.',
    image: img('photo-1561361058-c24cecae35ca'),
    tags: ['history', 'food', 'art', 'wellness'],
    bestTime: 'Oct – Mar',
    idealDays: 3,
    startingPrice: 9000,
    rating: 4.6,
    highlights: [
      { name: 'Ganga Aarti', description: 'The nightly fire ceremony at Dashashwamedh Ghat.' },
      { name: 'Sunrise boat ride', description: 'Drift past the ghats as the city wakes up.' },
      { name: 'Sarnath', description: 'The deer park where the Buddha gave his first sermon, 10 km away.' },
    ],
  },
  {
    slug: 'rishikesh',
    name: 'Rishikesh',
    region: 'Uttarakhand',
    tagline: 'Yoga, white water and the Himalayan foothills.',
    description:
      'Where the Ganges leaves the mountains, Rishikesh balances ashrams and yoga schools with some of India’s best white-water rafting. Mornings are for a class by the river, afternoons for rapids or a forest trek, evenings for the aarti at Triveni Ghat.',
    image: img('photo-1650341259809-9314b0de9268'),
    tags: ['wellness', 'adventure-sports', 'nature', 'mountains'],
    bestTime: 'Sep – May',
    idealDays: 3,
    startingPrice: 9000,
    rating: 4.6,
    highlights: [
      { name: 'Rafting on the Ganges', description: 'Grade III–IV rapids on the stretch from Shivpuri.' },
      { name: 'Ram Jhula & Janki Setu', description: 'Walk the suspension bridges over the river to the ashram side.' },
      { name: 'Triveni Ghat aarti', description: 'An evening ceremony of lamps, bells and chanting by the water.' },
    ],
  },
  {
    slug: 'darjeeling',
    name: 'Darjeeling',
    region: 'West Bengal',
    tagline: 'Tea gardens under Kanchenjunga.',
    description:
      'A colonial hill station draped over a ridge in the eastern Himalayas, facing the world’s third-highest peak. Wake early for sunrise at Tiger Hill, ride the UNESCO-listed toy train, and taste first-flush tea where it is grown.',
    image: img('photo-1724159609417-0b84ff619e7c'),
    tags: ['mountains', 'nature', 'food'],
    bestTime: 'Oct – May',
    idealDays: 4,
    startingPrice: 13000,
    rating: 4.6,
    highlights: [
      { name: 'Tiger Hill sunrise', description: 'First light on Kanchenjunga — and, on clear days, Everest.' },
      { name: 'Darjeeling Himalayan Railway', description: 'The steam toy train loop to Ghum and the Batasia Loop.' },
      { name: 'Happy Valley Tea Estate', description: 'A working estate with factory tours and tastings.' },
    ],
  },
  {
    slug: 'andaman',
    name: 'Andaman Islands',
    region: 'Andaman & Nicobar Islands',
    tagline: 'Turquoise water and coral reefs.',
    description:
      'An archipelago in the Bay of Bengal with powder-white beaches, rainforest and some of India’s clearest water. Fly into Port Blair, then take the ferry to Havelock (Swaraj Dweep) and Neil for snorkelling, diving and long, unhurried beach days.',
    image: img('photo-1586359716568-3e1907e4cf9f'),
    tags: ['beaches', 'adventure-sports', 'nature', 'history'],
    bestTime: 'Nov – Apr',
    idealDays: 5,
    startingPrice: 24000,
    rating: 4.8,
    highlights: [
      { name: 'Radhanagar Beach', description: 'A wide, quiet beach on Havelock, famous for its sunsets.' },
      { name: 'Scuba at Havelock', description: 'Beginner-friendly dives over coral reefs.' },
      { name: 'Cellular Jail', description: 'The colonial-era prison in Port Blair and its evening light show.' },
    ],
  },
  {
    slug: 'hampi',
    name: 'Hampi',
    region: 'Karnataka',
    tagline: 'A lost empire among the boulders.',
    description:
      'The ruins of Vijayanagara, once one of the richest cities on earth, lie scattered across a surreal landscape of granite boulders and banana groves. Explore temples by bicycle, cross the river by coracle and climb a hill for sunset.',
    image: img('photo-1596018382916-56d2e341d784'),
    tags: ['history', 'art', 'nature'],
    bestTime: 'Oct – Feb',
    idealDays: 3,
    startingPrice: 8000,
    rating: 4.7,
    highlights: [
      { name: 'Vittala Temple', description: 'The iconic stone chariot and the musical pillars.' },
      { name: 'Virupaksha Temple', description: 'A living temple, in worship since the 7th century.' },
      { name: 'Matanga Hill', description: 'A short scramble to the best sunrise view over the ruins.' },
    ],
  },
  {
    slug: 'agra',
    name: 'Agra',
    region: 'Uttar Pradesh',
    tagline: 'Home of the Taj Mahal.',
    description:
      'Agra is the Mughal heartland: the Taj Mahal, the red-sandstone Agra Fort and, an hour away, the abandoned capital of Fatehpur Sikri. Two days lets you see the Taj at both sunrise and sunset — it looks different every time.',
    image: img('photo-1564507592333-c60657eea523'),
    tags: ['history', 'art', 'food'],
    bestTime: 'Oct – Mar',
    idealDays: 2,
    startingPrice: 7000,
    rating: 4.7,
    highlights: [
      { name: 'Taj Mahal at sunrise', description: 'Arrive at opening for soft light and thinner crowds (closed Fridays).' },
      { name: 'Agra Fort', description: 'The Mughal citadel where Shah Jahan spent his final years.' },
      { name: 'Mehtab Bagh', description: 'Riverside gardens with a sunset view of the Taj across the Yamuna.' },
    ],
  },
  {
    slug: 'amritsar',
    name: 'Amritsar',
    region: 'Punjab',
    tagline: 'The Golden Temple and Punjabi soul.',
    description:
      'The spiritual heart of Sikhism and a city that lives to eat. See the Golden Temple at dawn and again lit up at night, share a meal at the langar that feeds tens of thousands a day, and save room for kulchas and lassi.',
    image: img('photo-1621377099913-ac1ec4848e52'),
    tags: ['history', 'food', 'shopping'],
    bestTime: 'Oct – Mar',
    idealDays: 2,
    startingPrice: 7000,
    rating: 4.8,
    highlights: [
      { name: 'Harmandir Sahib', description: 'The Golden Temple and its sarovar, open around the clock.' },
      { name: 'Attari–Wagah border', description: 'The flag-lowering ceremony at the India–Pakistan border.' },
      { name: 'Old city food trail', description: 'Amritsari kulcha, fish fry and thick lassi in the lanes near the temple.' },
    ],
  },
  {
    slug: 'mumbai',
    name: 'Mumbai',
    region: 'Maharashtra',
    tagline: 'The city that never slows down.',
    description:
      'India’s biggest city is a collision of Victorian Gothic, Art Deco and glass towers, held together by trains, street food and the sea. Walk South Mumbai’s heritage precincts, eat your way through vada pav and Irani cafés, and end every day on the seafront.',
    image: img('photo-1566552881560-0be862a7c445'),
    tags: ['food', 'nightlife', 'shopping', 'art', 'history'],
    bestTime: 'Nov – Feb',
    idealDays: 3,
    startingPrice: 15000,
    rating: 4.6,
    highlights: [
      { name: 'Marine Drive', description: 'The Queen’s Necklace, best at dusk when the streetlights come on.' },
      { name: 'Elephanta Caves', description: 'Rock-cut Shiva temples, an hour by ferry from the Gateway of India.' },
      { name: 'Kala Ghoda', description: 'Galleries, Art Deco buildings and cafés in the arts district.' },
    ],
  },
  {
    slug: 'pondicherry',
    name: 'Pondicherry',
    region: 'Puducherry',
    tagline: 'French boulevards by the sea.',
    description:
      'A former French colony on the Bay of Bengal, where mustard-yellow villas, bougainvillea and bilingual street signs line the White Town. Cycle the seafront promenade at dawn, eat croissants and Tamil thalis on the same day, and visit Auroville just north of town.',
    image: img('photo-1677951221673-09be408d2ddf'),
    tags: ['beaches', 'history', 'wellness', 'food', 'art'],
    bestTime: 'Oct – Mar',
    idealDays: 3,
    startingPrice: 11000,
    rating: 4.6,
    highlights: [
      { name: 'White Town', description: 'Cycle the French Quarter’s colonial streets and cafés.' },
      { name: 'Promenade Beach', description: 'A 1.5 km seafront walk that goes car-free in the evenings.' },
      { name: 'Auroville', description: 'The experimental township and its golden Matrimandir.' },
    ],
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    region: 'Tamil Nadu',
    tagline: 'Temples, filter coffee and the Bay of Bengal.',
    description:
      'The gateway to South India is a city of Dravidian temples, Carnatic music, and the best filter coffee and tiffin anywhere. Pair it with a day trip to the shore temples of Mahabalipuram, a UNESCO site an hour down the coast.',
    image: img('photo-1582510003544-4d00b7f74220'),
    tags: ['history', 'food', 'beaches', 'art'],
    bestTime: 'Nov – Feb',
    idealDays: 3,
    startingPrice: 10000,
    rating: 4.4,
    highlights: [
      { name: 'Kapaleeshwarar Temple', description: 'A towering, painted gopuram in the old neighbourhood of Mylapore.' },
      { name: 'Mahabalipuram', description: 'The 8th-century Shore Temple and rock-cut monuments.' },
      { name: 'Marina Beach', description: 'An evening stroll on one of the longest urban beaches in the world.' },
    ],
  },
];

export const getDestination = (slug) => destinations.find((d) => d.slug === slug) || null;

/** Find a curated destination by free-text name (case-insensitive). */
export const findDestinationByName = (name) => {
  const q = String(name || '').trim().toLowerCase();
  return q ? destinations.find((d) => d.name.toLowerCase() === q) || null : null;
};
