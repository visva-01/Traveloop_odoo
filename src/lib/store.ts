// Local-first data layer. Swap implementation later for a MySQL-backed API
// without changing call sites — every function is async and returns plain JSON.

export type ID = string;

export interface User {
  id: ID;
  name: string;
  email: string;
  password: string; // demo only — replace with hashed server auth
  avatar?: string;
  language?: string;
  isAdmin?: boolean;
  createdAt: number;
}

export interface Activity {
  id: ID;
  name: string;
  category: "Sightseeing" | "Food" | "Adventure" | "Culture" | "Nightlife" | "Nature" | "Shopping";
  cost: number;
  durationHours: number;
  description?: string;
  time?: string; // HH:MM
}

export interface Stop {
  id: ID;
  city: string;
  country: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  stayCost: number;
  transportCost: number;
  mealsPerDay: number;
  activities: Activity[];
  order: number;
}

export interface Note {
  id: ID;
  stopId?: ID;
  text: string;
  createdAt: number;
}

export interface PackItem {
  id: ID;
  label: string;
  category: "Clothing" | "Documents" | "Electronics" | "Toiletries" | "Other";
  packed: boolean;
}

export interface Trip {
  id: ID;
  ownerId: ID;
  name: string;
  description: string;
  cover?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  isPublic: boolean;
  shareSlug: string;
  stops: Stop[];
  notes: Note[];
  packing: PackItem[];
  createdAt: number;
}

export interface City {
  name: string;
  country: string;
  region: string;
  costIndex: number; // 1-5
  popularity: number; // 1-5
  highlights: string[];
}

export interface ActivityCatalogItem {
  city: string;
  name: string;
  category: Activity["category"];
  cost: number;
  durationHours: number;
  description: string;
}

const KEYS = {
  users: "tl.users",
  trips: "tl.trips",
  session: "tl.session",
  theme: "tl.theme",
};

const isBrowser = () => typeof window !== "undefined";

