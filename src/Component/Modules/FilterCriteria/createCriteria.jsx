
import { useState, useEffect } from "react";
import DatePickera from "./datepicker";
import { Search, Send, Tune } from "@mui/icons-material";
import {
  Checkbox,
  FormControlLabel,
  InputAdornment,
  TextField,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  closePopup,
  openPopup,
  setKeywords,
  setPage,
  setSearchResults,
} from "../../../Redux/Action/criteriaAction";
import Confirm from "./confirmCriteria";
import { toast } from "react-toastify";
import { useAutoFocusWithManualAutofill } from "../../../utils/autoFocus";
import styles from "../../Common/Table/table.module.css";
import customSelectStyles from "../../Common/CustomStyleSelect/customSelectStyles";
import CommonMultiSelect from "../../Common/MultiSelect/CommonMultiSelect";
import CommonDateInput from "../../Common/DateField/DateField";
import PropTypes from "prop-types";
import CommonTextInput from "../../Common/MultiSelect/CommonTextInput";

export const sharedSxStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
  "& .MuiInputBase-root": {
    boxShadow: "none",
  },
  "& .MuiOutlinedInput-input": {
    fontSize: "12px",
    color: "rgb(224, 219, 219)",
    fontFamily: "Roboto, sans-serif",
    fontWeight: "normal",
  },
};

