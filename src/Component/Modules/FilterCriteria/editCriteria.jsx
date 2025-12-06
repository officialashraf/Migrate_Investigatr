
import { useState, useEffect, useCallback } from "react";
import DatePickera from "./datepicker";
import { TextField } from "@mui/material";
import "./createCriteria.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { sharedSxStyles } from "./createCriteria";
import { toast } from "react-toastify";
import Loader from "../Layout/loader";
import customSelectStyles from "../../Common/CustomStyleSelect/customSelectStyles";
import styles from "../../Common/Table/table.module.css";
import CommonMultiSelect from "../../Common/MultiSelect/CommonMultiSelect";
import CommonDateInput from "../../Common/DateField/DateField";
import AppButton from "../../Common/Buttton/button";
import PropTypes from "prop-types";
import CommonTextInput from "../../Common/MultiSelect/CommonTextInput";

const EditCriteria = ({ togglePopup, criteriaId, onUpdate }) => {
  const Token = Cookies.get("accessToken");
  const [showPopupD, setShowPopupD] = useState(false);
  const [caseOptions, setCaseOptions] = useState([]);
  const [fileTypeOptions, setFileTypeOptions] = useState([]);
  const [targetOptions, setTargetOptions] = useState([]);
  const [sentimentOptions, setSentimentOptions] = useState([]);
  const [unifiedtype, setunifiedtype] = useState([]);
  const [eventtypestring, seteventtypestring] = useState([]);
  const [mobilenumbers, setmobilenumbers] = useState([]);
  const [socialmediahashtags, setsocialmediahashtags] = useState([]);
  const [socialmediafromid, setsocialmediafromid] = useState([]);
  const [socialmediafromscreenname, setsocialmediafromscreenname] = useState(
    []
  );
  const [serverip, setserverip] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [formData, setFormData] = useState({
    searchQuery: "",
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
    latitude: "", // <-- Change to string
    longitude: "",
  });
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
    startTime: { hours: 16, minutes: 30 },
    endTime: { hours: 16, minutes: 30 },
  });
  const isFormEmpty = () => {
    return (
      !formData.searchQuery.trim() &&
      formData.caseIds.length === 0 &&
      formData.filetype.length === 0 &&
      formData.targets.length === 0 &&
      formData.sentiment.length === 0 &&
      formData.unified_type.length === 0 &&
      formData.eventtypestring.length === 0 &&
      formData.mobilenumber.length === 0 &&
      !formData.socialmedia_hashtags.trim() &&
      !formData.socialmedia_from_id.trim() &&
      !formData.socialmedia_from_screenname.trim() &&
      !formData.serverip.trim() &&
      !formData.latitude.trim() &&
      !formData.longitude.trim()
    );
  };

  // Fetch case data from API
  const fetchCaseData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case`,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${Token}`,
          },
        }
      );

      const caseOptionsFormatted = response?.data.data?.map((caseItem) => ({
        value: caseItem.id,
        label: `CASE${String(caseItem.id).padStart(4, "0")}`,
      }));

      setCaseOptions(caseOptionsFormatted);
      return caseOptionsFormatted;
    } catch (error) {
      console.error("Error fetching case data:", error);
      toast.error("Failed to fetch case data");
      return [];
    }
  }, [Token]);

  // Fetch file types from API
  // const fetchFileTypes = useCallback(async () => {
  //   try {
  //     const response = await axios.get(${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/platforms, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': Bearer ${Token}
  //       },
  //     });

  //     const fileTypeOptionsFormatted = response.data.data?.map(platform => ({
  //       value: platform,
  //       label: platform
  //     }));

  //     setFileTypeOptions(fileTypeOptionsFormatted);
  //     return fileTypeOptionsFormatted;
  //   } catch (error) {
  //     console.error('Error fetching file types:', error);
  //     toast.error('Failed to fetch file types');
  //     return [];
  //   }
  // }, [Token]);

  //  const fetchUnifiedTypeOptions = useCallback(async () => {
  //   const response = await axios.post(${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/distinct, {
  //     headers: { 'Authorization': Bearer ${Token} },
  //   });
  //   return response.data?.data || [];
  // }, [Token]);

  // // Same for eventType
  // const fetchEventTypeOptions = useCallback(async () => {
  //   const response = await axios.post(${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/distinct, {
  //     headers: { 'Authorization': Bearer ${Token} },
  //   });
  //   return response.data?.data || [];
  // }, [Token]);

  // Fetch target and sentiment options from API
  const fetchTargetAndSentimentOptions = useCallback(async () => {
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
        response?.data?.unified_record_type?.buckets?.map((b) => ({
          value: b.key,
          label: b.key,
        })) || [];

      const sentimentBuckets = response.data?.sentiment?.buckets || [];
      const formattedSentiments = sentimentBuckets?.map((bucket) => ({
        value: bucket.key,
        label: bucket.key,
      }));

      // unified type
      const unifiedTypeBuckets = response.data?.unified_type?.buckets || [];
      const formattedUnifiedTypes = unifiedTypeBuckets?.map((bucket) => ({
        value: bucket.key,
        label: bucket.key,
      }));
      setunifiedtype(formattedUnifiedTypes);

      // social media hashtags
      const socialMediahashtagsBuckets =
        response?.data?.socialmedia_hashtags.buckets || [];
      const formattedsocialMediahashtagsBuckets =
        socialMediahashtagsBuckets?.map((bucket) => ({
          value: bucket.key,
          label: bucket.key,
        }));
      setsocialmediahashtags(formattedsocialMediahashtagsBuckets);

      // social media From ID
      const socialMediaFromIdBuckets =
        response?.data?.socialmedia_from_id.buckets || [];
      const formattedsocialMediaFromIdBuckets = socialMediaFromIdBuckets?.map(
        (bucket) => ({
          value: bucket.key,
          label: bucket.key,
        })
      );
      setsocialmediafromid(formattedsocialMediaFromIdBuckets);

      // socialmedia_from_screenname
      const socialMediaFromScreenNameBuckets =
        response.data?.socialmedia_from_screenname?.buckets || [];
      const formattedsocialMediaFromScreenNameBuckets =
        socialMediaFromScreenNameBuckets?.map((bucket) => ({
          value: bucket.key,
          label: bucket.key,
        }));
      setsocialmediafromscreenname(formattedsocialMediaFromScreenNameBuckets);

      // serverip
      const serveripBuckets = response.data?.serverip?.buckets || [];
      const formattedServerIp = serveripBuckets?.map((bucket) => ({
        value: bucket.key,
        label: bucket.key,
      }));
      setserverip(formattedServerIp);

      // eventTypeString
      const eventTypeBuckets = response.data?.eventtypestring?.buckets || [];
      const formattedEventTypeStrings = eventTypeBuckets?.map((bucket) => ({
        value: bucket.key,
        label: bucket.key,
      }));
      seteventtypestring(formattedEventTypeStrings);

      // mobilenumber
      const formattedmobilenumbers = [
                        ...(response.data.mobilenumber?.buckets || []),
                        ...(response.data.phone_numbers?.buckets || [])
                    ].map(b => ({
                        value: b.key,
                        label: b.key
                    }));
      setmobilenumbers(formattedmobilenumbers);

      const targetIds =
        response.data?.targets?.buckets
          ?.map((b) => parseInt(b.key, 10))
          .filter((id) => !isNaN(id)) || [];
      let tOpts = [];

      if (targetIds.length > 0) {
        const targetRes = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/target-names`,
          { target_ids: targetIds },
          { headers: { 'Authorization': `Bearer ${Token}` } }
        );

        tOpts = targetRes.data?.map((t) => ({
          value: t.id,
          label: `TAR${String(t.id).padStart(4, "0")} - ${t.name || " "}`,
          name: t.name,
        }));
      }

      setFileTypeOptions(fileTypeOptionsFormatted);
      setTargetOptions(tOpts);
      setSentimentOptions(formattedSentiments);
      setunifiedtype(formattedUnifiedTypes);
      setsocialmediahashtags(formattedsocialMediahashtagsBuckets);
      setsocialmediafromid(formattedsocialMediaFromIdBuckets);
      setsocialmediafromscreenname(formattedsocialMediaFromScreenNameBuckets);
      setserverip(formattedServerIp);
      seteventtypestring(formattedEventTypeStrings);
      setmobilenumbers(formattedmobilenumbers);

      return {
        targets: tOpts,
        sentiments: formattedSentiments,
        fileTypes: fileTypeOptionsFormatted,
        unified_type: formattedUnifiedTypes,
        eventtypestring: formattedEventTypeStrings,
        mobilenumbers: formattedmobilenumbers,
      };
    } catch (error) {
      console.error("Failed to fetch target and sentiment options:", error);
      toast.error("Failed to fetch target and sentiment options");
      return {
        targets: [],
        sentiments: [],
        fileTypes: [],
        unified_type: [],
        eventtypestring: [],
        mobilenumber: [],
        socialmedia_hashtags: [],
        socialmedia_from_id: [],
        socialmedia_from_screenname: [],
        serverip: [],
      };
    }
  }, [Token]);

  const processKeywords = (keywords) => {
    if (!keywords) return "";

    if (Array.isArray(keywords)) {
      return keywords.join(", ");
    } else if (typeof keywords === "string") {
      return keywords;
    }

    return "";
  };

  const formatKeywordsForAPI = (keywordString) => {
    if (!keywordString || typeof keywordString !== "string") return [];

    return keywordString
      .split(",")
      ?.map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0);
  };

  const fetchCriteriaDetails = useCallback(
    async (
      caseOpts,
      fileTypeOpts,
      targetOpts,
      sentimentOpts,
      unifiedTypeOpts,
      eventTypeOpts,
      mobilenumberOpts
    ) => {
      try {
        const response = await axios.get(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/criteria/${criteriaId}`,
          {
            headers: {
              'Authorization': `Bearer ${Token}`,
            },
          }
        );

        const criteriaData = response.data.data;

        let startDate = null;
        let endDate = null;
        let startTime = { hours: 16, minutes: 30 };
        let endTime = { hours: 16, minutes: 30 };

        if (criteriaData.start_time) {
          const startDateTime = new Date(criteriaData.start_time);
          startDate = startDateTime;
          startTime = {
            hours: startDateTime.getHours(),
            minutes: startDateTime.getMinutes(),
          };
        }

        if (criteriaData.end_time) {
          const endDateTime = new Date(criteriaData.end_time);
          endDate = endDateTime;
          endTime = {
            hours: endDateTime.getHours(),
            minutes: endDateTime.getMinutes(),
          };
        }

        setSelectedDates({
          startDate,
          endDate,
          startTime,
          endTime,
        });

        const selectedCaseIds = [];
        if (criteriaData.case_id) {
          const caseIdsArray = Array.isArray(criteriaData.case_id)
            ? criteriaData.case_id
            : [criteriaData.case_id];

          caseIdsArray.forEach((caseId) => {
            const matchingOption = caseOpts.find(
              (option) => option.value.toString() === caseId.toString()
            );
            if (matchingOption) {
              selectedCaseIds.push(matchingOption);
            } else {
              selectedCaseIds.push({ value: caseId, label: `${caseId}` });
            }
          });
        }

        const selectedFileTypes = [];
        if (criteriaData.file_type) {
          const fileTypesArray = Array.isArray(criteriaData.file_type)
            ? criteriaData.file_type
            : [criteriaData.file_type];

          fileTypesArray.forEach((fileType) => {
            const matchingOption = fileTypeOpts.find(
              (option) => option.value === fileType
            );
            if (matchingOption) {
              selectedFileTypes.push(matchingOption);
            } else {
              selectedFileTypes.push({ value: fileType, label: fileType });
            }
          });
        }

        const selectedTargets = [];
        if (criteriaData.targets) {
          const targetsArray = Object.keys(criteriaData.targets || {});

          console.warn("criteriaDetailc", criteriaData.targets);
          targetsArray.forEach((target) => {
            const matchingOption = targetOpts.find(
              (option) =>
                option.value.toString().toLowerCase() ===
                target.toString().toLowerCase()
            );
            if (matchingOption) {
              selectedTargets.push(matchingOption);
            } else {
              selectedTargets.push({ value: target, label: target });
            }
          });
        }

        const selectedSentiments = [];
        if (criteriaData.sentiments) {
          const sentimentArray = Array.isArray(criteriaData.sentiments)
            ? criteriaData.sentiments
            : [criteriaData.sentiments];

          sentimentArray.forEach((sentiment) => {
            const matchingOption = sentimentOpts.find(
              (option) =>
                option.value.toString().toLowerCase() ===
                sentiment.toString().toLowerCase()
            );
            if (matchingOption) {
              selectedSentiments.push(matchingOption);
            } else {
              selectedSentiments.push({ value: sentiment, label: sentiment });
            }
          });
        }

        // ---------- UNIFIED TYPE ----------
        const selectedUnifiedTypes = [];
        if (criteriaData.unified_type) {
          const unifiedArray = Array.isArray(criteriaData.unified_type)
            ? criteriaData.unified_type
            : [criteriaData.unified_type];
          unifiedArray.forEach((type) => {
            const match = unifiedTypeOpts?.find(
              (opt) =>
                opt.value.toString().toLowerCase() ===
                type.toString().toLowerCase()
            );
            selectedUnifiedTypes.push(match || { value: type, label: type });
          });
        }

        // ---------- EVENT TYPE STRING ----------
        const selectedEventTypes = [];
        if (criteriaData.eventtypestring) {
          const eventArray = Array.isArray(criteriaData.eventtypestring)
            ? criteriaData.eventtypestring
            : [criteriaData.eventtypestring];
          eventArray.forEach((evt) => {
            const match = eventTypeOpts?.find(
              (opt) =>
                opt.value.toString().toLowerCase() ===
                evt.toString().toLowerCase()
            );
            selectedEventTypes.push(match || { value: evt, label: evt });
          });
        }

        // ---------- MOBILE NUMBER ----------
        const selectedmobilenumbers = [];
        if (criteriaData.mobilenumber) {
          const mobileArray = Array.isArray(criteriaData.mobilenumber)
            ? criteriaData.mobilenumber
            : [criteriaData.mobilenumber];
          mobileArray.forEach((mob) => {
            const match = mobilenumberOpts?.find(
              (opt) =>
                opt.value.toString().toLowerCase() ===
                mob.toString().toLowerCase()
            );
            selectedmobilenumbers.push(match || { value: mob, label: mob });
          });
        }

        // ---------- SOCIAL MEDIA HASHTAGS ----------
        let selectedSocialHashtags = [];
        if (criteriaData.socialmedia_hashtags) {
          const hashArray = Array.isArray(criteriaData.socialmedia_hashtags)
            ? criteriaData.socialmedia_hashtags
            : [criteriaData.socialmedia_hashtags];
          hashArray.forEach((tag) => {
            selectedSocialHashtags.push(tag);
          });
        }
        const selectedSocialHashtagsString = selectedSocialHashtags.join(", ");

        // ---------- SOCIAL MEDIA FROM ID ----------
        let selectedFromIds = [];
        if (criteriaData.socialmedia_from_id) {
          const idArray = Array.isArray(criteriaData.socialmedia_from_id)
            ? criteriaData.socialmedia_from_id
            : [criteriaData.socialmedia_from_id];
          idArray.forEach((id) => {
            selectedFromIds.push(id);
          });
        }
        const selectedFromIdsString = selectedFromIds.join(", ");

        // ---------- SOCIAL MEDIA FROM SCREEN NAME ----------
        let selectedFromScreenNames = [];
        if (criteriaData.socialmedia_from_screenname) {
          const nameArray = Array.isArray(
            criteriaData.socialmedia_from_screenname
          )
            ? criteriaData.socialmedia_from_screenname
            : [criteriaData.socialmedia_from_screenname];
          nameArray.forEach((name) => {
            selectedFromScreenNames.push(name);
          });
        }
        const selectedFromScreenNamesString =
          selectedFromScreenNames.join(", ");

        // ---------- SERVER IP ----------
        let selectedServerIps = [];
        if (criteriaData.serverip) {
          const ipArray = Array.isArray(criteriaData.serverip)
            ? criteriaData.serverip
            : [criteriaData.serverip];
          ipArray.forEach((ip) => {
            selectedServerIps.push(ip);
          });
        }

        const selectedServerIpsString = selectedServerIps.join(", ");

        const processedKeywords = processKeywords(criteriaData.keyword);

        // Update form data
        setFormData({
          searchQuery: processedKeywords,
          caseIds: selectedCaseIds,
          filetype: selectedFileTypes,
          targets: selectedTargets,
          sentiment: selectedSentiments,
          unified_type: selectedUnifiedTypes,
          eventtypestring: selectedEventTypes,
          mobilenumber: selectedmobilenumbers,
          socialmedia_hashtags: selectedSocialHashtagsString,
          socialmedia_from_id: selectedFromIdsString,
          socialmedia_from_screenname: selectedFromScreenNamesString,
          serverip: selectedServerIpsString,
          latitude: criteriaData.latitude || "",
          longitude: criteriaData.longitude || "",
        });

        setInitialFormData({
          searchQuery: processedKeywords,
          caseIds: selectedCaseIds,
          filetype: selectedFileTypes,
          targets: selectedTargets,
          sentiment: selectedSentiments,
          unified_type: selectedUnifiedTypes,
          eventtypestring: selectedEventTypes,
          mobilenumber: selectedmobilenumbers,
          socialmedia_hashtags: selectedSocialHashtagsString,
          socialmedia_from_id: selectedFromIdsString,
          socialmedia_from_screenname: selectedFromScreenNamesString,
          serverip: selectedServerIpsString,
          latitude: criteriaData.latitude || "",
          longitude: criteriaData.longitude || "",
          selectedDates: {
            startDate,
            endDate,
            startTime,
            endTime,
          },
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching criteria details:", error);
        setError("Failed to load criteria details.");
        setIsLoading(false);
        toast.error("Failed to load criteria details");
      }
    },
    [Token, criteriaId]
  );

  // Initial data fetch - Fixed dependency issue
  useEffect(() => {
    if (!dataFetched && Token && criteriaId) {
      const fetchAllData = async () => {
        setIsLoading(true);
        try {
          const [caseOpts, targetSentimentResult] = await Promise.all([
            fetchCaseData(),
            fetchTargetAndSentimentOptions(),
            // fetchUnifiedTypeOptions(),
            // fetchEventTypeOptions()
          ]);

          const targetOpts = targetSentimentResult.targets || [];
          const sentimentOpts = targetSentimentResult.sentiments || [];
          const fileTypeOpts = targetSentimentResult.fileTypes || [];

          const unifiedTypeOpts = targetSentimentResult.unified_type || [];
          const eventTypeOpts = targetSentimentResult.eventtypestring || [];
          const mobilenumberOpts = targetSentimentResult.mobilenumbers || [];

          await fetchCriteriaDetails(
            caseOpts,
            fileTypeOpts,
            targetOpts,
            sentimentOpts,
            unifiedTypeOpts,
            eventTypeOpts,
            mobilenumberOpts
          ); // New parameter);
          setDataFetched(true);
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Failed to load necessary data");
          setIsLoading(false);
        }
      };

      fetchAllData();
    }
  }, [
    dataFetched,
    Token,
    criteriaId,
    fetchCaseData,
    fetchCriteriaDetails,
    fetchTargetAndSentimentOptions,
  ]);

  // Handle form update submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isFormEmpty()) {
      toast.error("Empty fields cannot be saved!");
      return;
    }
    setIsSubmitting(true);
    try {
      const keywordsArray = formatKeywordsForAPI(formData.searchQuery);

      const formatStringForAPI = (inputString) => {
        return (
          inputString
            ?.split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0) || []
        );
      };
      const updatePayload = {
        keyword: keywordsArray, // Now properly formatted as array
        case_id: formData.caseIds?.map((caseId) => caseId.value.toString()),
        file_type: formData.filetype?.map((file) => file.value.toString()),
        targets: formData.targets.reduce((acc, target) => {
          acc[target.value] = target.name;
          return acc;
        }, {}),

        sentiments: formData.sentiment?.map((s) => s.value.toString()),
        unified_type: formData.unified_type?.map((u) => u.value.toString()),
        eventtypestring: formData.eventtypestring?.map((e) =>
          e.value.toString()
        ),
        mobilenumber: formData.mobilenumber?.map((m) => m.value.toString()),
        socialmedia_hashtags: formatStringForAPI(formData.socialmedia_hashtags),
        socialmedia_from_id: formatStringForAPI(formData.socialmedia_from_id),
        socialmedia_from_screenname: formatStringForAPI(
          formData.socialmedia_from_screenname
        ),
        serverip: formatStringForAPI(formData.serverip),
        latitude: formData.latitude || "",
        longitude: formData.longitude || "",
        start_time: selectedDates.startDate
          ? `${selectedDates.startDate.toISOString().split("T")[0]}T${String(
              selectedDates.startTime.hours
            ).padStart(2, "0")}:${String(
              selectedDates.startTime.minutes
            ).padStart(2, "0")}:00`
          : null,
        end_time: selectedDates.endDate
          ? `${selectedDates.endDate.toISOString().split("T")[0]}T${String(
              selectedDates.endTime.hours
            ).padStart(2, "0")}:${String(
              selectedDates.endTime.minutes
            ).padStart(2, "0")}:00`
          : null,
      };

      console.log("updatePayload", updatePayload);
      console.log("Keywords formatted as:", keywordsArray);

      const updateResponse = await axios.put(
`${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/criteria/${criteriaId}`,
        updatePayload,
        {
          headers: {
            "Content-Type": "application/json",
           'Authorization':`Bearer ${Token}`,
          },
        }
      );

      console.log("updateResponse", updateResponse);
      toast.success("Criteria updated successfully");
      togglePopup();
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating criteria:", error);
      toast.error(
        error.response?.data?.detail ||
          error.message ||
          "Failed to update criteria"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const isSame =
      formData.searchQuery.trim() === initialFormData.searchQuery &&
      JSON.stringify(
        formData.caseIds?.map((caseId) => caseId.value.toString())
      ) ===
        JSON.stringify(
          initialFormData.caseIds?.map((caseId) => caseId.value.toString())
        ) &&
      JSON.stringify(
        formData.filetype?.map((file) => file.value.toString())
      ) ===
        JSON.stringify(
          initialFormData.filetype?.map((file) => file.value.toString())
        ) &&
      JSON.stringify(
        formData.targets?.map((target) => target.value.toString())
      ) ===
        JSON.stringify(
          initialFormData.targets?.map((target) => target.value.toString())
        ) &&
      JSON.stringify(formData.sentiment?.map((s) => s.value.toString())) ===
        JSON.stringify(
          initialFormData.sentiment?.map((s) => s.value.toString())
        ) &&
      JSON.stringify(selectedDates) ===
        JSON.stringify(initialFormData.selectedDates) &&
      JSON.stringify(formData.unified_type?.map((u) => u.value.toString())) ===
        JSON.stringify(
          initialFormData.unified_type?.map((u) => u.value.toString())
        ) &&
      JSON.stringify(
        formData.eventtypestring?.map((e) => e.value.toString())
      ) ===
        JSON.stringify(
          initialFormData.eventtypestring?.map((e) => e.value.toString())
        ) &&
      JSON.stringify(formData.mobilenumber?.map((m) => m.value.toString())) ===
        JSON.stringify(
          initialFormData.mobilenumber?.map((m) => m.value.toString())
        ) &&
      formData.socialmedia_hashtags === initialFormData.socialmedia_hashtags &&
      formData.socialmedia_from_id === initialFormData.socialmedia_from_id &&
      formData.socialmedia_from_screenname ===
        initialFormData.socialmedia_from_screenname &&
      formData.serverip === initialFormData.serverip &&
      formData.latitude === initialFormData.latitude &&
      formData.longitude === initialFormData.longitude;


    setIsBtnDisabled(isSame);
  }, [formData, initialFormData, selectedDates]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle date picker popup visibility
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

  if (isLoading) {
    return (
      <div className="popup-overlay">
        <div className="popup-container">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popup-overlay">
        <div className="popup-container">
          <button className="close-icon" onClick={togglePopup}>
            &times;
          </button>
          <div className="popup-content text-center">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
            <button className="btn btn-secondary" onClick={togglePopup}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-icon" onClick={togglePopup}>
          &times;
        </button>
        <div className="popup-content">
          <h5>Edit Criteria</h5>
          <form onSubmit={handleUpdate} className={styles.filterForm}>
            {/* Search Bar */}
            <div>
              <span>Search Keywords </span>
              <TextField
                fullWidth
                className={styles.searchBar}
                name="searchQuery"
                InputProps={{
                  style: {
                    height: "38px",
                    color: "white",
                    border: "1px solid #0073CF",
                    borderRadius: "15px",
                  },
                }}
                placeholder="Enter keywords separated by commas (e.g., keyword1, keyword2, keyword3)"
                value={formData.searchQuery}
                onChange={handleInputChange}
                sx={sharedSxStyles}
                multiline={false}
                // autoComplete='off'
              />
              {/* {error.searchQuery && <p style={{ color: "red", margin: '0px' }} >{error.searchQuery}</p>} */}
            </div>

            {/* Filetype Dropdown (Multi Select) */}

            {/* <label>Filetype</label> */}
            <CommonMultiSelect
              label="Source Type"
              isMulti
              options={fileTypeOptions}
              customStyles={customSelectStyles}
              value={formData.filetype}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, filetype: selected || [] }))
              }
              placeholder="Select file types"
              isLoading={fileTypeOptions.length === 0}
            />

            <CommonMultiSelect
              label="Case"
              isMulti
              options={caseOptions}
              customStyles={customSelectStyles}
              value={formData.caseIds}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, caseIds: selected || [] }))
              }
              placeholder="Select cases"
              isLoading={caseOptions.length === 0}
            />

            <CommonMultiSelect
              label="Target"
              isMulti
              options={targetOptions}
              customStyles={customSelectStyles}
              value={formData.targets}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, targets: selected || [] }))
              }
              placeholder="Select targets"
              isLoading={targetOptions.length === 0}
            />

            <CommonMultiSelect
              label="Sentiment"
              isMulti
              options={sentimentOptions}
              customStyles={customSelectStyles}
              value={formData.sentiment}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, sentiment: selected || [] }))
              }
              placeholder="Select sentiment"
              isLoading={sentimentOptions.length === 0}
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
              value={formData.socialmedia_hashtags || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialmedia_hashtags: e.target.value,
                }))
              }
              placeholder="Enter hashtags (e.g., #tag1, #tag2)"
              customPaddingInput={styles.noPaddingcase}
            />

            {/*  socialmedia_from_id (CommonTextInput / InputField) */}
            <CommonTextInput
              label="Profile ID"
              type="text"
              value={formData.socialmedia_from_id || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialmedia_from_id: e.target.value,
                }))
              }
              placeholder="Enter Profile ID"
              customPaddingInput={styles.noPaddingcase}
            />

            {/*  socialmedia_from_screen_name (CommonTextInput / InputField) */}
            <CommonTextInput
              label="Screen Name"
              type="text"
              value={formData.socialmedia_from_screenname || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  socialmedia_from_screenname: e.target.value,
                }))
              }
              placeholder="Enter Screen Name"
              customPaddingInput={styles.noPaddingcase}
            />

            {/* serverip (CommonTextInput / InputField) */}
            <CommonTextInput
              label="Server IP"
              type="text"
              value={formData.serverip || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, serverip: e.target.value }))
              }
              placeholder="Enter Server IP"
              customPaddingInput={styles.noPaddingcase}
            />
            <CommonTextInput
              label="Latitude"
              type="text"
              value={formData.latitude || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, latitude: e.target.value }))
              }
              placeholder="Enter Latitude"
              customPaddingInput={styles.noPaddingcase}
            />
            <CommonTextInput
              label="Longitude"
              type="text"
              value={formData.longitude || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
              placeholder="Enter Longitude"
              customPaddingInput={styles.noPaddingcase}
            />

            {/* DatePicker */}

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
          </form>
          {/* Update Button */}
          <div
            className="button-container d-flex gap-2"
            style={{ textAlign: "center" }}
          >
            <AppButton
              type="submit"
              onClick={handleUpdate}
              disabled={isFormEmpty() || isBtnDisabled || isSubmitting}
            >
              {isSubmitting ? "Editing..." : "Edit"}
            </AppButton>
            <AppButton type="button" onClick={togglePopup}>
              Cancel
            </AppButton>
          </div>
        </div>
      </div>

      {/* Date Picker Popup */}
      {showPopupD && (
        <DatePickera
          onSubmit={handleDateSelection}
          initialDates={selectedDates}
          onClose={togglePopupA}
        />
      )}
    </div>
  );
};

