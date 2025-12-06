import { useSelector } from 'react-redux';
import KeywordTagList from '../../../../../Common/Charts/KeywordCloud/keywordCloud';
import React from 'react';

const ServerIPChart = React.memo(({ onDataCheck }) => {
   const queryPayload = useSelector((state) => state.criteriaKeywords?.queryPayload);
  return (
    <KeywordTagList 
    aggsFields={["serverip"]}
    queryPayload={queryPayload}
    onDataCheck={onDataCheck}
    />
  )
});

ServerIPChart.displayName = 'ServerIPChart';
export default ServerIPChart