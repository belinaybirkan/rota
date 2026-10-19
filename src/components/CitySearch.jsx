import { useEffect, useId, useRef, useState } from "react";
import { MapPin, Search, Globe2, Check, ChevronDown } from "lucide-react";
import { destinations } from "../data/destinations.js";
import { searchCities } from "../utils/cities.js";
import { uid } from "../utils/planner.js";

export default function CitySearch({
  selected,
  onSelect,
  disabled = false,
  keepSearching = false,
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [manual, setManual] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(!selected);
  const [active, setActive] = useState(-1);
  const request = useRef(0);
  useEffect(() => {
    const current = ++request.current;
    setResults([]);
    setActive(-1);
    if (!searching || query.trim().length < 2 || disabled) {
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    let timeout;
    setStatus("loading");
    const debounce = setTimeout(async () => {
      timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const found = await searchCities(query, { signal: controller.signal });
        if (request.current === current) {
          setResults(found);
          setStatus(found.length ? "success" : "empty");
        }
      } catch {
        if (request.current === current) setStatus("error");
      } finally {
        clearTimeout(timeout);
      }
    }, 400);
    return () => {
      request.current++;
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, searching, disabled]);
  useEffect(() => {
    if (active >= 0)
      document
        .getElementById(`${id}-result-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, id]);
  function choose(city) {
    onSelect(city);
    setQuery("");
    setSearching(keepSearching);
    setResults([]);
    setStatus("idle");
    setManual(false);
    setError("");
    setActive(-1);
  }
  function manualSave() {
    if (!name.trim() || !country.trim()) {
      setError("Şehir ve ülke adını birlikte yaz.");
      return;
    }
    choose({
      id: `manual:${uid()}`,
      name: name.trim(),
      country: country.trim(),
      region: "",
    });
  }
  function keys(e) {
    if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    }
    if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && results[active]) choose(results[active]);
    }
    if (e.key === "Escape") {
      e.stopPropagation();
      setQuery("");
      setSearching(!selected);
    }
  }
  return (
    <div className="city-search">
      <label htmlFor={`${id}-input`} className="city-label">
        Nereye gitmek istersin?
      </label>
      {selected && (
        <div className="chosen-city">
          <MapPin size={19} />
          <div>
            <strong>{selected.name}</strong>
            <span>
              {[selected.region, selected.country].filter(Boolean).join(" · ")}
            </span>
          </div>
          {disabled ? (
            <Check size={17} />
          ) : (
            <button
              type="button"
              className="text-button"
              onClick={() => setSearching(!searching)}
            >
              {searching ? "Aramayı kapat" : "Değiştir"}
            </button>
          )}
        </div>
      )}
      {!disabled && searching && (
        <>
          <div className="city-search-input">
            <Search size={18} />
            <input
              id={`${id}-input`}
              role="combobox"
              aria-label="Dünya genelinde şehir ara"
              aria-expanded={results.length > 0}
              aria-controls={`${id}-results`}
              aria-autocomplete="list"
              aria-activedescendant={
                active >= 0 ? `${id}-result-${active}` : undefined
              }
              autoComplete="off"
              value={query}
              maxLength={120}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={keys}
              placeholder="Şehir ara: Tokyo, Ankara, New York…"
            />
          </div>
          <p className="city-hint">
            En az 2 harf yaz. Ülkeyle daraltmak için “Paris, France” gibi
            arayabilirsin.
          </p>
          <div className="city-status" role="status">
            {status === "loading"
              ? "Şehirler aranıyor…"
              : status === "empty"
                ? "Sonuç bulunamadı. Farklı bir yazım dene veya şehrini elle ekle."
                : status === "error"
                  ? "Şehir aramasına bağlanılamadı. Aşağıdan elle ekleyerek devam edebilirsin."
                  : ""}
          </div>
          {results.length > 0 && (
            <ul
              id={`${id}-results`}
              className="city-results"
              role="listbox"
              aria-label="Şehir sonuçları"
            >
              {results.map((city, i) => (
                <li
                  key={city.id}
                  id={`${id}-result-${i}`}
                  role="option"
                  aria-selected={active === i}
                  className={active === i ? "highlighted" : ""}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(city)}
                >
                  <MapPin size={17} />
                  <div>
                    <strong>{city.name}</strong>
                    <span>
                      {[city.region, city.country].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  <span className="city-select-label">Seç</span>
                </li>
              ))}
            </ul>
          )}
          {status === "idle" && (
            <div className="city-shortcuts">
              {destinations.map((d) => (
                <button
                  className="chip"
                  key={d.id}
                  type="button"
                  onClick={() =>
                    choose({
                      id: d.id,
                      name: d.name,
                      country: d.country,
                      region: "",
                    })
                  }
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="text-button manual-city-toggle"
            aria-expanded={manual}
            onClick={() => {
              setManual(!manual);
              setName(query.split(",")[0].trim());
              setError("");
            }}
          >
            <PlusLabel />
            Şehrimi elle ekle <ChevronDown size={14} />
          </button>
          {manual && (
            <div className="manual-city">
              <p>Listede olmayan yerleri de ekleyebilirsin.</p>
              <div className="form-grid">
                <label htmlFor={`${id}-name`}>
                  Şehir adı
                  <input
                    id={`${id}-name`}
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn. Kyoto"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        manualSave();
                      }
                    }}
                  />
                </label>
                <label htmlFor={`${id}-country`}>
                  Ülke
                  <input
                    id={`${id}-country`}
                    maxLength={120}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Örn. Japonya"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        manualSave();
                      }
                    }}
                  />
                </label>
              </div>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button type="button" className="secondary" onClick={manualSave}>
                Bu şehri seç
                <Check size={15} />
              </button>
            </div>
          )}
          <p className="city-attribution">
            Şehir verileri:{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>{" "}
            /{" "}
            <a
              href="https://www.geonames.org/"
              target="_blank"
              rel="noreferrer"
            >
              GeoNames
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}
function PlusLabel() {
  return <Globe2 size={15} />;
}
