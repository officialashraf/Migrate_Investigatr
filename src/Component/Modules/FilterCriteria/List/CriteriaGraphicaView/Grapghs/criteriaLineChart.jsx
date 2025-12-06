import { useSelector } from 'react-redux';
import ReusableLineGraph from '../../../../../Common/Charts/LineGraph/lineGraph';
import React from 'react';

const CriteriaLineChart = React.memo(({ onDataCheck }) => {
 const queryPayload = useSelector((state) => state.criteriaKeywords.queryPayload);

  return (
 <ReusableLineGraph 
  queryPayload={queryPayload}
  aggsFields={["unified_date_only", "unified_type"]}
  recordLineField="unified_type"
   onDataCheck={onDataCheck}
/>

  );
});

CriteriaLineChart.displayName = 'CriteriaLineChart';

export default CriteriaLineChart;