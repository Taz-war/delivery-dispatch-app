import { useEffect, useRef } from "react";
import L from "leaflet";
import { Order } from "@/types/order";
import "leaflet/dist/leaflet.css";

interface OrderMapProps {
  orders: Order[];
  selectedOrder: string | null;
  onSelectOrder: (id: string) => void;
}

const orderTypeColors: Record<string, string> = {
  DODD: "#f97316",     // Orange (primary)
  JOBBER: "#10b981",   // Emerald (accent)
  HOTSHOT: "#ef4444",  // Red (destructive)
  PICKUP: "#8b5cf6",   // Violet (pickup)
  RESTOCK: "#3b82f6",  // Blue
};

// Create custom marker icon
const createMarkerIcon = (color: string) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

export function OrderMap({ orders, selectedOrder, onSelectOrder }: OrderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Filter orders with coordinates
  const ordersWithCoords = orders.filter((o) => o.customer.coordinates);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center (Dallas, TX area)
    const defaultCenter: L.LatLngExpression = [32.9, -96.8];

    mapInstanceRef.current = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 10,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when orders change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    ordersWithCoords.forEach((order) => {
      const color = orderTypeColors[order.orderType] || "#6b7280";
      const marker = L.marker(
        [order.customer.coordinates!.lat, order.customer.coordinates!.lng],
        { icon: createMarkerIcon(color) }
      )
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div style="font-size: 14px;">
            <strong>${order.customer.name}</strong><br/>
            <span style="color: #666;">${order.orderType}</span><br/>
            <small>${order.customer.address}</small>
          </div>
        `)
        .on("click", () => onSelectOrder(order.id));

      markersRef.current.push(marker);
    });

    // Fit bounds if we have markers
    if (ordersWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        ordersWithCoords.map((o) => [
          o.customer.coordinates!.lat,
          o.customer.coordinates!.lng,
        ])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [ordersWithCoords, onSelectOrder]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ background: "hsl(var(--muted))" }}
    />
  );
}
