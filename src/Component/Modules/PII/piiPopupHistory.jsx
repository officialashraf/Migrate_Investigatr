import React from 'react';
import Select from 'react-select';
import { Typography } from '@mui/material';

const PIIHistoryPopup = ({ 
  showPopup, 
  onClose, 
  historyList, 
  historyLoading, 
  handleSearchFromHistory,
  fetchReportFile,
  formatTime,
  Loader,
  tableStyless 
}) => {
  
  if (!showPopup) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-icon" onClick={onClose}>
          &times;
        </button>
        {/* <div className="popup-content"> */}
          <Typography variant="h6" sx={{ color: '#0073CF', marginBottom: '8px', fontSize: '16px' }}>
          IDINT History
          </Typography>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Loader size={20} />
            </div>
          ) : historyList.length > 0 ? (
            <>
              <div style={{ overflowY: 'auto', height: '400px' }}>
                <table className={tableStyless.table} style={{ width: "100%", tableLayout: "fixed" }}>
                  <thead style={{ position: "sticky", top: 0, backgroundColor: "#101D2B" }}>
                    <tr>
                      <th className={tableStyless.th} style={{ width: "35%" }}>
                        <div className={tableStyless.thContent}><span>IDINT Resource</span></div>
                      </th>
                      <th className={tableStyless.th} style={{ width: "20%" }}>
                        <div className={tableStyless.thContent}><span>Status</span></div>
                      </th>
                      <th className={tableStyless.th} style={{ width: "25%" }}>
                        <div className={tableStyless.thContent}><span>Search Time</span></div>
                      </th>
                      <th className={tableStyless.th} style={{ width: "20%" }}>
                        <div className={tableStyless.thContent}><span>Print Record</span></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyList.map((item, index) => (
                      <tr
                        key={index}
                         style={{
                            borderBottom: "1px solid #2a3f5f",
                            transition: "background-color 0.2s",
                            "--bs-table-hover-bg": "rgba(28, 46, 66, 0.5)",
                          }}
                        // onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(28, 46, 66, 0.5)"}
                        // onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td
                     style={{
                              padding: "10px 8px",
                              fontSize: "12px",
                              color: "#ccc",
                              textAlign: "left",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              wordBreak: "break-word",
                              cursor: "pointer",
                            }}
                          onClick={() => handleSearchFromHistory(item.query)}
                        >
                          {item.query || "-"}
                        </td>

                        <td 
                          style={{ padding: "10px 8px", fontSize: "12px", color: "#ccc", textAlign: "left", cursor: "pointer" }}
                          onClick={() => handleSearchFromHistory(item.query)}
                        >
                          {item.status || "-"}
                        </td>

                        <td 
                          style={{ padding: "10px 8px", fontSize: "12px", color: "#ccc", textAlign: "left", cursor: "pointer" }}
                          onClick={() => handleSearchFromHistory(item.query)}
                        >
                          {formatTime(item.searched_on)}
                        </td>

                        <td style={{ padding: "10px 8px", textAlign: "left" }}>
                          <Select
                            options={[
                              { value: "pdf", label: "PDF(.pdf)" },
                              { value: "word", label: "Word(.docx)" },
                            ]}
                            placeholder="Print Record"
                            isSearchable={false}
                            value={null}
                            onChange={(selected) => {
                              if (!selected) return;
                              fetchReportFile(item, selected.value);
                            }}
                            styles={{
                              container: (provided) => ({
                                ...provided,
                                width: "120px",
                                display: "inline-block",
                              }),
                              control: (provided) => ({
                                ...provided,
                                minHeight: "24px",
                                height: "24px",
                                backgroundColor: "#0073CF",
                                border: "1px solid #0073cf",
                                borderRadius: "8px",
                                cursor: "pointer",
                                color: "#fff",
                                fontSize: "12px",
                                padding: "0",
                              }),
                              valueContainer: (provided) => ({
                                ...provided,
                                padding: "0 0 0 5px",
                                display: "flex",
                                alignItems: "center",
                              }),
                              menu: (provided) => ({
                                ...provided,
                                backgroundColor: "#0e1825",
                                borderRadius: "10px",
                                color: "#fff",
                                zIndex: 9999,
                                border: '1px solid #0073CF'
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isFocused ? "#101D2B" : "#0e1825",
                                color: "#fff",
                                cursor: "pointer",
                                borderRadius: "10px",
                              }),
                              singleValue: (provided) => ({
                                ...provided,
                                color: "#fff",
                              }),
                              placeholder: (provided) => ({
                                ...provided,
                                color: "#d9d9d9",
                                fontSize: "12px",
                              }),
                              dropdownIndicator: (provided) => ({
                                ...provided,
                                color: "#fff",
                                padding: "0 6px",
                              }),
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ 
                padding: "10px 0px", 
                textAlign: "right", 
                color: "#ccc", 
                fontSize: "12px", 
                borderTop: "1px solid #2a3f5f" 
              }}>
                Total PII Entries: {historyList.length}
              </div>
            </>
          ) : (
            <Typography variant="body2" sx={{ color: '#ccc', textAlign: 'center', padding: '40px' }}>
              No PII resources saved yet.
            </Typography>
          )}
        {/* </div> */}
      </div>

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .popup-container {
          background: linear-gradient(135deg, #0e1825 0%, #1a2332 100%);
          border-radius: 16px;
          padding: 24px;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid #2a3f5f;
        }

        .close-icon {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 32px;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border-radius: 8px;
        }

        .close-icon:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }

        .popup-content {
          color: #fff;
        }

        /* Scrollbar styling */
        .popup-content div::-webkit-scrollbar {
          width: 8px;
        }

        .popup-content div::-webkit-scrollbar-track {
          background: #0e1825;
          border-radius: 4px;
        }

        .popup-content div::-webkit-scrollbar-thumb {
          background: #0073CF;
          border-radius: 4px;
        }

        .popup-content div::-webkit-scrollbar-thumb:hover {
          background: #005ba3;
        }
      `}</style>
    </div>
  );
};

export default PIIHistoryPopup;