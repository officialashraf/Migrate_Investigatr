import { useState, useEffect } from 'react'
import ExistingFilters from "./existingFilter";
import axios from 'axios';
import AddNewFilter from './addNewFilter';
import "./mainGlobal.css"
import { useSelector, useDispatch } from 'react-redux';
import { setCaseData } from '../../../Redux/Action/caseAction';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import AppButton from '../../Common/Buttton/button';
import PropTypes from 'prop-types';

const AddFilter2 = ({ togglePopup }) => {
  const dispatch = useDispatch();
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [initialSelectedFilters, setInitialSelectedFilters] = useState([]);
  const caseData1 = useSelector((state) => state.caseData.caseData);
  const token = Cookies.get('accessToken');
  const [filterIdedit, setFilterIdedit] = useState(null)
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAddFilter = () => {
    setFilterIdedit(null);
    setShowAddFilter(true);
  };

  useEffect(() => {
    const fetchInitialFilters = async () => {
      try {
        const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/filters`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const filters = response.data.data.filter(filter =>
          Array.isArray(filter["case id"]) &&
          filter["case id"].includes(String(caseData1.id))
        );
        const initialIds = filters.map(f => f.id);
        setInitialSelectedFilters(initialIds);
        setSelectedFilters(initialIds);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    fetchInitialFilters();
  }, [caseData1.id, token]);

  const handleFilterToggle = (filterId, isChecked) => {
    setSelectedFilters(prev =>
      isChecked ? [...prev, filterId] : prev.filter(id => id !== filterId)
    );
  };

  const handleNewFilterCreated = (newFilterId, shouldAutoSelect = false) => {
    console.log(`New filter created with ID: ${newFilterId}`);
  };

  const handleFilterid = (id) => {
    setFilterIdedit(id);
  };

  // Handle closing the AddNewFilter component
  const handleCloseAddFilter = () => {
    setShowAddFilter(false);
    setFilterIdedit(null);
  };

  const [filtersToStart, setFiltersToStart] = useState([]);
  const [filtersToStop, setFiltersToStop] = useState([]);

  useEffect(() => {
    setFiltersToStart(selectedFilters.filter(id => !initialSelectedFilters.includes(id)));
    setFiltersToStop(initialSelectedFilters.filter(id => !selectedFilters.includes(id)));
  }, [selectedFilters, initialSelectedFilters]);

  // Proceed handler
  const handleProceed = async () => {
    setIsSubmitting(true);
    try {
      // Start new filters
      if (filtersToStart.length > 0) {
        const payload = {
          filter_id: filtersToStart,
          case_id: String(caseData1.id)
        };
        console.log('Payload being sent start:', payload);
        await axios.post(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/start`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        window.dispatchEvent(new Event('databaseUpdated'));
      }

      // Stop deselected filters
      if (filtersToStop.length > 0) {
        const payload = {
          filter_id_list: filtersToStop,
          case_id: String(caseData1.id)
        };
        console.log('Payload being sent stop:', payload);
        await axios.post(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/stop/batch`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        window.dispatchEvent(new Event('databaseUpdated'));
      }

      const reponsecase = await axios.put(`${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case/${caseData1.id}`,
        { status: "in progress" },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      dispatch(setCaseData(reponsecase.data.data))

      togglePopup();
    } catch (error) {
      if (error.response) {
        console.error("Error Status:", error.response.status);
        console.error("Error Data:", error.response.data);
        toast.error(`Error: ${error.response.data.detail || error.message}`);
      } else if (error.request) {
        console.error("No Response:", error.request);
      } else {
        console.error("Request Error:", error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container" style={{ width: "75%" }}>
        <button className="close-icon" onClick={togglePopup}>&times;</button>
        <div className="popup-content">
          <div className="container-fluid p-4 main-body-div">
            <div className="row main-body-div-1st-row">
              <div className="col-md-4">
                <AppButton onClick={toggleAddFilter}> + Add New Filter </AppButton>
                <ExistingFilters
                  setShowAddFilter={setShowAddFilter}
                  selectedFilters={selectedFilters}
                  onFilterToggle={handleFilterToggle}
                  onFilterSelect={handleFilterid}
                />
              </div>
              {showAddFilter && (
                <div className="col-md-8">
                  <AddNewFilter
                    filterIde={filterIdedit}
                    onNewFilterCreated={handleNewFilterCreated}
                    key={filterIdedit}
                    onClose={handleCloseAddFilter}
                  />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }} >
              {(filtersToStart.length > 0 || filtersToStop.length > 0) && (
                <AppButton
                  onClick={handleProceed}
                  disabled={isSubmitting} >
                  {isSubmitting ? 'Processing...' : '✔ Proceed'}
                </AppButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
AddFilter2.propTypes = {
  togglePopup: PropTypes.func,
};
export default AddFilter2;