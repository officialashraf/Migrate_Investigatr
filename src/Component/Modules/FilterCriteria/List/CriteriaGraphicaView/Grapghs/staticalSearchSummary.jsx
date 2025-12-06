import { useSelector } from "react-redux";
import Tabuler from "../../../../../Common/Charts/Tabuler/tabuler"
import React from 'react';

const StaticalSearchSummary = React.memo(({onDataCheck}) => {
   const queryPayload = useSelector((state) => state.criteriaKeywords?.queryPayload);
  return (
    <Tabuler
    queryPayload={queryPayload}
    aggsFields={["IPDR"]}
     onDataCheck={onDataCheck}
    />
  )
});

StaticalSearchSummary.displayName = 'StaticalSearchSummary';


export default StaticalSearchSummary