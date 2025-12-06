import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.fullscreen/Control.FullScreen.js";
import "leaflet.fullscreen/Control.FullScreen.css";
import axios from "axios";
import Cookies from "js-cookie";
import Loader from "../../Modules/Layout/loader";

// Fix default marker icon
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
} catch (e) {
  console.warn("Leaflet icon setup warning:", e);
}

const CONTACT_EMAIL = "info.curatedcodes@gmail.com";
const STREET_ZOOM_LEVEL = 15; // Street level zoom threshold

// Custom marker icon with count badge
const createCountIcon = (count) => {
  const color = count > 10 ? '#dc2626' : count > 5 ? '#f97316' : '#3b82f6';
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="position: relative;">
        <img src="${require("leaflet/dist/images/marker-icon.png")}" 
             style="width: 25px; height: 41px;" />
        ${count > 1 ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: ${color};
            color: white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${count}</div>
        ` : ''}
      </div>
    `,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Geocoding cache to avoid repeated API calls
const geocodeCache = {};

// Batch geocode locations
const geocodeLocations = async (locations) => {
  console.log(`🔍 Starting geocoding for ${locations.length} locations...`);
  const results = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const cacheKey = `${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`;

    // Check cache first
    if (geocodeCache[cacheKey]) {
      console.log(`✅ Cache hit for ${cacheKey}: ${geocodeCache[cacheKey]}`);
      results.push({ ...loc, name: geocodeCache[cacheKey] });
      continue;
    }

    try {
      console.log(`🌐 Geocoding ${i + 1}/${locations.length}: ${loc.lat}, ${loc.lng}`);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`,
        {
          headers: {
            'User-Agent': 'LeafletMapApp/1.0',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📍 Geocoded result:`, data);

      const name = data.display_name || data.name || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
      geocodeCache[cacheKey] = name;
      results.push({ ...loc, name });

      console.log(`✅ Geocoded: ${name}`);

      // Rate limiting: 1 request per second
      if (i < locations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1100));
      }
    } catch (error) {
      console.error(`❌ Geocoding error for ${loc.lat}, ${loc.lng}:`, error);
      const fallbackName = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
      results.push({ ...loc, name: fallbackName });
    }
  }

  console.log(`✅ Geocoding complete. ${results.length} locations processed.`);
  return results;
};

// Safe HeatLayer Component
const HeatLayer = React.memo(({ points, visible }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Proper map size invalidation
    const timer = setTimeout(() => {
      map.invalidateSize(true);
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          layer.redraw();
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (!map || !points || !Array.isArray(points) || points.length === 0 || !visible) {
      return;
    }

    let heatLayer = null;
    let mounted = true;

    const initHeatmap = async () => {
      try {
        if (!window.L?.heatLayer) {
          if (!document.querySelector('script[src*="leaflet-heat"]')) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
            script.async = true;

            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              setTimeout(() => reject(new Error('Script load timeout')), 5000);
              document.head.appendChild(script);
            });
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        if (!mounted || !window.L?.heatLayer) {
          console.warn('HeatLayer: leaflet.heat not available');
          return;
        }

        const validPoints = points
          .filter(p => {
            if (!p) return false;
            const lat = p?.lat ?? p?.[0];
            const lng = p?.lng ?? p?.[1];
            const isValid = (
              typeof lat === 'number' &&
              typeof lng === 'number' &&
              !isNaN(lat) &&
              !isNaN(lng) &&
              lat >= -90 &&
              lat <= 90 &&
              lng >= -180 &&
              lng <= 180
            );

            if (isValid) {
              console.log(`✅ Valid point: [${lat}, ${lng}]`);
            } else {
              console.warn(`❌ Invalid point:`, p);
            }

            return isValid;
          })
          .map(p => {
            const lat = p?.lat ?? p?.[0];
            const lng = p?.lng ?? p?.[1];
            const count = p?.count ?? p?.[2] ?? 1;

            // IMPORTANT: Leaflet heatmap expects [lat, lng] format
            const point = [
              parseFloat(lat),
              parseFloat(lng),
              Math.max(0.1, parseFloat(count) || 1)
            ];

            console.log(`🔥 Heatmap point: [${point[0]}, ${point[1]}] with intensity ${point[2]}`);
            return point;
          });

        if (validPoints.length === 0 || !mounted) {
          console.warn('No valid points for heatmap');
          return;
        }

        console.log(`🔥 Creating heatmap with ${validPoints.length} points`);

        heatLayer = window.L.heatLayer(validPoints, {
          radius: 15,
          blur: 20,
          maxZoom: 17,
          minOpacity: 0.5,
          max: 1.0,
          gradient: {
            0.2: '#bd0026',
            0.4: '#bd0026',
            0.6: '#bd0026',
            0.8: '#bd0026',
            1.0: '#bd0026'
          }
        });

        if (heatLayer && map && mounted) {
          heatLayer.addTo(map);
          console.log('✅ Heatmap layer added to map');
        }

      } catch (error) {
        console.error('HeatLayer error:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      initHeatmap();
    }, 150);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);

      if (heatLayer) {
        try {
          if (map?.hasLayer?.(heatLayer)) {
            map.removeLayer(heatLayer);
            console.log('🗑️ Heatmap layer removed');
          }
        } catch (e) {
          console.warn('HeatLayer cleanup warning:', e);
        }
      }
    };
  }, [points, map, visible]);

  return null;
});

