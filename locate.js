async function loadData() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    const deliveries = data.deliveries;

    // Initialize map
    const map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const colors = ["blue", "red", "green", "orange"]; // different route colors

    deliveries.forEach((delivery, index) => {
      // Polyline route
      const routeLine = L.polyline(
        [
          [delivery.start_lat, delivery.start_lng],
          [delivery.end_lat, delivery.end_lng]
        ],
        { color: colors[index % colors.length], weight: 4, opacity: 0.7, dashArray: "10,6" }
      ).addTo(map);

      // Start & End markers
      L.marker([delivery.start_lat, delivery.start_lng]).addTo(map).bindPopup(`Truck ${delivery.id} Start`);
      L.marker([delivery.end_lat, delivery.end_lng]).addTo(map).bindPopup(`Truck ${delivery.id} Destination`);

      // Moving marker
      const movingMarker = L.marker([delivery.start_lat, delivery.start_lng]).addTo(map);

      // Truck info card
      const trucksDiv = document.getElementById("trucks");
      const truckCard = document.createElement("div");
      truckCard.classList.add("truck-card");
      truckCard.innerHTML = `
        <h3>🚚 Truck ${delivery.id}</h3>
        <p><b>Status:</b> ${delivery.status}</p>
        <p><b>Schedule:</b> ${delivery.schedule_day}</p>
        <p><b>Arrival:</b> ${delivery.arrival_date}</p>
        <p><b>Driver:</b> ${delivery.driver_name}</p>
        <p><b>Package:</b> ${delivery.package_info}</p>
      `;
      trucksDiv.appendChild(truckCard);

      // Animate movement
      let currentLat = delivery.start_lat;
      let currentLng = delivery.start_lng;
      const stepLat = (delivery.end_lat - delivery.start_lat) * delivery.speed;
      const stepLng = (delivery.end_lng - delivery.start_lng) * delivery.speed;

      const interval = setInterval(() => {
        currentLat += stepLat;
        currentLng += stepLng;

        movingMarker.setLatLng([currentLat, currentLng]);

        if (Math.abs(currentLat - delivery.end_lat) < 0.0001 &&
            Math.abs(currentLng - delivery.end_lng) < 0.0001) {
          clearInterval(interval);
          movingMarker.bindPopup(`✅ Truck ${delivery.id} Arrived`).openPopup();
        }
      }, 200);
    });

    // Fit map to all routes
    const allCoords = deliveries.flatMap(d => [
      [d.start_lat, d.start_lng],
      [d.end_lat, d.end_lng]
    ]);
    map.fitBounds(allCoords);

  } catch (error) {
    console.error("Error loading data.json:", error);
  }
}

loadData();
