// import React, { useEffect, useState } from "react";
// import { ListAltOutlined, PieChart } from "@mui/icons-material";
// import { FaPhotoVideo } from "react-icons/fa";
// import { useDispatch, useSelector } from "react-redux";
// import GraphicalData from "./GraphicalData/graphicalData";
// import Resources from "./Resources";
// import TabulerData from "./TabularData/tabulerData";
// import CaseHeader from "./caseHeader";
// import AddFilter from "./TabularData/filter";
// import SearchUIContainer from "../../Common/SearchBarCriteria/SearchUIContainer";
// import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
// import ConnectionView from "../ConnectionGraph/ConnectionView";
// import { fetchSummaryData } from "../../../Redux/Action/filterAction";
// import { clearCaseFilterPayload, saveCaseFilterPayload } from "../../../Redux/Action/caseAction";
// import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
// import MapViewCase from "./mapViewCase";
// import { useParams, useNavigate, useLocation } from "react-router-dom";

// const CaseTableDataFilter = ({chipsHeight}) => {
//     const { caseId, view } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const dispatch = useDispatch();
//     const caseData = useSelector((state) => state.caseData.caseData);
//     const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);

//     const {
//         file_type,
//         aggs_fields,
//         keyword,
//         start_time,
//         end_time,
//         target,
//         sentiment,
//         unified_type,
//         eventtypestring,
//         mobilenumber,
//         socialmedia_hashtags,
//         socialmedia_from_id,
//         socialmedia_from_screenname,
//         serverip
//     } = caseFilter || {};

//     const [inputValue, setInputValue] = useState("");

//     // Local state for chips
//     const [localKeywordChips, setLocalKeywordChips] = useState([]);
//     const [localFileTypeChips, setLocalFileTypeChips] = useState([]);
//     const [localAggsFieldsChips, setLocalAggsFieldsChips] = useState([]);
//     const [localStartTime, setLocalStartTime] = useState(null);
//     const [localEndTime, setLocalEndTime] = useState(null);
//     const [localTargets, setlocalTargets] = useState([]);
//     const [localSetiments, setLocalSetiments] = useState([]);
//     const [localUnifiedType, setLocalUnifiedType] = useState([]);
//     const [localSocialmediaID, setLocalSocialmediaID] = useState([]);
//     const [localSocialmediaFromScreenName, setLocalSocialmediaFromScreenName] = useState([]);
//     const [localSocialmediaHashtags, setLocalSocialmediaHashtags] = useState([]);
//     const [localEventTypeString, setLocalEventTypeString] = useState([]);
//     const [localMobileNumber, setLocalMobileNumber] = useState([]);
//     const [localServerIP, setLocalServerIP] = useState([]);

//     // 🔹 Define the view mapping
//     const viewMap = {
//         graphicalData: "graph",
//         caseData: "tabular",
//         connectionView: "connection",
//         mapView: "map",
//         resources: "resources",
//     };

//     const reverseViewMap = Object.fromEntries(
//         Object.entries(viewMap).map(([k, v]) => [v, k])
//     );

//     const [activeComponent, setActiveComponent] = useState("graphicalData");
//     const [isPopupVisible, setIsPopupVisible] = useState(false);

//     const activateResourceView = () => {
//         setActiveComponent("resources");
//     };

//     // 🔹 Sync activeComponent from URL view parameter
//     useEffect(() => {
//         if (view && reverseViewMap[view]) {
//             const componentKey = reverseViewMap[view];
//             if (componentKey !== activeComponent) {
//                 setActiveComponent(componentKey);
//             }
//         }
//     }, [view]);

//     // 💾 Save last view for case
//     useEffect(() => {
//         if (caseId && location.pathname) {
//             console.log("💾 Saving to localStorage:", location.pathname);
//             localStorage.setItem(`lastPath_case_${caseId}`, location.pathname);
//         }
//     }, [location.pathname, caseId]);

//     // 🚀 Restore if direct case open
//     useEffect(() => {
//         if (!view && caseId) {
//             const lastPath = localStorage.getItem(`lastPath_case_${caseId}`);
//             let targetView = "graph"; // default
            
//             if (lastPath) {
//                 const segments = lastPath.split('/');
//                 const viewIndex = segments.indexOf('analysis') + 1;
//                 if (viewIndex > 0 && segments[viewIndex]) {
//                     targetView = segments[viewIndex];
//                 }
//             }
            
//             navigate(`/cases/analysis/${targetView}/${caseId}`, { replace: true });
//         }
//     }, [caseId, view, navigate]);

