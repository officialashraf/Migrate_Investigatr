import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "../User/addUser.module.css";
import { CloseButton } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { openPopup } from "../../../Redux/Action/criteriaAction";
import { useAutoFocusWithManualAutofill } from "../../../utils/autoFocus";
import AppButton from "../../Common/Buttton/button";
import CommonTextInput from "../../Common/MultiSelect/CommonTextInput";
import PropTypes from "prop-types";

const Confirm = ({
  formData,
  selectedDates,
  searchChips,
  onClose,
  onCancel,
}) => {
  const dispatch = useDispatch();
  const Token = Cookies.get("accessToken");
  const { inputRef, isReadOnly, handleFocus } =
    useAutoFocusWithManualAutofill();
  // const [isVisible, setIsVisible] = useState(true);
  const [searchTitle, setSearchTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveCriteria = async () => {
    let keywordSource = formData.searchQuery || searchChips;
    console.log("keys", keywordSource);
    setIsSubmitting(true);
    try {
      if (searchTitle.trim() === "") {
        toast.info("Please enter the title");
        setIsSubmitting(false);
        return;
      }
      const criteriaPaylod = {
        title: searchTitle || "",
        keyword: Array.isArray(keywordSource)
          ? keywordSource
          : keywordSource
          ? [keywordSource]
          : [],
        case_id:
          formData.caseIds?.length > 0
            ? formData.caseIds.map((caseId) => caseId.value.toString())
            : [],
        file_type: [
          ...(formData.filetype?.length > 0
            ? formData.filetype.map((file) => file.value)
            : []),
          ...(formData.platform?.length > 0
            ? formData.platform.map((platform) => platform.value)
            : []),
        ],
        targets:
          formData.targets?.length > 0
            ? formData.targets.reduce((acc, target) => {
                acc[String(target.value)] = String(target.name);
                return acc;
              }, {})
            : {},
        sentiments: 
          formData.sentiment?.length > 0 
            ? formData.sentiment.map((s) => s.value) 
            : [],

        unified_type: 
          formData.unified_type?.length > 0 
            ? formData.unified_type.map((u) => u.value) 
            : [],

        loc: 
          formData.loc?.length > 0 
            ? formData.loc.map((e) => e.value) 
            : [],
        emails: 
          formData.emails?.length > 0 
            ? formData.emails.map((e) => e.value) 
            : [],
        event: 
          formData.event?.length > 0 
            ? formData.event.map((e) => e.value) 
            : [],
        date: 
          formData.date?.length > 0 
            ? formData.date.map((e) => e.value) 
            : [],
        person: 
          formData.person?.length > 0 
            ? formData.person.map((e) => e.value) 
            : [],
        org: 
          formData.org?.length > 0 
            ? formData.org.map((e) => e.value) 
            : [],
        language: 
          formData.language?.length > 0 
            ? formData.language.map((e) => e.value) 
            : [],
        eventtypestring: 
          formData.eventtypestring?.length > 0 
            ? formData.eventtypestring.map((e) => e.value) 
            : [],

        mobilenumber: 
          formData.mobilenumber?.length > 0 
            ? formData.mobilenumber.map((m) => m.value) 
            : [],

        // Text Inputs are passed as strings
        socialmedia_hashtags: formData.socialmedia_hashtags || "",
        socialmedia_from_id: formData.socialmedia_from_id || "",
        socialmedia_from_screenname: formData.socialmedia_from_screenname || "", 
        serverip: formData.serverip || "",

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

      const filteredPayload = Object.fromEntries(
        Object.entries(criteriaPaylod).filter(([_, value]) => {
          if (value === null || value === undefined) return false;
          if (typeof value === "string" && value.trim() === "") return false;
          if (Array.isArray(value) && value.length === 0) return false;
          if (typeof value === "object" && Object.keys(value).length === 0) return false;
          return true;
        })
      );
      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/criteria`,
        filteredPayload,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${Token}`,
          },
        }
      );

      toast.success("Criteria saved successfully");

      console.log("Criteria saved successfully:", response.data); // Debug: API response
      // setIsVisible(false)
      onClose();
      dispatch(openPopup("recent"));
      if (typeof onCancel === "function") {
        onCancel();
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Error saving criteria");
      console.error("Error saving criteria:", error); // Debug: Error log
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="popup-overlay"
      style={{
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1050,
      }}
    >
      <div
        className="popup-container"
        style={{ display: "flex", alignItems: "center" }}
      >
        <div className="popup-content" style={{ width: "100%" }}>
          <span
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              color: "white",
            }}
          >
            <h5>Save Criteria</h5>
            <CloseButton variant="white" onClick={onClose} />
          </span>
          <form onSubmit={(e) => e.preventDefault()}>
            <CommonTextInput
              label="Search Title *"
              type="text"
              placeholder="Enter title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onBlur={() => {
                setSearchTitle((prev) => {
                  if (!prev) return prev;
                  const formattedValue =
                    prev.charAt(0).toUpperCase() + prev.slice(1);
                  return formattedValue;
                });
              }}
              readOnly={isReadOnly}
              onFocus={handleFocus}
              ref={inputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveCriteria();
                }
              }}
            />
            <div className="button-container" style={{ marginTop: "15px" }}>
              <AppButton type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </AppButton>
              <AppButton
                type="submit"
                className="create-btn"
                onClick={saveCriteria}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

