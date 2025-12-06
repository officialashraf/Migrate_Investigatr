import ReusablePieChart from '../../../Common/Charts/PieChrat/pieChart';
import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';

const  CaseSummary = React.memo(({ onDataCheck }) => {

    const caseID = useSelector((state) => state.caseData.caseData.id);
    const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
 const { agg_fields, ...filteredPayload } = caseFilter || {};
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    if (caseID) {
      setShouldFetch(true); 
    }
  }, [caseID]);

  const aggsFields = ['unified_record_type'];
  return (
    <ReusablePieChart
      caseId={caseID}
      aggsFields={aggsFields}
      shouldFetch={shouldFetch}
      queryPayload={filteredPayload}
      onDataCheck={onDataCheck}

    />
  )
});
CaseSummary.displayName = 'CaseSummary';
export default  CaseSummary;


 