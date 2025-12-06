import { useSelector } from 'react-redux';
import KeywordTagList from '../../../../../Common/Charts/KeywordCloud/keywordCloud';
import React from 'react';

const CriteriaPhoneNumberChart = React.memo(({ onDataCheck }) => {
  const queryPayload = useSelector((state) => state.criteriaKeywords?.queryPayload);
  console.log("keyword",queryPayload)
  return (
   <KeywordTagList queryPayload={queryPayload}
    aggsFields={["phone_numbers"]}
     onDataCheck={onDataCheck}
   />

  );
});

CriteriaPhoneNumberChart.displayName = 'CriteriaPhoneNumberChart';

export default CriteriaPhoneNumberChart;