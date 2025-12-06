import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import Cookies from "js-cookie";
import Loader from '../../../Modules/Layout/loader';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const ReusableLineGraph = ({
  queryPayload = null,
  caseId = null,
  aggsFields = [],
  onDataCheck = null,
  recordLineField = null,
  title = ""
}) => {
  const token = Cookies.get("accessToken");
  const [data, setData] = useState([]);
  const [recordTypes, setRecordTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  console.log("queryplayold", queryPayload);
  // Color palette for different types
  // const colors = [
  //   '#0073CF', '#FF6B6B', '#45B7D1', '#F7DC6F', '#96CEB4',
  //   '#DDA0DD', '#98D8C8', ''
  // ];
  const fixedColors = [
    "#4CAF50", // ya getCSSVar('--color-colors-success')
    "#E74C3C",
    "#F1C40F",
    "#F39C12", // warning
    "#2ECC71",     // success
    "#A0522D",
    "#3498DB",     // primaryAccent
    "#b3229dff"
  ];

  const getLineColor = (type, index) => {
    return fixedColors[type] || fixedColors[index % fixedColors.length];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        //  Always prepare unified_case_id as string[]
        const caseIdArray = Array.isArray(queryPayload?.case_id)
          ? queryPayload.case_id
          : Array.isArray(queryPayload?.caseId)
            ? queryPayload.caseId
            : queryPayload?.case_id
              ? [queryPayload.case_id]
              : queryPayload?.caseId
                ? [queryPayload.caseId]
                : [];

        const case_id = caseIdArray.map(String); // Ensure string[]

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
          // page: 1,
          // size: 50,
        };

        //  Remove empty/null/undefined arrays or values
        flatQuery = Object.fromEntries(
          Object.entries(flatQuery).filter(
            ([, value]) =>
              Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== ""
          )
        );

        const payload = flatQuery;

        //  API Call
        const response = await axios.post(`${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/timeline`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("response", response.data.result)
        //  Process API Response
        const rawData = response.data.result.unified_date_only || response.data.result || [];
        setCount(response.data.count);
        const processedData = transformDataForMultipleLines(rawData);

        setData(processedData.chartData);

        setRecordTypes(processedData.types);
        if (onDataCheck) {
          const hasValidData =
            processedData.chartData.length > 0 &&
            processedData.chartData.some(point =>
              processedData.types.some(type => point[type] > 0)
            );
          onDataCheck(hasValidData);
        }

      } catch (error) {
        if (error.response?.data?.detail) {
          toast.error(error.response.data.detail);
        }
        console.error('Error fetching data:', error);
        setData([]);
        setRecordTypes([]);
        if (onDataCheck) {
          onDataCheck(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId, queryPayload, token]);

  // Function to transform data for multiple lines
  const transformDataForMultipleLines = (rawData) => {
    // Group data by date and type
    const dateTypeMap = {};
    const typesSet = new Set();

    rawData.forEach(item => {
      const date = item.date || item.key;
      const type = item.type || 'Default';
      const count = item.count || item.doc_count || 0;

      if (!dateTypeMap[date]) {
        dateTypeMap[date] = {};
      }
      dateTypeMap[date][type] = count;
      typesSet.add(type);
    });

    // Create chart data with all types for each date
    const chartData = Object.keys(dateTypeMap)
      // .sort((a, b) => new Date(a) - new Date(b))
      .map(date => {
        const dataPoint = { date };
        Array.from(typesSet).forEach(type => {
          dataPoint[type] = dateTypeMap[date][type] || 0;
        });
        return dataPoint;
      });

    return {
      chartData,
      types: Array.from(typesSet)
    };
  };
  const CustomTooltip = ({ payload, label }) =>
    payload?.length ? (
      <div style={{
        background: "#0E2C46",
        padding: "4px",
        borderRadius: "6px",
        boxShadow: "0 0 4px rgba(0,0,0,0.2)",
        border: "1px solid #0073CF",
        color: "#fff"
      }}>
        <p style={{
          margin: '2px 0', color: "#fff"
        }}>
          {label}
        </p>
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{
            margin: '2px 0',
            color: entry.color,
            fontSize: "12px",
            marginBottom: "2px",
            backgroundColor: "#0E2C46",
          }}>
            {entry.dataKey}: {entry.value}
          </p>
        ))}
      </div>
    ) : null;

  if (loading) return <Loader style={{ marginTop: '-120px', color: 'white' }} />;

  return (
    <div style={{ width: "100%", height: 280, position: "relative" }}>
      {/* Scrollable chart container */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        {data.length > 0 ? (
          <div style={{ width: `${Math.max(data.length * 60, window.innerWidth - 200)}px`, height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ right: 20, top: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  stroke="#38444d"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fill: "#E0E0E0", fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: "#E0E0E0", fontSize: 12 }} />

                <Tooltip content={CustomTooltip} />

                {/* Multiple lines for each type */}
                {recordTypes.map((type, index) => (
                  <Line
                    key={type}
                    type="monotone"
                    dataKey={type}
                    stroke={getLineColor(type, index)}
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      stroke: "#fff",
                      strokeWidth: 1,
                      fill: getLineColor(type, index),
                    }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          // ✅ Centered No Data Found message
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 12,
              // fontWeight: 500,
              textAlign: "center",
            }}
          >
            No Data Found
          </div>
        )}
      </div>

      {/* Sticky legend + total record section (only show if data exists) */}
      {data.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#FFFFFF",
            padding: "4px 12px",
            borderRadius: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            {recordTypes.map((type, index) => (
              <span
                key={type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: getLineColor(type, index), // ✅ Legend color = line color
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: getLineColor(type, index),
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                ></span>
                {type}
              </span>
            ))}
          </div>

          <span style={{ fontSize: 12, marginTop: 2, fontWeight: 'normal', color: "#E0E0E0" }}>
            {`Total Record: ${count}`}
          </span>
          
        </div>
      )}
    </div>

  );
};

ReusableLineGraph.propTypes = {
  queryPayload: PropTypes.object,
  caseId: PropTypes.string,
  aggsFields: PropTypes.array.isRequired,
  recordLineField: PropTypes.string,
  title: PropTypes.string,
  onDataCheck: PropTypes.func,
};

export default ReusableLineGraph