// Zoom Event Handler Component
// const ZoomHandler = React.memo(({ onZoomChange, initialMarkers }) => {
//   const map = useMap();
//   const initialBoundsFitRef = useRef(false);

//   useEffect(() => {
//     if (!map) return;

//     const handleZoomEnd = () => {
//       const zoom = map.getZoom();
//       const center = map.getCenter();
//       onZoomChange(zoom, center);
//     };

//     map.on('zoomend', handleZoomEnd);

//     // Add controls
//     try {
//       if (!map._zoomControlAdded) {
//         L.control.zoom({ position: "topleft" }).addTo(map);
//         map._zoomControlAdded = true;
//       }
//     } catch (e) {
//       console.warn("Zoom control error:", e);
//     }

//     try {
//       if (!map._fullscreenControlAdded && L.control.fullscreen) {
//         L.control.fullscreen({
//           position: "topleft",
//           title: "Full Screen",
//           titleCancel: "Exit Full Screen",
//         }).addTo(map);
//         map._fullscreenControlAdded = true;
//       }
//     } catch (e) {
//       console.warn("Fullscreen control error:", e);
//     }

//     return () => {
//       map.off('zoomend', handleZoomEnd);
//     };
//   }, [map, onZoomChange]);

//   // Fit bounds only once on initial load
//   useEffect(() => {
//     if (!map || initialBoundsFitRef.current) return;

//     try {
//       if (initialMarkers && Array.isArray(initialMarkers) && initialMarkers.length > 0) {
//         const validMarkers = initialMarkers.filter(m => 
//           m && typeof m.lat === 'number' && typeof m.lng === 'number'
//         );

//         if (validMarkers.length > 0) {
//           const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));

//           console.log('📏 Fitting map to bounds:', bounds);

//           // Delay to ensure map is fully initialized
//           setTimeout(() => {
//             map.fitBounds(bounds, { 
//               padding: [50, 50], 
//               maxZoom: 10,
//               animate: false 
//             });

//             // Force tile reload after bounds adjustment
//             setTimeout(() => {
//               map.eachLayer((layer) => {
//                 if (layer instanceof L.TileLayer) {
//                   layer.redraw();
//                 }
//               });
//             }, 300);

//             initialBoundsFitRef.current = true;
//           }, 200);
//         }
//       }
//     } catch (e) {
//       console.warn("Fit bounds error:", e);
//     }
//   }, [map, initialMarkers]);

//   return null;
// });