const CreateCriteria = ({ handleCreateCase }) => {
  const { inputRef, isReadOnly, handleFocus } =
    useAutoFocusWithManualAutofill();
  const Token = Cookies.get("accessToken");
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    searchQuery: "",
    datatype: [],
    filetype: [],
    caseIds: [],
    targets: [],
    sentiment: [],
    unified_type: [],
    eventtypestring: [],
    mobilenumber: [],
    socialmedia_hashtags: [],
    socialmedia_from_id: [],
    socialmedia_from_screenname: [],
    serverip: [],
    includeArchived: false,
    latitude: "",
    longitude: "",
  });
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [showPopupD, setShowPopupD] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
    startTime: { hours: 16, minutes: 30 },
    endTime: { hours: 16, minutes: 30 },
  });
  const [caseOptions, setCaseOptions] = useState([]);
  const [fileTypeOptions, setFileTypeOptions] = useState([]);
  const [targetOptions, setTargetOptions] = useState([]);
  const [sentimentOptions, setSentimentOptions] = useState([]);
  // new fields
  const [unifiedtype, setunifiedtype] = useState([]);
  const [eventtypestring, seteventtypestring] = useState([]);
  const [mobilenumbers, setmobilenumbers] = useState([]);
  const [socialmediahashtags, setsocialmediahashtags] = useState([]);
  const [socialmediafromid, setsocialmediafromid] = useState([]);
  const [socialmediafromscreenname, setsocialmediafromscreenname] = useState(
    []
  );
  const [serverip, setserverip] = useState([]);
  const activePopup = useSelector((state) => state.popup?.activePopup || null);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        const response = await axios.get(
          `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case`,
          {
            headers: {
              "Content-Type": "application/json",
              'Authorization':` Bearer ${Token}`,
            },
          }
        );

        // Format the response data for react-select
        const caseOptionsFormatted = response.data.data.map((caseItem) => ({
          value: caseItem.id,
          label: `CASE${String(caseItem.id).padStart(4, "0")} - ${
            caseItem.title || "Untitled"
          }`,
        }));

        setCaseOptions(caseOptionsFormatted);
      } catch (error) {
        console.error("Error fetching case data:", error);
      }
    };

    // Fetch file types from API
    const fetchFileTypes = async () => {
      try {
        const response = await axios.get(
`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/platforms`,
          {
            headers: {
              'Authorization':`Bearer ${Token}`,
            },
          }
        );
        console.log("response", response.data.data);
        const fileTypeOptionsFormatted = response.data.data.map((platform) => ({
          value: platform,
          label: platform,
        }));

        setFileTypeOptions(fileTypeOptionsFormatted);
      } catch (error) {
        console.error("Error fetching file types:", error);
      }
    };

    const fetchTargetOptions = async () => {
      try {
        const response = await axios.post(
`${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/distinct`,
          {
            fields: [
              "targets",
              "sentiment",
              "unified_record_type",
              "unified_type",
              "eventtypestring",
              "mobilenumber",
              "socialmedia_hashtags",
              "socialmedia_from_id",
              "socialmedia_from_screenname",
              "serverip",
              "phone_numbers"
            ],
          },
          {
            headers: {
              'Authorization': `Bearer ${Token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const fileTypeOptionsFormatted =
          response?.data?.unified_record_type.buckets.map((b) => ({
            value: b.key,
            label: b.key,
          }));

        const sentimentBuckets = response.data?.sentiment?.buckets || [];

        const targetIds = response.data?.targets?.buckets
          .map((b) => parseInt(b.key, 10))
          .filter((id) => !isNaN(id));

        const formattedSentiments = sentimentBuckets.map((bucket) => ({
          value: bucket.key,
          label: bucket.key,
        }));

        // unified type
        const unified_typeBuckets = response.data?.unified_type?.buckets || [];
        const formattedunified_types = unified_typeBuckets.map((bucket) => ({
          value: bucket.key,
          label: bucket.key,
        }));
        setunifiedtype(formattedunified_types);

        // social media hashtags
        const socialmedia_hashtagsBuckets =
          response?.data?.socialmedia_hashtags.buckets || [];
        const formattedsocialmedia_hashtagsBuckets =
          socialmedia_hashtagsBuckets.map((bucket) => ({
            value: bucket.key,
            label: bucket.key,
          }));
        setsocialmediahashtags(formattedsocialmedia_hashtagsBuckets);

        // social media From ID
        const socialmedia_from_idBuckets =
          response?.data?.socialmedia_from_id.buckets || [];
        const formattedsocialmedia_from_idBuckets =
          socialmedia_from_idBuckets.map((bucket) => ({
            value: bucket.key,
            label: bucket.key,
          }));
        setsocialmediafromid(formattedsocialmedia_from_idBuckets);

        // socialmedia_from_screenname
        const socialmedia_from_screennameBuckets =
          response.data?.socialmedia_from_screenname?.buckets || [];
        const formattedsocialmedia_from_screennameBuckets =
          socialmedia_from_screennameBuckets.map((bucket) => ({
            value: bucket.key,
            label: bucket.key,
          }));
        setsocialmediafromscreenname(
          formattedsocialmedia_from_screennameBuckets
        );

        // serverip
        const serveripBuckets = response.data?.serverip?.buckets || [];
        const formattedserverip = serveripBuckets.map((bucket) => ({
          value: bucket.key,
          label: bucket.key,
        }));
        setserverip(formattedserverip);

        // eventtypestring
        const eventTypeBuckets = response.data?.eventtypestring?.buckets || [];
        const formattedeventtypestrings = eventTypeBuckets.map((bucket) => ({
          value: bucket.key,
          label: bucket.key,
        }));
        seteventtypestring(formattedeventtypestrings);

        // mobilenumber
      
        const formattedmobilenumbers = [
                        ...(response.data.mobilenumber?.buckets || []),
                        ...(response.data.phone_numbers?.buckets || [])
                    ].map(b => ({
                        value: b.key,
                        label: b.key
                    }));
        setmobilenumbers(formattedmobilenumbers);

        let tOpts = [];
        if (targetIds.length > 0) {
          const targetRes = await axios.post(
            `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/target-names`,
            { target_ids: targetIds },
            { headers: { 'Authorization': `Bearer ${Token}` } }
          );
          tOpts = targetRes.data.map((t) => ({
            value: t.id,
            label: `TAR${String(t.id).padStart(4, "0")} - ${t.name || " "}`,
            name: t.name,
          }));
        }
        setFileTypeOptions(fileTypeOptionsFormatted);
        setTargetOptions(tOpts);
        setSentimentOptions(formattedSentiments);
        setunifiedtype(formattedunified_types);
        setsocialmediahashtags(formattedsocialmedia_hashtagsBuckets);
        setsocialmediafromid(formattedsocialmedia_from_idBuckets);
        setsocialmediafromscreenname(
          formattedsocialmedia_from_screennameBuckets
        );
        setserverip(formattedserverip);
        seteventtypestring(formattedeventtypestrings);
        setmobilenumbers(formattedmobilenumbers);
      } catch (error) {
        console.error("Failed to fetch target options:", error);
      }
    };

    fetchCaseData();
    fetchTargetOptions();
  }, [Token]);
  useEffect(() => {
    const isSearchQueryEmpty =
      !formData.searchQuery || formData.searchQuery.length === 0;
    const isCaseIdsEmpty = !formData.caseIds || formData.caseIds.length === 0;
    const isFileTypeEmpty =
      !formData.filetype || formData.filetype.length === 0;
    const isLatitudeEmpty = !formData.latitude;
    const isLongitudeEmpty = !formData.longitude;

    const nothingFilled =
      isSearchQueryEmpty &&
      isCaseIdsEmpty &&
      isFileTypeEmpty &&
      isLatitudeEmpty &&
      isLongitudeEmpty;

    if (nothingFilled && formData.includeArchived) {
      setFormData((prev) => ({ ...prev, includeArchived: false }));
      setShowSavePopup(false); // Close the save popup as well
    }
  }, [formData]);
  const handleSaveCriteriaChange = (e) => {
    e.preventDefault();

    const isSearchQueryEmpty =
      !formData.searchQuery ||
      (Array.isArray(formData.searchQuery) &&
        formData.searchQuery.length === 0) ||
      (typeof formData.searchQuery === "string" &&
        formData.searchQuery.trim() === "");
    const isCaseIdsEmpty = !formData.caseIds || formData.caseIds.length === 0;
    const isFileTypeEmpty =
      !formData.filetype || formData.filetype.length === 0;
    const isLatitudeEmpty =
      !formData.latitude || formData.latitude.trim() === "";
    const isLongitudeEmpty =
      !formData.longitude || formData.longitude.trim() === "";
    const isDateEmpty = !selectedDates.startDate && !selectedDates.endDate;

    const isAnyFieldFilled = !(
      isSearchQueryEmpty &&
      isCaseIdsEmpty &&
      isFileTypeEmpty &&
      isLatitudeEmpty &&
      isLongitudeEmpty &&
      isDateEmpty
    );

    const isChecked = e.target.checked;

    if (isChecked) {
      if (!isAnyFieldFilled) {
        toast.error(
          "Please select at least one search criteria before saving."
        );
        // Do not check the checkbox or open popup if validation fails
        return;
      }
      setFormData((prev) => ({ ...prev, includeArchived: true }));
      setShowSavePopup(true); // Open the popup
    } else {
      // Close the popup and reset form state when unchecked
      setFormData((prev) => ({ ...prev, includeArchived: false }));
      setShowSavePopup(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "searchQuery") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(",").map((keyword) => keyword), // Split by commas and trim extra spaces
      }));
    } else {
      // For other inputs, handle normally
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const commonOnChange = (e) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value.split(",").map((item) => item.trim()),
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    // Validation: check if all relevant fields are empty
    const isSearchQueryEmpty =
      !formData.searchQuery ||
      (Array.isArray(formData.searchQuery) &&
        formData.searchQuery.length === 0) ||
      (typeof formData.searchQuery === "string" &&
        formData.searchQuery.trim() === "");
    const isCaseIdsEmpty = !formData.caseIds || formData.caseIds.length === 0;
    const isFileTypeEmpty =
      !formData.filetype || formData.filetype.length === 0;
    const isLatitudeEmpty =
      !formData.latitude || formData.latitude.trim() === "";
    const isLongitudeEmpty =
      !formData.longitude || formData.longitude.trim() === "";
    const isDateEmpty = !selectedDates.startDate && !selectedDates.endDate;

    if (
      isSearchQueryEmpty &&
      isCaseIdsEmpty &&
      isFileTypeEmpty &&
      isLatitudeEmpty &&
      isLongitudeEmpty &&
      isDateEmpty
    ) {
      toast.error(
        "Please enter at least one search criteria before searching."
      );
      return;
    }
    try {
      const payload = {
        keyword: formData.searchQuery?.length > 0 ? formData.searchQuery : [],
        case_id:
          formData.caseIds?.length > 0
            ? formData.caseIds.map((caseId) => caseId.value.toString())
            : [],

        file_type:
          formData.filetype?.length > 0
            ? formData.filetype.map((type) => type.value)
            : [],

        targets:
          formData.targets?.length > 0
            ? formData.targets.map((target) => String(target.value))
            : [],

        sentiments:
          formData.sentiment?.length > 0
            ? formData.sentiment.map((s) => s.value)
            : [],

        unified_type:
          formData.unified_type?.length > 0
            ? formData.unified_type.map((s) => s.value)
            : [],

        eventtypestring:
          formData.eventtypestring?.length > 0
            ? formData.eventtypestring.map((s) => s.value)
            : [],

        mobilenumber:
          formData.mobilenumber?.length > 0
            ? formData.mobilenumber.map((s) => s.value)
            : [],

        socialmedia_hashtags: Array.isArray(formData.socialmedia_hashtags)
          ? formData.socialmedia_hashtags
          : [],
        socialmedia_from_id: Array.isArray(formData.socialmedia_from_id)
          ? formData.socialmedia_from_id
          : [],
        socialmedia_from_screenname: Array.isArray(
          formData.socialmedia_from_screenname
        )
          ? formData.socialmedia_from_screenname
          : [],
        serverip: Array.isArray(formData.serverip) ? formData.serverip : [],

        page: 1, // Start at page 1
        size: 50,
        ...(formData.latitude && { latitude: formData.latitude }),
        ...(formData.longitude && { longitude: formData.longitude }),
      };

      if (selectedDates.startDate && selectedDates.startTime) {
        payload.start_time = `${
          selectedDates.startDate.toISOString().split("T")[0]
        }T${String(selectedDates.startTime.hours).padStart(2, "0")}:${String(
          selectedDates.startTime.minutes
        ).padStart(2, "0")}:00`;
      }

      if (selectedDates.endDate && selectedDates.endTime) {
        payload.end_time = `${
          selectedDates.endDate.toISOString().split("T")[0]
        }T${String(selectedDates.endTime.hours).padStart(2, "0")}:${String(
          selectedDates.endTime.minutes
        ).padStart(2, "0")}:00`;
      }

      console.log("search payload", payload);
      const isValid = (v) =>
        Array.isArray(v)
          ? v.length > 0
          : typeof v === "string"
          ? v.trim() !== ""
          : v !== null && v !== undefined;

      const filteredPayload = {};
      Object.entries(payload).forEach(([key, value]) => {
        if (isValid(value)) {
          filteredPayload[key] = value;
        }
      });

      const paginatedQuery = {
        ...filteredPayload,
      };
      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
        paginatedQuery,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${Token}`,
          },
        }
      );

      console.log("dispatchresponse", response);

      dispatch(
        setSearchResults({
          results: response.data.results,
          total_pages: response.data.total_pages || 1,
          total_results: response.data.total_results || 0,
        })
      );

      dispatch(
        setKeywords({
          keyword: response.data.input.keyword,
          queryPayload: {
            case_id: payload.case_id || [],
            file_type: payload.file_type || [],
            keyword: formData.searchQuery || [],
            targets: formData.targets || [],
            sentiment: payload.sentiments || [],
            unified_type: payload.unified_type || [],
            eventtypestring: payload.eventtypestring || [],
            mobilenumber: payload.mobilenumber || [],
            socialmedia_hashtags: payload.socialmedia_hashtags || "",
            socialmedia_from_id: payload.socialmedia_from_id || "",
            socialmedia_from_screenname:
              payload.socialmedia_from_screenname || "",
            serverip: payload.serverip || "",
            start_time: payload.start_time ?? null,
            end_time: payload.end_time ?? null,
            latitude: payload.latitude ?? null,
            longitude: payload.longitude ?? null,
            page: payload.page ?? 1,
          },
        })
      );
      console.log("setkeywordDispacth", response.data.input.keyword);
      // Dispatch initial page number
      dispatch(setPage(1));

      setFormData({
        searchQuery: [],
        datatype: [],
        filetype: [],
        caseIds: [],
        targets: [],
        includeArchived: false,
        latitude: "",
        longitude: "",
      });

      // Handle the search results (e.g., pass them to a parent component)
      if (handleCreateCase) {
        handleCreateCase(response.data);
      }

      dispatch(openPopup("saved"));
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to search");
      console.error("Error performing search:", error);
    }
  };

  // Toggle popup visibility
  const togglePopupA = () => {
    setShowPopupD(!showPopupD);
  };

  // Handle data from DatePicker
  const handleDateSelection = (dateData) => {
    setSelectedDates(dateData);
    togglePopupA(); // Close popup after selection
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "No date selected";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-icon" onClick={() => dispatch(closePopup())}>
          &times;
        </button>
        <div className="popup-content">
          <h5>Create Criteria</h5>

          <form className={styles.filterForm} onSubmit={handleSearch}>
            {/* Search Bar with Icons */}
            <label htmlFor="searchQuery" style={{ fontSize: "14px" }}>
              Search Keywords
            </label>
            <style>
              {`
                  input#searchQuery::placeholder {
                    color: white !important;
                    opacity: 1 !important;
                  }
                `}
            </style>
            <TextField
              fullWidth
              className={styles.searchBar}
              name="searchQuery"
              id="searchQuery"
              InputProps={{
                readOnly: isReadOnly,
                onFocus: handleFocus,
                inputRef: inputRef,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search style={{ color: "#0073CF" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Send
                      onClick={() => dispatch(openPopup("recent"))}
                      style={{
                        cursor: "pointer",
                        color: "#0073cf",
                        marginRight: "5px",
                      }}
                    />
                    <Tune
                      onClick={() => dispatch(openPopup("saved"))}
                      style={{ cursor: "pointer", color: "#0073cf" }}
                    />
                  </InputAdornment>
                ),
                style: {
                  height: "38px",
                  padding: "0 8px",
                  color: "white",
                  borderRadius: "15px",
                  border: "1px solid #0073CF",
                },
                autoComplete: "off",
              }}
              placeholder="Search..."
              value={formData.searchQuery}
              onChange={handleInputChange}
              sx={sharedSxStyles}
            />

            <CommonMultiSelect
              label="Source Type"
              value={formData.filetype}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, filetype: selected }))
              }
              options={fileTypeOptions}
              customStyles={customSelectStyles}
            />

            <CommonMultiSelect
              label="Case"
              isMulti
              customStyles={customSelectStyles}
              options={caseOptions}
              styles={customSelectStyles}
              value={formData.caseIds}
              onChange={(selected) => {
                setFormData((prev) => ({ ...prev, caseIds: selected }));
              }}
              placeholder="Select cases"
            />

            <CommonMultiSelect
              label="Target"
              value={formData.targets}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, targets: selected }))
              }
              options={targetOptions}
              customStyles={customSelectStyles}
            />
            <CommonMultiSelect
              label="Sentiment"
              value={formData.sentiment}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, sentiment: selected }))
              }
              options={sentimentOptions}
              customStyles={customSelectStyles}
            />

            <CommonMultiSelect
              label="Data Sources"
              isMulti
              options={unifiedtype}
              customStyles={customSelectStyles}
              value={formData.unified_type}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, unified_type: selected }))
              }
              placeholder="Select data sources"
            />

            {/*  eventtypestring (CommonMultiSelect) */}
            <CommonMultiSelect
              label="Event Types"
              isMulti
              options={eventtypestring}
              customStyles={customSelectStyles}
              value={formData.eventtypestring}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, eventtypestring: selected }))
              }
              placeholder="Select event types"
            />
            {/* mobilenumber (CommonMultiSelect) */}
            {/* Note: Assuming options for mobile number might be dynamically provided or it's mainly for entry */}
            <CommonMultiSelect
              label="Mobile Number"
              isMulti
              options={mobilenumbers}
              customStyles={customSelectStyles}
              value={formData.mobilenumber}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, mobilenumber: selected }))
              }
              placeholder="Select mobile numbers"
            />
            <CommonTextInput
              label="Hashtags"
              type="text"
              value={
                Array.isArray(formData.socialmedia_hashtags)
                  ? formData.socialmedia_hashtags.join(", ")
                  : formData.socialmedia_hashtags || ""
              }
              onChange={commonOnChange}
              name="socialmedia_hashtags"
              placeholder="Enter hashtags (e.g., #tag1, #tag2)"
              customPaddingInput={styles.noPaddingcase}
            />

            {/*  socialmedia_from_id (CommonTextInput / InputField) */}
            <CommonTextInput
              label="Profile ID"
              type="text"
              name="socialmedia_from_id"
              value={
                Array.isArray(formData.socialmedia_from_id)
                  ? formData.socialmedia_from_id.join(", ")
                  : formData.socialmedia_from_id || ""
              }
              placeholder="Enter Profile ID (e.g., id1, id2)"
              customPaddingInput={styles.noPaddingcase}
              onChange={commonOnChange}
            />

            {/*  socialmedia_from_screen_name (CommonTextInput / InputField) */}
            <CommonTextInput
              label="Screen Name"
              type="text"
              name="socialmedia_from_screenname"
              value={
                Array.isArray(formData.socialmedia_from_screenname)
                  ? formData.socialmedia_from_screenname.join(", ")
                  : formData.socialmedia_from_screenname || ""
              }
              placeholder="Enter Screen Name (e.g., name1, name2)"
              customPaddingInput={styles.noPaddingcase}
              onChange={commonOnChange}
            />

            {/* serverip (CommonTextInput / InputField) */}
            <CommonTextInput
              label="Server IP"
              type="text"
              name="serverip"
              value={
                Array.isArray(formData.serverip)
                  ? formData.serverip.join(", ")
                  : formData.serverip || ""
              }
              placeholder="Enter Server IP (e.g., 1.1.1.1, 2.2.2.2)"
              customPaddingInput={styles.noPaddingcase}
              onChange={commonOnChange}
            />
            <CommonTextInput
              label="Latitude"
              type="text"
              name="latitude"
              value={formData.latitude}
              placeholder="Enter Latitude (e.g., 40.7128)"
              customPaddingInput={styles.noPaddingcase}
              onChange={handleInputChange}
            />
            <CommonTextInput
              label="Longitude"
              type="text"
              name="longitude"
              value={formData.longitude}
              placeholder="Enter Longitude (e.g., -74.0060)"
              customPaddingInput={styles.noPaddingcase}
              onChange={handleInputChange}
            />

            <CommonDateInput
              label="Date"
              value={
                selectedDates.startDate && selectedDates.endDate
                  ? `${formatDate(selectedDates.startDate)} to ${formatDate(
                      selectedDates.endDate
                    )}`
                  : formatDate(selectedDates.startDate || selectedDates.endDate)
              }
              onClickIcon={togglePopupA}
              sx={sharedSxStyles}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.includeArchived}
                  onChange={handleSaveCriteriaChange}
                  style={{ color: "#0073CF" }} // Custom color for checkbox
                />
              }
              label="Save this search"
            />
          </form>
          <div className="button-container" style={{ textAlign: "center" }}>
            <button
              type="submit"
              style={{ width: "98.5%", height: "30px" }}
              className="add-btn"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {showPopupD && (
        <DatePickera
          onSubmit={handleDateSelection}
          initialDates={selectedDates}
          onClose={togglePopupA}
        />
      )}
      {showSavePopup && (
        <Confirm
          formData={formData}
          selectedDates={selectedDates}
          onClose={() => setShowSavePopup(false)}
        />
      )}
    </div>
  );
};
CreateCriteria.propTypes = {
  handleCreateCase: PropTypes.func.isRequired,
};
export default CreateCriteria;

