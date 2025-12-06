import { useSelector } from "react-redux";
import Tabuler from "../../../Common/Charts/Tabuler/tabuler"
import React from 'react';

const StaticalCaseSummary = React.memo(({ onDataCheck }) => {
     const caseID = useSelector((state) => state.caseData.caseData.id);
       const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
 const { agg_fields, ...filteredPayload } = caseFilter || {};
  return (
    <Tabuler
     caseId={caseID} 
  aggsFields={["IPDR"]}
  queryPayload={filteredPayload}
  onDataCheck={onDataCheck}
    />
  )
});

StaticalCaseSummary.displayName = 'StaticalCaseSummary';

export default StaticalCaseSummary