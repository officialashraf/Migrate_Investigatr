import { useEffect, useState } from "react";
import "./savedCriteriaGlobal.css";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import InputAdornment from "@mui/material/InputAdornment";
import { TextField } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import { sharedSxStyles } from "./createCriteria";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  clearCriteria,
  closePopup,
  openPopup,
  setKeywords,
  setPage,
  setSearchResults,
} from "../../../Redux/Action/criteriaAction";
import axios from "axios";
import Cookies from "js-cookie";
import Loader from "../Layout/loader";
import { toast } from "react-toastify";
import AddButton from "../../Common/Buttton/button";
import styles from "../../Common/Table/table.module.css";

const SavedCriteria = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Token = Cookies.get("accessToken");
  const activePopup = useSelector((state) => state.popup.activePopup);
  const { searchResults, totalResults } = useSelector((state) => state.search);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localKeywordChips, setLocalKeywordChips] = useState([]);
  const [localCaseIdChips, setLocalCaseIdChips] = useState([]);
  const [localFileTypeChips, setLocalFileTypeChips] = useState([]);
  const [localSentimentChips, setLocalSentimentChips] = useState([]);
  const [localTargetChips, setLocalTargetChips] = useState([]);
  const [localStartTime, setLocalStartTime] = useState(null);
  const [localEndTime, setLocalEndTime] = useState(null);
  const [localUnifiedType, setLocalUnifiedType] = useState([]);
  const [localEventTypeString, setLocalEventTypeString] = useState([]);
  const [localmobileNumbers, setLocalMobileNumbers] = useState([]);
  const [localsocialMediaHashtags, setLocalSocialMediaHashtags] = useState([]);
  const [localsocialFromId, setLocalSocialFromId] = useState([]);
  const [localsocialMediaFromScreenName, setLocalSocialMediaFromScreenName] =
    useState([]);
  const [localServerIp, setLocalServerIp] = useState([]);
  const [localLatitude, setLocalLatitude] = useState(null);
  const [localLongitude, setLocalLongitude] = useState(null);

  // Track which chips came from Redux vs user input
  const [reduxOriginatedChips, setReduxOriginatedChips] = useState(new Set());
  const [userInputChips, setUserInputChips] = useState(new Set());

  // Redux selectors
  const caseId = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.case_id || ""
  );
  const fileType = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.file_type || ""
  );
  const keyword = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.keyword || ""
  );
  const sentiments = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.sentiments || ""
  );
  const targets = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.targets || ""
  );
  const start_time = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.start_time || ""
  );
  const end_time = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.end_time || ""
  );
  const reduxPayload = useSelector(
    (state) => state.criteriaKeywords?.queryPayload || ""
  );

  const unified_type = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.unified_type || ""
  );
  const eventtypestring = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.eventtypestring || ""
  );
  const mobilenumber = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.mobilenumber || ""
  );
  const socialmedia_hashtags = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.socialmedia_hashtags || ""
  );
  const socialmedia_from_id = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.socialmedia_from_id || ""
  );
  const socialmedia_from_screenname = useSelector(
    (state) =>
      state.criteriaKeywords?.queryPayload?.socialmedia_from_screenname || ""
  );
  const serverip = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.serverip || ""
  );
  const latitude = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.latitude ?? null
  );
  const longitude = useSelector(
    (state) => state.criteriaKeywords?.queryPayload?.longitude ?? null
  );

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
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

  useEffect(() => {
    const newReduxChips = new Set();

    // const arr = v => (Array.isArray(v) ? [...v] : []);
    // const strArr = v => (v ? [String(v)] : []);

    const arr = (v) => {
      if (Array.isArray(v)) return [...v];
      if (typeof v === "string" && v.includes(","))
        return v.split(",").map((s) => s.trim());
      if (typeof v === "string" && v.trim() !== "") return [v.trim()];
      return [];
    };

    const strArr = (v) => {
      if (Array.isArray(v)) return [...v];
      if (typeof v === "string" && v.includes(","))
        return v.split(",").map((s) => s.trim());
      if (typeof v === "string" && v.trim() !== "") return [v.trim()];
      return [];
    };

    // core redux data
    const keywordChips = arr(keyword);
    const caseIdChips = arr(caseId).map(String);
    const fileTypeChips = arr(fileType);
    const sentimentChips = arr(sentiments);
    const targetChips = Array.isArray(targets)
      ? targets.map((t) => ({
          id: t.id,
          name: t.name,
          value: t.value ?? t.id,
          label: t.label ?? t.name,
        }))
      : [];

    // new fields
    const unifiedTypeChips = arr(unified_type);
    const eventTypeStringChips = arr(eventtypestring);
    const mobileNumberChips = arr(mobilenumber);
    const socialmediaHashtagChips = strArr(socialmedia_hashtags);
    const socialmediaFromIdChips = strArr(socialmedia_from_id);
    const socialmediaFromScreenNameChips = strArr(socialmedia_from_screenname);
    const serverIpChips = strArr(serverip);

    // local states update
    setLocalKeywordChips(keywordChips);
    setLocalCaseIdChips(caseIdChips);
    setLocalFileTypeChips(fileTypeChips);
    setLocalSentimentChips(sentimentChips);
    setLocalTargetChips(targetChips);
    setLocalStartTime(start_time);
    setLocalEndTime(end_time);

    setLocalUnifiedType(unifiedTypeChips);
    setLocalEventTypeString(eventTypeStringChips);
    setLocalMobileNumbers(mobileNumberChips);
    setLocalSocialMediaHashtags(socialmediaHashtagChips);
    setLocalSocialFromId(socialmediaFromIdChips);
    setLocalSocialMediaFromScreenName(socialmediaFromScreenNameChips);
    setLocalServerIp(serverIpChips);
    setLocalLatitude(latitude ?? null);
    setLocalLongitude(longitude ?? null);

    // track redux originated chips
    [
      ...keywordChips,
      ...caseIdChips,
      ...fileTypeChips,
      ...sentimentChips,
      ...targetChips.map((t) => t.name),
      ...unifiedTypeChips,
      ...eventTypeStringChips,
      ...mobileNumberChips,
      ...socialmediaHashtagChips,
      ...socialmediaFromIdChips,
      ...socialmediaFromScreenNameChips,
      ...serverIpChips,
    ].forEach((c) => newReduxChips.add(c));

    const dateRangeChip = createDateRangeChip(start_time, end_time);
    if (dateRangeChip) newReduxChips.add(dateRangeChip);
    if (latitude !== null && latitude !== undefined) {
      newReduxChips.add(String(latitude)); 
    }
    if (longitude !== null && longitude !== undefined) {
      newReduxChips.add(String(longitude)); 
    }

    setReduxOriginatedChips(newReduxChips);
  }, [
    keyword,
    caseId,
    fileType,
    sentiments,
    targets,
    start_time,
    end_time,
    unified_type,
    eventtypestring,
    mobilenumber,
    socialmedia_hashtags,
    socialmedia_from_id,
    socialmedia_from_screenname,
    serverip,
    latitude, // Add new dependencies
    longitude,
  ]);

  // Generate display chips from local state
  const getDisplayChips = () => {
    const chips = [];
     // // Add all local chips
    // chips.push(...localKeywordChips);
    // chips.push(...localCaseIdChips);
    // chips.push(...localFileTypeChips);
    // chips.push(...localSentimentChips);
    // chips.push(...localTargetChips.map(t => t.name)); // Show target name in chips

    // chips.push(...localUnifiedType); // Assuming local state name is unifiedTypes
    // chips.push(...localEventTypeString);
    // chips.push(...localmobileNumbers);
    // chips.push(...localsocialMediaHashtags);
    // chips.push(...localsocialFromId);
    // chips.push(...localsocialMediaFromScreenName);
    // chips.push(...localServerIp);

    if (localKeywordChips.length) chips.push(...localKeywordChips);
    if (localCaseIdChips.length) chips.push(...localCaseIdChips);
    if (localFileTypeChips.length) chips.push(...localFileTypeChips);
    if (localSentimentChips.length) chips.push(...localSentimentChips);
    if (localTargetChips.length)
      chips.push(...localTargetChips.map((t) => t.name));
    if (localUnifiedType.length) chips.push(...localUnifiedType);
    if (localEventTypeString.length) chips.push(...localEventTypeString);
    if (localmobileNumbers.length) chips.push(...localmobileNumbers);
    if (localsocialMediaHashtags.length)
      chips.push(...localsocialMediaHashtags);
    if (localsocialFromId.length) chips.push(...localsocialFromId);
    if (localsocialMediaFromScreenName.length)
      chips.push(...localsocialMediaFromScreenName);
    if (localServerIp.length) chips.push(...localServerIp);
    if (localLatitude !== null && localLatitude !== undefined) {
      chips.push(String(localLatitude));
    }
    if (localLongitude !== null && localLongitude !== undefined) {
      chips.push(String(localLongitude));
    }

    // Add time range chip if both exist
    const dateRangeChip = createDateRangeChip(localStartTime, localEndTime);
    if (dateRangeChip) {
      chips.push(dateRangeChip);
    }

    return [...new Set(chips)]; // Remove duplicates
  };

  // Function to determine chip style based on origin
  const getChipStyle = (chip) => {
    // User entered chips are always blue
    if (userInputChips.has(chip)) {
      return { backgroundColor: "#0073cf", color: "white" }; // Blue for user entered
    }

    // Redux originated chips are yellow
    if (reduxOriginatedChips.has(chip)) {
      return { backgroundColor: "#ffd700", color: "#000" }; // Yellow for Redux originated
    }

    // Default (fallback)
    return { backgroundColor: "#0073cf", color: "white" };
  };

  const displayResults = searchResults;
  const searchChips = getDisplayChips();
  console.log("searchChips", searchChips);

  // Filter results based on user input
  const filterResults = (chips, query) => {
    if (!chips.length && !query) {
      return displayResults; // Show full list if no filters
    }

    const lowerQuery = query.toLowerCase();
    return displayResults.filter(
      (item) =>
        chips.some((chip) => matchesSearch(item, chip)) ||
        matchesSearch(item, lowerQuery)
    );
  };

  // Get filtered results based on current search chips and input
  const getFilteredResults = () => {
    if (!displayResults || displayResults.length === 0) {
      return [];
    }
    return filterResults(searchChips, inputValue);
  };

  // Checks if ANY field matches the search query
  const matchesSearch = (item, query) => {
    if (!item) return false;
    const lowerQuery = String(query).toLowerCase();
    return (
      item.unified_case_id?.join(", ").toLowerCase().includes(lowerQuery) ||
      item.status?.toLowerCase().includes(lowerQuery) ||
      item.site_keywordsmatched?.toLowerCase().includes(lowerQuery) ||
      item.unified_activity_title?.toLowerCase().includes(lowerQuery) ||
      item.unified_type?.toLowerCase().includes(lowerQuery)
    );
  };

  if (activePopup !== "saved") return null;

  // Handle Enter key press - Add to local keyword chips and track as user input
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      const newKeyword = inputValue.trim();

      // Check if already exists
      if (localKeywordChips.includes(newKeyword)) {
        setInputValue("");
        return;
      }

      setLocalKeywordChips((prev) => [...prev, newKeyword]);

      // Track as user input chip
      setUserInputChips((prev) => new Set([...prev, newKeyword]));

      setInputValue("");
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
  };

  // Remove chip from local state and update tracking sets
  const removeChip = (chipToRemove) => {
    console.log("Removing chip:", chipToRemove);

    // Handle date range chips
    // if (chipToRemove.includes(" to ")) {
    //   setLocalStartTime(null);
    //   setLocalEndTime(null);
    //   // Remove from tracking sets
    //   setReduxOriginatedChips((prev) => {
    //     const newSet = new Set(prev);
    //     newSet.delete(chipToRemove);
    //     return newSet;
    //   });
    //   return;
    // }
    const isDateRange = typeof chipToRemove === 'string' &&
      (chipToRemove.match(/^\d{2}\/\d{2}\/\d{4}\s+to\s+\d{2}\/\d{2}\/\d{4}$/) || // "01/01/2024 to 31/12/2024"
        chipToRemove.match(/^From\s+\d{2}\/\d{2}\/\d{4}$/) ||                    // "From 01/01/2024"
        chipToRemove.match(/^Until\s+\d{2}\/\d{2}\/\d{4}$/));                    // "Until 31/12/2024"

    if (isDateRange) {
      setLocalStartTime(null);
      setLocalEndTime(null);
      // Remove from tracking sets (if you're using this)
      if (typeof setReduxOriginatedChips === 'function') {
        setReduxOriginatedChips((prev) => {
          const newSet = new Set(prev);
          newSet.delete(chipToRemove);
          return newSet;
        });
      }
      return;
    }

    // Remove from appropriate local array
    setLocalKeywordChips((prev) =>
      prev.filter((chip) => chip !== chipToRemove)
    );
    setLocalCaseIdChips((prev) => prev.filter((chip) => chip !== chipToRemove));
    setLocalFileTypeChips((prev) =>
      prev.filter((chip) => chip !== chipToRemove)
    );
    setLocalSentimentChips((prev) =>
      prev.filter((chip) => chip !== chipToRemove)
    );
    setLocalTargetChips((prev) =>
      prev.filter((chip) => chip.name !== chipToRemove)
    );

    setLocalUnifiedType((prev) => prev.filter((chip) => chip !== chipToRemove));
    setLocalEventTypeString((prev) =>
      prev.filter((chip) => chip !== chipToRemove)
    );
    setLocalMobileNumbers((prev) =>
      prev.filter((chip) => chip !== chipToRemove)
    );
    setLocalSocialMediaHashtags((prev) =>
      prev.filter((chip) => chip !== chipToRemove)
    );
    setLocalSocialFromId((prev) =>
      prev.filter((chip) => chip !== chipToRemove)
    );
    setLocalSocialMediaFromScreenName((prev) =>
      prev.filter((chip) => chip !== chipToRemove)
    );
    setLocalServerIp((prev) => prev.filter((chip) => chip !== chipToRemove));

    // FIX: Check if latitude/longitude matches the chip before setting to null
    if (localLatitude !== null && String(localLatitude) === chipToRemove) {
      setLocalLatitude(null);
    }
    if (localLongitude !== null && String(localLongitude) === chipToRemove) {
      setLocalLongitude(null);
    }

    // Remove from tracking sets
    setReduxOriginatedChips((prev) => {
      const newSet = new Set(prev);
      newSet.delete(chipToRemove);
      return newSet;
    });
    setUserInputChips((prev) => {
      const newSet = new Set(prev);
      newSet.delete(chipToRemove);
      return newSet;
    });
  };

  // Reset function - clear both local state and Redux
  const resetSearch = () => {
    // Check if there's any data to reset
    const hasLocalData =
      localKeywordChips.length > 0 ||
      localCaseIdChips.length > 0 ||
      localFileTypeChips.length > 0 ||
      localSentimentChips.length > 0 ||
      localTargetChips.length > 0 ||
      localStartTime ||
      localEndTime ||
      localLatitude !== null ||
      localLongitude !== null;

    const hasReduxData = Object.keys(reduxPayload).length > 0;

    if (!hasLocalData && !hasReduxData) {
      toast.info("Data not available");
      return;
    }

    // Clear both local state and Redux
    setLocalKeywordChips([]);
    setLocalCaseIdChips([]);
    setLocalFileTypeChips([]);
    setLocalSentimentChips([]);
    setLocalTargetChips([]);
    setLocalStartTime(null);
    setLocalEndTime(null);
    setInputValue("");

    setLocalUnifiedType([]);
    setLocalEventTypeString([]);
    setLocalMobileNumbers([]);
    setLocalSocialMediaHashtags("");
    setLocalSocialFromId("");
    setLocalSocialMediaFromScreenName("");
    setLocalServerIp("");
    setLocalLatitude(null);
    setLocalLongitude(null);
    // Clear tracking sets
    setReduxOriginatedChips(new Set());
    setUserInputChips(new Set());

    dispatch(clearCriteria());
    toast.success("Search reset successfully");
  };

  // Main search function using local state
  const handleSearch = async () => {
    console.log("Local state for search:");
    console.log("localKeywordChips:", localKeywordChips);
    console.log("localCaseIdChips:", localCaseIdChips);
    console.log("localFileTypeChips:", localFileTypeChips);
    console.log("localSentimentChips:", localSentimentChips);
    console.log("localTargetChips:", localTargetChips);

    // Check if there's any data to search using local state
    const hasLocalKeywords = localKeywordChips.length > 0;
    const hasLocalCaseIds = localCaseIdChips.length > 0;
    const hasLocalFileTypes = localFileTypeChips.length > 0;
    const hasLocalSentiments = localSentimentChips.length > 0;
    const hasLocalTargets = localTargetChips.length > 0;
    const hasLocalDates = localStartTime || localEndTime;

    const hasLocalUnifiedType = localUnifiedType.length > 0;
    const hasLocalEventTypeString = localEventTypeString.length > 0;
    const hasLocalMobileNumbers = localmobileNumbers.length > 0;
    const hasLocalSocialMediaHashtags = localsocialMediaHashtags.length > 0;
    const hasLocalSocialFromId = localsocialFromId.length > 0;
    const hasLocalSocialMediaFromScreenName =
      localsocialMediaFromScreenName.length > 0;
    const hasLocalServerIp = localServerIp.length > 0;
    const hasLocalLatitude = localLatitude !== null && localLatitude !== undefined;
    const hasLocalLongitude = localLongitude !== null && localLongitude !== undefined;

    if (
      !hasLocalKeywords &&
      !hasLocalCaseIds &&
      !hasLocalFileTypes &&
      !hasLocalSentiments &&
      !hasLocalTargets &&
      !hasLocalDates &&
      !hasLocalUnifiedType &&
      !hasLocalEventTypeString &&
      !hasLocalMobileNumbers &&
      !hasLocalSocialMediaHashtags &&
      !hasLocalSocialFromId &&
      !hasLocalSocialMediaFromScreenName &&
      !hasLocalServerIp &&
      !hasLocalLatitude &&
      !hasLocalLongitude
    ) {
      toast.info("Please enter keywords or select criteria to search");
      return;
    }

    setIsLoading(true);

    try {
      // Use local state for search payload
      const payload = {
        keyword: localKeywordChips,
        case_id: localCaseIdChips,
        file_type: localFileTypeChips,
        sentiments: localSentimentChips,
        targets: localTargetChips.map((t) => String(t.value)), // Send value to API
        unified_type: localUnifiedType,
        eventtypestring: localEventTypeString,
        mobilenumber: localmobileNumbers,
        socialmedia_hashtags: localsocialMediaHashtags,
        socialmedia_from_id: localsocialFromId,
        socialmedia_from_screenname: localsocialMediaFromScreenName,
        serverip: localServerIp,
        page: reduxPayload.page || 1,
        start_time: localStartTime || null,
        end_time: localEndTime || null,
        latitude: localLatitude || null,
        longitude: localLongitude || null,
         size: 50,
      };

      const isValid = (v) =>
        Array.isArray(v)
          ? v.length > 0
          : typeof v === "string"
          ? v.trim() !== ""
          : v !== null && v !== undefined;

      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => isValid(value))
      );

      console.log("Sending search query:", filteredPayload);

      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
        filteredPayload,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${Token}`,
          },
        }
      );
      setIsLoading(false);

      // Update Redux with search results
      dispatch(
        setSearchResults({
          results: response.data.results,
          total_pages: response.data.total_pages || 1,
          total_results: response.data.total_results || 0,
        })
      );

      // Update Redux with current local state
      dispatch(
        setKeywords({
          keyword: localKeywordChips,
          queryPayload: {
            case_id: localCaseIdChips,
            file_type: localFileTypeChips,
            keyword: localKeywordChips,
            targets: localTargetChips,
            sentiment: localSentimentChips,
            unified_type: localUnifiedType,
            eventtypestring: localEventTypeString,
            mobilenumber: localmobileNumbers,
            socialmedia_hashtags: localsocialMediaHashtags,
            socialmedia_from_id: localsocialFromId,
            socialmedia_from_screenname: localsocialMediaFromScreenName,
            serverip: localServerIp,
            start_time: localStartTime,
            end_time: localEndTime,
            latitude: localLatitude,
            longitude: localLongitude,
            page: 1,
          },
        })
      );

      // After successful search, mark current user input chips as Redux originated
      const currentDisplayChips = getDisplayChips();
      const newReduxChips = new Set([...reduxOriginatedChips]);

      // Add all current chips to Redux originated (since they're now stored in Redux)
      userInputChips.forEach((chip) => {
        if (currentDisplayChips.includes(chip)) {
          newReduxChips.add(chip);
        }
      });

      setReduxOriginatedChips(newReduxChips);
      setUserInputChips(new Set()); // Clear user input tracking

      dispatch(setPage(1));
      const arr = (v) => (Array.isArray(v) ? [...v] : []);
    } catch (error) {
      console.error("Error performing search:", error.message);
      setIsLoading(false);
    }
  };

  const ViewScreen = () => {
    navigate("/search");
    dispatch(closePopup());
  };

  // Get the filtered results to display
  const resultsToDisplay = getFilteredResults();

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-content">
          <h5>
            Search Result{" "}
            <span>
              {" "}
              <button
                className="close-icon"
                onClick={() => dispatch(closePopup())}
              >
                &times;
              </button>
            </span>
          </h5>
          <div>
            <div style={{ marginBottom: "10px" }}>
              <style>
                {`
                    input::placeholder {
                      color: white !important;
                      opacity: 1 !important;
                    }
                  `}
              </style>
              <TextField
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "#0073cf" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <SendIcon
                        style={{
                          cursor: isLoading ? "default" : "pointer",
                          color: "#0073cf",
                          marginRight: "5px",
                        }}
                        onClick={isLoading ? null : handleSearch}
                      />
                      <TuneIcon
                        style={{ cursor: "pointer", color: "#0073cf" }}
                        onClick={() => dispatch(openPopup("create"))}
                      />
                    </InputAdornment>
                  ),
                  style: {
                    height: "38px",
                    padding: "10px",
                    color: "white",
                    border: "1px solid #0073CF",
                    borderRadius: "15px",
                  },
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
                className={styles.searchBar}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search..."
                autoComplete="off"
                sx={sharedSxStyles}
              />
            </div>
            <div>
              <div className="search-term-indicator">
                <div className="chips-container">
                  {searchChips?.map((chip) => {
                    const chipStyle = getChipStyle(chip);

                    return (
                      <div
                        key={chip}
                        className="search-chip"
                        style={{
                          ...chipStyle,
                          padding: "4px 8px",
                          borderRadius: "12px",
                          margin: "2px",
                          display: "inline-flex",
                          alignItems: "center",
                          fontSize: "12px",
                        }}
                      >
                        <span>{chip}</span>
                        <button
                          className="chip-delete-btn"
                          onClick={() => removeChip(chip)}
                          style={{
                            background: "none",
                            border: "none",
                            marginLeft: "4px",
                            cursor: "pointer",
                            color: chipStyle.color,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <CloseIcon style={{ fontSize: "15px" }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="action-buttons">
                  <button className="action-button" onClick={resetSearch}>
                    Reset
                  </button>
                </div>
              </div>

              <div className="tabs">
                <div
                  className={`tab active`}
                  // onClick={() => setActiveTab('Cases')}
                  style={{ backgroundColor: "#101D2B" }}
                >
                  Cases ({totalResults || 0})
                </div>
              </div>

              <div className="search-results">
                {isLoading ? (
                  <Loader />
                ) : resultsToDisplay.length > 0 ? (
                  resultsToDisplay.slice(-5).map((item, index) => (
                    <div key={index} className="result-card">
                      <div className="card-id">
                        {item.unified_case_id?.join(", ") || "N/A"}
                      </div>
                      <div className="card-header">
                        <div className="card-text">
                          {item.site_keywordsmatched || "N/A"}
                        </div>
                        <div className="status-badge">
                          {item.status || "NEW"}
                        </div>
                      </div>
                      <div className="card-subtext">
                        {item.unified_type || "N/A"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card-subtext">❌ No Matched Data</div>
                )}
                <AddButton style={{ marginLeft: "0px" }} onClick={ViewScreen}>
                  View All Results In Full Screen
                </AddButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedCriteria

// import { useEffect, useState } from 'react';
// import './savedCriteriaGlobal.css';
// import SearchIcon from '@mui/icons-material/Search';
// import CloseIcon from '@mui/icons-material/Close';
// import InputAdornment from '@mui/material/InputAdornment';
// import { TextField } from '@mui/material';
// import TuneIcon from '@mui/icons-material/Tune';
// import { sharedSxStyles } from "./createCriteria";
// import SendIcon from '@mui/icons-material/Send';
// import { useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from "react-redux";
// import { clearCriteria, closePopup, openPopup, setKeywords, setPage, setSearchResults } from '../../../Redux/Action/criteriaAction';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import Loader from '../Layout/loader';
// import { toast } from 'react-toastify';
// import AddButton from '../../Common/Buttton/button';
// import styles from '../../Common/Table/table.module.css'

// const SavedCriteria = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const Token = Cookies.get('accessToken');
//   const activePopup = useSelector((state) => state.popup.activePopup);
//   const { searchResults, totalResults } = useSelector((state) => state.search);
//   const [inputValue, setInputValue] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [localKeywordChips, setLocalKeywordChips] = useState([]);
//   const [localCaseIdChips, setLocalCaseIdChips] = useState([]);
//   const [localFileTypeChips, setLocalFileTypeChips] = useState([]);
//   const [localSentimentChips, setLocalSentimentChips] = useState([]);
//   const [localTargetChips, setLocalTargetChips] = useState([]);
//   const [localStartTime, setLocalStartTime] = useState(null);
//   const [localEndTime, setLocalEndTime] = useState(null);
//   // Track which chips came from Redux vs user input
//   const [reduxOriginatedChips, setReduxOriginatedChips] = useState(new Set());
//   const [userInputChips, setUserInputChips] = useState(new Set());

//   // Redux selectors
//   const caseId = useSelector((state) => state.criteriaKeywords?.queryPayload?.case_id || '');
//   const fileType = useSelector((state) => state.criteriaKeywords?.queryPayload?.file_type || '');
//   const keyword = useSelector((state) => state.criteriaKeywords?.queryPayload?.keyword || '');
//   const sentiments = useSelector((state) => state.criteriaKeywords?.queryPayload?.sentiments || '');
//   const targets = useSelector((state) => state.criteriaKeywords?.queryPayload?.targets || '');
//   const start_time = useSelector((state) => state.criteriaKeywords?.queryPayload?.start_time || '');
//   const end_time = useSelector((state) => state.criteriaKeywords?.queryPayload?.end_time || '');
//   const reduxPayload = useSelector((state) => state.criteriaKeywords?.queryPayload || '');

//   // Helper function to format date
//   const formatDate = (dateString) => {
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

//   // Sync local state with Redux state and track Redux originated chips
//   useEffect(() => {
//     const newReduxChips = new Set();

//     // Update local state from Redux and track Redux originated chips
//     const keywordChips = Array.isArray(keyword) ? [...keyword] : [];
//     const caseIdChips = Array.isArray(caseId) ? [...caseId.map(id => String(id))] : [];
//     const fileTypeChips = Array.isArray(fileType) ? [...fileType] : [];
//     const sentimentChips = Array.isArray(sentiments) ? [...sentiments] : [];
//     const targetChips = Array.isArray(targets) && targets.length > 0
//       ? targets.map(t => ({
//         id: t.id,
//         name: t.name,
//         value: t.value ?? t.id,
//         label: t.label ?? t.name
//       }))
//       : [];

//     setLocalKeywordChips(keywordChips);
//     setLocalCaseIdChips(caseIdChips);
//     setLocalFileTypeChips(fileTypeChips);
//     setLocalSentimentChips(sentimentChips);
//     setLocalTargetChips(targetChips);
//     setLocalStartTime(start_time);
//     setLocalEndTime(end_time);

//     // Track all Redux originated chips
//     keywordChips.forEach(chip => newReduxChips.add(chip));
//     caseIdChips.forEach(chip => newReduxChips.add(chip));
//     fileTypeChips.forEach(chip => newReduxChips.add(chip));
//     sentimentChips.forEach(chip => newReduxChips.add(chip));
//     targetChips.forEach(t => newReduxChips.add(t.name));

//     // Add date range chip if exists
//     const dateRangeChip = createDateRangeChip(start_time, end_time);
//     if (dateRangeChip) {
//       newReduxChips.add(dateRangeChip);
//     }

//     setReduxOriginatedChips(newReduxChips);

//   }, [keyword, caseId, fileType, sentiments, targets, start_time, end_time]);

//   // Generate display chips from local state
//   const getDisplayChips = () => {
//     const chips = [];

//     // Add all local chips
//     chips.push(...localKeywordChips);
//     chips.push(...localCaseIdChips);
//     chips.push(...localFileTypeChips);
//     chips.push(...localSentimentChips);
//     chips.push(...localTargetChips.map(t => t.name)); // Show target name in chips

//     // Add time range chip if both exist
//     const dateRangeChip = createDateRangeChip(localStartTime, localEndTime);
//     if (dateRangeChip) {
//       chips.push(dateRangeChip);
//     }

//     return [...new Set(chips)]; // Remove duplicates
//   };

//   // Function to determine chip style based on origin
//   const getChipStyle = (chip) => {
//     // User entered chips are always blue
//     if (userInputChips.has(chip)) {
//       return { backgroundColor: '#0073cf', color: 'white' }; // Blue for user entered
//     }

//     // Redux originated chips are yellow
//     if (reduxOriginatedChips.has(chip)) {
//       return { backgroundColor: '#ffd700', color: '#000' }; // Yellow for Redux originated
//     }

//     // Default (fallback)
//     return { backgroundColor: '#0073cf', color: 'white' };
//   };

//   const displayResults = searchResults;
//   const searchChips = getDisplayChips();
//   console.log("searchChips", searchChips);

//   // Filter results based on user input
//   const filterResults = (chips, query) => {
//     if (!chips.length && !query) {
//       return displayResults; // Show full list if no filters
//     }

//     const lowerQuery = query.toLowerCase();
//     return displayResults.filter((item) =>
//       chips.some((chip) => matchesSearch(item, chip)) || matchesSearch(item, lowerQuery)
//     );
//   };

//   // Get filtered results based on current search chips and input
//   const getFilteredResults = () => {
//     if (!displayResults || displayResults.length === 0) {
//       return [];
//     }
//     return filterResults(searchChips, inputValue);
//   };

//   // Checks if ANY field matches the search query
//   const matchesSearch = (item, query) => {
//     if (!item) return false;
//     const lowerQuery = String(query).toLowerCase();
//     return (
//       item.unified_case_id?.join(", ").toLowerCase().includes(lowerQuery) ||
//       item.status?.toLowerCase().includes(lowerQuery) ||
//       item.site_keywordsmatched?.toLowerCase().includes(lowerQuery) ||
//       item.unified_activity_title?.toLowerCase().includes(lowerQuery) ||
//       item.unified_type?.toLowerCase().includes(lowerQuery)
//     );
//   };

//   if (activePopup !== "saved") return null;

//   // Handle Enter key press - Add to local keyword chips and track as user input
//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && inputValue.trim() !== "") {
//       e.preventDefault();
//       const newKeyword = inputValue.trim();

//       // Check if already exists
//       if (localKeywordChips.includes(newKeyword)) {
//         setInputValue("");
//         return;
//       }

//       setLocalKeywordChips(prev => [...prev, newKeyword]);

//       // Track as user input chip
//       setUserInputChips(prev => new Set([...prev, newKeyword]));

//       setInputValue("");
//     }
//   };

//   // Handle input change
//   const handleInputChange = (e) => {
//     const query = e.target.value;
//     setInputValue(query);
//   };

//   // Remove chip from local state and update tracking sets
//   const removeChip = (chipToRemove) => {
//     console.log("Removing chip:", chipToRemove);

//     // Handle date range chips
//     if (chipToRemove.includes(' to ')) {
//       setLocalStartTime(null);
//       setLocalEndTime(null);
//       // Remove from tracking sets
//       setReduxOriginatedChips(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(chipToRemove);
//         return newSet;
//       });
//       return;
//     }

//     // Remove from appropriate local array
//     setLocalKeywordChips(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalCaseIdChips(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalFileTypeChips(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalSentimentChips(prev => prev.filter(chip => chip !== chipToRemove));
//     setLocalTargetChips(prev => prev.filter(chip => chip.name !== chipToRemove));

//     // Remove from tracking sets
//     setReduxOriginatedChips(prev => {
//       const newSet = new Set(prev);
//       newSet.delete(chipToRemove);
//       return newSet;
//     });
//     setUserInputChips(prev => {
//       const newSet = new Set(prev);
//       newSet.delete(chipToRemove);
//       return newSet;
//     });
//   };

//   // Reset function - clear both local state and Redux
//   const resetSearch = () => {
//     // Check if there's any data to reset
//     const hasLocalData = localKeywordChips.length > 0 || localCaseIdChips.length > 0 ||
//       localFileTypeChips.length > 0 || localSentimentChips.length > 0 ||
//       localTargetChips.length > 0 || localStartTime || localEndTime;

//     const hasReduxData = Object.keys(reduxPayload).length > 0;

//     if (!hasLocalData && !hasReduxData) {
//       toast.info("Data not available");
//       return;
//     }

//     // Clear both local state and Redux
//     setLocalKeywordChips([]);
//     setLocalCaseIdChips([]);
//     setLocalFileTypeChips([]);
//     setLocalSentimentChips([]);
//     setLocalTargetChips([]);
//     setLocalStartTime(null);
//     setLocalEndTime(null);
//     setInputValue('');

//     // Clear tracking sets
//     setReduxOriginatedChips(new Set());
//     setUserInputChips(new Set());

//     dispatch(clearCriteria());
//     toast.success("Search reset successfully");
//   };

//   // Main search function using local state
//   const handleSearch = async () => {
//     console.log("Local state for search:");
//     console.log("localKeywordChips:", localKeywordChips);
//     console.log("localCaseIdChips:", localCaseIdChips);
//     console.log("localFileTypeChips:", localFileTypeChips);
//     console.log("localSentimentChips:", localSentimentChips);
//     console.log("localTargetChips:", localTargetChips);

//     // Check if there's any data to search using local state
//     const hasLocalKeywords = localKeywordChips.length > 0;
//     const hasLocalCaseIds = localCaseIdChips.length > 0;
//     const hasLocalFileTypes = localFileTypeChips.length > 0;
//     const hasLocalSentiments = localSentimentChips.length > 0;
//     const hasLocalTargets = localTargetChips.length > 0;
//     const hasLocalDates = localStartTime || localEndTime;

//     if (!hasLocalKeywords && !hasLocalCaseIds && !hasLocalFileTypes &&
//       !hasLocalSentiments && !hasLocalTargets && !hasLocalDates) {
//       toast.info("Please enter keywords or select criteria to search");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Use local state for search payload
//       const payload = {
//         keyword: localKeywordChips,
//         case_id: localCaseIdChips,
//         file_type: localFileTypeChips,
//         sentiments: localSentimentChips,
//         targets: localTargetChips.map(t => String(t.value)), // Send value to API
//         page: reduxPayload.page || 1,
//         start_time: localStartTime || null,
//         end_time: localEndTime || null,
//         latitude: reduxPayload.latitude || null,
//         longitude: reduxPayload.longitude || null,
//         size:50
//       };

//       const isValid = (v) =>
//         Array.isArray(v) ? v.length > 0 :
//           typeof v === 'string' ? v.trim() !== '' :
//             v !== null && v !== undefined;

//       const filteredPayload = Object.fromEntries(
//         Object.entries(payload).filter(([_, value]) => isValid(value))
//       );

//       console.log("Sending search query:", filteredPayload);

//       const response = await axios.post(
//         `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
//         filteredPayload,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${Token}`
//           }
//         }
//       );
//       setIsLoading(false);

