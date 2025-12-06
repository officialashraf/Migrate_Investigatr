import { useSelector } from 'react-redux';
import KeywordTagList from '../../../../../Common/Charts/KeywordCloud/keywordCloud';
import React from 'react';

const CriteriaEmailChart = React.memo(({ onDataCheck }) => {
  const queryPayload = useSelector((state) => state.criteriaKeywords?.queryPayload);
  console.log("keyword",queryPayload)
  return (
   <KeywordTagList queryPayload={queryPayload}
    aggsFields={["emails"]}
     onDataCheck={onDataCheck}
   />

  );
});

CriteriaEmailChart.displayName = 'CriteriaEmailChart';


export default CriteriaEmailChart;