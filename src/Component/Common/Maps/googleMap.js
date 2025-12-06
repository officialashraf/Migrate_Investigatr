import React, { useRef, useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  LoadScript
} from "@react-google-maps/api";

const API_KEY = "AIzaSyDz9p16EGo_d0rQykdvzoYTaDgJLs18Hrw"

const containerStyle = {
  width: "100%",
  height: "100%"
};


const GoogleMapLocation = ({markers}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);

  // Fit bounds automatically to show all markers
  const fitBounds = (map) => {
    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
    map.fitBounds(bounds);
  };

  const onLoad = (map) => {
    mapRef.current = map;
    fitBounds(map);
  };

  console.log("markers",markers)

  return (
    <LoadScript googleMapsApiKey={API_KEY}>
      <GoogleMap
        onLoad={onLoad}
        mapContainerStyle={containerStyle}
        zoom={2} // Default zoom (overwritten by fitBounds)
      >
        {markers.map((point, index) => (
          <Marker
            key={index}
            position={{ lat: point.lat, lng: point.lng }}
            onClick={() => setSelectedMarker(point)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.lat,
              lng: selectedMarker.lng
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h4>Location Info</h4>
              <p>
                Lat: {selectedMarker.lat}, Lng: {selectedMarker.lng}
              </p>
              {selectedMarker.name && <p>Name: {selectedMarker.name}</p>}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default GoogleMapLocation;
