import { destinations } from "../data/destinations.js";

const catalogByGeoId = {
  745044: "istanbul",
  3169070: "rome",
  2988507: "paris",
  593116: "vilnius",
};
const shortText = (value, max = 120) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;
export function isValidCity(city) {
  if (
    !city ||
    !shortText(city.id, 100) ||
    !shortText(city.name) ||
    !shortText(city.country)
  )
    return false;
  if (
    city.region !== undefined &&
    (typeof city.region !== "string" || city.region.length > 160)
  )
    return false;
  const hasCoordinates =
    city.latitude !== undefined || city.longitude !== undefined;
  return (
    !hasCoordinates ||
    (Number.isFinite(city.latitude) &&
      Math.abs(city.latitude) <= 90 &&
      Number.isFinite(city.longitude) &&
      Math.abs(city.longitude) <= 180)
  );
}
export function cityFromResult(result) {
  if (
    !result ||
    !Number.isSafeInteger(result.id) ||
    !/^PPL/.test(result.feature_code || "")
  )
    return null;
  const city = {
    id: catalogByGeoId[result.id] || `geo:${result.id}`,
    name: result.name,
    country: result.country || result.country_code,
    region: result.admin1 || "",
    latitude: result.latitude,
    longitude: result.longitude,
  };
  const known = destinations.find((d) => d.id === city.id);
  if (known) {
    city.name = known.name;
    city.country = known.country;
  }
  return isValidCity(city) ? city : null;
}
export async function searchCities(query, { signal, fetcher = fetch } = {}) {
  if (query.trim().length < 2) return [];
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name: query.trim(),
    count: "30",
    language: "tr",
    format: "json",
  }).toString();
  const response = await fetcher(url, { signal });
  if (!response.ok) throw new Error("Şehir araması şu an kullanılamıyor.");
  const data = await response.json();
  if (
    data.error ||
    (data.results !== undefined && !Array.isArray(data.results))
  )
    throw new Error("Şehir sonuçları okunamadı.");
  const seen = new Set();
  return (data.results || []).map(cityFromResult).filter((city) => {
    if (!city || seen.has(city.id)) return false;
    seen.add(city.id);
    return true;
  });
}