// import { useState, useEffect } from 'react';
// import DatePickera from './datepicker';
// import { Search, Send, Tune } from '@mui/icons-material';
// import { Checkbox, FormControlLabel, InputAdornment, TextField } from '@mui/material';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { useDispatch, useSelector } from "react-redux";
// import { closePopup, openPopup, setKeywords, setPage, setSearchResults } from '../../../Redux/Action/criteriaAction';
// import Confirm from './confirmCriteria';
// import { toast } from 'react-toastify';
// import { useAutoFocusWithManualAutofill } from '../../../utils/autoFocus';
// import styles from '../../Common/Table/table.module.css';
// import customSelectStyles from '../../Common/CustomStyleSelect/customSelectStyles';
// import CommonMultiSelect from '../../Common/MultiSelect/CommonMultiSelect';
// import CommonDateInput from '../../Common/DateField/DateField';
// import PropTypes from 'prop-types';

// export const sharedSxStyles = {
//   '& .MuiOutlinedInput-root': {
//     '& fieldset': {
//       border: 'none',
//     },
//     '&:hover fieldset': {
//       border: 'none',
//     },
//     '&.Mui-focused fieldset': {
//       border: 'none',
//     },
//   },
//   '& .MuiInputBase-root': {
//     boxShadow: 'none',
//   },
//   '& .MuiOutlinedInput-input': {
//     fontSize: '12px', 
//     color: 'rgb(224, 219, 219)', 
//     fontFamily: 'Roboto, sans-serif',
//     fontWeight: 'normal',
//   },
// };

