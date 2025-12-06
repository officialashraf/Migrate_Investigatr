
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import styles from "./searchBar.module.css";
import { Search } from "react-bootstrap-icons";
import UserCards from "./cardDetails";
import { useDispatch, useSelector } from 'react-redux';
import { searchSuccess } from "../../../Redux/Action/piiAction";
import { toast } from 'react-toastify';
import validator from "validator";
import Cookies from 'js-cookie';
import Loader from "../Layout/loader";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from 'react-select';
import { PieChart } from "@mui/icons-material";
import { Typography, Box, Tooltip } from "@mui/material";
import { Table } from "react-bootstrap";
import tableStyless from "../../Common/Table/table.module.css";
import { FaPhotoVideo } from "react-icons/fa";
import AppButton from "../../Common/Buttton/button";
import SummaryView from "./SummaryView";
import ct from "countries-and-timezones";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import PIIHistoryPopup from './piiPopupHistory'

const ShowDetails = () => {
  const dispatch = useDispatch();
  const token = Cookies.get('accessToken');

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("phone number");
  const [nationalNumber, setNationalNumber] = useState("");
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [country, setCountry] = useState("in");
  const [piiMap, setPiiMap] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const initialLoad = useRef(true);

  // 🔥 Redux se data fetch karo
  const searchResults = useSelector(state => state.pii.data);
  const hasSearchResults = searchResults && searchResults.length > 0;

  // 🧠 **FIX 1: Last Search State ko Restore karo (Search Type + Query ONLY, Results NAHI)**
  useEffect(() => {
    if (!initialLoad.current) return;
    initialLoad.current = false;

    // Path restore
    const savedPath = localStorage.getItem("lastPIIPath");
    if (location.pathname === "/pii" && savedPath && savedPath !== "/pii") {
      navigate(savedPath, { replace: true });
    }

    // 🔥 Last search TYPE aur QUERY restore karo (Results NAHI)
    try {
      const savedSearchType = localStorage.getItem("piiSearchType");
      const savedQuery = localStorage.getItem("piiSearchQuery");

      if (savedSearchType) {
        setSearchType(savedSearchType);
      }

      if (savedQuery) {
        setQuery(savedQuery);
        setHasSearched(true); // Show karo ki search ho chuka tha
      }

      // ❌ Results localStorage se NAHI restore karenge
      // Redux me pehle se data hai to vo automatically show ho jayega
    } catch (error) {
      console.error("Error restoring search state:", error);
    }
  }, []);

  // 🧠 **FIX 2: Save Search Type jab change ho**
  useEffect(() => {
    if (initialLoad.current) return;
    
    localStorage.setItem("piiSearchType", searchType);
  }, [searchType]);

  // 🧠 **FIX 3: Save Query jab change ho**
  useEffect(() => {
    if (initialLoad.current) return;
    
    if (query) {
      localStorage.setItem("piiSearchQuery", query);
    }
  }, [query]);

  // ❌ Results ko localStorage me NAHI save karenge - Redux hi kaafi hai

  // 🧠 Save current path whenever it changes
  useEffect(() => {
    if (initialLoad.current) return;
    
    if (location.pathname.startsWith("/pii")) {
      localStorage.setItem("lastPIIPath", location.pathname);
    }
  }, [location.pathname]);

  // 🧠 Sync showSummary state with current route
  useEffect(() => {
    setShowSummary(location.pathname.includes("/summary-view"));
  }, [location.pathname]);

  // 🧠 Restore history state on mount
  useEffect(() => {
    const savedHistoryState = localStorage.getItem("piiHistoryOpen");
    if (savedHistoryState === "true") {
      setShowHistory(true);
    }
  }, []);

  // 🧠 Save history state whenever it changes
  useEffect(() => {
    localStorage.setItem("piiHistoryOpen", showHistory.toString());
  }, [showHistory]);

  // 🔥 FIX: Catalogue API sirf ek baar call ho (simple cache)
  useEffect(() => {
    const fetchMapping = async () => {
      try {
        // Check karo ki localStorage me catalogue hai ya nahi
        // const cachedCatalogue = localStorage.getItem("piiCatalogueMap");
        
        // // Agar cache hai, to use karo - API call NAHI hogi
        // if (cachedCatalogue) {
        //   setPiiMap(JSON.parse(cachedCatalogue));
        //   return;
        // }
        
        // Cache nahi hai, API call karo
        const token = Cookies.get("accessToken");
        const response = await axios.get(
          `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/pii-catalogues`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const map = {};
        response.data.forEach((item) => {
          if (item.column_name) {
            map[item.column_name] = {
              display_name: item.display_name || item.column_name,
              is_visible: item.is_visible !== false,
            };
          }
        });
        
        // State me set karo
        setPiiMap(map);
        
        // localStorage me cache karo
        // localStorage.setItem("piiCatalogueMap", JSON.stringify(map));
      } catch (err) {
        console.error("PII catalogue fetch failed:", err);
      }
    };

    fetchMapping();
  }, []);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const info = ct.getTimezone(tz);
      if (info?.countries) {
        setCountry(info.countries[0].toLowerCase());
      }
    } catch (err) {
      console.error("Timezone detection failed:", err);
      setCountry("in");
    }
  }, []);

  const getSummaryData = (dataArray = []) => {
  // If dataArray is invalid or empty, safely return an empty summary
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return { totalRecords: 0 };
  }

  // Handle piiMap safely (in case it's undefined or null)
  const allowedFields = piiMap
    ? Object.entries(piiMap)
        .filter(([_, val]) => val?.is_visible !== false)
        .map(([key]) => key)
    : [];

  // If allowedFields empty → fallback to keys from first record
  const allFields =
    Array.isArray(allowedFields) && allowedFields.length > 0
      ? allowedFields
      : (dataArray.length > 0 && typeof dataArray[0] === "object"
          ? Object.keys(dataArray[0])
          : []);

  // If still no valid fields, return empty summary
  if (allFields.length === 0) {
    return { totalRecords: dataArray.length };
  }

  const fieldSets = {};
  allFields.forEach((f) => (fieldSets[f] = new Set()));

  dataArray.forEach((item) => {
    allFields.forEach((field) => {
      const value = item?.[field];
      if (Array.isArray(value)) {
        value.forEach((v) => fieldSets[field].add(v));
      } else if (value !== null && value !== undefined && value !== "") {
        fieldSets[field].add(value);
      }
    });
  });

  const summary = {};
  allFields.forEach((field) => {
    summary[field] = Array.from(fieldSets[field]);
  });

  summary.totalRecords = dataArray.length;
  return summary;
};


  const summary = useMemo(() => getSummaryData(searchResults), [searchResults, piiMap]);

  const getHintMessage = () => {
    if (query.trim() || hasSearched) return null;

    switch (searchType) {
      case "phone number":
        return "Enter phone number to search";   
      default:
        return null;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString.substring(0, 10);
    }
  }

  const fetchPIIHistory = async () => {
    try {
      setHistoryLoading(true);
      const url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/pii/resources`;
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      let extractedList = [];
      if (Array.isArray(response.data)) {
        extractedList = response.data;
        extractedList.sort((a, b) => new Date(b.searched_on) - new Date(a.searched_on));
      }

      setHistoryList(extractedList);
      
      // 🔥 Cache karo localStorage me (simple)
      // localStorage.setItem("piiHistoryList", JSON.stringify(extractedList));
    } catch (err) {
      console.error("Error fetching PII history:", err);
      setHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchReportFile = async (item, format = "pdf") => {
    try {
      setDownloadingId(item.id);
      const token = Cookies.get("accessToken");
      const queryValue = encodeURIComponent(item.query);
      const endpoint = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/report-pii/${queryValue}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      let mimeType = "application/pdf";
      let payload = { type: "pdf" };

      if (format === "word" || format === "docx") {
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        payload = { type: "docx" };
      }

      const response = await axios.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "timezone": timezone,
        },
        responseType: "blob",
      });

      const filename = `Identity_Intelligence_Information_Report_for_${item.query || "idint_report"
        }.${format}`;

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading ${format.toUpperCase()}:`, error);
      toast.error(`Failed to download ${format.toUpperCase()}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSearchFromHistory = async (keyword) => {
    let detectedType = "phone number";

    if (validator.isEmail(keyword)) {
      detectedType = "email";
    } else if (/^[0-9+\-\s()]+$/.test(keyword)) {
      detectedType = "phone number";
    } else if (keyword.startsWith("@") || keyword.includes("instagram") || keyword.includes("twitter")) {
      detectedType = "social media id";
    } else {
      detectedType = "organization";
    }

    setSearchType(detectedType);
    setQuery(keyword);
    setShowHistory(false);
    setHasSearched(true);

    // 🔥 History se search hoga to API call HOGI (new search)
    const url = `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search-pii/${keyword}`;
    setLoading(true);

    try {
      const response = await axios.post(encodeURI(url), {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      // Redux me save karo
      dispatch(searchSuccess(response.data));
      
      // localStorage me query aur type save karo (Results NAHI)
      localStorage.setItem("piiSearchQuery", keyword);
      localStorage.setItem("piiSearchType", detectedType);
    } catch (err) {
      console.error("OpenSearch PII Error:", err);
      toast.error(err.response?.data?.detail || 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 **FIX 4: User manually search kare to HAMESHA API call hogi**
  const handleSearch = async () => {
    setHasSearched(true);

    if (!query.trim()) {
      toast.info("Please enter a search query");
      return;
    }

    if (searchType === "phone number") {
      const digitsOnly = nationalNumber.replace(/\D/g, "");
      
      const hasAlphabets = /[a-zA-Z]/.test(query);
      const hasInvalidSpecialChars = /[^0-9/\-+.]/.test(query);
      if (hasAlphabets || hasInvalidSpecialChars) {
        toast.info("Phone number must contain only digits");
        return;
      }
    }

    if (searchType === "email") {
      if (!validator.isEmail(query)) {
        toast.info("Please enter a valid email address");
        return;
      }
    }

    setShowHistory(false);
    setLoading(true);

    // 🔥 User ne manually search button dabaya - HAMESHA API call hogi
    let url = "";
    if (searchType === "email") {
      url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/pii/getEmailInfo/${query}`;
    } else if (searchType === "phone number") {
      url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/pii/getPhoneNumberInfo/${query.startsWith('+') ? query : '+' + query}`;
    } else if (searchType === "social media id") {
      url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/alias/${query}`;
    } else if (searchType === "organization") {
      url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/CompanyInfo/${query}`;
    }

    url = encodeURI(url);

    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      // Redux me save karo
      dispatch(searchSuccess(response.data));
      
      // ❌ Results localStorage me NAHI save karenge
      // ✅ Sirf query aur search type save karenge
      localStorage.setItem("piiSearchQuery", query);
      localStorage.setItem("piiSearchType", searchType);
      
      // History refresh karo
      await fetchPIIHistory();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 **FIX 5: History bhi simple cache check**
  // useEffect(() => {
  //   const loadHistory = async () => {
  //     try {
  //       // Check cache - agar hai to use karo
  //       const cachedHistory = localStorage.getItem("piiHistoryList");
        
  //       if (cachedHistory) {
  //         setHistoryList(JSON.parse(cachedHistory));
  //         return; // API call NAHI hogi
  //       }
        
  //       // Cache nahi hai, fetch karo
  //       await fetchPIIHistory();
  //     } catch (err) {
  //       console.error("Error loading history:", err);
  //     }
  //   };
    
  //   loadHistory();
  // }, []);

  const viewButtons = [
  {
    path: "/pii",
    icon: <FaPhotoVideo size={26} />,
    tooltip: "Resource View",
  },
  {
    path: "/pii/summary-view",
    icon: <PieChart size={30} />,
    tooltip: "Summary View",
  },
];

const tooltipStyle = {
  "& .MuiTooltip-tooltip": {
    width: "96%",
    backgroundColor: "#0e2c46",
    border: "1px solid #3b7fdaff",
    fontSize: "10.5px",
  },
  "& .MuiTooltip-arrow": {
    color: "rgba(0, 0, 0, 0.6)",
  },
};

  const options = [
    { value: 'phone number', label: <span style={{ color: '#d2d2d2' }}>Phone</span> },
    { value: 'email', label: <span style={{ color: '#d2d2d2' }}>Email</span> },
    { value: 'social media id', label: <span style={{ color: '#d2d2d2' }}>Social Media ID</span> },
    { value: 'organization', label: <span style={{ color: '#d2d2d2' }}>Organization</span> },
  ];

  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.leftColumn}>
          {/* 🔍 Search Bar Section */}
          <div className={styles.searchBarContainer}>
            <div className={styles.searchBar}>
              <Select
                isSearchable={false}
                className={styles.searchDropdown}
                options={options}
                value={options.find(o => o.value === searchType)}
                onChange={(selected) => {
                  setSearchType(selected.value);
                  setQuery('');
                  // Clear previous query when type changes
                  localStorage.removeItem("piiSearchQuery");
                }}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: '#080E17',
                    color: '#D9D9D9',
                    borderRadius: '15px',
                    border: 'none'
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9999,
                    backgroundColor: '#080E17',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    border: "1px solid #0073CF"
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? '#101D2B' : '#080E17',
                    color: '#D9D9D9',
                    cursor: 'pointer'
                  })
                }}
              />

              {searchType === "phone number" ? (
                <PhoneInput
                  country={country}
                  value={query}
                  onChange={(value, countryData) => {
                    setQuery(value);
                    setNationalNumber(value.replace("+" + countryData.dialCode, ""));
                  }}
                  enableSearch={true}
                  inputClass="search-input"
                  dropdownStyle={{
                    maxHeight: "160px",
                    overflowY: "scroll",
                    backgroundColor: "#080E17",
                    borderRadius: "15px",
                    color: "#D9D9D9",
                    border: "1px solid #0073CF !important"
                  }}
                  inputStyle={{
                    marginLeft: "50px",
                  }}
                  inputProps={{
                    onKeyDown: (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }
                  }}
                />
              ) : (
                <input
                  className={styles.searchInput}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuery(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  disabled={!searchType}
                  placeholder={`Enter ${searchType} to search`}
                />
              )}

              <Search
                style={{ color: '#0073CF', cursor: 'pointer', width: '20px', height: '20px', minWidth: '20px', minHeight: '20px', alignSelf: 'center' }}
                onClick={handleSearch}
              />
            </div>

          <div className={styles.showRecentButtonWrapper}>
  {viewButtons.map(({ path, icon, tooltip }) => {
    const isActive = location.pathname === path; 
    return (
      <Tooltip
        key={path}
        title={tooltip}
        placement="top"
        slotProps={{ popper: { sx: tooltipStyle } }}
      >
        <Box
          onClick={() => {
            if (!hasSearchResults) {
              toast.info(`Please perform a search to view ${tooltip.replace("Go to ", "")}.`);
              return;
            }
            navigate(path, { replace: true });
            setShowHistory(false);
          }}
          sx={{
            cursor: "pointer",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0073CF",
            border: isActive ? "1px solid #1e7df8" : "none",
            padding: "5px",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(0,115,207,0.1)",
            },
          }}
        >
          {icon}
        </Box>
      </Tooltip>
    );
  })}
              

              {/* Show/Hide History Button */}
              <AppButton
                onClick={() => {
                  fetchPIIHistory()
                  setShowHistory(prev => !prev);

                }}
                title={showHistory ? "Hide PII History" : "Show PII History"}
              >
                {showHistory ? "Hide Recent" : "Show Recent"}
              </AppButton>
            </div>
          </div>

          {/* Dynamic Hint Message */}
          {getHintMessage() && (
            <div style={{
              padding: '0px 8px 8px 8px',
              textAlign: 'center',
              width: '90%',
              color: 'rgb(148, 163, 184)',
              animation: 'fadeIn 0.3s ease-in'
            }}>
              {getHintMessage()}
            </div>
          )}

          {/* <div
            className={`${styles.historyWrapper} ${showHistory ? styles.expand : styles.collapse}`}
          >
            <div className={styles.historyContainer}>
              <Typography variant="h6" sx={{ color: '#0073CF', marginBottom: '8px', fontSize: '16px', paddingLeft: '5px' }}>
                PII History
              </Typography>

              {historyLoading ? (
                <Loader size={20} />
              ) : historyList.length > 0 ? (
                <div style={{ overflowY: 'auto', height: '200px' }}>
                  <Table hover className={tableStyless.table} style={{ width: "100%", tableLayout: "fixed" }}>
                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#101D2B" }}>
                      <tr>
                        <th className={tableStyless.th} style={{ width: "35%" }}>
                          <div className={tableStyless.thContent}><span>PII Resource</span></div>
                        </th>
                        <th className={tableStyless.th} style={{ width: "20%" }}>
                          <div className={tableStyless.thContent}><span>Status</span></div>
                        </th>
                        <th className={tableStyless.th} style={{ width: "25%" }}>
                          <div className={tableStyless.thContent}><span>Searched On</span></div>
                        </th>
                        <th className={tableStyless.th} style={{ width: "20%" }}>
                          <div className={tableStyless.thContent}><span>Print Record</span></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList.map((item, index) => (
                        <tr
                          key={index}
                          style={{
                            borderBottom: "1px solid #2a3f5f",
                            transition: "background-color 0.2s",
                            "--bs-table-hover-bg": "rgba(28, 46, 66, 0.5)",
                          }}
                        >
                          <td
                            style={{
                              padding: "10px 8px",
                              fontSize: "12px",
                              color: "#ccc",
                              textAlign: "left",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              wordBreak: "break-word",
                              cursor: "pointer",
                            }}
                            onClick={() => handleSearchFromHistory(item.query)}
                          >
                            {item.query || "-"}
                          </td>

                          <td style={{ padding: "10px 8px", fontSize: "12px", color: "#ccc", textAlign: "left" }}
                            onClick={() => handleSearchFromHistory(item.query)}>
                            {item.status || "-"}
                          </td>

                          <td style={{ padding: "10px 8px", fontSize: "12px", color: "#ccc", textAlign: "left" }}
                            onClick={() => handleSearchFromHistory(item.query)}>
                            {formatTime(item.searched_on)}
                          </td>

                          <td style={{ padding: "10px 8px", textAlign: "left" }}>
                            <Select
                              options={[
                                { value: "pdf", label: "PDF(.pdf)" },
                                { value: "word", label: "Word(.docx)" },
                              ]}
                              placeholder="Print Record"
                              isSearchable={false}
                              value={null}
                              onChange={(selected) => {
                                if (!selected) return;
                                fetchReportFile(item, selected.value);
                              }}
                              styles={{
                                container: (provided) => ({
                                  ...provided,
                                  width: "120px",
                                  display: "inline-block",
                                }),
                                control: (provided) => ({
                                  ...provided,
                                  minHeight: "24px",
                                  height: "24px",
                                  backgroundColor: "#0073CF",
                                  border: "1px solid #0073cf",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  color: "#fff",
                                  fontSize: "12px",
                                  padding: "0",
                                }),
                                valueContainer: (provided) => ({
                                  ...provided,
                                  padding: "0 0 0 5px",
                                  display: "flex",
                                  alignItems: "center",
                                }),
                                menu: (provided) => ({
                                  ...provided,
                                  backgroundColor: "#0e1825",
                                  borderRadius: "10px",
                                  color: "#fff",
                                  zIndex: 9999,
                                  border: '1px solid #0073CF'
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  backgroundColor: state.isFocused ? "#101D2B" : "#0e1825",
                                  color: "#fff",
                                  cursor: "pointer",
                                  borderRadius: "10px",
                                }),
                                singleValue: (provided) => ({
                                  ...provided,
                                  color: "#fff",
                                }),
                                placeholder: (provided) => ({
                                  ...provided,
                                  color: "#d9d9d9",
                                  fontSize: "12px",
                                }),
                                dropdownIndicator: (provided) => ({
                                  ...provided,
                                  color: "#fff",
                                  padding: "0 6px",
                                }),
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Typography variant="body2" sx={{ color: '#ccc', textAlign: 'center' }}>
                  No PII resources saved yet.
                </Typography>
              )}
              {historyList.length > 0 && (
                <div style={{ padding: "10px 0px", textAlign: "right", color: "#ccc", fontSize: "12px", borderTop: "1px solid #2a3f5f" }}>
                  Total PII Entries: {historyList.length}
                </div>
              )}
            </div>
          </div> */}
          <PIIHistoryPopup
        showPopup={showHistory}
        onClose={() => setShowHistory(false)}
        historyList={historyList}
        historyLoading={historyLoading}
        handleSearchFromHistory={handleSearchFromHistory}
        fetchReportFile={fetchReportFile}
        formatTime={formatTime}
        Loader={Loader}
        tableStyless={tableStyless}
      />

          <div className={styles.searchResultsContainer}>
            <div className={styles.searchresult}>
              <div className={styles.wrapper}>
                {loading ? (
                  <Loader />
                ) : (
                  <Outlet context={{ data: summary, piiMap, searchType, showHistory }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ShowDetails;

// import { useState, useEffect, useMemo, useRef } from "react";
// import axios from "axios";
// import styles from "./searchBar.module.css";
// import { Search } from "react-bootstrap-icons";
// import UserCards from "./cardDetails";
// import { useDispatch, useSelector } from 'react-redux';
// import { searchSuccess } from "../../../Redux/Action/piiAction";
// import { toast } from 'react-toastify';
// import validator from "validator";
// import Cookies from 'js-cookie';
// import Loader from "../Layout/loader";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import Select from 'react-select';
// import { Typography, Box, Tooltip } from "@mui/material";
// import { Table } from "react-bootstrap";
// import tableStyless from "../../Common/Table/table.module.css";
// import { FaPhotoVideo } from "react-icons/fa";
// import AppButton from "../../Common/Buttton/button";
// import SummaryView from "./SummaryView";
// import ct from "countries-and-timezones";
// import { Outlet, useLocation,useNavigate } from "react-router-dom";

// const ShowDetails = () => {
//   const dispatch = useDispatch();
//   const token = Cookies.get('accessToken');

//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [searchType, setSearchType] = useState("phone number");
//   const [nationalNumber, setNationalNumber] = useState("");
//   const [historyList, setHistoryList] = useState([]);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [downloadingId, setDownloadingId] = useState(null);
//   const [hasSearched, setHasSearched] = useState(false);
//   const [country, setCountry] = useState("in");
//   const [piiMap, setPiiMap] = useState({});
//    const location = useLocation();
//     const navigate = useNavigate();
//      const restoring = useRef(false);

//   // 🧠 Step 1: On mount — restore last sub-route if needed
//   useEffect(() => {
//     const last = localStorage.getItem("lastPIIPath");
//     if (location.pathname === "/pii" && last && last !== "/pii") {
//       restoring.current = true;
//       navigate(last, { replace: true });
//       // Reset flag slightly later so we don’t immediately overwrite
//       setTimeout(() => {
//         restoring.current = false;
//       }, 700);
//     }
//   }, []);

//   // 🧠 Step 2: Save current path to localStorage (only valid PII routes)
//   useEffect(() => {
//     // Don’t save while restoring or outside /pii
//     if (restoring.current) return;
//     if (!location.pathname.startsWith("/pii")) return;

//     // Don’t overwrite if we are exactly on /pii and we have a stored subpath
//     const last = localStorage.getItem("lastPIIPath");
//     if (location.pathname === "/pii" && last && last !== "/pii") return;

//     localStorage.setItem("lastPIIPath", location.pathname);
//   }, [location.pathname]);

//   useEffect(() => {
//     const fetchMapping = async () => {
//       try {
//         const token = Cookies.get("accessToken");
//         const response = await axios.get(
//           `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/pii-catalogues`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         const map = {};
//         response.data.forEach((item) => {
//           if (item.column_name) {
//             map[item.column_name] = {
//               display_name: item.display_name || item.column_name,
//               is_visible: item.is_visible !== false,
//             };
//           }
//         });
//         setPiiMap(map);
//       } catch (err) {
//         console.error("PII catalogue fetch failed:", err);
//       }
//     };

//     fetchMapping();
//   }, []);


//   useEffect(() => {
//     try {
//       // Get user's timezone
//       const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
//       console.log("Timezone info:", tz);
//       // Map timezone → country info
//       const info = ct.getTimezone(tz);
//       console.log("Timezone info:", info)
//       if (info?.countries) {
//         console.log("setcountery", info.countries.map(c => c.toLowerCase()));
//         setCountry(info.countries.map(c => c.toLowerCase()));
//       }
//     } catch (err) {
//       console.error("Timezone detection failed:", err);
//       setCountry("in");
//     }
//   }, []);



//   const [showSummary, setShowSummary] = useState(false); // Add this state
//   const searchResults = useSelector(state => state.pii.data);
//   const hasSearchResults = searchResults && searchResults.length > 0;

//   const getSummaryData = (dataArray) => {
//     if (!dataArray || dataArray.length === 0) return null;

//     // 🔹 Catalogue se unhi fields ko include karo jinke "show_in_reports" true hai
//     const allowedFields = Object.entries(piiMap)
//       .filter(([_, val]) => val.is_visible !== false)
//       .map(([key]) => key);

//     // Agar catalogue empty ho (API load na hui ho), fallback backend keys
//     const allFields = allowedFields.length
//       ? allowedFields
//       : Object.keys(dataArray[0]);

//     const fieldSets = {};
//     allFields.forEach(f => fieldSets[f] = new Set());

//     dataArray.forEach(item => {
//       allFields.forEach(field => {
//         const value = item[field];
//         if (Array.isArray(value)) value.forEach(v => fieldSets[field].add(v));
//         else if (value !== null && value !== undefined && value !== "") fieldSets[field].add(value);
//       });
//     });

//     const summary = {};
//     allFields.forEach(field => {
//       summary[field] = Array.from(fieldSets[field]);
//     });

//     summary.totalRecords = dataArray.length;
//     return summary;
//   };

//   const summary = useMemo(() => getSummaryData(searchResults), [searchResults, piiMap]);

//   // Dynamic hint message based on search type and query
//   const getHintMessage = () => {
//     if (query.trim() || hasSearched) return null; // Hide hint when user has entered value or already searched

//     switch (searchType) {
//       case "phone number":
//         return "Enter phone number to search";
//       default:
//         return null;
//     }
//   };

//   // Function to format timestamp
//   const formatTime = (isoString) => {
//     if (!isoString) return "-";
//     try {
//       return new Date(isoString).toLocaleString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       });
//     } catch (e) {
//       return isoString.substring(0, 10);
//     }
//   }

//   const fetchPIIHistory = async () => {
//     try {
//       const url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/pii/resources`;
//       const response = await axios.get(url, {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         }
//       });

//       let extractedList = [];
//       if (Array.isArray(response.data)) {
//         extractedList = response.data;
//         extractedList.sort((a, b) => new Date(b.searched_on) - new Date(a.searched_on));
//       }

//       setHistoryList(extractedList);
//     } catch (err) {
//       console.error("Error fetching PII history:", err);
//       setHistoryList([]);
//     }
//   };

//   const fetchReportFile = async (item, format = "pdf") => {
//     try {
//       setDownloadingId(item.id);
//       const token = Cookies.get("accessToken");
//       const queryValue = encodeURIComponent(item.query);
//       const endpoint = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/report-pii/${queryValue}`;
//       const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

//       let mimeType = "application/pdf";
//       let payload = { type: "pdf" };

//       if (format === "word" || format === "docx") {
//         mimeType =
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
//         payload = { type: "docx" };
//       }

//       const response = await axios.post(endpoint, payload, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           "timezone": timezone,
//         },
//         responseType: "blob",
//       });

//       const filename = `Personally_Identifiable_Information_Report_for_${item.query || "pii_report"
//         }.${format}`;

//       const blob = new Blob([response.data], { type: mimeType });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);

//       toast.success(`${format.toUpperCase()} downloaded successfully`);
//     } catch (error) {
//       console.error(`Error downloading ${format.toUpperCase()}:`, error);
//       toast.error(`Failed to download ${format.toUpperCase()}`);
//     } finally {
//       setDownloadingId(null);
//     }
//   };


//   const handleSearchFromHistory = async (keyword) => {
//     let detectedType = "phone number";

//     if (validator.isEmail(keyword)) {
//       detectedType = "email";
//     } else if (/^[0-9+\-\s()]+$/.test(keyword)) {
//       detectedType = "phone number";
//     } else if (keyword.startsWith("@") || keyword.includes("instagram") || keyword.includes("twitter")) {
//       detectedType = "social media id";
//     } else {
//       detectedType = "organization";
//     }

//     setSearchType(detectedType);
//     setQuery(keyword);
//     setShowHistory(false);
//     setHasSearched(true);

//     const url = `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search-pii/${keyword}`;
//     setLoading(true);

//     try {
//       const response = await axios.post(encodeURI(url), {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         }
//       });
//       dispatch(searchSuccess(response.data));
//       // toast.success(`Search results for ${detectedType}: ${keyword}`);
//       if (response.data && response.data.length > 0) {
//         setShowSummary(true);
//       }
//     } catch (err) {
//       console.error("OpenSearch PII Error:", err);
//       // dispatch({ type: "CLEAR_SEARCH" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async () => {
//     setHasSearched(true); // Mark that user has performed a search

//     if (searchType === "phone number") {
//       const digitsOnly = nationalNumber.replace(/\D/g, "");
//       setShowHistory(false);

//       if (!query.trim()) return;
//       if (searchType === "email") {
//         if (!validator.isEmail(query)) {
//           toast.info("Please enter a valid email address");
//           return;
//         }
//       }

//       const hasAlphabets = /[a-zA-Z]/.test(query);
//       const hasInvalidSpecialChars = /[^0-9/\-+.]/.test(query);
//       if (hasAlphabets || hasInvalidSpecialChars) {
//         toast.info("Phone number must contain only digits");
//         return;
//       }
//     }

//     setLoading(true);
//     let url = "";
//     if (searchType === "email") {
//       url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/pii/getEmailInfo/${query}`;
//     } else if (searchType === "phone number") {
//       url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/pii/getPhoneNumberInfo/${query.startsWith('+') ? query : '+' + query}`;
//     } else if (searchType === "social media id") {
//       url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/alias/${query}`;
//     } else if (searchType === "organization") {
//       url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/CompanyInfo/${query}`;
//     }

//     url = encodeURI(url);

//     try {
//       const response = await axios.get(url, {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         }
//       });
//       dispatch(searchSuccess(response.data));
//       await fetchPIIHistory();
//       if (response.data && response.data.length > 0) {
//         setShowSummary(true); // <-- Yeh line add kar do
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'Failed to search');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // dispatch({ type: "CLEAR_SEARCH" });
//     fetchPIIHistory();
//   }, [dispatch]);

// const toggleSummary = () => {
//   const nextPath = showSummary ? "/pii" : "/pii/summary-view";
//   localStorage.setItem("lastPIIPath", nextPath);
//   navigate(nextPath, { replace: true });
// };


//   const options = [
//     { value: 'phone number', label: <span style={{ color: '#d2d2d2' }}>Phone</span> },
//     { value: 'email', label: <span style={{ color: '#d2d2d2' }}>Email</span> },
//     { value: 'social media id', label: <span style={{ color: '#d2d2d2' }}>Social Media ID</span> },
//     { value: 'organization', label: <span style={{ color: '#d2d2d2' }}>Organization</span> },
//   ];

//   console.log("setcountry", country);
//   return (
//     <>
//       <div className={styles.mainContainer}>
//         <div className={styles.leftColumn}>
//           {/* 🔍 Search Bar Section */}
//           <div className={styles.searchBarContainer}>
//             <div className={styles.searchBar}>
//               <Select
//                 isSearchable={false}
//                 className={styles.searchDropdown}
//                 options={options}
//                 value={options.find(o => o.value === searchType)}
//                 onChange={(selected) => {
//                   setSearchType(selected.value);
//                   // dispatch({ type: "CLEAR_SEARCH" });
//                   setQuery('');
//                 }}
//                 styles={{
//                   control: (provided) => ({
//                     ...provided,
//                     backgroundColor: '#080E17',
//                     color: '#D9D9D9',
//                     borderRadius: '15px',
//                     border: 'none'
//                   }),
//                   menu: (provided) => ({
//                     ...provided,
//                     zIndex: 9999,
//                     backgroundColor: '#080E17',
//                     borderRadius: '15px',
//                     overflow: 'hidden',
//                     border: "1px solid #0073CF"
//                   }),
//                   option: (provided, state) => ({
//                     ...provided,
//                     backgroundColor: state.isFocused ? '#101D2B' : '#080E17',
//                     color: '#D9D9D9',
//                     cursor: 'pointer'
//                   })
//                 }}
//               />

//               {searchType === "phone number" ? (
//                 <PhoneInput
//                   country={country}
//                   value={query}
//                   onChange={(value, country) => {
//                     setQuery(value);
//                     setNationalNumber(value.replace("+" + country.dialCode, ""));
//                   }}
//                   enableSearch={true}
//                   inputClass="search-input"
//                   dropdownStyle={{
//                     maxHeight: "160px",
//                     overflowY: "scroll",
//                     backgroundColor: "#080E17",
//                     borderRadius: "15px",
//                     color: "#D9D9D9",
//                     border: "1px solid #0073CF !important"
//                   }}
//                   inputStyle={{
//                     marginLeft: "50px",
//                   }}
//                   inputProps={{
//                     onKeyDown: (e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         handleSearch();
//                       }
//                     }
//                   }}
//                 />
//               ) : (
//                 <input
//                   className={styles.searchInput}
//                   type="text"
//                   value={query}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     setQuery(val);
//                   }}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       handleSearch();
//                     }
//                   }}
//                   disabled={!searchType}
//                   placeholder={`Enter ${searchType} to search`}
//                 />
//               )}

//               <Search
//                 style={{ color: '#0073CF', cursor: 'pointer', width: '20px', height: '20px', minWidth: '20px', minHeight: '20px', alignSelf: 'center' }}
//                 onClick={handleSearch}
//               />
//             </div>

//             {/* <div className={styles.showRecentButtonWrapper}>
//               <AppButton
//                 onClick={() => setShowHistory(prev => !prev)}
//                 title={showHistory ? "Hide PII History" : "Show PII History"}
//               >
//                 {showHistory ? "Hide Recent" : "Show Recent"}
//               </AppButton>
//             </div> */}
//             <div className={styles.showRecentButtonWrapper}>
//               {/* Show PII History Button */}
//               <Tooltip
//                title={location.pathname.includes("summary-view")? "Resource View" : "Summary View"}

//                 placement="top"
//                 slotProps={{
//                   popper: {
//                     sx: {
//                       "& .MuiTooltip-tooltip": {
//                         width: "96%",
//                         backgroundColor: "#0e2c46",
//                         border: "1px solid  #3b7fdaff",
//                         fontSize: "10.5px",
//                       },
//                       "& .MuiTooltip-arrow": {
//                         color: "rgba(0, 0, 0, 0.6)",
//                       },
//                     },
//                   },
//                 }}
//               >
//                 <Box
//                   onClick={() => {
//                     if (!hasSearchResults) {
//                       toast.info("Please perform a search to view Resource Data/Summary.");
//                       return;
//                     }
//                   toggleSummary();
//                     setShowHistory(false);
//                   }}
//                   sx={{
//                     cursor: 'pointer',
//                     borderRadius: showSummary ? '50%' : '10px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     color: '#0073CF',
//                     transition: 'background-color 0.3s ease, border 0.3s ease, color 0.3s ease',
//                     border: showSummary ? '1px solid #1e7df8' : 'none',
//                     padding: showSummary ? '5px' : '0',
//                   }}
//                 >
//                   {showSummary ? (
//                     <FaPhotoVideo size={26} style={{ color: showSummary ? '#0073CF' : '#0073CF' }} />
//                   ) : (
//                     <FaPhotoVideo size={30} style={{ color: '#0073CF' }} />
//                   )}
//                 </Box>
//               </Tooltip>
//               <AppButton
//                 onClick={() => {
//                   setShowHistory(prev => !prev);
//                 }}
//                 title={showHistory ? "Hide PII History" : "Show PII History"}
//               >
//                 {showHistory ? "Hide Recent" : "Show Recent"}
//               </AppButton>


//             </div>

//           </div>

//           {/* Dynamic Hint Message */}
//           {getHintMessage() && (
//             <div style={{
//               padding: '0px 8px 8px 8px',
//               textAlign: 'center',
//               width: '90%',
//               color: 'rgb(148, 163, 184)',
//               animation: 'fadeIn 0.3s ease-in'
//             }}>
//               {getHintMessage()}
//             </div>
//           )}

//           <div
//             className={`${styles.historyWrapper} ${showHistory ? styles.expand : styles.collapse}`}
//           >
//             <div className={styles.historyContainer}>
//               <Typography variant="h6" sx={{ color: '#0073CF', marginBottom: '8px', fontSize: '16px', paddingLeft: '5px' }}>
//                 PII History
//               </Typography>

//               {historyLoading ? (
//                 <Loader size={20} />
//               ) : historyList.length > 0 ? (
//                 <div style={{ overflowY: 'auto', height: '200px' }}>
//                   <Table hover className={tableStyless.table} style={{ width: "100%", tableLayout: "fixed" }}>
//                     <thead style={{ position: "sticky", top: 0, backgroundColor: "#101D2B" }}>
//                       <tr>
//                         <th className={tableStyless.th} style={{ width: "35%" }}>
//                           <div className={tableStyless.thContent}><span>PII Resource</span></div>
//                         </th>
//                         <th className={tableStyless.th} style={{ width: "20%" }}>
//                           <div className={tableStyless.thContent}><span>Status</span></div>
//                         </th>
//                         <th className={tableStyless.th} style={{ width: "25%" }}>
//                           <div className={tableStyless.thContent}><span>Searched On</span></div>
//                         </th>
//                         <th className={tableStyless.th} style={{ width: "20%" }}>
//                           <div className={tableStyless.thContent}><span>Print Record</span></div>
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {historyList.map((item, index) => (
//                         <tr
//                           key={index}
//                           style={{
//                             borderBottom: "1px solid #2a3f5f",
//                             transition: "background-color 0.2s",
//                             "--bs-table-hover-bg": "rgba(28, 46, 66, 0.5)",
//                           }}
//                         >
//                           <td
//                             style={{
//                               padding: "10px 8px",
//                               fontSize: "12px",
//                               color: "#ccc",
//                               textAlign: "left",
//                               overflow: "hidden",
//                               textOverflow: "ellipsis",
//                               wordBreak: "break-word",
//                               cursor: "pointer",
//                             }}
//                             onClick={() => handleSearchFromHistory(item.query)}
//                           >
//                             {item.query || "-"}
//                           </td>

//                           <td style={{ padding: "10px 8px", fontSize: "12px", color: "#ccc", textAlign: "left" }}
//                             onClick={() => handleSearchFromHistory(item.query)}>
//                             {item.status || "-"}

//                           </td>

//                           <td style={{ padding: "10px 8px", fontSize: "12px", color: "#ccc", textAlign: "left" }}
//                             onClick={() => handleSearchFromHistory(item.query)}>
//                             {formatTime(item.searched_on)}
//                           </td>

//                           <td style={{ padding: "10px 8px", textAlign: "left" }}>
//                             <Select
//                               options={[
//                                 { value: "pdf", label: "PDF(.pdf)" },
//                                 { value: "word", label: "Word(.docx)" },
//                               ]}
//                               placeholder="Print Record"
//                               isSearchable={false}
//                               // always show placeholder instead of selected value
//                               value={null}
//                               onChange={(selected) => {
//                                 if (!selected) return;
//                                 fetchReportFile(item, selected.value);
//                               }}
//                               styles={{
//                                 container: (provided) => ({
//                                   ...provided,
//                                   width: "120px",
//                                   display: "inline-block",
//                                 }),
//                                 control: (provided) => ({
//                                   ...provided,
//                                   minHeight: "24px",
//                                   height: "24px",
//                                   backgroundColor: "#0073CF",
//                                   border: "1px solid #0073cf",
//                                   borderRadius: "8px",
//                                   cursor: "pointer",
//                                   color: "#fff",
//                                   fontSize: "12px",
//                                   padding: "0",
//                                 }),
//                                 valueContainer: (provided) => ({
//                                   ...provided,
//                                   padding: "0 0 0 5px",
//                                   display: "flex",
//                                   alignItems: "center",
//                                 }),
//                                 menu: (provided) => ({
//                                   ...provided,
//                                   backgroundColor: "#0e1825",
//                                   borderRadius: "10px",
//                                   color: "#fff",
//                                   zIndex: 9999,
//                                   border: '1px solid #0073CF'
//                                 }),
//                                 option: (provided, state) => ({
//                                   ...provided,
//                                   backgroundColor: state.isFocused ? "#101D2B" : "#0e1825",
//                                   color: "#fff",
//                                   cursor: "pointer",
//                                   borderRadius: "10px",
//                                 }),
//                                 singleValue: (provided) => ({
//                                   ...provided,
//                                   color: "#fff",
//                                 }),
//                                 placeholder: (provided) => ({
//                                   ...provided,
//                                   color: "#d9d9d9",
//                                   fontSize: "12px",
//                                 }),
//                                 dropdownIndicator: (provided) => ({
//                                   ...provided,
//                                   color: "#fff",
//                                   padding: "0 6px",
//                                 }),
//                               }}
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </div>
//               ) : (
//                 <Typography variant="body2" sx={{ color: '#ccc', textAlign: 'center' }}>
//                   No PII resources saved yet.
//                 </Typography>
//               )}
//               {historyList.length > 0 && (
//                 <div style={{ padding: "10px 0px", textAlign: "right", color: "#ccc", fontSize: "12px", borderTop: "1px solid #2a3f5f" }}>
//                   Total PII Entries: {historyList.length}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className={styles.searchResultsContainer}>
//             <div className={styles.searchresult}>
//               <div className={styles.wrapper}>
//                  {loading ? (
//     <Loader />
//   ) : (
//     <Outlet context={{ data:summary, piiMap, searchType, showHistory }} />
//   )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-5px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default ShowDetails;
