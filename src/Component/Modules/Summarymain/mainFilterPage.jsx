import { useState, useEffect } from 'react';
import Header from './headerFilter';
import MainContainer from './mainContainer';

const MainFilter = () => {
  const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
    localStorage.removeItem('graphicalDataScrollPos');
  }, []); 
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{ height: "100%", flexDirection: "column", overflow: "hidden" }}>
      <Header handleRefresh={handleRefresh} />
      <MainContainer refreshKey={refreshKey} />
    </div>
  );
};

export default MainFilter;
