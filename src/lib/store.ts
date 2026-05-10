import {
  signupServer, loginServer, logoutServer, currentUserServer,
  listUsersServer, resetPasswordServer, updateUserServer,
  listTripsServer, getTripServer, getTripBySlugServer, createTripServer,
  updateTripServer, deleteTripServer, duplicateTripServer,
  addStopServer, updateStopServer, removeStopServer, reorderStopsServer,
  addActivityServer, removeActivityServer,
  addNoteServer, updateNoteServer, deleteNoteServer,
  addPackItemServer, togglePackServer, removePackItemServer, resetPackingServer
} from "@/lib/rpc";

export type ID = string;

export interface User {
  id: ID;
  name: string;
  email: string;
  password?: string;
  avatar?: string | null;
  language?: string | null;
  currency?: string | null;
  isAdmin?: boolean;
  createdAt: number;
}

export interface Activity {
  id: ID;
  name: string;
  category: string;
  cost: number;
  durationHours: number;
  description?: string | null;
  time?: string | null;
}

export interface Stop {
  id: ID;
  city: string;
  country: string;
  startDate: string; 
  endDate: string;
  stayCost: number;
  transportCost: number;
  mealsPerDay: number;
  activities: Activity[];
  order: number;
}

export interface Note {
  id: ID;
  stopId?: ID | null;
  text: string;
  createdAt: number;
}

export interface PackItem {
  id: ID;
  label: string;
  category: string;
  packed: boolean;
}

export interface Trip {
  id: ID;
  ownerId: ID;
  name: string;
  description: string;
  cover?: string | null;
  startDate: string;
  endDate: string;
  budget?: number | null;
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
  costIndex: number;
  popularity: number;
  highlights: string[];
}

export interface ActivityCatalogItem {
  city: string;
  name: string;
  category: string;
  cost: number;
  durationHours: number;
  description: string;
}

const KEYS = {
  theme: "tl.theme",
};

const isBrowser = () => typeof window !== "undefined";

function fireChange() {
  if (isBrowser()) window.dispatchEvent(new CustomEvent("tl:change"));
}

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// --- Users / auth ---
export async function signup(input: { name: string; email: string; password: string }) {
  const u = await signupServer({ data: input }) as any;
  if (u && u.error) throw new Error(u.error);
  fireChange();
  return u;
}
export async function login(email: string, password: string) {
  const u = await loginServer({ data: { email, password } }) as any;
  if (u && u.error) throw new Error(u.error);
  fireChange();
  return u;
}
export async function logout() {
  await logoutServer();
  fireChange();
}
export async function currentUser(): Promise<User | null> {
  return await currentUserServer() as unknown as User;
}
export async function listUsers(): Promise<User[]> {
  return await listUsersServer() as unknown as User[];
}
export async function resetPassword(email: string, newPassword: string) {
  const res = await resetPasswordServer({ data: { email, newPassword } }) as any;
  if (res && res.error) throw new Error(res.error);
}
export async function updateUser(patch: Partial<User>): Promise<User> {
  const u = await updateUserServer({ data: { patch } });
  fireChange();
  return u as unknown as User;
}
export async function deleteAccount() {
  await logoutServer();
}

// --- Trips ---
export async function listAllTrips(): Promise<Trip[]> {
  return (await listTripsServer() as unknown as Trip[]);
}
export async function listTrips(): Promise<Trip[]> {
  return (await listTripsServer() as unknown as Trip[]);
}
export async function getTrip(id: ID): Promise<Trip | null> {
  return (await getTripServer({ data: id }) as unknown as Trip);
}
export async function getTripBySlug(slug: string): Promise<Trip | null> {
  return (await getTripBySlugServer({ data: slug }) as unknown as Trip);
}
export async function createTrip(input: Pick<Trip, "name" | "description" | "startDate" | "endDate"> & { cover?: string; budget?: number }): Promise<Trip> {
  const t = await createTripServer({ data: input }) as unknown as Trip;
  fireChange();
  return t;
}
export async function updateTrip(id: ID, patch: Partial<Trip>) {
  const t = await updateTripServer({ data: { id, patch } }) as unknown as Trip;
  fireChange();
  return t;
}
export async function deleteTrip(id: ID) {
  await deleteTripServer({ data: id });
  fireChange();
}
export async function duplicateTrip(id: ID): Promise<Trip | null> {
  const t = await duplicateTripServer({ data: id }) as unknown as Trip;
  fireChange();
  return t;
}

