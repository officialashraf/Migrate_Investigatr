import ReusableBarChart from '../../../../../Common/Charts/BarChart/CommonBarChart';
import { useSelector } from 'react-redux';
import React from 'react';

const DateGraph = React.memo(({ onDataCheck }) => {
    const queryPayload = useSelector((state) => state.criteriaKeywords.queryPayload);

    
    return (
            <ReusableBarChart
                caseId={queryPayload?.case_id || []}
                aggsFields={["date"]}
                queryPayload={queryPayload}
                transformData={(rawData) =>
                    rawData.map(item => ({
                        name: item.key,
                        value: item.doc_count
                    }))
                }
                 onDataCheck={onDataCheck}
            />
    );
});

DateGraph.displayName = 'DateGraph';

export default DateGraph;