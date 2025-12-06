import { useSelector } from 'react-redux';
import KeywordTagList from '../../../Common/Charts/KeywordCloud/keywordCloud';
import React from 'react';

const EmailChart = React.memo(({ onDataCheck }) => {
    const caseID = useSelector((state) => state.caseData.caseData.id);
    const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
    const { agg_fields, ...filteredPayload } = caseFilter || {};

  return (
    <KeywordTagList 
    caseId={caseID} 
    aggsFields={["emails"]}
    queryPayload={filteredPayload}
    onDataCheck={onDataCheck}
    />
  )
});

EmailChart.displayName = 'EmailChart';
export default EmailChart