//       // Update Redux with search results
//       dispatch(setSearchResults({
//         results: response.data.results,
//         total_pages: response.data.total_pages || 1,
//         total_results: response.data.total_results || 0,
//       }));

//       // Update Redux with current local state
//       dispatch(setKeywords({
//         keyword: localKeywordChips,
//         queryPayload: {
//           case_id: localCaseIdChips,
//           file_type: localFileTypeChips,
//           keyword: localKeywordChips,
//           targets: localTargetChips,
//           sentiment: localSentimentChips,
//           start_time: localStartTime,
//           end_time: localEndTime,
//           latitude: payload.latitude,
//           longitude: payload.longitude,
//           page: 1
//         }
//       }));

//       // After successful search, mark current user input chips as Redux originated
//       const currentDisplayChips = getDisplayChips();
//       const newReduxChips = new Set([...reduxOriginatedChips]);

//       // Add all current chips to Redux originated (since they're now stored in Redux)
//       userInputChips.forEach(chip => {
//         if (currentDisplayChips.includes(chip)) {
//           newReduxChips.add(chip);
//         }
//       });

//       setReduxOriginatedChips(newReduxChips);
//       setUserInputChips(new Set()); // Clear user input tracking

//       dispatch(setPage(1));

//     } catch (error) {
//       console.error("Error performing search:", error.message);
//       setIsLoading(false);
//     }
//   };