// --- Stops ---
export async function addStop(tripId: ID, stop: Omit<Stop, "id" | "order" | "activities"> & { activities?: Activity[] }) {
  const t = await addStopServer({ data: { tripId, stop } }) as unknown as Trip; fireChange(); return t;
}
export async function updateStop(tripId: ID, stopId: ID, patch: Partial<Stop>) {
  const t = await updateStopServer({ data: { tripId, stopId, patch } }) as unknown as Trip; fireChange(); return t;
}
export async function removeStop(tripId: ID, stopId: ID) {
  const t = await removeStopServer({ data: { tripId, stopId } }) as unknown as Trip; fireChange(); return t;
}
export async function reorderStops(tripId: ID, stopIds: ID[]) {
  const t = await reorderStopsServer({ data: { tripId, stopIds } }) as unknown as Trip; fireChange(); return t;
}
export async function addActivity(tripId: ID, stopId: ID, activity: Omit<Activity, "id">) {
  const t = await addActivityServer({ data: { tripId, stopId, activity } }) as unknown as Trip; fireChange(); return t;
}
export async function removeActivity(tripId: ID, stopId: ID, activityId: ID) {
  const t = await removeActivityServer({ data: { tripId, activityId } }) as unknown as Trip; fireChange(); return t;
}
export async function addNote(tripId: ID, text: string, stopId?: ID) {
  const t = await addNoteServer({ data: { tripId, text, stopId } }) as unknown as Trip; fireChange(); return t;
}
export async function updateNote(tripId: ID, noteId: ID, text: string) {
  const t = await updateNoteServer({ data: { tripId, noteId, text } }) as unknown as Trip; fireChange(); return t;
}
export async function deleteNote(tripId: ID, noteId: ID) {
  const t = await deleteNoteServer({ data: { tripId, noteId } }) as unknown as Trip; fireChange(); return t;
}
export async function addPackItem(tripId: ID, item: Omit<PackItem, "id" | "packed">) {
  const t = await addPackItemServer({ data: { tripId, item } }) as unknown as Trip; fireChange(); return t;
}
export async function togglePack(tripId: ID, itemId: ID) {
  const t = await togglePackServer({ data: { tripId, itemId } }) as unknown as Trip; fireChange(); return t;
}
export async function removePackItem(tripId: ID, itemId: ID) {
  const t = await removePackItemServer({ data: { tripId, itemId } }) as unknown as Trip; fireChange(); return t;
}
export async function resetPacking(tripId: ID) {
  const t = await resetPackingServer({ data: { tripId } }) as unknown as Trip; fireChange(); return t;
}

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

import { WORLD_CITIES, type CityInfo } from "./city-data";

export interface City extends CityInfo {}
export const CITIES: City[] = WORLD_CITIES;

export const ACTIVITIES: ActivityCatalogItem[] = [
  { city: "Tokyo", name: "Shibuya crossing & Harajuku walk", category: "Sightseeing", cost: 0, durationHours: 3, description: "Iconic neon streets and youth fashion." },
  { city: "Paris", name: "Louvre museum", category: "Culture", cost: 22, durationHours: 4, description: "Mona Lisa & 35,000 works." },
  { city: "Agra", name: "Taj Mahal Sunrise Tour", category: "Sightseeing", cost: 15, durationHours: 3, description: "Witness the magnificent Taj Mahal at sunrise." },
  { city: "Jaipur", name: "Amber Fort Elephant Ride", category: "Adventure", cost: 20, durationHours: 4, description: "Explore the majestic Amber Fort with an authentic elephant ride." },
  { city: "Delhi", name: "Old Delhi Food Walk", category: "Food", cost: 25, durationHours: 3, description: "Taste the best street food in Chandni Chowk." },
  { city: "Mumbai", name: "Elephanta Caves Tour", category: "Culture", cost: 10, durationHours: 5, description: "Ferry ride to ancient rock-cut cave temples." },
  { city: "Goa", name: "Baga Beach Water Sports", category: "Adventure", cost: 30, durationHours: 2, description: "Parasailing, jet skiing, and banana boat rides." },
  { city: "Udaipur", name: "Lake Pichola Sunset Boat Ride", category: "Nature", cost: 12, durationHours: 2, description: "Romantic boat ride during a beautiful sunset." },
  { city: "Varanasi", name: "Ganges Evening Aarti", category: "Culture", cost: 0, durationHours: 2, description: "Experience the mesmerizing spiritual ritual by the river." },
  { city: "Kochi", name: "Kerala Backwaters Houseboat", category: "Nature", cost: 80, durationHours: 6, description: "Relaxing day cruise through serene backwaters." },
  { city: "Jaipur", name: "Hawa Mahal Visit", category: "Sightseeing", cost: 5, durationHours: 1.5, description: "Explore the iconic Palace of Winds." },
  { city: "Delhi", name: "Qutub Minar & Lotus Temple", category: "Culture", cost: 8, durationHours: 4, description: "Visit historic monuments and modern architectural marvels." },
  { city: "Mumbai", name: "Colaba Causeway Shopping", category: "Shopping", cost: 0, durationHours: 3, description: "Bargain for clothes, jewelry, and souvenirs." },
  { city: "Goa", name: "Tito's Lane Nightclub", category: "Nightlife", cost: 40, durationHours: 4, description: "Dance the night away in Goa's most famous clubbing district." },
  { city: "Rishikesh", name: "Ganges River Rafting", category: "Adventure", cost: 15, durationHours: 4, description: "Thrilling white water rafting experience." },
  { city: "Bangalore", name: "Microbrewery Hopping", category: "Food", cost: 35, durationHours: 4, description: "Sample craft beers in India's pub capital." },
];

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

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export function getCurrency(): string {
  if (!isBrowser()) return "USD";
  return localStorage.getItem("tl.currency") || "USD";
}

export function setCurrency(c: string) {
  if (!isBrowser()) return;
  if (localStorage.getItem("tl.currency") === c) return;
  localStorage.setItem("tl.currency", c);
  fireChange();
}

export const fmtMoney = (n: number) => {
  const currency = getCurrency();
  // Simple conversion rates for demo purposes since we don't have a live API
  const rates: Record<string, number> = { USD: 1, EUR: 0.92, INR: 83.5, GBP: 0.79, JPY: 151 };
  const rate = rates[currency] || 1;
  const converted = (n || 0) * rate;
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(converted);
};
export const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";

export function onChange(cb: () => void) {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener("tl:change", handler);
  return () => {
    window.removeEventListener("tl:change", handler);
  };
}