// const CreateCriteria = ({ handleCreateCase }) => {
//   const { inputRef, isReadOnly, handleFocus } = useAutoFocusWithManualAutofill();
//   const Token = Cookies.get('accessToken');
//   const dispatch = useDispatch();

//   const [formData, setFormData] = useState({
//     searchQuery: '',
//     datatype: [],
//     filetype: [],
//     caseIds: [],
//     targets: [],
//     sentiment: [],
//     includeArchived: false,
//     latitude: '',
//     longitude: ''
//   });
//   const [showSavePopup, setShowSavePopup] = useState(false);
//   const [showPopupD, setShowPopupD] = useState(false);
//   const [selectedDates, setSelectedDates] = useState({
//     startDate: null,
//     endDate: null,
//     startTime: { hours: 16, minutes: 30 },
//     endTime: { hours: 16, minutes: 30 }
//   });
//   const [caseOptions, setCaseOptions] = useState([]);
//   const [fileTypeOptions, setFileTypeOptions] = useState([]);
//   const [targetOptions, setTargetOptions] = useState([]);
//   const [sentimentOptions, setSentimentOptions] = useState([]);

//   const activePopup = useSelector((state) => state.popup?.activePopup || null);

//   useEffect(() => {
//     const fetchCaseData = async () => {
//       try {
//         const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case`, {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${Token}`
//           },
//         });