EditCriteria.propTypes = {
  togglePopup: PropTypes.func.isRequired,
  criteriaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onUpdate: PropTypes.func,
};
export default EditCriteria;

// import { useState, useEffect, useCallback } from 'react';
// import DatePickera from './datepicker';
// import { TextField } from '@mui/material';
// import './createCriteria.module.css'; 
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { sharedSxStyles } from './createCriteria';
// import { toast } from 'react-toastify';
// import Loader from '../Layout/loader'
// import customSelectStyles from '../../Common/CustomStyleSelect/customSelectStyles';
// import styles from '../../Common/Table/table.module.css';
// import CommonMultiSelect from '../../Common/MultiSelect/CommonMultiSelect';
// import CommonDateInput from '../../Common/DateField/DateField';
// import AppButton from '../../Common/Buttton/button';
// import PropTypes from 'prop-types';

// const EditCriteria = ({ togglePopup, criteriaId, onUpdate }) => {
//   const Token = Cookies.get('accessToken');
//   const [showPopupD, setShowPopupD] = useState(false);
//   const [caseOptions, setCaseOptions] = useState([]);
//   const [fileTypeOptions, setFileTypeOptions] = useState([]);
//   const [targetOptions, setTargetOptions] = useState([]);
//   const [sentimentOptions, setSentimentOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [dataFetched, setDataFetched] = useState(false);
//   const [initialFormData, setInitialFormData] = useState({});
//   const [isBtnDisabled, setIsBtnDisabled] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState({
//     searchQuery: '',
//     filetype: [],
//     caseIds: [],
//     targets: [],
//     sentiment: [],
//     latitude: '',
//     longitude: ''
//   });