//     // Initialize Redux payload on case load
//     useEffect(() => {
//         if (caseData?.id) {
//             const savePayload = {
//                 caseId: caseData.id,
//                 file_type: [],
//                 keyword: [],
//                 aggs_fields: [],
//                 start_time: "",
//                 end_time: "",
//                 target: [],
//                 sentiment: [],
//                 unified_type: [],
//                 eventtypestring: [],
//                 mobilenumber: [],
//                 socialmedia_hashtags: [],
//                 socialmedia_from_id: [],
//                 socialmedia_from_screenname: [],
//                 serverip: [],
//             };
//             dispatch(saveCaseFilterPayload(savePayload));
//         }
//     }, [caseData?.id, dispatch]);

//     // Sync local state with Redux
//     useEffect(() => {
//         setLocalKeywordChips(Array.isArray(keyword) ? [...keyword] : []);
//         setLocalFileTypeChips(Array.isArray(file_type) ? [...file_type] : []);
//         setLocalAggsFieldsChips(Array.isArray(aggs_fields) ? [...aggs_fields] : []);
//         setlocalTargets(Array.isArray(target) ? target.map(t => ({ id: t.id, name: t.name, value: t.value ?? t.id })) : []);
//         setLocalSetiments(Array.isArray(sentiment) ? [...sentiment] : []);
//         setLocalUnifiedType(Array.isArray(unified_type) ? [...unified_type] : []);
//         setLocalEventTypeString(Array.isArray(eventtypestring) ? [...eventtypestring] : []);
//         setLocalMobileNumber(Array.isArray(mobilenumber) ? [...mobilenumber] : []);
//         setLocalServerIP(Array.isArray(serverip) ? [...serverip] : []);
//         setLocalSocialmediaID(Array.isArray(socialmedia_from_id) ? [...socialmedia_from_id] : []);
//         setLocalSocialmediaFromScreenName(Array.isArray(socialmedia_from_screenname) ? [...socialmedia_from_screenname] : []);
//         setLocalSocialmediaHashtags(Array.isArray(socialmedia_hashtags) ? [...socialmedia_hashtags] : []);
//         setLocalStartTime(start_time);
//         setLocalEndTime(end_time);
//     }, [
//         keyword, file_type, aggs_fields, start_time, end_time, sentiment,
//         target, unified_type, eventtypestring, mobilenumber, socialmedia_hashtags,
//         socialmedia_from_id, socialmedia_from_screenname, serverip
//     ]);

//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-GB');
//     };

//     const createDateRangeChip = (start, end) => {
//         if (!start && !end) return null;

//         const formattedStart = formatDate(start);
//         const formattedEnd = formatDate(end);

//         if (formattedStart && formattedEnd) {
//             return `${formattedStart} to ${formattedEnd}`;
//         } else if (formattedStart) {
//             return `From ${formattedStart}`;
//         } else if (formattedEnd) {
//             return `Until ${formattedEnd}`;
//         }
//         return null;
//     };

//     const getDisplayChips = () => {
//         const chips = [];
//         const addChips = arr => arr.forEach(c => {
//             if (!c) return;
//             if (typeof c === 'string') chips.push(c);
//             else if (c.label) chips.push(c.label);
//             else if (c.name) chips.push(c.name);
//             else if (c.value) chips.push(c.value);
//         });

//         addChips(localKeywordChips);
//         addChips(localFileTypeChips);
//         addChips(localAggsFieldsChips);
//         addChips(localSetiments);
//         addChips(localUnifiedType);
//         addChips(localMobileNumber);
//         addChips(localEventTypeString);
//         addChips(localSocialmediaID);
//         addChips(localSocialmediaFromScreenName);
//         addChips(localSocialmediaHashtags);
//         addChips(localServerIP);
//         addChips(localTargets);

//         const dateRangeChip = createDateRangeChip(localStartTime, localEndTime);
//         if (dateRangeChip) {
//             chips.push(dateRangeChip);
//         }

//         return [...new Set(chips)];
//     };

//     const handleSearchSubmit = () => {
//         if (!caseData?.id) return;

//         const savePayload = {
//             caseId: caseData.id,
//             keyword: localKeywordChips,
//             file_type: localFileTypeChips,
//             aggs_fields: localAggsFieldsChips,
//             target: localTargets,
//             sentiment: localSetiments,
//             unified_type: localUnifiedType,
//             eventtypestring: localEventTypeString,
//             mobilenumber: localMobileNumber,
//             serverip: localServerIP,
//             socialmedia_from_id: localSocialmediaID,
//             socialmedia_from_screenname: localSocialmediaFromScreenName,
//             socialmedia_hashtags: localSocialmediaHashtags,
//             ...(localStartTime && { start_time: localStartTime }),
//             ...(localEndTime && { end_time: localEndTime })
//         };

