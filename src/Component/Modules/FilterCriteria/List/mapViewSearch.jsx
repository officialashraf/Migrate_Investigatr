import React from 'react';
import LeafletMapView from '../../../Common/Maps/leafletMaps';
import { useSelector } from 'react-redux';

const MapViewSearch = ({chipsHeight}) => {
  const queryPayload = useSelector((state) => state.criteriaKeywords.queryPayload);

  const isQueryEmpty = (payload) => {
    if (!payload || typeof payload !== 'object') return true;

    const ignoredKeys = ['page', 'size'];

    return Object.entries(payload)
      .filter(([key]) => !ignoredKeys.includes(key))
      .every(([, value]) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0));
  };

  if (isQueryEmpty(queryPayload))
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8',
        fontSize: '12px',
        textAlign: 'center',
        padding: '20px'
      }}>
      </div>
    )// 🔒 Don't mount map until real query exists

  return (
    <LeafletMapView
      queryPayload={queryPayload}
      aggsFields={["unified_location_geo"]}
      chipsHeight={chipsHeight}
    />
  );
};

export default MapViewSearch;




// import React from 'react'
// import LeafletMapView from '../../../Common/Maps/leafletMaps'
// import { useSelector } from 'react-redux';

// const MapViewSearch = () => {
//     const queryPayload = useSelector((state) => state.criteriaKeywords.queryPayload);
//   return (
//   <LeafletMapView
//   queryPayload={queryPayload}
//   aggsFields={["unified_location_geo"]}
// />
//   )
// }

// export default MapViewSearch