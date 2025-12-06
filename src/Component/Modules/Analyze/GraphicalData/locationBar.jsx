import { useSelector } from 'react-redux';
import ReusableBarChart from '../../../Common/Charts/BarChart/CommonBarChart';
import React from 'react';

const LocationBar = React.memo(({ onDataCheck }) => {

  const caseID = useSelector((state) => state.caseData.caseData.id);
  const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
  const { agg_fields, ...filteredPayload } = caseFilter || {};
  return (
    <ReusableBarChart
      caseId={caseID}
      aggsFields={["loc"]}
      query={{}}
      chartHeight={280}
      transformData={(rawData) =>
        rawData.map(item => ({
          name: item.key.split('-').slice(0, 3).join(''),
          value: item.doc_count
        }))
      }
      queryPayload={filteredPayload}
      onDataCheck={onDataCheck}
    />
  );
});

LocationBar.displayName = 'LocationBar';

export default LocationBar;