//   const ViewScreen = () => {
//     navigate('/search');
//     dispatch(closePopup());
//   };

//   // Get the filtered results to display
//   const resultsToDisplay = getFilteredResults();

//   return (
//     <div className="popup-overlay">
//       <div className="popup-container">
//         <div className="popup-content">
//           <h5>Search Result <span> <button className="close-icon" onClick={() => dispatch(closePopup())}>
//             &times;
//           </button></span></h5>
//           <div>
//             <div style={{ marginBottom: '10px' }}>
//                <style>
//                   {`
//                     input::placeholder {
//                       color: white !important;
//                       opacity: 1 !important;
//                     }
//                   `}
//                 </style>
//               <TextField
//                 fullWidth
//                 InputProps={{

//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon style={{ color: '#0073cf' }} />
//                     </InputAdornment>
//                   ),
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <SendIcon
//                         style={{ cursor: isLoading ? 'default' : 'pointer', color: '#0073cf', marginRight: '5px' }}
//                         onClick={isLoading ? null : handleSearch}
//                       />
//                       <TuneIcon
//                         style={{ cursor: 'pointer', color: '#0073cf' }}
//                         onClick={() => dispatch(openPopup("create"))}
//                       />
//                     </InputAdornment>
//                   ),
//                   style: {
//                     height: '38px',
//                     padding: '10px',
//                     color: 'white',
//                     border: '1px solid #0073CF',
//                     borderRadius: '15px',
//                   },
//                 }}
//                 inputProps={{
//                   style: {
//                     padding: '0px',
//                   },
//                 }}
//                 className={styles.searchBar}
//                 type="text"
//                 value={inputValue}
//                 onChange={handleInputChange}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Search..."
//                 autoComplete="off"
//                 sx={sharedSxStyles}
//               />
//             </div>
//             <div>
//               <div className="search-term-indicator">
//                 <div className="chips-container">
//                   {searchChips?.map((chip) => {
//                     const chipStyle = getChipStyle(chip);

