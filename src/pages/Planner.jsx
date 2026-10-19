import { useState } from "react";
import {
  MapPin,
  CalendarDays,
  Users,
  Plus,
  ArrowUpRight,
  SlidersHorizontal,
  Clock,
  Trash2,
  Pencil,
  Check,
  RefreshCw,
  Printer,
  Leaf,
  Wallet,
  Route,
  ChevronRight,
} from "lucide-react";
import { getDestination, categories } from "../data/destinations.js";
import { money, totalCost, dateAt } from "../utils/planner.js";
export function BudgetPanel({ trip, full = false }) {
  const spent = totalCost(trip),
    remaining = trip.budget - spent;
  return (
    <section className={`budget-card ${full ? "budget-full" : ""}`}>
      <div className="section-label">
        <Wallet size={19} />
        <h3>Bütçen kontrol altında</h3>
      </div>
      <p>Aktiviteler için toplam planın</p>
      <div className="budget-value">
        {money(spent)} <span>/ {money(trip.budget)}</span>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label="Bütçe kullanımı"
        aria-valuenow={Math.min(100, Math.round((spent / trip.budget) * 100))}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span
          className={remaining < 0 ? "over" : ""}
          style={{ width: `${Math.min(100, (spent / trip.budget) * 100)}%` }}
        />
      </div>
      <div className={`budget-status ${remaining < 0 ? "error" : ""}`}>
        <span>{remaining >= 0 ? "Kalan bütçe" : "Bütçe aşımı"}</span>
        <strong>{money(Math.abs(remaining))}</strong>
      </div>
      {full && (
        <div className="category-costs">
          {Object.entries(categories).map(([id, label]) => (
            <div key={id}>
              <span>{label}</span>
              <strong>
                {money(
                  trip.activities
                    .filter((a) => a.category === id)
                    .reduce((s, a) => s + a.cost * trip.travelers, 0),
                )}
              </strong>
            </div>
          ))}
        </div>
      )}
      <p className="small-note">
        {trip.travelers} kişi için örnek EUR tahminleri. Uçuş, konaklama ve
        canlı fiyatlar dahil değil.
      </p>
    </section>
  );
}
export default function Planner({
  trip,
  day,
  setDay,
  onEdit,
  onAdd,
  onActivityEdit,
  onDelete,
  onToggle,
  onRegenerate,
}) {
  const dest = getDestination(trip.destination, trip.city);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const dayItems = trip.activities
    .filter((a) => a.day === day)
    .sort((a, b) => a.time.localeCompare(b.time));
  const items = dayItems.filter(
    (a) =>
      (filter === "all" || a.category === filter) &&
      a.name.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr")),
  );
  const completed = trip.activities.filter((a) => a.done).length;
  return (
    <>
      <section className={`hero ${dest.generic ? "hero-world" : ""}`}>
        <img
          src={dest.image}
          alt={
            dest.generic
              ? "Seyahat illüstrasyonu"
              : `${dest.name} şehir manzarası`
          }
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="hero-badge">
            <span /> BİR SONRAKİ HİKÂYEN
          </span>
          <h1>
            {dest.name},<br />
            <em>senin ritminde.</em>
          </h1>
          <p>{dest.subtitle} Gerisi senin rotan.</p>
          <div className="hero-meta">
            <span>
              <CalendarDays size={16} />
              {dateAt(trip.start)} – {dateAt(trip.start, trip.days - 1)}
            </span>
            <span>
              <Users size={16} />
              {trip.travelers} kişi
            </span>
            <span>
              <MapPin size={16} />
              {dest.country}
            </span>
          </div>
        </div>
        <button className="hero-edit" onClick={onEdit}>
          <SlidersHorizontal size={16} />
          Tercihleri düzenle
        </button>
        {!dest.generic && (
          <span className="photo-credit">
            {dest.id === "vilnius" ? (
              <a
                href="https://commons.wikimedia.org/wiki/File:Vilnius_old_town_by_Augustas_Didzgalvis.jpg"
                target="_blank"
                rel="noreferrer"
              >
                Augustas Didžgalvis · CC BY-SA 4.0
              </a>
            ) : (
              "Fotoğraf · Unsplash"
            )}
          </span>
        )}
      </section>
      <div className="trip-heading">
        <div>
          <p className="eyebrow">BÜYÜK HAYALLER, KÜÇÜK PLANLAR</p>
          <h2>{trip.title}</h2>
          <p>Biraz keşif, biraz mola. Tam sana göre bir yolculuk.</p>
        </div>
        <button
          className="secondary print-button"
          onClick={() => window.print()}
        >
          <Printer size={16} />
          Yazdır / PDF
        </button>
      </div>
      {dest.generic && (
        <div className="custom-city-note">
          <MapPin size={18} />
          <p>
            <strong>{dest.name} rotan seni bekliyor.</strong> Bu şehirde hazır
            durak önerileri bulunmuyor. “Aktivite ekle” ile günlük planını
            oluşturabilirsin.
          </p>
        </div>
      )}
      <div className="planner-grid">
        <div className="itinerary">
          <div className="days" aria-label="Seyahat günleri">
            {Array.from({ length: trip.days }, (_, i) => (
              <button
                key={i}
                className={day === i + 1 ? "active" : ""}
                aria-pressed={day === i + 1}
                onClick={() => setDay(i + 1)}
              >
                <strong>{i + 1}. Gün</strong>
                <span>{dateAt(trip.start, i)}</span>
              </button>
            ))}
          </div>
          <div className="day-heading">
            <div>
              <h3>
                {day === 1
                  ? "Keşif burada başlıyor"
                  : day === trip.days
                    ? "Son güne güzel anılar"
                    : "Yeni bir gün, yeni hikâyeler"}
              </h3>
              <p>
                {dayItems.length} durak <span>·</span>{" "}
                {money(
                  dayItems.reduce((s, a) => s + a.cost * trip.travelers, 0),
                )}{" "}
                toplam
              </p>
            </div>
            <button className="text-button" onClick={() => onAdd(day)}>
              <Plus size={17} />
              Aktivite ekle
            </button>
          </div>
          <div className="activity-filters">
            <input
              aria-label="Aktivite ara"
              placeholder="Planında ara…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Kategori filtrele"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tüm kategoriler</option>
              {Object.entries(categories).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="timeline">
            {items.map((a, i) => (
              <article
                className={`activity ${a.done ? "completed" : ""}`}
                key={a.id}
              >
                <div className="time">
                  <strong>{a.time}</strong>
                  <span className="timeline-dot">{i + 1}</span>
                </div>
                <div className="activity-card">
                  <div className="activity-main">
                    <span className={`category ${a.category}`}>
                      {categories[a.category]}
                    </span>
                    <h4>{a.name}</h4>
                    <div className="activity-meta">
                      <span>
                        <MapPin size={13} />
                        {a.area || dest.name}
                      </span>
                      <span>
                        <Clock size={13} />
                        {a.duration} dk
                      </span>
                      <span>
                        {a.cost === 0 ? "Ücretsiz" : `${money(a.cost)} / kişi`}
                      </span>
                    </div>
                    <p>{a.note}</p>
                  </div>
                  <div className="activity-actions">
                    <button
                      className={`icon-button check-button ${a.done ? "checked" : ""}`}
                      onClick={() => onToggle(a.id)}
                      aria-label={
                        a.done
                          ? `${a.name}: tamamlandı işaretini kaldır`
                          : `${a.name}: tamamlandı işaretle`
                      }
                      aria-pressed={a.done}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => onActivityEdit(a)}
                      aria-label={`${a.name}: düzenle`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => onDelete(a)}
                      aria-label={`${a.name}: sil`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!items.length && (
            <div className="empty-inline">
              <Route size={30} />
              <h3>
                {dayItems.length
                  ? "Aramana uygun durak yok"
                  : "Bu gün senin keşfine açık"}
              </h3>
              <p>
                {dayItems.length
                  ? "Başka bir kelime veya kategori dene."
                  : "Kendi aktiviteni ekleyerek gününü şekillendir."}
              </p>
              <button className="secondary" onClick={() => onAdd(day)}>
                <Plus size={16} />
                Aktivite ekle
              </button>
            </div>
          )}
          <button className="add-dashed" onClick={() => onAdd(day)}>
            <Plus size={17} />
            Bu güne bir anı daha ekle
          </button>
        </div>
        <aside>
          <BudgetPanel trip={trip} />
          <section className="personal-card">
            <div className="section-label">
              <Leaf size={19} />
              <h3>Senin seyahat stilin</h3>
            </div>
            <p>
              {
                {
                  slow: "Acele etmeden, tadını çıkararak.",
                  balanced: "Keşif ve dinlenme dengede.",
                  fast: "Her güne daha çok keşif.",
                }[trip.pace]
              }
            </p>
            <div className="chips">
              {trip.interests.map((id) => (
                <span className="chip" key={id}>
                  {categories[id]}
                </span>
              ))}
            </div>
            <div className="personal-bottom">
              <span>
                {completed} / {trip.activities.length} durak tamamlandı
              </span>
              {!dest.generic && (
                <button className="text-button" onClick={onRegenerate}>
                  <RefreshCw size={14} />
                  Rotayı yenile
                </button>
              )}
            </div>
          </section>
          <section className="tip-card">
            <span className="tip-icon">✦</span>
            <p className="eyebrow">KÜÇÜK BİR HATIRLATMA</p>
            <h3>
              En güzel anlar bazen
              <br />
              plansız olanlardır.
            </h3>
            <p>
              Rotanda kendine boşluk bırak. Belki de en sevdiğin sokak henüz
              planda yok.
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([dest.name, dest.region, dest.country].filter(Boolean).join(", ") + " gezilecek yerler")}`}
              target="_blank"
              rel="noreferrer"
            >
              Şehri haritada keşfet <ArrowUpRight size={16} />
            </a>
          </section>
        </aside>
      </div>
      <div className="print-only">
        <h2>Tüm seyahat planı</h2>
        {Array.from({ length: trip.days }, (_, i) => (
          <section key={i}>
            <h3>
              {i + 1}. gün · {dateAt(trip.start, i)}
            </h3>
            {trip.activities
              .filter((a) => a.day === i + 1)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((a) => (
                <p key={a.id}>
                  {a.time} — {a.name} · {a.duration} dk · {money(a.cost)} / kişi
                  <br />
                  {a.note}
                </p>
              ))}
          </section>
        ))}
      </div>
    </>
  );
}
