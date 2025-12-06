import { useSelector } from 'react-redux';
import ReusableBarChart from '../../../../../Common/Charts/BarChart/CommonBarChart';
import React from 'react';

const LanguageGraph = React.memo(({ onDataCheck }) => {
    const queryPayload = useSelector((state) => state.criteriaKeywords.queryPayload);
    return (
            <ReusableBarChart
                caseId={queryPayload?.case_id || []}
                aggsFields={["language"]}
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

LanguageGraph.displayName = 'LanguageGraph';

export default LanguageGraph;