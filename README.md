# TravelGenie

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.13.1-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TravelGenie** is an AI-powered travel planning web application that helps users discover destinations, plan personalized itineraries, and find perfect accommodations. With intelligent recommendations based on user preferences, TravelGenie makes travel planning seamless, smart, and enjoyable.

## Features

### Core Functionality
- **AI-Powered Trip Planning**: Generate personalized itineraries based on destination, duration, budget, mood, and travel preferences
- **Smart Search**: Comprehensive search with filters for destination, duration, budget range, mood, companions, pace, and transport mode
- **Interactive Planning**: Real-time trip matrix generation with stays, transport, and activities recommendations
- **Dynamic Replanning**: Update your trip plan on-the-fly by changing mood or plan type

### Destination Exploration
- Browse popular destinations with ratings, prices, and descriptions
- View detailed destination information including activities and booking options
- Filter destinations by interests (Beaches, Mountains, History, Food, Nightlife, Shopping, Nature)

### Accommodation Finder
- Discover handpicked hotels, resorts, and villas
- View amenities, ratings, and pricing
- Filter by location, type, and price range

### User Experience
- Responsive design for mobile, tablet, and desktop
- Smooth animations and transitions using Framer Motion
- Modern, clean UI with Tailwind CSS styling
- Easy navigation with React Router

## Tech Stack

### Frontend
- **React 19.2.0** - Modern React with latest features
- **Vite 7.3.1** - Fast development server and bundler
- **Tailwind CSS 4.2.1** - Utility-first CSS framework
- **React Router 7.13.1** - Client-side routing
- **Framer Motion 12.34.3** - Smooth animations
- **Lucide React 0.576.0** - Beautiful icons

### Development Tools
- **ESLint** - Code linting and quality control
- **TypeScript Support** - Ready for TypeScript integration

## Project Structure

```
travelgenie/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── logo.png
│   │   └── react.svg
│   ├── components/
│   │   ├── AIHighlight.jsx      # AI features showcase
│   │   ├── Destinations.jsx      # Popular destinations grid
│   │   ├── Footer.jsx           # Footer component
│   │   ├── Hero.jsx             # Hero section with trip planner
│   │   ├── HowItWorks.jsx        # 3-step process explanation
│   │   ├── Navbar.jsx           # Navigation bar
│   │   └── TripPlan.jsx          # Trip itinerary display
│   ├── data/
│   │   └── mockData.jsx         # Sample destinations and stays data
│   ├── pages/
│   │   ├── About.jsx            # About page with team info
│   │   ├── DestinationDetails.jsx # Single destination details
│   │   ├── Explore.jsx           # All destinations page
│   │   ├── Home.jsx              # Main landing page
│   │   ├── Stays.jsx             # Accommodations page
│   │   └── TripResult.jsx        # Generated trip plan display
│   ├── App.jsx                  # Main app with routes
│   ├── index.css                # Global styles
│   └── main.jsx                 # React entry point
├── .github/
│   └── copilot-instructions.md
├── .vite/
│   └── deps/                    # Vite dependencies
├── node_modules/
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+ or yarn 1.22+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/anshyadav/TravelGenie.git
cd TravelGenie
```

2. Install dependencies:
```bash
npm install
# or
 yarn install
```

3. Start the development server:
```bash
npm run dev
# or
 yarn dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server with hot module replacement |
| `npm run build` | Creates a production-ready build in the `dist` directory |
| `npm run lint` | Runs ESLint to check for code quality issues |
| `npm run preview` | Preview the production build locally |

## Usage

### Planning a Trip
1. Visit the homepage and fill out the trip planner form
2. Enter your destination and duration
3. Select your preferences:
   - **Plan Type**: Day-wise or Hour-wise
   - **Budget Range**: Budget Friendly, Moderate, Luxury, Ultra Luxury
   - **Mood**: Relaxing, Adventure, Romantic, Cultural, Party
   - **Companions**: Solo, Couple, Friends, Family
   - **Pace**: Chill, Moderate, Fast Paced
   - **Transport**: Flight, Train, Bus, Car Rental
4. Click "Generate Trip" to create your personalized itinerary

### Exploring Destinations
- Navigate to **/explore** to browse all available destinations
- Click on any destination to view details, activities, and booking options
- Use the search functionality to find specific destinations

### Finding Accommodations
- Visit **/stays** to browse luxury accommodations
- View detailed information about each property including amenities and pricing
- Filter by location and type

### Updating Your Plan
- On the trip result page, change mood or plan type
- Click "Update Plan" to regenerate your itinerary with new preferences

## AI Integration

TravelGenie connects to a backend AI service (running on port 8000) that:
- Analyzes user preferences and constraints
- Generates optimized itineraries with:
  - Smart stay recommendations within budget
  - Transport options with cost estimates
  - Activity suggestions based on mood and pace
  - Budget allocation and tracking
- Provides real-time replanning capabilities

### Backend Setup
To use the AI planning features, ensure your backend server is running:
```bash
# The app expects the backend at: http://localhost:8000
# Endpoint: /plan_trip?location={destination}&duration={days}&budget={range}&mood={mood}&...
```

## Configuration

### Environment Variables
Create a `.env` file in the project root for custom configuration:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=TravelGenie
```

### Tailwind CSS
The project uses Tailwind CSS v4 with the following configuration in `vite.config.js`:
```javascript
import tailwindcss from '@tailwindcss/vite'
```

## Data Structure

### Destinations
Each destination includes:
- `id`: Unique identifier
- `name`: Destination name
- `image`: URL to destination image
- `price`: Starting price
- `rating`: Average rating (1-5)
- `description`: Brief overview
- `booking`: Flight, hotel, and package pricing
- `activities`: Array of popular activities with descriptions

