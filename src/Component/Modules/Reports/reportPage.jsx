
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import Cookies from 'js-cookie';
// import { setPage } from '../../../Redux/Action/criteriaAction';
// import { saveReportilterPayload, setReportResults,clearReportilterPayload, clearReportResults } from '../../../Redux/Action/reportAction';
// import GridView from './gridView';
// import SearchUIContainer from "../../Common/SearchBarCriteria/SearchUIContainer";
// import AddFilter from './reportFilter'; // You'll need to create this component
// import { toast } from 'react-toastify';
// import axios from 'axios';

// const ReportPage = ({chipsHeight}) => {
//   const Token = Cookies.get('accessToken');
//   const dispatch = useDispatch();
//   const reportFilter = useSelector((state) => state.reportFilter?.reportFilters);

//   const { file_type, keyword, start_time, end_time, target, sentiment,case_id } = reportFilter || {}

//   const [inputValue, setInputValue] = useState("");
  
//   // Local state for managing chips before sending
//   const [localKeywordChips, setLocalKeywordChips] = useState([]);
//   const [localFileTypeChips, setLocalFileTypeChips] = useState([]);
//   const [localStartTime, setLocalStartTime] = useState(null);
//   const [localEndTime, setLocalEndTime] = useState(null);
//   const [localTargets, setlocalTargets] = useState([]);
//   const [localSentiments, setLocalSentiments] = useState([]);
//   const [localCaseIds, setLocalCaseIds] = useState([]);
//   const [localUnifiedTypes, setLocalUnifiedTypes] = useState([]);
//   const [localEventTypeStrings, setLocalEventTypeStrings] = useState([]);
//   const [localMobileNumbers, setLocalMobileNumbers] = useState([]);
//   const [localSocialMediaHashtags, setLocalSocialMediaHashtags] = useState([]);
//   const [localSocialMediaFromIds, setLocalSocialMediaFromIds] = useState([]);
//   const [localSocialMediaFromScreenNames, setLocalSocialMediaFromScreenNames] = useState([]);
//   const [localServerIps, setLocalServerIps] = useState([]);
//   const [isPopupVisible, setIsPopupVisible] = useState(false);
 
//   useEffect(() => {
//     const savePayload = {
//       file_type: [],
//       keyword: [],
//       start_time: null,
//       end_time: null,
//       target: [],
//       sentiment: [],
//       unified_type: [],
//       eventtypestring: [],
//       mobilenumber: [],
//       socialmedia_hashtags: [],
//       socialmedia_from_id: [],
//       socialmedia_from_screenname: [],
//       serverip: [],
//       case_id: []
//     };
//     dispatch(saveReportilterPayload(savePayload));
//   }, []);

 
 
//   useEffect(() => {
//     return () => {
//       resetSearch();
//     };
//   }, []);

//   // Sync local state with Redux state
//   useEffect(() => {
//     setLocalKeywordChips(Array.isArray(keyword) ? [...keyword] : []);
//      setLocalCaseIds(Array.isArray(case_id) ? [...case_id] : []);
//     setLocalFileTypeChips(Array.isArray(file_type) ? [...file_type] : []);
//     setlocalTargets(
//       Array.isArray(target) && target.length > 0
//         ? target.map(t => ({ id: t.id, name: t.name, value: t.value ?? t.id }))
//         : []
//     );
//     setLocalSentiments(Array.isArray(sentiment) ? [...sentiment] : []);
//     setLocalUnifiedTypes(Array.isArray(reportFilter.unified_type) ? [...reportFilter.unified_type] : []);
//     setLocalEventTypeStrings(Array.isArray(reportFilter.eventtypestring) ? [...reportFilter.eventtypestring] : []);
//     setLocalMobileNumbers(Array.isArray(reportFilter.mobilenumber) ? [...reportFilter.mobilenumber] : []);
//     setLocalSocialMediaHashtags(Array.isArray(reportFilter.socialmedia_hashtags) ? [...reportFilter.socialmedia_hashtags] : []);
//     setLocalSocialMediaFromIds(Array.isArray(reportFilter.socialmedia_from_id) ? [...reportFilter.socialmedia_from_id] : []);
//     setLocalSocialMediaFromScreenNames(Array.isArray(reportFilter.socialmedia_from_screenname) ? [...reportFilter.socialmedia_from_screenname] : []);
//     setLocalServerIps(Array.isArray(reportFilter.serverip) ? [...reportFilter.serverip] : []);
//     setLocalStartTime(start_time);
//     setLocalEndTime(end_time);

