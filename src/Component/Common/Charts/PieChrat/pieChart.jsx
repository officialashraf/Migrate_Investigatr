import { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Menu, MenuItem } from '@mui/material';
import Cookies from 'js-cookie';
import Loader from '../../../Modules/Layout/loader';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { saveCaseFilterPayload } from '../../../../Redux/Action/caseAction';
import { setKeywords } from '../../../../Redux/Action/criteriaAction';
import { useLocation } from "react-router-dom";

const getCSSVar = (variable) =>
  getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

const COLORS = [
  getCSSVar('--color-colors-warning'),
  getCSSVar('--color-colors-success'),
  getCSSVar('--color-colors-danger'),
  getCSSVar('--color-colors-primaryAccent'),
  getCSSVar('--color-colors-copper2'),
  "#ff7f50", "#87ceeb", "#da70d6", "#32cd32", "#ff7b00ff",
  "#ff69b4", "#ba55d3", "#d81818ff", "#b0bb1eff", "#404be0ff"
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const ReusablePieChart = ({
  aggsFields = [],
  queryPayload = null,
  caseId = null,
  chartHeight = 300,
  transformData = (rawData) =>
    rawData.map(item => ({
      name: item.key,
      value: item.doc_count
    })),
  onDataCheck = null,
  refreshKey,
  disableSearchAdd = false,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const token = Cookies.get('accessToken');
  const dispatch = useDispatch();
  const location = useLocation();
  const caseFilter = useSelector(state => state.caseFilter?.caseFilters);
  const criteria = useSelector((state) => state.criteriaKeywords);

  const menuOpen = Boolean(anchorEl);

  const handleSegmentClick = (data, index, event) => {
    // Recharts passes (data, index, event) - data contains the segment info
    if (disableSearchAdd) {
      return; // Agar disabled hai, toh click ignore karo
    }
    if (event && event.clientX && event.clientY) {
      setMousePosition({ x: event.clientX, y: event.clientY });
      setAnchorEl(document.body); // Use document.body as anchor
      setSelectedSegment(data);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedSegment(null);
  };

  const handleAddToSearchCriteria = () => {
    if (!selectedSegment || !aggsFields || aggsFields.length === 0) {
      toast.error("Invalid data or field.");
      handleCloseMenu();
      return;
    }

    const aggField = aggsFields[0]; // The aggregation field from API (e.g., 'unified_record_type', 'sentiments')
    let valueToAdd = selectedSegment.name;

    // Map aggregation field names to Redux state field names
    const fieldMapping = {
      'unified_record_type': 'file_type',
      'sentiments': 'sentiments',
      'sentiment': 'sentiment',
      'unified_type': 'unified_type',
    };
console.log("aggField",aggField)
    // Get the correct field name for Redux state
    const reduxField = fieldMapping[aggField] || aggField;

    // Convert to lowercase for sentiment fields
    if (reduxField === 'sentiments' || reduxField === 'sentiment') {
      valueToAdd = valueToAdd.toLowerCase();
    }
    const toastValue =
      valueToAdd.charAt(0).toUpperCase() + valueToAdd.slice(1);
    // Check if value already exists to avoid duplicates
    const checkDuplicate = (array) => array && array.includes(valueToAdd);

    // Update Redux state based on current route
    if (location.pathname.startsWith("/search")) {
      if (checkDuplicate(criteria.queryPayload?.[reduxField])) {
        toast.info(`"${valueToAdd}" is already in Search Criteria!`);
        handleCloseMenu();
        return;
      }

      const updatedQueryPayload = {
        ...criteria.queryPayload,
       sentiment: [
      ...(criteria.queryPayload.sentiments || []),
      // valueToAdd,
    ],
        [reduxField]: [...(criteria.queryPayload[reduxField] || []), valueToAdd]
      };
console.log("updatedQueryPayload",updatedQueryPayload)
      dispatch(
        setKeywords({
          keyword: criteria.keywords,
          queryPayload: updatedQueryPayload,
        })
      );
      
      
    } else {
      if (checkDuplicate(caseFilter?.[reduxField])) {
        toast.info(`"${toastValue}" is already in Search Criteria!`);
        handleCloseMenu();
        return;
      }

      const updatedCaseFilter = {
        ...caseFilter,
        [reduxField]: [...(caseFilter[reduxField] || []), valueToAdd]
      };

      dispatch(saveCaseFilterPayload(updatedCaseFilter));
    }

    toast.success(`"${toastValue}" added to Search Criteria!`);
    handleCloseMenu();
  };

  useEffect(() => {
    if (!caseId || !aggsFields || aggsFields.length === 0) return;

    const fetchData = async () => {
      // Prevent multiple API calls by checking if data already exists
      if (loading) return;
      try {
        setLoading(true);

        const caseIdArray =
          Array.isArray(queryPayload?.case_id)
            ? queryPayload.case_id
            : queryPayload?.case_id
              ? [queryPayload.case_id]
              : caseId
                ? [caseId]
                : [];

        const case_id = caseIdArray.map(String);

        let flatQuery = {
          case_id,
          aggs_fields: aggsFields,
          file_type: Array.isArray(queryPayload?.file_type) ? queryPayload.file_type : [],
          keyword: Array.isArray(queryPayload?.keyword) ? queryPayload.keyword : [],
          targets: Array.isArray(queryPayload?.target)
            ? queryPayload.target.map(t => String(t.value))
            : Array.isArray(queryPayload?.targets)
              ? queryPayload.targets.map(t => String(t.value))
              : [],
          sentiments: Array.isArray(queryPayload?.sentiments)
            ? queryPayload.sentiments
            : Array.isArray(queryPayload?.sentiment)
              ? queryPayload.sentiment
              : [],
          unified_type: Array.isArray(queryPayload?.unified_type) ? queryPayload.unified_type : [],
          eventtypestring: Array.isArray(queryPayload?.eventtypestring) ? queryPayload.eventtypestring : [],
          event: Array.isArray(queryPayload?.event) ? queryPayload.event : [],
          mobilenumber: Array.isArray(queryPayload?.mobilenumber) ? queryPayload.mobilenumber : [],
          socialmedia_hashtags: Array.isArray(queryPayload?.socialmedia_hashtags) ? queryPayload.socialmedia_hashtags : [],
          socialmedia_from_id: Array.isArray(queryPayload?.socialmedia_from_id) ? queryPayload.socialmedia_from_id : [],
          socialmedia_from_screenname: Array.isArray(queryPayload?.socialmedia_from_screenname) ? queryPayload.socialmedia_from_screenname : [],
          serverip: Array.isArray(queryPayload?.serverip) ? queryPayload.serverip : [],
          latitude: queryPayload?.latitude ? String(queryPayload.latitude) : "",
          longitude: queryPayload?.longitude ? String(queryPayload.longitude) : "",
          ...(queryPayload?.start_time && { start_time: queryPayload.start_time }),
          ...(queryPayload?.end_time && { end_time: queryPayload.end_time }),
          loc: Array.isArray(queryPayload?.loc) ? queryPayload.loc : [],
          emails: Array.isArray(queryPayload?.emails) ? queryPayload.emails : [],
          date: Array.isArray(queryPayload?.date) ? queryPayload.date : [],
          person: Array.isArray(queryPayload?.person) ? queryPayload.person : [],
          org: Array.isArray(queryPayload?.org) ? queryPayload.org : [],
          language: Array.isArray(queryPayload?.language) ? queryPayload.language : [],
        };

        flatQuery = Object.fromEntries(
          Object.entries(flatQuery).filter(
            ([, value]) =>
              Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== ""
          )
        );

        const response = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/aggregate`,
          flatQuery,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        const field = aggsFields[0];
        const rawData = response.data[field] || [];
        const transformed = transformData(rawData);
        setData(transformed.length ? transformed : [{ name: 'No Data', value: 0 }]);
        if (onDataCheck) {
          const hasValidData = transformed.length > 0 && transformed.some(item => item.value > 0);
          onDataCheck(hasValidData);
        }

      } catch (error) {
        console.error('Error fetching pie chart data:', error);
        setData([{ name: 'No Data', value: 0 }]);
        if (onDataCheck) {
          onDataCheck(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId, aggsFields.join(','), refreshKey, JSON.stringify(queryPayload)]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader />
    </div>
  );

  return (
    <>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
            minAngle={3}
            onClick={handleSegmentClick}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => {
              let fillColor;

              if (entry.name === "Positive") {
                fillColor = getCSSVar('--color-colors-success');
              } else if (entry.name === "Negative") {
                fillColor = getCSSVar('--color-colors-danger');
              } else if (entry.name === "Neutral") {
                fillColor = getCSSVar('--color-colors-warning');
              } else {
                fillColor = getRandomColor();
              }

              return (
                <Cell
                  key={entry.id || entry.name || entry.label}
                  fill={fillColor}
                  strokeWidth={1}
                />
              );
            })}
          </Pie>

          <Tooltip
            wrapperStyle={{
              backgroundColor: "#0E2C46",
              border: "1px solid #3498db",
              borderRadius: "8px",
              padding: "4px",
            }}
            contentStyle={{
              backgroundColor: "#0E2C46",
              border: "none",
              color: "#fff",
              padding: '2px'
            }}
            labelStyle={{ color: "#fff", margin: '0' }}
            cursor={{ fill: "#fff" }}
            itemStyle={{ color: "#0073CF", margin: '0' }}
          />
          <Legend
            align="center"
            verticalAlign="bottom"
            layout="horizontal"
            content={({ payload }) => {
              const isOverflow = payload.length > 6;
              return (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: isOverflow ? 'flex-start' : 'center',
                    overflowX: isOverflow ? 'auto' : 'visible',
                    padding: '5px 0',
                    maxWidth: '100%',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <ul
                    style={{
                      display: 'flex',
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {payload.map((entry, index) => (
                      <li
                        key={`item-${index}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          marginRight: 15,
                          color: entry.color,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 2,
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: entry.color,
                              marginRight: 5,
                            }}
                          />
                          {entry.value}
                        </div>
                        <span style={{ color: entry.color }}>
                          {entry.payload.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <Menu
        anchorReference="anchorPosition"
        anchorPosition={
          mousePosition.y !== null && mousePosition.x !== null
            ? { top: mousePosition.y, left: mousePosition.x }
            : undefined
        }
        open={menuOpen}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
          sx: { pb: 0 }
        }}
        PaperProps={{
          sx: {
            backgroundColor: "#0E2C46",
            borderRadius: "8px",
            border: '1px solid #0073CF',
            padding: '-3px'
          }
        }}
      >
        {selectedSegment && selectedSegment.name !== 'No Data' && !disableSearchAdd && (
          <MenuItem onClick={handleAddToSearchCriteria} style={{ paddingTop: '0px' }}>
            <p style={{ color: '#D9D9D9', alignItems: 'center', margin: '0', padding: '0' }}>
              Add to Search Criteria
            </p>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

ReusablePieChart.propTypes = {
  aggsFields: PropTypes.array.isRequired,
  queryPayload: PropTypes.object,
  caseId: PropTypes.string,
  chartHeight: PropTypes.number,
  transformData: PropTypes.func,
  onDataCheck: PropTypes.func,
  refreshKey: PropTypes.any,
  disableSearchAdd: PropTypes.bool,
};

export default ReusablePieChart;