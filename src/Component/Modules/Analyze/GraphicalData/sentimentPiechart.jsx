import ReusablePieChart from '../../../Common/Charts/PieChrat/pieChart';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import React from 'react';

const SentimentPieChart = React.memo(({ onDataCheck }) => {

  const caseID = useSelector((state) => state.caseData.caseData.id);
  const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
  const { agg_fields, ...filteredPayload } = caseFilter || {};
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    if (caseID) {
      setShouldFetch(true);
    }
  }, [caseID]);

  const aggsFields = ['sentiment'];
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
SentimentPieChart.displayName = 'SentimentPieChart';
export default SentimentPieChart;