function read<T>(k: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, v: T) {
  if (!isBrowser()) return;
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("tl:change", { detail: k }));
}

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// --- Users / auth -----------------------------------------------------------
export async function listUsers(): Promise<User[]> {
  return read<User[]>(KEYS.users, []);
}
export async function signup(input: { name: string; email: string; password: string }) {
  const users = await listUsers();
  if (users.find((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const isFirst = users.length === 0;
  const user: User = {
    id: uid(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    isAdmin: isFirst, // first user becomes admin in demo
    createdAt: Date.now(),
  };
  write(KEYS.users, [...users, user]);
  write(KEYS.session, user.id);
  return user;
}
export async function login(email: string, password: string) {
  const users = await listUsers();
  const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u || u.password !== password) throw new Error("Invalid email or password.");
  write(KEYS.session, u.id);
  return u;
}
export async function logout() {
  if (isBrowser()) localStorage.removeItem(KEYS.session);
  if (isBrowser()) window.dispatchEvent(new CustomEvent("tl:change", { detail: KEYS.session }));
}
export function currentUserId(): ID | null {
  return read<ID | null>(KEYS.session, null);
}
export async function currentUser(): Promise<User | null> {
  const id = currentUserId();
  if (!id) return null;
  const users = await listUsers();
  return users.find((u) => u.id === id) ?? null;
}
export async function updateUser(patch: Partial<User>) {
  const id = currentUserId();
  if (!id) throw new Error("Not signed in");
  const users = await listUsers();
  const next = users.map((u) => (u.id === id ? { ...u, ...patch } : u));
  write(KEYS.users, next);
  return next.find((u) => u.id === id)!;
}
export async function deleteAccount() {
  const id = currentUserId();
  if (!id) return;
  const users = (await listUsers()).filter((u) => u.id !== id);
  const trips = (await listAllTrips()).filter((t) => t.ownerId !== id);
  write(KEYS.users, users);
  write(KEYS.trips, trips);
  await logout();
}
export async function resetPassword(email: string, newPassword: string) {
  const users = await listUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) throw new Error("No account with that email.");
  users[idx].password = newPassword;
  write(KEYS.users, users);
}

// --- Trips ------------------------------------------------------------------
export async function listAllTrips(): Promise<Trip[]> {
  return read<Trip[]>(KEYS.trips, []);
}
export async function listTrips(): Promise<Trip[]> {
  const id = currentUserId();
  if (!id) return [];
  return (await listAllTrips()).filter((t) => t.ownerId === id);
}
export async function getTrip(id: ID): Promise<Trip | null> {
  return (await listAllTrips()).find((t) => t.id === id) ?? null;
}
export async function getTripBySlug(slug: string): Promise<Trip | null> {
  return (await listAllTrips()).find((t) => t.shareSlug === slug && t.isPublic) ?? null;
}
export async function createTrip(
  input: Pick<Trip, "name" | "description" | "startDate" | "endDate"> & {
    cover?: string;
    budget?: number;
  },
): Promise<Trip> {
  const ownerId = currentUserId();
  if (!ownerId) throw new Error("Sign in to create a trip.");
  const trip: Trip = {
    id: uid(),
    ownerId,
    name: input.name.trim(),
    description: input.description.trim(),
    cover: input.cover,
    startDate: input.startDate,
    endDate: input.endDate,
    budget: input.budget,
    isPublic: false,
    shareSlug: uid(),
    stops: [],
    notes: [],
    packing: defaultPacking(),
    createdAt: Date.now(),
  };
  write(KEYS.trips, [...(await listAllTrips()), trip]);
  return trip;
}
export async function updateTrip(id: ID, patch: Partial<Trip>) {
  const all = await listAllTrips();
  const next = all.map((t) => (t.id === id ? { ...t, ...patch } : t));
  write(KEYS.trips, next);
  return next.find((t) => t.id === id)!;
}
export async function deleteTrip(id: ID) {
  write(KEYS.trips, (await listAllTrips()).filter((t) => t.id !== id));
}
export async function duplicateTrip(id: ID): Promise<Trip | null> {
  const t = await getTrip(id);
  const ownerId = currentUserId();
  if (!t || !ownerId) return null;
  const copy: Trip = {
    ...t,
    id: uid(),
    ownerId,
    name: `${t.name} (Copy)`,
    isPublic: false,
    shareSlug: uid(),
    createdAt: Date.now(),
  };
  write(KEYS.trips, [...(await listAllTrips()), copy]);
  return copy;
}

// --- Stops / Activities / Notes / Packing ----------------------------------
export async function addStop(tripId: ID, stop: Omit<Stop, "id" | "order" | "activities"> & { activities?: Activity[] }) {
  const t = await getTrip(tripId);
  if (!t) throw new Error("Trip not found");
  const newStop: Stop = {
    ...stop,
    id: uid(),
    order: t.stops.length,
    activities: stop.activities ?? [],
  };
  return updateTrip(tripId, { stops: [...t.stops, newStop] });
}
export async function updateStop(tripId: ID, stopId: ID, patch: Partial<Stop>) {
  const t = await getTrip(tripId);
  if (!t) return null;
  return updateTrip(tripId, {
    stops: t.stops.map((s) => (s.id === stopId ? { ...s, ...patch } : s)),
  });
}
export async function removeStop(tripId: ID, stopId: ID) {
  const t = await getTrip(tripId);
  if (!t) return null;
  return updateTrip(tripId, {
    stops: t.stops.filter((s) => s.id !== stopId).map((s, i) => ({ ...s, order: i })),
  });
}
export async function reorderStops(tripId: ID, stopIds: ID[]) {
  const t = await getTrip(tripId);
  if (!t) return null;
  const map = new Map(t.stops.map((s) => [s.id, s]));
  const next = stopIds.map((id, i) => ({ ...(map.get(id) as Stop), order: i }));
  return updateTrip(tripId, { stops: next });
}
export async function addActivity(tripId: ID, stopId: ID, activity: Omit<Activity, "id">) {
  const t = await getTrip(tripId);
  if (!t) return null;
  const a: Activity = { ...activity, id: uid() };
  return updateTrip(tripId, {
    stops: t.stops.map((s) => (s.id === stopId ? { ...s, activities: [...s.activities, a] } : s)),
  });
}
export async function removeActivity(tripId: ID, stopId: ID, activityId: ID) {
  const t = await getTrip(tripId);
  if (!t) return null;
  return updateTrip(tripId, {
    stops: t.stops.map((s) =>
      s.id === stopId ? { ...s, activities: s.activities.filter((a) => a.id !== activityId) } : s,
    ),
  });
}
export async function addNote(tripId: ID, text: string, stopId?: ID) {
  const t = await getTrip(tripId);
  if (!t) return null;
  const note: Note = { id: uid(), text, stopId, createdAt: Date.now() };
  return updateTrip(tripId, { notes: [note, ...t.notes] });
}
export async function updateNote(tripId: ID, noteId: ID, text: string) {
  const t = await getTrip(tripId);
  if (!t) return null;
  return updateTrip(tripId, {
    notes: t.notes.map((n) => (n.id === noteId ? { ...n, text } : n)),
  });
}
export async function deleteNote(tripId: ID, noteId: ID) {
  const t = await getTrip(tripId);
  if (!t) return null;
  return updateTrip(tripId, { notes: t.notes.filter((n) => n.id !== noteId) });
}
export async function addPackItem(tripId: ID, item: Omit<PackItem, "id" | "packed">) {
  const t = await getTrip(tripId);
  if (!t) return null;
  return updateTrip(tripId, {
    packing: [...t.packing, { ...item, id: uid(), packed: false }],
  });
}
export async function togglePack(tripId: ID, itemId: ID) {
  const t = await getTrip(tripId);
  if (!t) return null;
  return updateTrip(tripId, {
    packing: t.packing.map((p) => (p.id === itemId ? { ...p, packed: !p.packed } : p)),
  });
}
export async function removePackItem(tripId: ID, itemId: ID) {
  const t = await getTrip(tripId);
  if (!t) return null;
  return updateTrip(tripId, { packing: t.packing.filter((p) => p.id !== itemId) });
}
export async function resetPacking(tripId: ID) {
  const t = await getTrip(tripId);
  if (!t) return null;
  return updateTrip(tripId, { packing: t.packing.map((p) => ({ ...p, packed: false })) });
}

function defaultPacking(): PackItem[] {
  const items: Array<[string, PackItem["category"]]> = [
    ["Passport", "Documents"],
    ["Travel insurance", "Documents"],
    ["Boarding pass", "Documents"],
    ["Phone charger", "Electronics"],
    ["Power adapter", "Electronics"],
    ["Headphones", "Electronics"],
    ["T-shirts", "Clothing"],
    ["Walking shoes", "Clothing"],
    ["Jacket", "Clothing"],
    ["Toothbrush", "Toiletries"],
    ["Sunscreen", "Toiletries"],
    ["Reusable bottle", "Other"],
  ];
  return items.map(([label, category]) => ({ id: uid(), label, category, packed: false }));
}

// --- Budget ----------------------------------------------------------------
export interface BudgetBreakdown {
  transport: number;
  stay: number;
  activities: number;
  meals: number;
  total: number;
  perDay: number;
  days: number;
  byStop: Array<{ stopId: ID; city: string; total: number; days: number; overBudget: boolean }>;
}
export function computeBudget(trip: Trip): BudgetBreakdown {
  let transport = 0, stay = 0, activities = 0, meals = 0, totalDays = 0;
  const byStop = trip.stops.map((s) => {
    const days = Math.max(1, daysBetween(s.startDate, s.endDate));
    const stopAct = s.activities.reduce((n, a) => n + a.cost, 0);
    const stopMeals = s.mealsPerDay * days;
    const stopTotal = s.transportCost + s.stayCost * days + stopAct + stopMeals;
    transport += s.transportCost;
    stay += s.stayCost * days;
    activities += stopAct;
    meals += stopMeals;
    totalDays += days;
    const dailyBudget = trip.budget ? trip.budget / Math.max(1, daysBetween(trip.startDate, trip.endDate)) : Infinity;
    return {
      stopId: s.id,
      city: s.city,
      total: stopTotal,
      days,
      overBudget: stopTotal / days > dailyBudget,
    };
  });
  const total = transport + stay + activities + meals;
  return {
    transport, stay, activities, meals, total,
    perDay: totalDays ? total / totalDays : 0,
    days: totalDays,
    byStop,
  };
}
export function daysBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000) + 1);
}

