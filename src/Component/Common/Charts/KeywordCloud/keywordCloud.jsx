import { useState, useEffect } from 'react';
import { Box, Typography, Tooltip, Menu, MenuItem } from '@mui/material';
import axios from 'axios';
import Cookies from "js-cookie";
import Loader from '../../../Modules/Layout/loader';
import { SlArrowUp, SlArrowDown } from "react-icons/sl";
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { saveCaseFilterPayload } from '../../../../Redux/Action/caseAction';
import { setKeywords } from '../../../../Redux/Action/criteriaAction';
import { useLocation } from "react-router-dom";
import { setPage } from '../../../../Redux/Action/criteriaAction';
import { clearFilterData } from '../../../../Redux/Action/filterAction';

const KeywordTagList = ({ queryPayload = null, caseId = null, aggsFields, onDataCheck = null }) => {
  const token = Cookies.get("accessToken");
  const dispatch = useDispatch();
  const caseFilter = useSelector(state => state.caseFilter?.caseFilters);
  const criteria = useSelector((state) => state.criteriaKeywords);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [sourceType, setSourceType] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPII, setSelectedPII] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const location = useLocation();

  const menuOpen = Boolean(anchorEl);


  const getTargetsArray = (queryPayload) => {
    // 1. Check for 'target' (usually holds objects from criteria form)
    if (Array.isArray(queryPayload?.target)) {
      return queryPayload.target.map(t => {
        // If it's an object {value: id}, extract the value/id
        if (typeof t === "object" && t !== null) {
          return String(t.value || t.id);
        }
        // If it's already a string/number ID
        return String(t);
      }).filter(id => id.trim() !== '');
    }

    // 2. Check for 'targets' (can hold strings if saved that way)
    if (Array.isArray(queryPayload?.targets)) {
      return queryPayload.targets.map(String).filter(id => id.trim() !== '');
    }

    return [];
  };

  const handleAddToPII = async () => {
    if (!selectedPII || !selectedType) {
      toast.error("Invalid PII data or type.");
      handleCloseMenu();
      return;
    }


    const valueToSave = selectedPII.key;
    let url = "";

    if (selectedType === 'email') {
      url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/pii/getEmailInfo/${valueToSave}`;
    } else if (selectedType === 'phone' || selectedType === 'mobile') {
      const formattedValue = valueToSave.startsWith('+') ? valueToSave : '+' + valueToSave;
      url = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/pii/getPhoneNumberInfo/${formattedValue}`;
    } else {
      toast.info(`Saving of type ${selectedType} is not supported yet.`);
      handleCloseMenu();
      return;
    }

    try {
      await axios.get(encodeURI(url), {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (selectedType === "email") {
        toast.success("Email added to IDINT!");
      } else if (selectedType === "phone") {
        toast.success("Phone Number added to IDINT!");
      } else if (selectedType === "mobile") {
        toast.success("Mobile Number added to IDINT!");
      } else {
        toast.success(`${selectedType} added to IDINT!`);
      }

    } catch (err) {
      console.error("PII Save Error:", err);
      toast.error(err.response?.data?.detail || `Failed to add ${selectedType} to PII.`);
    } finally {
      handleCloseMenu();
    }
  };

  const handleAddToSearchCriteria = () => {
    if (!selectedPII || !selectedType) {
      toast.error("Invalid data or type.");
      handleCloseMenu();
      return;
    }

    const valueToSave = selectedPII.key;

    // Determine the field based on sourceType
    let field = '';
    if (selectedType === 'hashtag') {
      field = 'socialmedia_hashtags';
    } else if (selectedType === 'email') {
      field = 'emails';
    } else if (selectedType === 'phone' || selectedType === 'mobile') {
      field = 'mobilenumber';
    } else if (selectedType === 'serverip') {
      field = 'serverip';
    } else {
      toast.error("Unsupported type for adding to search criteria.");
      handleCloseMenu();
      return;
    }

    // Update Redux state
    if (location.pathname.startsWith("/search")) {
      const updatedQueryPayload = {
        ...criteria.queryPayload,
        sentiment: [
      ...(criteria.queryPayload.sentiments || []),
      // valueToSave,
    ],
        [field]: [...(criteria.queryPayload[field] || []), valueToSave]
      };

      dispatch(
        setKeywords({
          keyword: criteria.keywords,
          queryPayload: updatedQueryPayload,
        })
      );

    } else {
      const updatedCaseFilter = {
        ...caseFilter,
        [field]: [...(caseFilter[field] || []), valueToSave]
      };

      dispatch(saveCaseFilterPayload(updatedCaseFilter));
    }

    toast.success(`${selectedType} added to Search Criteria!`);
    handleCloseMenu();
    console.log("queryPayload:tryutgyugyu", queryPayload);

  };
 useEffect(() => {
        return () => {
            dispatch(clearFilterData());
            dispatch(setPage(1));
        };
    }, []);

  const handleOpenMenu = (event, item, type) => {
    setAnchorEl(event.currentTarget);
    setSelectedPII(item);
    setSelectedType(type);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedPII(null);
    setSelectedType(null);
  };

  useEffect(() => {
    const fetchKeywordData = async () => {
      try {
        setLoading(true);

        const getArrayFromPayload = (key, queryPayload) => {
          return Array.isArray(queryPayload?.[key]) ? queryPayload[key] : [];
        };

        const getStringArray = (key, queryPayload) => {
          const array = getArrayFromPayload(key, queryPayload);
          return array.map(String);
        };

        const caseIdArray = getArrayFromPayload("case_id", queryPayload).concat(
          getArrayFromPayload("caseId", queryPayload)
        );
        if (caseId) {
          caseIdArray.push(caseId);
        }
        const flatQuery = {
          case_id: caseIdArray.map(String),
          aggs_fields: aggsFields,
          keyword: getArrayFromPayload("keyword", queryPayload),
          file_type: getArrayFromPayload("file_type", queryPayload),
          targets: getTargetsArray(queryPayload),
          // targets: getStringArray("target", queryPayload).length
          // ? getStringArray("target", queryPayload)
          // : getStringArray("targets", queryPayload),
          // emails: getArrayFromPayload("emails", queryPayload),           
          phone_numbers: getArrayFromPayload("phone_numbers", queryPayload), 
          sentiments: getArrayFromPayload("sentiments", queryPayload).length
            ? getArrayFromPayload("sentiments", queryPayload)
            : getArrayFromPayload("sentiment", queryPayload),
          unified_type: getArrayFromPayload("unified_type", queryPayload),
          eventtypestring: getArrayFromPayload("eventtypestring", queryPayload),
          mobilenumber: getArrayFromPayload("mobilenumber", queryPayload),
          socialmedia_hashtags: getArrayFromPayload("socialmedia_hashtags", queryPayload),
          socialmedia_from_id: getArrayFromPayload("socialmedia_from_id", queryPayload),
          socialmedia_from_screenname: getArrayFromPayload("socialmedia_from_screenname", queryPayload),
          serverip: getArrayFromPayload("serverip", queryPayload),
          latitude: queryPayload?.latitude ? String(queryPayload.latitude) : "",
          longitude: queryPayload?.longitude ? String(queryPayload.longitude) : "",
          loc: getArrayFromPayload("loc", queryPayload),
          emails: getArrayFromPayload("emails", queryPayload),
          event: getArrayFromPayload("event", queryPayload),
          date: getArrayFromPayload("date", queryPayload),
          person: getArrayFromPayload("person", queryPayload),
          org: getArrayFromPayload("org", queryPayload),
          language: getArrayFromPayload("language", queryPayload),
          ...(queryPayload?.start_time && { start_time: queryPayload.start_time }),
          ...(queryPayload?.end_time && { end_time: queryPayload.end_time }),
        };

        const cleanQuery = (query) => {
          return Object.fromEntries(
            Object.entries(query).filter(
              ([, value]) =>
                Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== ""
            )
          );
        };

        const payload = cleanQuery(flatQuery);

        const response = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/aggregate`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );


        // const { socialmedia_hashtags } = response.data;
        // setData(socialmedia_hashtags || []);
        // const safeHashtags = Array.isArray(socialmedia_hashtags) ? socialmedia_hashtags : [];

        const { socialmedia_hashtags, emails, phone_numbers, mobilenumber, serverip } = response.data || {};

        const safeHashtags = [
          ...(Array.isArray(socialmedia_hashtags) ? socialmedia_hashtags : []),
          ...(Array.isArray(emails) ? emails : []),
          ...(Array.isArray(phone_numbers) ? phone_numbers : []),
          ...(Array.isArray(mobilenumber) ? mobilenumber : []),
          ...(Array.isArray(serverip) ? serverip : []),
        ];

        let sourceType = '';
        if (Array.isArray(socialmedia_hashtags) && socialmedia_hashtags.length) {
          sourceType = 'hashtag';
        } else if (Array.isArray(emails) && emails.length) {
          sourceType = 'email';
        } else if (Array.isArray(phone_numbers) && phone_numbers.length) {
          sourceType = 'phone';
        } else if (Array.isArray(mobilenumber) && mobilenumber.length) {
          sourceType = 'mobile';
        } else if (Array.isArray(serverip) && serverip.length) {
          sourceType = 'serverip';
        }
        setSourceType(sourceType);

        setData(safeHashtags);
        if (onDataCheck) {
          const hasValidData =
            safeHashtags.length > 0 &&
            safeHashtags.some(item => (item.value || item.doc_count || 0) > 0);
          onDataCheck(hasValidData);
        }
      } catch (error) {
        console.error("Error fetching keyword data:", error);
        setData([]);
        if (onDataCheck) {
          onDataCheck(false);
        }
      } finally {
        setLoading(false);
      }
    };

    if (queryPayload || caseId) {
      fetchKeywordData();
    }
  }, [caseId, aggsFields.join(","), queryPayload, token]);

  const MAX_HASHTAGS = 50;
  const displayedData = showAll ? data : data.slice(0, MAX_HASHTAGS);

  const sourceLabels = {
    hashtag: 'Hashtag',
    email: 'Email ID',
    phone: 'Phone Number',
    mobile: 'Mobile Number',
    serverip: "Server IP's"
  };

  const label = sourceLabels[sourceType];

  if (loading) return <Loader />;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3px',
          backgroundColor: '#101d2b',
          borderRadius: '20px',
          p: 2,
          maxHeight: '280px',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {displayedData.length > 0 ? (
          displayedData.map((item, index) => {
            const docCount = item.doc_count || 0;
            const fontSize = `${Math.min(18, Math.max(11, Math.log2(docCount + 1) * 2))}px`;
            const isPII = ['email'].includes(sourceType);

            return (
              // <Tooltip
              //   key={item.key}
              //   title={
              //     <Box sx={{
              //       backgroundColor: "#0E2C46",
              //       border: "1px solid #3498db",
              //       borderRadius: "8px",
              //       padding: "6px",
              //     }}>
              //       <p style={{ color: '#D9D9D9', margin: '2px 0' }}>
              //         {label && `${label} Count: ${item.doc_count || 0}`}
              //       </p>
              //     </Box>
              //   }
              //   placement="top"
              //   componentsProps={{
              //     tooltip: {
              //       sx: {
              //         backgroundColor: "transparent",
              //         boxShadow: "none",
              //         p: 0,
              //       }
              //     }
              //   }}
              // >
              //   <Box
              //     sx={{
              //       backgroundColor: 'rgba(0, 115, 207,0.1)',
              //       color: '#0073CF',
              //       padding: "4px 8px",
              //       borderRadius: "30px",
              //       fontSize: fontSize,
              //       display: 'inline-flex',
              //       alignItems: 'center',
              //       whiteSpace: 'nowrap',
              //       border: '1px solid #0073CF',
              //       cursor: 'context-menu',
              //       transition: 'all 0.3s ease',
              //       '&:hover': {
              //         backgroundColor: 'rgba(0, 115, 207, 0.5)',
              //         transform: 'scale(1.05)',
              //         boxShadow: '0 2px 8px rgba(0, 115, 207, 0.3)',
              //       },
              //     }}
              //     onClick={(e) => handleOpenMenu(e, item, sourceType)}
              //   >
              //     {item.key}
              //   </Box>
              // </Tooltip>
              <Tooltip
                key={item.key}
                title={
                  <Box
                    sx={{
                      background: "rgba(14,44,70,0.6)",
                      border: "1px solid #3498db",
                      borderRadius: "10px",
                      padding: "8px 10px",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  >
                    <p style={{ color: '#D9D9D9', margin: 0, fontSize: "13px" }}>
                      {label && `${label} Count: ${item.doc_count || 0}`}
                    </p>
                  </Box>
                }
                placement="top"
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: "transparent",
                      boxShadow: "none",
                      padding: 0,
                      margin: 0,
                    }
                  }
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'rgba(0, 115, 207, 0.12)',
                    color: '#0073CF',
                    padding: "4px 10px",
                    borderRadius: "25px",
                    fontSize: fontSize,
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid #0073CF',
                    cursor: 'context-menu',
                    transition: 'all 0.25s ease',
                    fontWeight: 500,

                    "&:hover": {
                      backgroundColor: 'rgba(0, 115, 207, 0.25)',
                      transform: 'translateY(-1px) scale(1.04)',
                      boxShadow: '0 3px 10px rgba(0, 115, 207, 0.25)',
                    }
                  }}
                  onClick={(e) => handleOpenMenu(e, item, sourceType)}
                >
                  {item.key}
                </Box>
              </Tooltip>
            );
          })
        ) : (
          <Typography
            color="#ccc"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              fontSize: '14px'
            }}
          >
            No Hashtags Found
          </Typography>
        )}
      </Box>

      {data.length > MAX_HASHTAGS && (
        <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
          <Typography
            variant="body2"
            onClick={() => setShowAll(!showAll)}
            sx={{
              color: '#0073CF',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 'bold',
              fontSize: '15px',
              transition: 'color 0.3s ease',
              '&:hover': {
                color: '#005999',
              },
              '& svg': {
                transition: 'transform 0.2s',
              },
              '&:hover svg': {
                transform: 'scale(1.2)',
              }
            }}
          >
            {showAll ? <SlArrowUp /> : <SlArrowDown />}
          </Typography>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
          sx: {
            pb: 0,
            pt: 0
          }
        }}
        PaperProps={{
          sx: {
            backgroundColor: "#0E2C46",
            borderRadius: "8px",
            border: '1px solid #0073CF',
          }
        }}
      >
        {selectedPII && (
          <>
            {![''].includes(selectedType) && (
              <MenuItem
                onClick={handleAddToSearchCriteria}
                sx={{ py: 1, px: 2 }}   
              >
                <p style={{ color: '#D9D9D9', margin: 0 }}>Add to Search Criteria</p>
              </MenuItem>
            )}
            {![''].includes(selectedType) && ['email', 'phone'].includes(selectedType) && (
              <div style={{ border: "1px solid #0073cf" }}>

              </div>
            )}
            {['email', 'phone'].includes(selectedType) && (
              <MenuItem
                onClick={handleAddToPII}
                sx={{ py: 1, px: 2 }}  
              >
                <p style={{ color: '#D9D9D9', margin: 0 }}>Add to IDINT Search</p>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </>
  );
};

KeywordTagList.propTypes = {
  queryPayload: PropTypes.object,
  caseId: PropTypes.string,
  aggsFields: PropTypes.array.isRequired,
  onDataCheck: PropTypes.func,
};

export default KeywordTagList;