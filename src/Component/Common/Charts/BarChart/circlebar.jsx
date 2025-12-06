
import React, { useState,useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { SlUser } from "react-icons/sl";
import Cookies from 'js-cookie';
import Loader from '../../../Modules/Layout/loader'
import axios from 'axios';


const CircleBarChart = ({

    aggsFields = [],
    queryPayload = null,
    caseId = null,
    // chartHeight = 280,
    // transformData = (rawData) => rawData.map(item => ({
    //     name: item.key.split('-').slice(0, 3).join(''),
    //     value: item.doc_count
    // })),
    onDataCheck = null,
    componentHeight = 250
}) => {
    // Get max doc_count for circle scaling

    const [barData, setBarData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const token = Cookies.get("accessToken");

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
        const case_id = getCaseIdArray(queryPayload).map(String); // Ensure string[]

        return {
            case_id,
            unified_type: aggsFields,
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
            latitude: queryPayload?.latitude ? String(queryPayload.latitude) : "",
            longitude: queryPayload?.longitude ? String(queryPayload.longitude) : "",
            ...(queryPayload?.start_time && { start_time: queryPayload.start_time }),
            ...(queryPayload?.end_time && { end_time: queryPayload.end_time }),
            loc: getArrayFromPayload("loc", queryPayload),
            emails: getArrayFromPayload("emails", queryPayload),
            event: getArrayFromPayload("event", queryPayload),
            date: getArrayFromPayload("date", queryPayload),
            person: getArrayFromPayload("person", queryPayload),
            org: getArrayFromPayload("org", queryPayload),
            language: getArrayFromPayload("language", queryPayload),
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                let flatQuery = createFlatQuery(queryPayload, aggsFields);
                flatQuery = cleanQuery(flatQuery);

                const payload = flatQuery;

                const response = await axios.post(
                    `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/ipdr-cdr/subscriber`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

               
                const raw = response.data.by_msisdn.buckets || [];
                const transformed = raw;
                setData(raw);
console.warn("transformed....!!!",raw);
                
                if (onDataCheck) {
                   const hasValidData = transformed.length > 0 &&
  transformed.some(obj =>
    ['unique_imeis', 'unique_dest_ips', 'unique_apps', 'unique_bts']
      .some(key => obj[key]?.value > 0)
  );

                    console.warn("hasValidData....!!!",hasValidData);
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

         if (queryPayload || caseId) {
    fetchData();
  }
    }, [caseId, aggsFields.join(','), queryPayload, token]);




    if (loading) return <Loader />;

    const maxDocCount = Math.max(...data.map(item => item.doc_count || 0));

    // Get bar chart fields (excluding key and doc_count)
   const getBarFields = (item) => {
    const excludeKeys = ['key', 'doc_count'];
    const labelMap = {
  unique_imeis: "Unique IMEIs",
  unique_dest_ips: "Unique Destination IPs",
  unique_apps: "Unique Apps",
  unique_bts: "Unique BTS"
};
    return Object.entries(item)
        .filter(([key, value]) => !excludeKeys.includes(key))
        .map(([key, value]) => {
            // unwrap value if it's an object with a numeric 'value'
            const numericValue = typeof value === 'number' 
                ? value 
                : (value?.value ?? 0);

            return { 
                 name : labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: numericValue
            };
        });
};

    // Circle Component
    const CircleDisplay = ({ item }) => {
        const percentage = maxDocCount > 0 ? (item.doc_count / maxDocCount) : 0;
        const circumference = 2 * Math.PI * 45; // Smaller radius for compact design
        const strokeDashoffset = circumference * (1 - percentage);

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '140px',
                height: '100%'
            }}>
                <div style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    marginBottom: '8px'
                }}>
                    {/* SVG Circle */}
                    <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#2c3e50"
                            strokeWidth="4"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#FF4444"
                            strokeWidth="4"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{
                                transition: 'stroke-dashoffset 0.5s ease'
                            }}
                        />
                    </svg>
                    
                    {/* Center Content */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#2c3e50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <SlUser size={14} color="#fff" />
                        </div>
                        <div style={{
                            color: '#FF4444',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}>
                            {item.doc_count}
                        </div>
                    </div>
                    
                    {/* Jio Badge */}
                    <div style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '5px',
                        width: '18px',
                        height: '18px',
                        backgroundColor: '#FF4444',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '8px',
                        fontWeight: 'bold'
                    }}>
                        Jio
                    </div>
                </div>
                
                {/* Key Label */}
                <div style={{
                    color: '#fff',
                    fontSize: '11px',
                    textAlign: 'center',
                    maxWidth: '120px',
                    lineHeight: '1.2'
                }}>
                    {item.key}
                </div>
            </div>
        );
    };

    // Bar Chart Component
    const BarChartDisplay = ({ item }) => {
        const barData = getBarFields(item);
        
        if (barData.length === 0) {
            return (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '12px'
                }}>
                    No Data Available
                </div>
            );
        }

        return (
            <div style={{
                flex: 1,
                height: '100%',
                // paddingRight: '15px'
            }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={barData}
                        layout="vertical"
                        margin={{ top: 10, right: 0, bottom: 10, left: 5 }}
                    >
                        <CartesianGrid horizontal={true} vertical={false} stroke="#F3F3F51A" />
                        <XAxis 
                            type="number" 
                            tick={{ fill: '#fff', fontSize: 12}}
                            axisLine={{ stroke: '#2c3e50' }}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            tick={{ fill: '#fff', fontSize: 12 }}
                            axisLine={{ stroke: '#2c3e50' }}
                            interval={0}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#0E2C46",
                                border: "1px solid #0073cf",
                                borderRadius: "6px",
                                color: "#fff",
                                fontSize: "11px"
                            }}
                            cursor={{ fill: "#1c2833" }}
                        />
                        <Bar
                            dataKey="value"
                             fill="#0073CF"
                            barSize={15}
                            radius={8}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Individual Card Component
    const DataCard = ({ item, index }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            // backgroundColor: '#1a2332',
            borderRadius: '12px',
            // padding: '15px 0px 8px 30px',
            border: '1px solid #2c3e50',
            //  minWidth: '450px',
      width: '100%',
      height: '100%',

            // height: `${componentHeight - 40}px`,
            marginBottom: '20px',
            flexShrink: 0
        }}>
            {/* Bar Chart Section - Left */}
            <BarChartDisplay item={item} />
            
            {/* Divider */}
            <div style={{
                width: '1px',
                height: '80%',
                // backgroundColor: '#2c3e50',
                margin: '0 15px'
            }} />
            
            {/* Circle Section - Right */}
            <CircleDisplay item={item} />
        </div>
    );

    return (
        <div style={{
            width: '100%',
            height: `${componentHeight}px`,
            // backgroundColor: '#0f1419',
            // padding: '20px',
            // boxSizing: 'border-box'
        }}>
            

            {/* Horizontal Scrollable Container */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                overflow: 'auto',
                height: `${componentHeight+80}px`,
                paddingBottom: '5px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#1e7df8 #0a192f'
            }}>
                {data.map((item, index) => (
                    <DataCard key={`card-${index}`} item={item} index={index} />
                ))}
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                div::-webkit-scrollbar {
                    height: 6px;
                }
                
                div::-webkit-scrollbar-track {
                    background: #2c3e50;
                    border-radius: 3px;
                }
                
                div::-webkit-scrollbar-thumb {
                    background: #FF4444;
                    border-radius: 3px;
                }
                
                div::-webkit-scrollbar-thumb:hover {
                    background: #FF6666;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .data-card {
                        min-width: 300px !important;
                        width: 300px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .data-card {
                        min-width: 280px !important;
                        width: 280px !important;
                        padding: 10px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CircleBarChart;
// import React, { useState, useEffect } from 'react';
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip } from 'recharts';
// import {SlArrowUp, SlArrowDown, SlUser } from "react-icons/sl";
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import Loader from '../../../Modules/Layout/loader';
// import PropTypes from 'prop-types';

// const CircleBarChart = ({
//     aggsFields = [],
//     queryPayload = null,
//     caseId = null,
//     chartHeight = 280,
//     transformData = (rawData) => {
//         // Handle the nested data structure: fieldName.buckets[]
//         if (!rawData || !rawData.buckets || !Array.isArray(rawData.buckets)) return [];
        
//         return rawData.buckets.map(bucket => ({
//             name: bucket.key || 'Unknown',
//             value: bucket.doc_count || 0,
//             uniqueApps: bucket.unique_apps?.value || 0,
//             uniqueBts: bucket.unique_bts?.value || 0,
//             uniqueDestIps: bucket.unique_dest_ips?.value || 0,
//             uniqueImeis: bucket.unique_imeis?.value || 0
//         }));
//     },
//     onDataCheck = null,
// }) => {
//     const [allFieldsData, setAllFieldsData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [activeIndices, setActiveIndices] = useState({});
//     const [showAllStates, setShowAllStates] = useState({});
//     const MAX_BARS = 20;
//     const token = Cookies.get("accessToken");

//     const getArrayFromPayload = (key, queryPayload) => {
//         return Array.isArray(queryPayload?.[key]) ? queryPayload[key] : [];
//     };

//     const getCaseIdArray = (queryPayload) => {
//         if (Array.isArray(queryPayload?.case_id)) return queryPayload.case_id;
//         if (Array.isArray(queryPayload?.caseId)) return queryPayload.caseId;
//         if (queryPayload?.case_id) return [queryPayload.case_id];
//         if (queryPayload?.caseId) return [queryPayload.caseId];
//         return [];
//     };

//     const getTargetsArray = (queryPayload) => {
//         return Array.isArray(queryPayload?.target)
//             ? queryPayload.target.map(t => String(t.value))
//             : Array.isArray(queryPayload?.targets)
//                 ? queryPayload.targets.map(t => String(t.value))
//                 : [];
//     };

//     const getSentimentsArray = (queryPayload) => {
//         return Array.isArray(queryPayload?.sentiments)
//             ? queryPayload.sentiments
//             : Array.isArray(queryPayload?.sentiment)
//                 ? queryPayload.sentiment
//                 : [];
//     };

//     const createFlatQuery = (queryPayload, aggsFields) => {
//         const case_id = getCaseIdArray(queryPayload).map(String);

//         return {
//             case_id,
//             unified_type: aggsFields,
//             keyword: getArrayFromPayload("keyword", queryPayload),
//             file_type: getArrayFromPayload("file_type", queryPayload),
//             targets: getTargetsArray(queryPayload),
//             sentiments: getSentimentsArray(queryPayload),
//             ...(queryPayload?.start_time && { start_time: queryPayload.start_time }),
//             ...(queryPayload?.end_time && { end_time: queryPayload.end_time }),
//         };
//     };

//     const cleanQuery = (flatQuery) => {
//         return Object.fromEntries(
//             Object.entries(flatQuery).filter(
//                 ([, value]) =>
//                     Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== ""
//             )
//         );
//     };

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);