//         dispatch(saveCaseFilterPayload(savePayload));

//         const summaryPayload = {
//             case_id: String(caseData.id),
//             ...(localKeywordChips.length > 0 && { keyword: localKeywordChips }),
//             ...(localFileTypeChips.length > 0 && { file_type: localFileTypeChips }),
//             ...(localAggsFieldsChips.length > 0 && { aggs_fields: localAggsFieldsChips }),
//             ...(localSetiments.length > 0 && { sentiments: localSetiments }),
//             ...(localUnifiedType.length > 0 && { unified_type: localUnifiedType }),
//             ...(localMobileNumber.length > 0 && { mobilenumber: localMobileNumber }),
//             ...(localServerIP.length > 0 && { serverip: localServerIP }),
//             ...(localEventTypeString.length > 0 && { eventtypestring: localEventTypeString }),
//             ...(localSocialmediaFromScreenName.length > 0 && { socialmedia_from_screenname: localSocialmediaFromScreenName }),
//             ...(localSocialmediaHashtags.length > 0 && { socialmedia_hashtags: localSocialmediaHashtags }),
//             ...(localSocialmediaID.length > 0 && { socialmedia_from_id: localSocialmediaID }),
//             ...(localTargets.length > 0 && { targets: localTargets.map(t => String(t.value)) }),
//             ...(localStartTime && { starttime: localStartTime }),
//             ...(localEndTime && { endtime: localEndTime }),
//             page: 1,
//             itemsPerPage: 50
//         };

