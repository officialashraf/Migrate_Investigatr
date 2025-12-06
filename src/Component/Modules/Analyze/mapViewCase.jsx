import React from 'react'
import LeafletMapView from '../../Common/Maps/leafletMaps'
import { useSelector } from 'react-redux';

const MapViewCase = ({chipsHeight}) => {

      const caseID = useSelector((state) => state.caseData.caseData.id);
    const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
 const { agg_fields, ...filteredPayload } = caseFilter || {};
 const aggsFields = ['unified_location_geo'];
  return (
   <LeafletMapView 
  chipsHeight={chipsHeight}
  caseId={caseID}
  queryPayload={filteredPayload}
  aggsFields={aggsFields}
/>
  )
}

export default MapViewCase