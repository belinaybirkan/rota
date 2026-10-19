import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cityFromResult,
  searchCities,
  isValidCity,
} from "../src/utils/cities.js";
import { getDestination } from "../src/data/destinations.js";
import { makeTrip, parseBackup, seedTrip } from "../src/utils/planner.js";
const tokyo = {
  id: 1850147,
  name: "Tokyo",
  country: "Japonya",
  admin1: "Tokyo",
  feature_code: "PPLC",
  latitude: 35.6895,
  longitude: 139.69171,
};
const values = {
  title: "Tokyo gezisi",
  destination: "geo:1850147",
  city: cityFromResult(tokyo),
  start: "2026-11-06",
  days: 3,
  travelers: 2,
  budget: 350,
  pace: "balanced",
  interests: ["culture"],
};
test("Dünya şehri seyahati ve JSON yedeği şehir kimliğini korur", () => {
  const t = makeTrip(values);
  const copy = parseBackup(JSON.stringify({ version: 1, trips: [t] }))[0];
  assert.equal(copy.city.name, "Tokyo");
  assert.equal(getDestination(copy.destination, copy.city).name, "Tokyo");
  assert.equal(copy.activities.length, 0);
});
test("Mevcut dört şehirli yedekler uyumlu kalır", () => {
  const t = seedTrip();
  assert.deepEqual(
    parseBackup(JSON.stringify({ version: 1, trips: [t] }))[0],
    t,
  );
});
test("Arama katalog şehrini gerçek GeoNames kimliğiyle eşler", () => {
  const paris = cityFromResult({
    ...tokyo,
    id: 2988507,
    name: "Paris",
    country: "Fransa",
  });
  assert.equal(paris.id, "paris");
  assert.ok(getDestination(paris.id, paris).places.length > 0);
  const otherParis = cityFromResult({
    ...tokyo,
    id: 4717560,
    name: "Paris",
    country: "ABD",
  });
  assert.equal(otherParis.id, "geo:4717560");
  assert.equal(getDestination(otherParis.id, otherParis).places.length, 0);
});
test("Elle girilen şehir çevrimdışı kaydedilir ve geri yüklenir", () => {
  const city = {
    id: "manual:test-123",
    name: "Küçük bir kasaba",
    country: "Türkiye",
    region: "",
  };
  const t = makeTrip({ ...values, city, destination: city.id });
  assert.equal(
    parseBackup(JSON.stringify({ version: 1, trips: [t] }))[0].city.name,
    city.name,
  );
});
test("Eksik veya tutarsız dünya şehri yedekleri reddedilir", () => {
  const t = makeTrip(values);
  for (const city of [
    undefined,
    { ...t.city, country: "" },
    { ...t.city, id: "geo:99" },
    { ...t.city, latitude: 1000 },
  ])
    assert.throws(() =>
      parseBackup(JSON.stringify({ version: 1, trips: [{ ...t, city }] })),
    );
  assert.equal(isValidCity({ name: "Tokyo", country: "Japonya" }), false);
});
test("Arama sorgusu kodlanır; şehir dışı ve yinelenen sonuçlar elenir", async () => {
  let called;
  const cities = await searchCities("Paris, France", {
    fetcher: async (url, options) => {
      called = url;
      return {
        ok: true,
        json: async () => ({
          results: [tokyo, tokyo, { ...tokyo, id: 99, feature_code: "AIRF" }],
        }),
      };
    },
  });
  assert.equal(called.searchParams.get("name"), "Paris, France");
  assert.equal(called.searchParams.get("language"), "tr");
  assert.equal(cities.length, 1);
});
test("Boş sonuç ve servis hataları ayrı ele alınır", async () => {
  assert.deepEqual(
    await searchCities("xyz", {
      fetcher: async () => ({ ok: true, json: async () => ({}) }),
    }),
    [],
  );
  await assert.rejects(
    searchCities("Tokyo", { fetcher: async () => ({ ok: false }) }),
  );
  await assert.rejects(
    searchCities("Tokyo", {
      fetcher: async () => ({ ok: true, json: async () => ({ error: true }) }),
    }),
  );
});
test("Kısa arama ağ isteği yapmaz; iptal sinyali aktarılır", async () => {
  let called = false;
  assert.deepEqual(
    await searchCities("T", {
      fetcher: async () => {
        called = true;
      },
    }),
    [],
  );
  assert.equal(called, false);
  const controller = new AbortController();
  await searchCities("Tokyo", {
    signal: controller.signal,
    fetcher: async (url, options) => {
      assert.equal(options.signal, controller.signal);
      return { ok: true, json: async () => ({ results: [] }) };
    },
  });
});
