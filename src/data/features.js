/**
 * "Why TravelGenie" features on Home. Every claim here must stay true to what
 * the app actually does — no stats, no awards.
 *
 * icon: lucide-react component name (mapped in components/home/Features.jsx)
 * layout: 'wide' spans two columns of the bento grid; 'wide-lg' only on large screens
 * visual: optional illustration rendered inside the tile
 */
export const features = [
  {
    id: 'real-places',
    icon: 'MapPin',
    title: 'Real places, by name.',
    description:
      'Not “explore the local markets”. Gemini suggests specific cafés, forts, beaches and viewpoints — each one a tap away in Google Maps.',
    layout: 'wide',
    visual: 'itinerary',
  },
  {
    id: 'day-by-day',
    icon: 'CalendarDays',
    title: 'Day by day, stop by stop.',
    description: 'Timed stops with how long they take and what they cost — for a few hours or up to two weeks.',
    layout: 'narrow',
  },
  {
    id: 'stays-transport',
    icon: 'BedDouble',
    title: 'Stays and travel, compared.',
    description: 'Three places to stay and the ways to get there from your city, with the best fit marked.',
    layout: 'narrow',
  },
  {
    id: 'budget',
    icon: 'Wallet',
    title: 'A budget that adds up.',
    description:
      'See the total before you plan. Every stay, ride and activity is priced in rupees and checked against it — so you know if a plan runs over.',
    layout: 'wide',
    visual: 'budget',
  },
  {
    id: 'vibe-pace',
    icon: 'SlidersHorizontal',
    title: 'Your vibe. Your pace.',
    description: 'Relaxed or packed, romantic or party — the plan follows the mood, pace and interests you choose.',
    layout: 'wide-lg',
    visual: 'vibe',
  },
  {
    id: 'on-device',
    icon: 'Lock',
    title: 'Saved on your device.',
    description: 'No account, no sign-up. Your trips stay in this browser until you delete them.',
    layout: 'narrow',
  },
];