//         // Format the response data for react-select
//         const caseOptionsFormatted = response.data.data.map(caseItem => ({
//           value: caseItem.id,
//           label: `CASE${String(caseItem.id).padStart(4, "0")} - ${caseItem.title || 'Untitled'}`
//         }));

//         setCaseOptions(caseOptionsFormatted);
//       } catch (error) {
//         console.error('Error fetching case data:', error);
//       }
//     };

//     // Fetch file types from API
//     const fetchFileTypes = async () => {
//       try {
//         const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/platforms`, {
//           headers: {
//             'Authorization': `Bearer ${Token}`
//           },
//         });
//         console.log("response", response.data.data)
//         const fileTypeOptionsFormatted = response.data.data.map(platform => ({
//           value: platform,
//           label: platform
//         }));

//         setFileTypeOptions(fileTypeOptionsFormatted);
//       } catch (error) {
//         console.error('Error fetching file types:', error);

//       }
//     };

//     const fetchTargetOptions = async () => {
//       try {
//         const response = await axios.post(
//           `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/distinct`,
//           { fields: ["targets", "sentiment", "unified_record_type"] },
//           {
//             headers: {
//               'Authorization': `Bearer ${Token}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );

//         const fileTypeOptionsFormatted = response?.data?.unified_record_type.buckets.map(b => ({ value: b.key, label: b.key }));