// --- Catalog ---------------------------------------------------------------
export const CITIES: City[] = [
  { name: "Tokyo", country: "Japan", region: "Asia", costIndex: 4, popularity: 5, highlights: ["Shibuya", "Sushi", "Temples"] },
  { name: "Kyoto", country: "Japan", region: "Asia", costIndex: 3, popularity: 4, highlights: ["Geisha district", "Bamboo forest"] },
  { name: "Bangkok", country: "Thailand", region: "Asia", costIndex: 2, popularity: 5, highlights: ["Street food", "Grand Palace"] },
  { name: "Bali", country: "Indonesia", region: "Asia", costIndex: 2, popularity: 5, highlights: ["Beaches", "Rice terraces"] },
  { name: "Singapore", country: "Singapore", region: "Asia", costIndex: 4, popularity: 4, highlights: ["Marina Bay", "Hawker food"] },
  { name: "Paris", country: "France", region: "Europe", costIndex: 4, popularity: 5, highlights: ["Eiffel Tower", "Louvre"] },
  { name: "Rome", country: "Italy", region: "Europe", costIndex: 3, popularity: 5, highlights: ["Colosseum", "Vatican"] },
  { name: "Barcelona", country: "Spain", region: "Europe", costIndex: 3, popularity: 5, highlights: ["Sagrada Familia", "Tapas"] },
  { name: "Lisbon", country: "Portugal", region: "Europe", costIndex: 2, popularity: 4, highlights: ["Tram 28", "Pastéis"] },
  { name: "Reykjavik", country: "Iceland", region: "Europe", costIndex: 5, popularity: 4, highlights: ["Northern lights", "Blue Lagoon"] },
  { name: "New York", country: "USA", region: "Americas", costIndex: 5, popularity: 5, highlights: ["Times Square", "Central Park"] },
  { name: "San Francisco", country: "USA", region: "Americas", costIndex: 5, popularity: 4, highlights: ["Golden Gate", "Alcatraz"] },
  { name: "Mexico City", country: "Mexico", region: "Americas", costIndex: 2, popularity: 4, highlights: ["Tacos", "Pyramids"] },
  { name: "Rio de Janeiro", country: "Brazil", region: "Americas", costIndex: 3, popularity: 4, highlights: ["Christ Redeemer", "Copacabana"] },
  { name: "Cape Town", country: "South Africa", region: "Africa", costIndex: 2, popularity: 4, highlights: ["Table Mountain", "Wine tours"] },
  { name: "Marrakech", country: "Morocco", region: "Africa", costIndex: 2, popularity: 4, highlights: ["Souks", "Medina"] },
  { name: "Sydney", country: "Australia", region: "Oceania", costIndex: 4, popularity: 4, highlights: ["Opera House", "Bondi"] },
  { name: "Queenstown", country: "New Zealand", region: "Oceania", costIndex: 4, popularity: 4, highlights: ["Bungee", "Lakes"] },
  { name: "Dubai", country: "UAE", region: "Middle East", costIndex: 5, popularity: 4, highlights: ["Burj Khalifa", "Desert safari"] },
  { name: "Istanbul", country: "Türkiye", region: "Europe", costIndex: 2, popularity: 5, highlights: ["Hagia Sophia", "Bazaar"] },
];

