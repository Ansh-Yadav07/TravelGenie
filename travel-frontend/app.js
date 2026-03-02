let map;
let service;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5,
    styles: [{ elementType: "geometry", stylers: [{ color: "#1d2c4d" }] }]
  });

  service = new google.maps.places.PlacesService(map);
}

// tab logic
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
function activateTab(id) {
  tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === id));
  tabContents.forEach(sec => sec.classList.toggle('active', sec.id === id));
}
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

// companion count toggle
const companionsSelect = document.getElementById('companions');
const companionCount = document.getElementById('companion-count');
companionsSelect?.addEventListener('change', () => {
  const val = companionsSelect.value;
  if (val === 'friends' || val === 'family') {
    companionCount.style.display = 'inline-block';
    companionCount.value = '';
  } else {
    companionCount.style.display = 'none';
    companionCount.value = '';
  }
});

// autocomplete using backend
const placesInput = document.getElementById('places');
const dataList = document.getElementById('places-list');
placesInput?.addEventListener('input', () => {
  const term = placesInput.value;
  fetch(`/api/places?term=${encodeURIComponent(term)}`)
    .then(r => r.json())
    .then(list => {
      dataList.innerHTML = '';
      list.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        dataList.appendChild(opt);
      });
    })
    .catch(console.error);
});

const staySplit = document.getElementById("staySplit");
const stayPercent = document.getElementById("stayPercent");

staySplit?.addEventListener("input", () => {
  stayPercent.textContent = staySplit.value + "%";
});

// form submission
document.getElementById("trip-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const place = document.getElementById("places").value;
  const budget = parseFloat(document.getElementById("budget").value);
  const duration = parseInt(document.getElementById("duration").value);
  const currency = document.getElementById("currency").value;
  const stayRatio = staySplit.value / 100;
  const mood = document.getElementById("mood").value;
  const companions = document.getElementById("companions").value;
  const companionNum = companionCount.value ? parseInt(companionCount.value,10) : null;
  const startDate = document.getElementById("start-date").value;
  const interests = [];
  document.querySelectorAll('#interest-container input[type=checkbox]:checked').forEach(cb => interests.push(cb.value));

  const stayBudget = budget * stayRatio;
  const perNight = stayBudget / duration;

  // update map-based results
  geocodePlace(place, (location) => {
    map.setCenter(location);
    map.setZoom(12);

    searchHotels(location, perNight, currency);
    searchAttractions(location);
    estimateTransport(budget, currency);
  });

  // call backend recommendations as well
  const data = { places: place, budget, duration, currency, mood, companions, companionCount: companionNum, interests };
  fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
  })
    .then(r => r.json())
    .then(result => {
      // optionally display or log; we'll log for debugging
      console.log('API recs', result);
      // display mood suggestions on mood tab
      document.getElementById('mood-output').textContent = result.moods.join(', ');
    });

  // switch to stays tab after form
  activateTab('tab2');
});

function geocodePlace(place, callback) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: place }, (results, status) => {
    if (status === "OK") {
      callback(results[0].geometry.location);
    }
  });
}

function searchHotels(location, perNight, currency) {
  service.nearbySearch({
    location: location,
    radius: 5000,
    type: "lodging"
  }, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      let output = "";
      results.slice(0,5).forEach(place => {
        output += `<p><strong>${place.name}</strong><br>
        Estimated Budget: under ${perNight.toFixed(0)} ${currency}/night</p>`;
      });
      document.getElementById("stays-output").innerHTML = output;
    }
  });
}

function searchAttractions(location) {
  service.nearbySearch({
    location: location,
    radius: 5000,
    type: "tourist_attraction"
  }, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      let output = "";
      results.slice(0,5).forEach(place => {
        output += `<p>${place.name}</p>`;
      });
      document.getElementById("visits-output").innerHTML = output;
    }
  });
}

function estimateTransport(budget, currency) {
  const travelBudget = budget * 0.3;
  document.getElementById("transport-output").innerHTML =
  `Recommended Travel Budget: ${travelBudget.toFixed(0)} ${currency}<br>
   Includes local rides, airport transfer, and intercity options.`;
}