//   }, [keyword, file_type, start_time, end_time, sentiment, target, case_id]);
  
// const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
//   };

//   // Helper function to create date range chip
//   const createDateRangeChip = (start, end) => {
//     if (!start && !end) return null;

//     const formattedStart = formatDate(start);
//     const formattedEnd = formatDate(end);

//     if (formattedStart && formattedEnd) {
//       return `${formattedStart} to ${formattedEnd}`;
//     } else if (formattedStart) {
//       return `From ${formattedStart}`;
//     } else if (formattedEnd) {
//       return `Until ${formattedEnd}`;
//     }
//     return null;
//   };

//   // Generate display chips from local state
//   const getDisplayChips = () => {
//     const chips = [];

//     chips.push(...localKeywordChips);
//     chips.push(...localFileTypeChips);
//     chips.push(...localSentiments);
//     chips.push(...localTargets.map(t => t.name));
//     chips.push(...localUnifiedTypes);
//     chips.push(...localEventTypeStrings);
//     chips.push(...localMobileNumbers);
//     chips.push(...localSocialMediaHashtags);
//     chips.push(...localSocialMediaFromIds);
//     chips.push(...localSocialMediaFromScreenNames);
//     chips.push(...localServerIps);
//     chips.push(...localCaseIds);

//     const dateRangeChip = createDateRangeChip(localStartTime, localEndTime);
//     if (dateRangeChip) {
//       chips.push(dateRangeChip);
//     }

//     return [...new Set(chips)];
//   };

//   // Handle search submit
//   const handleSearchSubmit = async () => {
//     const isSearchEmpty = (
//       (!localKeywordChips || localKeywordChips.length === 0) &&
//       (!localCaseIds || localCaseIds.length === 0) &&
//       (!localStartTime && !localEndTime) &&
//       (!localFileTypeChips || localFileTypeChips.length === 0) &&
//       (!localTargets || localTargets.length === 0) &&
//       (!localSentiments || localSentiments.length === 0) &&
//       (!localUnifiedTypes || localUnifiedTypes.length === 0) &&
//       (!localEventTypeStrings || localEventTypeStrings.length === 0) &&
//       (!localMobileNumbers || localMobileNumbers.length === 0) &&
//       (!localSocialMediaHashtags || localSocialMediaHashtags.length === 0) &&
//       (!localSocialMediaFromIds || localSocialMediaFromIds.length === 0) &&
//       (!localSocialMediaFromScreenNames || localSocialMediaFromScreenNames.length === 0) &&
//       (!localServerIps || localServerIps.length === 0)
//     );

//     if (isSearchEmpty) {
//       toast("Enter a keyword, or choose a case or date to proceed.");
//       return;
//     }

//     try {
//       // Build query object
//       const queryObject = {
//         report_generation: true,
//         ...(localKeywordChips.length > 0 && { keyword: localKeywordChips }),
//         ...(localCaseIds.length > 0 && { case_id: localCaseIds }),
//         ...(localFileTypeChips.length > 0 && { file_type: localFileTypeChips }),
//         ...(localSentiments.length > 0 && { sentiments: localSentiments }),
//         ...(localTargets.length > 0 && { targets: localTargets.map(t => String(t.value)) }),
//         ...(localUnifiedTypes.length > 0 && { unified_type: localUnifiedTypes }),
//         ...(localEventTypeStrings.length > 0 && { eventtypestring: localEventTypeStrings }),
//         ...(localMobileNumbers.length > 0 && { mobilenumber: localMobileNumbers }),
//         ...(localSocialMediaHashtags.length > 0 && { socialmedia_hashtags: localSocialMediaHashtags }),
//         ...(localSocialMediaFromIds.length > 0 && { socialmedia_from_id: localSocialMediaFromIds }),
//         ...(localSocialMediaFromScreenNames.length > 0 && { socialmedia_from_screenname: localSocialMediaFromScreenNames }),
//         ...(localServerIps.length > 0 && { serverip: localServerIps }),
//         page: 1,
//         size:50,
//       };