### Stays
Each accommodation includes:
- `id`: Unique identifier
- `name`: Property name
- `location`: City/region
- `image`: URL to property image
- `rating`: Average rating (1-5)
- `price`: Nightly rate
- `type`: Property type (Luxury Resort, Heritage Hotel, etc.)
- `amenities`: Array of available amenities

### AI Trip Plan Response
The backend returns a trip matrix with:
- `stays`: Accommodation options with budget tracking
- `transport`: Transportation options and costs
- `places_to_visit`: Activities and budget allocation
- `the_scene`: Mood and visual theme information
- `itinerary`: Detailed day-by-day or hour-by-hour plan

## UI Components

### Navigation
- Responsive navbar with mobile menu
- Scroll-aware styling (transparent to solid)
- Active route highlighting

### Animations
- Page transitions with Framer Motion
- Staggered animations for lists and grids
- Hover effects on cards and buttons
- Loading states with spinner animations

### Design System
- **Colors**: Primary blue, purple gradients, neutral grays
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Shadows**: Layered shadows for depth
- **Border Radius**: Rounded corners throughout

## Screenshots

### Home Page
- Hero section with trip planner form
- AI-powered features showcase
- Popular destinations grid
- How it works guide

### Explore Page
- Search functionality
- Destinations grid with ratings and prices
- Filter by interests

### Destination Details
- Full-screen destination image
- Detailed information and activities
- Booking options (flight, hotel, package)

### Stays Page
- Accommodation cards with images
- Amenities and pricing
- Location and type filters

### Trip Result
- Comprehensive trip matrix
- Budget allocation visualization
- Day-by-day itinerary
- Real-time replanning controls

## API Integration

### Trip Planning Endpoint
```
GET /plan_trip?location={string}&duration={number}&budget={string}&mood={string}&plan_mode={string}&companions={string}&pace={string}&transport={string}
```

**Request Parameters:**
- `location`: Destination name (required)
- `duration`: Number of days or hours (required)
- `budget`: Budget range preference
- `mood`: Travel mood preference
- `plan_mode`: 'Day-wise' or 'Hour-wise'
- `companions`: Travel companions type
- `pace`: Travel pace preference
- `transport`: Preferred transport mode

**Response:**
```json
{
  "matrix": {
    "stays": {
      "budget_allocated": 50000,
      "options": [
        {
          "name": "Luxury Resort",
          "type": "Beach Resort",
          "amenity": "Private Pool",
          "total_cost": 45000,
          "is_over_budget": false
        }
      ]
    },
    "transport": {
      "budget_allocated": 20000,
      "options": [...]
    },
    "places_to_visit": {
      "budget_allocated": 30000,
      "remaining_budget": 5000,
      "mood": "Relaxing",
      "companions": "Solo",
      "pace": "Moderate"
    },
    "the_scene": {
      "visual_cue": "Sun",
      "mood": "Peaceful",
      "category": "Beach"
    },
    "itinerary": {
      "planning_mode": "Day-wise",
      "density": "Balanced",
      "duration": 7,
      "daily_plan": [...]
    }
  }
}
```

## Team

| Name | Role | Avatar |
|------|------|--------|
| Ansh Yadav | Developer | ![Ansh](https://ui-avatars.com/api/?name=Ansh+Yadav&background=0D8ABC&color=fff&size=64) |
| Taraksh Pratap Singh | Developer | ![Taraksh](https://ui-avatars.com/api/?name=Taraksh+Pratap+Singh&background=0D8ABC&color=fff&size=64) |
| Dishan Kumar | Developer | ![Dishan](https://ui-avatars.com/api/?name=Dishan+Kumar&background=6366f1&color=fff&size=64) |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Use functional components with React hooks
- Follow consistent naming conventions
- Keep components focused and reusable
- Add meaningful comments for complex logic
- Use semantic HTML and ARIA labels

### Commit Messages
Use clear, descriptive commit messages following conventional commits:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation updates
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test-related changes
- `chore`: Maintenance tasks

## Roadmap

### Future Enhancements
- [ ] User authentication and profiles
- [ ] Save and manage trip plans
- [ ] Real booking integration
- [ ] Reviews and ratings system
- [ ] Multi-destination trips
- [ ] Collaborative planning
- [ ] Weather-aware recommendations
- [ ] Local events integration

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit and integration tests
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] PWA support
- [ ] Offline functionality

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 100+ |
| Firefox | 100+ |
| Safari | 15+ |
| Edge | 100+ |
| Opera | 90+ |

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Static Build
```bash
npm run build
# Deploy the dist/ directory to any static hosting
```

## Troubleshooting

### Common Issues

**Backend connection failed:**
```
Ensure your AI backend is running at http://localhost:8000
Check CORS settings on the backend server
```

**Build fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Animation issues:**
```
Check Framer Motion version compatibility
Ensure React 18+ is installed
```

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://react.dev/) - A JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Rapidly build modern websites
- [Framer Motion](https://www.framer.com/motion/) - Production-ready animations
- [Lucide](https://lucide.dev/) - Beautiful and consistent icons
- [React Router](https://reactrouter.com/) - Routing for React applications

## Support

For questions, issues, or feedback, please open an issue on GitHub or contact the maintainers.

---

**Built with love and AI by TravelGenie Team**

*Travel smarter, discover more*

[![Star on GitHub](https://img.shields.io/github/stars/anshyadav/TravelGenie.svg?style=social)](https://github.com/anshyadav/TravelGenie/stargazers)
[![Fork on GitHub](https://img.shields.io/github/forks/anshyadav/TravelGenie.svg?style=social)](https://github.com/anshyadav/TravelGenie/network)
[![Issues](https://img.shields.io/github/issues/anshyadav/TravelGenie.svg)](https://github.com/anshyadav/TravelGenie/issues)