//         dispatch(fetchSummaryData(summaryPayload));
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === "Enter" && inputValue.trim() !== "") {
//             const newChip = inputValue.trim();
//             if (!localKeywordChips.includes(newChip)) {
//                 setLocalKeywordChips(prev => [...prev, newChip]);
//             }
//             setInputValue("");
//         }
//     };

//     const resetSearch = () => {
//         setLocalKeywordChips([]);
//         setLocalFileTypeChips([]);
//         setLocalAggsFieldsChips([]);
//         setLocalStartTime(null);
//         setLocalEndTime(null);
//         setInputValue("");
//         setlocalTargets([]);
//         setLocalSetiments([]);
//         setLocalUnifiedType([]);
//         setLocalSocialmediaHashtags([]);
//         setLocalSocialmediaID([]);
//         setLocalSocialmediaFromScreenName([]);
//         setLocalEventTypeString([]);
//         setLocalMobileNumber([]);
//         setLocalServerIP([]);

//         dispatch(clearCaseFilterPayload());

//         if (caseData?.id) {
//             dispatch(fetchSummaryData({ case_id: String(caseData.id), page: 1, itemsPerPage: 50 }));
//         }
//     };

//     const removeChip = (chipToRemove) => {
//         if (typeof chipToRemove === 'string' && chipToRemove.includes(' to ')) {
//             setLocalStartTime(null);
//             setLocalEndTime(null);
//             return;
//         }

//         const removeFromArray = (arr) => arr.filter(c => {
//             if (!c) return false;
//             if (typeof c === 'string') return c !== chipToRemove;
//             if (c.label) return c.label !== chipToRemove;
//             if (c.name) return c.name !== chipToRemove;
//             return true;
//         });

//         setLocalKeywordChips(prev => removeFromArray(prev));
//         setLocalFileTypeChips(prev => removeFromArray(prev));
//         setLocalAggsFieldsChips(prev => removeFromArray(prev));
//         setLocalSetiments(prev => removeFromArray(prev));
//         setLocalUnifiedType(prev => removeFromArray(prev));
//         setLocalMobileNumber(prev => removeFromArray(prev));
//         setLocalEventTypeString(prev => removeFromArray(prev));
//         setLocalServerIP(prev => removeFromArray(prev));
//         setLocalSocialmediaID(prev => removeFromArray(prev));
//         setLocalSocialmediaFromScreenName(prev => removeFromArray(prev));
//         setLocalSocialmediaHashtags(prev => removeFromArray(prev));
//         setlocalTargets(prev => prev.filter(t => t.name !== chipToRemove));
//     };

//     // 🎯 On view change from icon
//     const handleComponentChange = (key) => {
//         if (!caseId || activeComponent === key) return;
//         setActiveComponent(key);
//         const viewSegment = viewMap[key] || "graph";
//         navigate(`/cases/analysis/${viewSegment}/${caseId}`);
//     };

//     const displayChips = getDisplayChips();

//     return (
//         <SearchUIContainer
//             inputValue={inputValue}
//             setInputValue={setInputValue}
//             handleSearch={handleSearchSubmit}
//             handleKeyPress={handleKeyPress}
//             resetSearch={resetSearch}
//             placeholder="Search..."
//             activeComponent={activeComponent}
//             setActiveComponent={handleComponentChange}
//             displayChips={displayChips}
//             chipCheckFunctions={[
//                 (chip) => localFileTypeChips.includes(chip),
//                 (chip) => localAggsFieldsChips.includes(chip),
//                 (chip) => localSetiments.includes(chip),
//                 (chip) => localUnifiedType.includes(chip),
//                 (chip) => localMobileNumber.includes(chip),
//                 (chip) => localServerIP.includes(chip),
//                 (chip) => localEventTypeString.includes(chip),
//                 (chip) => localSocialmediaFromScreenName.includes(chip),
//                 (chip) => localSocialmediaHashtags.includes(chip),
//                 (chip) => localSocialmediaID.includes(chip),
//                 (chip) => localTargets.some(target => target.name === chip),
//                 (chip) => chip.includes(' to ')
//             ]}
//             removeChip={removeChip}
//             PopupComponent={AddFilter}
//             isPopupVisible={isPopupVisible}
//             setIsPopupVisible={setIsPopupVisible}
//             showCaseHeader={true}
//             CaseHeaderComponent={<CaseHeader />}
//             componentsMap={{
//                 graphicalData: { icon: PieChart, component: <GraphicalData chipsHeight={chipsHeight} />, title: 'Graphical view' },
//                 resources: { icon: FaPhotoVideo, component: <Resources chipsHeight={chipsHeight} />, title: 'Resource view' },
//                 caseData: { icon: ListAltOutlined, component: <TabulerData chipsHeight={chipsHeight} setActiveView={activateResourceView} />, title: 'Tabular view' },
//                 connectionView: { icon: HubOutlinedIcon, component: <ConnectionView chipsHeight={chipsHeight} />, title: 'Connection view' },
//                 mapView: { icon: PersonPinCircleIcon, component: <MapViewCase chipsHeight={chipsHeight} />, title: 'Map view' },
//             }}
//             popupSearchChips={localKeywordChips}
//         />
//     );
// };

// export default React.memo(CaseTableDataFilter);


import React, { useEffect, useState, useRef } from "react";
import { ListAltOutlined, PieChart } from "@mui/icons-material";
import { FaPhotoVideo } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import GraphicalData from "./GraphicalData/graphicalData";
import Resources from "./Resources";
import TabulerData from "./TabularData/tabulerData";
import CaseHeader from "./caseHeader";
import AddFilter from "./TabularData/filter";
import SearchUIContainer from "../../Common/SearchBarCriteria/SearchUIContainer";
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import ConnectionView from "../ConnectionGraph/ConnectionView";
import { fetchSummaryData } from "../../../Redux/Action/filterAction";
import { clearCaseFilterPayload, saveCaseFilterPayload } from "../../../Redux/Action/caseAction";
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import MapViewCase from "./mapViewCase";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const CaseTableDataFilter = ({chipsHeight}) => {
  const { caseId, view } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const caseData = useSelector((state) => state.caseData.caseData);
  const caseFilter = useSelector((state) => state.caseFilter?.caseFilters);
  
  // Check if Redux Persist has rehydrated
  const _persistRehydrated = useSelector((state) => state._persist?.rehydrated);
  
  // Ref to track initialization
  const hasInitialized = useRef(false);
  const previousCaseId = useRef(null);


    const {
        file_type,
        aggs_fields,
        keyword,
        start_time,
        end_time,
        target,
        sentiment,
        unified_type,
        eventtypestring,
        mobilenumber,
        socialmedia_hashtags,
        socialmedia_from_id,
        socialmedia_from_screenname,
        serverip,
        latitude,
        longitude,
        event,
        loc,
        emails,
        date,
        person,
        org,
        language
    } = caseFilter || {};

  const [inputValue, setInputValue] = useState("");
  
  // Local state for chips
  const [localKeywordChips, setLocalKeywordChips] = useState([]);
  const [localFileTypeChips, setLocalFileTypeChips] = useState([]);
  const [localAggsFieldsChips, setLocalAggsFieldsChips] = useState([]);
  const [localStartTime, setLocalStartTime] = useState(null);
  const [localEndTime, setLocalEndTime] = useState(null);
  const [localTargets, setlocalTargets] = useState([]);
  const [localSetiments, setLocalSetiments] = useState([]);
  const [localUnifiedType, setLocalUnifiedType] = useState([]);
  const [localSocialmediaID, setLocalSocialmediaID] = useState([]);
  const [localSocialmediaFromScreenName, setLocalSocialmediaFromScreenName] = useState([]);
  const [localSocialmediaHashtags, setLocalSocialmediaHashtags] = useState([]);
  const [localEventTypeString, setLocalEventTypeString] = useState([]);
  const [localMobileNumber, setLocalMobileNumber] = useState([]);
  const [localServerIP, setLocalServerIP] = useState([]);
  const [localEvent, setLocalEvent] = useState([]);
  const [localEmails, setLocalEmails] = useState([]);
  const [localDate, setLocalDate] = useState([]);
  const [localLoc, setLocalLoc] = useState([]);
  const [localPerson, setLocalPerson] = useState([]);
  const [localOrg, setLocalOrg] = useState([]);
  const [localLanguage, setLocalLanguage] = useState([]);
  const [localLongitude, setLocalLongitude] = useState("");
  const [localLatitude, setLocalLatitude] = useState("");

  // Define the view mapping
  const viewMap = {
    graphicalData: "graph",
    caseData: "tabular",
    connectionView: "connection",
    mapView: "map",
    resources: "resources",
  };


  const reverseViewMap = Object.fromEntries(
    Object.entries(viewMap).map(([k, v]) => [v, k])
  );

  const [activeComponent, setActiveComponent] = useState("graphicalData");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const activateResourceView = () => {
    setActiveComponent("resources");
  };

  // Sync activeComponent from URL view parameter
  useEffect(() => {
    if (view && reverseViewMap[view]) {
      const componentKey = reverseViewMap[view];
      if (componentKey !== activeComponent) {
        setActiveComponent(componentKey);
      }
    }
  }, [view]);

  // Save last view for case
  useEffect(() => {
    if (caseId && location.pathname) {
      console.log("💾 Saving to localStorage:", location.pathname);
      localStorage.setItem(`lastPath_case_${caseId}`, location.pathname);
    }
  }, [location.pathname, caseId]);

  // Restore if direct case open
  useEffect(() => {
    if (!view && caseId) {
      const lastPath = localStorage.getItem(`lastPath_case_${caseId}`);
      let targetView = "graph"; // default
      
      if (lastPath) {
        const segments = lastPath.split('/');
        const viewIndex = segments.indexOf('analysis') + 1;
        if (viewIndex > 0 && segments[viewIndex]) {
          targetView = segments[viewIndex];
        }
      }
      
      navigate(`/cases/analysis/${targetView}/${caseId}`, { replace: true });
    }
  }, [caseId, view, navigate]);

  // ✅ FIXED: Initialize Redux payload only when needed, after rehydration
  useEffect(() => {
    // Wait for Redux Persist to rehydrate
    if (!_persistRehydrated) {
      console.log("⏳ Waiting for Redux rehydration...");
      return;
    }
    if (!caseData?.id) return;

    // Check if case has changed
    const caseChanged = previousCaseId.current !== caseData.id;
    previousCaseId.current = caseData.id;

    // Only initialize if:
    // 1. Case has changed OR first initialization
    // 2. No existing filters for this case
    if (caseChanged || !hasInitialized.current) {
      const hasExistingFilters = caseFilter && (
        caseFilter.caseId === caseData.id &&
        Object.keys(caseFilter).some(key => {
          if (key === 'caseId') return false;
          const value = caseFilter[key];
          return Array.isArray(value) ? value.length > 0 : Boolean(value);
        })
      );

      console.log("🔍 Has existing filters:", hasExistingFilters);
      console.log("📦 Current caseFilter:", caseFilter);

    // Initialize Redux payload on case load
    // useEffect(() => {
    //     if (caseData?.id) {
    //         const savePayload = {
    //             caseId: caseData.id,
    //             file_type: [],
    //             keyword: [],
    //             aggs_fields: [],
    //             start_time: "",
    //             end_time: "",
    //             target: [],
    //             sentiment: [],
    //             unified_type: [],
    //             eventtypestring: [],
    //             mobilenumber: [],
    //             socialmedia_hashtags: [],
    //             socialmedia_from_id: [],
    //             socialmedia_from_screenname: [],
    //             serverip: [],
    //             latitude: "",
    //             longitude: ""
    //         };
    //         dispatch(saveCaseFilterPayload(savePayload));
    //     }
    // }, [caseData?.id, dispatch]);

      // Only initialize with empty values if no existing filters found
      if (!hasExistingFilters) {
        console.log("🆕 Initializing empty filters for case:", caseData.id);
        const savePayload = {

          caseId: caseData.id,
          file_type: [],
          keyword: [],
          aggs_fields: [],
          start_time: "",
          end_time: "",
          target: [],
          sentiment: [],
          unified_type: [],
          eventtypestring: [],
          mobilenumber: [],
          socialmedia_hashtags: [],
          socialmedia_from_id: [],
          socialmedia_from_screenname: [],
          serverip: [],
          event: [],
          loc: [],
          emails: [],
          date: [],
          person: [],
          org: [],
          language: [],
         latitude: "",
      longitude: ""
            
        };
        dispatch(saveCaseFilterPayload(savePayload));
      } else {
        console.log("✅ Using persisted filters");
      }
      
      hasInitialized.current = true;
    }
  }, [_persistRehydrated, caseData?.id, caseFilter, dispatch]);


  // Sync local state with Redux filters
  useEffect(() => {
    // Only sync if rehydration is complete
    if (!_persistRehydrated) return;

    console.log("🔄 Syncing local state with Redux:", {
      keyword,
      file_type,
      target,
      sentiment
    });

    setLocalKeywordChips(Array.isArray(keyword) ? [...keyword] : []);
    setLocalFileTypeChips(Array.isArray(file_type) ? [...file_type] : []);
    setLocalAggsFieldsChips(Array.isArray(aggs_fields) ? [...aggs_fields] : []);
    setlocalTargets(Array.isArray(target) ? target.map(t => ({
      id: t.id,
      name: t.name,
      value: t.value ?? t.id
    })) : []);
    setLocalSetiments(Array.isArray(sentiment) ? [...sentiment] : []);
    setLocalUnifiedType(Array.isArray(unified_type) ? [...unified_type] : []);
    setLocalEventTypeString(Array.isArray(eventtypestring) ? [...eventtypestring] : []);
    setLocalMobileNumber(Array.isArray(mobilenumber) ? [...mobilenumber] : []);
    setLocalServerIP(Array.isArray(serverip) ? [...serverip] : []);
    setLocalSocialmediaID(Array.isArray(socialmedia_from_id) ? [...socialmedia_from_id] : []);
    setLocalSocialmediaFromScreenName(Array.isArray(socialmedia_from_screenname) ? [...socialmedia_from_screenname] : []);
    setLocalSocialmediaHashtags(Array.isArray(socialmedia_hashtags) ? [...socialmedia_hashtags] : []);
    setLocalStartTime(start_time);
    setLocalEndTime(end_time);
     setLocalLatitude(latitude || "");
        setLocalLongitude(longitude || "");
    setLocalLoc(Array.isArray(loc) ? [...loc] : []);
    setLocalEmails(Array.isArray(emails) ? [...emails] : []);
    setLocalEvent(Array.isArray(event) ? [...event] : []);
    setLocalDate(Array.isArray(date) ? [...date] : []);
    setLocalPerson(Array.isArray(person) ? [...person] : []);
    setLocalOrg(Array.isArray(org) ? [...org] : []);
    setLocalLanguage(Array.isArray(language) ? [...language] : []);
  }, [
    _persistRehydrated,
    keyword,
    file_type,
    aggs_fields,
    start_time,
    end_time,
    sentiment,
    target,
    unified_type,
    eventtypestring,
    mobilenumber,
    socialmedia_hashtags,
    socialmedia_from_id,
    socialmedia_from_screenname,
    serverip,
    event,
    loc,
    emails,
    date,
    person,
    org,
    language,
    latitude, 
    longitude
  ]);

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
    
    const addChips = arr => arr.forEach(c => {
      if (!c) return;
      if (typeof c === 'string') chips.push(c);
      else if (c.label) chips.push(c.label);
      else if (c.name) chips.push(c.name);
      else if (c.value) chips.push(c.value);
    });

    addChips(localKeywordChips);
    addChips(localFileTypeChips);
    addChips(localAggsFieldsChips);
    addChips(localSetiments);
    addChips(localUnifiedType);
    addChips(localMobileNumber);
    addChips(localEventTypeString);
    addChips(localSocialmediaID);
    addChips(localSocialmediaFromScreenName);
    addChips(localSocialmediaHashtags);
    addChips(localServerIP);
    addChips(localTargets);
    addChips(localEvent);
    addChips(localLoc);
    addChips(localEmails);
    addChips(localDate);
    addChips(localPerson);
    addChips(localOrg);
    addChips(localLanguage);
    if (localLatitude) chips.push(localLatitude);
    if (localLongitude) chips.push(localLongitude);
    

    const dateRangeChip = createDateRangeChip(localStartTime, localEndTime);
    if (dateRangeChip) {
      chips.push(dateRangeChip);
    }

    return [...new Set(chips)];
  };

  const handleSearchSubmit = () => {
    if (!caseData?.id) return;

    const savePayload = {
      caseId: caseData.id,
      keyword: localKeywordChips,
      file_type: localFileTypeChips,
      aggs_fields: localAggsFieldsChips,
      target: localTargets,
      sentiment: localSetiments,
      unified_type: localUnifiedType,
      eventtypestring: localEventTypeString,
      event: localEvent,
      emails: localEmails,
      loc: localLoc,
      date: localDate,
      person: localPerson,
      org: localOrg,
      language: localLanguage,
      mobilenumber: localMobileNumber,
      serverip: localServerIP,
      socialmedia_from_id: localSocialmediaID,
      socialmedia_from_screenname: localSocialmediaFromScreenName,
      socialmedia_hashtags: localSocialmediaHashtags,
         latitude: localLatitude,
            longitude: localLongitude,
      ...(localStartTime && { start_time: localStartTime }),
      ...(localEndTime && { end_time: localEndTime })
    };

    console.log("💾 Saving filters to Redux:", savePayload);
    dispatch(saveCaseFilterPayload(savePayload));

    const summaryPayload = {
      case_id: String(caseData.id),
      ...(localKeywordChips.length > 0 && { keyword: localKeywordChips }),
      ...(localFileTypeChips.length > 0 && { file_type: localFileTypeChips }),
      ...(localAggsFieldsChips.length > 0 && { aggs_fields: localAggsFieldsChips }),
      ...(localSetiments.length > 0 && { sentiments: localSetiments }),
      ...(localUnifiedType.length > 0 && { unified_type: localUnifiedType }),
      ...(localMobileNumber.length > 0 && { mobilenumber: localMobileNumber }),
      ...(localServerIP.length > 0 && { serverip: localServerIP }),
      ...(localEventTypeString.length > 0 && { eventtypestring: localEventTypeString }),
      ...(localEvent.length > 0 && { event: localEvent}),
      ...(localLoc.length > 0 && { event: localLoc}),
      ...(localEmails.length > 0 && { event: localEmails}),
      ...(localDate.length > 0 && { event: localDate}),
      ...(localPerson.length > 0 && { event: localPerson}),
      ...(localOrg.length > 0 && { event: localOrg}),
      ...(localLanguage.length > 0 && { event: localLanguage}),
      ...(localSocialmediaFromScreenName.length > 0 && { socialmedia_from_screenname: localSocialmediaFromScreenName }),
      ...(localSocialmediaHashtags.length > 0 && { socialmedia_hashtags: localSocialmediaHashtags }),
      ...(localSocialmediaID.length > 0 && { socialmedia_from_id: localSocialmediaID }),
      ...(localTargets.length > 0 && { targets: localTargets.map(t => String(t.value)) }),
       ...(localLatitude && { latitude: localLatitude }),
      ...(localLongitude && { longitude: localLongitude }),
      ...(localStartTime && { starttime: localStartTime }),
      ...(localEndTime && { endtime: localEndTime }),
      page: 1,
      itemsPerPage: 50
    };
localStorage.removeItem("graphicalDataScrollPos");
    dispatch(fetchSummaryData(summaryPayload));
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      const newChip = inputValue.trim();
      if (!localKeywordChips.includes(newChip)) {
        setLocalKeywordChips(prev => [...prev, newChip]);
      }
      setInputValue("");
    }
  };

  const resetSearch = () => {
    console.log("🔄 Resetting search filters");
    
    setLocalKeywordChips([]);
    setLocalFileTypeChips([]);
    setLocalAggsFieldsChips([]);
    setLocalStartTime(null);
    setLocalEndTime(null);
    setInputValue("");
    setlocalTargets([]);
    setLocalSetiments([]);
    setLocalUnifiedType([]);
    setLocalSocialmediaHashtags([]);
    setLocalSocialmediaID([]);
    setLocalSocialmediaFromScreenName([]);
    setLocalEventTypeString([]);
    setLocalMobileNumber([]);
    setLocalServerIP([]);
    setLocalEvent([]);
    setLocalDate([]);
    setLocalEmails([]);
    setLocalLanguage([]);
    setLocalLoc([]);
    setLocalPerson([]);
    setLocalOrg([]);
     setLocalLatitude("");
    setLocalLongitude("");

    dispatch(clearCaseFilterPayload());
localStorage.removeItem("graphicalDataScrollPos");
    if (caseData?.id) {
      dispatch(fetchSummaryData({
        case_id: String(caseData.id),
        page: 1,
        itemsPerPage: 50
      }));
    }
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

    const removeFromArray = (arr) => arr.filter(c => {
      if (!c) return false;
      if (typeof c === 'string') return c !== chipToRemove;
      if (c.label) return c.label !== chipToRemove;
      if (c.name) return c.name !== chipToRemove;
      return true;
    });

    setLocalKeywordChips(prev => removeFromArray(prev));
    setLocalFileTypeChips(prev => removeFromArray(prev));
    setLocalAggsFieldsChips(prev => removeFromArray(prev));
    setLocalSetiments(prev => removeFromArray(prev));
    setLocalUnifiedType(prev => removeFromArray(prev));
    setLocalMobileNumber(prev => removeFromArray(prev));
    setLocalEventTypeString(prev => removeFromArray(prev));
    setLocalServerIP(prev => removeFromArray(prev));
    setLocalSocialmediaID(prev => removeFromArray(prev));
    setLocalSocialmediaFromScreenName(prev => removeFromArray(prev));
    setLocalSocialmediaHashtags(prev => removeFromArray(prev));
    setlocalTargets(prev => prev.filter(t => t.name !== chipToRemove));
     setLocalSocialmediaHashtags(prev => removeFromArray(prev));
        setlocalTargets(prev => prev.filter(t => t.name !== chipToRemove));
    setLocalLoc(prev => removeFromArray(prev));
    setLocalEmails(prev => removeFromArray(prev));
    setLocalEvent(prev => removeFromArray(prev));
    setLocalDate(prev => removeFromArray(prev));
    setLocalPerson(prev => removeFromArray(prev));
    setLocalOrg(prev => removeFromArray(prev));
    setLocalLanguage(prev => removeFromArray(prev));
        if (chipToRemove === localLatitude) setLocalLatitude("");
        if (chipToRemove === localLongitude) setLocalLongitude("");
  };

  const handleComponentChange = (key) => {
        if (!caseId || activeComponent === key) return;
        setActiveComponent(key);
        const viewSegment = viewMap[key] || "graph";
        navigate(`/cases/analysis/${viewSegment}/${caseId}`);
    };