//   const [selectedDates, setSelectedDates] = useState({
//     startDate: null,
//     endDate: null,
//     startTime: { hours: 16, minutes: 30 },
//     endTime: { hours: 16, minutes: 30 }
//   });

//   // Fetch case data from API
//   const fetchCaseData = useCallback(async () => {
//     try {
//       const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${Token}`
//         },
//       });

//       const caseOptionsFormatted = response.data.data.map(caseItem => ({
//         value: caseItem.id,
//         label: `CASE${String(caseItem.id).padStart(4, "0")}`
//       }));

//       setCaseOptions(caseOptionsFormatted);
//       return caseOptionsFormatted;
//     } catch (error) {
//       console.error('Error fetching case data:', error);
//       toast.error('Failed to fetch case data');
//       return [];
//     }
//   }, [Token]);

//   // Fetch file types from API
//   // const fetchFileTypes = useCallback(async () => {
//   //   try {
//   //     const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/platforms`, {
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         'Authorization': `Bearer ${Token}`
//   //       },
//   //     });

//   //     const fileTypeOptionsFormatted = response.data.data.map(platform => ({
//   //       value: platform,
//   //       label: platform
//   //     }));

//   //     setFileTypeOptions(fileTypeOptionsFormatted);
//   //     return fileTypeOptionsFormatted;
//   //   } catch (error) {
//   //     console.error('Error fetching file types:', error);
//   //     toast.error('Failed to fetch file types');
//   //     return [];
//   //   }
//   // }, [Token]);

