import React, { useEffect, useState } from "react";
import styles from "./tabuler.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import Loader from "../../../Modules/Layout/loader";
import PropTypes from "prop-types";
import EpochToIST from "../../../../utils/epocTimeConverter";

const Tabuler = ({
  aggsFields = [],
  queryPayload = null,
  caseId = null,
  onDataCheck = null,
  wrapperSummary,
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("accessToken");

  // Mapping API keys -> User friendly labels
  const fieldLabels = {
    total_records: "Records",
    unique_subscribers: "Subscribers",
    unique_imeis: "IMEI",
    unique_dest_ips: "Destination IPs",
    unique_dest_ports: "Destination Ports",
    first_activity: "First Activity Time",
    last_activity: "Last Activity Time",
  };

  const getArrayFromPayload = (key, queryPayload) => {
    return Array.isArray(queryPayload?.[key]) ? queryPayload[key] : [];
  };
  const getSentimentsArray = (queryPayload) => {
        return Array.isArray(queryPayload?.sentiments)
            ? queryPayload.sentiments
            : Array.isArray(queryPayload?.sentiment)
                ? queryPayload.sentiment
                : [];
    };

 const getTargetsArray = (queryPayload) => {
        return Array.isArray(queryPayload?.target)
            ? queryPayload.target.map(t => String(t.value))
            : Array.isArray(queryPayload?.targets)
                ? queryPayload.targets.map(t => String(t.value))
                : [];
    };
  const getCaseIdArray = (queryPayload) => {
    if (Array.isArray(queryPayload?.case_id)) return queryPayload.case_id;
    if (Array.isArray(queryPayload?.caseId)) return queryPayload.caseId;
    if (queryPayload?.case_id) return [queryPayload.case_id];
    if (queryPayload?.caseId) return [queryPayload.caseId];
    return [];
  };

  const createFlatQuery = (queryPayload, aggsFields) => {
    const case_id = getCaseIdArray(queryPayload).map(String);

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
      loc: getArrayFromPayload("loc", queryPayload),
      emails: getArrayFromPayload("emails", queryPayload),
      event: getArrayFromPayload("event", queryPayload),
      date: getArrayFromPayload("date", queryPayload),
      person: getArrayFromPayload("person", queryPayload),
      org: getArrayFromPayload("org", queryPayload),
      language: getArrayFromPayload("language", queryPayload),
      latitude: queryPayload?.latitude ? String(queryPayload.latitude) : "",
      longitude: queryPayload?.longitude ? String(queryPayload.longitude) : "",
      ...(queryPayload?.start_time && { start_time: queryPayload.start_time }),
      ...(queryPayload?.end_time && { end_time: queryPayload.end_time }),
    };
  };

  const cleanQuery = (flatQuery) => {
    return Object.fromEntries(
      Object.entries(flatQuery).filter(
        ([, value]) =>
          Array.isArray(value)
            ? value.length > 0
            : value !== null && value !== undefined && value !== ""
      )
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let flatQuery = createFlatQuery(queryPayload, aggsFields);
        flatQuery = cleanQuery(flatQuery);

        const response = await axios.post(
          `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/ipdr-cdr/statistic`,
          flatQuery,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const statsData = response.data || {};
        setStats(statsData);

        // onDataCheck logic (true if at least one value > 0 or not null)
        if (onDataCheck) {
          const values = Object.values(statsData).map((v) => v?.value ?? null);
          const hasData = values.some((val) => val && val > 0);
          onDataCheck(hasData);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStats(null);
        if (onDataCheck) onDataCheck(false);
      } finally {
        setLoading(false);
      }
    };

    if (queryPayload || caseId) {
    fetchData();
  }
  }, [caseId, aggsFields.join(","), queryPayload, token]);

  if (loading) return <Loader />;

  if (!stats) return <div>No Data</div>;

  return (
    <div className={wrapperSummary ? styles.wrapperSummary : styles.tableWrapper}>
      <table className={styles.table}>
        <tbody>
          {Object.entries(fieldLabels).map(([apiKey, label]) => (
            <tr key={apiKey}>
              <td className={styles.keyCell}>{label}</td>
                <td className={styles.valueCell}>
              {apiKey === "first_activity" || apiKey === "last_activity" ? (
                <EpochToIST epoch={stats?.[apiKey]?.value} />
              ) : (
                stats?.[apiKey]?.value ?? "N/A"
              )}
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Tabuler.propTypes = {
  aggsFields: PropTypes.array,
  queryPayload: PropTypes.object,
  caseId: PropTypes.any,
  onDataCheck: PropTypes.func,
  wrapperSummary: PropTypes.bool,
};

export default Tabuler;