Confirm.propTypes = {
  onClose: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    searchQuery: PropTypes.string,
    caseIds: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
    filetype: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
      })
    ),
    platform: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
      })
    ),
    targets: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
      })
    ),
    sentiment: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
      })
    ),

    unifiedType: PropTypes.arrayOf(
      PropTypes.shape({ value: PropTypes.string })
    ),
    eventTypeString: PropTypes.arrayOf(
      PropTypes.shape({ value: PropTypes.string })
    ),
    mobilenumber: PropTypes.arrayOf(
      PropTypes.shape({ value: PropTypes.string })
    ),
    socialmediaHashtags: PropTypes.string,
    socialmedia_from_id: PropTypes.string,
    socialmedia_from_screenname: PropTypes.string,
    serverip: PropTypes.string,
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,

  selectedDates: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    startTime: PropTypes.shape({
      hours: PropTypes.number,
      minutes: PropTypes.number,
    }),
    endTime: PropTypes.shape({
      hours: PropTypes.number,
      minutes: PropTypes.number,
    }),
  }).isRequired,

  searchChips: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Confirm;


// import { useState } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { toast } from 'react-toastify';
// import '../User/addUser.module.css'
// import { CloseButton } from 'react-bootstrap';
// import { useDispatch } from 'react-redux';
// import { openPopup } from '../../../Redux/Action/criteriaAction';
// import { useAutoFocusWithManualAutofill } from '../../../utils/autoFocus';
// import AppButton from '../../Common/Buttton/button'
// import CommonTextInput from '../../Common/MultiSelect/CommonTextInput';
// import PropTypes from 'prop-types';

// const Confirm = ({ formData, selectedDates, searchChips , onClose,onCancel}) => {
//     const dispatch = useDispatch();
//     const Token = Cookies.get('accessToken');
//     const { inputRef, isReadOnly, handleFocus } = useAutoFocusWithManualAutofill();
//     // const [isVisible, setIsVisible] = useState(true);
//     const [searchTitle, setSearchTitle] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const saveCriteria = async () => {
//         let keywordSource = formData.searchQuery || searchChips;
//         console.log("keys", keywordSource)
//         setIsSubmitting(true);
//         try {

//             if (searchTitle.trim() === "") {
//                 toast.info("Please enter the title");
//                 setIsSubmitting(false);
//                 return;
//             }
//             const criteriaPaylod = {
//                 title: searchTitle || "",
//                 keyword: Array.isArray(keywordSource)
//                     ? keywordSource
//                     : keywordSource
//                         ? [keywordSource]
//                         : [],
//                 case_id: formData.caseIds?.length > 0
//                     ? formData.caseIds.map((caseId) => caseId.value.toString())
//                     : [], 
//                 file_type: [
//                     ...(formData.filetype?.length > 0 ? formData.filetype.map((file) => file.value) : []),
//                     ...(formData.platform?.length > 0 ? formData.platform.map((platform) => platform.value) : [])
//                 ],
//                 targets: formData.targets?.length > 0
//                     ? formData.targets.reduce((acc, target) => {
//                         acc[String(target.value)] = String(target.name);
//                         return acc;
//                     }, {})
//                     : {},
//                 sentiments: formData.sentiment?.length > 0
//                     ? formData.sentiment.map(s => s.value)
//                     : [],