//   // Fetch target and sentiment options from API
//   const fetchTargetAndSentimentOptions = useCallback(async () => {
//   try {
//     const response = await axios.post(
//       `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/distinct`,
//       { fields: ["targets", "sentiment", "unified_record_type"] },
//       {
//         headers: {
//           'Authorization': `Bearer ${Token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     const fileTypeOptionsFormatted = response?.data?.unified_record_type?.buckets?.map(b => ({
//       value: b.key,
//       label: b.key
//     })) || [];

//     const sentimentBuckets = response.data?.sentiment?.buckets || [];
//     const formattedSentiments = sentimentBuckets.map(bucket => ({
//       value: bucket.key,
//       label: bucket.key
//     }));

//     const targetIds = response.data?.targets?.buckets?.map(b => parseInt(b.key, 10)).filter(id => !isNaN(id)) || [];
//     let tOpts = [];

//     if (targetIds.length > 0) {
//       const targetRes = await axios.post(
//         `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/target-names`,
//         { target_ids: targetIds },
//         { headers: { Authorization: `Bearer ${Token}` } }
//       );

//       tOpts = targetRes.data.map(t => ({
//         value: t.id,
//         label: `TAR${String(t.id).padStart(4, '0')} - ${t.name || ' '}`,
//         name: t.name,
//       }));
//     }

