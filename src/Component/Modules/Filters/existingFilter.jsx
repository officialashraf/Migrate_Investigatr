import axios from 'axios';
import { useState, useEffect } from 'react';
import { SortDown, SortUp, Search } from 'react-bootstrap-icons';
import { useDispatch } from 'react-redux';
import { logFilterCount } from '../../../Redux/Action/filterAction.js';
import Cookies from 'js-cookie';
import Loader from '../Layout/loader.jsx';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const ExistingFilter = ({ selectedFilters, onFilterToggle, onFilterSelect, setShowAddFilter }) => {
  const token = Cookies.get('accessToken');
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [filterdata, setfilterdata] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBarVisibility, setSearchBarVisibility] = useState(false);
  const [sortDirection, setSortDirection] = useState('desc'); // desc = latest first

  const toggleSearchBar = () => {
    setSearchBarVisibility(!searchBarVisibility);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Function to parse DD-MM-YYYY format to proper Date
  const parseDate = (dateString) => {
    if (!dateString) return new Date(0); // fallback for invalid dates

    // Handle DD-MM-YYYY format
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }

    // Fallback to default Date parsing
    return new Date(dateString);
  };

  // Single sorting function - used everywhere
  const applySorting = (filters, direction = sortDirection) => {
    return [...filters].sort((a, b) => {
      // First priority: checked/selected filters at top
      const aChecked = selectedFilters.includes(a.id);
      const bChecked = selectedFilters.includes(b.id);

      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;

      // Second priority: sort by created_on date
      const dateA = parseDate(a.created_on);
      const dateB = parseDate(b.created_on);

      if (direction === 'desc') {
        return dateB - dateA; // Latest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  };

  // Sort button click handler - only sorts existing data
  const sortFilters = () => {
    if (filterdata.data) {
      const newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
      const sortedFilters = applySorting(filterdata.data, newDirection);

      setfilterdata({ ...filterdata, data: sortedFilters });
      setSortDirection(newDirection);
    }
  };

  // API call function
  useEffect(() => {
    const filterData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/filters`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const user = response.data;

        dispatch(logFilterCount(user));

        setfilterdata(user); // Set original data as-is from API

      } catch (error) {
        toast.error(error.message);
        console.error('There was an error fetching the data!', error);
      } finally {
        setLoading(false);
      }
    };

    filterData();

    const handleDatabaseUpdate = () => {
      filterData();
    };

    window.addEventListener("databaseUpdated", handleDatabaseUpdate);

    return () => {
      window.removeEventListener("databaseUpdated", handleDatabaseUpdate);
    };
  }, [dispatch, token]); // Removed selectedFilters to prevent refetch on selection change



  return (
    <div className="filters-wrapper" style={{ margin: '1px' }}>
      <div className='existingFil'>
        <p className='existing-title' style={{ margin: '0' }}>Existing Filters</p>
        {searchBarVisibility && (
          <input
            className="search_input"
            placeholder="Search..."
            onChange={handleSearch}
            style={{ marginLeft: '2px' }}
          />
        )}
        {!searchBarVisibility && (
          <span style={{ marginLeft: '0px', marginRight: '0' }}>
            <Search onClick={toggleSearchBar} style={{ width: '10px', marginLeft: '80px' }} />
          </span>
        )}
        <button
          className="btn btn-sm me-2 sort-filters"
          onClick={sortFilters}
          style={{ marginLeft: '0px', marginRight: '0px', width: '8px' }}
        >
          {sortDirection === 'desc' ? <SortDown /> : <SortUp />}
        </button>
      </div>
      <div className='exist-filter'>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: '8rem' }}>
            <Loader />
          </div>
        ) : (
          <ul className="list-group existing-filters-ul">
            {(() => {
              const sortedData = filterdata.data ? [...filterdata.data].sort((a, b) => {
                const aChecked = selectedFilters.includes(a.id);
                const bChecked = selectedFilters.includes(b.id);
                if (aChecked && !bChecked) return -1;
                if (!aChecked && bChecked) return 1;
                return 0;
              }) : [];
              return sortedData.length > 0 ? (
                sortedData
                  .filter(filter => filter.name.toLowerCase().includes(searchQuery))
                  .map((filter) => (
                    <li key={filter.id} className="list-group-item existing-filters-li">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedFilters.includes(filter.id)}
                        onChange={(e) => onFilterToggle(filter.id, e.target.checked)}
                        onClick={() => {
                          onFilterSelect(filter.id);
                          setShowAddFilter(true);
                        }}
                      />

                      <button
                        type="button"
                        className="filter-content"
                        onClick={() => {
                          onFilterSelect(filter.id);
                          setShowAddFilter(true);
                        }}
                      >
                        <div className="filter-row">
                          <div className="filter-text">
                            <span className="filter-name">{filter.id}{` - ${filter.name}`}</span>
                            <p className="filter-meta">Created by: {filter.created_by}</p>
                          </div>
                          <div className="filter-date">
                            {filter.created_on.slice(0, 10)}
                          </div>
                        </div>

                      </button>

                    </li>

                  ))
              ) : (
                <li className="list-group-item existing-filters-li" style={{ display: "flex", height: "400px", justifyContent: "center", alignItems: "center", border: "none" }}>
                  <p>No filters created yet</p>
                </li>
              );
            })()}
          </ul>
        )}
      </div>

    </div>
  );
};

ExistingFilter.propTypes = {
  selectedFilters: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFilterToggle: PropTypes.func.isRequired,
  onFilterSelect: PropTypes.func.isRequired,
  setShowAddFilter: PropTypes.func.isRequired,
};

export default ExistingFilter;