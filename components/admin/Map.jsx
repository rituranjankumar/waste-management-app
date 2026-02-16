"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ---------- Fix Default Marker Issue ---------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------- Custom Icons ---------- */
const icons = {
  worker: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  Pending: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  Assigned: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  Completed: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  Verified: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
};

/* ---------- Auto Fit Bounds ---------- */
function FitBounds({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (!locations || locations.length === 0) return;

    const valid = locations.filter(
      (loc) => loc.lat !== undefined && loc.lng !== undefined
    );

    if (valid.length === 0) return;

    const bounds = L.latLngBounds(
      valid.map((loc) => [Number(loc.lat), Number(loc.lng)])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 16,
    });
  }, [locations, map]);

  return null;
}

/* ---------- Main Component ---------- */
export default function WasteMap({ locations = [] }) {
  const [filter, setFilter] = useState("All");

  // Remove invalid coordinates
  const validLocations = locations.filter(
    (loc) => loc.lat !== undefined && loc.lng !== undefined
  );

  // Filter
  const filtered = validLocations.filter((loc) => {
    if (filter === "All") return true;
    if (filter === "Workers") return loc.type === "worker";
    if (filter === "Waste") return loc.type === "waste";
    return true;
  });

  // Choose icon
  const getIcon = (loc) => {
    if (loc.type === "worker") return icons.worker;
    return icons[loc.status] || icons.Pending;
  };

  return (
    <div>
      {/* Filter */}
  <div className="mb-4 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
      Filter:
    </label>

    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="
        px-3 py-2
        text-sm
        rounded-lg
        border border-gray-300 dark:border-zinc-600
        bg-white dark:bg-zinc-800
        text-gray-700 dark:text-white
        shadow-sm
        focus:outline-none
        focus:ring-2 focus:ring-blue-500
        transition-all
      "
    >
      <option value="All">All</option>
      <option value="Workers">Workers</option>
      <option value="Waste">Waste Reports</option>
    </select>
  </div>
</div>


      {/* Map */}
      <MapContainer
        center={[20.2961, 85.8245]}
        zoom={12}
        style={{ height: "500px", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Auto Zoom */}
        <FitBounds locations={filtered} />

        {/* Markers */}
        {filtered.map((loc) => (
          <Marker
            key={loc._id}
            position={[Number(loc.lat), Number(loc.lng)]}
            icon={getIcon(loc)}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              {loc.type === "worker"
                ? "Worker"
                : `Status: ${loc.status}`}
            </Tooltip>

            <Popup>
              {loc.type === "worker"
                ? `Worker ID: ${loc.workerId}`
                : `Waste Status: ${loc.status}`}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
