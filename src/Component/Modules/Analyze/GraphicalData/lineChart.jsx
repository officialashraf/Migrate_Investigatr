import { useSelector } from 'react-redux';
import ReusableLineGraph from '../../../Common/Charts/LineGraph/lineGraph';
import React from 'react';

const LineGraph = React.memo(({ onDataCheck }) => {
  const caseID = useSelector((state) => state.caseData.caseData.id);
  const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
  const { agg_fields, ...filteredPayload } = caseFilter || {};
  return (
    <ReusableLineGraph
      caseId={caseID}
      aggsFields={["unified_date_only", "unified_type"]}
      recordLineField="unified_type"
      queryPayload={filteredPayload}
      onDataCheck={onDataCheck}
    />

  );
});
LineGraph.displayName = 'LineGraph';

export default LineGraph;
