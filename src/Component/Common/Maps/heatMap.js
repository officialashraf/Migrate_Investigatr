import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

const HeatLayer = ({ points }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);
  const loadAttempted = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Safety checks
    if (!map || !points || !Array.isArray(points)) {
      return;
    }

    const initHeatmap = async () => {
      try {
        // Remove existing layer first
        if (heatLayerRef.current) {
          try {
            if (map.hasLayer(heatLayerRef.current)) {
              map.removeLayer(heatLayerRef.current);
            }
          } catch (e) {
            console.warn('Error removing old heat layer:', e);
          }
          heatLayerRef.current = null;
        }

        // Validate and filter points
        const validPoints = points
          .filter(p => {
            if (!p) return false;
            const lat = p?.lat ?? p?.[0];
            const lng = p?.lng ?? p?.[1];
            return (
              typeof lat === 'number' &&
              typeof lng === 'number' &&
              !isNaN(lat) &&
              !isNaN(lng) &&
              lat >= -90 &&
              lat <= 90 &&
              lng >= -180 &&
              lng <= 180
            );
          })
          .map(p => {
            const lat = p?.lat ?? p?.[0];
            const lng = p?.lng ?? p?.[1];
            const count = p?.count ?? p?.[2] ?? 1;
            return [parseFloat(lat), parseFloat(lng), Math.max(0.1, parseFloat(count) || 1)];
          });

        if (validPoints.length === 0) {
          console.warn('No valid points for heatmap');
          return;
        }

        // Check if component is still mounted
        if (!mounted.current) return;

        // Dynamically load leaflet.heat if not loaded
        if (!window.L || !window.L.heatLayer) {
          if (!loadAttempted.current) {
            loadAttempted.current = true;
            
            // Try to load via script
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
            script.async = true;
            
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });

            // Wait a bit for L.heatLayer to be available
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            // Already attempted load, wait for it
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        // Final check
        if (!mounted.current || !window.L || !window.L.heatLayer) {
          console.error('Leaflet.heat not available');
          return;
        }

        // Create heatmap
        heatLayerRef.current = window.L.heatLayer(validPoints, {
          radius: 35,
          blur: 25,
          maxZoom: 17,
          minOpacity: 0.5,
          max: 1.0,
          gradient: {
            0.2: '#ff0000',
            0.4: '#ff0000',
            0.6: '#ff0000',
            0.8: '#ff0000',
            1.0: '#ff0000'
          }
        });

        if (heatLayerRef.current && map && mounted.current) {
          heatLayerRef.current.addTo(map);
        }

      } catch (error) {
        console.error('HeatLayer initialization error:', error);
        // Silently fail - don't break UI
      }
    };

    // Add small delay to ensure map is ready
    const timeoutId = setTimeout(() => {
      initHeatmap();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (heatLayerRef.current) {
        try {
          if (map && map.hasLayer && map.hasLayer(heatLayerRef.current)) {
            map.removeLayer(heatLayerRef.current);
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        heatLayerRef.current = null;
      }
    };
  }, [points, map]);

  return null;
};

export default HeatLayer;

// import { useMap } from 'react-leaflet';
// import { useEffect } from 'react';
// import L from 'leaflet';
// import 'leaflet.heat';

// const HeatLayer = ({ points }) => {
//   const map = useMap();
//   console.log("points", points);

//   useEffect(() => {
//     if (!points || points.length === 0) return;

//     // Create heat layer
//     const heat = L.heatLayer(points, {
//       radius: 35,        // Bigger = smoother blobs
//       blur: 25,          // Smooth edges
//       maxZoom: 17,
//       minOpacity: 0.5,
//       max: 1.0,          // Max intensity
//       gradient: {
//         0.2: 'red',
//         0.4: 'red',
//         0.6: 'red',
//         0.8: 'red',
//         1.0: 'red'       // Full intensity → red hotspot
//       }
//     }).addTo(map);

//     return () => {
//       map.removeLayer(heat);
//     };
//   }, [points, map]);

//   return null;
// };

// export default HeatLayer;