//         const sentimentBuckets = response.data?.sentiment?.buckets || [];
//         const targetIds = response.data?.targets?.buckets.map(b => parseInt(b.key, 10)).filter(id => !isNaN(id));

//         const formattedSentiments = sentimentBuckets.map(bucket => ({
//           value: bucket.key,
//           label: bucket.key
//         }));
//         let tOpts = [];
//         if (targetIds.length > 0) {
//           const targetRes = await axios.post(
//             `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/target-names`,
//             { target_ids: targetIds },
//             { headers: { Authorization: `Bearer ${Token}` } }
//           );
//           tOpts = targetRes.data.map(t => ({
//             value: t.id,
//             label: `TAR${String(t.id).padStart(4, '0')} - ${t.name || ' '}`,
//             name: t.name,
//           }));

//         }
//         setFileTypeOptions(fileTypeOptionsFormatted);
//         setTargetOptions(tOpts);
//         setSentimentOptions(formattedSentiments);

//       } catch (error) {
//         console.error("Failed to fetch target options:", error);
//       }
//     };

//     fetchCaseData();
//     fetchTargetOptions();
//   }, [Token]);
//   useEffect(() => {
//     const isSearchQueryEmpty = !formData.searchQuery || formData.searchQuery.length === 0;
//     const isCaseIdsEmpty = !formData.caseIds || formData.caseIds.length === 0;
//     const isFileTypeEmpty = !formData.filetype || formData.filetype.length === 0;
//     const isLatitudeEmpty = !formData.latitude;
//     const isLongitudeEmpty = !formData.longitude;

//     const nothingFilled = isSearchQueryEmpty && isCaseIdsEmpty && isFileTypeEmpty && isLatitudeEmpty && isLongitudeEmpty;

//     if (nothingFilled && formData.includeArchived) {
//       setFormData(prev => ({ ...prev, includeArchived: false }));
//       setShowSavePopup(false); // Close the save popup as well
//     }
//   }, [formData]);
//   const handleSaveCriteriaChange = (e) => {
//     e.preventDefault();

//     const isSearchQueryEmpty = !formData.searchQuery || (Array.isArray(formData.searchQuery) && formData.searchQuery.length === 0) || (typeof formData.searchQuery === 'string' && formData.searchQuery.trim() === '');
//     const isCaseIdsEmpty = !formData.caseIds || formData.caseIds.length === 0;
//     const isFileTypeEmpty = !formData.filetype || formData.filetype.length === 0;
//     const isLatitudeEmpty = !formData.latitude || formData.latitude.trim() === '';
//     const isLongitudeEmpty = !formData.longitude || formData.longitude.trim() === '';
//     const isDateEmpty = !selectedDates.startDate && !selectedDates.endDate;

