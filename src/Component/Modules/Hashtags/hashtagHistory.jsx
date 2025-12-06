import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import axios from "axios"; 
import Cookies from 'js-cookie';
import { hashtagSearchSuccess, hashtagSearchRequest, hashtagSearchFail } from "../../../Redux/Action/hashtagAction";
import { useDispatch } from "react-redux";

const HashtagHistory = ({ showPopup, onClose, formatTime, Loader, tableStyless }) => {
  const [selectedDates, setSelectedDates] = useState();

  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const token = Cookies.get("accessToken");
  const dispatch = useDispatch();
 
  // History List Fetching
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/hashtag-history`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        const sortedData = response.data.sort((a, b) => b.id - a.id);
        setHistoryList(sortedData);
      } catch (error) {
        console.error('Error fetching hashtag history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };
    if (showPopup) {
      fetchHistory();
    }
  }, [showPopup]);
const formatTimeObject = (isoString) => {
  const date = new Date(isoString);
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };
};

const extractSelectedDates = (start_time, end_time) => ({
  startDate: start_time,           // SAME FORMAT (no convert)
  endDate: end_time,               // SAME FORMAT
  startTime: formatTimeObject(start_time),
  endTime: formatTimeObject(end_time)
});

  const fetchDetailsAndClose = async (id) => {
    dispatch(hashtagSearchRequest());

    try {
      // Detail API call
      const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/hashtag-history/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log(`Successfully fetched details for ID ${id}:`, response.data);
      dispatch(hashtagSearchSuccess(response.data));
    const { hashtag, platform, start_time, end_time } = response.data;

    // Build selectedDates EXACT SAME AS UI FORMAT
    const selectedDates = extractSelectedDates(start_time, end_time);

    // Save to localStorage in required format
    localStorage.setItem(
      "hashtagSearchState",
      JSON.stringify({
        hashtag,
        platform,
        selectedDates
      })
    );
 window.dispatchEvent(new Event("hashtag-storage-update"));
    // Set React state if needed
    setSelectedDates(selectedDates);
      onClose();

    } catch (error) {
      console.error(`Error fetching details for ID ${id}:`, error);
      dispatch(hashtagSearchFail(error.response?.data || error.message));
      onClose();
    }
  };


  const handleRowClick = (item) => {
    fetchDetailsAndClose(item.id);
  };
   if (!showPopup) return null;

  const cellStyle = {
    padding: "10px 8px",
    fontSize: "12px",
    color: "#ccc",
    textAlign: "left",
    wordBreak: "break-word",
    verticalAlign: "middle"
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-icon" style={{ top: 0}} onClick={onClose}>
          &times;
        </button>

        <Typography
          variant="h6"
          sx={{ color: "#0073CF", marginBottom: "8px", fontSize: "16px" }}
        >
          Hashtag History
        </Typography>

        {historyLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader size={20} />
          </div>
        ) : historyList.length > 0 ? (
          <>
            <div style={{ overflowY: "auto", height: "400px" }}>
              <table
                className={tableStyless.table}
                style={{ width: "100%", tableLayout: "fixed" }}
              >
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#101D2B" }}>
                  <tr>
                    <th className={tableStyless.th} style={{ width: "30%" }}>
                      Hashtag
                    </th>
                    <th className={tableStyless.th} style={{ width: "30%" }}>
                      Platform
                    </th>

                    <th className={tableStyless.th} style={{ width: "30%" }}>
                      Status
                    </th>
                    <th className={tableStyless.th} style={{ width: "30%" }}>
                      Record count
                    </th>
                    <th className={tableStyless.th} style={{ width: "40%" }}>
                     Search Start Time
                    </th>
                    <th className={tableStyless.th} style={{ width: "40%" }}>
                    Search End Time
                    </th>
                  </tr> 
                </thead>

                <tbody>
                  {historyList.map((item) => (
                    <tr
                      key={item.id} // Use item.id as key for better performance
                      onClick={() => handleRowClick(item)}
                      style={{
                        borderBottom: "1px solid #2a3f5f",
                        transition: "background-color 0.2s",
                        "--bs-table-hover-bg": "rgba(28, 46, 66, 0.5)",
                        cursor: "pointer",
                      }}
                    >
                      <td style={cellStyle}>{item.hashtag || "-"}</td>
                      <td style={cellStyle}>{item.platform || "-"}</td>
                      <td style={cellStyle}>{item.status || "-"}</td>
                      <td style={cellStyle}>{item.record_count || "-"}</td>
                      <td >
                        {formatTime ? formatTime(item.start_time) : item.searched_on}
                      </td>
                      <td >
                        {formatTime ? formatTime(item.end_time) : item.searched_on}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: "10px 0",
                textAlign: "right",
                color: "#ccc",
                fontSize: "12px",
                borderTop: "1px solid #2a3f5f",
              }}
            >
              Total Hashtag Entries: {historyList.length}
            </div>
            {/* ✅ Removed the selectedItem (details) display section */}
          </>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: "#ccc", textAlign: "center", padding: "40px" }}
          >
            No Hashtag resources saved yet.
          </Typography>
        )}
      </div>

      {/* Styles remained the same */}
      <style jsx>{`
        .popup-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .popup-container {
          background: linear-gradient(135deg, #0e1825, #1a2332);
          border-radius: 16px;
          padding: 24px;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          position: relative;
          border: 1px solid #2a3f5f;
        }

        .close-icon {
          position: absolute;
          top: 14px;
          right: 16px;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default HashtagHistory;