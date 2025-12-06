import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { saveReportilterPayload, setReportResults } from '../../../Redux/Action/reportAction';
import { setPage } from '../../../Redux/Action/criteriaAction';
import CriteriaForm from '../../Common/FilterForm/CriteriaForm';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import CommonLoader from '../Layout/commonLoader';

const ReportFilter = ({ searchChips, isPopupVisible, setIsPopupVisible }) => {
  const Token = Cookies.get('accessToken');
  const dispatch = useDispatch();
  const reportFilter = useSelector(state => state.reportFilter?.reportFilters);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    platform: [],
    targets: [],
    sentiments: [],
    caseIds: [],
    unifiedType: [],
    eventTypeString: [],
    mobileNumber: [],
    socialmediaHashtags: [],
    socialmediaFromId: [],
    socialmediaFromScreenName: [],
    serverIp: [],
    latitude: "",    
    longitude: "",
  });
  console.log("formdtaCaseIds", formData)
  const [selectedDates, setSelectedDates] = useState({});
  const [options, setOptions] = useState({
    platforms: [],
    targets: [],
    sentiments: [],
    cases: [],
    unifiedTypes: [],
    eventTypeStrings: [],
    mobileNumbers: [],
  });

  // Fetch all available options (not case-specific for reports)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const caseResponse = await axios.get(
          `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case`,
          { headers: { Authorization: `Bearer ${Token}` } }
        );

        const caseOptions = caseResponse.data.data.map(caseItem => ({
          value: caseItem.id,
          label: `CASE${String(caseItem.id).padStart(4, '0')} - ${caseItem.title || 'Untitled'}`
        }));

        // Get distinct data for platforms, targets, sentiments
        const distinctResponse = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/distinct`,
          { fields: ['targets', 'sentiment', 'unified_record_type', 'unified_type', 'eventtypestring', 'mobilenumber', 'phone_numbers'] },
          { headers: { Authorization: `Bearer ${Token}` } }
        );

        const targetIds = distinctResponse.data.targets?.buckets
          ?.map(b => parseInt(b.key, 10))
          ?.filter(id => !isNaN(id)) || [];

        // Get target names if we have target IDs
        let targetOptions = [];
        if (targetIds.length > 0) {
          const targetResponse = await axios.post(
            `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/target-names`,
            { target_ids: targetIds },
            { headers: { Authorization: `Bearer ${Token}` } }
          );

          targetOptions = targetResponse.data.map(t => ({
            value: t.id,
            label: `TAR${String(t.id).padStart(4, '0')} - ${t.name || ' '}`,
            name: t.name,
          }));
        }

        setOptions({
          platforms: distinctResponse.data.unified_record_type?.buckets?.map(b => ({
            value: b.key,
            label: b.key
          })) || [],
          targets: targetOptions,
          sentiments: distinctResponse.data.sentiment?.buckets?.map(b => ({
            value: b.key,
            label: b.key
          })) || [],
          unifiedTypes: distinctResponse.data.unified_type?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
          eventTypeStrings: distinctResponse.data.eventtypestring?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
          mobileNumbers: [
            ...(distinctResponse.data.mobilenumber?.buckets || []),
            ...(distinctResponse.data.phone_numbers?.buckets || [])
          ].map(b => ({
            value: b.key,
            label: b.key
          })),
          cases: caseOptions
        });
      } catch (err) {
        console.error('Error fetching filter data', err);
      } finally {
        setLoading(false)
      }
    };

    if (Token) fetchOptions();
  }, [Token]);

  const formatDate = (date, time) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(time.hours).padStart(2, "0");
    const minutes = String(time.minutes).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  // Set defaults from existing filter
  useEffect(() => {
    if (options.platforms.length && reportFilter?.file_type) {
      setFormData(prev => ({
        ...prev,
        platform: options.platforms.filter(opt => reportFilter.file_type.includes(opt.value))
      }));
    }

    if (options.targets.length && reportFilter?.target) {
      const reportFilterTargetValues = reportFilter.target.map(t => {
        if (typeof t === "object" && t !== null) {
          return String(t.value);
        }
        return String(t);
      });

      setFormData(prev => ({
        ...prev,
        targets: options.targets
          .filter(opt => reportFilterTargetValues.includes(String(opt.value)))
          .map(opt => ({
            value: opt.value,
            label: opt.label,
            name: opt.name
          }))
      }));
    }

    if (options.sentiments.length && reportFilter?.sentiment) {
      setFormData(prev => ({
        ...prev,
        sentiments: options.sentiments.filter(opt => reportFilter.sentiment.includes(opt.value))
      }));
    }
    if (options.cases.length && reportFilter?.case_id) {
      setFormData(prev => ({
        ...prev,
        caseIds: options.cases.filter(opt =>
          reportFilter.case_id.includes(String(opt.value))
        )
      }));
    }
    if (options.unifiedTypes.length && reportFilter?.unified_type) {
      setFormData(prev => ({
        ...prev,
        unifiedType: options.unifiedTypes.filter(opt => reportFilter.unified_type.includes(opt.value))
      }));
    }
    if (options.eventTypeStrings.length && reportFilter?.eventtypestring) {
      setFormData(prev => ({
        ...prev,
        eventTypeString: options.eventTypeStrings.filter(opt => reportFilter.eventtypestring.includes(opt.value))
      }));
    }
    if (options.mobileNumbers.length && reportFilter?.mobilenumber) {
      setFormData(prev => ({
        ...prev,
        mobileNumber: options.mobileNumbers.filter(opt => reportFilter.mobilenumber.includes(opt.value))
      }));
    }

    if (reportFilter?.socialmedia_hashtags) {
      setFormData(prev => ({
        ...prev,
        socialmediaHashtags: Array.isArray(reportFilter.socialmedia_hashtags)
          ? reportFilter.socialmedia_hashtags : [reportFilter.socialmedia_hashtags]
      }));
    }
    if (reportFilter?.socialmedia_from_id) {
      setFormData(prev => ({
        ...prev,
        socialmediaFromId: Array.isArray(reportFilter.socialmedia_from_id)
          ? reportFilter.socialmedia_from_id : [reportFilter.socialmedia_from_id]
      }));
    }
    if (reportFilter?.socialmedia_from_screenname) {
      setFormData(prev => ({
        ...prev,
        socialmediaFromScreenName: Array.isArray(reportFilter.socialmedia_from_screenname)
          ? reportFilter.socialmedia_from_screenname : [reportFilter.socialmedia_from_screenname]
      }));
    }
    if (reportFilter?.serverip) {
      setFormData(prev => ({
        ...prev,
        serverIp: Array.isArray(reportFilter.serverip)
          ? reportFilter.serverip : [reportFilter.serverip]
      }));
    }
    if (reportFilter?.latitude) {
      setFormData(prev => ({
        ...prev,
        latitude: String(reportFilter.latitude)
      }));
    }

    if (reportFilter?.longitude) {
      setFormData(prev => ({
        ...prev,
        longitude: String(reportFilter.longitude)
      }));
    }

    if (reportFilter?.start_time && reportFilter?.end_time) {
      const startDate = new Date(reportFilter.start_time);
      const endDate = new Date(reportFilter.end_time);
      setSelectedDates({
        startDate,
        endDate,
        startTime: { hours: startDate.getHours(), minutes: startDate.getMinutes() },
        endTime: { hours: endDate.getHours(), minutes: endDate.getMinutes() }
      });
    }
  }, [options, reportFilter]);

  const performSearch = async () => {

    try {
      // Build query object
      const queryObject = {
        report_generation: true,
        size: 50,
        page: 1,
      };

      if (searchChips?.length > 0) {
        queryObject.keyword = searchChips;
      }

      if (formData.platform?.length > 0) {
        queryObject.file_type = formData.platform.map(p => p.value);
      }

      if (formData.targets?.length > 0) {
        queryObject.targets = formData.targets.map(t => String(t.value));
      }

      if (formData.sentiments?.length > 0) {
        queryObject.sentiments = formData.sentiments.map(s => s.value);
      }
      if (formData.unifiedType?.length > 0) {
        queryObject.unified_type = formData.unifiedType.map(ut => ut.value);
      }
      if (formData.eventTypeString?.length > 0) {
        queryObject.eventtypestring = formData.eventTypeString.map(ets => ets.value);
      }
      if (formData.mobileNumber?.length > 0) {
        queryObject.mobilenumber = formData.mobileNumber.map(mn => mn.value);
      }
      if (formData.socialmediaHashtags?.length > 0) {
        queryObject.socialmedia_hashtags = formData.socialmediaHashtags;
      }

      if (formData.socialmediaFromId?.length > 0) {
        queryObject.socialmedia_from_id = formData.socialmediaFromId;
      }

      if (formData.socialmediaFromScreenName?.length > 0) {
        queryObject.socialmedia_from_screenname = formData.socialmediaFromScreenName;
      }

      if (formData.serverIp?.length > 0) {
        queryObject.serverip = formData.serverIp;
      }
      if (formData.latitude) {
        queryObject.latitude = formData.latitude; 
      }

      if (formData.longitude) {
        queryObject.longitude = formData.longitude;
      }

      if (formData.caseIds?.length > 0) {
        queryObject.case_id = formData.caseIds.map(c => String(c.value));
        console.log("pass", queryObject.case_id)
      }
      console.log("selecrDtaes Before", selectedDates)
      if (
        selectedDates.startDate &&
        selectedDates.startTime &&
        selectedDates.endDate &&
        selectedDates.endTime
      ) {
        queryObject.start_time = formatDate(selectedDates.startDate, selectedDates.startTime);
        queryObject.end_time = formatDate(selectedDates.endDate, selectedDates.endTime);
      }
      console.log("selecrDtaes After", queryObject.start_time, queryObject.end_time)
      // Make API call
      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
        queryObject, // Send query object for now
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Token}`
          }
        }
      );

      // Update Redux with results
      dispatch(setReportResults({
        page: response.data.page,
        results: response.data.results,
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
      }));

      // Save filter state to Redux
      dispatch(saveReportilterPayload({
        keyword: queryObject.keyword || [],
        file_type: queryObject.file_type || [],
        target: formData.targets || [],
        sentiment: queryObject.sentiments || [],
        case_id: queryObject.case_id,   //  only IDs
        start_time: queryObject.start_time || null,
        end_time: queryObject.end_time || null,
        unified_type: queryObject.unified_type || [],
        eventtypestring: queryObject.eventtypestring || [],
        mobilenumber: queryObject.mobilenumber || [],
        socialmedia_hashtags: queryObject.socialmedia_hashtags || [], // Correct: should use queryObject key (which is correct snake_case array)
        socialmedia_from_id: queryObject.socialmedia_from_id || [],   // Correct
        socialmedia_from_screenname: queryObject.socialmedia_from_screenname || [], // Correct
        serverip: queryObject.serverip || [],
        latitude: queryObject.latitude || "",
        longitude: queryObject.longitude || "",
      }));


      dispatch(setPage(1));
      setIsPopupVisible(false);

    } catch (error) {
      console.error('Error performing filtered search:', error);
      toast.error('Error performing search');
    }
  };

  if (!isPopupVisible) return null;
  if (loading) return <CommonLoader />;
  return (
    <CriteriaForm
      title="Report Filter"
      caseFieldConfig={{ show: false }} // Don't show case field as it's in the form
      options={{
        platforms: options.platforms,
        targets: options.targets,
        sentiments: options.sentiments,
        unifiedTypes: options.unifiedTypes,
        eventTypeStrings: options.eventTypeStrings,
        mobileNumbers: options.mobileNumbers,
        cases: options.cases
      }}
      formData={{
        platform: formData.platform,
        targets: formData.targets,
        sentiments: formData.sentiments,
        unifiedType: formData.unifiedType,
        eventTypeString: formData.eventTypeString,
        mobileNumber: formData.mobileNumber,
        socialmediaHashtags: formData.socialmediaHashtags,
        socialmediaFromId: formData.socialmediaFromId,
        socialmediaFromScreenName: formData.socialmediaFromScreenName,
        serverIp: formData.serverIp,
        caseIds: formData.caseIds,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }}
      setFormData={setFormData}
      selectedDates={selectedDates}
      setSelectedDates={setSelectedDates}
      toggleDatePicker={() => setShowDatePicker(p => !p)}
      showDatePicker={showDatePicker}
      onSearch={performSearch}
      onCancel={() => setIsPopupVisible(false)}
      showCreateButton={false}
      isSearchDisabled={
        (!formData.platform || formData.platform.length === 0) &&
        (!formData.targets || formData.targets.length === 0) &&
        (!formData.sentiments || formData.sentiments.length === 0) &&
        (!formData.caseIds || formData.caseIds.length === 0) &&
        (!selectedDates.startDate || !selectedDates.endDate) &&
        (!searchChips || searchChips.length === 0) &&
        (!formData.unifiedType || formData.unifiedType.length === 0) &&
        (!formData.eventTypeString || formData.eventTypeString.length === 0) &&
        (!formData.mobileNumber || formData.mobileNumber.length === 0) &&
        (!formData.socialmediaHashtags || formData.socialmediaHashtags.length === 0) &&
        (!formData.socialmediaFromId || formData.socialmediaFromId.length === 0) &&
        (!formData.socialmediaFromScreenName || formData.socialmediaFromScreenName.length === 0) &&
        (!formData.serverIp || formData.serverIp.length === 0)  &&
        (!formData.latitude || formData.latitude.length === 0) &&
        (!formData.longitude || formData.longitude.length === 0 )
      }
    />
  );
};
ReportFilter.propTypes = {
  searchChips: PropTypes.array.isRequired,
  isPopupVisible: PropTypes.bool.isRequired,
  setIsPopupVisible: PropTypes.func.isRequired,
};
export default ReportFilter;