const ZoomHandler = ({ onZoomChange, initialMarkers }) => {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const initialBoundsFitRef = useRef(false);

  useEffect(() => {
    if (!map) return;

    const handleZoomEnd = () => {
      const zoom = map.getZoom();
      const center = map.getCenter();
      onZoomChange(zoom, center);
    };

    // Fullscreen change detection
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isNowFullscreen);

      // Fullscreen mode: zoom to level 2
      if (isNowFullscreen) {
        console.log("🖥️ Entering fullscreen - setting zoom to 2");
        map.setZoom(2);
      }
      // Normal mode: zoom to level 1
      else {
        console.log("📱 Exiting fullscreen - setting zoom to 1");
        map.setZoom(1);
      }

      // Invalidate map size for proper rendering
      setTimeout(() => {
        map.invalidateSize(true);
      }, 100);
    };

    map.on('zoomend', handleZoomEnd);

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Add controls
    try {
      if (!map._zoomControlAdded) {
        L.control.zoom({ position: "topleft" }).addTo(map);
        map._zoomControlAdded = true;
      }
    } catch (e) {
      console.warn("Zoom control error:", e);
    }

    // Add fullscreen control
    try {
      if (!map._fullscreenControlAdded) {
        const fullscreenControl = L.Control.extend({
          options: { position: 'topleft' },
          onAdd: function () {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = L.DomUtil.create('a', '', container);
            button.innerHTML = '⛶';
            button.href = '#';
            button.title = 'Toggle Fullscreen';
            button.style.fontSize = '20px';
            button.style.lineHeight = '30px';
            button.style.width = '30px';
            button.style.height = '30px';
            button.style.textAlign = 'center';

            L.DomEvent.on(button, 'click', function (e) {
              L.DomEvent.preventDefault(e);
              const mapContainer = map.getContainer();

              if (!document.fullscreenElement) {
                if (mapContainer.requestFullscreen) {
                  mapContainer.requestFullscreen();
                } else if (mapContainer.webkitRequestFullscreen) {
                  mapContainer.webkitRequestFullscreen();
                } else if (mapContainer.mozRequestFullScreen) {
                  mapContainer.mozRequestFullScreen();
                } else if (mapContainer.msRequestFullscreen) {
                  mapContainer.msRequestFullscreen();
                }
              } else {
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                  document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                  document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                  document.msExitFullscreen();
                }
              }
            });

            return container;
          }
        });

        new fullscreenControl().addTo(map);
        map._fullscreenControlAdded = true;
      }
    } catch (e) {
      console.warn("Fullscreen control error:", e);
    }

    return () => {
      map.off('zoomend', handleZoomEnd);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [map, onZoomChange]);

  // Fit bounds only once on initial load
  useEffect(() => {
    if (!map || initialBoundsFitRef.current) return;

    try {
      if (initialMarkers && Array.isArray(initialMarkers) && initialMarkers.length > 0) {
        const validMarkers = initialMarkers.filter(m =>
          m && typeof m.lat === 'number' && typeof m.lng === 'number'
        );

        if (validMarkers.length > 0) {
          const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));

          setTimeout(() => {
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 10,
              animate: false
            });
            initialBoundsFitRef.current = true;
          }, 200);
        }
      }
    } catch (e) {
      console.warn("Fit bounds error:", e);
    }
  }, [map, initialMarkers]);

  return null;
};