//     const isAnyFieldFilled = !(isSearchQueryEmpty && isCaseIdsEmpty && isFileTypeEmpty && isLatitudeEmpty && isLongitudeEmpty && isDateEmpty);

//     const isChecked = e.target.checked;

//     if (isChecked) {
//       if (!isAnyFieldFilled) {
//         toast.error("Please select at least one search criteria before saving.");
//         // Do not check the checkbox or open popup if validation fails
//         return;
//       }
//       setFormData((prev) => ({ ...prev, includeArchived: true }));
//       setShowSavePopup(true); // Open the popup
//     } else {
//       // Close the popup and reset form state when unchecked
//       setFormData((prev) => ({ ...prev, includeArchived: false }));
//       setShowSavePopup(false);
//     }

//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "searchQuery") {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value.split(",").map(keyword => keyword) // Split by commas and trim extra spaces
//       }));
//     } else {
//       // For other inputs, handle normally
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }

//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();

//     // Validation: check if all relevant fields are empty
//     const isSearchQueryEmpty = !formData.searchQuery || (Array.isArray(formData.searchQuery) && formData.searchQuery.length === 0) || (typeof formData.searchQuery === 'string' && formData.searchQuery.trim() === '');
//     const isCaseIdsEmpty = !formData.caseIds || formData.caseIds.length === 0;
//     const isFileTypeEmpty = !formData.filetype || formData.filetype.length === 0;
//     const isLatitudeEmpty = !formData.latitude || formData.latitude.trim() === '';
//     const isLongitudeEmpty = !formData.longitude || formData.longitude.trim() === '';
//     const isDateEmpty = !selectedDates.startDate && !selectedDates.endDate;

//     if (isSearchQueryEmpty && isCaseIdsEmpty && isFileTypeEmpty && isLatitudeEmpty && isLongitudeEmpty && isDateEmpty) {
//       toast.error("Please enter at least one search criteria before searching.");
//       return;
//     }
//     try {

//       const payload = {
//         keyword: formData.searchQuery?.length > 0 ? formData.searchQuery : [],
//         case_id: formData.caseIds?.length > 0
//           ? (formData.caseIds.map(caseId => caseId.value.toString()))
//           : [],

//         file_type: formData.filetype?.length > 0 ? formData.filetype.map(type => type.value) : [],
//         targets: formData.targets?.length > 0 ? formData.targets.map(target => String(target.value)) : [],
//         sentiments: formData.sentiment?.length > 0
//           ? formData.sentiment.map(s => s.value)
//           : [],
//         page: 1, // Start at page 1
//         size:50,
//         ...(formData.latitude && { latitude: formData.latitude }),
//         ...(formData.longitude && { longitude: formData.longitude }),
//       };

//       if (selectedDates.startDate && selectedDates.startTime) {
//         payload.start_time = `${selectedDates.startDate.toISOString().split('T')[0]}T${String(selectedDates.startTime.hours).padStart(2, '0')}:${String(selectedDates.startTime.minutes).padStart(2, '0')}:00`;
//       }

//       if (selectedDates.endDate && selectedDates.endTime) {
//         payload.end_time = `${selectedDates.endDate.toISOString().split('T')[0]}T${String(selectedDates.endTime.hours).padStart(2, '0')}:${String(selectedDates.endTime.minutes).padStart(2, '0')}:00`;
//       }

//       console.log("search payload", payload);
//       const isValid = (v) =>
//         Array.isArray(v) ? v.length > 0 :
//           typeof v === 'string' ? v.trim() !== '' :
//             v !== null && v !== undefined;

//       const filteredPayload = {};
//       Object.entries(payload).forEach(([key, value]) => {
//         if (isValid(value)) {
//           filteredPayload[key] = value;
//         }
//       });

//       const paginatedQuery = {
//         ...filteredPayload
//       };
//       const response = await axios.post(
//         `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
//         paginatedQuery,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${Token}`
//           }
//         }
//       );

//       console.log("dispatchresponse", response);

//       dispatch(setSearchResults({
//         results: response.data.results,
//         total_pages: response.data.total_pages || 1,
//         total_results: response.data.total_results || 0,
//       }));

//       dispatch(setKeywords({
//         keyword: response.data.input.keyword,
//         queryPayload: {
//           case_id: payload.case_id || [],
//           file_type: payload.file_type || [],
//           keyword: formData.searchQuery || [],
//           targets: formData.targets || [],
//           sentiment: payload.sentiments || [],
//           start_time: payload.start_time ?? null,
//           end_time: payload.end_time ?? null,
//           latitude: payload.latitude ?? null,
//           longitude: payload.longitude ?? null,
//           page: payload.page ?? 1
//         }
//       }));
//       console.log("setkeywordDispacth", response.data.input.keyword)
//       // Dispatch initial page number
//       dispatch(setPage(1));

//       setFormData({
//         searchQuery: [],
//         datatype: [],
//         filetype: [],
//         caseIds: [],
//         targets: [],
//         includeArchived: false,
//         latitude: '',
//         longitude: ''
//       });

