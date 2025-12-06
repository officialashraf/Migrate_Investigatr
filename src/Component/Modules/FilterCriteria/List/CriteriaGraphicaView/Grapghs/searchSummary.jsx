import React, { useEffect, useMemo, useState } from 'react';
import ReusablePieChart from '../../../../../Common/Charts/PieChrat/pieChart';
import { useSelector } from 'react-redux';

const SearchSummary = React.memo(({ onDataCheck }) => {
  const queryPayload = useSelector((state) => state.criteriaKeywords?.queryPayload);
  console.log("queryUseSelector", queryPayload);
  
  const [shouldFetch, setShouldFetch] = useState(false);
  
  // Memoize the payload to prevent unnecessary re-renders
  const memoizedPayload = useMemo(() => queryPayload, [
    queryPayload?.case_id,
    queryPayload?.keyword,
    queryPayload?.file_type,
    queryPayload?.start_time,
    queryPayload?.end_time,
     queryPayload?.targets,
      queryPayload?.sentiments
  ]);
  
  useEffect(() => {
    if (memoizedPayload && Object.keys(memoizedPayload).length > 0) {
      setShouldFetch(true);
    } else {
      setShouldFetch(false);
    }
  }, [memoizedPayload]);
  
  const aggsFields = ['unified_record_type'];
  
  // Don't render if no payload
  if (!memoizedPayload) {
    return <div>No data available</div>;
  }
  
  return (
    <ReusablePieChart
      caseId={memoizedPayload?.case_id}
      aggsFields={aggsFields}
      shouldFetch={shouldFetch}
      queryPayload={memoizedPayload}
       onDataCheck={onDataCheck}
    />
  );
});

SearchSummary.displayName = 'SearchSummary';
export default SearchSummary;