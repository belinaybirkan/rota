import { useState, useEffect, useRef } from "react";
import {
  Compass,
  Map,
  Bookmark,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Search,
  Download,
  Upload,
  Trash2,
  Pencil,
  CalendarDays,
  Users,
  Check,
  Menu,
  X,
  Route,
} from "lucide-react";
import { destinations, getDestination } from "./data/destinations.js";
import {
  seedTrip,
  makeTrip,
  uid,
  totalCost,
  money,
  dateAt,
  generateActivities,
  parseBackup,
} from "./utils/planner.js";
import Modal from "./components/Modal.jsx";
import TripForm from "./components/TripForm.jsx";
import ActivityForm from "./components/ActivityForm.jsx";
import CitySearch from "./components/CitySearch.jsx";
import Planner, { BudgetPanel } from "./pages/Planner.jsx";
const STORAGE_KEY = "rota-trips-v1";
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? { trips: parseBackup(raw), error: "" }
      : { trips: [seedTrip()], error: "" };
  } catch {
    return {
      trips: [],
      error:
        "Kayıtlı veriler okunamadı. Önceki kayıtların üzerine yazılmadı; varsa JSON yedeğini içe aktar.",
    };
  }
}
export default function App() {
  const [initial] = useState(load);
  const [trips, setTrips] = useState(initial.trips);
  const [storageBlocked, setStorageBlocked] = useState(!!initial.error);
  const [storageError, setStorageError] = useState(initial.error);
  const [selected, setSelected] = useState(initial.trips[0]?.id);
  const [page, setPage] = useState("planner");
  const [day, setDay] = useState(1);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);
  const fileRef = useRef();
  const trip = trips.find((t) => t.id === selected) || trips[0];
  useEffect(() => {
    if (storageBlocked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, trips }));
      setStorageError("");
    } catch {
      setStorageError(
        "Tarayıcı kaydına erişilemiyor. Planlarını kaybetmemek için JSON yedeğini indir.",
      );
    }
  }, [trips, storageBlocked]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  function notify(msg) {
    setToast(msg);
  }
  function patchTrip(changed) {
    setTrips((prev) => prev.map((t) => (t.id === changed.id ? changed : t)));
  }
  function openTrip(t) {
    setSelected(t.id);
    setPage("planner");
    setDay(1);
    setMenu(false);
  }
  function addTrip(destination, city) {
    if (trips.length >= 50) {
      notify(
        "En fazla 50 seyahat saklanabilir. Önce bir planı yedekleyip sil.",
      );
      return;
    }
    setModal({ type: "trip", destination, city });
  }
  function saveTrip(v) {
    if (modal.edit) {
      patchTrip({ ...trip, ...v });
      setDay(Math.min(day, v.days));
      notify("Seyahat tercihlerin güncellendi.");
    } else {
      const created = makeTrip(v);
      setTrips([...trips, created]);
      openTrip(created);
      notify("Sana özel rotan hazır.");
    }
    setModal(null);
  }
  function saveActivity(v) {
    const saved = { ...v, id: modal.activity?.id || uid() };
    patchTrip({
      ...trip,
      activities: modal.activity
        ? trip.activities.map((a) => (a.id === saved.id ? saved : a))
        : [...trip.activities, saved],
    });
    setDay(saved.day);
    setModal(null);
    notify("Aktivite kaydedildi.");
  }
  function exportTrips() {
    const blob = new Blob([JSON.stringify({ version: 1, trips }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rota-seyahatlerim.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Seyahat yedeğin indirildi.");
  }
  async function importFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    try {
      if (f.size > 2000000)
        throw new Error("Dosya boyutu en fazla 2 MB olabilir.");
      const incoming = parseBackup(await f.text());
      setModal({ type: "import", incoming });
    } catch (err) {
      notify(
        err.message === "Geçerli bir Rota yedek dosyası seç."
          ? err.message
          : "Dosya okunamadı. En fazla 2 MB olan bir Rota JSON yedeği seç.",
      );
    }
    e.target.value = "";
  }
  function removeTrip(t) {
    setTrips(trips.filter((x) => x.id !== t.id));
    if (selected === t.id) {
      setSelected(trips.find((x) => x.id !== t.id)?.id);
      setDay(1);
    }
    setModal(null);
    notify("Seyahat silindi.");
  }
  const nav = [
    ["planner", Map, "Seyahat planım"],
    ["explore", Compass, "Keşfet"],
    ["trips", Bookmark, "Seyahatlerim"],
    ["budget", Wallet, "Bütçem"],
  ];
  return (
    <div className="app">
      <aside className={`sidebar ${menu ? "mobile-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("planner");
            setMenu(false);
          }}
        >
          <span>
            <Compass size={25} />
          </span>
          rota<span className="brand-dot">.</span>
        </a>
        <p className="brand-caption">YOLCULUK SANA GÖRE.</p>
        <div className="nav-label">KEŞİF ALANIN</div>
        <nav>
          {nav.map(([id, Icon, label]) => (
            <button
              className={page === id ? "active" : ""}
              key={id}
              onClick={() => {
                setPage(id);
                setMenu(false);
              }}
            >
              <Icon size={19} />
              {label}
              {id === "trips" && <span className="count">{trips.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-promo">
          <Compass size={28} />
          <h3>Bir sonraki durak?</h3>
          <p>Hayalini kurduğun yolculuğa küçük bir adım.</p>
          <button onClick={() => addTrip()}>
            <Plus size={15} />
            Yeni seyahat
          </button>
        </div>
        <div className="sidebar-bottom">
          <div className="avatar">G</div>
          <div>
            <strong>Gezgin alanı</strong>
            <span>Planların bu tarayıcıda</span>
          </div>
          <span className="online-dot" />
        </div>
      </aside>
      {menu && (
        <button
          className="nav-scrim"
          aria-label="Menüyü kapat"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Menüyü aç"
              onClick={() => setMenu(true)}
            >
              <Menu size={22} />
            </button>
            <span>Çantanda yeni hikâyelere yer aç.</span>
          </div>
          <div className="top-actions">
            <span className="local-status">
              <span />
              Kişisel seyahat alanın
            </span>
            <button className="primary" onClick={() => addTrip()}>
              <Plus size={17} />
              Yeni seyahat
            </button>
          </div>
        </header>
        <main>
          {storageError && (
            <div className="storage-warning" role="alert">
              {storageError}
              {storageBlocked && (
                <button onClick={() => setModal({ type: "resetStorage" })}>
                  Yeni kayıtla devam et
                </button>
              )}
            </div>
          )}
          {page === "planner" &&
            (trip ? (
              <>
                <div className="page-top">
                  <div>
                    <p className="eyebrow">ROTANI BUL, HİKÂYENİ YAZ</p>
                    <h2>
                      Merhaba, gezgin <span className="sparkle">✦</span>
                    </h2>
                  </div>
                  {trips.length > 1 && (
                    <select
                      aria-label="Aktif seyahat"
                      value={trip.id}
                      onChange={(e) =>
                        openTrip(trips.find((t) => t.id === e.target.value))
                      }
                    >
                      {trips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  )}
                  <span className="page-caption">
                    Her güzel yolculuk bir fikirle başlar.
                  </span>
                </div>
                <Planner
                  key={trip.id}
                  trip={trip}
                  day={day}
                  setDay={setDay}
                  onEdit={() => setModal({ type: "trip", edit: true })}
                  onAdd={(d) => setModal({ type: "activity", day: d })}
                  onActivityEdit={(activity) =>
                    setModal({ type: "activity", activity })
                  }
                  onDelete={(activity) =>
                    setModal({ type: "deleteActivity", activity })
                  }
                  onToggle={(id) =>
                    patchTrip({
                      ...trip,
                      activities: trip.activities.map((a) =>
                        a.id === id ? { ...a, done: !a.done } : a,
                      ),
                    })
                  }
                  onRegenerate={() => setModal({ type: "regenerate" })}
                />
              </>
            ) : (
              <Empty onNew={() => addTrip()} />
            ))}
          {page === "explore" && (
            <>
              <PageTitle
                eyebrow="YENİ HİKÂYELERE DOĞRU"
                title="Dünyada bir yer, tam sana göre."
                subtitle="Şehrini seç; ilgi alanların, tempon ve bütçen rotanı şekillendirsin."
              />
              <section className="world-city-search">
                <CitySearch
                  keepSearching
                  onSelect={(city) => addTrip(city.id, city)}
                />
              </section>
              <div className="catalog-heading">
                <h2>Hazır rotalardan ilham al</h2>
                <p>Bu dört şehirde başlangıç aktiviteleri de hazır.</p>
              </div>
              <div className="destination-grid">
                {destinations.map((d) => (
                  <article className="destination-card" key={d.id}>
                    <div className="destination-image">
                      <img
                        src={d.image}
                        alt={
                          d.generic
                            ? "Seyahat illüstrasyonu"
                            : `${d.name} şehir manzarası`
                        }
                        loading="lazy"
                      />
                      <span>{d.tag}</span>
                    </div>
                    <div className="destination-info">
                      <p className="eyebrow">{d.country}</p>
                      <h2>{d.name}</h2>
                      <p>{d.subtitle}</p>
                      <button
                        className="text-button"
                        onClick={() => addTrip(d.id)}
                      >
                        Bu şehri planla
                        <ArrowUpRight size={19} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <p className="catalog-note">
                Şehir seçimin dört rotayla sınırlı değil. Dünya genelinde şehir
                ara veya istediğin yeri elle ekle. Fotoğraflar: Unsplash.
                Vilnius:{" "}
                <a
                  href="https://commons.wikimedia.org/wiki/File:Vilnius_old_town_by_Augustas_Didzgalvis.jpg"
                  target="_blank"
                  rel="noreferrer"
                >
                  Augustas Didžgalvis
                </a>
                ,{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noreferrer"
                >
                  CC BY-SA 4.0
                </a>{" "}
                (yerleşime göre kırpılmış görünüm).
              </p>
            </>
          )}
          {page === "trips" && (
            <>
              <PageTitle
                eyebrow="HAYALDEN ROTAYA"
                title="Seyahatlerin, bir arada."
                subtitle="Küçük kaçamaklar, uzun zamandır kurduğun hayaller ve sıradaki macera."
              />
              <div className="list-toolbar">
                <span>{trips.length} kayıtlı seyahat</span>
                <div>
                  <button className="secondary" onClick={exportTrips}>
                    <Download size={16} />
                    Yedeği indir
                  </button>
                  <button
                    className="secondary"
                    onClick={() => fileRef.current.click()}
                  >
                    <Upload size={16} />
                    Yedek yükle
                  </button>
                </div>
              </div>
              <div className="saved-grid">
                {trips.map((t) => {
                  const d = getDestination(t.destination, t.city);
                  return (
                    <article className="saved-card" key={t.id}>
                      <img
                        src={d.image}
                        alt={
                          d.generic
                            ? "Seyahat illüstrasyonu"
                            : `${d.name} şehir manzarası`
                        }
                      />
                      <div className="saved-body">
                        <p className="eyebrow">
                          {d.name} · {d.country}
                        </p>
                        <h3>{t.title}</h3>
                        <p>
                          <CalendarDays size={14} />
                          {dateAt(t.start)} · {t.days} gün <Users size={14} />
                          {t.travelers} kişi
                        </p>
                        <div className="saved-bottom">
                          <button
                            className="text-button"
                            onClick={() => openTrip(t)}
                          >
                            Planı aç
                            <ArrowRight size={16} />
                          </button>
                          <button
                            className="icon-button danger"
                            aria-label={`${t.title}: seyahati sil`}
                            onClick={() =>
                              setModal({ type: "deleteTrip", trip: t })
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {!trips.length && <Empty onNew={() => addTrip()} />}
              <p className="catalog-note">
                Planların yalnızca bu tarayıcıda saklanır. Başka bir cihaza
                taşımak için JSON yedeğini indir.
              </p>
            </>
          )}
          {page === "budget" && (
            <>
              <PageTitle
                eyebrow="RAHAT BİR YOLCULUK İÇİN"
                title="Hayallerin büyük, bütçen belli."
                subtitle="Planladığın aktivitelerin maliyetini seyahat bazında takip et."
              />
              {!trips.length ? (
                <Empty onNew={() => addTrip()} />
              ) : (
                <div className="budget-grid">
                  {trips.map((t) => (
                    <div key={t.id}>
                      <button
                        className="budget-title"
                        onClick={() => openTrip(t)}
                      >
                        <h3>{t.title}</h3>
                        <ArrowUpRight size={19} />
                      </button>
                      <BudgetPanel trip={t} full />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <footer>
            <span className="footer-brand">rota.</span>
            <span>Az plan karmaşası. Daha çok güzel anı.</span>
            <span>
              Keşfetmeye devam et <Compass size={14} />
            </span>
          </footer>
        </main>
      </div>
      <input
        hidden
        type="file"
        accept="application/json,.json"
        ref={fileRef}
        onChange={importFile}
      />
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button aria-label="Bildirimi kapat" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {modal?.type === "trip" && (
        <Modal
          title={
            modal.edit ? "Yolculuğunu şekillendir" : "Yeni bir hikâye başlasın."
          }
          subtitle="Birkaç tercih, sana özel bir rota."
          onClose={() => setModal(null)}
        >
          <TripForm
            initial={modal.edit ? trip : undefined}
            key={modal.edit ? trip.id : modal.destination || "new"}
            initialDestination={modal.destination}
            initialCity={modal.city}
            onSave={saveTrip}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
      {modal?.type === "activity" && (
        <Modal
          title={
            modal.activity ? "Bu anı yeniden planla" : "Rotana bir durak ekle."
          }
          onClose={() => setModal(null)}
        >
          <ActivityForm
            trip={trip}
            day={modal.day}
            initial={modal.activity}
            onSave={saveActivity}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
      {[
        "deleteActivity",
        "deleteTrip",
        "regenerate",
        "import",
        "resetStorage",
      ].includes(modal?.type) && (
        <Modal
          title={
            modal.type === "regenerate"
              ? "Rotanı yeniden oluşturalım mı?"
              : modal.type === "import"
                ? "Yedeği geri yükle?"
                : modal.type === "resetStorage"
                  ? "Yeni kayıtla devam et?"
                  : "Bu kaydı silmek ister misin?"
          }
          onClose={() => setModal(null)}
        >
          <p className="confirm-description">
            {modal.type === "deleteActivity"
              ? `“${modal.activity.name}” planından kaldırılacak.`
              : modal.type === "deleteTrip"
                ? `“${modal.trip.title}” ve tüm aktiviteleri silinecek.`
                : modal.type === "regenerate"
                  ? "Mevcut aktiviteler, kaydettiğin ilgi alanları, tempo ve bütçeye göre yeniden oluşturulacak. Kendi eklediğin duraklar ve tamamlandı işaretleri kaldırılacak."
                  : modal.type === "import"
                    ? `${modal.incoming.length} seyahat yüklenecek. Mevcut planların bu yedekle değiştirilecek. İstersen önce mevcut yedeğini indir.`
                    : "Okunamayan önceki tarayıcı kaydı mevcut planlarla değiştirilecek."}
          </p>
          {modal.type === "import" && (
            <button className="text-button" onClick={exportTrips}>
              <Download size={16} />
              Önce mevcut yedeği indir
            </button>
          )}
          <div className="form-actions">
            <button className="secondary" onClick={() => setModal(null)}>
              Vazgeç
            </button>
            <button
              className={
                modal.type.startsWith("delete") ? "delete-button" : "primary"
              }
              onClick={() => {
                if (modal.type === "deleteTrip") {
                  removeTrip(modal.trip);
                  return;
                }
                if (modal.type === "deleteActivity") {
                  patchTrip({
                    ...trip,
                    activities: trip.activities.filter(
                      (a) => a.id !== modal.activity.id,
                    ),
                  });
                  notify("Aktivite silindi.");
                }
                if (modal.type === "regenerate") {
                  patchTrip({ ...trip, activities: generateActivities(trip) });
                  setDay(1);
                  notify("Rotan yeni tercihlerine göre hazır.");
                }
                if (modal.type === "import") {
                  setTrips(modal.incoming);
                  setSelected(modal.incoming[0]?.id);
                  setStorageBlocked(false);
                  setDay(1);
                  notify("Yedek geri yüklendi.");
                }
                if (modal.type === "resetStorage") setStorageBlocked(false);
                setModal(null);
              }}
            >
              {modal.type.startsWith("delete")
                ? "Evet, sil"
                : modal.type === "regenerate"
                  ? "Rotayı yenile"
                  : modal.type === "import"
                    ? "Yedeği yükle"
                    : "Devam et"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function PageTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="page-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
function Empty({ onNew }) {
  return (
    <section className="empty">
      <Compass size={48} />
      <p className="eyebrow">İLK DURAK: HAYAL ETMEK</p>
      <h1>Bir sonraki hikâyen nerede?</h1>
      <p>
        Şehrini seç, tercihlerini ekle. Yolculuğunu birlikte şekillendirelim.
      </p>
      <button className="primary" onClick={onNew}>
        <Plus size={17} />
        İlk seyahatimi oluştur
      </button>
    </section>
  );
}
