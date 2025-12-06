import { useSelector } from 'react-redux';
import KeywordTagList from '../../../../../Common/Charts/KeywordCloud/keywordCloud';
import React from 'react';

const CriteriaKeywordChart = React.memo(({ onDataCheck }) => {
  const queryPayload = useSelector((state) => state.criteriaKeywords?.queryPayload);
  console.log("keyword",queryPayload)
  
  return (
   <KeywordTagList queryPayload={queryPayload}
    aggsFields={["socialmedia_hashtags"]}
     onDataCheck={onDataCheck}
   />

  );
});

CriteriaKeywordChart.displayName = 'CriteriaKeywordChart';


export default CriteriaKeywordChart;
