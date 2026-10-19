import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { getDestination, categories } from "../data/destinations.js";
import { validDate } from "../utils/planner.js";
import CitySearch from "./CitySearch.jsx";
export default function TripForm({
  initial,
  initialDestination,
  initialCity,
  onSave,
  onClose,
}) {
  const [v, set] = useState(
    initial || {
      title: "",
      destination: initialCity?.id || initialDestination || "",
      city: initialCity,
      start: new Date().toISOString().slice(0, 10),
      days: 3,
      travelers: 1,
      budget: 250,
      pace: "balanced",
      interests: ["culture", "food"],
    },
  );
  const [error, setError] = useState("");
  const update = (k, val) => set({ ...v, [k]: val });
  function submit(e) {
    e.preventDefault();
    if (
      !v.destination ||
      !v.title.trim() ||
      !validDate(v.start) ||
      v.interests.length === 0
    ) {
      setError(
        "Seyahat adını yaz; bir şehir, geçerli bir tarih ve en az bir ilgi alanı seç.",
      );
      return;
    }
    if (
      initial &&
      v.days < Math.max(1, ...initial.activities.map((a) => a.day))
    ) {
      setError(
        "Azaltmak istediğin günlerde aktiviteler var. Önce bu aktiviteleri taşı veya sil.",
      );
      return;
    }
    onSave({ ...v, title: v.title.trim() });
  }
  return (
    <form onSubmit={submit} className="form">
      <label>
        Seyahatin adı
        <input
          autoFocus
          required
          maxLength={80}
          placeholder="Örn. Roma’da küçük bir mola"
          value={v.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </label>
      <CitySearch
        selected={
          v.destination ? v.city || getDestination(v.destination) : null
        }
        disabled={!!initial}
        onSelect={(city) => set({ ...v, destination: city.id, city })}
      />
      {v.destination && getDestination(v.destination, v.city).generic && (
        <p className="form-note">
          Bu şehir için günlük planın boş başlayacak. Aktivitelerini kendin
          ekleyebilir, bütçeni takip edebilirsin.
        </p>
      )}
      <div className="form-grid">
        <label>
          Başlangıç tarihi
          <input
            type="date"
            required
            value={v.start}
            onChange={(e) => update("start", e.target.value)}
          />
        </label>
        <label>
          Kaç gün?
          <input
            type="number"
            min="1"
            max="7"
            required
            value={v.days}
            onChange={(e) => update("days", Number(e.target.value))}
          />
        </label>
        <label>
          Kaç kişi?
          <input
            type="number"
            min="1"
            max="12"
            required
            value={v.travelers}
            onChange={(e) => update("travelers", Number(e.target.value))}
          />
        </label>
      </div>
      <label>
        Toplam aktivite bütçesi (€)
        <input
          type="number"
          min="1"
          max="1000000"
          required
          value={v.budget}
          onChange={(e) => update("budget", Number(e.target.value))}
        />
        <small>Tüm kişiler için. Uçuş ve konaklama dahil değil.</small>
      </label>
      <fieldset>
        <legend>Seyahat tempon</legend>
        <div className="choice-row">
          {[
            ["slow", "Sakin", "Günde 2 durak"],
            ["balanced", "Dengeli", "Günde 3 durak"],
            ["fast", "Keşif dolu", "Günde 4 durak"],
          ].map(([id, name, desc]) => (
            <button
              type="button"
              className={`choice ${v.pace === id ? "selected" : ""}`}
              aria-pressed={v.pace === id}
              onClick={() => update("pace", id)}
              key={id}
            >
              <strong>{name}</strong>
              <small>{desc}</small>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Neler keşfetmek istersin?</legend>
        <div className="chips">
          {Object.entries(categories).map(([id, name]) => (
            <button
              type="button"
              key={id}
              aria-pressed={v.interests.includes(id)}
              className={`chip ${v.interests.includes(id) ? "selected" : ""}`}
              onClick={() =>
                update(
                  "interests",
                  v.interests.includes(id)
                    ? v.interests.filter((x) => x !== id)
                    : [...v.interests, id],
                )
              }
            >
              {v.interests.includes(id) && <Check size={14} />} {name}
            </button>
          ))}
        </div>
      </fieldset>
      {initial && !getDestination(v.destination, v.city).generic && (
        <p className="form-note">
          Tercihler kaydedilir; mevcut aktivitelerin korunur. Yeni öneriler için
          planındaki “Rotayı yenile” düğmesini kullanabilirsin.
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Vazgeç
        </button>
        <button className="primary">
          {initial ? "Değişiklikleri kaydet" : "Rotamı oluştur"}
          <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}