//                 latitude: formData.latitude || "",
//                 longitude: formData.longitude || "",
//                 start_time: selectedDates.startDate
//                     ? `${selectedDates.startDate.toISOString().split('T')[0]}T${String(selectedDates.startTime.hours).padStart(2, '0')}:${String(selectedDates.startTime.minutes).padStart(2, '0')}:00`
//                     : null,
//                 end_time: selectedDates.endDate
//                     ? `${selectedDates.endDate.toISOString().split('T')[0]}T${String(selectedDates.endTime.hours).padStart(2, '0')}:${String(selectedDates.endTime.minutes).padStart(2, '0')}:00`
//                     : null,
//             };

//             const response = await axios.post(`${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/criteria`, criteriaPaylod, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${Token}`
//                 },
//             });

//             toast.success("Criteria saved successfully");

//             console.log('Criteria saved successfully:', response.data); // Debug: API response
//             // setIsVisible(false)
//             onClose()
//             dispatch(openPopup("recent"));
//             if (typeof onCancel === "function") {
//             onCancel();  
//             }
//         } catch (error) {
//             toast.error(error?.response?.data?.detail || "Error saving criteria");
//             console.error('Error saving criteria:', error); // Debug: Error log
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="popup-overlay" style={{
//             top: 0, left: 0, width: "100%", height: "100%", display: "flex",
//             justifyContent: "center", alignItems: "center", zIndex: 1050
//         }}>
//             <div className="popup-container" style={{ display: 'flex', alignItems: 'center' }}>


//                 <div className="popup-content" style={{ width: '100%' }}>

//                     <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", color: 'white' }}>
//                         <h5>Save Criteria</h5>
//                         <CloseButton variant="white" onClick={onClose} />
//                     </span>
//                     <form onSubmit={(e) => e.preventDefault()}> 

                    

//                         <CommonTextInput
//                             label="Search Title *"
//                             type="text"
//                             placeholder="Enter title"
//                             value={searchTitle}
//                             onChange={(e) => setSearchTitle(e.target.value)}
//                             onBlur={() => {
//                                 setSearchTitle((prev) => {
//                                     if (!prev) return prev;
//                                     const formattedValue = prev.charAt(0).toUpperCase() + prev.slice(1);
//                                     return formattedValue;
//                                 });
//                             }}
//                             readOnly={isReadOnly}
//                             onFocus={handleFocus}
//                             ref={inputRef}
//                             onKeyDown={(e) => {
//                                 if (e.key === 'Enter') {
//                                     e.preventDefault();
//                                     saveCriteria();
//                                 }
//                             }}
//                         />
//                         <div className="button-container" style={{ marginTop: '15px' }}>
//                             <AppButton
//                                 type="button"
//                                 className="cancel-btn"
//                                 onClick={onClose}
//                             >
//                                 Cancel
//                             </AppButton>
//                             <AppButton
//                                 type="submit"
//                                 className="create-btn"
//                                 onClick={saveCriteria}
//                                 disabled={isSubmitting} 

//                             >
//                                 {isSubmitting ? 'Saving...' : 'Save'}
//                             </AppButton>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// Confirm.propTypes = {
//     onClose: PropTypes.func.isRequired,
//     formData: PropTypes.shape({
//         searchQuery: PropTypes.string,
//         caseIds: PropTypes.arrayOf(PropTypes.shape({
//             value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//         })),
//         filetype: PropTypes.arrayOf(PropTypes.shape({
//             value: PropTypes.string
//         })),
//         platform: PropTypes.arrayOf(PropTypes.shape({
//             value: PropTypes.string
//         })),
//         targets: PropTypes.arrayOf(PropTypes.shape({
//             value: PropTypes.string
//         })),
//         sentiment: PropTypes.arrayOf(PropTypes.shape({
//             value: PropTypes.string
//         })),
//         latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//         longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//     }).isRequired,

//     selectedDates: PropTypes.shape({
//         startDate: PropTypes.instanceOf(Date),
//         endDate: PropTypes.instanceOf(Date),
//         startTime: PropTypes.shape({
//             hours: PropTypes.number,
//             minutes: PropTypes.number
//         }),
//         endTime: PropTypes.shape({
//             hours: PropTypes.number,
//             minutes: PropTypes.number
//         }),
//     }).isRequired,

//     searchChips: PropTypes.arrayOf(PropTypes.string).isRequired,
// };

// export default Confirm;


