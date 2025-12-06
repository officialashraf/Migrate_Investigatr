import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table } from "react-bootstrap";
import Loader from "../Layout/loader";
import axios from "axios";
import styles from "../../Common/Table/table.module.css"; // Create this CSS file

const ResourceSummary = ({refreshKey}) => {
  const caseId = useSelector((state) => state.caseData?.caseData.id); // Adjust path based on your redux structure
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };


  // Fixed headers for resource data
  const headers = [
    { key: "resource_name", label: "Resource Name" },
     { key: "filter_id", label: "Filter ID" },
    { key: "last_applied_on", label: "Last Applied" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
    { key: "record_count", label: "Record Count" },
    { key: "resource_path", label: "Resource Path" },
    { key: "error", label: "Error" }
  ];

  // Fetch resources data
  const fetchResources = async () => {
    if (!caseId) {
      setError("Case ID not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
         `${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/res-man/v1/resource/${caseId}`
      );

      const resources = response.data || [];
      setData(resources);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch resources");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchResources();
  }, [caseId,refreshKey]);

  // Render cell content
  const renderCellContent = (item, key) => {
    const value = item[key];

    if (value === null || value === undefined) {
      return "-";
    }
    if (key === "last_applied_on") {
      return formatDate(value);  
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return value;
  };

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        color: "#ff4444",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      backgroundColor: "#101D2B",
      width:'100%',
      padding:'20px'

    }}>
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "auto"
      }}>
        {data && data.length > 0 ? (
          <Table hover  className={styles.table}
          >
            <thead style={{ position: "sticky", top: 0, backgroundColor: "#101D2B", zIndex: 10 }}>
              <tr>
                {headers.map((header) => (
                  <th 
                    key={header.key}
                   className={styles.th}
                  >
                   <div className={styles.thContent}>
                   <span>{header.label}</span>
 
                  </div>
                   
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr 
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #2a3f5f"
                  }}
                >
                  {headers.map((header) => (
                    <td
                      key={header.key}
                      style={{
                        padding: "10px 8px",
                        fontSize: "12px",
                        fontFamily: "roboto",
                        color: "#ccc",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "200px"
                      }}
                      title={typeof item[header.key] === 'object' ? JSON.stringify(item[header.key]) : item[header.key]}
                    >
                      {renderCellContent(item, header.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div style={{
          textAlign:'center'
          }}>
            No resources found for this case
          </div>
        )}
      </div>

      {/* Footer with total count */}
      {data && data.length > 0 && (
        <div style={{
          padding: "10px 16px",
          // backgroundColor: "#0d1620",
          // borderTop: "1px solid #2a3f5f",
          textAlign: "right",
          color: "#ccc",
          fontSize: "12px"
        }}>
          Total Resources: {data.length}
        </div>
      )}
    </div>
  );
};

export default ResourceSummary;
