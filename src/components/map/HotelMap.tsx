"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon in Next.js
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const HOTEL_POSITION: [number, number] = [43.95, 17.26];

export default function HotelMap() {
  return (
    <MapContainer
      center={HOTEL_POSITION}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", minHeight: "280px" }}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={HOTEL_POSITION} icon={markerIcon}>
        <Popup>
          <strong>Hotel Jezero</strong>
          <br />
          Čajuša bb, 80320 Kupres, BiH
          <br />
          <a href="tel:+38734275100" style={{ color: "#C5A55A" }}>+387 34 275 100</a>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
