import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPage, setSearchResults, setSelectedCriteriaResource } from '../../../../Redux/Action/criteriaAction';
import axios from 'axios';
import Cookies from 'js-cookie';
import Loader from '../../Layout/loader';
import CommonTableComponent from '../../../Common/Table/CommonTableComponent';

const CriteriaCaseTable = ({ chipsHeight, setActiveView }) => {
  const token = Cookies.get("accessToken");
  const dispatch = useDispatch();
  const { totalPages, totalResults, searchResults, currentPage } = useSelector(state => state?.search || '');
  const payload = useSelector((state) => state.criteriaKeywords?.queryPayload || '');
  const keywords = useSelector((state) => state.criteriaKeywords?.keywords || '');
  const [loading, setLoading] = useState(false);
  const [columnMapping, setColumnMapping] = useState([]); // Add columnMapping state

  const headers = searchResults.length > 0
    ? [...new Set(searchResults.flatMap(item => Object.keys(item)))]
    : [];

  const handleRowClick = (itemData) => {
    dispatch(setSelectedCriteriaResource(itemData));
    if (setActiveView) {
      setActiveView();
    }
  };
  // Add useEffect for fetching column mapping
  useEffect(() => {
    const fetchMapping = async () => {
      try {
        const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/mappings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        setColumnMapping(response.data);
      } catch (error) {
        console.error("Mapping fetch failed", error);
      }
    };

    fetchMapping();
  }, []); // Run once on component mount

  useEffect(() => {
        if (!payload || Object.keys(payload).length === 0) return;

  // If Redux already has results, skip refetch
  // if (searchResults?.length > 0 && currentPage === 1) {
  //   console.log("✅ Skipping fetch — data already exists in Redux");
  //   return;
  // }
    const fetchPageData = async () => {
      setLoading(true);

      try {
        const isValid = (v) =>
          Array.isArray(v) ? v.length > 0 :
            typeof v === 'string' ? v.trim() !== '' :
              v !== null && v !== undefined;

        const filteredPayload = {};
        Object.entries(payload).forEach(([key, value]) => {
          if (isValid(value)) {
            if (key === "targets" && Array.isArray(value)) {
              filteredPayload[key] = value.map(v =>
                typeof v === "object" && v !== null ? String(v.value) : v
              );
            } else {
              filteredPayload[key] = value;
            }
          }
        });
        const rangeDays = Number(window.runtimeConfig.VITE_APP_DEFAULT_RANGE_DAYS) || 180;
        const DEFAULT_END = new Date().toISOString();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - rangeDays);
        const DEFAULT_START = startDate.toISOString();

        const paginatedQuery = {
          ...filteredPayload,
          start_time: filteredPayload?.start_time || DEFAULT_START,
          end_time: filteredPayload?.end_time || DEFAULT_END,
          page: currentPage,
          size:50
        };
        console.log("Sending queryQWQ:", paginatedQuery);

        const response = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
          paginatedQuery,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Search response:", response.data);

        dispatch(
          setSearchResults({
            results: response.data.results || [],
            total_pages: response.data.total_pages || 1,
            total_results: response.data.total_results || 0,
          })
        );
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage && pageNumber >= 1 && pageNumber <= totalPages) {
      dispatch(setSelectedCriteriaResource(null));
      dispatch(setPage(pageNumber));
    }
  };

const isQueryEmpty = (payload) => {
    if (!payload || typeof payload !== 'object') return true;

    const ignoredKeys = ['page', 'size'];

    return Object.entries(payload)
      .filter(([key]) => !ignoredKeys.includes(key))
      .every(([, value]) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0));
  };

  // 🔒 Don't render component until real query exists
  if (isQueryEmpty(payload)) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8',
        fontSize: '12px',
        textAlign: 'center',
        padding: '20px'
      }}>
        {/* Please enter a search criteria to view table results */}
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <CommonTableComponent
      onDoubleClick={handleRowClick}
      data={searchResults}
      chipsHeight={chipsHeight }
      tabulerDynamic
      headers={headers}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalResults={totalResults}
      handlePageChange={handlePageChange}
      columnMapping={columnMapping} // Pass columnMapping
      useColumnMapping={true} // Enable column mapping
      specialColumns={["socialmedia_hashtags", "targets", "person", "gpe", "unified_case_id", "org", "loc", "event", "time", "date", "money", "sentiment", "product", "quantity", "law", "language", "phone_numbers", "emails", "socialmedia_usermentions"]}
      containerStyle={{ backgroundColor: "transparent" }}
      tableWrapperStyle={{ backgroundColor: "transparent" }}
    />
  );
};

export default CriteriaCaseTable;