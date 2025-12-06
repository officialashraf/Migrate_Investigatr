import { useSelector } from 'react-redux';
import KeywordTagList from '../../../../../Common/Charts/KeywordCloud/keywordCloud';
import React from 'react';

const MobileNumberGraph = React.memo(({ onDataCheck }) => {
     const queryPayload = useSelector((state) => state.criteriaKeywords?.queryPayload);

  return (
    <KeywordTagList 
    aggsFields={["mobilenumber"]}
    queryPayload={queryPayload}
    onDataCheck={onDataCheck}
    />
  )
});

MobileNumberGraph.displayName = 'MobileNumberGraph';
export default MobileNumberGraph