import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../PII/searchBar.module.css";
import { Search } from "react-bootstrap-icons";
import { toast } from 'react-toastify';
import "react-phone-input-2/lib/style.css";
import Select from 'react-select';
import { Box, Tooltip } from "@mui/material";
import AppButton from "../../Common/Buttton/button";
import { FaPhotoVideo } from "react-icons/fa";
import { PieChart } from "@mui/icons-material";
import CommonDateInput from '../../Common/DateField/DateField';
import CommonTextInput from '../../Common/MultiSelect/CommonTextInput';
import { sharedSxStyles } from '../FilterCriteria/createCriteria';
import DatePicker from "../FilterCriteria/datepicker";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { hashtagSearchClear, hashtagSearchFail, hashtagSearchRequest, hashtagSearchSuccess } from "../../../Redux/Action/hashtagAction";
import { useDispatch } from "react-redux";

const STORAGE_KEY = 'hashtagSearchState';

const HashtagSearchBar = ({ onOpenHistory }) => {
  const dispatch = useDispatch();
  const Token = Cookies.get("accessToken");
  
  // Default dates
 const getDefaultDates = () => {
  const now = new Date(); // ✅ browser timezone

  const today = new Date(now);
  today.setHours(23, 59, 59, 999);

  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);
  lastYear.setHours(0, 0, 0, 0);

  return {
    startDate: lastYear,
    endDate: today,

    // ✅ current browser time
    startTime: {
      hours: now.getHours(),
      minutes: now.getMinutes(),
    },
    endTime: {
      hours: now.getHours(),
      minutes: now.getMinutes(),
    },
  };
};


  // Load initial state from localStorage or use defaults
  const getInitialState = () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Convert date strings back to Date objects
        if (parsed.selectedDates) {
          parsed.selectedDates.startDate = parsed.selectedDates.startDate 
            ? new Date(parsed.selectedDates.startDate) 
            : null;
          parsed.selectedDates.endDate = parsed.selectedDates.endDate 
            ? new Date(parsed.selectedDates.endDate) 
            : null;
        }
        
        return {
          hashtag: parsed.hashtag || "",
          platform: parsed.platform || "X",
          selectedDates: parsed.selectedDates || getDefaultDates()
        };
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
    
    return {
      hashtag: "",
      platform: "X",
      selectedDates: getDefaultDates()
    };
  };

  const initialState = getInitialState();
  
  const [hashtag, setHashtag] = useState(initialState.hashtag);
  const [platform, setPlatform] = useState(initialState.platform);
  const [selectedDates, setSelectedDates] = useState(initialState.selectedDates);
  const [open, setOpen] = useState(false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const stateToSave = {
      hashtag,
      platform,
      selectedDates: {
        startDate: selectedDates.startDate?.toISOString(),
        endDate: selectedDates.endDate?.toISOString(),
        startTime: selectedDates.startTime,
        endTime: selectedDates.endTime
      }
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [hashtag, platform, selectedDates]);

  console.log("datesSelected", selectedDates);

  const togglePopupA = () => setOpen((p) => !p);

  const handleDateSelection = (dates) => {
    console.log('dates', dates);
    setSelectedDates(dates);
    setOpen(false);
  };

  const formatDate = (date) => {
    console.log('format', date);
    if (!date) return "No date selected";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const formatApiDateTime = (date, time) => {
    if (!date || !time) return "";

    const d = new Date(date);
    d.setHours(time.hours, time.minutes, 0, 0);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
  };

  const options = [
    { value: 'X', label: <span style={{ color: '#d2d2d2' }}>X</span> },
    { value: 'Instagram', label: <span style={{ color: '#d2d2d2' }}>Instagram</span> },
    { value: 'Facebook', label: <span style={{ color: '#d2d2d2' }}>Facebook</span> },
    { value: 'TikTok', label: <span style={{ color: '#d2d2d2' }}>TikTok</span> },
  ];
useEffect(() => {
  const handleStorageUpdate = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      setHashtag(parsed.hashtag || "");
      setPlatform(parsed.platform || "X");

      if (parsed.selectedDates) {
        setSelectedDates({
          startDate: parsed.selectedDates.startDate ? new Date(parsed.selectedDates.startDate) : null,
          endDate: parsed.selectedDates.endDate ? new Date(parsed.selectedDates.endDate) : null,
          startTime: parsed.selectedDates.startTime,
          endTime: parsed.selectedDates.endTime
        });
      }
    }
  };

  // Listen to custom event
  window.addEventListener("hashtag-storage-update", handleStorageUpdate);

  return () => {
    window.removeEventListener("hashtag-storage-update", handleStorageUpdate);
  };
}, []);
  const handleSearch = async () => {
    if (!hashtag || !selectedDates.startDate || !selectedDates.endDate) {
      toast.error("Please select hashtag & date range");
      return;
    }

    const payload = {
      start_time: formatApiDateTime(
        selectedDates.startDate,
        selectedDates.startTime
      ),
      end_time: formatApiDateTime(
        selectedDates.endDate,
        selectedDates.endTime
      ),
      hashtag: hashtag.startsWith("#") ? hashtag : `#${hashtag}`,
      platform: platform,
    };
    
    dispatch(hashtagSearchClear());
    dispatch(hashtagSearchRequest());
    console.log("FINAL PAYLOAD ✅", payload);

    try {
      const res = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/hashtag`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${Token}`
          },
        }
      );
      console.log("API RESPONSE:", res.data);
      dispatch(hashtagSearchSuccess(res.data));
    } catch (err) {
      dispatch(hashtagSearchFail(err.response?.data || err.message));
      toast.error(err.response?.data || err.message || "Search timeout or failed");
    }
  };

  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.searchBar} style={{ width: '80%', maxHeight: '80%' }}>
        <input
          className={styles.searchInput}
          type="text"
          value={hashtag}
          onChange={(e) => setHashtag(e.target.value)}
          placeholder={`Enter Hashtag to search`}
        />
        
        <Select
          isSearchable={false}
          className={styles.searchDropdown}
          options={options}
          value={options.find(o => o.value === platform)}
          onChange={(opt) => setPlatform(opt.value)}
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

        <div style={{ marginTop: '15px', minWidth:'200px' }}>
          <CommonDateInput
            placeholder="Select date range"
            value={
              selectedDates.startDate && selectedDates.endDate
                ? `${formatDate(selectedDates.startDate)} to ${formatDate(
                  selectedDates.endDate
                )}`
                : formatDate(selectedDates.startDate || selectedDates.endDate)
            }
            onClickIcon={() => setOpen(true)}
            sx={sharedSxStyles}
          />
        </div>
        
        <Search
          style={{ color: '#0073CF', cursor: 'pointer', width: '20px', height: '20px', minWidth: '20px', minHeight: '20px', alignSelf: 'center' }}
          onClick={handleSearch}
        />
      </div>

      <div className={styles.showRecentButtonWrapper}>
        <AppButton
          onClick={onOpenHistory}
          title="Show Hashtag History"
        >
          Show Recent
        </AppButton>
      </div>
      
      {open && (
        <DatePicker
          onSubmit={handleDateSelection}
          initialDates={selectedDates}
          onClose={togglePopupA}
        />
      )}
    </div>
  );
};

export default HashtagSearchBar;