export const ACTIVITIES: ActivityCatalogItem[] = [
  { city: "Tokyo", name: "Shibuya crossing & Harajuku walk", category: "Sightseeing", cost: 0, durationHours: 3, description: "Iconic neon streets and youth fashion." },
  { city: "Tokyo", name: "Tsukiji food tour", category: "Food", cost: 60, durationHours: 3, description: "Sample sushi, tamago, street snacks." },
  { city: "Tokyo", name: "TeamLab Planets", category: "Culture", cost: 35, durationHours: 2, description: "Immersive digital art museum." },
  { city: "Kyoto", name: "Fushimi Inari hike", category: "Nature", cost: 0, durationHours: 3, description: "Thousands of vermillion torii gates." },
  { city: "Kyoto", name: "Tea ceremony", category: "Culture", cost: 45, durationHours: 1, description: "Traditional matcha experience." },
  { city: "Bangkok", name: "Long-tail boat canals", category: "Adventure", cost: 25, durationHours: 2, description: "Explore klongs by traditional boat." },
  { city: "Bangkok", name: "Chatuchak market", category: "Shopping", cost: 0, durationHours: 4, description: "15,000 stalls of everything." },
  { city: "Bali", name: "Ubud rice terraces", category: "Nature", cost: 10, durationHours: 3, description: "Tegallalang green landscapes." },
  { city: "Bali", name: "Surf lesson Canggu", category: "Adventure", cost: 40, durationHours: 2, description: "Beginner-friendly waves." },
  { city: "Paris", name: "Louvre museum", category: "Culture", cost: 22, durationHours: 4, description: "Mona Lisa & 35,000 works." },
  { city: "Paris", name: "Seine cruise at sunset", category: "Sightseeing", cost: 18, durationHours: 1, description: "City lights from the water." },
  { city: "Paris", name: "Le Marais food crawl", category: "Food", cost: 70, durationHours: 3, description: "Falafel, pastries, cheese." },
  { city: "Rome", name: "Colosseum & Forum", category: "Sightseeing", cost: 25, durationHours: 3, description: "Ancient Rome highlights." },
  { city: "Rome", name: "Trastevere pasta night", category: "Food", cost: 45, durationHours: 2, description: "Cacio e pepe done right." },
  { city: "Barcelona", name: "Sagrada Familia tour", category: "Sightseeing", cost: 28, durationHours: 2, description: "Gaudí's masterpiece." },
  { city: "Barcelona", name: "Tapas & flamenco", category: "Nightlife", cost: 55, durationHours: 3, description: "Local bars + show." },
  { city: "Lisbon", name: "Alfama tram & viewpoints", category: "Sightseeing", cost: 5, durationHours: 3, description: "Historic neighborhood." },
  { city: "Reykjavik", name: "Northern lights tour", category: "Nature", cost: 90, durationHours: 4, description: "Chase the aurora." },
  { city: "Reykjavik", name: "Blue Lagoon spa", category: "Nature", cost: 85, durationHours: 3, description: "Geothermal soak." },
  { city: "New York", name: "Statue of Liberty ferry", category: "Sightseeing", cost: 24, durationHours: 3, description: "Liberty + Ellis Island." },
  { city: "New York", name: "Broadway show", category: "Culture", cost: 95, durationHours: 3, description: "Pick a current hit." },
  { city: "New York", name: "Brooklyn pizza tour", category: "Food", cost: 65, durationHours: 3, description: "Famous slices." },
  { city: "San Francisco", name: "Bike Golden Gate", category: "Adventure", cost: 35, durationHours: 4, description: "Cross to Sausalito." },
  { city: "Mexico City", name: "Teotihuacan pyramids", category: "Culture", cost: 30, durationHours: 6, description: "Ancient mesoamerican site." },
  { city: "Mexico City", name: "Taco crawl Roma", category: "Food", cost: 25, durationHours: 3, description: "Best al pastor in town." },
  { city: "Rio de Janeiro", name: "Sugarloaf cable car", category: "Sightseeing", cost: 40, durationHours: 3, description: "Panoramic city views." },
  { city: "Cape Town", name: "Table Mountain hike", category: "Adventure", cost: 0, durationHours: 5, description: "Platteklip Gorge route." },
  { city: "Marrakech", name: "Souk wandering & mint tea", category: "Shopping", cost: 15, durationHours: 3, description: "Spices, lanterns, leather." },
  { city: "Sydney", name: "Opera House tour", category: "Culture", cost: 45, durationHours: 1, description: "Behind the sails." },
  { city: "Sydney", name: "Bondi to Coogee walk", category: "Nature", cost: 0, durationHours: 3, description: "Cliffside coastal trail." },
  { city: "Queenstown", name: "Nevis bungee", category: "Adventure", cost: 200, durationHours: 4, description: "134m world-class jump." },
  { city: "Dubai", name: "Burj Khalifa observation", category: "Sightseeing", cost: 50, durationHours: 2, description: "Floors 124-125." },
  { city: "Dubai", name: "Desert safari", category: "Adventure", cost: 80, durationHours: 6, description: "Dunes, camels, bbq." },
  { city: "Istanbul", name: "Hagia Sophia & Blue Mosque", category: "Culture", cost: 25, durationHours: 3, description: "Two icons in one walk." },
  { city: "Istanbul", name: "Bosphorus dinner cruise", category: "Food", cost: 60, durationHours: 3, description: "Mezze on the water." },
  { city: "Singapore", name: "Gardens by the Bay", category: "Nature", cost: 28, durationHours: 3, description: "Supertree grove." },
  { city: "Singapore", name: "Hawker centre tour", category: "Food", cost: 30, durationHours: 2, description: "Chili crab, laksa, satay." },
];

// --- Theme -----------------------------------------------------------------
export function getTheme(): "light" | "dark" {
  if (!isBrowser()) return "light";
  const t = localStorage.getItem(KEYS.theme);
  if (t === "dark" || t === "light") return t;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function setTheme(t: "light" | "dark") {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.theme, t);
  document.documentElement.classList.toggle("dark", t === "dark");
}

// --- Validation helpers ----------------------------------------------------
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const fmtMoney = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
export const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";

// --- Subscribe -------------------------------------------------------------
export function onChange(cb: () => void) {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener("tl:change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("tl:change", handler);
    window.removeEventListener("storage", handler);
  };
}