//     setFileTypeOptions(fileTypeOptionsFormatted);
//     setTargetOptions(tOpts);
//     setSentimentOptions(formattedSentiments);

//     return { 
//       targets: tOpts, 
//       sentiments: formattedSentiments, 
//       fileTypes: fileTypeOptionsFormatted  // 👈 yaha bhi return karo
//     };
//   } catch (error) {
//     console.error("Failed to fetch target and sentiment options:", error);
//     toast.error('Failed to fetch target and sentiment options');
//     return { targets: [], sentiments: [], fileTypes: [] };
//   }
// }, [Token]);


//   const processKeywords = (keywords) => {
//     if (!keywords) return '';

//     if (Array.isArray(keywords)) {
//       return keywords.join(', ');
//     } else if (typeof keywords === 'string') {
//       return keywords;
//     }

//     return '';
//   };

//   const formatKeywordsForAPI = (keywordString) => {
//     if (!keywordString || typeof keywordString !== 'string') return [];

//     return keywordString
//       .split(',')
//       .map(keyword => keyword.trim())
//       .filter(keyword => keyword.length > 0);
//   };

//   const fetchCriteriaDetails = useCallback(async (caseOpts, fileTypeOpts, targetOpts, sentimentOpts) => {
//     try {
//       const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/criteria/${criteriaId}`, {
//         headers: {
//           'Authorization': `Bearer ${Token}`
//         },
//       });

