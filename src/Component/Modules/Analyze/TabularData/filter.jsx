import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSummaryData } from '../../../../Redux/Action/filterAction';
import { saveCaseFilterPayload } from '../../../../Redux/Action/caseAction';
import CriteriaForm from '../../../Common/FilterForm/CriteriaForm';
import PropTypes from 'prop-types';
import { SET_CURRENT_PAGE, SET_PAGINATION } from '../../../../Redux/Constants/filterConstant';

const AddFilter = ({ searchChips, isPopupVisible, setIsPopupVisible }) => {
  const Token = Cookies.get('accessToken');
  const dispatch = useDispatch();
  const caseId = useSelector(state => state.caseData.caseData.id);
  const caseFilter = useSelector(state => state.caseFilter?.caseFilters);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    platform: [],
    targets: [],
    sentiments: [],
    unifiedType: [],
    eventTypeString: [],
    mobileNumber: [],
    socialmediaHashtags: [],
    socialmediaFromId: [],
    socialmediaFromScreenName: [],
    serverIp: [],
    latitude: '',      
    longitude: '',    
  });
  const [selectedDates, setSelectedDates] = useState({});
  const [options, setOptions] = useState({
    platforms: [], targets: [], sentiments: [], unifiedTypes: [],
    eventTypeStrings: [],
    mobileNumbers: [],
  });
  const [, setLoading] = useState(true);


  // Fetch dropdown options for current case
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        // First API - get distinct data including target IDs
        const res = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/distinct`,
          { fields: ['targets', 'sentiment', 'unified_record_type', 'unified_type', 'eventtypestring', 'mobilenumber', 'phone_numbers'], case_id: [String(caseId)] },
          { headers: { Authorization: `Bearer ${Token}` } }
        );

        const targetIds = res.data.targets.buckets.map(b => parseInt(b.key, 10)).filter(id => !isNaN(id));

        // Second API - get target names using target IDs
        let targetOptions = [];
        if (targetIds.length > 0) {
          const targetRes = await axios.post(
            `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/target-names`,
            { target_ids: targetIds },
            { headers: { Authorization: `Bearer ${Token}` } }
          );

          // API expected to return something like [{id:1,name:"X"}]
          targetOptions = targetRes.data.map(t => ({
            value: t.id,
            label: `TAR${String(t.id).padStart(4, '0')} - ${t.name || ' '}`,
            name: t.name,
          }));
        }
        console.log("targetnmas", targetOptions)
        // Set all options
        setOptions({
          platforms: res.data.unified_record_type.buckets.map(b => ({ value: b.key, label: b.key })),
          targets: targetOptions,
          sentiments: res.data.sentiment.buckets.map(b => ({ value: b.key, label: b.key })),
          unifiedTypes: res.data.unified_type?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
          eventTypeStrings: res.data.eventtypestring?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
           mobileNumbers : [
  ...(res.data.mobilenumber?.buckets || []),
  ...(res.data.phone_numbers?.buckets || [])
].map(b => ({
  value: b.key,
  label: b.key
}))

        });
        console.log("setoptions", options)
      } catch (err) {
        console.error('Error fetching filter data', err);
      } finally {
        setLoading(false);
      }
    };

    if (Token && caseId) fetchOptions();
  }, [Token, caseId]);

  const formatDate = (date, time) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); 
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(time.hours).padStart(2, "0");
    const minutes = String(time.minutes).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  useEffect(() => {
    if (options.platforms.length && caseFilter?.file_type) {
      setFormData(prev => ({ ...prev, platform: options.platforms.filter(opt => caseFilter.file_type.includes(opt.value)) }));
    }
    if (options.targets.length && caseFilter?.target) {
      const caseFilterTargetValues = caseFilter.target.map(t => {
        if (typeof t === "object" && t !== null) {
          return String(t.value); // object type
        }
        return String(t); // integer ya string type
      });

      setFormData(prev => ({
        ...prev,
        targets: options.targets
          .filter(opt => caseFilterTargetValues.includes(String(opt.value)))
          .map(opt => ({
            value: opt.value,
            label: opt.label,
            name: opt.name
          }))
      }));
    }
    if (options.sentiments.length && caseFilter?.sentiment) {
      setFormData(prev => ({ ...prev, sentiments: options.sentiments.filter(opt => caseFilter.sentiment.includes(opt.value)) }));
    }
    if (options.unifiedTypes.length && caseFilter?.unified_type) {
      setFormData(prev => ({
        ...prev,
        unifiedType: options.unifiedTypes.filter(opt => caseFilter.unified_type.includes(opt.value))
      }));
    }
    if (options.eventTypeStrings.length && caseFilter?.eventtypestring){
      setFormData(prev => ({
        ...prev,
        eventTypeString: options.eventTypeStrings.filter(opt => caseFilter.eventtypestring.includes(opt.value))
      }));
    }
    if (options.mobileNumbers.length && caseFilter?.mobilenumber) {
      setFormData(prev => ({
        ...prev,
        mobileNumber: options.mobileNumbers.filter(opt => caseFilter.mobilenumber.includes(opt.value))
      }));
    }
    if (caseFilter?.latitude) {
      setFormData(prev => ({ ...prev, latitude: String(caseFilter.latitude) }));
    }
    if (caseFilter?.longitude) {
      setFormData(prev => ({ ...prev, longitude: String(caseFilter.longitude) }));
    }
    // 🌟 Default values for TextInput fields
    if (caseFilter?.socialmedia_hashtags) {
      setFormData(prev => ({ ...prev, socialmediaHashtags: Array.isArray(caseFilter.socialmedia_hashtags) ? caseFilter.socialmedia_hashtags : [caseFilter.socialmedia_hashtags] }));
    }
    if (caseFilter?.socialmedia_from_id) {
      setFormData(prev => ({ ...prev, socialmediaFromId: Array.isArray(caseFilter.socialmedia_from_id) ? caseFilter.socialmedia_from_id : [caseFilter.socialmedia_from_id] }));
    }
    if (caseFilter?.socialmedia_from_screenname) {
      setFormData(prev => ({ ...prev, socialmediaFromScreenName: Array.isArray(caseFilter.socialmedia_from_screenname) ? caseFilter.socialmedia_from_screenname : [caseFilter.socialmedia_from_screenname] }));
    }
    if (caseFilter?.serverip) {
      setFormData(prev => ({ ...prev, serverIp: Array.isArray(caseFilter.serverip) ? caseFilter.serverip : [caseFilter.serverip] }));
    }
    if (caseFilter?.start_time && caseFilter?.end_time) {
      const startDate = new Date(caseFilter.start_time);
      const endDate = new Date(caseFilter.end_time);
      setSelectedDates({
        startDate,
        endDate,
        startTime: { hours: startDate.getHours(), minutes: startDate.getMinutes() },
        endTime: { hours: endDate.getHours(), minutes: endDate.getMinutes() }
      });
    }
  }, [options, caseFilter]);

  const performSearch = () => {
    const payload = {
      case_id: String(caseId),
      page: 1, 
      itemsPerPage: 50
    };

    if (formData.platform?.length > 0) {
      payload.file_type = formData.platform.map(p => p.value);
    }

    if (formData.targets?.length > 0) {
      payload.targets = formData.targets.map(t => t.value);
    }

    if (formData.sentiments?.length > 0) {
      payload.sentiments = formData.sentiments.map(s => s.value);
    }
    if (formData.unifiedType?.length > 0) {
      payload.unified_type = formData.unifiedType.map(ut => ut.value);
    }

    if (formData.eventTypeString?.length > 0) {
      payload.eventtypestring = formData.eventTypeString.map(ets => ets.value);
    }

    if (formData.mobileNumber?.length > 0) {
      payload.mobilenumber = formData.mobileNumber.map(n => n.value);
    }
    if (formData.latitude) {
      payload.latitude = formData.latitude;
    }
    if (formData.longitude) {
      payload.longitude = formData.longitude;
    }
  
    const toArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.flat().map(v => v?.trim?.() || v);
      return [value?.trim?.() || value];
    };

    // 🌟 Correctly handle text input fields
    payload.socialmedia_hashtags = toArray(formData.socialmediaHashtags);
    payload.socialmedia_from_id = toArray(formData.socialmediaFromId);
    payload.socialmedia_from_screenname = toArray(formData.socialmediaFromScreenName);
    payload.serverip = toArray(formData.serverIp);

    if (
      selectedDates.startDate &&
      selectedDates.startTime &&
      selectedDates.endDate &&
      selectedDates.endTime
    ) {
      payload.starttime = formatDate(selectedDates.startDate, selectedDates.startTime);
      payload.endtime = formatDate(selectedDates.endDate, selectedDates.endTime);
    }

    if (searchChips?.length > 0) {
      payload.keyword = searchChips;
    }

    if (formData.targets?.length > 0) {
      payload.targets = formData.targets.map(t => String(t.value));
    }


    // If there's only case_id, skip dispatch
    if (Object.keys(payload).length === 1) {
      console.warn('No filter criteria selected');
      return;
    }

    dispatch(fetchSummaryData(payload));
    dispatch({
      type: SET_PAGINATION,
      payload: { page: 1 }, // ya jo bhi page number ho
    });

    console.log("fetchSummaryData....", payload)
    dispatch(saveCaseFilterPayload({
      keyword: payload.keyword || [],
      aggs_fields: caseFilter?.aggs_fields || [],
      caseId,
      file_type: payload.file_type || [],
      target: formData.targets || [],
      sentiment: payload.sentiments || [],
      start_time: payload.starttime || null,
      end_time: payload.endtime || null,
      unified_type: payload.unified_type || [],
      eventtypestring: payload.eventtypestring || [],
      mobilenumber: payload.mobilenumber || [],
      socialmedia_hashtags: payload.socialmedia_hashtags || [], // Correct: should use payload key (which is correct snake_case array)
      socialmedia_from_id: payload.socialmedia_from_id || [],   // Correct
      socialmedia_from_screenname: payload.socialmedia_from_screenname || [], // Correct
      serverip: payload.serverip || [],
      latitude: payload.latitude || null,
      longitude: payload.longitude || null,
    }));

    setIsPopupVisible(false);
  };

  if (!isPopupVisible) return null;


  return (
    <CriteriaForm
      title="Filter Criteria"
      caseTitle="Case Filter Criteria"
      caseFieldConfig={{ show: true, readOnly: true, value: caseId }}
      options={options}
      formData={formData}
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
        (!selectedDates.startDate || !selectedDates.endDate) &&
        (!formData.unifiedType || formData.unifiedType.length === 0) &&
        (!formData.eventTypeString || formData.eventTypeString.length === 0) &&
        (!formData.mobileNumber || formData.mobileNumber.length === 0) &&
        (!formData.socialmediaHashtags) &&
        (!formData.socialmediaFromId) &&
        (!formData.socialmediaFromScreenName) &&
        (!formData.latitude) &&
        (!formData.longitude) &&
        (!formData.serverIp)
      }
    />
  );
};
AddFilter.propTypes = {
  searchChips: PropTypes.array.isRequired,
  isPopupVisible: PropTypes.bool.isRequired,
  setIsPopupVisible: PropTypes.func.isRequired,
};
export default AddFilter;
