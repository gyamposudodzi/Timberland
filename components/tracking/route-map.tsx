"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Truck } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";
import type { ShipmentStatus } from "@/lib/shipment-status";

interface RouteMapProps {
  originLabel: string;
  destinationLabel: string;
  status: ShipmentStatus;
  etaLabel?: string;
  windowLabel?: string;
  compact?: boolean;
}

const PROGRESS_BY_STATUS: Record<ShipmentStatus, number> = {
  CREATED: 0.08,
  CONFIRMED: 0.18,
  PICKED_UP: 0.32,
  IN_TRANSIT: 0.55,
  AT_HUB: 0.68,
  OUT_FOR_DELIVERY: 0.85,
  DELIVERED: 1.0,
  EXCEPTION: 0.52,
  RETURNED: 0.18,
  CANCELLED: 0.05,
};

type LatLng = [number, number];

// Instant lookup for common cities + cached Nominatim responses
const CITY_COORDS: Record<string, LatLng> = {
  "new york": [40.7128, -74.006],
  "brooklyn": [40.6782, -73.9442],
  "chicago": [41.8781, -87.6298],
  "boston": [42.3601, -71.0589],
  "austin": [30.2672, -97.7431],
  "seattle": [47.6062, -122.3321],
  "los angeles": [34.0522, -118.2437],
  "denver": [39.7392, -104.9903],
  "miami": [25.7617, -80.1918],
  "portland": [45.5152, -122.6784],
  "san diego": [32.7157, -117.1611],
  "san francisco": [37.7749, -122.4194],
  "newark": [40.7357, -74.1724],
  "jersey city": [40.7178, -74.0431],
  "philadelphia": [39.9526, -75.1652],
  "atlanta": [33.749, -84.388],
  "dallas": [32.7767, -96.797],
  "houston": [29.7604, -95.3698],
  "london": [51.5072, -0.1276],
  "accra": [5.6037, -0.187],
};

const geocodeCache = new Map<string, LatLng>();

async function geocodePlace(label: string, fallback: LatLng): Promise<LatLng> {
  const normalized = label.trim().toLowerCase();
  if (!normalized || normalized === "origin") return fallback;

  if (geocodeCache.has(normalized)) return geocodeCache.get(normalized)!;

  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (normalized.includes(city)) {
      geocodeCache.set(normalized, coords);
      return coords;
    }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(label)}`,
      { headers: { Accept: "application/json" } },
    );
    if (res.ok) {
      const data = (await res.json()) as { lat: string; lon: string }[];
      if (data[0]) {
        const coords: LatLng = [Number(data[0].lat), Number(data[0].lon)];
        geocodeCache.set(normalized, coords);
        return coords;
      }
    }
  } catch {
    // Fall back silently if offline or rate-limited
  }

  return fallback;
}

export function RouteMap({
  originLabel,
  destinationLabel,
  status,
  etaLabel = "In transit",
  windowLabel,
  compact = false,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let instance: LeafletMap | null = null;

    async function init() {
      if (!containerRef.current) return;
      const L = await import("leaflet");

      const [origin, destination] = await Promise.all([
        geocodePlace(originLabel, [41.8781, -87.6298]),
        geocodePlace(destinationLabel, [40.6782, -73.9442]),
      ]);

      if (cancelled || !containerRef.current) return;

      // Clear any previous instance cleanly
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      });
      instance = map;
      mapRef.current = map;

      // Clean minimal CartoDB Positron basemap matching Parcel sage aesthetic
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
      }).addTo(map);

      // Curved arc midpoint for nicer route visualization
      const midLat = (origin[0] + destination[0]) / 2 + Math.abs(origin[1] - destination[1]) * 0.06;
      const midLng = (origin[1] + destination[1]) / 2;
      const routePoints: LatLng[] = [origin, [midLat, midLng], destination];

      L.polyline(routePoints, {
        color: "#142E28",
        weight: 3.5,
        opacity: 0.9,
      }).addTo(map);

      // Origin marker
      L.circleMarker(origin, {
        radius: 6,
        color: "#FFFFFF",
        weight: 2,
        fillColor: "#142E28",
        fillOpacity: 1,
      }).addTo(map);

      // Destination marker with lime halo
      L.circleMarker(destination, {
        radius: 12,
        color: "#D4F77D",
        weight: 0,
        fillColor: "#D4F77D",
        fillOpacity: 0.55,
      }).addTo(map);

      L.circleMarker(destination, {
        radius: 6,
        color: "#FFFFFF",
        weight: 2,
        fillColor: "#3A7C56",
        fillOpacity: 1,
      }).addTo(map);

      // Interpolated truck marker along quadratic curve
      const t = PROGRESS_BY_STATUS[status] ?? 0.5;
      const truckLat =
        (1 - t) * (1 - t) * origin[0] + 2 * (1 - t) * t * midLat + t * t * destination[0];
      const truckLng =
        (1 - t) * (1 - t) * origin[1] + 2 * (1 - t) * t * midLng + t * t * destination[1];

      const truckIcon = L.divIcon({
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        html: `<div style="width:28px;height:28px;border-radius:8px;background:#142E28;color:#D4F77D;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.22);border:2px solid #ffffff;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
        </div>`,
      });
      L.marker([truckLat, truckLng], { icon: truckIcon }).addTo(map);

      const bounds = L.latLngBounds(routePoints);
      if (origin[0] === destination[0] && origin[1] === destination[1]) {
        map.setView(origin, 11);
      } else {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
      }

      setReady(true);
    }

    init();

    return () => {
      cancelled = true;
      if (instance) {
        instance.remove();
      }
      mapRef.current = null;
    };
  }, [originLabel, destinationLabel, status]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-[#E4ECE6] ${
        compact ? "h-56" : "h-64 sm:h-72"
      }`}
    >
      <div ref={containerRef} className="h-full w-full z-0" />

      {!ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#E4ECE6] text-xs text-muted-foreground">
          Loading map…
        </div>
      )}

      {/* Top-left floating status card */}
      <div className="pointer-events-none absolute left-3.5 top-3.5 z-10 max-w-[220px] rounded-xl border border-border bg-white/95 px-3.5 py-2.5 shadow-sm backdrop-blur">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-success">
          <Truck className="h-3 w-3" /> {etaLabel}
        </p>
        {windowLabel && <p className="mt-0.5 text-sm font-bold text-forest">{windowLabel}</p>}
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {originLabel} &rarr; {destinationLabel}
        </p>
      </div>

      {/* Destination pill */}
      <div className="pointer-events-none absolute bottom-3 left-3.5 z-10 rounded-md bg-forest/90 px-2.5 py-1 text-[11px] font-medium text-white shadow">
        To: {destinationLabel}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-xs">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in map"
          className="grid h-7 w-7 place-items-center text-forest hover:bg-muted cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <div className="h-px bg-border" />
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out map"
          className="grid h-7 w-7 place-items-center text-forest hover:bg-muted cursor-pointer"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