//       const criteriaData = response.data.data;

//       let startDate = null;
//       let endDate = null;
//       let startTime = { hours: 16, minutes: 30 };
//       let endTime = { hours: 16, minutes: 30 };

//       if (criteriaData.start_time) {
//         const startDateTime = new Date(criteriaData.start_time);
//         startDate = startDateTime;
//         startTime = {
//           hours: startDateTime.getHours(),
//           minutes: startDateTime.getMinutes()
//         };
//       }

//       if (criteriaData.end_time) {
//         const endDateTime = new Date(criteriaData.end_time);
//         endDate = endDateTime;
//         endTime = {
//           hours: endDateTime.getHours(),
//           minutes: endDateTime.getMinutes()
//         };
//       }

//       setSelectedDates({
//         startDate,
//         endDate,
//         startTime,
//         endTime
//       });

//       const selectedCaseIds = [];
//       if (criteriaData.case_id) {
//         const caseIdsArray = Array.isArray(criteriaData.case_id) ? criteriaData.case_id : [criteriaData.case_id];

//         caseIdsArray.forEach(caseId => {
//           const matchingOption = caseOpts.find(option => option.value.toString() === caseId.toString());
//           if (matchingOption) {
//             selectedCaseIds.push(matchingOption);
//           } else {
//             selectedCaseIds.push({ value: caseId, label: `${caseId}` });
//           }
//         });
//       }

