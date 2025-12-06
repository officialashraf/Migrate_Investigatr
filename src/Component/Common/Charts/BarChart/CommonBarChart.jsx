import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import Cookies from 'js-cookie';
import Loader from '../../../Modules/Layout/loader';
import styles from './barchart.module.css';
import { SlArrowUp, SlArrowDown } from "react-icons/sl";
import PropTypes from 'prop-types';
import { Menu, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { saveCaseFilterPayload } from '../../../../Redux/Action/caseAction';
import { setKeywords } from '../../../../Redux/Action/criteriaAction';
import { useLocation } from "react-router-dom";
import { setPage } from '../../../../Redux/Action/criteriaAction';
import { clearFilterData } from '../../../../Redux/Action/filterAction';

const ReusableBarChart = ({
    aggsFields = [],
    queryPayload = null,
    caseId = null,
    chartHeight = 280,
    transformData = (rawData) => rawData.map(item => ({
        name: item.key.split('-').slice(0, 3).join(''),
        value: item.doc_count,
        key: item.key 
    })),
    onDataCheck = null,
}) => {
    const [barData, setBarData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rawData, setRawData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const MAX_BARS = 20;
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBar, setSelectedBar] = useState(null);

    const dispatch = useDispatch();
    const location = useLocation();
    const caseFilter = useSelector(state => state.caseFilter?.caseFilters);
    const criteria = useSelector((state) => state.criteriaKeywords);
    const token = Cookies.get("accessToken");

    const menuOpen = Boolean(anchorEl);

    const getArrayFromPayload = (key, queryPayload) => {
        return Array.isArray(queryPayload?.[key]) ? queryPayload[key] : [];
    };

    const getCaseIdArray = (queryPayload) => {
        if (Array.isArray(queryPayload?.case_id)) return queryPayload.case_id;
        if (Array.isArray(queryPayload?.caseId)) return queryPayload.caseId;
        if (queryPayload?.case_id) return [queryPayload.case_id];
        if (queryPayload?.caseId) return [queryPayload.caseId];
        return [];
    };

    const getTargetsArray = (queryPayload) => {
        return Array.isArray(queryPayload?.target)
            ? queryPayload.target.map(t => String(t.value))
            : Array.isArray(queryPayload?.targets)
                ? queryPayload.targets.map(t => String(t.value))
                : [];
    };

    const getSentimentsArray = (queryPayload) => {
        return Array.isArray(queryPayload?.sentiments)
            ? queryPayload.sentiments
            : Array.isArray(queryPayload?.sentiment)
                ? queryPayload.sentiment
                : [];
    };

    const createFlatQuery = (queryPayload, aggsFields) => {
        const case_id = getCaseIdArray(queryPayload).map(String);

        return {
            case_id,
            aggs_fields: aggsFields,
            keyword: getArrayFromPayload("keyword", queryPayload),
            file_type: getArrayFromPayload("file_type", queryPayload),
            targets: getTargetsArray(queryPayload),
            sentiments: getSentimentsArray(queryPayload),
            unified_type: getArrayFromPayload("unified_type", queryPayload),
            eventtypestring: getArrayFromPayload("eventtypestring", queryPayload),
            mobilenumber: getArrayFromPayload("mobilenumber", queryPayload),
            socialmedia_hashtags: getArrayFromPayload("socialmedia_hashtags", queryPayload),
            socialmedia_from_id: getArrayFromPayload("socialmedia_from_id", queryPayload),
            socialmedia_from_screenname: getArrayFromPayload("socialmedia_from_screenname", queryPayload),
            serverip: getArrayFromPayload("serverip", queryPayload),
            event: getArrayFromPayload('event', queryPayload),
            loc: getArrayFromPayload('loc', queryPayload),
            emails: getArrayFromPayload('emails', queryPayload),
            date: getArrayFromPayload('date', queryPayload),
            person: getArrayFromPayload('person', queryPayload),
            org: getArrayFromPayload('org', queryPayload),
            language: getArrayFromPayload('language', queryPayload),

            ...(queryPayload?.start_time && { start_time: queryPayload.start_time }),
            ...(queryPayload?.end_time && { end_time: queryPayload.end_time }),
            ...(queryPayload?.latitude && { latitude: String(queryPayload.latitude) }),
            ...(queryPayload?.longitude && { longitude: String(queryPayload.longitude) }),
        };
    };

    const cleanQuery = (flatQuery) => {
        return Object.fromEntries(
            Object.entries(flatQuery).filter(
                ([, value]) =>
                    Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== ""
            )
        );
    };
    const getFieldFromAggsFields = () => {
        const field = aggsFields[0];

        const fieldMapping = {
            'eventtypestring': 'eventtypestring',
            'event': 'event'
        };

        return fieldMapping[field] || field;
    };

    const handleBarRightClick = (event, data) => {
        event.preventDefault();
        event.stopPropagation();
        setAnchorEl(event.currentTarget); 
        setSelectedBar(data);
    };

    const handleBarClick = (data, index, event) => {
        if (data && data.name !== 'No Data') {

            const fullData = rawData.find(item => item.key === (data.key || data.name)) || data;

            setSelectedBar(fullData);
            setAnchorEl(event.currentTarget);
        }
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedBar(null);
    };

    const handleAddToSearchCriteria = () => {
        if (!selectedBar) {
            toast.error("Invalid data.");
            handleCloseMenu();
            return;
        }

        const valueToSave = selectedBar.key || selectedBar.name;
        const field = getFieldFromAggsFields();

        if (!field) {
            toast.error("Unable to determine field type.");
            handleCloseMenu();
            return;
        }

        if (location.pathname.startsWith("/search")) {
            const updatedQueryPayload = {
                ...criteria.queryPayload,
                sentiment: [
      ...(criteria.queryPayload.sentiments || []),
    //   valueToSave,
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

        // toast.success(`Added ${valueToSave} to Search Criteria!`);
        handleCloseMenu();
    };

    useEffect(() => {
        return () => {
            dispatch(clearFilterData());
            dispatch(setPage(1));
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                let flatQuery = createFlatQuery(queryPayload, aggsFields);
                flatQuery = cleanQuery(flatQuery);

                const payload = flatQuery;

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

                const field = aggsFields[0];
                const raw = response.data[field] || [];
                const transformed = transformData(raw);
                setRawData(transformed);

                const limitedData = transformed.length > MAX_BARS ? transformed.slice(0, MAX_BARS) : transformed;
                setBarData(limitedData.length ? limitedData : [{ name: 'No Data', value: 0 }]);
                if (onDataCheck) {
                    const hasValidData = transformed.length > 0 && transformed.some(item => item.value > 0);
                    onDataCheck(hasValidData);
                }
            } catch (error) {
                console.error('Error fetching bar chart data:', error);
                setBarData([{ name: 'No Data', value: 0 }]);
                if (onDataCheck) {
                    onDataCheck(false);
                }
            } finally {
                setLoading(false);
            }
        };

        if (caseId) fetchData();
    }, [caseId, aggsFields.join(','), queryPayload, token, transformData, onDataCheck]);

    useEffect(() => {
        
        if (showAll) {
            setBarData(rawData.length ? rawData : [{ name: 'No Data', value: 0 }]);
        } else {
            const limited = rawData.length > MAX_BARS ? rawData.slice(0, MAX_BARS) : rawData;
            setBarData(limited.length ? limited : [{ name: 'No Data', value: 0 }]);
        }
    }, [showAll, rawData]);


    if (loading) return <Loader />;



    return (
        <div className={styles.chartWrappers}>
            <div className={styles.chartWrapper} style={{ height: chartHeight }}>
                {barData.length > 0 ? (
                    <ResponsiveContainer
                        width="100%"
                        height={barData.length * 45 < chartHeight ? chartHeight : barData.length * 45}
                    >
                        <BarChart
                            data={barData}
                            layout="vertical"
                            barCategoryGap={30}
                            margin={{ top: 20, right: 30, bottom: 5 }}
                        >
                            <CartesianGrid horizontal={true} vertical={false} stroke="#F3F3F51A" />
                            <XAxis type="number" tick={{ fill: '#fff', fontSize: 12 }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={200}
                                tick={
                                    <CustomYAxisTick
                                        onRowClick={handleBarClick}
                                        activeIndex={activeIndex}
                                    />
                                }
                                interval={0}
                            />
                            <Tooltip
                                wrapperStyle={{
                                    backgroundColor: "#0E2C46",
                                    border: "1px solid #3498db",
                                    borderRadius: "8px",
                                    padding: "4px",
                                    color: "#fff",
                                    maxWidth: "250px",
                                }}
                                contentStyle={{
                                    backgroundColor: "#0E2C46",
                                    padding: '2px',
                                    border: "none",
                                    maxWidth: "250px",
                                    whiteSpace: "normal",
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                }}
                                labelStyle={{ color: "#D6D6D6" }}
                                cursor={{ fill: "#1c2833" }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#0073CF"
                                barSize={15}
                                isAnimationActive={false}
                                onClick={(data, index, event) => handleBarClick(data, index, event)}
                            >
                                {barData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${entry.id || index}`}
                                        fill={index === activeIndex ? "#2980b9" : "#0073CF"}
                                        radius={8}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                        onContextMenu={(event) => handleBarRightClick(event, entry)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={styles.noData}>No Data Available</div>
                )}
            </div>

            {rawData.length > MAX_BARS && (
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <button
                        onClick={() => setShowAll(!showAll)}
                        style={{
                            color: '#0073CF',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            transition: 'color 0.3s ease',
                            padding: 0,
                        }}

                    >
                        {showAll ? <SlArrowUp /> : <SlArrowDown />}
                    </button>
                </div>
            )}

            {/* Context Menu (Unchanged) */}
            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                MenuListProps={{
                    'aria-labelledby': 'bar-context-menu',
                    sx: { pb: 0, pt: 0 }
                }}
                PaperProps={{
                    sx: {
                        backgroundColor: "#0E2C46",
                        borderRadius: "8px",
                        border: '1px solid #0073CF',
                    }
                }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {selectedBar && (
                    <MenuItem
                        onClick={handleAddToSearchCriteria}
                        sx={{ py: 1, px: 2 }}
                    >
                        <p style={{ color: '#D9D9D9', margin: 0 }}>Add to Search Criteria</p>
                    </MenuItem>
                )}
            </Menu>
        </div>
    );
};
const CustomYAxisTick = ({ x, y, payload, index, onRowClick, activeIndex }) => {
    const maxCharsPerLine = 25;
    const maxLines = 3;

    const breakTextWithHyphen = (text) => {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        for (let word of words) {
            if (word.length > maxCharsPerLine) {
                const parts = word.match(new RegExp(`.{1,${maxCharsPerLine - 1}}`, 'g')) || [];
                parts.forEach((part, index) => {
                    const withHyphen = index < parts.length - 1 ? `${part}-` : part;
                    if (currentLine.length + withHyphen.length <= maxCharsPerLine) {
                        currentLine += withHyphen;
                    } else {
                        lines.push(currentLine);
                        currentLine = withHyphen;
                    }
                });
            } else if ((currentLine + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? " " : "") + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    };

    const lines = breakTextWithHyphen(payload.value);
    const displayLines = lines.slice(0, maxLines);

    // Agar text 3 lines se zyada hai to last line mein "..." add karo
    if (lines.length > maxLines) {
        displayLines[maxLines - 1] = displayLines[maxLines - 1].slice(0, maxCharsPerLine - 3) + "...";
    }

    return (
        <g transform={`translate(${x},${y})`}
            onClick={(event) => {
                const data = { name: payload.value, key: payload.value }; // key yaha assume kiya gaya hai name ke equal
                if (onRowClick) {
                    onRowClick(data, index, event);
                }
            }}
            style={{ cursor: 'pointer' }}
        >
            <text x={0} y={0} textAnchor="end" fontSize={12} fill="#fff">
                {displayLines.map((line, index) => (
                    <tspan key={`${line}-${index}`} x={0} dy={index === 0 ? 0 : 14}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
};


CustomYAxisTick.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    payload: PropTypes.shape({
        value: PropTypes.string.isRequired,
    }).isRequired,
    index: PropTypes.number,
    onRowClick: PropTypes.func,
    activeIndex: PropTypes.number,
};
ReusableBarChart.propTypes = {
    aggsFields: PropTypes.array,
    queryPayload: PropTypes.object,
    caseId: PropTypes.string,
    chartHeight: PropTypes.number,
    transformData: PropTypes.func,
    onDataCheck: PropTypes.func,
};

ReusableBarChart.defaultProps = {
    aggsFields: [],
    queryPayload: null,
    caseId: null,
    chartHeight: 280,
    transformData: (rawData) => rawData.map(item => ({
        name: item.key.split('-').slice(0, 3).join(''),
        value: item.doc_count
    })),
};

export default ReusableBarChart;