// Main Component
const LeafletMapView = ({
  aggsFields = ["unified_location_geo"],
  queryPayload = null,
  caseId = null,
  refreshKey = 0,
  chipsHeight,
}) => {
  const [markerData, setMarkerData] = useState([]);
  const [detailedMarkers, setDetailedMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMarkers, setLoadingMarkers] = useState(false);
  const [error, setError] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(2);

  const token = Cookies.get("accessToken");
  const lastFetchPayloadRef = useRef(null);
  const lastZoomFetchRef = useRef(null);

  // Create stable query string for comparison
  const queryString = useMemo(() => {
    if (!queryPayload) return null;

    const normalized = {
      case_id: queryPayload?.case_id,
      file_type: queryPayload?.file_type,
      keyword: queryPayload?.keyword,
      target: queryPayload?.target,
      targets: queryPayload?.targets,
      sentiments: queryPayload?.sentiments,
      sentiment: queryPayload?.sentiment,
      unified_type: queryPayload?.unified_type,
      eventtypestring: queryPayload?.eventtypestring,
      mobilenumber: queryPayload?.mobilenumber,
      socialmedia_hashtags: queryPayload?.socialmedia_hashtags,
      socialmedia_from_id: queryPayload?.socialmedia_from_id,
      socialmedia_from_screen_name: queryPayload?.socialmedia_from_screen_name,
      serverip: queryPayload?.serverip,
      start_time: queryPayload?.start_time,
      end_time: queryPayload?.end_time,
      latitude: queryPayload?.latitude ? String(queryPayload.latitude) : "",
      longitude: queryPayload?.longitude ? String(queryPayload.longitude) : "",
      loc: queryPayload?.loc,
      emails: queryPayload?.emails,
      event: queryPayload?.event,
      date: queryPayload?.date,
      person: queryPayload?.person,
      org: queryPayload?.org,
      language: queryPayload?.language,
    };

    return JSON.stringify(normalized);
  }, [queryPayload]);

  // Fetch initial heatmap data
  useEffect(() => {
    if (queryString === lastFetchPayloadRef.current) {
      console.log("LeafletMap: Skipping fetch - payload unchanged");
      return;
    }

    const fetchLocationData = async () => {
      try {
        setLoading(true);
        setError(null);

        const caseIdArray = Array.isArray(queryPayload?.case_id)
          ? queryPayload.case_id
          : queryPayload?.case_id
            ? [queryPayload.case_id]
            : caseId
              ? [caseId]
              : [];

        const case_id = caseIdArray.map(String);

        let flatQuery = {
          case_id,
          file_type: Array.isArray(queryPayload?.file_type) ? queryPayload.file_type : [],
          keyword: Array.isArray(queryPayload?.keyword) ? queryPayload.keyword : [],
          targets: Array.isArray(queryPayload?.target)
            ? queryPayload.target.map(t => String(t?.value ?? t))
            : Array.isArray(queryPayload?.targets)
              ? queryPayload.targets.map(t => String(t?.value ?? t))
              : [],
          sentiments: Array.isArray(queryPayload?.sentiments)
            ? queryPayload.sentiments
            : Array.isArray(queryPayload?.sentiment)
              ? queryPayload.sentiment
              : [],
          unified_type: Array.isArray(queryPayload?.unified_type) ? queryPayload.unified_type : [],
          eventtypestring: Array.isArray(queryPayload?.eventtypestring) ? queryPayload.eventtypestring : [],
          event: Array.isArray(queryPayload?.event) ? queryPayload.event : [],
          mobilenumber: Array.isArray(queryPayload?.mobilenumber) ? queryPayload.mobilenumber : [],
          socialmedia_hashtags: Array.isArray(queryPayload?.socialmedia_hashtags) ? queryPayload.socialmedia_hashtags : [],
          socialmedia_from_id: Array.isArray(queryPayload?.socialmedia_from_id) ? queryPayload.socialmedia_from_id : [],
          socialmedia_from_screenname: Array.isArray(queryPayload?.socialmedia_from_screenname) ? queryPayload.socialmedia_from_screenname : [],
          serverip: Array.isArray(queryPayload?.serverip) ? queryPayload.serverip : [],
          latitude: queryPayload?.latitude ? String(queryPayload.latitude) : "",
          longitude: queryPayload?.longitude ? String(queryPayload.longitude) : "",
          ...(queryPayload?.start_time && { start_time: queryPayload.start_time }),
          ...(queryPayload?.end_time && { end_time: queryPayload.end_time }),
          loc: Array.isArray(queryPayload?.loc) ? queryPayload.loc : [],
          emails: Array.isArray(queryPayload?.emails) ? queryPayload.emails : [],
          date: Array.isArray(queryPayload?.date) ? queryPayload.date : [],
          person: Array.isArray(queryPayload?.person) ? queryPayload.person : [],
          org: Array.isArray(queryPayload?.org) ? queryPayload.org : [],
          language: Array.isArray(queryPayload?.language) ? queryPayload.language : [],
        };

        flatQuery = Object.fromEntries(
          Object.entries(flatQuery).filter(
            ([, value]) =>
              Array.isArray(value)
                ? value.length > 0
                : value !== null && value !== undefined && value !== ""
          )
        );

        const payload = {
          ...flatQuery,
          start_time: flatQuery?.start_time || window.runtimeConfig.VITE_APP_DEFAULT_START_TIME,
          end_time: flatQuery?.end_time || window.runtimeConfig.VITE_APP_DEFAULT_END_TIME,
        };

        console.log('📤 Sending API request with payload:', payload);

        const response = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/geo-loc`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('📥 API Response:', response.data);

        const buckets = response?.data?.tiles?.buckets || [];
        console.log(`📊 Received ${buckets.length} location buckets`);

        const points = buckets
          .map(bucket => {
            const loc = bucket?.centroid?.location;
            if (!loc || loc.lat == null || loc.lon == null) {
              console.warn('⚠️ Invalid bucket:', bucket);
              return null;
            }

            // CRITICAL: Ensure correct lat/lng format
            const lat = parseFloat(loc.lat);
            const lng = parseFloat(loc.lon);

            // Validate coordinates
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
              console.warn(`⚠️ Invalid coordinates: lat=${lat}, lng=${lng}`);
              return null;
            }

            const point = {
              lat: lat,
              lng: lng,
              count: bucket.doc_count || 1,
            };

            console.log(`📍 Point: lat=${point.lat}, lng=${point.lng}, count=${point.count}`);
            return point;
          })
          .filter(Boolean);

        console.log(`✅ Processed ${points.length} valid points for heatmap`);
        setMarkerData(points);
        lastFetchPayloadRef.current = queryString;

      } catch (err) {
        console.error("❌ Error fetching location data:", err);
        setError("Failed to load location data");
        setMarkerData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [caseId, refreshKey, token, queryString]);

  // Handle zoom changes and fetch nearby locations
  const handleZoomChange = async (zoom, center) => {
    setCurrentZoom(zoom);

    console.log("🔍 Zoom level:", zoom);

    if (zoom >= STREET_ZOOM_LEVEL) {
      // Street level zoom - fetch nearby locations and show markers
      const fetchKey = `${center.lat.toFixed(4)},${center.lng.toFixed(4)}-${zoom}`;

      // Avoid duplicate fetches
      if (lastZoomFetchRef.current === fetchKey) {
        console.log("Skipping duplicate fetch for same location");
        return;
      }

      lastZoomFetchRef.current = fetchKey;
      setShowHeatmap(false);
      setLoadingMarkers(true);

      try {
        console.log("🔍 Fetching nearby locations for:", center.lat, center.lng);

        const response = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/loc/20km`,
          {
            latitude: center.lat.toString(),
            longitude: center.lng.toString()
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("📦 API Response:", response.data);
        let locations = response.data || [];
        console.log(`📊 Received ${locations.length} locations from API`);

        // Agar koi location nahi mila, to center location ko use karo
        if (locations.length === 0) {
          console.log("⚠️ No locations found in API response, using center location as fallback");
          locations = [{
            lat: center.lat,
            lng: center.lng
          }];
        }

        // Group by location and count duplicates
        console.log("📍 Received lat/lng from 20km API:", locations);
        const locationMap = {};
        locations.forEach(loc => {
          const key = `${loc.lat},${loc.lng}`;
          if (locationMap[key]) {
            locationMap[key].count++;
          } else {
            locationMap[key] = {
              lat: parseFloat(loc.lat),
              lng: parseFloat(loc.lng),
              count: 1
            };
          }
        });

        console.log("🗺️ Location Map:", locationMap);
        const uniqueLocations = Object.values(locationMap);
        console.log(`✅ Found ${uniqueLocations.length} unique locations with counts:`);
        uniqueLocations.forEach(loc => {
          console.log(`   📍 lat=${loc.lat.toFixed(5)}, lng=${loc.lng.toFixed(5)} → ${loc.count} record(s)`);
        });

        // Set markers immediately with "Locating..." placeholder
        setDetailedMarkers(uniqueLocations.map(loc => ({
          ...loc,
          name: "Locating...",
          loading: true
        })));

        setLoadingMarkers(false); // Stop loading indicator before geocoding

        // Geocode ALL locations in background
        console.log(`🚀 Initiating geocoding process...`);

        const startTime = Date.now();

        // Start geocoding but don't await it - let it run in background
        (async () => {
          try {
            const geocoded = await geocodeLocations(uniqueLocations);
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Geocoding complete in ${duration}s. Results:`, geocoded);

            setDetailedMarkers(geocoded.map(loc => ({
              ...loc,
              loading: false
            })));
          } catch (err) {
            console.error("❌ Geocoding batch error:", err);
            // Fallback to coordinates if geocoding fails
            setDetailedMarkers(uniqueLocations.map(loc => ({
              ...loc,
              name: `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`,
              loading: false
            })));
          }
        })();

      } catch (err) {
        console.error("❌ Error fetching nearby locations:", err);

        // Fallback: Show center location as marker if API fails
        console.log("⚠️ API failed, showing center location as fallback");
        setDetailedMarkers([{
          lat: center.lat,
          lng: center.lng,
          count: 1,
          name: "Current Location",
          loading: false
        }]);
        setLoadingMarkers(false);
      }
    } else {
      // Zoomed out - show heatmap again
      if (!showHeatmap) {
        console.log("Switching back to heatmap view");
        setShowHeatmap(true);
        setDetailedMarkers([]);
        lastZoomFetchRef.current = null;
      }
    }
  };

  if (loading && markerData.length === 0) {
    return <Loader />;
  }

  if (error) {
    return (
      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "red"
      }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!loading && markerData.length === 0) {
    return (
      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p>No location data found</p>
      </div>
    );
  }

  console.log("🗺️ Rendering map with chipsHeight:", chipsHeight);

  return (
    <div style={{ height: `calc(80vh - ${chipsHeight}px)`, width: "100%", position: "relative" }}>

      {/* Add CSS for better tile loading */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .leaflet-container {
            background: #ffffff !important;
          }
          
          .leaflet-tile-container {
            opacity: 1;
          }
          
          .leaflet-tile {
            filter: brightness(1);
            image-rendering: auto;
          }
          
          /* Ensure tiles load properly */
          .leaflet-tile-loaded {
            opacity: 1 !important;
          }
        `}
      </style>

      <MapContainer
        // center={[20, 0]} 
        zoom={1}
        style={{ height: '100%', width: "100%", borderRadius: '15px' }}
        zoomControl={false}
        attributionControl={false}
        minZoom={2}
        maxZoom={18}
      >
        <TileLayer
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // attribution=""
          url="https://mt1.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
          attribution="&copy; CARTO"
          maxZoom={19}
          minZoom={2}
          keepBuffer={4}
          updateWhenZooming={false}
          updateWhenIdle={true}
        // tileSize={600}

        />

        {/* Heatmap layer */}
        {markerData.length > 0 && (
          <HeatLayer points={markerData} visible={showHeatmap} />
        )}

        {/* Detailed markers on zoom */}
        {!showHeatmap && detailedMarkers.map((marker, idx) => (
          <Marker
            key={`${marker.lat}-${marker.lng}-${idx}`}
            position={[marker.lat, marker.lng]}
            icon={createCountIcon(marker.count)}
            eventHandlers={{
              add: (e) => {
                setTimeout(() => {
                  e.target.openPopup();
                }, 100);
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <div style={{
                  fontWeight: "bold",
                  marginBottom: "8px",
                  fontSize: "12px",
                  color: marker.loading ? "#999" : "#333"
                }}>
                  {marker.loading ? (
                    <span>
                      <span style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        border: "2px solid #3b82f6",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginRight: "6px"
                      }}></span>
                      {marker.name}
                    </span>
                  ) : marker.name}
                </div>
                <div style={{
                  color: "#666",
                  fontSize: "13px",
                  marginBottom: "4px",
                  padding: "4px 8px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "4px",
                  display: "inline-block"
                }}>
                  <strong>📊 Total Records:</strong> <span style={{
                    fontWeight: "bold",
                    color: marker.count > 10 ? "#dc2626" : marker.count > 5 ? "#f97316" : "#3b82f6",
                    fontSize: "15px"
                  }}>{marker.count}</span>
                </div>
                <div style={{ color: "#999", fontSize: "11px", marginTop: "6px" }}>
                  📍 {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <ZoomHandler onZoomChange={handleZoomChange} initialMarkers={markerData} />
      </MapContainer>

      {/* Status indicator */}
      <div style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "white",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        zIndex: 1000,
        fontSize: "14px"
      }}>
        <div style={{ fontWeight: "600", marginBottom: "4px" }}>
          {showHeatmap ? "🔥 Heatmap View" : "📍 Marker View"}
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          Zoom: {currentZoom} {currentZoom >= STREET_ZOOM_LEVEL ? "(Street Level)" : `(Zoom to ${STREET_ZOOM_LEVEL}+ for markers)`}
        </div>
        {!showHeatmap && detailedMarkers.length > 0 && (
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {detailedMarkers.length} location{detailedMarkers.length > 1 ? 's' : ''} | {detailedMarkers.reduce((sum, m) => sum + m.count, 0)} total records
          </div>
        )}
      </div>

      {loadingMarkers && (
        <div style={{
          position: "absolute",
          top: "100px",
          right: "20px",
          background: "white",
          padding: "10px 15px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <div style={{
            width: "16px",
            height: "16px",
            border: "2px solid #3b82f6",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <span style={{ fontSize: "14px" }}>Loading markers...</span>
        </div>
      )}
    </div>
  );
};

export default LeafletMapView;