//       const selectedFileTypes = [];
//       if (criteriaData.file_type) {
//         const fileTypesArray = Array.isArray(criteriaData.file_type) ? criteriaData.file_type : [criteriaData.file_type];

//         fileTypesArray.forEach(fileType => {
//           const matchingOption = fileTypeOpts.find(option => option.value === fileType);
//           if (matchingOption) {
//             selectedFileTypes.push(matchingOption);
//           } else {
//             selectedFileTypes.push({ value: fileType, label: fileType });
//           }
//         });
//       }

//       const selectedTargets = [];
//       if (criteriaData.targets) {
//      const targetsArray = Object.keys(criteriaData.targets || {});

//   console.warn("criteriaDetailc",criteriaData.targets)
//         targetsArray.forEach(target => {
//           const matchingOption = targetOpts.find(option => option.value.toString().toLowerCase() === target.toString().toLowerCase());
//           if (matchingOption) {
//             selectedTargets.push(matchingOption);
//           } else {
//             selectedTargets.push({ value: target, label: target });
//           }
//         });
//       }

//       const selectedSentiments = [];
//       if (criteriaData.sentiments) {
//         const sentimentArray = Array.isArray(criteriaData.sentiments) ? criteriaData.sentiments : [criteriaData.sentiments];

//         sentimentArray.forEach(sentiment => {
//           const matchingOption = sentimentOpts.find(option => option.value.toString().toLowerCase() === sentiment.toString().toLowerCase());
//           if (matchingOption) {
//             selectedSentiments.push(matchingOption);
//           } else {
//             selectedSentiments.push({ value: sentiment, label: sentiment });
//           }
//         });
//       }

//       const processedKeywords = processKeywords(criteriaData.keyword);

//       // Update form data
//       setFormData({
//         searchQuery: processedKeywords,
//         caseIds: selectedCaseIds,
//         filetype: selectedFileTypes,
//         targets: selectedTargets,
//         sentiment: selectedSentiments,
//         latitude: criteriaData.latitude || '',
//         longitude: criteriaData.longitude || ''
//       });

//       setInitialFormData({
//         searchQuery: processedKeywords,
//         caseIds: selectedCaseIds,
//         filetype: selectedFileTypes,
//         targets: selectedTargets,
//         sentiment: selectedSentiments,
//         latitude: criteriaData.latitude || '',
//         longitude: criteriaData.longitude || '',
//         selectedDates: {
//           startDate,
//           endDate,
//           startTime,
//           endTime
//         }
//       });

//       setIsLoading(false);

//     } catch (error) {
//       console.error('Error fetching criteria details:', error);
//       setError('Failed to load criteria details.');
//       setIsLoading(false);
//       toast.error('Failed to load criteria details');
//     }
//   }, [Token, criteriaId]);

//   // Initial data fetch - Fixed dependency issue
//   useEffect(() => {
//   if (!dataFetched && Token && criteriaId) {
//     const fetchAllData = async () => {
//       setIsLoading(true);
//       try {
//         const [caseOpts, targetSentimentResult] = await Promise.all([
//           fetchCaseData(),
//           fetchTargetAndSentimentOptions()
//         ]);

//         const targetOpts = targetSentimentResult.targets || [];
//         const sentimentOpts = targetSentimentResult.sentiments || [];
//         const fileTypeOpts = targetSentimentResult.fileTypes || [];

//         await fetchCriteriaDetails(caseOpts, fileTypeOpts, targetOpts, sentimentOpts);
//         setDataFetched(true);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setError("Failed to load necessary data");
//         setIsLoading(false);
//       }
//     };

//     fetchAllData();
//   }
// }, [dataFetched, Token, criteriaId, fetchCaseData, fetchCriteriaDetails, fetchTargetAndSentimentOptions]);


//   // Handle form update submission
//   const handleUpdate = async (e) => {
//     e.preventDefault();

   
    
//     setIsSubmitting(true);
//     try {
//       const keywordsArray = formatKeywordsForAPI(formData.searchQuery);

//       const updatePayload = {
//         keyword: keywordsArray, // Now properly formatted as array
//         case_id: formData.caseIds.map(caseId => caseId.value.toString()),
//         file_type: formData.filetype.map(file => file.value.toString()),
//         targets : formData.targets.reduce((acc, target) => {
//   acc[target.value] = target.name;
//   return acc;
// }, {}),

//         sentiments: formData.sentiment.map(s => s.value.toString()),
//         latitude: formData.latitude || "",
//         longitude: formData.longitude || "",
//         start_time: selectedDates.startDate ?
//           `${selectedDates.startDate.toISOString().split('T')[0]}T${String(selectedDates.startTime.hours).padStart(2, '0')}:${String(selectedDates.startTime.minutes).padStart(2, '0')}:00`
//           : null,
//         end_time: selectedDates.endDate ?
//           `${selectedDates.endDate.toISOString().split('T')[0]}T${String(selectedDates.endTime.hours).padStart(2, '0')}:${String(selectedDates.endTime.minutes).padStart(2, '0')}:00`
//           : null
//       };

