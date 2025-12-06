import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUpload } from '../../../Redux/Action/uploadActions';

const GlobalUploadTracker = () => {
    const currentUpload = useSelector((state) => state.upload.currentUpload);
    const dispatch = useDispatch();

    if (!currentUpload) {
        return null;
    }

    if (currentUpload.isPopupOpen) {
        return null;
    }

    // if (currentUpload.isPopupOpen && currentUpload.progress < 100) {
    //     return null;
    // }

    const handleCloseTracker = () => {
        dispatch(removeUpload());
    };

    const isComplete = currentUpload.progress >= 100;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999, // Hamesha sabse upar dikhe
            maxWidth: '300px',
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            background: '#1e2832', // Darker background
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            color: 'white',
        }}>
            <div key={currentUpload.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                        {currentUpload.fileName}
                        {currentUpload.totalFiles > 1 && ` (${currentUpload.totalFiles} files)`}
                    </p>

                    {/* Close Button */}
                    <button
                        onClick={handleCloseTracker} 
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white', 
                            cursor: 'pointer',
                            fontSize: '20px',
                            lineHeight: '1'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ marginTop: "5px", height: "8px", background: "#3d4b58", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{
                        height: "100%",
                        width: `${currentUpload.progress}%`,
                        background: isComplete ? "#4caf50" : "#2196f3",
                        transition: "width 0.3s ease"
                    }}></div>
                </div>

                <p style={{ marginTop: "5px", fontSize: "12px", textAlign: "right" }}>
                    {currentUpload.progress}% {isComplete ? 'Complete' : 'Uploading...'}
                </p>
            </div>

        </div>
    );
};

export default GlobalUploadTracker;