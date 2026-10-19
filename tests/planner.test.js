import { test } from "node:test";
import assert from "node:assert/strict";
import {
  makeTrip,
  generateActivities,
  totalCost,
  parseBackup,
  validDate,
  isValidTrip,
} from "../src/utils/planner.js";
const base = {
  title: "Test rota",
  destination: "istanbul",
  start: "2026-11-06",
  days: 3,
  travelers: 2,
  budget: 350,
  pace: "balanced",
  interests: ["culture"],
};
test("İlgi alanları başlangıç duraklarını değiştirir", () => {
  const a = generateActivities({ ...base, interests: ["food"] });
  const b = generateActivities({ ...base, interests: ["nature"] });
  assert.equal(a[0].category, "food");
  assert.equal(b[0].category, "nature");
  assert.notEqual(a[0].name, b[0].name);
});
test("Tempo günlük durak sayısını değiştirir; durak tekrarı yoktur", () => {
  for (const [pace, count] of [
    ["slow", 2],
    ["balanced", 3],
    ["fast", 4],
  ]) {
    const a = generateActivities({ ...base, pace });
    assert.equal(a.filter((x) => x.day === 1).length, count);
    assert.equal(new Set(a.map((x) => x.name)).size, a.length);
    assert.ok(a.every((x) => x.day >= 1 && x.day <= base.days));
  }
});
test("Düşük bütçe uygun maliyetli duraklara öncelik verir", () => {
  const a = generateActivities({
    ...base,
    days: 1,
    budget: 1,
    interests: ["culture"],
  });
  assert.equal(a[0].cost, 0);
});
test("Toplam maliyet kişi sayısını içerir", () =>
  assert.equal(
    totalCost({ ...base, activities: [{ cost: 12.5 }, { cost: 5 }] }),
    35,
  ));
test("Uzun plan kataloğu tekrar etmez; kalan günler elle doldurulabilir", () => {
  const a = generateActivities({ ...base, days: 7, pace: "fast" });
  assert.equal(a.length, 12);
  assert.equal(new Set(a.map((x) => x.name)).size, 12);
});
test("JSON yedek veri kaybı olmadan geri okunur", () => {
  const t = makeTrip(base);
  assert.ok(isValidTrip(t));
  assert.deepEqual(parseBackup(JSON.stringify({ version: 1, trips: [t] })), [
    t,
  ]);
});
test("Bozuk ve yinelenen kimlikli yedekler reddedilir", () => {
  const t = makeTrip(base);
  for (const trips of [
    [{ ...t, budget: -2 }],
    [{ ...t, days: 0 }],
    [{ ...t, activities: [{ ...t.activities[0], day: 99 }] }],
    [t, t],
    [{ ...t, activities: [t.activities[0], t.activities[0]] }],
  ])
    assert.throws(() => parseBackup(JSON.stringify({ version: 1, trips })));
});
test("Gerçek olmayan takvim günleri reddedilir", () => {
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(validDate("2028-02-29"), true);
});