//       // Handle the search results (e.g., pass them to a parent component)
//       if (handleCreateCase) {
//         handleCreateCase(response.data);
//       }

//       dispatch(openPopup("saved"));
//     } catch (error) {
//       toast.error(error?.response?.data?.detail || "Failed to search")
//       console.error('Error performing search:', error);
//     }
//   };

//   // Toggle popup visibility
//   const togglePopupA = () => {
//     setShowPopupD(!showPopupD);
//   };

//   // Handle data from DatePicker
//   const handleDateSelection = (dateData) => {
//     setSelectedDates(dateData);
//     togglePopupA(); // Close popup after selection
//   };

//   // Format date for display
//   const formatDate = (date) => {
//     if (!date) return 'No date selected';
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
//   };

//   return (
//     <div className="popup-overlay">
//       <div className="popup-container">
//         <button className="close-icon" onClick={() => dispatch(closePopup())}>
//           &times;
//         </button>
//         <div className="popup-content">
//           <h5>Create Criteria</h5>

//           <form onSubmit={handleSearch}
//           >

//             {/* Search Bar with Icons */}
//             <label htmlFor="searchQuery" style={{ fontSize: '14px' }}>Search Keywords</label>
//               <style>
//                 {`
//                   input#searchQuery::placeholder {
//                     color: white !important;
//                     opacity: 1 !important;
//                   }
//                 `}
//               </style>
//             <TextField
//               fullWidth
//               className={styles.searchBar}
//               name="searchQuery"
//               id="searchQuery"
//               InputProps={{
//                 readOnly: isReadOnly,
//                 onFocus: handleFocus,
//                 inputRef: inputRef,
//                 startAdornment: (
//                   <InputAdornment position="start" >
//                     <Search style={{ color: "#0073CF" }} />
//                   </InputAdornment>
//                 ),
//                 endAdornment: (
//                   <InputAdornment position="end" >
//                     <Send onClick={() => dispatch(openPopup("recent"))} style={{ cursor: 'pointer', color: "#0073cf", marginRight: '5px' }} />
//                     <Tune onClick={() => dispatch(openPopup("saved"))} style={{ cursor: 'pointer', color: "#0073cf" }} />
//                   </InputAdornment>
//                 ),
//                 style: {
//                   height: '38px',
//                   padding: '0 8px',
//                   color: 'white',
//                   borderRadius: '15px',
//                   border: '1px solid #0073CF',

//                 },
//                 autoComplete: 'off',
//               }}
              
//               placeholder="Search..."
//               value={formData.searchQuery}
//               onChange={handleInputChange}
//               sx={sharedSxStyles}
//             />

//              <CommonMultiSelect
//               label="Source Type"
//               value={formData.filetype}
//               onChange={(selected) =>
//                 setFormData((prev) => ({ ...prev, filetype: selected }))
//               }
//               options={fileTypeOptions}
//               customStyles={customSelectStyles}
//             />

//             <CommonMultiSelect
//               label="Case"
//               isMulti
//               customStyles={customSelectStyles}
//               options={caseOptions}
//               styles={customSelectStyles}
//               value={formData.caseIds}
//               onChange={(selected) => { setFormData(prev => ({ ...prev, caseIds: selected })); }}
//               placeholder="Select cases"
//             />

//             <CommonMultiSelect
//               label="Target"
//               value={formData.targets}
//               onChange={(selected) =>
//                 setFormData((prev) => ({ ...prev, targets: selected }))
//               }
//               options={targetOptions}
//               customStyles={customSelectStyles}
//             />
//             <CommonMultiSelect
//               label="Sentiment"
//               value={formData.sentiment}
//               onChange={(selected) =>
//                 setFormData((prev) => ({ ...prev, sentiment: selected }))
//               }
//               options={sentimentOptions}
//               customStyles={customSelectStyles}
//             />
//             <CommonDateInput
//               label="Date"
//               value={
//                 selectedDates.startDate && selectedDates.endDate
//                   ? `${formatDate(selectedDates.startDate)} to ${formatDate(selectedDates.endDate)}`
//                   : formatDate(selectedDates.startDate || selectedDates.endDate)
//               }
//               onClickIcon={togglePopupA}
//               sx={sharedSxStyles}
//             />
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={formData.includeArchived}
//                   onChange={handleSaveCriteriaChange}
//                   style={{ color: '#0073CF' }} // Custom color for checkbox


//                 />
//               }
//               label="Save this search"

//             />
//             <div className="button-container" style={{ textAlign: 'center' }}>
//               <button
//                 type="submit"
//                 style={{ width: '98.5%', height: '30px' }}
//                 className="add-btn"
//               >
//                 Search
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {showPopupD && (
//         <DatePickera
//           onSubmit={handleDateSelection}
//           initialDates={selectedDates}
//           onClose={togglePopupA}
//         />
//       )}
//       {
//         showSavePopup && (
//           <Confirm formData={formData} selectedDates={selectedDates} onClose={() => setShowSavePopup(false)}/>
//         )
//       }
//     </div>
//   );
// };
// CreateCriteria.propTypes = {
//   handleCreateCase: PropTypes.func.isRequired,
// };
// export default CreateCriteria;
