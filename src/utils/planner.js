import { getDestination } from "../data/destinations.js";
import { isValidCity } from "./cities.js";
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `r-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const money = (n) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
export function dateAt(start, offset = 0) {
  const d = new Date(`${start}T12:00:00`);
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}
export function validDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T12:00:00Z");
  return !isNaN(d) && d.toISOString().slice(0, 10) === s;
}
export function generateActivities(trip) {
  const count = { slow: 2, balanced: 3, fast: 4 }[trip.pace] || 3;
  const all = getDestination(trip.destination, trip.city).places;
  const allowance = trip.budget / trip.travelers / trip.days;
  const ranked = all
    .map((p, i) => ({
      ...p,
      score:
        (trip.interests.includes(p.category) ? 20 : 0) +
        (p.cost <= allowance / count ? 5 : 0) -
        i / 100,
    }))
    .sort((a, b) => b.score - a.score);
  return ranked.slice(0, trip.days * count).map((p, i) => {
    const { score, ...place } = p;
    return {
      ...place,
      id: uid(),
      day: Math.floor(i / count) + 1,
      time: ["09:30", "12:30", "15:30", "18:00"][i % count],
      done: false,
    };
  });
}
export function totalCost(trip) {
  return trip.activities.reduce(
    (sum, a) => sum + Number(a.cost) * trip.travelers,
    0,
  );
}
export function makeTrip(values) {
  const trip = {
    ...values,
    id: uid(),
    createdAt: new Date().toISOString(),
    activities: [],
  };
  trip.activities = generateActivities(trip);
  return trip;
}
export const seedTrip = () =>
  makeTrip({
    title: "İstanbul kaçamağı",
    destination: "istanbul",
    start: "2026-11-06",
    days: 3,
    travelers: 2,
    budget: 350,
    pace: "balanced",
    interests: ["culture", "food", "nature"],
  });
export function isValidTrip(t) {
  return (
    !!t &&
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    t.title.length > 0 &&
    t.title.length <= 80 &&
    (["istanbul", "rome", "paris", "vilnius"].includes(t.destination) ||
      (isValidCity(t.city) &&
        t.city.id === t.destination &&
        /^(geo:[0-9]+|manual:[A-Za-z0-9-]+)$/.test(t.destination))) &&
    validDate(t.start) &&
    Number.isInteger(t.days) &&
    t.days >= 1 &&
    t.days <= 7 &&
    Number.isInteger(t.travelers) &&
    t.travelers >= 1 &&
    t.travelers <= 12 &&
    Number.isFinite(t.budget) &&
    t.budget > 0 &&
    t.budget <= 1000000 &&
    ["slow", "balanced", "fast"].includes(t.pace) &&
    Array.isArray(t.interests) &&
    t.interests.every((x) =>
      ["culture", "food", "nature", "art", "shopping"].includes(x),
    ) &&
    Array.isArray(t.activities) &&
    t.activities.length <= 150 &&
    new Set(t.activities.map((a) => a.id)).size === t.activities.length &&
    t.activities.every(
      (a) =>
        a &&
        typeof a.id === "string" &&
        typeof a.name === "string" &&
        a.name.length > 0 &&
        a.name.length <= 100 &&
        typeof a.note === "string" &&
        a.note.length <= 500 &&
        typeof a.area === "string" &&
        a.area.length <= 80 &&
        ["culture", "food", "nature", "art", "shopping"].includes(a.category) &&
        Number.isInteger(a.day) &&
        a.day >= 1 &&
        a.day <= t.days &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(a.time) &&
        Number.isFinite(a.cost) &&
        a.cost >= 0 &&
        a.cost <= 100000 &&
        Number.isFinite(a.duration) &&
        a.duration >= 15 &&
        a.duration <= 720 &&
        typeof a.done === "boolean",
    )
  );
}
export function parseBackup(text) {
  const x = JSON.parse(text);
  if (
    x.version !== 1 ||
    !Array.isArray(x.trips) ||
    x.trips.length > 50 ||
    !x.trips.every(isValidTrip) ||
    new Set(x.trips.map((t) => t.id)).size !== x.trips.length
  )
    throw new Error("Geçerli bir Rota yedek dosyası seç.");
  return x.trips;
}