const displayChips = getDisplayChips();
    return (
        <SearchUIContainer
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSearch={handleSearchSubmit}
            handleKeyPress={handleKeyPress}
            resetSearch={resetSearch}
            placeholder="Type a keyword, press Enter, and click Go icon to view the records"
            activeComponent={activeComponent}
            setActiveComponent={handleComponentChange}
            displayChips={displayChips}
            chipCheckFunctions={[
                (chip) => localFileTypeChips.includes(chip),
                (chip) => localAggsFieldsChips.includes(chip),
                (chip) => localSetiments.includes(chip),
                (chip) => localUnifiedType.includes(chip),
                (chip) => localMobileNumber.includes(chip),
                (chip) => localServerIP.includes(chip),
                (chip) => localEventTypeString.includes(chip),
                (chip) => localSocialmediaFromScreenName.includes(chip),
                (chip) => localSocialmediaHashtags.includes(chip),
                (chip) => localSocialmediaID.includes(chip),
                (chip) => localTargets.some(target => target.name === chip),
                (chip) => localLatitude.includes(chip),
                (chip) => localLongitude.includes(chip),
                (chip) => localEvent.includes(chip),
                (chip) => localEmails.includes(chip),
                (chip) => localLoc.includes(chip),
                (chip) => localDate.includes(chip),
                (chip) => localPerson.includes(chip),
                (chip) => localOrg.includes(chip),
                (chip) => localLanguage.includes(chip),
                (chip) => chip.includes(' to ')
            ]}
            removeChip={removeChip}
            PopupComponent={AddFilter}
            isPopupVisible={isPopupVisible}
            setIsPopupVisible={setIsPopupVisible}
            showCaseHeader={true}
            CaseHeaderComponent={<CaseHeader />}
            componentsMap={{
                graphicalData: { icon: PieChart, component: <GraphicalData chipsHeight={chipsHeight} />, title: 'Graphical view' },
                caseData: { icon: ListAltOutlined, component: <TabulerData chipsHeight={chipsHeight} setActiveView={activateResourceView} />, title: 'Tabular view' },
                 resources: { icon: FaPhotoVideo, component: <Resources chipsHeight={chipsHeight} />, title: 'Resource view' },
                connectionView: { icon: HubOutlinedIcon, component: <ConnectionView chipsHeight={chipsHeight} />, title: 'Connection view' },
                mapView: { icon: PersonPinCircleIcon, component: <MapViewCase chipsHeight={chipsHeight} />, title: 'Map view' },
            }}
            popupSearchChips={localKeywordChips}
        />
    );

};

export default React.memo(CaseTableDataFilter);
