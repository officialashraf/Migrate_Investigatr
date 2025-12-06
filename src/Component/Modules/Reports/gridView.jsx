import { useState, useEffect } from "react";
import { Table, Pagination } from "react-bootstrap";
import style from "../Analyze/TabularData/caseTableData.module.css";
import { useSelector, useDispatch } from "react-redux";
import { setReportResults } from "../../../Redux/Action/reportAction";
import { setPage } from "../../../Redux/Action/criteriaAction";
import Loader from "../Layout/loader";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "../../Common/Table/table.module.css";
import Select from "react-select";

const GridView = ({ chipsHeight }) => {
  const Token = Cookies.get("accessToken");
  const dispatch = useDispatch();
  const reportFilter = useSelector(
    (state) => state.reportFilter?.reportFilters
  );

  const {
    results,
    page,
    total_pages,
    error,
    loading: reportLoading,
  } = useSelector((state) => state.report);

  const totalPages = total_pages || 0;

  // Local state
  const currentPage = page ;
  const [loading, setLoading] = useState(false);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [data, setData] = useState([]);
  const [columnMapping, setColumnMapping] = useState([]);
  const [isMappingLoaded, setIsMappingLoaded] = useState(false); // NEW STATE

  const formatOptions = [
    { value: "docx", label: "Word (.docx)" },
    { value: "csv", label: "CSV (.csv)" },
    { value: "pdf", label: "PDF (.pdf)" },
    { value: "json", label: "JSON (.json)" },
  ];

  const specialColumns = ["socialmedia_hashtags", "targets", "person", "gpe", "unified_case_id", "org", "loc", "event", "time", "date", "money", "sentiment", "product", "quantity", "law", "language", "phone_numbers", "emails"]

  const tagStyle = {
    backgroundColor: "#FFC107",
    color: "#000",
    padding: "2px 6px",
    borderRadius: "12px",
    fontSize: "11px",
    whiteSpace: "nowrap",
  };

  // Fetch column mapping - WITH LOADING STATE
  useEffect(() => {
    const fetchMapping = async () => {
      try {
        setIsMappingLoaded(false); // START LOADING
        const token = Cookies.get("accessToken");
        const response = await axios.get(
          `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/mappings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setColumnMapping(response.data);
        setIsMappingLoaded(true); // MAPPING LOADED
      } catch (error) {
        console.error("Mapping fetch failed", error);
        setColumnMapping([]);
        setIsMappingLoaded(true); // EVEN ON ERROR, STOP LOADING
      }
    };

    if (Token) {
      fetchMapping();
    }
  }, [Token, reportFilter?.case_id]);

  // Data + Initial Load handling
  useEffect(() => {
    if (results === null) {
      setIsInitialLoad(true);
      setData([]);
      setDataAvailable(false);
    } else {
      setIsInitialLoad(false);
      setData(results || []);
      setDataAvailable(Array.isArray(results) && results.length > 0);
    }
  }, [results]);

  // Get filtered columns with grouping
  const getFilteredColumns = () => {
    if (!data || data.length === 0) return [];
    const allKeys = [...new Set(data.flatMap((item) => Object.keys(item)))];

    if (!columnMapping || columnMapping.length === 0) {
      return allKeys.map((key) => ({
        key,
        displayName: key
          .split("_")
          .map((word) =>
            word === word.toUpperCase()
              ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join(" "),
        group: "Common",
      }));
    }

    return allKeys
      .map((key) => {
        const mapping = columnMapping.find((m) => m.column_name === key);
        return {
          key,
          displayName:
            mapping?.display_name ||
            key
              .split("_")
              .map((word) =>
                word === word.toUpperCase()
                  ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  : word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" "),
          showInReport: mapping?.show_in_reports !== false,
          group: mapping?.group_name || "Common",
        };
      })
      .filter((col) => col.showInReport);
  };

  // Group columns by their group with specific order
  const getGroupedColumns = () => {
    const columns = getFilteredColumns();
    const groupOrder = ["Common", "OSINT", "IPDR", "Entities", "CDR"];
    const grouped = {};

    // Initialize groups in order
    groupOrder.forEach(groupName => {
      grouped[groupName] = [];
    });

    // Add columns to their respective groups
    columns.forEach((col) => {
      const group = col.group || "Common";
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(col);
    });

    // Remove empty groups
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });

    return grouped;
  };

  const renderCellContent = (item, colKey) => {
    const value = item[colKey];

    // Handle time conversion columns
    const timeColumns = ["unified_activity_time", "unified_capture_time"];
    if (timeColumns.includes(colKey) && value) {
      try {
        const date = new Date(Number(value));
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        hours = String(hours).padStart(2, "0");
        return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
      } catch {
        return value;
      }
    }

    // Handle empty arrays
    if (Array.isArray(value) && value.length === 0) {
      return "-";
    }

    // Handle arrays with values - convert to comma separated
    if (Array.isArray(value) && value.length > 0) {
      // Check if it's a special column that needs tags
      if (specialColumns.includes(colKey)) {
        return (
          <div style={{ display: "flex", gap: "4px" }}>
            {value.map((tag, i) => (
              <span key={i} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>
        );
      }
      // For other arrays, show comma separated
      return value.join(", ");
    }

    // Handle string arrays like "['value1', 'value2']"
    if (typeof value === "string" && (value.startsWith("[") || value.startsWith("'"))) {
      try {
        // Try to parse string as array
        const parsed = JSON.parse(value.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) {
            return "-";
          }
          // Check if special column needs tags
          if (specialColumns.includes(colKey)) {
            return (
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {parsed.map((tag, i) => (
                  <span key={i} style={tagStyle}>
                    {tag}
                  </span>
                ))}
              </div>
            );
          }
          // Otherwise comma separated
          return parsed.join(", ");
        }
      } catch (err) {
        // If parsing fails, show as is
      }
    }

    // Handle objects
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    // Return "-" for null, undefined, or empty string
    return value || "-";
  };

  // Download report
  const fetchReportData = async (format = "docx") => {
    try {
      setLoading(true);
      const queryObject = { report_generation: true };

      if (reportFilter?.keyword?.length > 0) {
        queryObject.keyword = reportFilter.keyword;
      }
      if (reportFilter?.file_type?.length > 0) {
        queryObject.file_type = reportFilter.file_type;
      }
      if (reportFilter?.target?.length > 0) {
        queryObject.targets = reportFilter.target.map((t) =>
          String(t.value || t)
        );
      }
      if (reportFilter?.sentiment?.length > 0) {
        queryObject.sentiments = reportFilter.sentiment;
      }
      if (reportFilter?.case_id?.length > 0) {
        queryObject.case_id = reportFilter.case_id.map((c) => String(c));
      }
      if (reportFilter?.start_time && reportFilter?.end_time) {
        queryObject.start_time = reportFilter.start_time;
        queryObject.end_time = reportFilter.end_time;
      }
     if (reportFilter?.unified_type?.length > 0) {
        queryObject.unified_type = reportFilter.unified_type;
      }
      if (reportFilter?.eventtypestring?.length > 0) {
        queryObject.eventtypestring = reportFilter.eventtypestring;
      }
      if (reportFilter?.mobilenumber?.length > 0) {
        queryObject.mobilenumber = reportFilter.mobilenumber;
      }
      if (reportFilter?.socialmedia_hashtags?.length > 0) {
        queryObject.socialmedia_hashtags = reportFilter.socialmedia_hashtags;
      }
      if (reportFilter?.socialmedia_from_id?.length > 0) {
        queryObject.socialmedia_from_id = reportFilter.socialmedia_from_id;
      }
      if (reportFilter?.socialmedia_from_screenname?.length > 0) {
        queryObject.socialmedia_from_screenname = reportFilter.socialmedia_from_screenname;
      }
      if (reportFilter?.serverip?.length > 0) {
        queryObject.serverip = reportFilter.serverip;
      }

      // Latitude/Longitude (These are single strings, so only check if they exist/are non-empty)
      if (reportFilter?.latitude) {
        queryObject.latitude = reportFilter.latitude;
      }
      if (reportFilter?.longitude) {
        queryObject.longitude = reportFilter.longitude;
      }
      const payload = {
        file_extension: format,
        query: queryObject,
      };

      const endpoint = `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/report`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const response = await axios.post(endpoint, payload, {
        responseType: "blob",
        headers: {
          Accept:
            format === "pdf"
              ? "application/pdf"
              : format === "docx"
                ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                : format === "csv"
                  ? "text/csv"
                  : "application/json",
          Authorization: `Bearer ${Token}`,
          "timezone": timezone, 
        },
      });

      const filename = `Social_Media_Report.${format}`;
      downloadBlob(response.data, filename);
    } catch (error) {
      console.error(`Error downloading ${format} file:`, error);
    } finally {
      setLoading(false);
    }
  };

  const downloadBlob = async (blob, filename) => {
    const url = window.URL.createObjectURL(blob);

    if ("showSaveFilePicker" in window && window.isSecureContext) {
      try {
        const extension = filename.split(".").pop();
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: `${extension.toUpperCase()} File`,
              accept: {
                [`application/${extension}`]: [`.${extension}`],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        if (err.name !== "AbortError") {
          directDownload(url, filename);
        }
      }
    } else {
      directDownload(url, filename);
    }

    window.URL.revokeObjectURL(url);
  };

  const directDownload = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    a.remove();
  };

  const handlePageChange = async (newPage) => {
    try {
      setLoading(true);

      const queryObject = {
        report_generation: true,
        page: newPage,
        size: 50,
      };

      if (reportFilter?.keyword?.length > 0) {
        queryObject.keyword = reportFilter.keyword;
      }
      if (reportFilter?.file_type?.length > 0) {
        queryObject.file_type = reportFilter.file_type;
      }
      if (reportFilter?.target?.length > 0) {
        queryObject.targets = reportFilter.target.map((t) =>
          String(t.value || t)
        );
      }
      if (reportFilter?.sentiment?.length > 0) {
        queryObject.sentiments = reportFilter.sentiment;
      }
      if (reportFilter?.case_id?.length > 0) {
        queryObject.case_id = reportFilter.case_id;
      }
      if (reportFilter?.start_time && reportFilter?.end_time) {
        queryObject.start_time = reportFilter.start_time;
        queryObject.end_time = reportFilter.end_time;
      }

      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/search`,
        queryObject,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      dispatch(
        setReportResults({
          page: response.data.page,
          results: response.data.results,
          total_pages: response.data.total_pages,
          total_results: response.data.total_results,
        })
      );
      dispatch(setPage(newPage));
    } catch (error) {
      console.error("Error fetching page data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(currentPage - i) <= 1) {
      pages.push(i);
    } else if (
      (i === 2 && currentPage > 4) ||
      (i === totalPages - 1 && currentPage < totalPages - 3)
    ) {
      pages.push("...");
    }
  }

  const filteredColumns = getFilteredColumns();
  const groupedColumns = getGroupedColumns();

  // SHOW LOADER if mapping not loaded AND data is available
  if (!isMappingLoaded && dataAvailable) {
    return <Loader />;
  }

  if (loading && !isInitialLoad) return <Loader />;
  
  if (error) {
    return (
      <div
        className="error-container"
        style={{ textAlign: "center", padding: "50px", color: "red" }}
      >
        <h3>Error Loading Data</h3>
        <p>{error.message || "An unexpected error occurred while fetching data."}</p>
        <button
          onClick={() => {
            setLoading(true);
            handlePageChange(currentPage);
          }}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div
        className={`${styles.tabulerDynamic}`}
        style={{
                 marginTop: "5px", backgroundColor: "#101D2B",
                  maxHeight: `calc(72vh - ${chipsHeight}px)`, 
                  overflowY: 'auto', 
                  overflowX: 'auto' 
        }}
      >

  {/* Only show table when dataAvailable is true */}
  {dataAvailable ? (
    <Table hover className={styles.table}>
      <thead>
        {/* Group Headers Row */}
        <tr style={{ backgroundColor: "#1a2332" }}>
          {Object.keys(groupedColumns).map((groupName, index) => (
            <th
              key={groupName}
              colSpan={groupedColumns[groupName].length}
              className={style.fixedTh}
              style={{
                textAlign: "center",
                fontWeight: "normal",
                fontSize: "12px",
                color: "#0073cf",
                position: "relative",
              }}
              ref={(el) => {
                if (el) {
                  el.style.setProperty("background-color", "#101D2B", "important");
                  el.style.setProperty("color", "#fff", "important");
                }
              }}
            >
              {groupName}
              {index !== Object.keys(groupedColumns).length - 1 && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: "2px",
                    backgroundColor: "#0073cf",
                    opacity: 0.4,
                  }}
                />
              )}
            </th>
          ))}
        </tr>

        {/* Column Headers Row */}
        <tr>
          {Object.values(groupedColumns).flatMap((cols) =>
            cols.map((column) => (
              <th key={column.key} className={style.fixedTh}>
                {column.displayName}
              </th>
            ))
          )}
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>
        {data.length > 0 ? (
          data.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(groupedColumns).flatMap((cols) =>
                cols.map((column) => (
                  <td key={`${rowIndex}-${column.key}`} className={style.fixedTd}>
                    <div
                      className="cell-content"
                      style={{
                        cursor: "pointer",
                        fontWeight: "400",
                        overflow: "auto",
                        whiteSpace: "nowrap",
                        padding: "0px 5px",
                        fontSize: "12px",
                        fontFamily: "roboto",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                      title={
                        typeof item[column.key] === "object"
                          ? JSON.stringify(item[column.key])
                          : item[column.key]
                      }
                    >
                      {renderCellContent(item, column.key)}
                    </div>
                  </td>
                ))
              )}
            </tr>
          ))
        ) : (
          // If dataAvailable is true but no rows received
          <tr>
            <td colSpan={filteredColumns.length || 1} className="text-center">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  ) : (
    // Show "No matches found" only after first search
    !isInitialLoad && (
      <div className="text-center" style={{ color: "#fff", backgroundColor:'#080E17' }}>
        No matches found. Try changing your filters or keywords.
      </div>
    )
  )}


      </div>

      {dataAvailable && (
        <div
          className={style.paginationContainer}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "auto",
            boxShadow: "0 -2px 5px rgba(0,0,0,0.05)",
            backgroundColor: "#101D2B",
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Pagination style={{ width: "200px" }}>
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Pagination.Prev>

              {pages.map((number, index) =>
                number === "..." ? (
                  <Pagination.Item key={index} disabled>
                    {number}
                  </Pagination.Item>
                ) : (
                  <Pagination.Item
                    key={index}
                    active={number === currentPage}
                    onClick={() => number !== "..." && handlePageChange(number)}
                  >
                    {number}
                  </Pagination.Item>
                )
              )}

              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Pagination.Next>
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>

          <div
            style={{
              position: "absolute",
              right: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Select
              options={formatOptions}
              value={null}
              onChange={(option) => option && fetchReportData(option.value)}
              styles={{
                placeholder: (provided) => ({
                  ...provided,
                  color: "#d9d9d9",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "#FFFFFF",
                }),
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#0073CF",
                  color: "#E8F5E9",
                  borderRadius: "15px",
                  border: "none",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "#080E17",
                  borderRadius: "15px",
                  overflow: "hidden",
                  border: "1px solid #0073CF",
                  zIndex: 9999,
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? "#0073CF" : "#080E17",
                  color: "#D9D9D9",
                  cursor: "pointer",
                }),
              }}
              menuPosition="fixed"
              menuPlacement={data.length === 1 ? "bottom" : "top"}
              isSearchable={false}
              placeholder="Print Record"
              getOptionLabel={(option) => option.label}
              formatOptionLabel={(option) => option.label}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GridView;