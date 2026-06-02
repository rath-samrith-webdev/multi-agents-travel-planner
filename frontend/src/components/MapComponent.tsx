import type { LatLngExpression } from "leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { useMemo } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface MapComponentProps {
  destination: string
}

export default function MapComponent({ destination }: MapComponentProps) {
  const center = useMemo<LatLngExpression>(() => [35.6762, 139.6503], [])

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-xl border border-border shadow-inner">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>{destination}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}