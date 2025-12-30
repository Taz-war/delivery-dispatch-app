import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import { Order } from "@/types/order";
import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";

interface OrderMapProps {
  orders: Order[];
  selectedOrder: string | null;
  onSelectOrder: (id: string) => void;
}

// Custom marker icons based on order type
const createMarkerIcon = (color: string) =>
  new Icon({
    iconUrl: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const orderTypeColors: Record<string, string> = {
  DODD: "%23f97316",     // Orange (primary)
  JOBBER: "%2310b981",   // Emerald (accent)
  HOTSHOT: "%23ef4444",  // Red (destructive)
  PICKUP: "%238b5cf6",   // Violet (pickup)
  RESTOCK: "%233b82f6",  // Blue
};

// Component to fit map bounds to markers
function FitBounds({ orders }: { orders: Order[] }) {
  const map = useMap();

  useEffect(() => {
    const ordersWithCoords = orders.filter((o) => o.customer.coordinates);
    if (ordersWithCoords.length === 0) return;

    const bounds = new LatLngBounds(
      ordersWithCoords.map((o) => [
        o.customer.coordinates!.lat,
        o.customer.coordinates!.lng,
      ])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [orders, map]);

  return null;
}

export function OrderMap({ orders, selectedOrder, onSelectOrder }: OrderMapProps) {
  // Filter orders with coordinates
  const ordersWithCoords = useMemo(
    () => orders.filter((o) => o.customer.coordinates),
    [orders]
  );

  // Default center (Dallas, TX area based on sample addresses)
  const defaultCenter: [number, number] = [32.9, -96.8];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={10}
      className="w-full h-full z-0"
      style={{ background: "hsl(var(--muted))" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds orders={ordersWithCoords} />

      {ordersWithCoords.map((order) => (
        <Marker
          key={order.id}
          position={[order.customer.coordinates!.lat, order.customer.coordinates!.lng]}
          icon={createMarkerIcon(orderTypeColors[order.orderType] || "%236b7280")}
          eventHandlers={{
            click: () => onSelectOrder(order.id),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{order.customer.name}</p>
              <p className="text-muted-foreground">{order.orderType}</p>
              <p className="text-xs mt-1">{order.customer.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
