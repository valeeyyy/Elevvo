(() => {
  "use strict";

  const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
  const REVERSE_GEOCODE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
  const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
  const FALLBACK_CITY = { name: "London", admin1: "England", country: "United Kingdom", lat: 51.5072, lon: -0.1276 };

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

  // ---------- DOM helper (no innerHTML for API/user-derived content) ----------

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

  function icon(name, extraClass) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", extraClass ? `icon ${extraClass}` : "icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#icon-${name}`);
    use.setAttribute("href", `#icon-${name}`);
    svg.append(use);
    return svg;
  }

  // ---------- Units ----------

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

  // ---------- Dates ----------

  function dayLabel(isoDate, index) {
    if (index === 0) return "Tomorrow";
    const date = new Date(`${isoDate}T00:00:00`);
    return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
  }

  // ---------- State ----------

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

  // ---------- API ----------

  async function geocodeCity(query) {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("geocode-failed");
    const json = await res.json();
    return json.results || [];
  }

  async function reverseGeocode(lat, lon) {
    const url = `${REVERSE_GEOCODE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("reverse-geocode-failed");
    const json = await res.json();
    return {
      name: json.city || json.locality || json.principalSubdivision || "Your location",
      admin1: json.principalSubdivision || "",
      country: json.countryName || "",
    };
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

  // ---------- Loading a city's weather ----------

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

  // ---------- Geolocation ----------

  function geoErrorMessage(err) {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return "Location access was denied. Showing London instead — search for your own city above.";
      case err.TIMEOUT:
        return "Finding your location took too long. Showing London instead.";
      default:
        return "Your location is unavailable right now. Showing London instead.";
    }
  }

  function useFallbackCity(notice) {
    const fallback = makeCity({ ...FALLBACK_CITY, isPrimary: true, isCurrentLocation: false });
    fallback.notice = notice;
    setPrimaryCity(fallback);
    render();
    loadCityWeather(fallback);
  }

  function locateCurrentCity() {
    if (!("geolocation" in navigator)) {
      useFallbackCity("Location isn't supported in this browser. Showing London instead.");
      return;
    }

    const locating = makeCity({ name: "Finding your location…", isPrimary: true, isCurrentLocation: true });
    setPrimaryCity(locating);
    render();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let place;
        try {
          place = await reverseGeocode(latitude, longitude);
        } catch {
          place = { name: "Your location", admin1: "", country: "" };
        }
        const city = makeCity({ ...place, lat: latitude, lon: longitude, isPrimary: true, isCurrentLocation: true });
        setPrimaryCity(city);
        render();
        loadCityWeather(city);
      },
      (err) => useFallbackCity(geoErrorMessage(err)),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }

  // ---------- Search ----------

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

  // ---------- Unit toggle ----------

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

  // ---------- Remove a city ----------

  function removeCity(id) {
    state.cities = state.cities.filter((c) => c.id !== id);
    render();
  }

  // ---------- Rendering ----------

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

    const kpis = h(
      "ul",
      { class: "city-card__kpis" },
      h("li", null, h("span", { class: "kpi__label" }, "Humidity"), h("span", { class: "kpi__value" }, `${Math.round(current.relative_humidity_2m)}%`)),
      h("li", null, h("span", { class: "kpi__label" }, "Wind"), h("span", { class: "kpi__value" }, formatWind(current.wind_speed_10m, unit))),
      h("li", null, h("span", { class: "kpi__label" }, "Chance of rain"), h("span", { class: "kpi__value" }, `${Math.round(daily.precipitation_probability_max[0] ?? 0)}%`))
    );

    const forecast = h(
      "ul",
      { class: "city-card__forecast" },
      [1, 2, 3].map((i) =>
        h(
          "li",
          { class: "forecast-day" },
          h("span", { class: "forecast-day__label" }, dayLabel(daily.time[i], i - 1)),
          icon(weatherIconName(daily.weather_code[i], true)),
          h(
            "span",
            { class: "forecast-day__range" },
            `${formatTemp(daily.temperature_2m_max[i], unit)}°`,
            " ",
            h("span", { class: "forecast-day__lo" }, `${formatTemp(daily.temperature_2m_min[i], unit)}°`)
          )
        )
      )
    );

    return h("div", null, now, kpis, forecast);
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
        ? h(
            "button",
            { type: "button", class: "icon-btn", "aria-label": "Refresh weather for my location", onclick: locateCurrentCity },
            icon("locate")
          )
        : h(
            "button",
            { type: "button", class: "icon-btn", "aria-label": `Remove ${city.name}`, onclick: () => removeCity(city.id) },
            icon("close")
          )
    );

    const top = h("div", { class: "city-card__top" }, heading, actions);

    let body;
    if (city.status === "locating" || city.status === "loading") {
      body = renderSkeleton(city.isPrimary);
    } else if (city.status === "error") {
      body = renderError(city);
    } else {
      body = renderBody(city);
    }

    return h(
      "li",
      { class: city.isPrimary ? "city-card city-card--primary" : "city-card" },
      top,
      body
    );
  }

  function render() {
    const list = document.getElementById("cityList");
    list.replaceChildren(...state.cities.map(renderCity));
  }

  // ---------- Init ----------

  locateCurrentCity();
})();
