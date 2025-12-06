import { useSelector } from 'react-redux';
import CircleBarChart from "../../../Common/Charts/BarChart/circlebar";
import React from 'react';

const SubscribeCaseSummary = React.memo(({ onDataCheck }) => {
    const caseID = useSelector((state) => state.caseData.caseData.id);
  const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
  const { agg_fields, ...filteredPayload } = caseFilter || {};

    return (        
            <CircleBarChart
                 aggsFields={["IPDR"]}
                 queryPayload={filteredPayload}
               caseId={caseID}
                 onDataCheck={onDataCheck}
            />
    );
});

SubscribeCaseSummary.displayName = 'SubscribeCaseSummary';

export default SubscribeCaseSummary;