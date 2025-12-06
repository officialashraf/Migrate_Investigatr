import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { setKeywords, setPage, setSearchResults } from '../../../Redux/Action/criteriaAction';
import CriteriaForm from '../../Common/FilterForm/CriteriaForm';
import Confirm from './confirmCriteria';
import PropTypes from 'prop-types';
import CommonLoader from '../Layout/commonLoader';

const AddNewCriteria = ({ handleCreateCase, searchChips, isPopupVisible, setIsPopupVisible }) => {
    const Token = Cookies.get('accessToken');
    const dispatch = useDispatch();
    const payload = useSelector((state) => state.criteriaKeywords?.queryPayload || {});
    console.warn("payload", payload)
    const [showSavePopup, setShowSavePopup] = useState(false);
    const [loading, setloading] = useState(true)
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [formData, setFormData] = useState({
        caseIds: [],
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
        loc: [],
        emails: [],
        event: [],
        date: [],
        person: [],
        org: [],
        language: [],
        latitude: '',
        longitude: '',
    });
    const [selectedDates, setSelectedDates] = useState({});
    const [options, setOptions] = useState({
        cases: [], platforms: [], targets: [], sentiments: [], unifiedTypes: [],
        eventTypeStrings: [],
        mobileNumbers: [],
    });

    // Fetch dropdown data
    useEffect(() => {
        const fetchOptions = async () => {

            try {
                setloading(true)
                const caseRes = await axios.get(
                    `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case`,
                    { headers: { Authorization: `Bearer ${Token}` } }
                );
                const caseOpts = caseRes.data.data.map(c => ({
                    value: c.id,
                    label: `CASE${String(c.id).padStart(4, '0')} - ${c.title || ' '}`
                }));

                const distinctRes = await axios.post(
                    `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/distinct`,
                    { fields: ['targets', 'sentiment', 'unified_record_type', 'unified_type', 'eventtypestring', 'mobilenumber', 'phone_numbers'] },
                    { headers: { Authorization: `Bearer ${Token}` } }
                );
                const sOpts = distinctRes.data.sentiment.buckets.map(b => ({ value: b.key, label: b.key }));
                const targetIds = distinctRes.data.targets.buckets.map(b => parseInt(b.key, 10)).filter(id => !isNaN(id));
                const platformOpts = distinctRes.data.unified_record_type.buckets.map(b => ({ value: b.key, label: b.key }));
                const unifiedTypeOpts = distinctRes.data.unified_type.buckets.map(b => ({ value: b.key, label: b.key }));
                // Second API - get target names using target IDs
                let tOpts = [];
                if (targetIds.length > 0) {
                    const targetRes = await axios.post(
                        `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/target-names`,
                        { target_ids: targetIds },
                        { headers: { Authorization: `Bearer ${Token}` } }
                    );

                    // API expected to return something like [{id:1,name:"X"}]
                    tOpts = targetRes.data.map(t => ({
                        value: t.id,
                        label: `TAR${String(t.id).padStart(4, '0')} - ${t.name || ' '}`,
                        name: t.name,
                    }));

                }
                setOptions({
                    cases: caseOpts, platforms: platformOpts, targets: tOpts, sentiments: sOpts, unifiedTypes: unifiedTypeOpts,
                    eventTypeStrings: distinctRes.data.eventtypestring.buckets.map(b => ({ value: b.key, label: b.key })),
                    mobileNumbers: [
                        ...(distinctRes.data.mobilenumber?.buckets || [])
                    ].map(b => ({
                        value: b.key,
                        label: b.key
                    })),
                    serverIps: distinctRes.data.serverip?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
                    socialmediaFromIds: distinctRes.data.socialmedia_from_id?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
                    socialmediaFromScreenNames: distinctRes.data.socialmedia_from_screenname?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
                    socialmediaHashtags: distinctRes.data.socialmedia_hashtags?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
                    latitude: distinctRes.data.latitude?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
                    longitude: distinctRes.data.longitude?.buckets.map(b => ({ value: b.key, label: b.key })) || [],
                });

            } catch (err) {
                console.error('Error fetching options', err);
            } finally {
                setloading(false)
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


    // Populate formData from payload
    useEffect(() => {
        if (options.cases.length > 0 || options.platforms.length > 0 || options.targets.length > 0 || options.sentiments.length > 0) {
            setFormData(prev => ({
                ...prev,

                caseIds: payload.case_id && payload.case_id.length > 0
                    ? (Array.isArray(payload.case_id) ? payload.case_id : JSON.parse(payload.case_id || '[]'))
                        .map(id => options.cases.find(opt => String(opt.value) === String(id)) || { value: id, label: id })
                    : [],
                platform: payload.file_type && payload.file_type.length > 0 && options.platforms.length > 0
                    ? options.platforms.filter(opt => payload.file_type.includes(opt.value))
                    : [],
                targets:
                    payload.targets && payload.targets.length > 0 && options.targets.length > 0
                        ? options.targets.filter(opt => {
                            // Saare payload.targets ko string bana ke compare karo
                            const normalizedTargets = payload.targets.map(t => {
                                if (typeof t === "object" && t !== null) {
                                    return String(t.value); // object ka value field
                                }
                                return String(t); // string ya integer
                            });

                            return normalizedTargets.includes(String(opt.value));
                        })
                        : [],

                sentiments: payload.sentiments && payload.sentiments.length > 0 && options.sentiments.length > 0
                    ? options.sentiments.filter(opt => payload.sentiments.includes(opt.value))
                    : [],
                unifiedType: payload.unified_type && payload.unified_type.length > 0 && options.unifiedTypes.length > 0
                    ? options.unifiedTypes.filter(opt => payload.unified_type.includes(opt.value))
                    : [],
                eventTypeString: payload.eventtypestring && payload.eventtypestring.length > 0 && options.eventTypeStrings.length > 0
                    ? options.eventTypeStrings.filter(opt => payload.eventtypestring.includes(opt.value))
                    : [],
                mobileNumber: payload.mobilenumber && payload.mobilenumber.length > 0 && options.mobileNumbers.length > 0
                    ? options.mobileNumbers.filter(opt => payload.mobilenumber.includes(opt.value))
                    : [],
                socialmediaFromId: payload.socialmedia_from_id && Array.isArray(payload.socialmedia_from_id)
                    ? payload.socialmedia_from_id.filter(v => v !== null)
                    : [],
                socialmediaFromScreenName: payload.socialmedia_from_screenname && Array.isArray(payload.socialmedia_from_screenname)
                    ? payload.socialmedia_from_screenname.filter(v => v !== null)
                    : [],
                socialmediaHashtags: payload.socialmedia_hashtags && Array.isArray(payload.socialmedia_hashtags)
                    ? payload.socialmedia_hashtags.filter(v => v !== null)
                    : [],
                loc: payload.loc && Array.isArray(payload.loc)
                    ? payload.loc.filter(v => v !== null)
                    : [],
                emails: payload.emails && Array.isArray(payload.emails)
                    ? payload.emails.filter(v => v !== null)
                    : [],
                event: payload.event && Array.isArray(payload.event)
                    ? payload.event.filter(v => v !== null)
                    : [],
                date: payload.date && Array.isArray(payload.date)
                    ? payload.date.filter(v => v !== null)
                    : [],
                person: payload.person && Array.isArray(payload.person)
                    ? payload.person.filter(v => v !== null)
                    : [],
                org: payload.org && Array.isArray(payload.org)
                    ? payload.org.filter(v => v !== null)
                    : [],
                language: payload.language && Array.isArray(payload.language)
                    ? payload.language.filter(v => v !== null)
                    : [],
                serverIp: payload.serverip && Array.isArray(payload.serverip)
                    ? payload.serverip.filter(v => v !== null)
                    : [],
                latitude: Array.isArray(payload.latitude) ? payload.latitude[0] : payload.latitude || '',
                longitude: Array.isArray(payload.longitude) ? payload.longitude[0] : payload.longitude || '',

            }));

            // Populate selected dates
            if (payload.start_time && payload.end_time) {
                const startDate = new Date(payload.start_time);
                const endDate = new Date(payload.end_time);
                setSelectedDates({
                    startDate,
                    endDate,
                    startTime: { hours: startDate.getHours(), minutes: startDate.getMinutes() },
                    endTime: { hours: endDate.getHours(), minutes: endDate.getMinutes() }
                });
            } else {
                setSelectedDates({});
            }
        }
    }, [payload, options]);

    const performSearch = async () => {
        try {
            const rangeDays = Number(window.runtimeConfig.VITE_APP_DEFAULT_RANGE_DAYS) || 180;
            const DEFAULT_END = new Date().toISOString();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - rangeDays);
            const DEFAULT_START = startDate.toISOString();
            const payloadS = {
                size: 50,
                page: 1,
                start_time: formData?.start_time || DEFAULT_START,
                end_time: formData?.end_time || DEFAULT_END,
            };

            // Only add non-empty fields

            if (searchChips?.length > 0) {
                payloadS.keyword = searchChips;
            }
            if (formData.caseIds && formData.caseIds.length > 0) {
                payloadS.case_id = formData.caseIds.map(c => String(c.value));
            }

            if (formData.platform && formData.platform.length > 0) {
                payloadS.file_type = formData.platform.map(p => p.value);
            }

            if (formData.targets && formData.targets.length > 0) {
                payloadS.targets = formData.targets.map(t => String(t.value));
            }

            if (formData.sentiments && formData.sentiments.length > 0) {
                payloadS.sentiments = formData.sentiments.map(s => s.value);
            }

            if (selectedDates.startDate && selectedDates.startTime) {
                payloadS.start_time = formatDate(selectedDates.startDate, selectedDates.startTime);
            }

            if (selectedDates.endDate && selectedDates.endTime) {
                payloadS.end_time = formatDate(selectedDates.endDate, selectedDates.endTime);
            }
            if (formData.unifiedType && formData.unifiedType.length > 0) {
                payloadS.unified_type = formData.unifiedType.map(u => u.value);
            }
            if (formData.eventTypeString && formData.eventTypeString.length > 0) {
                payloadS.eventtypestring = formData.eventTypeString.map(e => e.value);
            }
            if (formData.mobileNumber && formData.mobileNumber.length > 0) {
                payloadS.mobilenumber = formData.mobileNumber.map(m => m.value);
            }
            if (formData.socialmediaFromId && formData.socialmediaFromId.length > 0) {
                payloadS.socialmedia_from_id = formData.socialmediaFromId;
            }
            if (formData.socialmediaFromScreenName && formData.socialmediaFromScreenName.length > 0) {
                payloadS.socialmedia_from_screenname = formData.socialmediaFromScreenName;
            }
            if (formData.socialmediaHashtags && formData.socialmediaHashtags.length > 0) {
                payloadS.socialmedia_hashtags = formData.socialmediaHashtags;
            }
            if (formData.serverIp && formData.serverIp.length > 0) {
                payloadS.serverip = formData.serverIp;
            }
            if (formData.latitude) {
                payloadS.latitude = formData.latitude;
            }
            if (formData.longitude) {
                payloadS.longitude = formData.longitude;
            }
            if (formData.loc && formData.loc.length > 0) {
                payloadS.loc = formData.loc;
            }
            if (formData.emails && formData.emails.length > 0) {
                payloadS.emails = formData.emails;
            }
            if (formData.event && formData.event.length > 0) {
                payloadS.event = formData.event;
            }
            if (formData.date && formData.date.length > 0) {
                payloadS.date = formData.date;
            }
            if (formData.person && formData.person.length > 0) {
                payloadS.person = formData.person;
            }
            if (formData.org && formData.org.length > 0) {
                payloadS.org = formData.org;
            }
            if (formData.language && formData.language.length > 0) {
                payloadS.language = formData.language;
            }


            const res = await axios.post(
                `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
                payloadS,
                { headers: { Authorization: `Bearer ${Token}` } }
            );
            dispatch(setSearchResults({
                results: res.data.results,
                total_pages: res.data.total_pages || 1,
                total_results: res.data.total_results || 0
            }));
            dispatch(setKeywords({
                keyword: searchChips,
                queryPayload: {
                    case_id: payloadS.case_id || [],
                    file_type: payloadS.file_type || [],
                    keyword: searchChips || [],
                    targets: formData.targets || [],
                    sentiment: payloadS.sentiments || [],
                    unified_type: payloadS.unified_type || [],
                    eventtypestring: payloadS.eventtypestring || [],
                    mobilenumber: payloadS.mobilenumber || [],
                    socialmedia_from_id: payloadS.socialmedia_from_id || [],
                    socialmedia_from_screenname: payloadS.socialmedia_from_screenname || [],
                    socialmedia_hashtags: payloadS.socialmedia_hashtags || [],
                    serverip: payloadS.serverip || [],
                    start_time: payloadS.start_time ?? null,
                    end_time: payloadS.end_time ?? null,
                    latitude: payloadS.latitude ?? null,
                    longitude: payloadS.longitude ?? null,
                    loc: payloadS.loc || [],
                    emails: payloadS.emails || [],
                    event: payloadS.event || [],
                    date: payloadS.date || [],
                    person: payloadS.person || [],
                    org: payloadS.org || [],
                    language: payloadS.language || [],
                    page: payloadS.page ?? 1,
                    size: 50,
                }
            }));

            console.log("payloadS", payloadS)

            dispatch(setPage(1));
            if (handleCreateCase) handleCreateCase(res.data);
            setIsPopupVisible(false);
        } catch (err) {
            console.error('Error in search', err);
        }
    };

    if (!isPopupVisible) return null;
    if (loading) return <CommonLoader />;
    return (
        <>
            <CriteriaForm
                title="Filter Criteria"
                caseFieldConfig={{ show: false, readOnly: false }}
                options={options}
                formData={formData}
                setFormData={setFormData}
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
                toggleDatePicker={() => setShowDatePicker(p => !p)}
                showDatePicker={showDatePicker}
                onSearch={performSearch}
                onCreate={() => setShowSavePopup(true)}
                onCancel={() => setIsPopupVisible(false)}
                showCreateButton={true}
                isSearchDisabled={
                    !formData.caseIds.length &&
                    !formData.platform.length &&
                    !formData.targets.length &&
                    !formData.sentiments.length &&
                    !formData.unifiedType.length &&
                    !formData.eventTypeString.length &&
                    !formData.mobileNumber.length &&
                    !formData.socialmediaFromId.length &&
                    !formData.socialmediaFromScreenName.length &&
                    !formData.socialmediaHashtags.length &&
                    !formData.serverIp.length &&
                    !formData.latitude &&
                    !formData.longitude &&
                    !(selectedDates.startDate && selectedDates.endDate)
                }
            />
            {
                showSavePopup && (
                    <Confirm
                        formData={formData}
                        selectedDates={selectedDates}
                        onClose={() => setShowSavePopup(false)}
                        searchChips={searchChips}
                        onCancel={() => {
                            setShowSavePopup(false);
                            setIsPopupVisible(false);
                        }}
                    />
                )
            }
        </>
    );
};
AddNewCriteria.propTypes = {
    handleCreateCase: PropTypes.func,
    searchChips: PropTypes.array,
    isPopupVisible: PropTypes.bool.isRequired,
    setIsPopupVisible: PropTypes.func.isRequired
};
export default AddNewCriteria;


