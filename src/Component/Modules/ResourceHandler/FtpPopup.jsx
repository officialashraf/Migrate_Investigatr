import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import styles from './addResource.module.css';
import AppButton from '../../Common/Buttton/button';
import PropTypes from 'prop-types';
import axios from 'axios';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EpochToIST from '../../../utils/epocTimeConverter';
import { useDispatch, useSelector } from 'react-redux';
import { setCaseData } from '../../../Redux/Action/caseAction';
import { toast } from 'react-toastify';
import SaveIcon from '@mui/icons-material/Save';


const FtpPopup = ({ togglePopup }) => {
  const token = Cookies.get("accessToken");
  const dispatch = useDispatch();
  const caseId = useSelector((state) => state.caseData.caseData.id);
  const [ftpList, setFtpList] = useState([]);
  const [selectedFtp, setSelectedFtp] = useState(null);
  const [ftpEntries, setFtpEntries] = useState([]);
  const [currentPath, setCurrentPath] = useState("/");
  const [pathHistory, setPathHistory] = useState(["/"]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch FTP connections from API
  useEffect(() => {
    const fetchFtpConnections = async () => {
      try {
        const response = await axios.get(
          `${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/connection`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        setFtpList(response.data || []);
      } catch (error) {
        console.error("Error fetching FTP connections:", error);
      }
    };

    fetchFtpConnections();
  }, [token]);

  // Fetch FTP entries for a given path
  const fetchFtpEntries = async (connectionId, path) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/ftp/list`,
        { id: connectionId, path: path },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      setFtpEntries(response.data.entries || []);
           setCurrentPath(response.data.path);
            console.log("ftp",currentPath)
    } catch (error) {
      console.error("Error fetching FTP entries:", error);
      setFtpEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle radio selection + fetch root entries
  const handleSelect = async (ftp) => {
    setSelectedFtp(ftp);
    setCurrentPath("/");
    setPathHistory(["/"]);
    setSelectedFiles([]);
    await fetchFtpEntries(ftp.id, "/");
  };

  // Handle directory click - navigate into directory
  const handleDirectoryClick = async (entry) => {
    if (entry.type === "dir" && selectedFtp) {
      const newPath = entry.path;
      setPathHistory([...pathHistory, newPath]);
      await fetchFtpEntries(selectedFtp.id, newPath);
    }
  };

  // // Handle back navigation
  const handleBackClick = async () => {
    if (pathHistory.length > 1 && selectedFtp) {
      const newHistory = pathHistory.slice(0, -1);
      const previousPath = newHistory[newHistory.length - 1];
      setPathHistory(newHistory);
      await fetchFtpEntries(selectedFtp.id, previousPath);
    }
  };

  // Handle file selection for download
  // const handleFileSelect = (entry) => {
  //   if (entry.type) {
  //     setSelectedFiles(entry.path); // ek hi file ka path store hoga
  //   }
  // };

const handleFileSelect = (entry) => {
  if (!entry.type) return;

  setSelectedFiles((prevFiles) => {
    if (prevFiles.includes(entry.path)) {
      // Uncheck: remove path
      return prevFiles.filter((path) => path !== entry.path);
    } else {
      // Check: add path
      return [...prevFiles, entry.path];
    }
  });
};



  // Handle adding selected files
  const handleAddFiles = async () => {
  if (selectedFiles.length === 0) {
    alert("Please select at least one file");
    return;
  }

  try {
    setLoading(true);

    //  Step 1: Add files
    const response = await axios.post(
      `${window.runtimeConfig.VITE_APP_API_IPDR}/api/ipdr-man/v1/file`,
      {
        connection_id: selectedFtp.id,
        path: selectedFiles,
        case_id: [String(caseId)], // Assuming caseId is passed as prop
        type: "IPDR",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    console.log("Files added successfully:", response.data);
    toast.success("File uploaded successfully!");

    //  Step 2: Update case status to "in progress"
    const responseCase = await axios.put(
      `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case/${caseId}`,
      { status: "in progress" },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    dispatch(setCaseData(responseCase.data.data));
    console.log("Case updated:", responseCase.data);

    togglePopup();

  } catch (error) {
    console.warn("Error adding files:", error);
    toast.error(error.response?.data?.detail);
  } finally {
    setLoading(false);
  }
};


  // Get file/folder icon based on type
  const getIcon = (entry) => {
    if (entry.type === "dir") return "📁";
    return "📄";
  };

  // // Format file size
  // const formatSize = (size) => {
  //   if (!size || size === "0") return "";
  //   const bytes = parseInt(size);
  //   if (bytes < 1024) return `${bytes} B`;
  //   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  //   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  // };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainerCdr}>
        <div className={styles.popupHeaderCdr}>
          <h5>Available FTPs</h5>
          <button className={styles.closeIconCdr} onClick={togglePopup}>
            &times;
          </button>
        </div>

        <div className={styles.popupBodyCdr}>
          {/* FTP Connection List */}
          <div style={{ height: '200px', overflowY: "auto" }}>
            {ftpList.length > 0 ? (
              ftpList.map((ftp) => (
                <div key={ftp.id} className={styles.ftpCard}>
                  <div className={styles.ftpLeft}>
                    <span className={styles.ftpName}>{ftp.connection_info?.host}</span>

                  </div>
                  <div className={styles.ftpRight}>
                    <span className={styles.lastConnected}>Last connected: {ftp.created_on}</span>
                    <input
                      type="radio"
                      name="ftpSelect"
                      className={styles.radioBtn}
                      onChange={() => handleSelect(ftp)}
                      checked={selectedFtp?.id === ftp.id}
                    />
                  </div>
                </div>

              ))

            ) : (
              <p>No FTP connections available.</p>
            )
            }
          </div>
          {/* File/Directory Browser */}
          {selectedFtp && (
            <div className={styles.ftpBrowser}style={{ height: '120px', overflow: "auto" }}>
              <div className={styles.browserHeader}>
                <span>Title</span>
                <div className={styles.pathNavigation}>
                  
                  <span >Date and Time Modified</span>
                 
                </div>
                
              </div>

              {loading ? (
                <div className={styles.loading}>Loading...</div>
              ) : (
                <div className={styles.entriesList}>

                   <p   className={styles.entryName}style={{marginBottom:"0px"}}><SaveIcon style={{color:"white"}}/>{currentPath}</p>
                   
                 {ftpEntries.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`${styles.entryItem} ${entry.type === "dir" ? styles.directory : styles.file
                        }`}
                    >
                      {entry.type !== "dir" && (
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(entry.path)}
                          onChange={() => handleFileSelect(entry)}
                          className={styles.fileCheckbox}
                        />
                      )}

                      <span
                        className={styles.entryIcon}
                        onClick={() => entry.type === "dir" && handleDirectoryClick(entry)}
                        style={{ cursor: entry.type === "dir" ? "pointer" : "default" }}
                      >
                        {getIcon(entry)}
                      </span>

                      <span
                        className={styles.entryName}
                        onClick={() => entry.type === "dir" && handleDirectoryClick(entry)}
                        style={{ cursor: entry.type === "dir" ? "pointer" : "default" }}
                      >{entry.name}
                        {entry.type === "dir" && <ArrowDropDownIcon style={{ color: "white" }} />}
                      </span>

                      {/* <span className={styles.entrySize}>
                        {formatSize(entry.size)}
                      </span> */}
 
                      <span className={styles.entryType}>
                        <EpochToIST epoch={entry.modified} />
                      </span>
                    </div>
                  ))}

                  {ftpEntries.length === 0 && !loading && (
                    <div className={styles.emptyFolder}>No items in this folder</div>
                  )}
                </div>
              )}

              {/* {selectedFiles.length > 0 && (
                <div className={styles.selectedInfo}>
                  <strong>{selectedFiles.length} file(s) selected</strong>
                </div>
              )} */}
            </div>
          )}
           {pathHistory.length > 1 && (
                    <span
                      className={styles.backButton} 
                      onClick={handleBackClick}
                      disabled={loading}
                    >
                      ← Back
                    </span>
                    
                  )}
        </div>

        <div className={styles.popupFooterCdr}>
          <AppButton onClick={togglePopup} disabled={loading}>
            × Cancel
          </AppButton>
          <AppButton
            data-primary="true"
            disabled={!selectedFtp || selectedFiles.length === 0 || loading}
            onClick={handleAddFiles}
          >
            {loading ? "Adding..." : `+ Add `}
          </AppButton>
        </div>
      </div>
    </div>
  );
};

FtpPopup.propTypes = {
  togglePopup: PropTypes.func.isRequired,
};

export default FtpPopup;