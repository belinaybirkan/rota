import { useState } from "react";
import { categories } from "../data/destinations.js";
export default function ActivityForm({ trip, initial, day, onSave, onClose }) {
  const [v, set] = useState(
    initial || {
      name: "",
      day: day || 1,
      time: "10:00",
      category: "culture",
      cost: 0,
      duration: 60,
      area: "",
      note: "",
      done: false,
    },
  );
  const update = (k, val) => set({ ...v, [k]: val });
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (v.name.trim())
          onSave({ ...v, name: v.name.trim(), area: v.area.trim() });
      }}
    >
      <label>
        Aktivite adı
        <input
          autoFocus
          required
          maxLength={100}
          value={v.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Örn. Müzede bir öğleden sonra"
        />
      </label>
      <div className="form-grid">
        <label>
          Gün
          <select
            value={v.day}
            onChange={(e) => update("day", Number(e.target.value))}
          >
            {Array.from({ length: trip.days }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}. gün
              </option>
            ))}
          </select>
        </label>
        <label>
          Saat
          <input
            type="time"
            required
            value={v.time}
            onChange={(e) => update("time", e.target.value)}
          />
        </label>
        <label>
          Kategori
          <select
            value={v.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {Object.entries(categories).map(([k, n]) => (
              <option value={k} key={k}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Süre (dakika)
          <input
            type="number"
            min="15"
            max="720"
            required
            value={v.duration}
            onChange={(e) => update("duration", Number(e.target.value))}
          />
        </label>
        <label>
          Kişi başı maliyet (€)
          <input
            type="number"
            step="0.01"
            min="0"
            max="100000"
            required
            value={v.cost}
            onChange={(e) => update("cost", Number(e.target.value))}
          />
        </label>
        <label>
          Semt / bölge
          <input
            maxLength={80}
            value={v.area}
            onChange={(e) => update("area", e.target.value)}
            placeholder="Örn. Karaköy"
          />
        </label>
      </div>
      <label>
        Notların
        <textarea
          rows="3"
          maxLength={500}
          value={v.note}
          onChange={(e) => update("note", e.target.value)}
          placeholder="Rezervasyon, buluşma noktası, küçük hatırlatmalar…"
        />
      </label>
      <div className="form-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Vazgeç
        </button>
        <button className="primary">
          {initial ? "Değişiklikleri kaydet" : "Plana ekle"}
        </button>
      </div>
    </form>
  );
}
