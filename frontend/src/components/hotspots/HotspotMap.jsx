import { useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { riskColor } from "../../utils/riskColor";

export default function HotspotMap({ hotspots, selectedId, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);
  const center = hotspots.length
    ? [hotspots[0].center_latitude, hotspots[0].center_longitude]
    : [22.9, 78.6];

  return (
    <div className="rounded-2xl overflow-hidden border border-ink-100 shadow-glossy hover:shadow-island transition-shadow duration-500 h-[520px]">
      <MapContainer center={center} zoom={5} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map((h) => {
          const isSelected = h.hotspot_id === selectedId;
          const isHovered = h.hotspot_id === hoveredId;
          return (
            <CircleMarker
              key={h.hotspot_id}
              center={[h.center_latitude, h.center_longitude]}
              radius={Math.max(6, Math.min(22, Math.sqrt(h.accident_count) * 1.4))}
              pathOptions={{
                color: riskColor(h.risk_level),
                fillColor: riskColor(h.risk_level),
                fillOpacity: isSelected ? 0.8 : isHovered ? 0.62 : 0.45,
                weight: isSelected ? 3 : isHovered ? 2.25 : 1.5,
              }}
              eventHandlers={{
                click: () => onSelect(h.hotspot_id),
                mouseover: () => setHoveredId(h.hotspot_id),
                mouseout: () => setHoveredId((id) => (id === h.hotspot_id ? null : id)),
              }}
            >
              <Popup>
                <div className="text-sm min-w-[150px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: riskColor(h.risk_level) }} />
                    <p className="font-display font-semibold text-ink-900">Hotspot #{h.hotspot_id}</p>
                  </div>
                  <p className="text-ink-600">{h.accident_count} accidents · {h.risk_level} risk</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
