import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const RouteMapComponent = ({ places }) => {
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const waypoints = places
      .map((place) => {
        const coords = getLatLngFromUrl(place.locationUrl);
        return coords ? L.latLng(coords[0], coords[1]) : null;
      })
      .filter((coord) => coord);

    if (routingControlRef.current) {
      routingControlRef.current.remove();
      routingControlRef.current = null;
    }

    if (waypoints.length >= 2) {
      routingControlRef.current = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        lineOptions: { styles: [{ color: "#007bff", weight: 5 }] },
        createMarker: function (i, wp) {
          return L.marker(wp.latLng).bindPopup(places[i]?.place);
        },
      }).addTo(map);

      map.fitBounds(L.latLngBounds(waypoints));
    }

    return () => {
      if (routingControlRef.current) {
        routingControlRef.current.remove();
        routingControlRef.current = null;
      }
    };
  }, [places]);

  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={10}
      style={{ height: "400px", width: "100%" }}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
};

export default RouteMapComponent;

const getLatLngFromUrl = (url) => {
  try {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    return match ? [parseFloat(match[1]), parseFloat(match[2])] : null;
  } catch {
    return null;
  }
};
