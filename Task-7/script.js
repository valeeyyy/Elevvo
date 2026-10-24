(() => {
  "use strict";

  const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
  const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
  const DEFAULT_CITY = { name: "Paris", admin1: "Île-de-France", country: "France", lat: 48.8566, lon: 2.3522 };
  const SIMULATED_CURRENT_LOCATION = { name: "Jakarta", admin1: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 };

  const WEATHER_TEXT = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Rime fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
    56: "Freezing drizzle", 57: "Dense freezing drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain",
    66: "Freezing rain", 67: "Heavy freezing rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
    80: "Light showers", 81: "Showers", 82: "Violent showers",
    85: "Snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm",
  };

  function weatherIconName(code, isDay) {
    if (code === 0 || code === 1) return isDay ? "sun" : "moon";
    if (code === 2) return isDay ? "cloud-sun" : "cloud-moon";
    if (code === 3) return "cloud";
    if (code === 45 || code === 48) return "fog";
    if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
    if ([95, 96, 99].includes(code)) return "thunder";
    return "cloud";
  }

  function weatherText(code) {
    return WEATHER_TEXT[code] || "Unknown conditions";
  }

  const WEATHER_HUE = {
    sun: "#f2a93b",
    "cloud-sun": "#e3a94a",
    moon: "#8aa9d6",
    "cloud-moon": "#7e93b8",
    cloud: "#93a0b3",
    fog: "#8d97a8",
    drizzle: "#5fa8d8",
    rain: "#4f93c9",
    snow: "#a9dced",
    thunder: "#5f7a9e",
  };

  function weatherHue(iconName) {
    return WEATHER_HUE[iconName] || "var(--accent)";
  }

  function h(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (value === null || value === undefined || value === false) continue;
        if (key === "class") node.className = value;
        else if (key.startsWith("on") && typeof value === "function") {
          node.addEventListener(key.slice(2), value);
        } else {
          node.setAttribute(key, value === true ? "" : value);
        }
      }
    }
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  const ICON_MAP = {
    search: "magnifying-glass",
    close: "xmark",
    locate: "location-crosshairs",
    refresh: "arrow-rotate-right",
    sun: "sun",
    moon: "moon",
    cloud: "cloud",
    "cloud-sun": "cloud-sun",
    "cloud-moon": "cloud-moon",
    fog: "smog",
    drizzle: "cloud-rain",
    rain: "cloud-showers-heavy",
    snow: "snowflake",
    thunder: "cloud-bolt",
    droplet: "droplet",
    wind: "wind",
    umbrella: "umbrella",
  };

  function icon(name, extraClass) {
    const i = document.createElement("i");
    i.className = `icon fa-solid fa-${ICON_MAP[name] || name}${extraClass ? ` ${extraClass}` : ""}`;
    i.setAttribute("aria-hidden", "true");
    return i;
  }

  function celsiusToFahrenheit(c) {
    return (c * 9) / 5 + 32;
  }

  function kmhToMph(kmh) {
    return kmh * 0.621371;
  }

  function formatTemp(celsius, unit) {
    const value = unit === "f" ? celsiusToFahrenheit(celsius) : celsius;
    return Math.round(value);
  }

  function formatWind(kmh, unit) {
    const value = unit === "f" ? kmhToMph(kmh) : kmh;
    return `${Math.round(value)} ${unit === "f" ? "mph" : "km/h"}`;
  }

  function dayLabel(isoDate, index) {
    if (index === 0) return "Tomorrow";
    const date = new Date(`${isoDate}T00:00:00`);
    return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
  }

  const state = {
    unit: "c",
    cities: [],
  };

  function cityId(lat, lon) {
    return `${lat.toFixed(2)},${lon.toFixed(2)}`;
  }

  function makeCity({ name, admin1, country, lat, lon, isPrimary, isCurrentLocation }) {
    const hasCoords = typeof lat === "number" && typeof lon === "number";
    return {
      id: hasCoords ? cityId(lat, lon) : "locating",
      name,
      admin1: admin1 || "",
      country: country || "",
      lat,
      lon,
      isPrimary: !!isPrimary,
      isCurrentLocation: !!isCurrentLocation,
      status: "locating",
      errorMessage: "",
      notice: "",
      data: null,
    };
  }

  function setPrimaryCity(city) {
    if (state.cities[0] && state.cities[0].isPrimary) {
      state.cities[0] = city;
    } else {
      state.cities.unshift(city);
    }
  }

  const FEATURE_CODE_RANK = {
    PPLC: 5, 
    PPLA: 4,
    PPLA2: 3,
    PPLA3: 2,
    PPLA4: 1,
    PPL: 0, 
    PPLL: -2, 
    PPLX: -3, 
  };

  function normalizeForMatch(str) {
    return (str || "").trim().toLowerCase();
  }

  function scoreGeocodeResult(result, query) {
    const name = normalizeForMatch(result.name);
    const q = normalizeForMatch(query);
    let score = 0;

    if (name === q) score += 100;
    else if (name.startsWith(q)) score += 40;
    else if (name.includes(q)) score += 10;

    score += (FEATURE_CODE_RANK[result.feature_code] ?? 0) * 10;

    if (typeof result.population === "number" && result.population > 0) {
      score += Math.log10(result.population);
    }

    return score;
  }

  function dedupeGeocodeResults(results) {
    const seen = new Set();
    return results.filter((result) => {
      const key = `${normalizeForMatch(result.name)}|${normalizeForMatch(result.admin1)}|${normalizeForMatch(result.country)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function rankGeocodeResults(results, query) {
    return dedupeGeocodeResults(results)
      .map((result, index) => ({ result, index, score: scoreGeocodeResult(result, query) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((entry) => entry.result);
  }

  async function geocodeCity(query) {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("geocode-failed");
    const json = await res.json();
    const results = json.results || [];
    return rankGeocodeResults(results, query).slice(0, 5);
  }

  async function fetchWeather(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      timezone: "auto",
      forecast_days: 4,
    });
    const res = await fetch(`${FORECAST_URL}?${params}`);
    if (!res.ok) throw new Error("weather-failed");
    return res.json();
  }

  async function loadCityWeather(city) {
    city.status = "loading";
    render();
    try {
      const data = await fetchWeather(city.lat, city.lon);
      city.data = data;
      city.status = "ready";
    } catch {
      city.status = "error";
      city.errorMessage = "Couldn't load the forecast. Check your connection and try again.";
    }
    render();
  }

  function loadDefaultCity() {
    const city = makeCity({ ...DEFAULT_CITY, isPrimary: true, isCurrentLocation: false });
    setPrimaryCity(city);
    render();
    loadCityWeather(city);
  }

  function useCurrentLocation() {
    const city = makeCity({ ...SIMULATED_CURRENT_LOCATION, isPrimary: true, isCurrentLocation: true });
    setPrimaryCity(city);
    render();
    loadCityWeather(city);
  }

  const searchForm = document.getElementById("searchForm");
  const cityInput = document.getElementById("cityInput");
  const searchSubmit = document.getElementById("searchSubmit");
  const searchResults = document.getElementById("searchResults");

  function closeResults() {
    searchResults.classList.remove("is-open");
    searchResults.replaceChildren();
  }

  function showResultsStatus(message) {
    searchResults.replaceChildren(h("p", { class: "search-results__status" }, message));
    searchResults.classList.add("is-open");
  }

  function showResultsList(results) {
    const list = h(
      "ul",
      { class: "search-results__list" },
      results.map((result) =>
        h(
          "li",
          null,
          h(
            "button",
            { type: "button", class: "result-btn", onclick: () => chooseResult(result) },
            h("span", { class: "result-btn__name" }, result.name),
            h("span", { class: "result-btn__place" }, [result.admin1, result.country].filter(Boolean).join(", "))
          )
        )
      )
    );
    searchResults.replaceChildren(list);
    searchResults.classList.add("is-open");
  }

  function chooseResult(result) {
    const id = cityId(result.latitude, result.longitude);
    const existing = state.cities.find((c) => c.id === id);
    if (existing) {
      showResultsStatus(`${result.name} is already on your dashboard.`);
      return;
    }
    const city = makeCity({
      name: result.name,
      admin1: result.admin1 || "",
      country: result.country || "",
      lat: result.latitude,
      lon: result.longitude,
      isPrimary: false,
    });
    state.cities.push(city);
    closeResults();
    cityInput.value = "";
    cityInput.focus();
    render();
    loadCityWeather(city);
  }

  function setSearchBusy(isBusy) {
    searchSubmit.disabled = isBusy;
    searchSubmit.setAttribute("aria-busy", String(isBusy));
    searchSubmit.textContent = isBusy ? "Searching…" : "Search";
  }

  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = cityInput.value.trim();
    if (!query) {
      showResultsStatus("Enter a city name to search.");
      return;
    }

    setSearchBusy(true);
    showResultsStatus("Searching…");
    try {
      const results = await geocodeCity(query);
      if (results.length === 0) {
        showResultsStatus(`No matches for "${query}". Check the spelling and try again.`);
      } else {
        showResultsList(results);
      }
    } catch {
      showResultsStatus("Search failed. Check your connection and try again.");
    } finally {
      setSearchBusy(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!searchForm.contains(event.target)) closeResults();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchResults.classList.contains("is-open")) {
      closeResults();
    }
  });

  document.getElementById("useCurrentLocationBtn").addEventListener("click", useCurrentLocation);

  const unitC = document.getElementById("unitC");
  const unitF = document.getElementById("unitF");

  function setUnit(unit) {
    state.unit = unit;
    unitC.setAttribute("aria-pressed", String(unit === "c"));
    unitF.setAttribute("aria-pressed", String(unit === "f"));
    render();
  }

  unitC.addEventListener("click", () => setUnit("c"));
  unitF.addEventListener("click", () => setUnit("f"));

  function removeCity(id) {
    state.cities = state.cities.filter((c) => c.id !== id);
    render();
  }

  function renderSkeleton(isPrimary) {
    return h(
      "div",
      { class: "skeleton", "aria-hidden": "true" },
      h("div", { class: "skeleton-line skeleton-line--lg" }),
      h("div", { class: "skeleton-line skeleton-line--sm" }),
      isPrimary ? h("div", { class: "skeleton-line skeleton-line--sm" }) : null
    );
  }

  function renderError(city) {
    return h(
      "div",
      { class: "city-card__error" },
      h("p", { role: "status" }, city.errorMessage),
      h(
        "button",
        { type: "button", class: "btn btn--ghost", onclick: () => loadCityWeather(city) },
        icon("refresh"),
        " Try again"
      )
    );
  }

  function renderBody(city) {
    const { current, daily } = city.data;
    const unit = state.unit;
    const unitLabel = unit === "f" ? "°F" : "°C";
    const iconName = weatherIconName(current.weather_code, current.is_day === 1);

    const now = h(
      "div",
      { class: "city-card__now" },
      icon(iconName),
      h(
        "div",
        null,
        h(
          "p",
          { class: "city-card__temp" },
          formatTemp(current.temperature_2m, unit),
          h("span", { class: "unit" }, unitLabel)
        ),
        h("p", { class: "city-card__condition" }, weatherText(current.weather_code)),
        h(
          "p",
          { class: "city-card__feels" },
          `Feels like ${formatTemp(current.apparent_temperature, unit)}°`
        )
      )
    );

    function kpi(glyph, label, value) {
      return h(
        "li",
        null,
        h("span", { class: "kpi__label-row" }, icon(glyph, "kpi-icon"), h("span", { class: "kpi__label" }, label)),
        h("span", { class: "kpi__value" }, value)
      );
    }

    const kpis = h(
      "ul",
      { class: "city-card__kpis" },
      kpi("droplet", "Humidity", `${Math.round(current.relative_humidity_2m)}%`),
      kpi("wind", "Wind", formatWind(current.wind_speed_10m, unit)),
      kpi("umbrella", "Rain", `${Math.round(daily.precipitation_probability_max[0] ?? 0)}%`)
    );

    const forecast = h(
      "ul",
      { class: "city-card__forecast" },
      [1, 2, 3].map((i) => {
        const dayIcon = weatherIconName(daily.weather_code[i], true);
        return h(
          "li",
          { class: "forecast-day", style: `--day-hue: ${weatherHue(dayIcon)}` },
          h("span", { class: "forecast-day__label" }, dayLabel(daily.time[i], i - 1)),
          icon(dayIcon),
          h(
            "span",
            { class: "forecast-day__range" },
            `${formatTemp(daily.temperature_2m_max[i], unit)}°`,
            " ",
            h("span", { class: "forecast-day__lo" }, `${formatTemp(daily.temperature_2m_min[i], unit)}°`)
          )
        );
      })
    );

    return {
      content: h("div", { class: "city-card__content" }, now, kpis, forecast),
      watermark: icon(iconName, "city-card__watermark"),
    };
  }

  function renderCity(city) {
    const heading = h(
      "div",
      { class: "city-card__heading" },
      h("h2", null, city.name),
      [city.admin1, city.country].filter(Boolean).length
        ? h("span", { class: "city-card__place" }, [city.admin1, city.country].filter(Boolean).join(", "))
        : null,
      city.isCurrentLocation ? h("span", { class: "city-card__badge" }, "Current location") : null,
      city.notice ? h("p", { class: "city-card__notice", role: "status" }, city.notice) : null
    );

    const actions = h(
      "div",
      { class: "city-card__actions" },
      city.isPrimary
        ? null
        : h(
            "button",
            { type: "button", class: "icon-btn", "aria-label": `Remove ${city.name}`, onclick: () => removeCity(city.id) },
            icon("close")
          )
    );

    const top = h("div", { class: "city-card__top" }, heading, actions);

    let body;
    let watermark = null;
    let cardHue = "";
    if (city.status === "locating" || city.status === "loading") {
      body = renderSkeleton(city.isPrimary);
    } else if (city.status === "error") {
      body = renderError(city);
    } else {
      const rendered = renderBody(city);
      body = rendered.content;
      watermark = rendered.watermark;
      cardHue = weatherHue(weatherIconName(city.data.current.weather_code, city.data.current.is_day === 1));
    }

    return h(
      "li",
      {
        class: city.isPrimary ? "city-card city-card--primary" : "city-card",
        style: cardHue ? `--card-hue: ${cardHue}` : null,
      },
      watermark,
      top,
      body
    );
  }

  function render() {
    const list = document.getElementById("cityList");
    list.replaceChildren(...state.cities.map(renderCity));
  }

  loadDefaultCity();
})();