//                 let flatQuery = createFlatQuery(queryPayload, aggsFields);
//                 flatQuery = cleanQuery(flatQuery);

//                 const payload = flatQuery;

//                 const response = await axios.post(
//                     `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/ipdr-cdr/subscriber`,
//                     payload,
//                     {
//                         headers: {
//                             "Content-Type": "application/json",
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 // Process data for each field in response
//                 const processedData = {};
                
//                 // Get all field names from response that have buckets
//                 Object.keys(response.data).forEach(fieldKey => {
//                     const fieldData = response.data[fieldKey];
//                     if (fieldData && fieldData.buckets && Array.isArray(fieldData.buckets)) {
//                         const transformed = transformData(fieldData);
                        
//                         // Create bar data for each metric
//                         const createMetricData = (metricKey, metricName) => {
//                             const metricData = transformed.map(item => ({
//                                 name: item.name,
//                                 value: item[metricKey] || 0
//                             })).filter(item => item.value > 0);
                            
//                             return {
//                                 name: metricName,
//                                 data: metricData.length > MAX_BARS ? metricData.slice(0, MAX_BARS) : metricData,
//                                 rawData: metricData
//                             };
//                         };

//                         processedData[fieldKey] = {
//                             mainData: {
//                                 rawData: transformed,
//                                 barData: transformed.length > MAX_BARS ? transformed.slice(0, MAX_BARS) : (transformed.length ? transformed : [{ name: 'No Data', value: 0 }]),
//                                 circleData: transformed.slice(0, 5)
//                             },
//                             metrics: {
//                                 apps: createMetricData('uniqueApps', 'Unique Apps'),
//                                 bts: createMetricData('uniqueBts', 'Unique BTS'),
//                                 ips: createMetricData('uniqueDestIps', 'Unique Destination IPs'),
//                                 imeis: createMetricData('uniqueImeis', 'Unique IMEIs')
//                             }
//                         };
//                     }
//                 });

