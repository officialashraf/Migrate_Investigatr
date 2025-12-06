import styles from './addResource.module.css';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { useState, useRef } from 'react';
import AppButton from '../../Common/Buttton/button';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setCaseData } from '../../../Redux/Action/caseAction';
import { addUpload, updateUploadProgress, removeUpload, popupClosed, ADD_UPLOAD } from '../../../Redux/Action/uploadActions'; 
import { v4 as uuidv4 } from 'uuid';


const FileUpload = ({ togglePopup, selectDataType }) => {
    console.log("selectDataType_FileUpload", selectDataType)
    const dispatch = useDispatch();
    const caseData = useSelector((state) => state.caseData.caseData);
    const Token = Cookies.get('accessToken');
    const fileInputRef = useRef(null);
    const [uploadedFile, setUploadedFile] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragAndDrop, setDragAndDrop] = useState(false);

    const MAX_SINGLE_FILE_MB = 500;
    const MAX_SINGLE_FILE_BYTES = MAX_SINGLE_FILE_MB * 1024 * 1024;

    const MAX_TOTAL_MB = 1024; // 1 GB
    const MAX_TOTAL_BYTES = MAX_TOTAL_MB * 1024 * 1024;

    const validateAndSetFile = (files) => {
        const validFiles = Array.from(files).filter(file =>
            file.name.toLowerCase().endsWith('.csv')
        );

        if (validFiles.length !== files.length) {
            toast.error("Some files were invalid. Only .csv files are allowed.");
        }

        if (validFiles.length > 0) {
            // 🔹 Check each file individually
            for (let file of validFiles) {
                if (file.size > MAX_SINGLE_FILE_BYTES) {
                    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
                    toast.error(`"${file.name}" is ${fileSizeMB}MB, exceeds 500MB limit per file.`);
                    setUploadedFile([]);
                    return;
                }
            }

            // 🔹 Check total size (only if multiple files)
            const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);

            if (validFiles.length > 1 && totalSize > MAX_TOTAL_BYTES) {
                const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
                toast.error(`Total file size (${totalSizeMB}MB) exceeds 1GB limit for multiple uploads.`);
                setUploadedFile([]);
                return;
            }

            // ✅ Passed all checks
            setUploadedFile(validFiles);
        } else {
            setUploadedFile([]);
        }
    };


    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragAndDrop(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragAndDrop(false);
    };

   
    const handleDrop = (e) => {
        e.preventDefault();
        setDragAndDrop(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files);
        }
    };
    const handleTogglePopup = () => {
        if (uploading && progress < 100) {
            dispatch(popupClosed());
        }
        togglePopup(); 
    };

    const handleUpload = async () => {
        if (uploadedFile.length === 0) {
            toast.info("Please select at least one file!");
            return;
        }

        const uploadId = uuidv4(); 
        const fileCount = uploadedFile.length;
        const combinedName = fileCount > 1 ? `${uploadedFile[0].name} + ${fileCount - 1} more` : uploadedFile[0].name;


        const formData = new FormData();
        uploadedFile?.forEach(file => formData.append("files", file));
        formData.append("type", selectDataType);
        formData.append("case_id", caseData.id);

       
        setUploading(true);
        setProgress(0);

        dispatch(addUpload({
            id: uploadId,
            fileName: combinedName,
            totalFiles: fileCount,
            progress: 0,
            isPopupOpen: true,
        }));

        try {
            const response = await axios.post(
                `${window.runtimeConfig.VITE_APP_API_RESOURCE}/api/case-man/v1/upload`,
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${Token}`, 
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const percent = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
                        setProgress(percent);
                        dispatch(updateUploadProgress(percent));
                    },
                }
            );

            toast.success("Files uploaded successfully!");
            dispatch(removeUpload());

            const responseCase = await axios.put(
                `${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case/${caseData.id}`,
                { status: "in progress" },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${Token}`,
                    },
                }
            );

            // dispatch(setCaseData(responseCase.data.data));
            togglePopup(); 

        } catch (error) {

            console.error("Upload Error:", error);
            toast.error(error?.response?.data?.detail || "File upload/status update failed. Please try again.");

            togglePopup();
            dispatch(removeUpload());
        } finally {
            setUploading(false); 
        }
    };



    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContainerCdr}>
                <div className={styles.popupHeaderCdr}>
                    <h3>Upload File</h3>
                    <button className={styles.closeIconCdr} onClick={handleTogglePopup}>
                        &times;
                    </button>
                </div>

                <div className={styles.popupBodyCdr}>
                    <button
                        className={styles.uploadContent}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            cursor: 'pointer',
                            width: '100%',
                            borderRadius: '10px',
                            marginTop: "12px",
                            border: "none",
                            padding: '20px',
                            textAlign: 'center',
                            backgroundColor: "#0f1924",
                        }}
                        onClick={handleChooseFile}
                    >
                        <div className={styles.uploadIcon}>
                            <DriveFolderUploadIcon fontSize="inherit" />
                        </div>
                        <p style={{ color: "white", marginBottom: '0px' }}>{dragAndDrop ? "Drop file here..." : "Drag and drop file to upload"}</p>
                        <span className={styles.orText}>or</span>

                       
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => validateAndSetFile(e.target.files)}
                            accept=".csv"
                            multiple
                        />
                       
                        {uploadedFile?.length > 0 && (
                            <div className={styles.fileList} style={{     overflow: "auto",
    maxHeight: "80px", scrollbarWidth: "thin",
    marginBottom: "10px"}}>
                                {uploadedFile.map((file, index) => (
                                    <p key={index} className={styles.fileName}>Selected File: {file.name}</p>
                                ))}
                            </div>
                        )}

                        <AppButton>Choose File</AppButton>
                        {
                            uploadedFile?.length === 1 ? (
                                <p className={styles.maxSizeNote}>Maximum upload size: 500MB</p>
                            ) : uploadedFile?.length > 1 ? (
                                <p className={styles.maxSizeNote}>Maximum upload size: 1GB</p>
                            ) : (
                                <p className={styles.maxSizeNote}>Maximum upload size: 500MB</p>
                            )
                        }
                    </button>

                    {uploading && (
                        <div style={{ marginTop: "15px", width: "100%" }}>
                            <div style={{
                                height: "8px",
                                background: "#ddd",
                                borderRadius: "5px",
                                overflow: "hidden"
                            }}>
                                <div style={{
                                    height: "100%",
                                    width: `${progress}%`,
                                    background: "#4caf50",
                                    transition: "width 0.3s ease"
                                }}></div>
                            </div>
                            <p style={{ marginTop: "5px", fontSize: "14px", textAlign: "center" }}>
                                {progress}% uploaded
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.popupFooterCdr}>
                    <AppButton onClick={handleTogglePopup}>Cancel</AppButton>
                    <AppButton onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

FileUpload.propTypes = {
    togglePopup: PropTypes.func.isRequired,
};

export default FileUpload;