//       if (localStartTime && localEndTime) {
//         queryObject.start_time = localStartTime;
//         queryObject.end_time = localEndTime;
//       }

//       // Build final payload
//       const payload = {
//         file_extension: "pdf", // Default extension
//         query: queryObject,
//              };

//       console.log("Report search payload", payload);

//       const response = await axios.post(
//         `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
//         payload.query, // Send only the query part for now
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${Token}`
//           }
//         }
//       );

//       await dispatch(setReportResults({
//         results: response.data.results,
//         total_pages: response.data.total_pages,
//         total_results: response.data.total_results,
//       }));

//       // Update Redux state
//       const savePayload = {
//         keyword: localKeywordChips,
//         file_type: localFileTypeChips,
//         target: localTargets,
//         sentiment: localSentiments,
//         unified_type: localUnifiedTypes,
//         eventtypestring: localEventTypeStrings,
//         mobilenumber: localMobileNumbers,
//         socialmedia_hashtags: localSocialMediaHashtags,
//         socialmedia_from_id: localSocialMediaFromIds,
//         socialmedia_from_screenname: localSocialMediaFromScreenNames,
//         serverip: localServerIps,
//         case_id: localCaseIds.map(c => String(c)) || [],
//         ...(localStartTime && { start_time: localStartTime }),
//         ...(localEndTime && { end_time: localEndTime })
//       };

//       dispatch(saveReportilterPayload(savePayload));
//       dispatch(setPage(1));

//     } catch (error) {
//       console.error('Error performing search:', error);
//       toast.error('Error performing search');
//     }
//   };

//   // Handle adding new chips to local state
//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && inputValue.trim() !== "") {
//       const newChip = inputValue.trim();

//       if (localKeywordChips.includes(newChip)) {
//         setInputValue("");
//         return;
//       }

//       setLocalKeywordChips(prev => [...prev, newChip]);
//       setInputValue("");
//     }
//   };

//   const resetSearch = () => {
//     setLocalKeywordChips([]);
//     setLocalFileTypeChips([]);
//     setLocalStartTime(null);
//     setLocalEndTime(null);
//     setInputValue("");
//     setlocalTargets([]);
//     setLocalSentiments([]);
//     setLocalEventTypeStrings([]);
//     setLocalUnifiedTypes([]);
//     setLocalMobileNumbers([]);
//     setLocalSocialMediaHashtags([]);
//     setLocalSocialMediaFromIds([]);
//     setLocalSocialMediaFromScreenNames([]);
//     setLocalServerIps([]);
//     setLocalCaseIds([]);
//     dispatch(clearReportilterPayload());

//     dispatch(clearReportResults())
//   };

//   const removeChip = (chipToRemove) => {
//     if (typeof chipToRemove === 'string' && chipToRemove.includes(' to ')) {
//       setLocalStartTime(null);
//       setLocalEndTime(null);
//       return;
//     }

//     // Remove from respective arrays
//     setLocalKeywordChips(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalFileTypeChips(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalSentiments(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalUnifiedTypes(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalEventTypeStrings(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalMobileNumbers(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalSocialMediaHashtags(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalSocialMediaFromIds(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalSocialMediaFromScreenNames(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalServerIps(prev => prev.filter(chip => chip !== chipToRemove));

    
//     // For targets - chipToRemove will be string name
//     setlocalTargets(prev => prev.filter(chip => chip.name !== chipToRemove));
    
//     // For case IDs - chipToRemove will be the label
//     setLocalCaseIds(prev => prev.filter(chip => chip !== chipToRemove));
//   };

//   const displayChips = getDisplayChips();

//   return (
//     <div style={{ backgroundColor: "#080E17", height: "100%", zIndex: "1050", overflowY: "hidden" }}>
//       <SearchUIContainer
//         inputValue={inputValue}
//         placeholder='Enter comments to search records in report'
//         setInputValue={setInputValue}
//         handleSearch={handleSearchSubmit}
//         handleKeyPress={handleKeyPress}
//         resetSearch={resetSearch}
//         activeComponent="gridView" // Fixed component
//         setActiveComponent={() => {}} // No component switching
//         displayChips={displayChips}
//         chipCheckFunctions={[
//           (chip) => localFileTypeChips.includes(chip),
//           (chip) => localSentiments.includes(chip),
//           (chip) => localTargets.some(t => t.name === chip),
//           (chip) => localCaseIds.includes(chip),
//           (chip) => localUnifiedTypes.includes(chip),
//           (chip) => localEventTypeStrings.includes(chip),
//           (chip) => localMobileNumbers.includes(chip),
//           (chip) => localSocialMediaHashtags.includes(chip),
//           (chip) => localSocialMediaFromIds.includes(chip),
//           (chip) => localSocialMediaFromScreenNames.includes(chip),
//           (chip) => localServerIps.includes(chip),
//           (chip) => chip.includes(' to ')
//         ]}
//         removeChip={removeChip}
//         PopupComponent={AddFilter}
//         isPopupVisible={isPopupVisible}
//         setIsPopupVisible={setIsPopupVisible}
//         showCaseHeader={false}
//         CaseHeaderComponent={null}
//         componentsMap={{
//           gridView: { icon: null, component: <GridView chipsHeight={chipsHeight} /> }
//         }}
//         popupSearchChips={localKeywordChips}
//       />
//     </div>
//   );
// };



// export default ReportPage;

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { setPage } from '../../../Redux/Action/criteriaAction';
import { saveReportilterPayload, setReportResults, clearReportilterPayload, clearReportResults } from '../../../Redux/Action/reportAction';
import GridView from './gridView';
import SearchUIContainer from "../../Common/SearchBarCriteria/SearchUIContainer";
import AddFilter from './reportFilter';
import { toast } from 'react-toastify';
import axios from 'axios';

const ReportPage = ({chipsHeight}) => {
  const Token = Cookies.get('accessToken');
  const dispatch = useDispatch();
  const reportFilter = useSelector((state) => state.reportFilter?.reportFilters);

  const { file_type, keyword, start_time, end_time, target, sentiment, case_id } = reportFilter || {}

  const [inputValue, setInputValue] = useState("");
  
  // Local state for managing chips before sending
  const [localKeywordChips, setLocalKeywordChips] = useState([]);
  const [localFileTypeChips, setLocalFileTypeChips] = useState([]);
  const [localStartTime, setLocalStartTime] = useState(null);
  const [localEndTime, setLocalEndTime] = useState(null);
  const [localTargets, setlocalTargets] = useState([]);
  const [localSentiments, setLocalSentiments] = useState([]);
  const [localCaseIds, setLocalCaseIds] = useState([]);
  const [localUnifiedTypes, setLocalUnifiedTypes] = useState([]);
  const [localEventTypeStrings, setLocalEventTypeStrings] = useState([]);
  const [localMobileNumbers, setLocalMobileNumbers] = useState([]);
  const [localSocialMediaHashtags, setLocalSocialMediaHashtags] = useState([]);
  const [localSocialMediaFromIds, setLocalSocialMediaFromIds] = useState([]);
  const [localSocialMediaFromScreenNames, setLocalSocialMediaFromScreenNames] = useState([]);
  const [localServerIps, setLocalServerIps] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [localLatitudeChips, setLocalLatitudeChips] = useState([]);
  const [localLongitudeChips, setLocalLongitudeChips] = useState([]);
 
  // REMOVE THIS - redux-persist will handle initialization
  // useEffect(() => {
  //   const savePayload = {
  //     file_type: [],
  //     keyword: [],
  //     ...
  //   };
  //   dispatch(saveReportilterPayload(savePayload));
  // }, []);

  // REMOVE THIS - don't clear on unmount
  // useEffect(() => {
  //   return () => {
  //     resetSearch();
  //   };
  // }, []);

  // Sync local state with Redux state
  useEffect(() => {
    setLocalKeywordChips(Array.isArray(keyword) ? [...keyword] : []);
    setLocalCaseIds(Array.isArray(case_id) ? [...case_id] : []);
    setLocalFileTypeChips(Array.isArray(file_type) ? [...file_type] : []);
    setlocalTargets(
      Array.isArray(target) && target.length > 0
        ? target.map(t => ({ id: t.id, name: t.name, value: t.value ?? t.id }))
        : []
    );
    setLocalSentiments(Array.isArray(sentiment) ? [...sentiment] : []);
    setLocalUnifiedTypes(Array.isArray(reportFilter?.unified_type) ? [...reportFilter.unified_type] : []);
    setLocalEventTypeStrings(Array.isArray(reportFilter?.eventtypestring) ? [...reportFilter.eventtypestring] : []);
    setLocalMobileNumbers(Array.isArray(reportFilter?.mobilenumber) ? [...reportFilter.mobilenumber] : []);
    setLocalSocialMediaHashtags(Array.isArray(reportFilter?.socialmedia_hashtags) ? [...reportFilter.socialmedia_hashtags] : []);
    setLocalSocialMediaFromIds(Array.isArray(reportFilter?.socialmedia_from_id) ? [...reportFilter.socialmedia_from_id] : []);
    setLocalSocialMediaFromScreenNames(Array.isArray(reportFilter?.socialmedia_from_screenname) ? [...reportFilter.socialmedia_from_screenname] : []);
    setLocalServerIps(Array.isArray(reportFilter?.serverip) ? [...reportFilter.serverip] : []);
    setLocalStartTime(start_time);
    setLocalLatitudeChips(reportFilter?.latitude ? [reportFilter.latitude] : []);
    setLocalLongitudeChips(reportFilter?.longitude ? [reportFilter.longitude] : []);
    setLocalEndTime(end_time);

  }, [keyword, file_type, start_time, end_time, sentiment, target, case_id, reportFilter]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const createDateRangeChip = (start, end) => {
    if (!start && !end) return null;

    const formattedStart = formatDate(start);
    const formattedEnd = formatDate(end);

    if (formattedStart && formattedEnd) {
      return `${formattedStart} to ${formattedEnd}`;
    } else if (formattedStart) {
      return `From ${formattedStart}`;
    } else if (formattedEnd) {
      return `Until ${formattedEnd}`;
    }
    return null;
  };

  const getDisplayChips = () => {
    const chips = [];

    chips.push(...localKeywordChips);
    chips.push(...localFileTypeChips);
    chips.push(...localSentiments);
    chips.push(...localTargets.map(t => t.name));
    chips.push(...localUnifiedTypes);
    chips.push(...localEventTypeStrings);
    chips.push(...localMobileNumbers);
    chips.push(...localSocialMediaHashtags);
    chips.push(...localSocialMediaFromIds);
    chips.push(...localSocialMediaFromScreenNames);
    chips.push(...localServerIps);
    chips.push(...localCaseIds);
    chips.push(...localLatitudeChips);
    chips.push(...localLongitudeChips);

    const dateRangeChip = createDateRangeChip(localStartTime, localEndTime);
    if (dateRangeChip) {
      chips.push(dateRangeChip);
    }

    return [...new Set(chips)];
  };

  const handleSearchSubmit = async () => {
    const isSearchEmpty = (
      (!localKeywordChips || localKeywordChips.length === 0) &&
      (!localCaseIds || localCaseIds.length === 0) &&
      (!localStartTime && !localEndTime) &&
      (!localFileTypeChips || localFileTypeChips.length === 0) &&
      (!localTargets || localTargets.length === 0) &&
      (!localSentiments || localSentiments.length === 0) &&
      (!localUnifiedTypes || localUnifiedTypes.length === 0) &&
      (!localEventTypeStrings || localEventTypeStrings.length === 0) &&
      (!localMobileNumbers || localMobileNumbers.length === 0) &&
      (!localSocialMediaHashtags || localSocialMediaHashtags.length === 0) &&
      (!localSocialMediaFromIds || localSocialMediaFromIds.length === 0) &&
      (!localSocialMediaFromScreenNames || localSocialMediaFromScreenNames.length === 0) &&
      (!localServerIps || localServerIps.length === 0) && 
      (!localLatitudeChips || localLatitudeChips.length === 0) &&
      (!localLongitudeChips || localLongitudeChips.length === 0) 
    );

    if (isSearchEmpty) {
      toast("Enter a keyword, or choose a case or date to proceed.");
      return;
    }

    try {
      const queryObject = {
        report_generation: true,
        ...(localKeywordChips.length > 0 && { keyword: localKeywordChips }),
        ...(localCaseIds.length > 0 && { case_id: localCaseIds }),
        ...(localFileTypeChips.length > 0 && { file_type: localFileTypeChips }),
        ...(localSentiments.length > 0 && { sentiments: localSentiments }),
        ...(localTargets.length > 0 && { targets: localTargets.map(t => String(t.value)) }),
        ...(localUnifiedTypes.length > 0 && { unified_type: localUnifiedTypes }),
        ...(localEventTypeStrings.length > 0 && { eventtypestring: localEventTypeStrings }),
        ...(localMobileNumbers.length > 0 && { mobilenumber: localMobileNumbers }),
        ...(localSocialMediaHashtags.length > 0 && { socialmedia_hashtags: localSocialMediaHashtags }),
        ...(localSocialMediaFromIds.length > 0 && { socialmedia_from_id: localSocialMediaFromIds }),
        ...(localSocialMediaFromScreenNames.length > 0 && { socialmedia_from_screenname: localSocialMediaFromScreenNames }),
        ...(localServerIps.length > 0 && { serverip: localServerIps }),
        ...(localLatitudeChips.length > 0 && { latitude: localLatitudeChips[0] }),
        ...(localLongitudeChips.length > 0 && { longitude: localLongitudeChips[0] }),
        page: 1,
        size: 50,
      };

      if (localStartTime && localEndTime) {
        queryObject.start_time = localStartTime;
        queryObject.end_time = localEndTime;
      }

      const payload = {
        file_extension: "pdf",
        query: queryObject,
      };

      console.log("Report search payload", payload);

      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
        payload.query,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Token}`
          }
        }
      );

      // Save results to Redux (redux-persist will automatically save to localStorage)
      await dispatch(setReportResults({
        page: response.data.page,
        results: response.data.results,
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
      }));

      // Save filters to Redux
      const savePayload = {
        keyword: localKeywordChips,
        file_type: localFileTypeChips,
        target: localTargets,
        sentiment: localSentiments,
        unified_type: localUnifiedTypes,
        eventtypestring: localEventTypeStrings,
        mobilenumber: localMobileNumbers,
        socialmedia_hashtags: localSocialMediaHashtags,
        socialmedia_from_id: localSocialMediaFromIds,
        socialmedia_from_screenname: localSocialMediaFromScreenNames,
        serverip: localServerIps,
        latitude: localLatitudeChips.length > 0 ? localLatitudeChips[0] : "",
        longitude: localLongitudeChips.length > 0 ? localLongitudeChips[0] : "",
        case_id: localCaseIds.map(c => String(c)) || [],
        ...(localStartTime && { start_time: localStartTime }),
        ...(localEndTime && { end_time: localEndTime })
      };

      dispatch(saveReportilterPayload(savePayload));
      dispatch(setPage(1));

    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Error performing search');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      const newChip = inputValue.trim();

      if (localKeywordChips.includes(newChip)) {
        setInputValue("");
        return;
      }

      setLocalKeywordChips(prev => [...prev, newChip]);
      setInputValue("");
    }
  };

  const resetSearch = () => {
    setLocalKeywordChips([]);
    setLocalFileTypeChips([]);
    setLocalStartTime(null);
    setLocalEndTime(null);
    setInputValue("");
    setlocalTargets([]);
    setLocalSentiments([]);
    setLocalEventTypeStrings([]);
    setLocalUnifiedTypes([]);
    setLocalMobileNumbers([]);
    setLocalSocialMediaHashtags([]);
    setLocalSocialMediaFromIds([]);
    setLocalSocialMediaFromScreenNames([]);
    setLocalServerIps([]);
    setLocalCaseIds([]);
    setLocalLatitudeChips([]);
    setLocalLongitudeChips([]);
    
    // Clear both filters and results
    dispatch(clearReportilterPayload());
    dispatch(clearReportResults());
  };

  const removeChip = (chipToRemove) => {
    // if (typeof chipToRemove === 'string' && chipToRemove.includes(' to ')) {
    //   setLocalStartTime(null);
    //   setLocalEndTime(null);
    //   return;
    // }
    const isDateRange = typeof chipToRemove === 'string' &&
      (chipToRemove.match(/^\d{2}\/\d{2}\/\d{4}\s+to\s+\d{2}\/\d{2}\/\d{4}$/) ||
        chipToRemove.match(/^From\s+\d{2}\/\d{2}\/\d{4}$/) ||
        chipToRemove.match(/^Until\s+\d{2}\/\d{2}\/\d{4}$/));

    if (isDateRange) {
      setLocalStartTime(null);
      setLocalEndTime(null);
      return;
    }

    setLocalKeywordChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalFileTypeChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalSentiments(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalUnifiedTypes(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalEventTypeStrings(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalMobileNumbers(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalSocialMediaHashtags(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalSocialMediaFromIds(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalSocialMediaFromScreenNames(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalServerIps(prev => prev.filter(chip => chip !== chipToRemove));
    setlocalTargets(prev => prev.filter(chip => chip.name !== chipToRemove));
    setLocalCaseIds(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalLatitudeChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalLongitudeChips(prev => prev.filter(chip => chip !== chipToRemove));
  };

  const displayChips = getDisplayChips();

  return (
    <div style={{ backgroundColor: "#080E17", height: "100%", zIndex: "1050", overflowY: "hidden" }}>
      <SearchUIContainer
        inputValue={inputValue}
        placeholder='Type a comment, press Enter, and click Go or choose search criteria to view the report'
        setInputValue={setInputValue}
        handleSearch={handleSearchSubmit}
        handleKeyPress={handleKeyPress}
        resetSearch={resetSearch}
        activeComponent="gridView"
        setActiveComponent={() => {}}
        displayChips={displayChips}
        chipCheckFunctions={[
          (chip) => localFileTypeChips.includes(chip),
          (chip) => localSentiments.includes(chip),
          (chip) => localTargets.some(t => t.name === chip),
          (chip) => localCaseIds.includes(chip),
          (chip) => localUnifiedTypes.includes(chip),
          (chip) => localEventTypeStrings.includes(chip),
          (chip) => localMobileNumbers.includes(chip),
          (chip) => localSocialMediaHashtags.includes(chip),
          (chip) => localSocialMediaFromIds.includes(chip),
          (chip) => localSocialMediaFromScreenNames.includes(chip),
          (chip) => localServerIps.includes(chip),
          (chip) => localLatitudeChips.includes(chip),
          (chip) => localLongitudeChips.includes(chip),
          (chip) => chip.includes(' to ')
        ]}
        removeChip={removeChip}
        PopupComponent={AddFilter}
        isPopupVisible={isPopupVisible}
        setIsPopupVisible={setIsPopupVisible}
        showCaseHeader={false}
        CaseHeaderComponent={null}
        componentsMap={{
          gridView: { icon: null, component: <GridView chipsHeight={chipsHeight} /> }
        }}
        popupSearchChips={localKeywordChips}
      />
    </div>
  );
};

export default ReportPage;
