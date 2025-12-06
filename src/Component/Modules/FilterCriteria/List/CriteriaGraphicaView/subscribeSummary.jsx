import { useSelector } from "react-redux";
import CircleBarChart from "../../../../Common/Charts/BarChart/circlebar";
import React from 'react';

const SubscribeSummary = React.memo(({onDataCheck}) => {
    const queryPayload = useSelector((state) => state.criteriaKeywords?.queryPayload);
    
    return (

        <CircleBarChart
            queryPayload={queryPayload}
            aggsFields={["IPDR"]}
            onDataCheck={onDataCheck}
        />



    );
});

SubscribeSummary.displayName = 'SubscribeSummary';

export default SubscribeSummary;