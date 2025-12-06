import React from "react";
import { Table, Pagination } from "react-bootstrap";
import style from "../../Modules/Analyze/TabularData/caseTableData.module.css";
import Loader from "../../Modules/Layout/loader";
import styles from "./table.module.css";
import PropTypes from "prop-types";

const CommonTableComponent = ({
    onDoubleClick = () => {},
    tabulerDynamic,
chipsHeight,
    data = [],
    headers = [], 
    loading = false,
    error = null,
    currentPage = 1,
    totalPages = 1,
    totalResults = 0,
    handlePageChange = () => { },
    columnMapping = [],
    useColumnMapping = true,
    groupColors = {},
    getGroupColor = () => "#f0f0f0",
    showGroupHeaders = true,
    noDataMessage = "No data available",
    containerStyle = {},
    tableWrapperStyle = {},
    specialColumns = ["socialmedia_hashtags", "targets", "person", "gpe", "unified_case_id", "org", "loc", "event", "time", "date", "money", "sentiment", "product", "quantity", "law", "language", "phone_numbers", "emails", "socialmedia_usermentions"],
    tagStyle = {
        backgroundColor: "#FFC107",
        color: "#000",
        padding: "2px 6px",
        borderRadius: "12px",
        fontSize: "11px",
        whiteSpace: "nowrap"
    }
}) => {

    // Define default group colors and priority order
    const defaultGroupColors = {
        'IPDR': '#000000',
        'Common': '#4B0082',
        'Entities': '#006400',
        'OSINT': '#8B0000',
        'CDR': '#8B4513',
        'Others': '#808080'
    };

    
    // Group priority order - Others will be last
    const groupPriority = {
         'Common': 1,
          'OSINT': 2,
         'IPDR': 3,
        'Entities': 4,
            };

    // Create mapping lookup for O(1) access
    const mappingLookup = React.useMemo(() => {
        const lookup = {};
        columnMapping.forEach((col) => {
            lookup[col.column_name] = col;
        });
        return lookup;
    }, [columnMapping]);

    // Process headers and sort by group
    // const processedHeaders = React.useMemo(() => {
    //     const processed = headers
    //         .map((header) => {
    //             const mapping = mappingLookup[header];
                
    //             // Skip invisible columns
    //             if (useColumnMapping && mapping?.is_visible === false) {
    //                 return null;
    //             }

    //             // Get display name
    //             let displayName;
    //             if (useColumnMapping && mapping?.display_name) {
    //                 displayName = mapping.display_name;
    //             } else {
    //                 displayName = header
    //                     .split("_")
    //                     .map((word) =>
    //                         word === word.toUpperCase()
    //                             ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    //                             : word.charAt(0).toUpperCase() + word.slice(1)
    //                     )
    //                     .join(" ");
    //             }

    //             // Get group name
    //             let groupName = "Others";
    //             if (useColumnMapping && mapping?.group_name) {
    //                 groupName = mapping.group_name;
    //             }

    //             return {
    //                 key: header,
    //                 displayName: displayName,
    //                 isVisible: !useColumnMapping || mapping?.is_visible !== false,
    //                 groupName: groupName,
    //                 groupPriority: groupPriority[groupName] || 999
    //             };
    //         })
    //         .filter(Boolean);

    //     // Sort by group priority - Others will automatically go to end
    //     if (useColumnMapping) {
    //         processed.sort((a, b) => {
    //             return a.groupPriority - b.groupPriority;
    //         });
    //     }

    //     return processed;
    // }, [headers, mappingLookup, useColumnMapping]);


    const processedHeaders = React.useMemo(() => {
  const processed = headers
    .map((header) => {
      const mapping = mappingLookup[header];

      // Skip invisible columns
      if (useColumnMapping && mapping?.is_visible === false) {
        return null;
      }

      //  Skip columns with no group_name when using column mapping
      if (useColumnMapping && !mapping?.group_name) {
        return null;
      }

      // Get display name
      let displayName;
      if (useColumnMapping && mapping?.display_name) {
        displayName = mapping.display_name;
      } else {
        displayName = header
          .split("_")
          .map((word) =>
            word === word.toUpperCase()
              ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join(" ");
      }

      // Get group name (safe — already checked above)
      let groupName = mapping?.group_name;

      return {
        key: header,
        displayName,
        isVisible: !useColumnMapping || mapping?.is_visible !== false,
        groupName,
        groupPriority: groupPriority[groupName] || 999
      };
    })
    .filter(Boolean);

  // Sort by group priority
  if (useColumnMapping) {
    processed.sort((a, b) => a.groupPriority - b.groupPriority);
  }

  return processed;
}, [headers, mappingLookup, useColumnMapping]);

    // Get unique groups with colors
    const uniqueGroupColors = React.useMemo(() => {
        const groupColorMap = {};
        const seenGroups = new Set();

        processedHeaders.forEach(col => {
            if (!seenGroups.has(col.groupName)) {
                seenGroups.add(col.groupName);
                groupColorMap[col.groupName] = groupColors[col.groupName] || defaultGroupColors[col.groupName] || defaultGroupColors['Others'];
            }
        });

        return groupColorMap;
    }, [processedHeaders, groupColors]);

    // Create pagination items
    const createPaginationItems = () => {
        const pages = [];

        if (!useColumnMapping) {
            pages.push(
                <Pagination.Item
                    key={1}
                    active={1 === currentPage}
                    onClick={() => handlePageChange(1)}
                    disabled={loading}
                >
                    1
                </Pagination.Item>
            );

            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);

            for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 && i !== totalPages) {
                    pages.push(
                        <Pagination.Item
                            key={i}
                            active={i === currentPage}
                            onClick={() => handlePageChange(i)}
                            disabled={loading}
                        >
                            {i}
                        </Pagination.Item>
                    );
                }
            }

            if (totalPages > 1) {
                pages.push(
                    <Pagination.Item
                        key={totalPages}
                        active={totalPages === currentPage}
                        onClick={() => handlePageChange(totalPages)}
                        disabled={loading}
                    >
                        {totalPages}
                    </Pagination.Item>
                );
            }
        } else {
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || Math.abs(currentPage - i) <= 1) {
                    pages.push(
                        <Pagination.Item
                            key={i}
                            active={i === currentPage}
                            onClick={() => handlePageChange(i)}
                            className={`${styles.pageItem} ${i === currentPage ? styles.activePage : ""}`}
                        >
                            {i}
                        </Pagination.Item>
                    );
                } else if (
                    (i === 2 && currentPage > 4) ||
                    (i === totalPages - 1 && currentPage < totalPages - 3)
                ) {
                    pages.push(
                        <Pagination.Item key={`ellipsis-${i}`} className={style.pageItem} disabled>
                            ...
                        </Pagination.Item>
                    );
                }
            }
        }

        return pages;
    };

    // Render cell content
    const renderCellContent = (item, colKey) => {
        const value = item[colKey];
        
     if ((colKey === "unified_activity_time" || colKey === "unified_capture_time") && value){
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

        if (specialColumns.includes(colKey)) {
            let tags = [];

            if (Array.isArray(value)) {
                tags = value;
            } else if (typeof value === 'string') {
                try {
                    tags = JSON.parse(value.replace(/'/g, '"') || "[]");
                } catch {
                    tags = [];
                }
            }

            if (tags.length > 0) {
                return (
                    <div style={{ display: "flex", gap: "4px" }}>
                        {tags.map((tag, idx) => (
                            <span key={`${tag}-${idx}`} style={tagStyle}>
                                {tag}
                            </span>
                        ))}
                    </div>
                );
            }
        }

        if (Array.isArray(value)) {
            return value.length > 0 ? JSON.stringify(value) : "-";
        }

        if (typeof value === "object" && value !== null) {
            return JSON.stringify(value);
        }

        return value || "-";
    };

 const groupedColumns = React.useMemo(() => {
        const groupMap = new Map();
        
        processedHeaders.forEach((col) => {
            if (!groupMap.has(col.groupName)) {
                groupMap.set(col.groupName, []);
            }
            groupMap.get(col.groupName).push(col);
        });

        return groupMap;
    }, [processedHeaders]);

    if (loading) return <Loader />;
    if (error) return <div>{error.message || error}</div>;

    // Build grouped columns maintaining sorted order
   console.log("heght", chipsHeight)

    return (
        <div className={styles.mainContainer} style={containerStyle}>
            <div
                // className={styles.tableWrapper}
                // style={{
                //     overflowY: "auto",
                //     overflowX: "auto",
                    
                //     ...tableWrapperStyle,  
                // }}
                className={
    tabulerDynamic ? 
    styles.tableWrapperDynamic
      : styles.tableWrapper
  }
  style={
    tabulerDynamic? 
    { 
          maxHeight: `calc(75vh - ${chipsHeight}px)`, 
          overflowY: 'auto', 
          overflowX: 'auto' 
        }
      : { 
          overflowY: "auto",
               overflowX: "auto",
                    
                ...tableWrapperStyle,  
        }
  }
            >
                {data && data.length > 0 ? (
                    <Table hover className={styles.table}>
                        <thead>
                            {/* First Header Row - Group Names */}
                            {useColumnMapping && showGroupHeaders && (
                                <tr>
                                    {Array.from(groupedColumns.entries()).map(([group, cols], index) => {
                                        if (cols.length === 0) return null;
                                        
                                        return (
                                            <th
                                                key={`group-${group}`}
                                                colSpan={cols.length}
                                                className={style.fixedTh}
                                                style={{
                                                    textAlign: "center",
                                                    fontWeight: "normal",
                                                    fontSize: "12px",
                                                    borderRadius:'0px',
                                                    color:'#0073cf'
                                                    // position: "relative"
                                                }}
                                                ref={(el) => {
                                                    if (el) {
                                                        el.style.setProperty('background-color', '#101D2B', 'important');
                                                        el.style.setProperty('color', '#fff', 'important');
                                                    }
                                                }}
                                            >
                                                {group}
                                                {index !== groupedColumns.size - 1 && (
                                                    <hr
                                                        style={{
                                                            position: "absolute",
                                                            top: "0",
                                                            right: "0",
                                                            height: "100%",
                                                            width: "2px",
                                                            backgroundColor: "#0073cf",
                                                            border: "none",
                                                            margin: 0,
                                                            opacity:0.4
                                                        }}
                                                    />
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            )}

                            {/* Second Header Row - Column Display Names */}
                            <tr>
                                {processedHeaders.map((col, index) => (
                                    <th key={col.key} 
                              className={`${style.fixedTh} ${index === 0 ? styles.onlyBorder : styles.tableSharp}`}
                                    >
                                        <div
                                            style={{
                                                color: "white",
                                                borderRadius: "5px",
                                                display: "flex",
                                                justifyContent: "center",
                                                fontWeight: "400",
                                                fontSize: "12px"
                                            }}
                                        >
                                            {col.displayName}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((item, rowIndex) => (
                                <tr key={item.id || `row-${rowIndex}`}
                                    onDoubleClick={() => onDoubleClick(item)}
                                    style={{ cursor: 'pointer' }}>
                                    {processedHeaders.map((col) => (
                                        <td
                                            key={col.key}
                                            className={style.fixedTd}
                                            style={useColumnMapping ? {
                                                backgroundColor: getGroupColor(col.groupName)
                                            } : {}}
                                        >
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
                                                    msOverflowStyle: "none"
                                                }}
                                                title={typeof item[col.key] === 'object' ? JSON.stringify(item[col.key]) : item[col.key]}
                                            >
                                                {renderCellContent(item, col.key)}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <p className="text-center" style={{ margin: "20px 0px" }}>
                        {noDataMessage}
                    </p>
                )}
            </div>

            {/* Pagination */}
            {data && data.length > 0 && (
            <div
                className={style.paginationContainer}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "0 16px",
                    backgroundColor: "#101D2B"
                }}
            >
                <div style={{ flex: 1, display: "flex", justifyContent: "center", backgroundColor: "#101D2B", marginLeft: "140px", height: "35px" }}>
                    {totalPages > 0 && (
                        <Pagination>
                            <Pagination.First
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1 || loading}
                            />
                            <Pagination.Prev
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                            >
                                Previous
                            </Pagination.Prev>

                            {createPaginationItems()}

                            <Pagination.Next
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                            >
                                Next
                            </Pagination.Next>
                            <Pagination.Last
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages || loading}
                            />
                        </Pagination>
                    )}
                </div>

                <div style={{ fontSize: "12px", color: "#ccc" }}>
                    (Total Results - {totalResults})
                </div>
            </div>
            )}
        </div>
    );
};

CommonTableComponent.propTypes = {
    data: PropTypes.array,
    onRowClick: PropTypes.func,
    headers: PropTypes.array,
    loading: PropTypes.bool,
    error: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            message: PropTypes.string
        })
    ]),
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    totalResults: PropTypes.number,
    chipsHeight: PropTypes.number,
    handlePageChange: PropTypes.func,
    columnMapping: PropTypes.arrayOf(
        PropTypes.shape({
            column_name: PropTypes.string,
            display_name: PropTypes.string,
            group_name: PropTypes.string,
            is_visible: PropTypes.bool
        })
    ),
    useColumnMapping: PropTypes.bool,
    groupColors: PropTypes.object,
    getGroupColor: PropTypes.func,
    showGroupHeaders: PropTypes.bool,
    noDataMessage: PropTypes.string,
    containerStyle: PropTypes.object,
    tableWrapperStyle: PropTypes.object,
    specialColumns: PropTypes.arrayOf(PropTypes.string),
    tagStyle: PropTypes.object
};

export default CommonTableComponent;
