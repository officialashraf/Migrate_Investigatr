import { useState, useEffect, useRef } from 'react';
import '../savedCriteriaGlobal.css';
import CriteriaCaseTable from './criteriaCaseList';
import AddNewCriteria from '../addNewCriteria';
import Cookies from 'js-cookie'
import { clearCriteria, setKeywords, setPage, setSearchResults } from '../../../../Redux/Action/criteriaAction';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { ListAltOutlined, PieChart } from "@mui/icons-material";
import { FaPhotoVideo } from "react-icons/fa";
import ScrollCriteriaViewer from './ResourceView';
import GrapghicalCriteria from './CriteriaGraphicaView/Grapghs/grapghicalCriteria';
import SearchUIContainer from '../../../Common/SearchBarCriteria/SearchUIContainer';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import ConnectionViewCriteria from './ConnectionViewCriteria';
import MapViewSearch from './mapViewSearch';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const SearchResults = ({ chipsHeight }) => {
  const token = Cookies.get('accessToken');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { view } = useParams();

  // ✅ Check if Redux Persist has rehydrated
  const _persistRehydrated = useSelector((state) => state._persist?.rehydrated);

  const { searchResults, totalPages, currentPage, totalResults } = useSelector((state) => state.search);
  const keywords = useSelector((state) => state.criteriaKeywords?.queryPayload?.keyword || '');
  const caseId = useSelector((state) => state.criteriaKeywords?.queryPayload?.case_id || '');
  const fileType = useSelector((state) => state.criteriaKeywords?.queryPayload?.file_type || '');
  const sentiments = useSelector((state) => state.criteriaKeywords?.queryPayload?.sentiments || '');
  const targets = useSelector((state) => state.criteriaKeywords?.queryPayload?.targets || '');
  const unifiedType = useSelector((state) => state.criteriaKeywords?.queryPayload?.unified_type || '');
  const eventTypeString = useSelector((state) => state.criteriaKeywords?.queryPayload?.eventtypestring || '');
  const mobileNumber = useSelector((state) => state.criteriaKeywords?.queryPayload?.mobilenumber || '');
  const socialmediaHashtags = useSelector((state) => state.criteriaKeywords?.queryPayload?.socialmedia_hashtags || '');
  const socialmediaFromId = useSelector((state) => state.criteriaKeywords?.queryPayload?.socialmedia_from_id || '');
  const socialmediaFromScreenName = useSelector((state) => state.criteriaKeywords?.queryPayload?.socialmedia_from_screenname || '');
  const serverIp = useSelector((state) => state.criteriaKeywords?.queryPayload?.serverip || '');
  const startTime = useSelector((state) => state.criteriaKeywords?.queryPayload?.start_time || '');
  const endTime = useSelector((state) => state.criteriaKeywords?.queryPayload?.end_time || '');
  const reduxPayload = useSelector((state) => state.criteriaKeywords?.queryPayload || {});
  const latitude = useSelector((state) => state.criteriaKeywords?.queryPayload?.latitude || '');
  const longitude = useSelector((state) => state.criteriaKeywords?.queryPayload?.longitude || '');
  const loc = useSelector((state) => state.criteriaKeywords?.queryPayload?.loc || '');
  const emails = useSelector((state) => state.criteriaKeywords?.queryPayload?.emails || '');
  const event = useSelector((state) => state.criteriaKeywords?.queryPayload?.event || '');
  const date = useSelector((state) => state.criteriaKeywords?.queryPayload?.date || '');
  const person = useSelector((state) => state.criteriaKeywords?.queryPayload?.person || '');
  const org = useSelector((state) => state.criteriaKeywords?.queryPayload?.org || '');
  const language = useSelector((state) => state.criteriaKeywords?.queryPayload?.language || '');


  // ✅ Refs to track initialization and loading
  const hasAutoSearched = useRef(false);
  const hasInitialized = useRef(false);
  const hasLoadedResults = useRef(false);

  const [inputValue, setInputValue] = useState('');

  // Local state for managing chips
  const [localKeywordChips, setLocalKeywordChips] = useState([]);
  const [localCaseIdChips, setLocalCaseIdChips] = useState([]);
  const [localFileTypeChips, setLocalFileTypeChips] = useState([]);
  const [localSentimentChips, setLocalSentimentChips] = useState([]);
  const [localTargetChips, setLocalTargetChips] = useState([]);
  const [localStartTime, setLocalStartTime] = useState(null);
  const [localEndTime, setLocalEndTime] = useState(null);
  const [localUnifiedTypeChips, setLocalUnifiedTypeChips] = useState([]);
  const [localEventTypeStringChips, setLocalEventTypeStringChips] = useState([]);
  const [localMobileNumberChips, setLocalMobileNumberChips] = useState([]);
  const [localSocialmediaHashtagsChips, setLocalSocialmediaHashtagsChips] = useState([]);
  const [localSocialmediaFromIdChips, setLocalSocialmediaFromIdChips] = useState([]);
  const [localSocialmediaFromScreenNameChips, setLocalSocialmediaFromScreenNameChips] = useState([]);
  const [localServerIpChips, setLocalServerIpChips] = useState([]);
  const [localLatitudeChips, setLocalLatitudeChips] = useState([]);
  const [localLongitudeChips, setLocalLongitudeChips] = useState([]);
  const [localEvent, setLocalEvent] = useState([]);
  const [localEmails, setLocalEmails] = useState([]);
  const [localDate, setLocalDate] = useState([]);
  const [localLoc, setLocalLoc] = useState([]);
  const [localPerson, setLocalPerson] = useState([]);
  const [localOrg, setLocalOrg] = useState([]);
  const [localLanguage, setLocalLanguage] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // 🔹 Define the view mapping
  const viewMap = {
    graph: "graph",
    photoVideo: "resources",
    list: "tabular",
    connectionView: "connection",
    mapView: "map",
  };

  const reverseViewMap = Object.fromEntries(
    Object.entries(viewMap).map(([k, v]) => [v, k])
  );

  const [activeComponent, setActiveComponent] = useState('graph');

  const activateResourceView = () => {
    setActiveComponent("photoVideo");
  };

  // 🔹 Sync activeComponent from URL view parameter
  useEffect(() => {
    if (view && reverseViewMap[view]) {
      const componentKey = reverseViewMap[view];
      if (componentKey !== activeComponent) {
        setActiveComponent(componentKey);
      }
    }
  }, [view]);

  // 💾 Save last view for search
  useEffect(() => {
    if (location.pathname) {
      console.log("💾 Saving search view to localStorage:", location.pathname);
      localStorage.setItem(`lastPath_search`, location.pathname);
    }
  }, [location.pathname]);

  // 🚀 Restore if direct search open
  useEffect(() => {
    if (!view) {
      const lastPath = localStorage.getItem(`lastPath_search`);
      let targetView = "graph"; // default

      if (lastPath) {
        const segments = lastPath.split('/');
        const viewIndex = segments.indexOf('search') + 1;
        if (viewIndex > 0 && segments[viewIndex]) {
          targetView = segments[viewIndex];
        }
      }

      navigate(`/search/${targetView}`, { replace: true });
    }
  }, [view, navigate]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Helper function to create date range chip
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

  // ✅ NEW: Sync local state with Redux whenever Redux state changes
  useEffect(() => {
    if (!_persistRehydrated) {
      console.log("⏳ Waiting for Redux rehydration (search)...");
      return;
    }

    console.log("🔄 Syncing local state with Redux changes:", {
      keywords,
      caseId,
      fileType,
      targets
    });

    setLocalKeywordChips(Array.isArray(keywords) ? [...keywords] : []);
    setLocalCaseIdChips(Array.isArray(caseId) ? [...caseId] : []);
    setLocalFileTypeChips(Array.isArray(fileType) ? [...fileType] : []);
    setLocalSentimentChips(Array.isArray(sentiments) ? [...sentiments] : []);
    setLocalTargetChips(
      Array.isArray(targets) && targets.length > 0
        ? targets.map(t => ({ id: t.id, name: t.name, value: t.value ?? t.id, }))
        : []);
    setLocalUnifiedTypeChips(Array.isArray(unifiedType) ? [...unifiedType] : []);
    setLocalEventTypeStringChips(Array.isArray(eventTypeString) ? [...eventTypeString] : []);
    setLocalMobileNumberChips(Array.isArray(mobileNumber) ? [...mobileNumber] : []);
    setLocalSocialmediaHashtagsChips(Array.isArray(socialmediaHashtags) ? [...socialmediaHashtags] : []);
    setLocalSocialmediaFromIdChips(Array.isArray(socialmediaFromId) ? [...socialmediaFromId] : []);
    setLocalSocialmediaFromScreenNameChips(Array.isArray(socialmediaFromScreenName) ? [...socialmediaFromScreenName] : []);
    setLocalServerIpChips(Array.isArray(serverIp) ? [...serverIp] : []);
    setLocalStartTime(startTime);
    setLocalEndTime(endTime);
    setLocalLatitudeChips(Array.isArray(latitude) ? [...latitude] : latitude ? [latitude] : []);
    setLocalLongitudeChips(Array.isArray(longitude) ? [...longitude] : longitude ? [longitude] : []);
    setLocalLoc(Array.isArray(loc) ? [...loc] : []);
    setLocalEmails(Array.isArray(emails) ? [...emails] : []);
    setLocalEvent(Array.isArray(event) ? [...event] : []);
    setLocalDate(Array.isArray(date) ? [...date] : []);
    setLocalPerson(Array.isArray(person) ? [...person] : []);
    setLocalOrg(Array.isArray(org) ? [...org] : []);
    setLocalLanguage(Array.isArray(language) ? [...language] : []);

    // ✅ Mark as loaded if we have data
    if (keywords?.length > 0 || caseId?.length > 0 || fileType?.length > 0 || searchResults?.length > 0) {
      hasLoadedResults.current = true;
    }
  }, [
    _persistRehydrated,
    keywords,
    caseId,
    fileType,
    sentiments,
    targets,
    unifiedType,
    eventTypeString,
    mobileNumber,
    socialmediaHashtags,
    socialmediaFromId,
    socialmediaFromScreenName,
    serverIp,
    startTime,
    endTime,
    latitude,
    longitude,
    loc,
    emails,
    event,
    date,
    person,
    org,
    language
  ]); // ✅ Now watches ALL Redux state changes

  // ✅ FIXED: Auto-search logic - better implementation
  useEffect(() => {
    if (!_persistRehydrated) {
      console.log("⏳ Waiting for Redux rehydration for auto-search...");
      return;
    }

    // ✅ Agar already results hain, auto-search mat karo
    if (searchResults && searchResults.length > 0) {
      console.log("📊 Using existing search results from Redux");
      hasAutoSearched.current = true;
      hasInitialized.current = true;
      hasLoadedResults.current = true;
      return;
    }

    // ✅ Agar already initialized hai, dobara mat karo
    if (hasInitialized.current) return;

    // ✅ Check if there's a query in Redux
    const hasQuery = reduxPayload && (
      (Array.isArray(reduxPayload.keyword) && reduxPayload.keyword.length > 0) ||
      (Array.isArray(reduxPayload.case_id) && reduxPayload.case_id.length > 0) ||
      (Array.isArray(reduxPayload.file_type) && reduxPayload.file_type.length > 0) ||
      (Array.isArray(reduxPayload.sentiments) && reduxPayload.sentiments.length > 0) ||
      (Array.isArray(reduxPayload.targets) && reduxPayload.targets.length > 0) ||
      (Array.isArray(reduxPayload.unified_type) && reduxPayload.unified_type.length > 0) ||
      (Array.isArray(reduxPayload.eventtypestring) && reduxPayload.eventtypestring.length > 0) ||
      (Array.isArray(reduxPayload.mobilenumber) && reduxPayload.mobilenumber.length > 0) ||
      (Array.isArray(reduxPayload.socialmedia_hashtags) && reduxPayload.socialmedia_hashtags.length > 0) ||
      (Array.isArray(reduxPayload.socialmedia_from_id) && reduxPayload.socialmedia_from_id.length > 0) ||
      (Array.isArray(reduxPayload.socialmedia_from_screenname) && reduxPayload.socialmedia_from_screenname.length > 0) ||
      (Array.isArray(reduxPayload.serverip) && reduxPayload.serverip.length > 0) ||
      (Array.isArray(reduxPayload.loc) && reduxPayload.loc.length > 0) ||
      (Array.isArray(reduxPayload.emails) && reduxPayload.emails.length > 0) ||
      (Array.isArray(reduxPayload.event) && reduxPayload.event.length > 0) ||
      (Array.isArray(reduxPayload.date) && reduxPayload.date.length > 0) ||
      (Array.isArray(reduxPayload.person) && reduxPayload.person.length > 0) ||
      (Array.isArray(reduxPayload.org) && reduxPayload.org.length > 0) ||
      (Array.isArray(reduxPayload.language) && reduxPayload.language.length > 0) ||
      reduxPayload.start_time ||
      reduxPayload.end_time
    );

    console.log("🔍 Initialization check:", {
      hasQuery,
      hasResults: searchResults?.length > 0,
      hasInitialized: hasInitialized.current,
      hasAutoSearched: hasAutoSearched.current
    });

    // ✅ Sirf tab search karo jab query hai BUT results nahi hain
    if (hasQuery && !hasLoadedResults.current && !hasAutoSearched.current) {
      console.log("🔍 Auto-searching due to persisted query");
      hasAutoSearched.current = true;
      hasInitialized.current = true;
      handleSearch();
    } else if (!hasQuery) {
      // ✅ Agar koi query nahi hai to just mark as initialized
      hasInitialized.current = true;
    }
  }, [_persistRehydrated]);

  // Generate display chips from local state
  const getDisplayChips = () => {
    const chips = [];
    chips.push(...localKeywordChips);
    chips.push(...localCaseIdChips);
    chips.push(...localFileTypeChips);
    chips.push(...localSentimentChips);
    chips.push(...localTargetChips.map(t => t.name));
    chips.push(...localUnifiedTypeChips);
    chips.push(...localEventTypeStringChips);
    chips.push(...localMobileNumberChips);
    chips.push(...localSocialmediaHashtagsChips);
    chips.push(...localSocialmediaFromIdChips);
    chips.push(...localSocialmediaFromScreenNameChips);
    chips.push(...localServerIpChips);
    chips.push(...localLatitudeChips);
    chips.push(...localLongitudeChips);
    chips.push(...localLoc);
    chips.push(...localEmails);
    chips.push(...localEvent);
    chips.push(...localDate);
    chips.push(...localPerson);
    chips.push(...localOrg);
    chips.push(...localLanguage);

    const dateRangeChip = createDateRangeChip(localStartTime, localEndTime);
    if (dateRangeChip) {
      chips.push(dateRangeChip);
    }

    return [...new Set(chips)];
  };

  const displayChips = getDisplayChips();

  const filteredChips = displayChips.filter((chip) =>
    (typeof chip === "string" && chip.toLowerCase().includes(inputValue.toLowerCase())) ||
    (typeof chip === "number" && chip.toString().includes(inputValue))
  );

  // Add new chip when "Enter" is pressed
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

  // Remove chip from local state only
  const removeChip = (chipToRemove) => {
    // if (chipToRemove.includes(' to ')) {
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
    setLocalCaseIdChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalFileTypeChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalSentimentChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalTargetChips(prev => prev.filter(chip => chip.name !== chipToRemove));
    setLocalUnifiedTypeChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalEventTypeStringChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalMobileNumberChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalSocialmediaHashtagsChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalSocialmediaFromIdChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalSocialmediaFromScreenNameChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalServerIpChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalLatitudeChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalLongitudeChips(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalLoc(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalEmails(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalEvent(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalDate(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalPerson(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalOrg(prev => prev.filter(chip => chip !== chipToRemove));
    setLocalLanguage(prev => prev.filter(chip => chip !== chipToRemove));
  };

  // ✅ FIXED: Reset with proper cleanup
  const resetSearch = () => {
    console.log("🔄 Resetting search filters");

    // ✅ Clear local state
    setLocalKeywordChips([]);
    setLocalCaseIdChips([]);
    setLocalFileTypeChips([]);
    setLocalSentimentChips([]);
    setLocalTargetChips([]);
    setLocalStartTime(null);
    setLocalEndTime(null);
    setLocalUnifiedTypeChips([]);
    setLocalEventTypeStringChips([]);
    setLocalMobileNumberChips([]);
    setLocalSocialmediaHashtagsChips([]);
    setLocalSocialmediaFromIdChips([]);
    setLocalSocialmediaFromScreenNameChips([]);
    setLocalServerIpChips([]);
    setLocalLatitudeChips([]);
    setLocalLongitudeChips([]);
    setLocalLoc([]);
    setLocalEmails([]);
    setLocalEvent([]);
    setLocalDate([]);
    setLocalPerson([]);
    setLocalOrg([]);
    setLocalLanguage([]);
    setInputValue('');

    // ✅ Clear Redux state
    dispatch(clearCriteria());

    // ✅ Session storage flag
    sessionStorage.setItem("skipNextApiCall", "true");
    localStorage.removeItem("graphicalScrollPos");

    // ✅ Reset all flags - IMPORTANT!
    hasAutoSearched.current = false;
    hasInitialized.current = false;
    hasLoadedResults.current = false;
  };

  const handleSearch = async () => {
    try {
      // const finalKeywords = localKeywordChips.filter((chip) =>
      //   !chip.includes(' to ')
      // );
      const rangeDays = Number(window.runtimeConfig.VITE_APP_DEFAULT_RANGE_DAYS) || 180;
      const DEFAULT_END = new Date().toISOString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - rangeDays);
      const DEFAULT_START = startDate.toISOString();

      const payload = {
        keyword: localKeywordChips,
        case_id: localCaseIdChips,
        file_type: localFileTypeChips,
        sentiments: localSentimentChips,
        targets: localTargetChips.map(t => String(t.value)),
        unified_type: localUnifiedTypeChips,
        eventtypestring: localEventTypeStringChips,
        mobilenumber: localMobileNumberChips,
        socialmedia_hashtags: localSocialmediaHashtagsChips,
        socialmedia_from_id: localSocialmediaFromIdChips,
        socialmedia_from_screenname: localSocialmediaFromScreenNameChips,
        serverip: localServerIpChips,
        page: reduxPayload.page || 1,
        start_time: localStartTime || DEFAULT_START,
        end_time: localEndTime || DEFAULT_END,
        latitude: localLatitudeChips.length ? localLatitudeChips[0] : null,
        longitude: localLongitudeChips.length ? localLongitudeChips[0] : null,
        loc: localLoc, 
        emails: localEmails, 
        event: localEvent, 
        date: localDate, 
        person: localPerson, 
        org: localOrg, 
        language: localLanguage,
        size: 50
      };
      // console.log("payload sentimrny",payload)
      const isValid = (v) =>
        Array.isArray(v) ? v.length > 0 :
          typeof v === 'string' ? v.trim() !== '' :
            v !== null && v !== undefined;

      const filteredPayload = {};
      Object.entries(payload).forEach(([key, value]) => {
        if (isValid(value)) {
          filteredPayload[key] = value;
        }
      });

      console.log("🔍 Performing search with payload:", filteredPayload);

      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
        filteredPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      dispatch(setSearchResults({
        results: response.data.results,
        total_pages: response.data.total_pages || 1,
        total_results: response.data.total_results || 0,
      }));

      localStorage.removeItem("graphicalScrollPos");

      const keywordsPayload = {
        keyword: localKeywordChips,
        queryPayload: {
          case_id: payload.case_id || [],
          file_type: payload.file_type || [],
          keyword: payload.keyword || [],
          targets: localTargetChips || [],
          sentiment: payload.sentiments || [],
          start_time: payload.start_time,
          end_time: payload.end_time,
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          page: payload.page ?? 1,
          unified_type: payload.unified_type || [],
          eventtypestring: payload.eventtypestring || [],
          mobilenumber: payload.mobilenumber || [],
          socialmedia_hashtags: payload.socialmedia_hashtags || [],
          socialmedia_from_id: payload.socialmedia_from_id || [],
          socialmedia_from_screenname: payload.socialmedia_from_screenname || [],
          serverip: payload.serverip || [],
          loc: payload.loc || [],
          emails: payload.emails || [],
          event: payload.event || [],
          date: payload.date || [],
          person: payload.person || [],
          org: payload.org || [],
          language: payload.language || [],
        }
      };
      console.log("Keyword payload for sentiment0", payload.sentiments);
      console.log("💾 Saving search criteria to Redux:", keywordsPayload);
      dispatch(setKeywords(keywordsPayload));
      dispatch(setPage(1));

      // ✅ Mark as loaded after successful search
      hasLoadedResults.current = true;

    } catch (error) {
      console.error("❌ Error performing search:", error);
    }
  };

  const handleComponentChange = (key) => {
    if (activeComponent === key) return;
    setActiveComponent(key);
    const viewSegment = viewMap[key] || "graph";
    navigate(`/search/${viewSegment}`);
  };

  // ✅ Show loading state while rehydrating
  if (!_persistRehydrated) {
    return <div>Loading search filters...</div>;
  }

  return (
    <>
      <SearchUIContainer
        inputValue={inputValue}
        placeholder='Type a keyword, press Enter, and click Go icon to view the records'
        setInputValue={setInputValue}
        handleSearch={handleSearch}
        handleKeyPress={handleKeyPress}
        resetSearch={resetSearch}
        activeComponent={activeComponent}
        setActiveComponent={handleComponentChange}
        displayChips={filteredChips}
        chipCheckFunctions={[
          (chip) => localCaseIdChips.includes(chip),
          (chip) => localFileTypeChips.includes(chip),
          (chip) => localSentimentChips.includes(chip),
          (chip) => localTargetChips.some(t => t.name === chip),
          (chip) => localUnifiedTypeChips.includes(chip),
          (chip) => localEventTypeStringChips.includes(chip),
          (chip) => localMobileNumberChips.includes(chip),
          (chip) => localSocialmediaHashtagsChips.includes(chip),
          (chip) => localSocialmediaFromIdChips.includes(chip),
          (chip) => localSocialmediaFromScreenNameChips.includes(chip),
          (chip) => localServerIpChips.includes(chip),
          (chip) => localLatitudeChips.includes(chip),
          (chip) => localLongitudeChips.includes(chip),
          (chip) => localLoc.includes(chip),
          (chip) => localEmails.includes(chip),
          (chip) => localEvent.includes(chip),
          (chip) => localDate.includes(chip),
          (chip) => localPerson.includes(chip),
          (chip) => localOrg.includes(chip),
          (chip) => localLanguage.includes(chip),
          (chip) => chip.includes(' to ')
        ]}
        removeChip={removeChip}
        PopupComponent={AddNewCriteria}
        isPopupVisible={isPopupVisible}
        setIsPopupVisible={setIsPopupVisible}
        componentsMap={{
          graph: { icon: PieChart, component: <GrapghicalCriteria searchChips={displayChips} />, title: 'Graphical view' },
          list: { icon: ListAltOutlined, component: <CriteriaCaseTable searchChips={displayChips} chipsHeight={chipsHeight} setActiveView={activateResourceView} />, title: 'Tabular view' },
          photoVideo: { icon: FaPhotoVideo, component: <ScrollCriteriaViewer />, title: 'Resource view' },
          connectionView: { icon: HubOutlinedIcon, component: <ConnectionViewCriteria isFullscreen={true} />, title: 'Connection view' },
          mapView: { icon: PersonPinCircleIcon, component: <MapViewSearch />, title: 'Map view' }
        }}
        popupSearchChips={localKeywordChips}
      />
    </>
  );
};

export default SearchResults;