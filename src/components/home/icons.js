import {
  Baby, Bus, Car, Heart, Landmark, Mountain, Music, Plane, Sun, TrainFront, User, Users,
} from 'lucide-react';

/** lucide components for the icon names used in lib/planner.js option lists. */
export const PLANNER_ICONS = { Baby, Bus, Car, Heart, Landmark, Mountain, Music, Plane, Sun, TrainFront, User, Users };

/** Option list → SegmentedControl / Chip options with icon components. */
export const withIcons = (list) => list.map((o) => ({ ...o, icon: o.icon ? PLANNER_ICONS[o.icon] : undefined }));