//                     return (
//                       <div
//                         key={chip}
//                         className="search-chip"
//                         style={{
//                           ...chipStyle,
//                           padding: "4px 8px",
//                           borderRadius: "12px",
//                           margin: "2px",
//                           display: "inline-flex",
//                           alignItems: "center",
//                           fontSize: "12px"
//                         }}
//                       >
//                         <span>{chip}</span>
//                         <button
//                           className="chip-delete-btn"
//                           onClick={() => removeChip(chip)}
//                           style={{
//                             background: "none",
//                             border: "none",
//                             marginLeft: "4px",
//                             cursor: "pointer",
//                             color: chipStyle.color,
//                             display: "flex",
//                             alignItems: "center"
//                           }}
//                         >
//                           <CloseIcon style={{ fontSize: "15px" }} />
//                         </button>
//                       </div>
//                     );
//                   })}
//                 </div>


//                 <div className="action-buttons">
//                   <button
//                     className="action-button"
//                     onClick={resetSearch}
//                   >
//                     Reset
//                   </button>
//                 </div>
//               </div>

//               <div className="tabs">
//                 <div
//                   className={`tab active`}
//                   // onClick={() => setActiveTab('Cases')}
//                   style={{ backgroundColor: "#101D2B" }}
//                 >
//                   Cases ({totalResults || 0})

//                 </div>
//               </div>

//               <div className="search-results">
//                 {isLoading ? (
//                   <Loader />
//                 ) : resultsToDisplay.length > 0 ? (
//                   resultsToDisplay.slice(-5).map((item, index) => (
//                     <div key={index} className="result-card">

//                       <div className="card-id">{item.unified_case_id?.join(", ") || "N/A"}</div>
//                       <div className="card-header">
//                         <div className="card-text">{item.site_keywordsmatched || "N/A"}</div>
//                         <div className="status-badge">{item.status || 'NEW'}</div>
//                       </div>
//                       <div className="card-subtext">{item.unified_type || "N/A"}</div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="card-subtext">❌ No Matched Data</div>
//                 )}
//                 <AddButton style={{ marginLeft: '0px' }} onClick={ViewScreen}>
//                   View All Results In Full Screen
//                 </AddButton>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SavedCriteria;