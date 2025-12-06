import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Summary from './summary.jsx';
import axios from 'axios';
import Cookies from 'js-cookie';
import './mainContainer.module.css';
import AddFilter2 from '../Filters/addFilter.jsx';
import Loader from '../Layout/loader.jsx';
import { toast } from 'react-toastify';
import Ipdr from '../ResourceHandler/addResource.jsx';
import FileUpload from '../ResourceHandler/FileUpload.jsx';
import FtpPopup from '../ResourceHandler/FtpPopup.jsx';
import AppButton from '../../Common/Buttton/button.jsx';
import PropTypes from 'prop-types';

const MainContainer = ({ refreshKey }) => {
  const token = Cookies.get('accessToken');
  const [filterdata, setfilterdata] = useState([]);
  const caseData = useSelector((state) => state.caseData.caseData);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [showCdr, setShowCdr] = useState(false);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showFtpPopup, setShowFtpPopup] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState("IPDR");

  const togglePopup = () => {
    setShowCdr(true);
  };

  const handleProceed = (selectedOption,selectDataType) => {
    console.log("mainContainer", selectedOption,selectDataType);
    setShowCdr(false);
    if (selectedOption === 'osintData') {
      setShowAddFilter(true);
    } else if (selectedOption === 'ftpServer') {
         setSelectedDataType(selectDataType);
      setShowFtpPopup(true);
    } else if (selectedOption === 'localStorage') {
         setSelectedDataType(selectDataType);
      setShowFileUpload(true);
    }
  };
  const filterData = useCallback(async () => {
    setIsLoading(true); // Start loading
    try {
      const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/filters`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      setfilterdata(response.data.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail)
        console.error("Backend error:", error.response.data.detail);
      } else {
        console.error("An error occurred:", error.message);
      }
    } finally {
      setIsLoading(false); // End loading regardless of success/error
    }
  }, [token]);

  useEffect(() => {
    filterData();
    const handleDatabaseUpdate = () => filterData();
    window.addEventListener("databaseUpdated", handleDatabaseUpdate);
    return () => window.removeEventListener("databaseUpdated", handleDatabaseUpdate);
  }, [filterData]);

  // Check if filters exist for the current case
  const hasFilters = filterdata.some(
    (filter) => filter["case id"]?.includes(String(caseData?.id))
  );

  const isCaseInProgress = caseData?.status !== 'New';

  const isFilterZero = filterdata.length > 0;

  const shouldProceed = hasFilters || (isCaseInProgress && isFilterZero);

  const matchingFilters = filterdata.filter(
    (filter) => filter["case id"]?.includes(String(caseData?.id))
  );
  const numberOfMatchingFilters = matchingFilters.length;

  const renderContent = () => {
    if (isLoading) {

      return <>
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh', width: '100%' }}> <Loader /> </div> </>// Show loading state
    }

    if (shouldProceed) {
      return <Summary filters={numberOfMatchingFilters} refreshKey={refreshKey} />
    }

    return (
      <div className="resourcesContainer">
        <h3 className="title">Let's Get Started!</h3>
        <p className="content">Add resources to get started</p>
        <AppButton onClick={togglePopup}> + Add Resources</AppButton>
      </div>
    );
  };

  return (
    <>
      <div className="containerM" >
        {renderContent()}
      </div>
      {showCdr && (
        <Ipdr
          togglePopup={() => setShowCdr(false)}
          handleProceed={handleProceed}
        />
      )}
      {showAddFilter && <AddFilter2 togglePopup={() => setShowAddFilter(false)} />}
      {showFileUpload && <FileUpload togglePopup={() => setShowFileUpload(false)} selectDataType={selectedDataType}/>}
      {showFtpPopup && <FtpPopup togglePopup={() => setShowFtpPopup(false)} />}
    </>
  );
};

MainContainer.propTypes = {
  refreshKey: PropTypes.number.isRequired,
};

export default MainContainer;