//       console.log("updatePayload", updatePayload);
//       console.log("Keywords formatted as:", keywordsArray);

//       const updateResponse = await axios.put(`${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/criteria/${criteriaId}`, updatePayload, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${Token}`
//         },
//       });

//       console.log("updateResponse", updateResponse);
//       toast.success('Criteria updated successfully');
//       togglePopup();
//       if (onUpdate) {
//         onUpdate();
//       }
//     } catch (error) {
//       console.error('Error updating criteria:', error);
//       toast.error((error.response?.data?.detail || error.message) || 'Failed to update criteria');
//     }
//     finally {
//       setIsSubmitting(false);
//     }
//   };

//   useEffect(() => {

//     const isSame =
//       formData.searchQuery.trim() === initialFormData.searchQuery &&
//       JSON.stringify(formData.caseIds.map(caseId => caseId.value.toString())) ===
//       JSON.stringify(initialFormData.caseIds.map(caseId => caseId.value.toString())) &&
//       JSON.stringify(formData.filetype.map(file => file.value.toString())) ===
//       JSON.stringify(initialFormData.filetype.map(file => file.value.toString())) &&
//       JSON.stringify(formData.targets.map(target => target.value.toString())) ===
//       JSON.stringify(initialFormData.targets.map(target => target.value.toString())) &&
//       JSON.stringify(formData.sentiment.map(s => s.value.toString())) ===
//       JSON.stringify(initialFormData.sentiment.map(s => s.value.toString())) &&
//       JSON.stringify(selectedDates) === JSON.stringify(initialFormData.selectedDates);
//     setIsBtnDisabled(isSame);
//   }, [formData, initialFormData, selectedDates]);


//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };


//   // Toggle date picker popup visibility
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

//   if (isLoading) {
//     return (
//       <div className="popup-overlay">
//         <div className="popup-container">
//           <Loader />
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="popup-overlay">
//         <div className="popup-container">
//           <button className="close-icon" onClick={togglePopup}>
//             &times;
//           </button>
//           <div className="popup-content text-center">
//             <div className="alert alert-danger" role="alert">
//               {error}
//             </div>
//             <button className="btn btn-secondary" onClick={togglePopup}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="popup-overlay">
//       <div className="popup-container">
//         <button className="close-icon" onClick={togglePopup}>
//           &times;
//         </button>
//         <div className="popup-content">
//           <h5>Edit Criteria</h5>
//           <form onSubmit={handleUpdate}>
//             {/* Search Bar */}
//             <div >
//               <span>Search Keywords </span>
//               <TextField
//                 fullWidth
//                 className={styles.searchBar}
//                 name="searchQuery"
//                 InputProps={{
//                   style: {
//                     height: '38px',
//                     color: 'white',
//                     border: '1px solid #0073CF',
//                     borderRadius: '15px',
//                   },
//                 }}
//                 placeholder="Enter keywords separated by commas (e.g., keyword1, keyword2, keyword3)"
//                 value={formData.searchQuery}
//                 onChange={handleInputChange}
//                 sx={sharedSxStyles}
//                 multiline={false}
//                 // autoComplete='off'
//               />
//               {/* {error.searchQuery && <p style={{ color: "red", margin: '0px' }} >{error.searchQuery}</p>} */}
//             </div>

//             {/* Filetype Dropdown (Multi Select) */}

//             {/* <label>Filetype</label> */}
//             <CommonMultiSelect
//               label="Source Type"
//               isMulti
//               options={fileTypeOptions}
//               customStyles={customSelectStyles}
//               value={formData.filetype}
//               onChange={(selected) => setFormData(prev => ({ ...prev, filetype: selected || [] }))}
//               placeholder="Select file types"
//               isLoading={fileTypeOptions.length === 0}
//             />

//             <CommonMultiSelect
//               label="Case"
//               isMulti
//               options={caseOptions}
//               customStyles={customSelectStyles}
//               value={formData.caseIds}
//               onChange={(selected) => setFormData(prev => ({ ...prev, caseIds: selected || [] }))}
//               placeholder="Select cases"
//               isLoading={caseOptions.length === 0}
//             />

//             <CommonMultiSelect
//               label="Target"
//               isMulti
//               options={targetOptions}
//               customStyles={customSelectStyles}
//               value={formData.targets}
//               onChange={(selected) => setFormData(prev => ({ ...prev, targets: selected || [] }))}
//               placeholder="Select targets"
//               isLoading={targetOptions.length === 0}
//             />

//             <CommonMultiSelect
//               label="Sentiment"
//               isMulti
//               options={sentimentOptions}
//               customStyles={customSelectStyles}
//               value={formData.sentiment}
//               onChange={(selected) => setFormData(prev => ({ ...prev, sentiment: selected || [] }))}
//               placeholder="Select sentiment"
//               isLoading={sentimentOptions.length === 0}
//             />


//             {/* DatePicker */}

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
//             {/* Update Button */}
//             <div className="button-container d-flex gap-2" style={{ textAlign: 'center' }}>
//               <AppButton
//                 type="submit"

//                 disabled={isBtnDisabled || isSubmitting}
//               >
//                 {isSubmitting ? 'Editing...' : 'Edit'}
//               </AppButton>
//               <AppButton
//                 type="button"

//                 onClick={togglePopup}
//               >
//                 Cancel
//               </AppButton>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Date Picker Popup */}
//       {showPopupD && (
//         <DatePickera
//           onSubmit={handleDateSelection}
//           initialDates={selectedDates}
//           onClose={togglePopupA}
//         />
//       )}
//     </div>
//   );
// };
// EditCriteria.propTypes = {
//   togglePopup: PropTypes.func.isRequired,
//   criteriaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//   onUpdate: PropTypes.func
// };
// export default EditCriteria;