//                 // If no valid data found, create empty structure for requested fields
//                 if (Object.keys(processedData).length === 0) {
//                     aggsFields.forEach(field => {
//                         processedData[field] = {
//                             mainData: {
//                                 rawData: [],
//                                 barData: [{ name: 'No Data', value: 0 }],
//                                 circleData: []
//                             },
//                             metrics: {
//                                 apps: { name: 'Unique Apps', data: [], rawData: [] },
//                                 bts: { name: 'Unique BTS', data: [], rawData: [] },
//                                 ips: { name: 'Unique Destination IPs', data: [], rawData: [] },
//                                 imeis: { name: 'Unique IMEIs', data: [], rawData: [] }
//                             }
//                         };
//                     });
//                 }

//                 setAllFieldsData(processedData);

//                 if (onDataCheck) {
//                     const hasValidData = Object.values(processedData).some(
//                         fieldData => fieldData.mainData.rawData.length > 0 && fieldData.mainData.rawData.some(item => item.value > 0)
//                     );
//                     onDataCheck(hasValidData);
//                 }
//             } catch (error) {
//                 console.error('Error fetching bar chart data:', error);
//                 const errorData = {};
//                 aggsFields.forEach(field => {
//                     errorData[field] = {
//                         mainData: {
//                             rawData: [],
//                             barData: [{ name: 'No Data', value: 0 }],
//                             circleData: []
//                         },
//                         metrics: {
//                             apps: { name: 'Unique Apps', data: [], rawData: [] },
//                             bts: { name: 'Unique BTS', data: [], rawData: [] },
//                             ips: { name: 'Unique Destination IPs', data: [], rawData: [] },
//                             imeis: { name: 'Unique IMEIs', data: [], rawData: [] }
//                         }
//                     };
//                 });
//                 setAllFieldsData(errorData);
//                 if (onDataCheck) {
//                     onDataCheck(false);
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (aggsFields.length > 0) {
//             fetchData();
//         }
//     }, [caseId, aggsFields.join(','), JSON.stringify(queryPayload), token]);

//     const toggleShowAll = (fieldKey) => {
//         setShowAllStates(prev => ({
//             ...prev,
//             [fieldKey]: !prev[fieldKey]
//         }));
//     };

//     if (loading) {
//         return (
//             <div style={{
//                 width: '100%',
//                 overflow: 'hidden',
//                 backgroundColor: '#101D2B',
//                 scrollbarWidth: 'none',
//                 msOverflowStyle: 'none',
//                 height: chartHeight,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#fff'
//             }}>
//                 Loading...
//             </div>
//         );
//     }

//     const CircleItem = ({ item, index, maxValue, field }) => (
//         <div style={{
//             minWidth: '160px',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             margin: '0 10px',
//             flexShrink: 0
//         }}>
//             <div style={{
//                 position: 'relative',
//                 width: '120px',
//                 height: '120px',
//                 marginBottom: '8px'
//             }}>
//                 <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
//                     <circle
//                         cx="60"
//                         cy="60"
//                         r="55"
//                         fill="none"
//                         stroke="#2c3e50"
//                         strokeWidth="5"
//                     />
//                     <circle
//                         cx="60"
//                         cy="60"
//                         r="55"
//                         fill="none"
//                         stroke="#FF4444"
//                         strokeWidth="5"
//                         strokeDasharray={`${2 * Math.PI * 55}`}
//                         strokeDashoffset={`${2 * Math.PI * 55 * (1 - item.value / maxValue)}`}
//                         strokeLinecap="round"
//                     />
//                 </svg>
                
//                 <div style={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '50%',
//                     transform: 'translate(-50%, -50%)',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     gap: '4px'
//                 }}>
//                     <div style={{
//                         width: '35px',
//                         height: '35px',
//                         borderRadius: '50%',
//                         backgroundColor: '#2c3e50',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center'
//                     }}>
//                         <SlUser size={18} color="#fff" />
//                     </div>
//                     <div style={{
//                         color: '#fff',
//                         fontSize: '9px',
//                         textAlign: 'center',
//                         maxWidth: '80px',
//                         overflow: 'hidden',
//                         textOverflow: 'ellipsis',
//                         whiteSpace: 'nowrap'
//                     }}>
//                         {item.name}
//                     </div>
//                     <div style={{
//                         color: '#FF4444',
//                         fontSize: '14px',
//                         fontWeight: 'bold'
//                     }}>
//                         {item.value}
//                     </div>
//                 </div>
                
//                 <div style={{
//                     position: 'absolute',
//                     bottom: '5px',
//                     right: '5px',
//                     width: '20px',
//                     height: '20px',
//                     backgroundColor: '#FF4444',
//                     borderRadius: '50%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     color: '#fff',
//                     fontSize: '7px',
//                     fontWeight: 'bold'
//                 }}>
//                     Jio
//                 </div>
//             </div>
            
//             <div style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: '1px',
//                 fontSize: '9px',
//                 color: '#ccc',
//                 textAlign: 'center'
//             }}>
//                 {item.uniqueApps > 0 && <div>Apps: {item.uniqueApps}</div>}
//                 {item.uniqueBts > 0 && <div>BTS: {item.uniqueBts}</div>}
//                 {item.uniqueDestIps > 0 && <div>IPs: {item.uniqueDestIps}</div>}
//                 {item.uniqueImeis > 0 && <div>IMEIs: {item.uniqueImeis}</div>}
//             </div>
//         </div>
//     );

//     const CirclesDisplay = ({ circleData, field }) => {
//         if (!circleData || circleData.length === 0) return null;
        
//         const maxValue = Math.max(...circleData.map(i => i.value));
        
//         return (
//             <div style={{
//                 display: 'flex',
//                 overflowX: 'auto',
//                 overflowY: 'hidden',
//                 padding: '15px 10px',
//                 gap: '8px',
//                 minHeight: '200px',
//                 scrollbarWidth: 'thin',
//                 scrollbarColor: '#FF4444 #2c3e50'
//             }}>
//                 {circleData.map((item, index) => (
//                     <CircleItem 
//                         key={`${field}-circle-${item.name || index}`} 
//                         item={item} 
//                         index={index} 
//                         maxValue={maxValue}
//                         field={field}
//                     />
//                 ))}
//             </div>
//         );
//     };

//     const CustomYAxisTick = ({ x, y, payload }) => {
//         const maxCharsPerLine = 25;

//         const breakTextWithHyphen = (text) => {
//             const words = text.split(" ");
//             const lines = [];
//             let currentLine = "";

//             for (let word of words) {
//                 if (word.length > maxCharsPerLine) {
//                     const parts = word.match(new RegExp(`.{1,${maxCharsPerLine - 1}}`, 'g')) || [];
//                     parts.forEach((part, index) => {
//                         const withHyphen = index < parts.length - 1 ? `${part}-` : part;
//                         if (currentLine.length + withHyphen.length <= maxCharsPerLine) {
//                             currentLine += withHyphen;
//                         } else {
//                             lines.push(currentLine);
//                             currentLine = withHyphen;
//                         }
//                     });
//                 } else if ((currentLine + word).length <= maxCharsPerLine) {
//                     currentLine += (currentLine ? " " : "") + word;
//                 } else {
//                     lines.push(currentLine);
//                     currentLine = word;
//                 }
//             }

//             if (currentLine) {
//                 lines.push(currentLine);
//             }

//             return lines;
//         };

//         const lines = breakTextWithHyphen(payload.value);

//         return (
//             <g transform={`translate(${x},${y})`}>
//                 <text x={0} y={0} textAnchor="end" fontSize={12} fill="#fff">
//                     {lines.map((line, index) => (
//                         <tspan key={`${line}-${index}`} x={0} dy={index === 0 ? 0 : 14}>
//                             {line}
//                         </tspan>
//                     ))}
//                 </text>
//             </g>
//         );
//     };

//     const renderBarChart = (data, title, fieldKey, metricKey = null) => {
//         const showAll = showAllStates[`${fieldKey}-${metricKey || 'main'}`] || false;
//         const displayData = showAll ? data.rawData || data : data.data || data;
        
//         if (!displayData || displayData.length === 0) return null;

//         return (
//             <div style={{
//                 width: '100%',
//                 backgroundColor: '#101D2B',
//                 borderRadius: '15px',
//                 padding: '20px',
//                 marginBottom: '15px'
//             }}>
//                 <div style={{
//                     color: '#fff',
//                     fontSize: '16px',
//                     fontWeight: 'bold',
//                     marginBottom: '15px',
//                     paddingBottom: '10px',
//                     borderBottom: '1px solid #2c3e50'
//                 }}>
//                     {title}
//                 </div>
                
//                 <div style={{
//                     width: '100%',
//                     height: chartHeight,
//                     overflowY: 'auto',
//                     overflowX: 'auto',
//                     scrollbarWidth: 'thin',
//                     scrollbarColor: '#FF4444 #2c3e50'
//                 }}>
//                     {displayData.length > 0 && displayData[0].name !== 'No Data' ? (
//                         <ResponsiveContainer 
//                             width="100%" 
//                             height={displayData.length * 45 < chartHeight ? chartHeight : displayData.length * 45}
//                         >
//                             <BarChart
//                                 data={displayData}
//                                 layout="vertical"
//                                 barCategoryGap={30}
//                                 margin={{ top: 20, right: 30, bottom: 5, left: 10 }}
//                             >
//                                 <CartesianGrid horizontal={true} vertical={false} stroke="#F3F3F51A" />
//                                 <XAxis type="number" tick={{ fill: '#fff', fontSize: 12 }} />
//                                 <YAxis
//                                     dataKey="name"
//                                     type="category"
//                                     width={200}
//                                     tick={<CustomYAxisTick />}
//                                     interval={0}
//                                 />
//                                 <Tooltip
//                                     wrapperStyle={{
//                                         backgroundColor: "#0E2C46",
//                                         border: "1px solid #FF4444",
//                                         borderRadius: "8px",
//                                         padding: "8px",
//                                         color: "#fff",
//                                         maxWidth: "250px",
//                                     }}
//                                     contentStyle={{
//                                         backgroundColor: "#0E2C46",
//                                         border: "none",
//                                         maxWidth: "250px",
//                                         whiteSpace: "normal",
//                                         wordWrap: "break-word",
//                                         overflowWrap: "break-word",
//                                     }}
//                                     labelStyle={{ color: "#D6D6D6" }}
//                                     cursor={{ fill: "#1c2833" }}
//                                 />
//                                 <Bar
//                                     dataKey="value"
//                                     fill="#FF4444"
//                                     barSize={15}
//                                     isAnimationActive={false}
//                                 >
//                                     {displayData.map((entry, index) => (
//                                         <Cell
//                                             key={`cell-${fieldKey}-${metricKey || 'main'}-${entry.id || index}`}
//                                             fill={index === activeIndices[`${fieldKey}-${metricKey || 'main'}`] ? "#FF6666" : "#FF4444"}
//                                             radius={8}
//                                             onMouseEnter={() => setActiveIndices(prev => ({ ...prev, [`${fieldKey}-${metricKey || 'main'}`]: index }))}
//                                             onMouseLeave={() => setActiveIndices(prev => ({ ...prev, [`${fieldKey}-${metricKey || 'main'}`]: null }))}
//                                         />
//                                     ))}
//                                 </Bar>
//                             </BarChart>
//                         </ResponsiveContainer>
//                     ) : (
//                         <div style={{
//                             height: '150px',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             color: '#999',
//                             fontSize: '16px'
//                         }}>
//                             No Data Available
//                         </div>
//                     )}
//                 </div>

//                 {(data.rawData || data).length > MAX_BARS && (
//                     <div style={{ textAlign: 'center', marginTop: '12px' }}>
//                         <button
//                             onClick={() => toggleShowAll(`${fieldKey}-${metricKey || 'main'}`)}
//                             style={{
//                                 color: '#FF4444',
//                                 background: 'none',
//                                 border: 'none',
//                                 cursor: 'pointer',
//                                 textDecoration: 'underline',
//                                 fontWeight: 'bold',
//                                 fontSize: '14px',
//                                 transition: 'color 0.3s ease',
//                                 padding: 0,
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 margin: '0 auto',
//                                 gap: '5px'
//                             }}
//                         >
//                             {showAll ? 'Show Less' : 'Show More'} {showAll ? <SlArrowUp /> : <SlArrowDown />}
//                         </button>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     const renderFieldSection = (field, index) => {
//         const fieldData = allFieldsData[field];
//         if (!fieldData) return null;

//         const { mainData, metrics } = fieldData;

//         return (
//             <div key={field} style={{
//                 width: '500px',
//               overflow:'auto',
//               height:'250px',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: '20px'
//             }}>
               
//                 {/* Main Bar Chart */}
//                 {renderBarChart(mainData.barData, `Main ${field.replace(/_/g, ' ')} Statistics`, field)}

//                 {/* Circles Section */}
//                 {mainData.circleData.length > 0 && (
//                     <div style={{
//                         width: '100%',
//                         backgroundColor: '#101D2B',
//                         borderRadius: '15px',
//                         padding: '20px',
//                         marginBottom: '20px'
//                     }}>
//                         <div style={{
//                             color: '#fff',
//                             fontSize: '16px',
//                             fontWeight: 'bold',
//                             marginBottom: '15px',
//                             paddingBottom: '10px',
//                             borderBottom: '1px solid #2c3e50'
//                         }}>
//                             Top {field.replace(/_/g, ' ')} (Circles)
//                         </div>
//                         <div style={{
//                             width: '700px',
//                             overflow: 'auto',
//                             height:'250px'
//                         }}>
//                             <CirclesDisplay circleData={mainData.circleData} field={field} />
//                         </div>
//                     </div>
//                 )}

//                 {/* Metric Bar Charts */}
//                 {Object.entries(metrics).map(([metricKey, metricData]) => {
//                     if (metricData.data.length === 0) return null;
//                     return renderBarChart(metricData, metricData.name, field, metricKey);
//                 })}
//             </div>
//         );
//     };

//     return (
//         <div style={{
//             width: '100%',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '0px',
//             padding: '20px',
//             backgroundColor: '#0a1929',
//             minHeight: '100vh',
//             overflowX: 'hidden'
//         }}>
//             {Object.keys(allFieldsData).map((field, index) => renderFieldSection(field, index))}
//         </div>
//     );
// };

// CircleBarChart.propTypes = {
//     aggsFields: PropTypes.array,
//     queryPayload: PropTypes.object,
//     caseId: PropTypes.string,
//     chartHeight: PropTypes.number,
//     transformData: PropTypes.func,
//     onDataCheck: PropTypes.func,
// };

// export default CircleBarChart;